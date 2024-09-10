"use client";
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function RegistForm({
  onBack,
  onRegister
}) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (username && email && password && confirmPassword) {
      if (password !== confirmPassword) {
        alert("密码不匹配。")
        return
      }
      // 客户端数据验证
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const passwordRegex = /^.{7,}$/

      if (!usernameRegex.test(username)) {
        alert("用户名必须是3-20个字符，只能包含字母、数字和下划线。")
        return
      }
      if (!emailRegex.test(email)) {
        alert("请输入有效的电子邮件地址。")
        return
      }
      if (!passwordRegex.test(password)) {
        alert("密码必须至少7个字符。")
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
          alert(data.error || "注册失败。请重试。")
        }
      } catch (error) {
        alert("发生错误。请重试。")
      }
    } else {
      alert("请填写所有字段。")
    }
  }

  return (
    (<div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Create an Account</h2>
        <p className="text-sm text-muted-foreground">Enter your details to register</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Button variant="link" className="p-0" onClick={onBack}>
          Login
        </Button>
      </div>
      <Button variant="ghost" onClick={onBack} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Login
      </Button>
    </div>)
  );
}