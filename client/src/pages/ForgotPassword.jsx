import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestReset = async (e) => {
    e.preventDefault();
    const res = await fetch('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('A reset code has been sent to your email address.');
      setStep(2);
    } else {
      setError(data.error);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    const res = await fetch('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    const data = await res.json();
    if (res.ok) setMessage(data.message);
    else setError(data.error);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h2>Reset Password</h2>
          <p>{step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code sent to your email'}</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        {step === 1 ? (
          <form onSubmit={requestReset}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Send Reset Code</button>
          </form>
        ) : (
          <form onSubmit={resetPassword}>
            <div className="form-group">
              <label>Reset Code</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Enter 4-digit code" maxLength={4} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Reset Password</button>
          </form>
        )}
        <div className="auth-footer mt-16">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
