# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指引。

## 项目概况

`element-like` — Vue 3 + TypeScript + Vite 脚手架（全新 create-vue 模板；路由为空，组件开发在 `src/` 下进行）。包管理器：**pnpm**。要求 Node `^22.18.0 || >=24.12.0`。

## 常用命令

- `pnpm dev` — Vite 开发服务器
- `pnpm build` — 通过 npm-run-all2 **并行**执行 `type-check`（vue-tsc --build）和 `build-only`（vite build）
- `pnpm test:unit` — Vitest **watch 模式**；一次性运行/CI 用 `pnpm vitest run`
- 单个测试文件：`pnpm vitest run src/__tests__/App.spec.ts`；按名称：`pnpm vitest run -t "mounts renders properly"`
- `pnpm lint` — 顺序执行两个 linter（见下文）
- `pnpm format` — Prettier 格式化，**只覆盖 `src/`**

## Lint 工具链（双 linter，均自动修复）

`pnpm lint` = `run-s lint:oxlint lint:eslint`：

1. **oxlint** 先跑（`--fix`），由 `.oxlintrc.json` 配置（correctness 类规则为 error）
2. **ESLint** 后跑（`--fix --cache`）；其配置通过 `eslint-plugin-oxlint` 导入 `.oxlintrc.json`，自动禁用 oxlint 已覆盖的规则——两者不会打架。修改 `.oxlintrc.json` 后 ESLint 侧自动跟随。

格式化完全由 Prettier 负责（`eslint-config-prettier` 已禁用冲突的 ESLint 规则）：无分号、单引号、行宽 100。

## 类型检查

- 项目引用（project references）：根 `tsconfig.json` 为空，委托给 `tsconfig.node.json`（配置文件）、`tsconfig.app.json`（src）、`tsconfig.vitest.json`（测试）。`vue-tsc --build` 对三者做增量类型检查。
- `tsconfig.app.json` 开启了 **`noUncheckedIndexedAccess: true`** —— 索引访问（`arr[i]`、`obj[key]`）返回 `T | undefined`，写代码时注意处理。
- 测试文件被**排除**在 `tsconfig.app.json` 之外，由 `tsconfig.vitest.json` 覆盖。

## 测试

- Vitest + @vue/test-utils + **jsdom**；`vitest.config.ts` 合并了 `vite.config.ts`，因此 `@` 别名和 Vue 插件在测试中的行为与开发环境一致。
- 测试放在 `src/**/__tests__/` 目录下（eslint-plugin-vitest 作用于该 glob）。`e2e/**` 已从单元测试中排除，但 e2e 环境尚未搭建。

## 约定

- 路径别名 `@/*` → `./src/*`（在 vite.config.ts 和 tsconfig.app.json 中配置；优先使用别名而非深层相对导入）。
- 通过 `@vitejs/plugin-vue-jsx` 支持在 Vue 组件中使用 JSX/TSX。
- **提交信息遵循 Conventional Commits (Angular) 规范** —— 格式为 `<type>(scope): <subject>`，subject 用**中文**、动词开头、≤50 字符；type 和 scope 保持英文小写。完整流程（按逻辑变更拆分提交、type/scope 选取）定义在项目 skill `.claude/skills/commit/SKILL.md` 中，每次提交都必须遵守。
