import { useEffect, useState } from "react";
import "./App.css";
import UserList from "./Components/Chat/UserList.jsx";
import ChatRoom from "./Components/Chat/ChatRoom.jsx";
import Api from './Services/api';
import AppRoutes from './Routes/AppRoutes.jsx';

export default function App() {
	// const sampleUsers = [
	// 	{ id: 1, name: "Alice Johnson", username: "alice", email: "alice@example.com", status: "online" },
	// 	{ id: 2, name: "Bob Smith", username: "bob", email: "bob@example.com", status: "away" },
	// 	{ id: 3, name: "Carol Lee", username: "carol", email: "carol@example.com", status: "offline" },
	// ];

	// const [users, setUsers] = useState(sampleUsers);
	// const [currentUser, setCurrentUser] = useState(sampleUsers[0]);
	// const [selectedUserId, setSelectedUserId] = useState(null);
	// const roomId = "general";

	// function handleSelectUser(user) {
	// 	// set the chat "as" that user (simple local demo)
	// 	setCurrentUser(user);
	// 	setSelectedUserId(user.id);
	// }

	// // Optionally load users from backend if available
	// useEffect(() => {
	// 	(async () => {
	// 		try {
	// 			const list = await Api.getUsers();
	// 			if (Array.isArray(list) && list.length) {
	// 				const mapped = list.map((u, i) => ({ id: u.id ?? i + 1, name: u.username, username: u.username, email: u.email }));
	// 				setUsers(mapped);
	// 				setCurrentUser(mapped[0]);
	// 			}
	// 		} catch {}
	// 	})();
	// }, []);

	// const layoutStyles = {
	// 	height: "100vh",
	// 	display: "flex",
	// 	gap: 0,
	// 	background: "#f5f7fa",
	// };

	// const sidebarStyles = {
	// 	width: 280,
	// 	borderRight: "1px solid #eee",
	// 	display: "flex",
	// 	flexDirection: "column",
	// };

	// const mainStyles = {
	// 	flex: 1,
	// 	display: "flex",
	// 	flexDirection: "column",
	// 	padding: 16,
	// };

	return <AppRoutes />;
	// return (
	// 	<div style={layoutStyles}>
	// 		<aside style={sidebarStyles}>
	// 			<div style={{ padding: 12, borderBottom: "1px solid #f0f0f0", fontWeight: 700 }}>People</div>
	// 			<UserList
	// 				users={users}
	// 				currentUserId={currentUser?.id}
	// 				selectedUserId={selectedUserId}
	// 				onSelect={handleSelectUser}
	// 			/>
	// 		</aside>

	// 		<main style={mainStyles}>
	// 			<div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
	// 				<h2 style={{ margin: 0 }}>Chat — {roomId}</h2>
	// 				<div style={{ fontSize: 13, color: "#555" }}>Signed in as <strong>{currentUser?.name || currentUser?.username}</strong></div>
	// 			</div>

	// 			<div style={{ flex: 1, display: "flex", overflow: "hidden", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
	// 				<ChatRoom username={currentUser?.username || "guest"} roomId={roomId} peer={users.find(u => u.id !== currentUser?.id)?.username || null} />
	// 			</div>
	// 		</main>
	// 	</div>
	// );
}
