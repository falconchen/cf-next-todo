import { TodoList } from '@/components/todo-list'
import Footer from '@/components/footer'
import Link from 'next/link';

export default function Home() {
  return (
    <main className="container mx-auto px-4 flex flex-col min-h-screen">
      <div className="flex-grow">
        <TodoList />
      </div>
      <Footer />    
      <Link className="github-fork-ribbon left-top " href="https://github.com/falconchen/cf-next-todo" data-ribbon="Fork me on GitHub" title="Fork me on GitHub">Fork me on GitHub</Link>
    </main>
  )
}