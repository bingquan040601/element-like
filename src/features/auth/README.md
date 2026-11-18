# 用户认证

## 功能与接口

- 注册：`POST /api/v1/auth/register`，成功后自动登录
- 登录：`POST /api/v1/auth/login`，支持用户名或邮箱
- 当前用户：`GET /api/v1/users/me`
- 修改资料：`PATCH /api/v1/users/me`，仅昵称、邮箱可编辑
- 修改密码：`POST /api/v1/auth/change-password`
- 未登录访问受保护页面时跳转 `/login`，并通过 `redirect` 保留目标地址
- 修改密码成功后立即替换响应返回的新 token；旧 token 不再使用

## 分层

- `src/api/http.ts`：fetch 封装，统一 API 前缀、JSON、Bearer Token、响应拆包、错误和 401 处理
- `src/stores/auth.ts`：Pinia 响应式状态与登录、注册、资料刷新/修改、修改密码、退出 actions
- `authStorage.ts`：仅负责刷新后的会话恢复；`remember` 决定 localStorage / sessionStorage
- `services/`：后端接口契约和 API 适配器
- `components/`：登录 / 注册共享布局、用户菜单、个人信息和密码表单
- `src/router/index.ts`：路由默认受保护，通过 `meta.public` 显式开放公开页

Pinia 中保存 `user`、`accessToken`、`expiresAt` 等会话状态，Storage 仅用于持久化同一份会话。密码、确认密码只保留在表单内，绝不写入 Pinia 或 Storage。

## 开发代理

`vite.config.ts` 将 `/api` 代理到 `http://localhost:3000`，前端请求保持同源，无需在业务代码中写开发主机名。默认 API 前缀为 `/api/v1`，可通过 `VITE_API_BASE_URL` 覆盖（见 `.env.example`）；生产环境应由网关提供相同 API 前缀，或配置完整的生产 API 地址。

## 错误处理

HTTP 层把标准错误响应转换为 `ApiError`，保留 `status`、`code`、`requestId` 和 `details`。注册与密码表单会把字段错误显示在对应输入项旁。登录 / 注册请求使用 `auth: false`，因此账号密码错误不会误触发全局登出；其他请求的 401 会清理 Pinia 会话并跳转登录页。
