import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // ─── Step 1: Send OTP ─────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate name
      if (!name || name.trim().length < 2) {
        setError('Please enter your full name (minimum 2 characters)');
        setLoading(false);
        return;
      }

      // Validate email
      if (!email) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      if (!email.endsWith('@nie.ac.in')) {
        setError('Only @nie.ac.in email addresses are allowed');
        setLoading(false);
        return;
      }

      // Send OTP request
      const response = await axios.post('/api/auth/send-otp', { name, email });

      if (response.data.success) {
        setSuccess('OTP sent to your email! Please check your inbox.');
        setStep('otp');
        setOtpTimer(600); // 10 minutes timer

        // Start countdown timer
        const timer = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setStep('email');
              setOtp('');
              setError('OTP expired. Please request a new one.');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!otp) {
        setError('OTP is required');
        setLoading(false);
        return;
      }

      if (otp.length !== 6) {
        setError('OTP must be 6 digits');
        setLoading(false);
        return;
      }

      // Verify OTP request
      const response = await axios.post('/api/auth/verify-otp', { email, otp });

      if (response.data.success) {
        const userData = response.data.data;
        // ✅ Store both user info AND JWT token
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
        // Set token in axios default headers for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        setEmail('');
        setName('');
        setOtp('');
        onLoginSuccess(userData);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'OTP verification failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Format timer display ──────────────────────────────────────────────────
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Email Step ────────────────────────────────────────────────────────────
  if (step === 'email') {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>Lost & Found</h1>
          <p className="auth-subtitle">Login with your NIE email</p>

          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
              <small className="form-hint">Enter your full name</small>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@nie.ac.in"
                required
              />
              <small className="form-hint">Only @nie.ac.in email addresses are allowed</small>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── OTP Step ──────────────────────────────────────────────────────────────
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Lost & Found</h1>
        <p className="auth-subtitle">Enter the OTP sent to {email}</p>

        <form onSubmit={handleVerifyOTP} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp">OTP (6 digits)</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              required
            />
            <small className="form-hint">
              OTP expires in: <strong>{formatTimer(otpTimer)}</strong>
            </small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-submit-btn" disabled={loading || otpTimer <= 0}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            className="back-btn"
            onClick={() => {
              setStep('email');
              setOtp('');
              setError('');
              setOtpTimer(0);
            }}
            style={{ marginTop: '10px', background: '#999' }}
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
