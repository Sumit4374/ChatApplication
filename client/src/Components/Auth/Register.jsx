import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../../Services/auth';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
        setFieldErrors((fe) => ({ ...fe, [name]: null }));
        setError(null);
    }

    function validate() {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.email.trim()) errs.email = 'Email is required';
        if (!form.password) errs.password = 'Password is required';
        if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                username: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
            };
            await AuthService.register(payload);
            // Backend does not return token on register; navigate to login
            navigate('/login', { replace: true });
        } catch (err) {
            // err may be normalized by Api service
            if (err?.errors && typeof err.errors === 'object') {
                setFieldErrors(err.errors);
            } else {
                setError(err?.message || 'Registration failed');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="auth-page register-page">
            <h2>Create account</h2>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        disabled={submitting}
                        autoComplete="name"
                    />
                    {fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={submitting}
                        autoComplete="email"
                    />
                    {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        disabled={submitting}
                        autoComplete="new-password"
                    />
                    {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirm">Confirm Password</label>
                    <input
                        id="confirm"
                        name="confirm"
                        type="password"
                        value={form.confirm}
                        onChange={handleChange}
                        disabled={submitting}
                        autoComplete="new-password"
                    />
                    {fieldErrors.confirm && <small className="field-error">{fieldErrors.confirm}</small>}
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Creating...' : 'Register'}
                    </button>
                </div>
            </form>

            <p className="auth-footer">
                Already have an account? <Link to="/login">Sign in</Link>
            </p>
        </div>
    );
}