"use client";
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Github, Mail } from "lucide-react"

export function LoginForm({
  onLogin,
  onRegister
}) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isRegistering) {
      if (username && email && password && confirmPassword) {
        if (password !== confirmPassword) {
          alert("Passwords do not match.")
          return
        }
        onRegister(username, "password")
      } else {
        alert("Please fill in all fields.")
      }
    } else {
      if (username && password) {
        onLogin(username, "password")
      } else {
        alert("Please enter both username and password.")
      }
    }
  }

  const handleGoogleLogin = () => {
    onLogin("Google User", "google")
  }

  const handleGithubLogin = () => {
    onLogin("GitHub User", "github")
  }

  return (
    (<div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">{isRegistering ? "Create an Account" : "Login"}</h2>
        <p className="text-sm text-muted-foreground">
          {isRegistering ? "Enter your details to register" : "Choose your preferred login method"}
        </p>
      </div>
      {!isRegistering && (
        <>
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
              <Mail className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGithubLogin}>
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
        </>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} />
        </div>
        {isRegistering && (
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </div>
        )}
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        {isRegistering && (
          <div>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        )}
        <Button type="submit" className="w-full">
          {isRegistering ? "Register" : "Login"}
        </Button>
      </form>
      <div className="text-center text-sm">
        {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
        <Button
          variant="link"
          className="p-0"
          onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Login" : "Join"}
        </Button>
      </div>
    </div>)
  );
}