import axios from 'axios';

// Use Vite dev proxy: all client calls hit /api and get proxied to Spring at :8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: { 'Content-Type': 'application/json' },
        });

        // Attach token from localStorage automatically
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => Promise.reject(error));

        // Normalize errors
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                const payload = error.response?.data || { message: error.message };
                return Promise.reject(payload);
            }
        );
    }

    // Generic request helper
    async request(endpoint, options = {}) {
        const { method = 'get', data, params, headers, ...rest } = options;

        try {
            const response = await this.client.request({
                url: endpoint,
                method,
                data,
                params,
                headers,
                ...rest,
            });
            return response.data;
        } catch (err) {
            // rethrow normalized error
            throw err;
        }
    }

    // Authentication
    async login(credentials) {
        // Server expects { username, password }
        const payload = {
            username: credentials.username ?? credentials.email ?? credentials.usernameOrEmail,
            password: credentials.password,
        };
        const token = await this.request('/login', {
            method: 'post',
            data: payload,
        });
        // Server returns raw token string
        if (typeof token === 'string' && token.length > 0) {
            localStorage.setItem('token', token);
            return { token };
        }
        // Fallback if backend later wraps
        if (token?.token) {
            localStorage.setItem('token', token.token);
            return token;
        }
        return { token: null };
    }

    async register(userData) {
        // Server expects Users { username, email, password }
        const payload = {
            username: userData.username ?? userData.name ?? userData.email?.split('@')[0],
            email: userData.email,
            password: userData.password,
        };
        const user = await this.request('/addUser', {
            method: 'post',
            data: payload,
        });
        // No token returned on register by backend; user must login
        return { user };
    }

    async logout() {
        // No logout endpoint in backend; just clear token
        localStorage.removeItem('token');
    }

    setAuthToken(token) {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    // Messages
    async getMessagesBetween(user1, user2) {
        return this.request(`/history/${encodeURIComponent(user1)}/${encodeURIComponent(user2)}`);
    }

    async sendMessage(messageData) {
        // HTTP fallback; primary is STOMP
        return this.request('/send', {
            method: 'post',
            data: messageData,
        });
    }

    async getUnread(username) {
        if (!username) return [];
        return this.request(`/unread/${encodeURIComponent(username)}`);
    }

    async markAsRead(messageId) {
        if (!messageId && messageId !== 0) return;
        return this.request(`/markAsRead/${encodeURIComponent(messageId)}`, { method: 'post' });
    }

    // Users
    async getUsers() {
        return this.request('/getAll');
    }

    async getUserProfile(userId) {
        // Not implemented server-side; return from getAll filter or JWT in future
        return null;
    }

    // Chats
    async getChats(username) {
        if (!username) return [];
        return this.request(`/partners/${encodeURIComponent(username)}`);
    }

    async createChat() {
        // Not implemented in backend
        throw new Error('createChat not supported by backend');
    }
}

export default new ApiService();