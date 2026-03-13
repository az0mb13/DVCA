import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', referralCode: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await register(form);
      setSuccess(`Account created! Your API token: ${data.apiToken}`);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page" style={{ maxWidth: 480 }}>
      <div className="auth-card">
        <div className="auth-logo">
          <h2>Create Account</h2>
          <p>Join VulnCorp to start shopping</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" value={form.firstName} onChange={update('firstName')} placeholder="John" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" value={form.lastName} onChange={update('lastName')} placeholder="Doe" />
            </div>
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={form.username} onChange={update('username')} placeholder="johndoe" required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={update('password')} placeholder="Choose a password" required />
            {/* VULN: V2.1 - No password strength indicator or requirements */}
          </div>
          <div className="form-group">
            <label>Referral Code <span className="text-muted">(optional)</span></label>
            <input type="text" value={form.referralCode} onChange={update('referralCode')} placeholder="Enter referral code" />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Create Account</button>
        </form>
        <div className="auth-divider">or</div>
        <div className="auth-footer">
          <Link to="/login">Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  );
}
