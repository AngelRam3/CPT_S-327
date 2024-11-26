import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({ name: '', email: '', password: '' });
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  const registerUser = async (e) => {
    e.preventDefault();
    try {
      const { name, email, password } = data;
      const { data: response } = await axios.post('/register', { name, email, password });

      if (response.error) {
        toast.error(response.error);
      } else {
        setData({ name: '', email: '', password: '' });
        setQrCodeUrl(response.qrCodeUrl);
        toast.success('Registration successful. Scan the QR code to set up 2FA.');

        setTimeout(() => navigate('/login'), 25000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <h2>Register for an account</h2>
      <h3>Already have an account? <a href='/login'>Login</a></h3>
      <form onSubmit={registerUser}>
        <label>Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          required
        />
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
        <button type="submit">Register</button>
      </form>
      {qrCodeUrl && (
        <div>
          <h3>Scan this QR Code with Google Authenticator:</h3>
          <img src={qrCodeUrl} alt="QR Code for 2FA" />
          <h3>You will be redirected to the login page in 25 seconds.</h3>
        </div>
      )}
    </div>
  );
}
