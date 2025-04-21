#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 输出环境信息以便调试
console.log(`Node.js version: ${process.version}`);
console.log(`Operating system: ${os.platform()} ${os.release()}`);
console.log(`GITHUB_SHA: ${process.env.GITHUB_SHA || 'not set'}`);
console.log(`GITHUB_TOKEN length: ${process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.length : 0}`);

// 配置 Git
execSync('git config --global user.name github-ci');
execSync('git config --global user.email github-ci@example.com');

// 临时目录
const monorepoSplitDir = path.join(os.tmpdir(), 'monorepo_split');
const cloneDirectory = path.join(monorepoSplitDir, 'clone_directory');
const buildDirectory = path.join(monorepoSplitDir, 'build_directory');
const accessToken = process.env.GITHUB_TOKEN;
const baseDir = process.cwd();

// 输出目录信息
console.log(`Base directory: ${baseDir}`);
console.log(`Temp directory: ${monorepoSplitDir}`);
console.log(`Clone directory: ${cloneDirectory}`);
console.log(`Build directory: ${buildDirectory}`);

// 确保临时目录存在
console.log('Creating temporary directories...');
fs.mkdirSync(monorepoSplitDir, { recursive: true });
fs.mkdirSync(cloneDirectory, { recursive: true });
fs.mkdirSync(buildDirectory, { recursive: true });

console.log(`Current directory: ${baseDir}`);

// 定义要拆分的包和对应的目标仓库
const config = [
  ['packages/demo-expo-app', 'tourze/demo-expo-app', 'master'],
  ['packages/demo-tauri-app', 'tourze/demo-tauri-app', 'master'],
  ['packages/demo-react-vite', 'tourze/demo-react-vite', 'master'],
  ['packages/demo-taro-react', 'tourze/demo-taro-react', 'master'],
];

// 获取最近提交修改的文件
const changedFilesString = process.env.ALL_CHANGED_FILES || '';
console.log('ALL_CHANGED_FILES env variable:', changedFilesString);
const changedFiles = changedFilesString.split(' ').filter(Boolean);
console.log('Changed files:', changedFiles);

// 确定哪些包被修改了
const modifiedPackages = {};
for (const file of changedFiles) {
  for (const [index, [packageDir]] of config.entries()) {
    if (file.startsWith(packageDir) && !modifiedPackages[index]) {
      modifiedPackages[index] = true;
      console.log(`Package modified: ${packageDir}`);
    }
  }
}

const modifiedPackageCount = Object.keys(modifiedPackages).length;
console.log(`Processing ${modifiedPackageCount} modified packages`);

if (modifiedPackageCount === 0) {
  console.log('No packages were modified. Exiting.');
  process.exit(0);
}

// 检查是否有 GitHub 令牌
if (!accessToken) {
  console.error('GITHUB_TOKEN 环境变量未设置或为空，请确保提供有效的访问令牌。');
  process.exit(1);
}

