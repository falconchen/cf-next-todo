import { TodoList } from '@/components/todo-list'
import Footer from '@/components/footer'
import GitHubForkRibbon from '@/components/github-fork-ribbon'

export default function Home() {
  return (
    <main className="container mx-auto px-4 flex flex-col min-h-screen">
      <div className="flex-grow">
        <TodoList />
      </div>
      <Footer />    
      <GitHubForkRibbon 
        href="https://github.com/falconchen/cf-next-todo" 
        dataRibbon="Fork me on GitHub" 
        title="Fork me on GitHub"
      />
    </main>
  )
}