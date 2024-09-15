# Next Todo - 基于 Cloudflare + Next.js + v0.dev 的待办事项应用

Next Todo 是一个功能完整的待办事项管理应用，采用现代 Web 技术栈构建。本项目展示了如何结合 Cloudflare、Next.js 和 v0.dev 创建一个全栈应用。

## 在线演示

访问 [https://cf-next-todo.pages.dev/](https://cf-next-todo.pages.dev/) 体验应用。

## 功能特性

- 用户注册和登录（支持邮箱、GitHub OAuth）
- 创建、编辑、删除和恢复待办事项
- 任务状态管理（进行中、已完成、已删除）
- 数据同步（在线和离线模式）
- 响应式设计，支持移动端和桌面端

## 技术栈

- 前端：Next.js、React、Tailwind CSS、shadcn/ui
- 后端：Cloudflare Workers
- 数据库：Cloudflare KV 
- 认证：自定义邮箱认证、GitHub OAuth
- 部署：Cloudflare Pages

## 本地开发

1. 克隆仓库：
   ```
   git clone https://github.com/falconchen/cf-next-todo.git
   cd cf-next-todo
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 设置环境变量：
   创建 `.dev.vars` 文件，并添加必要的环境变量（参考 `.dev.vars.example`）。

4. 运行开发服务器：
   ```
   npm run dev
   ```

5. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 部署

本项目使用 Cloudflare Pages 进行部署。确保你有一个 Cloudflare 账户并已设置好 Cloudflare Pages。

  - 构建并部署到 Cloudflare Pages：
    ```
    npm run deploy
    ```



## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 致谢

- [Next.js](https://nextjs.org/)
- [Cloudflare](https://www.cloudflare.com/)
- [v0.dev](https://v0.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

## 联系方式

如有任何问题或建议，请通过 [GitHub Issues](https://github.com/falconchen/cf-next-todo/issues) 联系我们。