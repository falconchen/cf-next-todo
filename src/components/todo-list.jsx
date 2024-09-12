"use client";
import { useState, useEffect, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, RefreshCw, LogIn, LogOut, Clock, Loader2 } from "lucide-react"
import { LoginForm } from "./login-form"
import { ToastContainer, useNotification } from '@/components/ui/notification'
import Image from 'next/image';
import debounce from 'lodash/debounce';
import 'github-fork-ribbon-css/gh-fork-ribbon.css'
import { AnimatePresence, motion } from "framer-motion"

export function TodoList() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const [activeTab, setActiveTab] = useState("active")
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const showNotification = useNotification();
  const [shouldToggle, setShouldToggle] = useState(true);

  const fetchUserData = useCallback(async (sessionToken) => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
      } else if (response.status === 401) {
        localStorage.removeItem('sessionToken');
        setUser(null);
        showNotification("会话已过期,请重新登录", "error");
      } else {
        throw new Error('获取用户数据失败');
      }
    } catch (error) {
      console.error('获取用户数据时出错:', error);
      showNotification("获取用户数据时出错,请稍后重试", "error");
    }
  }, [showNotification]);

  const syncTasks = async (showSyncNotification = false) => {
    try {
      const sessionToken = localStorage.getItem('sessionToken')
      if (!sessionToken) {
        return;
      }
      setIsLoading(true)
      
      // 获取本地存储的任务
      const localTasks = JSON.parse(localStorage.getItem("tasks") || '[]')
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      }
      
      let response;
      if (localTasks.length > 0) {
        // 如果本地任务不为空,将本地任务提交到服务器
        response = await fetch('/api/todos', {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(localTasks)
        })
      } else {
        // 如果本地任务为空,从服务器获取任务
        response = await fetch('/api/todos', {
          method: 'GET',
          headers: headers
        })
      }

      if (!response.ok) {
        if (response.status === 401) {
          // 会话过期,清除本地存储并提示用户重新登录
          localStorage.removeItem('sessionToken')
          setUser(null)
          showNotification("会话已过期,请重新登录", "error")
          return;
        }
        throw new Error(localTasks.length > 0 ? '同步任务到服务器失败' : '获取任务失败')
      }
      
      const serverTasks = await response.json()
      localStorage.setItem("tasks", JSON.stringify(serverTasks))
      setTasks(serverTasks.sort((a, b) => b.updatedAt - a.updatedAt)) // 按 updatedAt 降序排列
      
      if (showSyncNotification) {
        showNotification("您的任务已与服务器同步。", "success")
      }
    } catch (error) {
      showNotification(error.message || "同步任务时出错。请重试。", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedSyncTasks = useCallback(
    debounce(() => {
      syncTasks(false);
    }, 1000),
    [syncTasks]
  );

  const handleLogin = useCallback(async (username, loginMethod,sessionToken) => {
    const user = { username, loginMethod, sessionToken }
    setUser(user)
    localStorage.setItem('sessionToken', sessionToken)
    setIsLoginOpen(false)
    syncTasks(true) 
  }, [showNotification]);

  useEffect(() => {
    console.log("useEffect");
    const url = new URL(window.location.href);
    const sessionToken = url.searchParams.get('sessionToken');
    if (sessionToken && localStorage.getItem('githubLoggingIn')) {
      localStorage.removeItem('githubLoggingIn');
      localStorage.setItem('sessionToken', sessionToken);
      fetchUserData(sessionToken);
      window.history.replaceState({}, document.title, "/");
      syncTasks(true);
    } else {
      const storedSessionToken = localStorage.getItem('sessionToken');
      if (storedSessionToken) {
        fetchUserData(storedSessionToken);
        debouncedSyncTasks(true);
      }else{
        const storedTasks = localStorage.getItem("tasks")
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks))
        }
      }
    }
    
    
  }, [fetchUserData]);

  const saveTasksToLocalStorage = (updatedTasks) => {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
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
      
      // 发送通知
      if (updatedTask.completed) {
        showNotification(`任务 "${updatedTask.text}" 已标记为完成。`, "success")
      } else {
        showNotification(`任务 "${updatedTask.text}" 已恢复为进行中。`, "success")
      }
      
      debouncedSyncTasks();
    }
  }

  const deleteTask = async (id) => {
    const localTasks = JSON.parse(localStorage.getItem("tasks") || '[]')
    const taskToDelete = localTasks.find(task => task.id === id)
    if (taskToDelete) {
      // 将 deleted 设为 true,而不是从 tasks 中移除
      const updatedTask = { ...taskToDelete, deleted: true, deletedAt: Date.now(), updatedAt: Date.now() }
      const updatedTasks = localTasks.map(task => task.id === id ? updatedTask : task)
      
      localStorage.setItem("tasks", JSON.stringify(updatedTasks))
      setTasks(updatedTasks)
      
      showNotification("任务删除成功！", "success")
      debouncedSyncTasks();
    }
  }

  const restoreTask = (id) => {
    const taskToRestore = tasks.find(task => task.id === id)
    if (taskToRestore) {
      // 将 deleted 设为 false
      const updatedTask = { ...taskToRestore, deleted: false, deletedAt: null, updatedAt: Date.now() }
      const updatedTasks = tasks.map(task => task.id === id ? updatedTask : task)
      
      setTasks(updatedTasks)
      saveTasksToLocalStorage(updatedTasks)
      
      showNotification("任务已恢复!", "success")
      debouncedSyncTasks();
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('user')
    localStorage.removeItem('tasks')
    setTasks([])
    setUser(null)    
    showNotification("您已成功登出。", "success")
  }

  const handleRegister = async (username, loginMethod,sessionToken) => {
    
    const user = { username, loginMethod, sessionToken }
    setUser(user)
    localStorage.setItem('sessionToken', sessionToken)
    setIsLoginOpen(false)
    setTasks([])
    showNotification(`欢迎, ${username}! 您的账户已创建。`, "success")
  }

  const filteredTasks = tasks
    .filter(task => {
      if (activeTab === "active") return !task.completed && !task.deleted
      if (activeTab === "completed") return task.completed && !task.deleted
      if (activeTab === "deleted") return task.deleted && !task.permanentlyDeleted
      return true
    })
    .sort((a, b) => b.updatedAt - a.updatedAt) // 按 updatedAt 降序排列

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  }

  const renderTasks = (taskList, showCompleted, onToggle, onDelete, onRestore, onPermanentlyDelete) => (
    <ul className="space-y-2">
      <AnimatePresence>
        {taskList.map(task => (
          <li key={task.id} className="list-none">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className={`bg-muted p-3 rounded-md transition-colors duration-200 cursor-pointer mb-2 ${
                !task.completed && !task.deleted ? 'hover:bg-muted/40 group' : ''
              }`}
              onClick={(e) => {
                if (!task.completed && !task.deleted && e.target.closest('button') === null && shouldToggle) {
                  onToggle(task.id);
                }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center flex-grow mr-2">
                  {showCompleted && (
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => {
                        setShouldToggle(false);
                        onToggle(task.id);
                        setTimeout(() => setShouldToggle(true), 0);
                      }}
                      className="mr-2 flex-shrink-0"
                    />
                  )}
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`${
                      task.completed
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground group-hover:line-through'
                    } break-words cursor-pointer transition-all duration-200`}
                  >
                    {task.text}
                  </label>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  {!task.deleted && onDelete && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡
                          onDelete(task.id);
                        }}
                        aria-label={`删除任务: ${task.text}`}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                  {task.deleted && onRestore && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRestore(task.id)}
                        aria-label={`恢复任务: ${task.text}`}
                        className="flex-shrink-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                  {task.deleted && onPermanentlyDelete && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => onPermanentlyDelete(task.id)}
                        aria-label={`永久删除任务: ${task.text}`}
                        className="flex-shrink-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />  
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  创建时间: {formatDate(task.createdAt)}
                </div>
                {task.completed && task.completedAt && (
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    完成时间: {formatDate(task.completedAt)}
                  </div>
                )}
                {task.deletedAt && (
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    删除时间: {formatDate(task.deletedAt)}
                  </div>
                )}
              </div>
            </motion.div>
          </li>
        ))}
      </AnimatePresence>
    </ul>
  )

  const permanentlyDeleteTask = async (id) => {
    const localTasks = JSON.parse(localStorage.getItem("tasks") || '[]')
    const taskToPermanentlyDelete = localTasks.find(task => task.id === id)
    if (taskToPermanentlyDelete) {
      const updatedTask = {
        ...taskToPermanentlyDelete,
        permanentlyDeleted: true,
        updatedAt: Date.now()
      }
      
      // 更新本地存储
      const updatedTasks = localTasks.map(task => task.id === id ? updatedTask : task)
      localStorage.setItem("tasks", JSON.stringify(updatedTasks))
      setTasks(updatedTasks)
      
      showNotification("任务已永久删除!", "success")
      debouncedSyncTasks();
    }
  }

  return (
    (<div
      className="max-w-4xl mx-auto mt-4 p-4 sm:mt-8 sm:p-6 bg-background rounded-lg shadow-lg relative">
      
      <ToastContainer />
      {isLoading && (
        <div className="absolute top-0 right-2 flex items-center space-x-2 text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">同步中...</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-3">
        <h1 className="text-2xl font-bold text-primary mb-4 sm:mb-0 flex items-center">
          <Image src="/icon.jpeg" alt="待办事项列表图标" width={24} height={24} className="mr-2" />
          Next Todo
        </h1>
        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
          <DialogTrigger asChild>
            {user ? (
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                登出
              </Button>
            ) : (
              <Button variant="outline">
                <LogIn className="h-4 w-4 mr-2" />
                登录
              </Button>
            )}
          </DialogTrigger>
          <DialogContent>
            <LoginForm onLogin={handleLogin} onRegister={handleRegister} showNotification={showNotification} />
          </DialogContent>
        </Dialog>
      </div>
      {user ? (
        <p className="mb-4 text-center sm:text-left">
          欢迎, {user.username}! (使用 {user.loginMethod} 登录)
        </p>
      ) : (
        <p className="mb-4 text-center sm:text-left">
          又一个待办事项应用,这次使用 Next.js、Cloudflare 和 v0.dev。
        </p>
      )}
      <div className="flex flex-col sm:flex-row mb-4">
        <Input
          type="text"          
          name="new-task" 
          
          id="new-task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="添加新任务"
          className="mb-2 sm:mb-0 sm:mr-2"
          autoComplete="new-password"           
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={addTask} className="w-full sm:w-auto">添加</Button>
        </motion.div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">进行中</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
          <TabsTrigger value="deleted">已删除</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {renderTasks(filteredTasks, true, toggleTask, deleteTask)}
        </TabsContent>
        <TabsContent value="completed">
          {renderTasks(filteredTasks, true, toggleTask, deleteTask)}
        </TabsContent>
        <TabsContent value="deleted">
          {renderTasks(filteredTasks, false, toggleTask, () => {}, restoreTask, permanentlyDeleteTask)}
        </TabsContent>
      </Tabs>
      
    </div>)
  );
}