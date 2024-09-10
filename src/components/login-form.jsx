"use client";
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Github, Mail } from "lucide-react"
import { RegistForm } from "./regist-form"

export function LoginForm({
  onLogin,
  onRegister
}) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (username && password) {
      // 客户端数据验证
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      const passwordRegex = /^.{7,}$/

      if (!usernameRegex.test(username)) {
        alert("用户名必须是3-20个字符，只能包含字母、数字和下划线。")
        return
      }
      if (!passwordRegex.test(password)) {
        alert("密码必须至少7个字符。")
        return
      }

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: username.trim(), 
            password 
          }),
        })
        const data = await response.json()
        if (response.ok) {
          localStorage.setItem('sessionToken', data.sessionToken)
          onLogin(username, "password")
        } else {
          alert(data.error || "登录失败。请重试。")
        }
      } catch (error) {
        alert("发生错误。请重试。")
      }
    } else {
      alert("请输入用户名和密码。")
    }
  }

  const handleGoogleLogin = () => {
    onLogin("Google User", "google")
  }

  const handleGithubLogin = () => {
    localStorage.setItem('githubLoggingIn', 'true');
    window.location.href = '/api/auth/github';
  }

  

  if (isRegistering) {
    return <RegistForm onBack={() => setIsRegistering(false)} onRegister={onRegister} />
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">登录</h2>
        <p className="text-sm text-muted-foreground">
          选择您喜欢的登录方式
        </p>
      </div>
      <div className="space-y-4">
        {/* <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
          <Mail className="mr-2 h-4 w-4" />
          使用 Google 登录
        </Button> */}
        <Button variant="outline" className="w-full" onClick={handleGithubLogin}>
          <Github className="mr-2 h-4 w-4" />
          使用 GitHub 登录
        </Button>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">或者使用</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <Input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">
          登录
        </Button>
      </form>
      <div className="text-center text-sm">
        还没有账号？{" "}
        <Button
          variant="link"
          className="p-0"
          onClick={() => setIsRegistering(true)}>
          注册
        </Button>
      </div>
    </div>
  );
}