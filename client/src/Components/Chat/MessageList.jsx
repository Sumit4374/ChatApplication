import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export default function MessageList({ messages = [], currentUser = "Guest", onMessageClick, className, style }) {
	const listRef = useRef(null);

	useEffect(() => {
		const el = listRef.current;
		if (!el) return;
		// scroll to bottom smoothly if content increases
		el.scrollTop = el.scrollHeight;
	}, [messages.length]);

	function renderMessage(m, idx) {
		const mine = m.username === currentUser;
		const key = m.id ?? (m.timestamp ? `${m.timestamp}-${idx}` : idx);
		const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : "";

		return (
			<div
				key={key}
				onClick={() => onMessageClick && onMessageClick(m)}
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: mine ? "flex-end" : "flex-start",
					marginBottom: 12,
				}}
			>
				{!mine && (
					<div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#333" }}>
						{m.username}
					</div>
				)}
				<div
					style={{
						maxWidth: "78%",
						background: mine ? "#DCF8C6" : "#F1F0F0",
						padding: "8px 12px",
						borderRadius: 12,
						boxShadow: "0 1px 1px rgba(0,0,0,0.04)",
						fontSize: 14,
						whiteSpace: "pre-wrap",
					}}
				>
					{m.text}
					<div style={{ fontSize: 11, color: "#666", marginTop: 6, textAlign: mine ? "right" : "left" }}>
						{time}
					</div>
				</div>
			</div>
		);
	}

	const containerStyles = {
		display: "flex",
		flexDirection: "column",
		overflowY: "auto",
		padding: 16,
		background: "#fff",
		...style,
	};

	return (
		<div ref={listRef} className={className} style={containerStyles}>
			{messages.map((m, i) => renderMessage(m, i))}
		</div>
	);
}

MessageList.propTypes = {
	messages: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			username: PropTypes.string,
			text: PropTypes.string,
			timestamp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		})
	),
	currentUser: PropTypes.string,
	onMessageClick: PropTypes.func,
	className: PropTypes.string,
	style: PropTypes.object,
};