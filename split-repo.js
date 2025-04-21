#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 配置 Git
execSync('git config --global user.name github-ci');
execSync('git config --global user.email github-ci@example.com');

// 临时目录
const cloneDirectory = path.join(os.tmpdir(), 'monorepo_split', 'clone_directory');
const buildDirectory = path.join(os.tmpdir(), 'monorepo_split', 'build_directory');
const accessToken = process.env.GITHUB_TOKEN;
const baseDir = process.cwd();

console.log(`Current directory: ${baseDir}`);

// 定义要拆分的包和对应的目标仓库
const config = [
  ['packages/demo-expo-app', 'umworks/demo-expo-app', 'main'],
  ['packages/demo-tauri-app', 'umworks/demo-tauri-app', 'main'],
  ['packages/demo-react-vite', 'umworks/demo-react-vite', 'main'],
  ['packages/demo-taro-react', 'umworks/demo-taro-react', 'main'],
];

// 获取最近提交修改的文件
const changedFiles = (process.env.ALL_CHANGED_FILES || '').split(' ').filter(Boolean);
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

console.log(`Processing ${Object.keys(modifiedPackages).length} modified packages`);

// 处理每个修改的包
for (const [index, [localDirectory, remoteDirectory, branch = 'main']] of config.entries()) {
  // 只处理被修改的包
  if (!modifiedPackages[index]) {
    continue;
  }

  // 清理临时目录
  execSync(`rm -rf ${cloneDirectory}`);
  execSync(`rm -rf ${buildDirectory}`);

  const hostRepositoryOrganizationName = `github.com/${remoteDirectory}`;

  // 克隆目标仓库
  const clonedRepository = `https://${hostRepositoryOrganizationName}`;
  console.log(`Cloning "${clonedRepository}" repository to "${cloneDirectory}" directory`);

  try {
    execSync(`git clone -- https://${accessToken}@${hostRepositoryOrganizationName} ${cloneDirectory}`, { stdio: 'inherit' });
  } catch (error) {
    console.log(`Repository does not exist yet, creating it: ${remoteDirectory}`);
    // 如果仓库不存在，我们将在后面创建它
  }

  // 切换到克隆目录
  process.chdir(cloneDirectory);

  try {
    execWithOutput('git fetch');

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
      execWithOutput(`git push --quiet origin ${branch}`);
    }
  } catch (error) {
    // 新的仓库，这是正常的
    console.log('Repository might be new, ignoring checkout error');
  }

  // 返回到基础目录
  process.chdir(baseDir);

  console.log('Cleaning destination repository of old files');

  // 创建构建目录
  fs.mkdirSync(`${buildDirectory}/.git`, { recursive: true });

  // 复制 .git 目录到构建目录
  try {
    execSync(`cp -r ${cloneDirectory}/.git ${buildDirectory}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to copy .git directory', error);
    process.exit(1);
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
    process.exit(1);
  }

  // 切换到构建目录
  process.chdir(buildDirectory);

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
    continue;
  }

  // 推送更改
  console.log('Pushing changes');
  execWithOutput(`git push origin ${branch}`);
}

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
    return '';
  }
}
