"use client";
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, RefreshCw, LogIn, LogOut, Clock } from "lucide-react"
import { LoginForm } from "./login-form"

// Simulated server sync function
const syncWithServer = async tasks => {
  console.log("Syncing with server:", tasks)
  await new Promise(resolve => setTimeout(resolve, 1000))
}

export function TodoList() {
  const [tasks, setTasks] = useState([])
  const [deletedTasks, setDeletedTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const [activeTab, setActiveTab] = useState("active")
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks")
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    }
    const storedDeletedTasks = localStorage.getItem("deletedTasks")
    if (storedDeletedTasks) {
      setDeletedTasks(JSON.parse(storedDeletedTasks))
    }
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const saveTasksToLocalStorage = (updatedTasks) => {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
  }

  const saveDeletedTasksToLocalStorage = (updatedDeletedTasks) => {
    localStorage.setItem("deletedTasks", JSON.stringify(updatedDeletedTasks))
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const syncTasks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/todos', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer user123' // 模拟用户认证
        }
      })
      const serverTasks = await response.json()
      
      // 获取本地存储的任务
      const localTasks = JSON.parse(localStorage.getItem("tasks") || '[]')
      
      // 合并服务器和本地任务
      const mergedTasks = serverTasks.map(serverTask => {
        const localTask = localTasks.find(task => task.id === serverTask.id)
        return localTask || serverTask
      })
      
      // 添加本地存在但服务器上不存在的任务
      localTasks.forEach(localTask => {
        if (!mergedTasks.some(task => task.id === localTask.id)) {
          mergedTasks.push(localTask)
        }
      })
      
      // 更新状态和本地存储
      setTasks(mergedTasks)
      localStorage.setItem("tasks", JSON.stringify(mergedTasks))
      
      // 将合并后的任务同步到服务器
      await fetch('/api/todos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user123' // 模拟用户认证
        },
        body: JSON.stringify(mergedTasks)
      })
      
      showNotification("您的任务已与服务器同步。", "success")
    } catch (error) {
      showNotification("同步任务时出错。请重试。", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const addTask = async () => {
    if (newTask.trim() !== "") {
      const newTaskObj = {
        id: Date.now(),
        text: newTask,
        completed: false,
        createdAt: Date.now()
      }
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer user123' // 模拟用户认证
          },
          body: JSON.stringify(newTaskObj)
        })
        if (response.ok) {
          const updatedTasks = [...tasks, newTaskObj]
          setTasks(updatedTasks)
          setNewTask("")
          setActiveTab("active")
          showNotification("任务添加成功！", "success")
        } else {
          throw new Error('添加任务失败')
        }
      } catch (error) {
        showNotification("添加任务时出错。请重试。", "error")
      }
    }
  }

  const toggleTask = async (id) => {
    const taskToToggle = tasks.find(task => task.id === id)
    if (taskToToggle) {
      const updatedTask = {
        ...taskToToggle,
        completed: !taskToToggle.completed,
        completedAt: taskToToggle.completed ? undefined : Date.now()
      }
      try {
        const response = await fetch('/api/todos', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer user123' // 模拟用户认证
          },
          body: JSON.stringify(updatedTask)
        })
        if (response.ok) {
          const updatedTasks = tasks.map(task => task.id === id ? updatedTask : task)
          setTasks(updatedTasks)
        } else {
          throw new Error('更新任务失败')
        }
      } catch (error) {
        showNotification("更新任务时出错。请重试。", "error")
      }
    }
  }

  const deleteTask = async (id) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user123' // 模拟用户认证
        },
        body: JSON.stringify({ id })
      })
      if (response.ok) {
        const taskToDelete = tasks.find(task => task.id === id)
        if (taskToDelete) {
          const updatedDeletedTask = { ...taskToDelete, deletedAt: Date.now() }
          const updatedDeletedTasks = [...deletedTasks, updatedDeletedTask]
          setDeletedTasks(updatedDeletedTasks)
          saveDeletedTasksToLocalStorage(updatedDeletedTasks)

          const updatedTasks = tasks.filter(task => task.id !== id)
          setTasks(updatedTasks)
          showNotification("任务删除成功！", "success")
        }
      } else {
        throw new Error('删除任务失败')
      }
    } catch (error) {
      showNotification("删除任务时出错。请重试。", "error")
    }
  }

  const restoreTask = (id) => {
    const taskToRestore = deletedTasks.find(task => task.id === id)
    if (taskToRestore) {
      const { deletedAt, ...restoredTask } = taskToRestore
      const updatedTasks = [...tasks, restoredTask]
      setTasks(updatedTasks)
      saveTasksToLocalStorage(updatedTasks)

      const updatedDeletedTasks = deletedTasks.filter(task => task.id !== id)
      setDeletedTasks(updatedDeletedTasks)
      saveDeletedTasksToLocalStorage(updatedDeletedTasks)
      showNotification("Task restored successfully!", "success")
    }
  }

  const handleLogin = async (username, method) => {
    const newUser = { username, loginMethod: method }
    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
    setIsLoginOpen(false)
    showNotification(`Welcome, ${username}! You've logged in with ${method}.`, "success")
    await syncTasks()
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("user")
    showNotification("You have been successfully logged out.", "success")
  }

  const handleRegister = async (username, method) => {
    // In a real app, you would send the registration data to your backend
    // For this example, we'll just log in the user directly
    handleLogin(username, method)
    showNotification(`Welcome, ${username}! Your account has been created.`, "success")
  }

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "active") return !task.completed
    if (activeTab === "completed") return task.completed
    return true
  })

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  }

  const renderTasks = (taskList, showCompleted, onToggle, onDelete, onRestore) => (
    <ul className="space-y-2">
      {taskList.map(task => (
        <li key={task.id} className="bg-muted p-3 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center flex-grow mr-2">
              {showCompleted && (
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => onToggle(task.id)}
                  className="mr-2 flex-shrink-0" />
              )}
              <label
                htmlFor={`task-${task.id}`}
                className={`${task.completed ? 'line-through text-muted-foreground' : 'text-primary'} break-words`}>
                {task.text}
              </label>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete ? onDelete(task.id) : onRestore(task.id)}
              aria-label={`${onDelete ? 'Delete' : 'Restore'} task: ${task.text}`}
              className="flex-shrink-0">
              {onDelete ? <Trash2 className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Created: {formatDate(task.createdAt)}
            </div>
            {task.completed && task.completedAt && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Completed: {formatDate(task.completedAt)}
              </div>
            )}
            {task.deletedAt && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Deleted: {formatDate(task.deletedAt)}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )

  return (
    (<div
      className="max-w-4xl mx-auto mt-4 p-4 sm:mt-8 sm:p-6 bg-background rounded-lg shadow-lg">
      {notification && (
        <div
          className={`mb-4 p-2 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-4 sm:mb-0">Todo List</h1>
        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
          <DialogTrigger asChild>
            {user ? (
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            ) : (
              <Button variant="outline">
                <LogIn className="h-4 w-4 mr-2" />
                Log In
              </Button>
            )}
          </DialogTrigger>
          <DialogContent>
            <LoginForm onLogin={handleLogin} onRegister={handleRegister} />
          </DialogContent>
        </Dialog>
      </div>
      {user && (
        <p className="mb-4 text-center sm:text-left">
          Welcome, {user.username}! (Logged in with {user.loginMethod})
        </p>
      )}
      <div className="flex flex-col sm:flex-row mb-4">
        <Input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task"
          className="mb-2 sm:mb-0 sm:mr-2" />
        <Button onClick={addTask} className="w-full sm:w-auto">Add</Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="deleted">Deleted</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {renderTasks(filteredTasks, true, toggleTask, deleteTask)}
        </TabsContent>
        <TabsContent value="completed">
          {renderTasks(filteredTasks, true, toggleTask, deleteTask)}
        </TabsContent>
        <TabsContent value="deleted">
          {renderTasks(deletedTasks, false, toggleTask, () => {}, restoreTask)}
        </TabsContent>
      </Tabs>
      {isLoading && <p className="mt-4 text-center">Syncing...</p>}
    </div>)
  );
}