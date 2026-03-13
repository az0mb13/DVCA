import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password, showOtp ? otp : null);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h2>Welcome Back</h2>
          <p>Sign in to your VulnCorp account</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <div className="form-check mb-16">
            <input type="checkbox" checked={showOtp} onChange={e => setShowOtp(e.target.checked)} />
            <span>I have two-factor authentication enabled</span>
          </div>
          {showOtp && (
            <div className="form-group">
              <label>Authentication Code</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" />
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block">Sign In</button>
        </form>
        <div className="auth-divider">or</div>
        <div className="auth-footer">
          <Link to="/forgot-password">Forgot password?</Link>
          <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
