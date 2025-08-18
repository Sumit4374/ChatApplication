import React, { createContext, useContext, useState, useEffect } from 'react';
import Api from '../../Services/api';
import AuthService from '../../Services/auth';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Check if user is authenticated on app load
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            // Best effort: decode username from JWT (optional)
            try {
                const base64 = storedToken.split('.')[1];
                const payload = JSON.parse(atob(base64));
                setUser({ username: payload?.sub });
            } catch {}
        }
        setLoading(false);
    }, []);

    const setCtxToken = (tok) => {
        setToken(tok);
        if (!tok) {
            setUser(null);
            AuthService.setAuth({ token: null, user: null });
            return;
        }
        try {
            const payload = JSON.parse(atob(tok.split('.')[1]));
            const u = { username: payload?.sub };
            setUser(u);
            AuthService.setAuth({ token: tok, user: u });
        } catch {
            AuthService.setAuth({ token: tok, user: null });
        }
    };

    const login = async (credentials) => {
        try {
            const result = await Api.login(credentials);
            const tok = result?.token;
            if (tok) {
                setCtxToken(tok);
                return { success: true };
            }
            return { success: false, error: 'Invalid credentials' };
        } catch (error) {
            return { success: false, error: error?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            await Api.register(userData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        Api.setAuthToken(null);
        AuthService.setAuth({ token: null, user: null });
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        setToken: setCtxToken,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};