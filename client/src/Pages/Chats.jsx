import React, { useEffect, useMemo, useState } from 'react';
import Api from '../Services/api';
import UserList from '../Components/Chat/UserList.jsx';
import ChatRoom from '../Components/Chat/ChatRoom.jsx';
import { useAuth } from '../Components/Auth/AuthContext.jsx';

export default function ChatsPage() {
  const { user } = useAuth();
  const currentUsername = user?.username || null;

  const [users, setUsers] = useState([]);
  const [peer, setPeer] = useState(null);
  const [unreadMap, setUnreadMap] = useState({}); // username -> count

  async function refreshUnread() {
    if (!currentUsername) return;
    try {
      const unread = await Api.getUnread(currentUsername);
      // unread is array of messages; count per sender
      const counts = {};
      (unread || []).forEach(m => {
        const from = m.sender;
        counts[from] = (counts[from] || 0) + 1;
      });
      setUnreadMap(counts);
    } catch {}
  }

  useEffect(() => {
    (async () => {
      try {
        const list = await Api.getUsers();
        const mapped = (list || []).map((u, i) => ({ id: u.id ?? i + 1, name: u.username, username: u.username, email: u.email }));
        setUsers(mapped);
        const defaultPeer = mapped.find(u => u.username !== currentUsername) || mapped[0];
        setPeer(defaultPeer);
      } catch {}
    })();
  }, [currentUsername]);

  useEffect(() => {
    refreshUnread();
    const id = setInterval(refreshUnread, 5000); // simple poll; could also update on socket receive
    return () => clearInterval(id);
  }, [currentUsername]);

  // When opening a chat with a peer, clear unread by marking each unread message as read
  useEffect(() => {
    (async () => {
      if (!currentUsername || !peer?.username) return;
      try {
        const unread = await Api.getUnread(currentUsername);
        const toMark = (unread || []).filter(m => m.sender === peer.username);
        await Promise.allSettled(toMark.map(m => Api.markAsRead(m.id)));
        refreshUnread();
      } catch {}
    })();
  }, [peer?.username, currentUsername]);

  const sortedUsers = useMemo(() => {
    const clone = [...users];
    clone.sort((a, b) => (unreadMap[b.username] || 0) - (unreadMap[a.username] || 0));
    return clone;
  }, [users, unreadMap]);

  const meDisplay = useMemo(() => currentUsername || 'You', [currentUsername]);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <div className="mx-auto h-full max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Chat</h1>
          <div className="text-sm text-slate-600">Signed in as <strong>{meDisplay}</strong></div>
        </div>

        <div className="grid h-[calc(100vh-120px)] grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
          <aside className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">People</div>
            <UserList
              users={sortedUsers}
              currentUserId={sortedUsers.find(u => u.username === currentUsername)?.id}
              selectedUserId={peer?.id}
              onSelect={setPeer}
              unreadCounts={unreadMap}
              style={{ height: 'calc(100% - 44px)' }}
            />
          </aside>

          <main className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {currentUsername && peer ? (
              <ChatRoom username={currentUsername} roomId="direct" peer={peer.username} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">Select a user to start chatting</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
