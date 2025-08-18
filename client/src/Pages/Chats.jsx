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

  useEffect(() => {
    (async () => {
      try {
        const list = await Api.getUsers();
        const mapped = (list || []).map((u, i) => ({ id: u.id ?? i + 1, name: u.username, username: u.username, email: u.email }));
        setUsers(mapped);
        if (mapped.length) {
          // default peer: first user not equal to me
          const defaultPeer = mapped.find(u => u.username !== currentUsername) || mapped[0];
          setPeer(defaultPeer);
        }
      } catch {}
    })();
  }, [currentUsername]);

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
              users={users}
              currentUserId={users.find(u => u.username === currentUsername)?.id}
              selectedUserId={peer?.id}
              onSelect={setPeer}
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
