import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";

export default function UserList({
	users = [],
	currentUserId = null,
	selectedUserId = null,
	onSelect,
	className,
	style = {},
	showSearch = true,
	showPresence = true,
	unreadCounts = {},
}) {
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		const q = (query || "").trim().toLowerCase();
		if (!q) return users;
		return users.filter((u) => {
			const name = (u.name || u.username || "").toLowerCase();
			const email = (u.email || "").toLowerCase();
			return name.includes(q) || email.includes(q);
		});
	}, [users, query]);

	function handleKeyDown(e, user) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onSelect && onSelect(user);
		}
	}

	const itemStyles = (isSelected, isMe) => `flex gap-3 items-center p-2 rounded-lg cursor-pointer outline-none border ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white hover:bg-slate-50 border-transparent'} ${isMe ? 'ring-1 ring-emerald-200' : ''}`;

	const presenceDot = (status) => {
		const color = status === "online" ? "bg-emerald-500" : status === "away" ? "bg-amber-400" : "bg-slate-300";
		return `w-2.5 h-2.5 rounded-full ${color} ml-1 ring-2 ring-white`;
	};

	return (
		<div className={className} style={style}>
			{showSearch && (
				<div className="p-2 border-b border-slate-200">
					<input
						placeholder="Search people…"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>
			)}

			<div className="flex h-[calc(100%-44px)] flex-col gap-2 overflow-y-auto p-2" role="list">
				{filtered.map((u) => {
					const isMe = u.id === currentUserId;
					const isSelected = u.id === selectedUserId;
					const initials =
						(u.name && u.name.split(" ").map((s) => s[0]).slice(0, 2).join("")) ||
						(u.username && u.username.slice(0, 2).toUpperCase()) ||
						"?";
					const unread = unreadCounts[u.username] || 0;

					return (
						<div
							key={u.id}
							role="listitem"
							tabIndex={0}
							onClick={() => onSelect && onSelect(u)}
							onKeyDown={(e) => handleKeyDown(e, u)}
							className={itemStyles(isSelected, isMe)}
							aria-current={isSelected || undefined}
							aria-label={`User ${u.name || u.username}`}
						>
							<div className="flex items-center gap-3 flex-1 min-w-0">
								<div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
									{u.avatarUrl ? (
										<img src={u.avatarUrl} alt={u.name || u.username} className="w-full h-full rounded-full" />
									) : (
										initials
									)}
								</div>

								<div className="flex flex-col min-w-0">
									<div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
										<span className="truncate">{u.name || u.username}</span>
										{showPresence && u.status && <span className={presenceDot(u.status)} aria-hidden="true" />}
									</div>
									<div className="text-xs text-slate-600 truncate">{u.email || (u.username && `@${u.username}`) || ""}</div>
								</div>
							</div>

							{unread > 0 && (
								<div className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-indigo-600 px-2 py-1 text-xs font-bold text-white">
									{unread}
								</div>
							)}

							{isMe ? <div className="text-[10px] font-medium text-emerald-700 ml-2">You</div> : null}
						</div>
					);
				})}
				{filtered.length === 0 && <div className="p-3 text-slate-500">No users found</div>}
			</div>
		</div>
	);
}

UserList.propTypes = {
	users: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			name: PropTypes.string,
			username: PropTypes.string,
			email: PropTypes.string,
			avatarUrl: PropTypes.string,
			status: PropTypes.oneOf(["online", "away", "offline"]),
		})
	),
	currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	selectedUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onSelect: PropTypes.func,
	className: PropTypes.string,
	style: PropTypes.object,
	showSearch: PropTypes.bool,
	showPresence: PropTypes.bool,
	unreadCounts: PropTypes.object,
};