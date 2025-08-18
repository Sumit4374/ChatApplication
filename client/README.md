# Client-Server wiring

This client is configured to connect to the Spring Boot backend in `../server`.

- HTTP API base: `/api` (Vite dev server proxies to `http://localhost:8080`)
- Auth endpoints:
  - POST `/api/login` with body `{ username, password }` -> returns JWT string
  - POST `/api/addUser` with body `{ username, email, password }`
- Chat endpoints:
  - GET `/api/history/{user1}/{user2}` -> list of messages
  - POST `/api/send` -> send message over HTTP (STOMP is preferred)
  - GET `/api/partners/{username}` -> list of chat partners

WebSocket (STOMP over SockJS):
- Endpoint: `http://localhost:8080/ws`
- Subscriptions: `/user/topic/messages` (per-user queue)
- Sends:
  - `/app/sendMessage` with body `{ sender, receiver, message }`
  - `/app/markAsDelivered` with body `"receiverUsername"`

Configure environment (optional):
- `VITE_API_BASE_URL` to override HTTP base (defaults to `/api`)
- `VITE_WS_URL` to override WS endpoint (defaults to `http://localhost:8080/ws`)

Run locally:
- Start backend (Spring) on port 8080
- Start client: `npm run dev`# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
