import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Use relative path so Vite dev proxy forwards to backend and avoids CORS
const WS_URL = import.meta.env.VITE_WS_URL || '/ws';
const TOKEN_KEY = 'token';

class StompService {
    constructor() {
        this.client = null;
        this.connected = false;
    // dest -> Set<callback>
    this.subscriptions = new Map();
    // dest -> STOMP subscription handle
    this.activeSubs = new Map();
    }

    connect() {
        if (this.connected) return;
        const token = localStorage.getItem(TOKEN_KEY);

        const socketFactory = () => {
            // pass token via query for handshake handler fallback
            const url = token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;
            return new SockJS(url);
        };

        this.client = new Client({
            webSocketFactory: socketFactory,
            reconnectDelay: 2000,
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            debug: () => {},
        });

        this.client.onConnect = () => {
            this.connected = true;
            // (Re)subscribe all tracked destinations on fresh connection
            for (const [dest, set] of this.subscriptions.entries()) {
                if (!this.activeSubs.has(dest)) {
                    const sub = this.client.subscribe(dest, (msg) => {
                        set.forEach((cb) => {
                            try { cb(msg); } catch {}
                        });
                    });
                    this.activeSubs.set(dest, sub);
                }
            }
        };

        this.client.onStompError = (frame) => {
            console.error('Broker error', frame.headers['message'], frame.body);
        };

        this.client.onWebSocketClose = () => {
            this.connected = false;
        };

        this.client.activate();
    }

    disconnect() {
        if (!this.client) return;
        try { this.client.deactivate(); } catch {}
        this.client = null;
        this.connected = false;
        this.subscriptions.clear();
        // best-effort cleanup
        for (const sub of this.activeSubs.values()) {
            try { sub.unsubscribe(); } catch {}
        }
        this.activeSubs.clear();
    }

    setAuthToken(token) {
        // reconnect with new token
        if (this.client) this.disconnect();
        if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY);
        this.connect();
    }

    // Subscribe to a user queue: /user/topic/messages
    subscribeToUserMessages(callback) {
        const dest = '/user/topic/messages';
        return this.subscribe(dest, (msg) => {
            try { callback(JSON.parse(msg.body)); } catch { callback(msg.body); }
        });
    }

    subscribe(destination, callback) {
        if (!this.client || !this.connected) this.connect();
        if (!this.subscriptions.has(destination)) this.subscriptions.set(destination, new Set());
        const set = this.subscriptions.get(destination);
        set.add(callback);

        const ensure = () => {
            if (this.client && this.connected && !this.activeSubs.has(destination)) {
                const sub = this.client.subscribe(destination, (msg) => {
                    set.forEach((cb) => {
                        try { cb(msg); } catch {}
                    });
                });
                this.activeSubs.set(destination, sub);
            }
        };
        ensure();

        // return unsubscribe
        return () => {
            set.delete(callback);
            if (set.size === 0) {
                // no more listeners for this destination
                const sub = this.activeSubs.get(destination);
                if (sub) {
                    try { sub.unsubscribe(); } catch {}
                }
                this.activeSubs.delete(destination);
                this.subscriptions.delete(destination);
            }
        };
    }

    // Send via app prefix
    sendApp(destination, payload) {
        if (!this.client || !this.connected) this.connect();
        if (!this.client || !this.connected) return;
        this.client.publish({ destination: `/app${destination}`, body: JSON.stringify(payload) });
    }

    // Helpers for this backend
    sendMessage({ sender, receiver, message }) {
        return this.sendApp('/sendMessage', { sender, receiver, message });
    }

    markAsDelivered(receiver) {
        return this.sendApp('/markAsDelivered', receiver);
    }
}

export default new StompService();