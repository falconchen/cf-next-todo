# 使用cloudflare + nextjs + v0.dev 做的Todo List

听说以前 <v0.dev> 改版了，加强了ai聊天的能力，昨天试着做了个todo list玩了一下，完成度相当高啊，而且可以定制化，比如我做的这个，就是用聊天的方式，让ai给我生成一个ui组件，然后我再稍微调整一下，就可以用了，下一步准备用cursor开发api和oauth。

## 先看看效果

<https://cf-next-todo.pages.dev/>

部署在cloudflare，目前不登录可以使用，数据保存在 `localStorage`。

[代码Github Repo](https://github.com/falconchen/cf-next-todo)


## 使用

1. 创建项目
```
npm create cloudflare@latest -- cf-next-todo --framework=next
```

2. 安装<v0.dev>聊天做好的ui组件： 

可能有多个组件，所以可能执行需要多次:
比如我的是 `todo-list`，`regist-form`，`login-form`
```

npx shadcn@latest add "https://v0.dev/chat/b/组件1token"
npx shadcn@latest add "https://v0.dev/chat/b/组件2token"
npx shadcn@latest add "https://v0.dev/chat/b/组件3token"
```

3. 修改src/app/page.js

```
import { TodoList } from '@/components/todo-list'

export default function Home() {
  return (
    <main className="container mx-auto px-4">
      <TodoList />
    </main>
  )
}
```

4. 部署到cloudflare
```
npm run deploy
```


## 服务端开发 

1. 

## 参考文档：
[入门指南 | 全栈（SSR）| Next.js 应用 --- Get started | Full-stack (SSR) | Next.js apps](https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/get-started/)