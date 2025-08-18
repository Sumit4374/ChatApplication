package com.chat_application.server.Service.ChatService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chat_application.server.Model.ChatModel.ChatMessages;
import com.chat_application.server.Model.ChatModel.MessageStatus;
import com.chat_application.server.Repository.ChatReposistory.ChatRepo;

@Service
public class ChatService {
    
    @Autowired
    private ChatRepo chatRepo;

    public ChatMessages savMessages(ChatMessages message){
        return chatRepo.save(message);
    }

    public List<ChatMessages> getChathistory(String user1, String user2){
        return chatRepo.findChatBetweenUsers(user1,user2);
    }

    public List<String> getChatPartner(String username){
        return chatRepo.findChatPartners(username);
    }

    public List<ChatMessages> getUnreadMessages(String username) {
        return chatRepo.findUnreadMessages(username);
    }

    public void markMessageAsRead(Long messageId){
        ChatMessages message = chatRepo.findById(messageId).orElse(null);
        if(message!=null){
            message.setStatus(MessageStatus.READ);
            chatRepo.save(message);
        }
    }

    public void markMessagesAsDelivered(String receiver){
        List<ChatMessages> unreadMessages = getUnreadMessages(receiver);
        for (ChatMessages message : unreadMessages) {
            if(message.getStatus() == MessageStatus.SENT){
                message.setStatus(MessageStatus.DELIVERED);
                chatRepo.save(message);
            }
        }
    }
}
