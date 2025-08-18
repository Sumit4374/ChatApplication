import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await login(formData);
            if (res?.success) navigate('/chats', { replace: true });
            else setError(res?.error || 'Invalid username or password');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-xl p-8">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">CA</div>
                    <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
                    <p className="text-slate-600 text-sm">Sign in to continue to ChatApplication</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
                        <input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your username"
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your password"
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-semibold shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    >
                        {isLoading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                    Don’t have an account?
                    <Link to="/register" className="ml-1 font-semibold text-indigo-600 hover:underline">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;