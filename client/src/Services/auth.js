import Api from './api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

let listeners = new Set();

function notify() {
    const payload = { authenticated: isAuthenticated(), user: getStoredUser() };
    listeners.forEach((cb) => {
        try { cb(payload); } catch (e) { /* ignore listener errors */ }
    });
}

function storeToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        Api.setAuthToken(token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
        Api.setAuthToken(null);
    }
}

function storeUser(user) {
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(USER_KEY);
    }
}

function getStoredUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
}

const AuthService = {
    async login(credentials) {
        const result = await Api.login(credentials);
        if (result?.token) storeToken(result.token);
        if (result?.user) storeUser(result.user);
        notify();
        return result;
    },

    async register(userData) {
        const result = await Api.register(userData);
        if (result?.token) storeToken(result.token);
        if (result?.user) storeUser(result.user);
        notify();
        return result;
    },

    async logout() {
        try {
            await Api.logout();
        } finally {
            storeToken(null);
            storeUser(null);
            notify();
        }
    },

    async fetchProfile() {
        const user = getStoredUser();
        if (!user?.id) return null;
        return Api.getUserProfile(user.id);
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    getUser() {
        return getStoredUser();
    },

    isAuthenticated,

    // Subscribe to auth changes: callback receives { authenticated, user }
    subscribe(callback) {
        listeners.add(callback);
        // immediately call with current state
        try { callback({ authenticated: isAuthenticated(), user: getStoredUser() }); } catch {}
        return () => listeners.delete(callback);
    },

    // Utility to force-set token/user (useful for testing)
    setAuth({ token, user }) {
        storeToken(token || null);
        storeUser(user || null);
        notify();
    }
};

export default AuthService;
