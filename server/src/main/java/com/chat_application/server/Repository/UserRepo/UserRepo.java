package com.chat_application.server.Repository.UserRepo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chat_application.server.Model.UserModel.Users;

public interface UserRepo extends JpaRepository<Users, Integer> {

    Users findByUsername(String username);
	
}
