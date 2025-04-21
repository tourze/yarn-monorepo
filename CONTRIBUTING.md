# 贡献指南

感谢您对本项目的关注！我们欢迎各种形式的贡献，无论是提交 bug 报告、功能请求还是代码贡献。

## 开发环境设置

1. 克隆仓库：

```bash
git clone https://github.com/umworks/umworks-yarn-monorepo.git
cd umworks-yarn-monorepo
```

2. 安装依赖：

```bash
yarn install
```

3. 设置 husky 钩子：

```bash
yarn prepare
```

## 开发工作流

1. 创建新分支：

```bash
git checkout -b feature/your-feature-name
```

2. 进行代码修改

3. 确保代码符合规范：

```bash
yarn lint
yarn test
```

4. 提交修改：

```bash
git add .
git commit -m "feat: 添加新功能" # 使用约定式提交消息
```

5. 推送到远程分支：

```bash
git push origin feature/your-feature-name
```

6. 创建 Pull Request

## 提交规范

我们使用[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)规范，提交消息应该符合以下格式：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

常用的类型包括：

- **feat**: 新功能
- **fix**: 修复 bug
- **docs**: 文档修改
- **style**: 代码格式修改，不影响代码功能
- **refactor**: 重构代码，不添加新功能或修复 bug
- **perf**: 性能优化
- **test**: 添加或修改测试
- **chore**: 构建过程或辅助工具的变动

示例：

```
feat(demo-react-vite): 添加用户认证功能

- 实现用户登录表单
- 添加认证状态管理
- 实现身份验证路由保护

Closes #123
```

## 项目规范

### 代码风格

- 遵循 ESLint 和 Prettier 配置的代码风格规范
- 使用 TypeScript 类型，避免使用 `any`
- 函数组件使用命名导出，不使用默认导出
- 使用函数式编程风格（map, filter, reduce 等）

### 测试规范

- 每个功能点都应有对应的测试
- 测试应该是独立的，一个测试不应该依赖另一个测试
- 组件测试应该关注用户可见的行为，而不是内部实现

### Monorepo 规范

- 相关功能应放在同一个包中
- 共享代码应提取到独立的包或工具中
- 包之间的依赖关系应该明确声明在 package.json 中
- 避免包之间的循环依赖

## Pull Request 流程

1. 确保你的 PR 有一个清晰的标题和描述
2. 确保所有测试都通过
3. 确保代码通过 lint 检查
4. 如果添加了新功能，请同时添加对应的测试
5. 如果修复了 bug，请在 PR 描述中引用对应的 issue
6. 等待代码审查和合并

## 提问与讨论

如果您有任何问题或想法，请：

1. 查看现有的 [Issues](https://github.com/umworks/umworks-yarn-monorepo/issues) 是否已有相关讨论
2. 如果没有，请创建新的 Issue 进行讨论
3. 对于简单的问题，也可以在 PR 中直接提问

感谢您的贡献！
