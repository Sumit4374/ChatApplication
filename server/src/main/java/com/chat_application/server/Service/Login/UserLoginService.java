package com.chat_application.server.Service.Login;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.chat_application.server.Model.UserModel.Users;
import com.chat_application.server.Repository.UserRepo.UserRepo;

@Service
public class UserLoginService {
    @Autowired
    private UserRepo repo;

    @Autowired
    public AuthenticationManager authenticationManager ;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public Users addUser(Users user){
        user.setPassword(encoder.encode(user.getPassword()));
        return repo.save(user);
    }

    public List<Users> getAll(){
       List<Users> list = repo.findAll();
       return list;
    }

    public boolean verify(Users user) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
        return authentication.isAuthenticated();
    }
}
