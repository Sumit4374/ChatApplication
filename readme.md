# ChatApplication

Lightweight chat app with a React + Vite client and a Spring Boot server (JWT auth + STOMP over SockJS websockets).

## Quick start

1. Start backend (Spring Boot, default port 8080)
   - Windows (from `server/`):
     - `mvnw.cmd spring-boot:run`
   - macOS / Linux (from `server/`):
     - `./mvnw spring-boot:run`

2. Start frontend (Vite, default dev port 5173 — proxied to backend on 8080)
   - From `client/`:
     - `npm install`
     - `npm run dev`

3. Open browser: http://localhost:5173

If the client appears already logged in, clear the stored token:
- In the browser console: `localStorage.removeItem('token')` and reload.

## Project structure (important files)

- server/
  - src/main/java/com/chat_application/server/
    - Controller/ — LoginController, ChatController (HTTP endpoints)
    - Filter/JwtFilter.java — validates JWT on requests
    - Configuration/Sockets/WebSocket.java — SockJS/STOMP config + principal handshake
    - Service/ — business logic (ChatService, JWT helpers)
    - Repository/ — JPA repos for Users and ChatMessages
  - application.properties — server config
- client/
  - src/
    - Routes/AppRoutes.jsx — route & ProtectedRoute wiring
    - Components/Auth/AuthContext.jsx — auth state, login/logout helpers
    - Services/api.js — axios API wrapper (base `/api`)
    - Services/auth.js — token helpers, subscription for auth changes
    - Services/sockets.js — SockJS + STOMP wrapper (connects to `/ws`)
    - Pages/Chats.jsx, ChatRoom.jsx — main chat UI
    - Components/Chat/UserList.jsx, MessageList.jsx — UI pieces

## API (server -> client contract)

Common endpoints (prefix `/api`):
- POST /login — body: { username, password } -> returns JWT
- POST /addUser — register a new user
- GET /getAll — list all users
- GET /partners/{username} — chat partners / presence
- GET /history/{userA}/{userB} — conversation history
- POST /send — send/store message
- GET /unread/{username} — unread counts per sender
- POST /markAsRead/{messageId} — mark message as read

WebSocket:
- Endpoint: `/ws` (SockJS + STOMP)
- Client sends to: `/app/sendMessage`
- Client subscribes to: `/user/topic/messages` (per-user queue)

Client expectations:
- JWT stored in localStorage under the key `token`.
- axios in `client/src/Services/api.js` injects header: `Authorization: Bearer <token>`.
- Sockets include the token on the handshake (header or query param); client reconnects when token changes.

## UI / UX notes implemented
- Protected routes redirect to `/login` when no token is present.
- Logout button (top-right) clears the token and navigates to `/login`.
- Unread-message badges shown in the UserList; users are sorted by unread count.
- Opening a chat triggers `/api/markAsRead/{messageId}` to mark messages as read.
- Message alignment uses the logged-in username from AuthContext to decide left/right bubbles.

## Build & package

- Backend JAR (Maven)
  - From `server/`:
    - Windows: `mvnw.cmd -DskipTests package`
    - macOS / Linux: `./mvnw -DskipTests package`
  - Result: `server/target/server-0.0.1-SNAPSHOT.jar`

- Frontend production build
  - From `client/`:
    - `npm run build`
  - Output: `client/dist`

## Tests & linting

- Backend: `mvnw.cmd test` (Windows) or `./mvnw test` (macOS / Linux) — runs JUnit tests
- Frontend: see `client/package.json` for lint/build scripts (e.g. `npm run lint`)

## Troubleshooting

- Error "Cannot read properties of null (reading 'useRef')" in React:
  - Usually caused by multiple React copies. Ensure `client/vite.config.js` has:
    - `resolve.dedupe: ['react', 'react-dom']`
    - `optimizeDeps.include` includes `'react-router-dom'`
  - Restart the Vite dev server after changes and clear Vite cache (`node_modules/.vite`).

- Token / auto-login issues:
  - Remove token in console: `localStorage.removeItem('token')` and reload.

- WebSocket handshake/auth:
  - Server expects a token during the handshake (header or query param). Client `Services/sockets.js` should send the token and re-connect on auth changes.

## Contributing notes

- Keep UI changes in `client/src/Components` and `client/src/Pages`.
- API contract changes must be mirrored in `client/src/Services/api.js` and websocket destinations in `client/src/Services/sockets.js`.
- When adding backend endpoints, update CORS, Vite proxy, or `application.properties` if ports or origins change.

## Next improvements (recommended)
- Group consecutive messages and add avatars + delivery/read ticks.
- Add server-side endpoint `/api/me` to fetch the authenticated profile (avoid decoding JWT client-side).
- Improve unread/mark-as-read batching for performance.

If anything in this README is unclear or you want step-by-step changes (UI tweaks, tests, deployment), state what you'd like fixed next.