// 处理每个修改的包
for (const [index, [localDirectory, remoteDirectory, branch = 'main']] of config.entries()) {
  // 只处理被修改的包
  if (!modifiedPackages[index]) {
    continue;
  }

  console.log(`\n----- 处理包 ${localDirectory} -> ${remoteDirectory} (分支: ${branch}) -----\n`);

  // 清理临时目录
  try {
    console.log('清理临时目录...');
    if (fs.existsSync(cloneDirectory)) {
      execSync(`rm -rf ${cloneDirectory}/*`, { stdio: 'inherit' });
    }
    if (fs.existsSync(buildDirectory)) {
      execSync(`rm -rf ${buildDirectory}/*`, { stdio: 'inherit' });
    }
  } catch (error) {
    console.log('清理目录时出错，但继续执行:', error.message);
  }

  const hostRepositoryOrganizationName = `github.com/${remoteDirectory}`;

  // 克隆目标仓库
  const tokenUrl = `https://${accessToken}@${hostRepositoryOrganizationName}`;
  console.log(`Cloning "${hostRepositoryOrganizationName}" repository to "${cloneDirectory}" directory`);

  let isNewRepository = false;
  try {
    fs.rmSync(cloneDirectory, { recursive: true, force: true });
    fs.mkdirSync(cloneDirectory, { recursive: true });
    execSync(`git clone -- ${tokenUrl} ${cloneDirectory}`, { stdio: 'inherit' });
  } catch (error) {
    console.log(`Repository does not exist yet, creating it: ${remoteDirectory}`);
    isNewRepository = true;

    // 如果仓库不存在，可能需要先创建它
    try {
      // 创建一个空的git仓库在克隆目录
      fs.rmSync(cloneDirectory, { recursive: true, force: true });
      fs.mkdirSync(cloneDirectory, { recursive: true });
      process.chdir(cloneDirectory);
      execSync('git init', { stdio: 'inherit' });
      execSync(`git remote add origin ${tokenUrl}`, { stdio: 'inherit' });

      // 创建一个空提交
      execSync('git config --local user.name "github-ci"', { stdio: 'inherit' });
      execSync('git config --local user.email "github-ci@example.com"', { stdio: 'inherit' });
      fs.writeFileSync('README.md', `# ${remoteDirectory.split('/')[1]}\n\nSplit from monorepo.\n`);
      execSync('git add README.md', { stdio: 'inherit' });
      execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
    } catch (initError) {
      console.error('初始化仓库失败:', initError.message);
      // 返回基础目录并继续下一个包
      process.chdir(baseDir);
      continue;
    }
  }

  // 确保我们在克隆目录中
  try {
    process.chdir(cloneDirectory);
    console.log(`Current directory after clone: ${process.cwd()}`);
  } catch (cdError) {
    console.error('无法切换到克隆目录:', cdError.message);
    // 返回基础目录并继续下一个包
    process.chdir(baseDir);
    continue;
  }

  try {
    if (!isNewRepository) {
      execWithOutput('git fetch');
    }

    console.log(`Trying to checkout ${branch} branch`);

    // 检查分支是否存在
    let branchSwitchedSuccessfully = false;
    try {
      execSync(`git checkout ${branch}`, { stdio: 'inherit' });
      branchSwitchedSuccessfully = true;
    } catch (error) {
      branchSwitchedSuccessfully = false;
    }

    // 如果分支不存在，创建它并推送到远程
    if (!branchSwitchedSuccessfully) {
      console.log(`Creating branch "${branch}" as it doesn't exist`);
      execWithOutput(`git checkout -b ${branch}`);
      try {
        execWithOutput(`git push --quiet origin ${branch}`);
      } catch (pushError) {
        if (isNewRepository) {
          // 新仓库的首次推送
          console.log('首次推送分支到新仓库');
          execWithOutput(`git push -u origin ${branch}`);
        } else {
          console.log('推送分支失败，可能是新仓库或无权限，继续执行');
        }
      }
    }
  } catch (error) {
    // 新的仓库，这是正常的
    console.log('Repository might be new, ignoring checkout error');
  }

  // 返回到基础目录
  process.chdir(baseDir);

  console.log('Cleaning destination repository of old files');

  // 创建构建目录
  if (!fs.existsSync(buildDirectory)) {
    fs.mkdirSync(buildDirectory, { recursive: true });
  }

  const gitDir = path.join(buildDirectory, '.git');
  if (!fs.existsSync(gitDir)) {
    fs.mkdirSync(gitDir, { recursive: true });
  }

  // 复制 .git 目录到构建目录
  try {
    execSync(`cp -r ${cloneDirectory}/.git/* ${buildDirectory}/.git/`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to copy .git directory', error);
    continue;
  }

  // 复制本地目录到构建目录
  console.log(`Copying files from "${localDirectory}" to "${buildDirectory}"`);
  try {
    // 确保构建目录存在
    fs.mkdirSync(buildDirectory, { recursive: true });

    // 使用 rsync 排除 .git 目录
    execSync(`rsync -a ${localDirectory}/ ${buildDirectory} --exclude .git`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to copy files', error);
    continue;
  }

  // 切换到构建目录
  try {
    process.chdir(buildDirectory);
    console.log(`Current directory after build: ${process.cwd()}`);
  } catch (cdError) {
    console.error('无法切换到构建目录:', cdError.message);
    // 返回基础目录并继续下一个包
    process.chdir(baseDir);
    continue;
  }

  // 查看状态和添加更改
  execWithOutput('git status');
  execWithOutput('git add .');

  // 获取提交信息
  const commitMessage = createCommitMessage(process.env.GITHUB_SHA || 'latest');

  // 提交更改
  console.log('Committing changes');
  try {
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  } catch (error) {
    console.log('No changes to commit, skipping');
    // 返回基础目录
    process.chdir(baseDir);
    continue;
  }

  // 推送更改
  console.log('Pushing changes');
  try {
    execWithOutput(`git push origin ${branch}`);
  } catch (pushError) {
    console.error('推送更改失败，尝试强制推送:', pushError.message);
    try {
      execWithOutput(`git push -f origin ${branch}`);
    } catch (forcePushError) {
      console.error('强制推送也失败:', forcePushError.message);
    }
  }

  // 返回基础目录
  process.chdir(baseDir);
  console.log(`\n----- 完成处理包 ${localDirectory} -----\n`);
}

console.log('所有任务已完成');

/**
 * 创建提交信息
 */
function createCommitMessage(commitSha) {
  return `Split from monorepo commit ${commitSha}`;
}

/**
 * 带输出的执行命令
 */
function execWithOutput(command) {
  console.log(`> ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.stdout || error.message);
    throw error; // 重新抛出错误以便上层函数处理
  }
}
