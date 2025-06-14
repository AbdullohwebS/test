"use client"

import { useState } from "react"

function LoginModal({ onLogin, onClose }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const success = onLogin(username, password)

    if (!success) {
      setError("Invalid username or password. Please try again.")
    }

    setIsLoading(false)
  }

  const handleRegisterClick = () => {
    alert("Redirecting to registration page... (This is a demo)")
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Login Required</h2>
          <button className="close-btn" onClick={onClose}>
            ❌
          </button>
        </div>

        <div className="login-content">
          <p>Please login to add or edit cars</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="form-input"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="login-actions">
              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <div className="register-link">
                <span>Don't have an account? </span>
                <button type="button" onClick={handleRegisterClick} className="link-btn">
                  Register here
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
