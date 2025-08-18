import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../../Services/auth';

export default function PrivateRoute({ children, redirectTo = '/login' }) {
    const [authed, setAuthed] = useState(AuthService.isAuthenticated());
    const [checked, setChecked] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const unsub = AuthService.subscribe(({ authenticated }) => {
            setAuthed(!!authenticated);
            setChecked(true);
        });
        return unsub;
    }, []);

    if (!checked) return null; // or a spinner component

    if (!authed) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    return children;
}