package com.imane.inventorysystem.controller;

import com.imane.inventorysystem.entity.User;
import com.imane.inventorysystem.repository.UserRepository;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") //frontend url
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/register")
  public String registerUser(@RequestBody User user) {
        if(userRepository.existsByEmail(user.getEmail())) {
            return "Error: Email is already taken!";
        }
        userRepository.save(user);
        return "User registered successfully!";
    }
    
    @PostMapping("/login")
public ResponseEntity<String> loginUser(@RequestBody User loginRequest) {
    Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());

    if (userOptional.isPresent()) {
        User user = userOptional.get();
        if (user.getPassword().equals(loginRequest.getPassword())) {
           return ResponseEntity.ok(user.toString()); 
        } else {
            return ResponseEntity.status(401).body("Error: Invalid password!");
        }
    } else {
        return ResponseEntity.status(404).body("Error: User not found!");
    }
}
}
