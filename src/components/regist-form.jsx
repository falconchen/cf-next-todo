"use client";
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function RegistForm({
  onBack,
  onRegister,
  showNotification
}) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (username && email && password && confirmPassword) {
      if (password !== confirmPassword) {
        showNotification("密码不匹配。", "error")
        return
      }
      // 客户端数据验证
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const passwordRegex = /^.{7,}$/

      if (!usernameRegex.test(username)) {
        showNotification("用户名必须是3-20个字符,只能包含字母、数字和下划线。", "error")
        return
      }
      if (!emailRegex.test(email)) {
        showNotification("请输入有效的电子邮件地址。", "error")
        return
      }
      if (!passwordRegex.test(password)) {
        showNotification("密码必须至少7个字符。", "error")
        return
      }

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: username.trim(), 
            email: email.trim().toLowerCase(), 
            password 
          }),
        })
        const data = await response.json()
        if (response.ok) {
          onRegister(username, "password")
        } else {
          showNotification(data.error || "注册失败。请重试。", "error")
        }
      } catch (error) {
        showNotification("发生错误。请重试。", "error")
      }
    } else {
      showNotification("请填写所有字段。", "error")
    }
  }

  return (
    (<div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">创建账户</h2>
        <p className="text-sm text-muted-foreground">输入您的详细信息以注册</p>
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
            type="email"
            placeholder="电子邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <Input
            type="password"
            placeholder="确认密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">
          注册
        </Button>
      </form>
      <div className="text-center text-sm">
        已有账户？{" "}
        <Button variant="link" className="p-0" onClick={onBack}>
          登录
        </Button>
      </div>
      <Button variant="ghost" onClick={onBack} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回登录
      </Button>
    </div>)
  );
}