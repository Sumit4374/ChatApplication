package com.chat_application.server.Controller.Login;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import com.chat_application.server.Model.UserModel.Users;
import com.chat_application.server.Service.JWT.JWT_Service;
import com.chat_application.server.Service.Login.UserLoginService;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;


@RestController
@CrossOrigin(
    originPatterns = {"http://localhost:*", "http://127.0.0.1:*"},
    allowCredentials = "true",
    allowedHeaders = "*",
    methods = {org.springframework.web.bind.annotation.RequestMethod.GET,
               org.springframework.web.bind.annotation.RequestMethod.POST,
               org.springframework.web.bind.annotation.RequestMethod.PUT,
               org.springframework.web.bind.annotation.RequestMethod.DELETE,
               org.springframework.web.bind.annotation.RequestMethod.OPTIONS}
)
public class LoginController {
    
    @Autowired
    private UserLoginService service;

    @Autowired
    private JWT_Service jwt;

    @PostMapping("/addUser")  
    public Users regUsers(@RequestBody Users user) {
        return service.addUser(user);
    }

    @GetMapping("/getAll")
    public List<Users> getAllUsers() {
        return service.getAll();
    }
    
    @PostMapping("/login")
    public ResponseEntity<String> isLoggedIn(@RequestBody Users user) {
        try {
            boolean ok = service.verify(user);
            if (!ok) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
            }
            String token = jwt.generateToken(user.getUsername());
            return ResponseEntity.ok(token);
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }
    

}
