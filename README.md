# 使用cloudflare + nextjs + v0.dev 做的Todo List

1. 创建项目
```
npm create cloudflare@latest -- cf-next-todo --framework=next
```

2 安装<v0.dev>聊天做好的ui组件： 

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

效果：<https://cf-next-todo.pages.dev/>