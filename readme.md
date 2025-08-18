# ChatApplication

Lightweight chat app with a React + Vite client and Spring Boot server (JWT auth + STOMP over SockJS websockets).

## Quick start (Windows)

1. Start backend (Spring Boot, port 8080)
   - From `server/`:
     - mvnw.cmd spring-boot:run

2. Start frontend (Vite, port 5173 -> proxied to 8080)
   - From `client/`:
     - npm install
     - npm run dev

3. Open browser: http://localhost:5173

If the client appears already logged in, clear stored token:
- In browser console: `localStorage.removeItem('token')`

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
- POST /addUser — register new user
- GET /getAll — list all users (for user list)
- GET /partners/{username} — chat partners / presence
- GET /history/{userA}/{userB} — conversation history
- POST /send — send/store message
- GET /unread/{username} — unread counts per sender
- POST /markAsRead/{messageId} — mark message as read

WebSocket:
- Endpoint: /ws (SockJS + STOMP)
- Client sends to: `/app/sendMessage`
- Subscribe to: `/user/topic/messages` (per-user queue)

Client expectations:
- JWT stored in localStorage under `token`
- axios in `Services/api.js` injects Authorization: `Bearer <token>`
- Sockets include token on handshake and reconnect when token changes

## UI/UX notes implemented
- Protected routes redirect to `/login` when no token
- Logout button in top-right (clears token and navigates to /login)
- Unread-message badges shown on UserList and users are sorted by unread count
- Opening a chat marks unread messages as read via `/api/markAsRead/{messageId}`
- Message alignment uses the logged-in username from AuthContext to decide left/right bubbles

## Build & package

- Backend JAR (Maven)
  - From `server/`:
    - mvnw.cmd -DskipTests package
  - Result: `server/target/server-0.0.1-SNAPSHOT.jar`

- Frontend production build
  - From `client/`:
    - npm run build
  - Output: `client/dist`

## Tests & linting

- Backend: `mvnw.cmd test` (runs JUnit tests)
- Frontend: see `client/package.json` for lint/build scripts (run `npm run lint` if configured)

## Troubleshooting

- Error "Cannot read properties of null (reading 'useRef')" in React:
  - Usually caused by multiple React copies. Ensure `client/vite.config.js` has:
    - resolve.dedupe: ['react', 'react-dom']
    - optimizeDeps.include includes 'react-router-dom'
  - Restart Vite dev server after changes and clear Vite cache (`node_modules/.vite`).

- Token / auto-login issues:
  - Remove token in console: `localStorage.removeItem('token')` then reload.

- WebSocket handshake/auth:
  - Server expects token during handshake (header or query param). Client `sockets.js` re-connects when auth changes.

## Contributing notes

- Keep UI changes in `client/src/Components` and `client/src/Pages`.
- API contract changes must be mirrored in `client/src/Services/api.js` and websocket destinations in `client/src/Services/sockets.js`.
- When adding backend endpoints, update CORS/Vite proxy or `application.properties` if changing ports.

## Next improvements (recommended)
- Group consecutive messages and add avatars + delivery/read ticks.
- Add server-side endpoint to fetch "me" profile (`/api/me`) to avoid decoding JWT client-side.
- Improve unread/mark-as-read batching for performance.

If anything in this README is unclear or you'd like step-by-step changes (UI tweaks, tests, deployment), tell me which