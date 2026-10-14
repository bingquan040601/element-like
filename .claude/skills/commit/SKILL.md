---
name: commit
description: 分析当前 git 变更，按 Conventional Commits (Angular) 规范生成提交信息并完成提交。当用户说"提交代码"、"commit"、"写个提交"或使用 /commit 时触发。
---

# Commit — 规范化提交流程

按"一线大厂"规范（Conventional Commits / Angular 约定）完成 git 提交。

## 流程

### 1. 收集变更信息（并行执行）

```bash
git status
git diff --staged
git diff
git log --oneline -5   # 参考仓库已有提交风格
```

### 2. 拆分逻辑变更

- **一个 commit 只做一件事**。如果变更包含多个不相关的逻辑改动（例如"加了一个组件" + "修了构建配置"），拆成多个提交。
- 拆分时用 `git add <具体文件>` 分批暂存，**不要** 一把梭 `git add -A`。
- 拿不准是否需要拆分时，向用户说明拆分方案再执行。

### 3. 确定 type 和 scope

| type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 仅文档变更 |
| `style` | 格式调整（空格、分号、格式化，不影响逻辑） |
| `refactor` | 重构（既不修 bug 也不加功能） |
| `perf` | 性能优化 |
| `test` | 新增/修改测试 |
| `build` | 构建系统或依赖变更（vite、tsconfig、package.json deps） |
| `ci` | CI 配置变更 |
| `chore` | 其他杂项（不改 src/test 的辅助性变更） |
| `revert` | 回滚之前的提交 |

- **scope**：取变更所属的模块/组件/目录名，如 `button`、`router`、`vite-config`；范围太散时省略 scope。
- `package.json` 依赖升级 → `build(deps):`；锁文件单独随依赖提交走。

### 4. 撰写提交信息

```
<type>(<scope>): <subject>

<body>

<footer>
```

**subject 硬性规则：**
- **中文**、动词开头（添加/修复/更新/重构/移除/合并……），结尾不加句号
- ≤50 字符（约 25~30 个汉字为宜）；超出说明拆分不够细或表述太啰嗦
- `type` 和 `scope` 保持英文小写（机器可读关键字），仅 subject 用中文

**body（可选但推荐用于非琐碎变更）：**
- 中文，说明"为什么改"，而不是复述"改了什么"（diff 已经能看到）
- 每行 ≤72 字符

**footer：**
- 破坏性变更必须写 `BREAKING CHANGE: <描述>`（关键字保持英文，描述用中文）
- 关联 issue：`Closes #123`、`Refs #456`

### 5. 提交

- 多行消息用 heredoc，保证格式正确：

```bash
git commit -m "$(cat <<'EOF'
feat(button): 添加加载状态

异步操作 pending 期间阻止用户重复点击提交。
EOF
)"
```

- 提交后运行 `git status` 确认工作区状态符合预期。

## 红线

- 发现疑似密钥/凭证（`.env`、token、私钥）时**立即停止**并告知用户，绝不提交。
- 不擅自执行 `git push`——推送需用户明确要求。
- 不改代码来"配合"提交拆分；只组织和提交已有变更。
