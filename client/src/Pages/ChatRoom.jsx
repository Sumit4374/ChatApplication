import React from 'react';
import { useParams } from 'react-router-dom';
import ChatRoom from '../Components/Chat/ChatRoom.jsx';

export default function ChatRoomPage() {
  const { chatId } = useParams();
  // This page could load peer by id; for now just render a room placeholder
  return <ChatRoom roomId={chatId || 'general'} />;
}
