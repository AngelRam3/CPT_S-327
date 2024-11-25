import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axios.get('/profile');
                setUser(data);
            } catch (error) {
                console.error('Error fetching user data', error);
            }
        };
        if (!user) fetchUser();
    }, [user]);

    const logout = async () => {
        try {
            await axios.post('/logout');
            setUser(null);
        } catch (error) {
            console.error('Error logging out', error);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
}
