import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">隐私政策</h1>
      <div className="prose max-w-none">
        <p>最后更新日期：{new Date().toISOString().split('T')[0]}</p>

        <h2>1. 信息收集</h2>
        <p>我们收集的信息类型包括：</p>
        <ul>
          <li>您提供给我们的个人信息，如姓名和电子邮件地址。</li>
          <li>通过 Google OAuth 和 GitHub OAuth 授权获得的信息。</li>
          <li>使用我们服务时自动收集的信息，如 IP 地址和设备信息。</li>
        </ul>

        <h2>2. 信息使用</h2>
        <p>我们使用收集的信息来：</p>
        <ul>
          <li>提供、维护和改进我们的服务。</li>
          <li>处理您的请求和响应您的询问。</li>
          <li>发送服务相关的通知。</li>
        </ul>

        <h2>3. 信息共享</h2>
        <p>我们不会出售您的个人信息。我们可能在以下情况下共享信息：</p>
        <ul>
          <li>经您同意。</li>
          <li>为遵守法律要求。</li>
          <li>保护我们的权利和财产。</li>
        </ul>

        <h2>4. 数据安全</h2>
        <p>我们采取合理的措施保护您的个人信息，但请注意，没有任何在线传输或电子存储方法是100%安全的。</p>

        <h2>5. OAuth 授权</h2>
        <h3>Google OAuth</h3>
        <p>当您选择使用 Google 账户登录时：</p>
        <ul>
          <li>我们只会请求访问您的基本公开资料信息。</li>
          <li>我们不会未经您的明确许可访问您的 Google 账户中的其他数据。</li>
          <li>您可以随时撤销我们对您 Google 账户的访问权限。</li>
        </ul>

        <h3>GitHub OAuth</h3>
        <p>当您选择使用 GitHub 账户登录时：</p>
        <ul>
          <li>我们会请求访问您的公开 GitHub 资料信息。</li>
          <li>我们可能会请求访问您的电子邮件地址，但不会访问您的私有仓库或其他敏感数据。</li>
          <li>您可以随时在 GitHub 设置中撤销我们的应用程序访问权限。</li>
        </ul>

        <h2>6. 您的权利</h2>
        <p>您有权：</p>
        <ul>
          <li>访问、更正或删除您的个人信息。</li>
          <li>反对我们处理您的信息。</li>
          <li>要求限制处理您的信息。</li>
          <li>数据可携带性。</li>
        </ul>

        <h2>7. 儿童隐私</h2>
        <p>我们的服务不面向13岁以下的儿童。如果您是父母或监护人，发现您的孩子向我们提供了个人信息，请联系我们。</p>

        <h2>8. 变更</h2>
        <p>我们可能会不时更新本隐私政策。我们会在本页面上发布任何更改。</p>

        <h2>9. 联系我们</h2>
        <p>如果您对本隐私政策有任何问题，请通过以下方式联系我们：</p>
        <p>Email: nextjsisfine@gmail.com
        </p>
      </div>
    </div>
  );
}