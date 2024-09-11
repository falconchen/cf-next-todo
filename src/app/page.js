import { TodoList } from '@/components/todo-list'

export default function Home() {
  return (
    <main className="container mx-auto px-4 ">
      <TodoList />
      <a className="github-fork-ribbon left-top " href="https://github.com/falconchen/cf-next-todo" data-ribbon="Fork me on GitHub" title="Fork me on GitHub">Fork me on GitHub</a>
    </main>
  )
}