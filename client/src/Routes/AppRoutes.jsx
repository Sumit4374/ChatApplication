import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthService from '../Services/auth';
import SocketService from '../Services/sockets';

// Lazy page imports (create these pages under src/Pages if missing)
const LoginPage = lazy(() => import('../Pages/Login'));
const RegisterPage = lazy(() => import('../Pages/Register'));
const ChatsPage = lazy(() => import('../Pages/Chats'));
const ChatRoomPage = lazy(() => import('../Pages/ChatRoom'));
const ProfilePage = lazy(() => import('../Pages/Profile'));
const NotFoundPage = lazy(() => import('../Pages/NotFound'));

// Simple protected route that reacts to auth changes
function ProtectedRoute({ children }) {
    const [authed, setAuthed] = useState(AuthService.isAuthenticated());

    useEffect(() => {
        const unsub = AuthService.subscribe(({ authenticated }) => setAuthed(!!authenticated));
        return unsub;
    }, []);

    if (!authed) return <Navigate to="/login" replace />;
    return children;
}

function HomeRedirect() {
    const [authed, setAuthed] = useState(AuthService.isAuthenticated());
    useEffect(() => AuthService.subscribe(({ authenticated }) => setAuthed(!!authenticated)), []);
    return <Navigate to={authed ? '/chats' : '/login'} replace />;
}

function LogoutCorner() {
    const navigate = useNavigate();
    const [authed, setAuthed] = useState(AuthService.isAuthenticated());
    useEffect(() => AuthService.subscribe(({ authenticated }) => setAuthed(!!authenticated)), []);
    if (!authed) return null;
    const onLogout = async () => {
        await AuthService.logout();
        navigate('/login', { replace: true });
    };
    return (
        <div className="fixed right-3 top-3 z-[9999]">
            <button onClick={onLogout} className="rounded-full bg-slate-800/90 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Logout
            </button>
        </div>
    );
}

// Root routes
export default function AppRoutes() {
    useEffect(() => {
        // ensure socket picks up stored token when app loads
        SocketService.connect();
        // keep socket auth in sync when token changes
        const unsub = AuthService.subscribe(({ authenticated }) => {
            SocketService.setAuthToken(AuthService.getToken());
        });
        return unsub;
    }, []);

    return (
        <BrowserRouter>
            <LogoutCorner />
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/chats"
                        element={
                            <ProtectedRoute>
                                <ChatsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chats/:chatId"
                        element={
                            <ProtectedRoute>
                                <ChatRoomPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}