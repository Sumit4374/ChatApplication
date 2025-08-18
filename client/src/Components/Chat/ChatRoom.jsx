import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import SocketService from '../../Services/sockets';
import Api from '../../Services/api';

export default function ChatRoom({ username = "Guest", roomId = "general", peer = null, onRead }) {
	const [messages, setMessages] = useState([]);
	const [text, setText] = useState("");
	const [connected, setConnected] = useState(false);
	const [typingUser, setTypingUser] = useState(null);

	const listRef = useRef(null);
	const typingTimeoutRef = useRef(null);

	// Load history for current peer
	useEffect(() => {
		(async () => {
			if (!username || !peer) return;
			try {
				const history = await Api.getMessagesBetween(username, peer);
				if (Array.isArray(history)) {
					setMessages(history.map(h => ({
						id: h.id,
						username: h.sender,
						text: h.message,
						timestamp: Date.parse(h.timestamp) || Date.now(),
					})));
				}
			} catch {}
		})();
	}, [username, peer]);

	// Connect to STOMP user queue
	useEffect(() => {
		SocketService.connect();
		setConnected(true);
		const unsub = SocketService.subscribeToUserMessages(async (msg) => {
			// msg is ChatMessages from backend
			setMessages((m) => [...m, {
				id: msg.id,
				username: msg.sender,
				text: msg.message,
				timestamp: Date.parse(msg.timestamp) || Date.now(),
			}]);
			// If message is from current peer to me, mark as read immediately
			try {
				if (msg.sender === peer && msg.receiver === username) {
					await Api.markAsRead(msg.id);
					onRead && onRead();
				}
			} catch {}
		});
		return () => {
			clearTimeout(typingTimeoutRef.current);
			if (unsub) unsub();
		};
	}, [username, peer, onRead]);

	// auto-scroll
	useEffect(() => {
		if (!listRef.current) return;
		listRef.current.scrollTop = listRef.current.scrollHeight;
	}, [messages]);

	function sendMessage() {
		const trimmed = text.trim();
		if (!trimmed) return;
		const msg = {
			type: "message",
			roomId,
			username,
			text: trimmed,
			timestamp: Date.now(),
		};

		if (peer) {
			SocketService.sendMessage({ sender: username, receiver: peer, message: trimmed });
		}
		setText("");
	}

	function handleInputChange(e) {
		setText(e.target.value);
	// show typing locally for demo
	setTypingUser(username);
	clearTimeout(typingTimeoutRef.current);
	typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 800);
	}

	function handleKeyDown(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
				<div className="text-sm font-semibold text-slate-800">{roomId} — <span className="font-normal">{username}</span></div>
				<div className={`text-xs ${connected ? 'text-emerald-600' : 'text-rose-600'}`}>{connected ? 'Connected' : 'Disconnected'}</div>
			</div>

			<div ref={listRef} className="flex-1 overflow-y-auto bg-white p-4 space-y-3">
				{messages.map((m, idx) => {
					const mine = m.username === username;
					return (
						<div key={m.timestamp ? `${m.timestamp}-${idx}` : idx} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
							{!mine && <div className="mb-1 text-xs font-semibold text-slate-700">{m.username}</div>}
							<div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow ${mine ? 'bg-emerald-50' : 'bg-slate-100'}`}>
								<div>{m.text}</div>
								<div className={`mt-1 text-[10px] text-slate-500 ${mine ? 'text-right' : 'text-left'}`}>
									{new Date(m.timestamp || Date.now()).toLocaleTimeString()}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className="border-t border-slate-200 bg-slate-50 p-3">
				<div className="flex items-center gap-2">
					<textarea
						value={text}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						placeholder="Type a message — press Enter to send"
						className="min-h-10 max-h-40 flex-1 resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<button onClick={sendMessage} className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">
						Send
					</button>
				</div>
				<div className="mt-1 text-xs text-slate-500">
					{typingUser && typingUser !== username ? (
						<span className="italic">{typingUser} is typing…</span>
					) : (
						<span>Connected: {connected ? 'yes' : 'no'}</span>
					)}
				</div>
			</div>
		</div>
	);
}

ChatRoom.propTypes = {
	username: PropTypes.string,
	roomId: PropTypes.string,
	wsUrl: PropTypes.string,
	peer: PropTypes.string,
	onRead: PropTypes.func,
};