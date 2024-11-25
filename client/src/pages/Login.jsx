import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: '',
        password: '',
        totpCode: '', // Add a state for the TOTP code
    });
    const [isTwoFARequired, setIsTwoFARequired] = useState(false); // Flag to show TOTP input

    const loginUser = async (e) => {
        e.preventDefault();
        const { email, password, totpCode } = data;
        try {
            const { data: responseData } = await axios.post('/login', {
                email,
                password,
                totpCode: isTwoFARequired ? totpCode : undefined, // Include TOTP only if required
            });

            if (responseData.error) {
                toast.error(responseData.error);
                if (responseData.error === 'Invalid TOTP code') {
                    setIsTwoFARequired(true); // If 2FA is required, show TOTP input
                }
            } else {
                setData({});
                navigate('/dashboard');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Welcome to the Login Page</h1>
            <h2>Login here</h2>
            <h3>Don't have an account? <a href='/register'>Register</a></h3>
            <form onSubmit={loginUser}>
                <label>Email</label>
                <input
                    type="email"
                    placeholder='Enter email...'
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                />
                <label>Password</label>
                <input
                    type="password"
                    placeholder='Enter password...'
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                />
                {isTwoFARequired && (
                    <>
                        <label>TOTP Code</label>
                        <input
                            type="text"
                            placeholder="Enter TOTP code"
                            value={data.totpCode}
                            onChange={(e) => setData({ ...data, totpCode: e.target.value })}
                        />
                    </>
                )}
                <button type='submit'>{isTwoFARequired ? 'Verify' : 'Login'}</button>
            </form>
        </div>
    );
}
