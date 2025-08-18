package com.chat_application.server.Controller.ChatController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.chat_application.server.Model.ChatModel.ChatMessages;
import com.chat_application.server.Service.ChatService.ChatService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ChatController {
 
    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload ChatMessages chatMessages){
    System.out.println("[WS] sendMessage from " + chatMessages.getSender() + " to " + chatMessages.getReceiver() + ": " + chatMessages.getMessage());
        ChatMessages savedMessages = chatService.savMessages(chatMessages);

        messagingTemplate.convertAndSendToUser(
            chatMessages.getReceiver(),"/topic/messages",savedMessages
        );

        messagingTemplate.convertAndSendToUser(
            chatMessages.getSender(),"/topic/messages",savedMessages
        );
    }

    @PostMapping("/send")
    public void sendMessageHttp(@RequestBody ChatMessages chatMessages) {
        System.out.println("[HTTP] send from " + chatMessages.getSender() + " to " + chatMessages.getReceiver() + ": " + chatMessages.getMessage());
        ChatMessages savedMessages = chatService.savMessages(chatMessages);
        messagingTemplate.convertAndSendToUser(chatMessages.getReceiver(), "/topic/messages", savedMessages);
        messagingTemplate.convertAndSendToUser(chatMessages.getSender(), "/topic/messages", savedMessages);
    }

    @GetMapping("/history/{user1}/{user2}")
    public List<ChatMessages> getChatHistory(@PathVariable String user1, @PathVariable String user2){
        return chatService.getChathistory(user1, user2);
    }
    
    @GetMapping("/partners/{username}")
    public List<String> getChatPartners(@PathVariable String username){
        return chatService.getChatPartner(username);
    }
    
    @GetMapping("/unread/{username}")
    public List<ChatMessages> getUnreadMessages(@PathVariable String username){
        return chatService.getUnreadMessages(username);
    }
    
    @PostMapping("/markAsRead/{messageId}")
    public void markAsRead(@PathVariable Long messageId){
        chatService.markMessageAsRead(messageId);
    }

    @MessageMapping("/markAsDelivered")
    public void markAsDelivered(@Payload String receiver){
        chatService.markMessagesAsDelivered(receiver);
    }
    

}
