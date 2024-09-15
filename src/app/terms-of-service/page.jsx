import React from 'react';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-primary">使用条款</h1>
      <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
        <p className="text-muted-foreground">最后更新日期：{new Date().toISOString().split('T')[0]}</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">1. 接受条款</h2>
        <p>欢迎使用我们的服务。通过访问或使用我们的服务，您同意受本协议的约束。</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">2. 服务描述</h2>
        <p>我们提供一个待办事项管理平台，允许用户创建、编辑和管理他们的任务。</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">3. 账户注册和安全</h2>
        <p>您可以通过以下方式创建账户：</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>使用电子邮件地址注册</li>
          <li>使用 Google 账户登录（OAuth）</li>
          <li>使用 GitHub 账户登录（OAuth）</li>
        </ul>
        <p>您同意：</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>提供准确、完整的注册信息。</li>
          <li>保护您的账户安全，对账户下的所有活动负责。</li>
          <li>不与他人分享您的登录凭证。</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">4. OAuth 登录</h2>
        <h3>Google OAuth</h3>
        <p>使用 Google 账户登录时：</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>我们将访问您的基本公开资料信息。</li>
          <li>您可以随时在 Google 账户设置中撤销我们的访问权限。</li>
        </ul>

        <h3>GitHub OAuth</h3>
        <p>使用 GitHub 账户登录时：</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>我们将访问您的公开 GitHub 资料信息。</li>
          <li>我们可能会请求访问您的电子邮件地址。</li>
          <li>您可以随时在 GitHub 设置中撤销我们的应用程序访问权限。</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">5. 用户行为</h2>
        <p>您同意不会：</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>违反任何适用的法律或法规。</li>
          <li>侵犯他人的知识产权或其他权利。</li>
          <li>上传或传播有害、非法或不当的内容。</li>
          <li>尝试未经授权访问我们的系统或其他用户的账户。</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">6. 知识产权</h2>
        <p>我们的服务和相关内容受知识产权法保护。您不得未经授权使用、复制或分发这些内容。</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">7. 隐私</h2>
        <p>我们重视您的隐私。请查看我们的隐私政策，了解我们如何收集、使用和保护您的个人信息。</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">8. 服务变更和终止</h2>
        <p>我们保留随时修改或终止服务的权利，恕不另行通知。我们可能会因违反这些条款而终止或暂停您的账户。</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">9. 免责声明</h2>
        <p>我们的服务按&quot;原样&quot;提供，不提供任何明示或暗示的保证。</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">10. 责任限制</h2>
        <p>在法律允许的最大范围内，我们对任何直接、间接、附带、特殊或后果性损害不承担责任。</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">11. 条款变更</h2>
        <p>我们可能会不时更新这些条款。继续使用我们的服务即表示您同意新的条款。</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4 text-secondary-foreground">12. 联系我们</h2>
        <p>如果您对这些条款有任何问题，请联系我们：
          <code className="bg-muted text-muted-foreground px-2 py-1 rounded">Email: nextjsisfine@gmail.com</code>
        </p>
      </div>
    </div>
  );
}
