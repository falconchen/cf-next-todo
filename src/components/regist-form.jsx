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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username && email && password && confirmPassword) {
      if (password !== confirmPassword) {
        alert("Passwords do not match.")
        return
      }
      // In a real app, you would send this data to your backend
      onRegister(username, "password")
    } else {
      alert("Please fill in all fields.")
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