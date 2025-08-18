package com.chat_application.server.Repository.ChatReposistory;

import com.chat_application.server.Model.ChatModel.ChatMessages;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepo extends JpaRepository<ChatMessages, Long> {
	@Query("SELECT c FROM ChatMessages c WHERE (c.sender = :user1 AND c.receiver = :user2) OR (c.sender = :user2 AND c.receiver = :user1) ORDER BY c.timestamp")
    List<ChatMessages> findChatBetweenUsers(@Param("user1") String user1, @Param("user2") String user2);
    
    @Query("SELECT DISTINCT CASE WHEN c.sender = :username THEN c.receiver ELSE c.sender END FROM ChatMessages c WHERE c.sender = :username OR c.receiver = :username")
    List<String> findChatPartners(@Param("username") String username);
    
    @Query("SELECT c FROM ChatMessages c WHERE c.receiver = :username AND c.status != 'READ'")
    List<ChatMessages> findUnreadMessages(@Param("username") String username);
}
