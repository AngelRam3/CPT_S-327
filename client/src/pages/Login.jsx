import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: '', password: '', totpCode: '' });
  const [isTwoFARequired, setIsTwoFARequired] = useState(true);
  const [error, setError] = useState(null);

  const loginUser = async (e) => {
    e.preventDefault();
    const { email, password, totpCode } = data;
    setError(null);
    try {
      const { data: responseData } = await axios.post('/login', {
        email,
        password,
        totpCode,
      });

      if (responseData.message) {
        setData({});
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error;

        if (errorMessage === 'User not found') {
          toast.error('No account found with that email');
        } else if (errorMessage === 'Invalid password') {
          toast.error('Incorrect password');
        } else if (errorMessage === '2FA code required') {
          toast.error('Please enter your 2FA code');
        } else if (errorMessage === 'Invalid 2FA code') {
          toast.error('Incorrect 2FA code');
        } else if (errorMessage === 'Server error during login') {
          toast.error('An unexpected error occurred during login');
        } else {
          toast.error('An error occurred during login. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <h2>Login to your account</h2>
      <h3>Don't have an account? <a href='/register'>Register</a></h3>
      <form onSubmit={loginUser}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          required
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          required
        />
        {isTwoFARequired && (
          <>
            <label>TOTP Code</label>
            <input
              type="text"
              placeholder="Enter your TOTP code"
              value={data.totpCode}
              onChange={(e) => setData({ ...data, totpCode: e.target.value })}
              required
            />
          </>
        )}
        <button type="submit">{isTwoFARequired ? 'Login' : 'Login'}</button>
      </form>
    </div>
  );
}