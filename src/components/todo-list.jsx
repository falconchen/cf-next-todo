"use client";
import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, RefreshCw, LogIn, LogOut, Clock } from "lucide-react"
import { LoginForm } from "./login-form"
import { ToastContainer, useNotification } from '@/components/ui/notification'
import Image from 'next/image';
import debounce from 'lodash/debounce';

export function TodoList({ onLogin }) {
  const [tasks, setTasks] = useState([])
  const [deletedTasks, setDeletedTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const [activeTab, setActiveTab] = useState("active")
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const showNotification = useNotification();

  const fetchUserData = useCallback(async (sessionToken) => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      if (response.ok) {
        return await response.json();
      } else if (response.status === 401) {
        // 会话已过期
        localStorage.removeItem('sessionToken');
        setUser(null);
        showNotification("会话已过期,请重新登录", "error");
        return null;
      } else {
        throw new Error('获取用户数据失败');
      }
    } catch (error) {
      console.error('获取用户数据时出错:', error);
      showNotification("获取用户数据时出错,请稍后重试", "error");
      return null;
    }
  }, [showNotification]);

  const syncTasks = async () => {
    
    try {
      const sessionToken = localStorage.getItem('sessionToken')
      if (!sessionToken) {
        return;
        // throw new Error('未登录')
      }
      setIsLoading(true)
      const response = await fetch('/api/todos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      })
      if (!response.ok) {
        if (response.status === 401) {
          // 会话已过期，清除本地存储并提示用户重新登录
          localStorage.removeItem('sessionToken')
          setUser(null)
          throw new Error('会话已过期，请重新登录')
        }
        throw new Error('获取任务失败')
      }
      const serverTasks = await response.json()
      
      // 获取本地存储的任务
      const localTasks = JSON.parse(localStorage.getItem("tasks") || '[]')
      
      // 合并服务器和本地任务，保留 updatedAt 最大的 item
      const mergedTasks = [...serverTasks, ...localTasks].reduce((acc, task) => {
        const getUpdatedAt = (t) => t.updatedAt || Math.max(t.completedAt || 0, t.deletedAt || 0, t.createdAt || 0);
        const existingTask = acc.find(t => t.id === task.id);
        if (!existingTask || getUpdatedAt(task) > getUpdatedAt(existingTask)) {
          const index = acc.findIndex(t => t.id === task.id);
          if (index !== -1) {
            acc[index] = { ...task, updatedAt: getUpdatedAt(task) };
          } else {
            acc.push({ ...task, updatedAt: getUpdatedAt(task) });
          }
        }
        return acc;
      }, []);
      
      // 更新状态和本地存储
      setTasks(mergedTasks)
      localStorage.setItem("tasks", JSON.stringify(mergedTasks))
      
      // 将合并后的任务同步到服务器
      await fetch('/api/todos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(mergedTasks)
      })
      
      showNotification("您的任务已与服务器同步。", "success")
    } catch (error) {
      showNotification(error.message || "同步任务时出错。请重试。", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedSyncTasks = useCallback(
    debounce(() => {
      syncTasks();
    }, 1000),
    [syncTasks]
  );

  const handleLogin = useCallback(async (username, method) => {
    const newUser = { username, loginMethod: method }
    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
    setIsLoginOpen(false)
    showNotification(`Welcome, ${username}! You've logged in with ${method}.`, "success")
  }, [showNotification]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionToken = url.searchParams.get('sessionToken');
    if (sessionToken && localStorage.getItem('githubLoggingIn')) {
      localStorage.removeItem('githubLoggingIn');
      localStorage.setItem('sessionToken', sessionToken);
      fetchUserData(sessionToken).then(userData => {
        if (userData) {
          setUser({ username: userData.username, loginMethod: "github" });
          syncTasks();
        }
      });
      window.history.replaceState({}, document.title, "/");
    } else {
      const storedSessionToken = localStorage.getItem('sessionToken');
      if (storedSessionToken) {
        fetchUserData(storedSessionToken).then(userData => {
          if (userData) {
            setUser(userData);
          }
        });
      }
    }

    const storedTasks = localStorage.getItem("tasks")
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    }
    const storedDeletedTasks = localStorage.getItem("deletedTasks")
    if (storedDeletedTasks) {
      setDeletedTasks(JSON.parse(storedDeletedTasks))
    }
  }, [fetchUserData]);

  const saveTasksToLocalStorage = (updatedTasks) => {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
  }

  const saveDeletedTasksToLocalStorage = (updatedDeletedTasks) => {
    localStorage.setItem("deletedTasks", JSON.stringify(updatedDeletedTasks))
  }

  const addTask = async () => {
    if (newTask.trim() !== "") {
      const newTaskObj = {
        id: Date.now(),
        text: newTask,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      
      // 更新本地存储
      const localTasks = JSON.parse(localStorage.getItem("tasks") || '[]')
      const updatedTasks = [...localTasks, newTaskObj]
      localStorage.setItem("tasks", JSON.stringify(updatedTasks))
      setTasks(updatedTasks)
      setNewTask("")
      setActiveTab("active")
      
      // 检查用户是否登录
      const sessionToken = localStorage.getItem('sessionToken')
      if (sessionToken) {
        try {
          const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify(newTaskObj)
          })
          if (!response.ok) {
            throw new Error('添加任务到服务器失败')
          }
        } catch (error) {
          showNotification(error.message || "同步任务到服务器时出错。请稍后重试。", "error")
        }
      }
      
      showNotification("任务添加成功！", "success")
      debouncedSyncTasks();
    }
  }

  const toggleTask = async (id) => {
    const localTasks = JSON.parse(localStorage.getItem("tasks") || '[]')
    const taskToToggle = localTasks.find(task => task.id === id)
    if (taskToToggle) {
      const updatedTask = {
        ...taskToToggle,
        completed: !taskToToggle.completed,
        completedAt: taskToToggle.completed ? undefined : Date.now(),
        updatedAt: Date.now()
      }
      
      // 更新本地存储
      const updatedTasks = localTasks.map(task => task.id === id ? updatedTask : task)
      localStorage.setItem("tasks", JSON.stringify(updatedTasks))
      setTasks(updatedTasks)
      
      // 检查用户是否登录
      const sessionToken = localStorage.getItem('sessionToken')
      if (sessionToken) {
        try {
          const response = await fetch('/api/todos', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify(updatedTask)
          })
          if (!response.ok) {
            throw new Error('更新任务到服务器失败')
          }
        } catch (error) {
          showNotification(error.message || "同步任务到服务器时出错。请稍后重试。", "error")
        }
      }
      debouncedSyncTasks();
    }
  }

  const deleteTask = async (id) => {
    const localTasks = JSON.parse(localStorage.getItem("tasks") || '[]')
    const taskToDelete = localTasks.find(task => task.id === id)
    if (taskToDelete) {
      // 更新本地存储
      const updatedTasks = localTasks.filter(task => task.id !== id)
      localStorage.setItem("tasks", JSON.stringify(updatedTasks))
      setTasks(updatedTasks)
      
      const updatedDeletedTask = { ...taskToDelete, deletedAt: Date.now(), updatedAt: Date.now() }
      const updatedDeletedTasks = [...deletedTasks, updatedDeletedTask]
      setDeletedTasks(updatedDeletedTasks)
      saveDeletedTasksToLocalStorage(updatedDeletedTasks)
      
      // 检查用户是否登录
      const sessionToken = localStorage.getItem('sessionToken')
      if (sessionToken) {
        try {
          const response = await fetch('/api/todos', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({ id })
          })
          if (!response.ok) {
            throw new Error('从服务器删除任务失败')
          }
        } catch (error) {
          showNotification(error.message || "同步删除任务到服务器时出错。请稍后重试。", "error")
        }
      }
      
      showNotification("任务删除成功！", "success")
      debouncedSyncTasks();
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
      debouncedSyncTasks();
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('user')
    localStorage.removeItem('tasks')
    localStorage.removeItem('deletedTasks')
    setTasks([])
    setDeletedTasks([])
    setUser(null)    
    showNotification("您已成功登出。", "success")
    // setIsLoginOpen(false)
    
  }

  const handleRegister = async (username, method) => {
    
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
      
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-3">
        <h1 className="text-2xl font-bold text-primary mb-4 sm:mb-0 flex items-center">
          <Image src="/icon.jpeg" alt="Todo List Icon" width={24} height={24} className="mr-2" />
          Next Todo
        </h1>
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
      {user ? (
        <p className="mb-4 text-center sm:text-left">
          Welcome, {user.username}! (Logged in with {user.loginMethod})
        </p>
      ) : (
        <p className="mb-4 text-center sm:text-left">
          Yet another todo app, but this time with Next.js and Cloudflare and v0.dev.
        </p>
      )}
      <div className="flex flex-col sm:flex-row mb-4">
        <Input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
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