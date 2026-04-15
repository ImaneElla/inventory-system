package com.imane.inventorysystem.controller;

import com.imane.inventorysystem.entity.User;
import com.imane.inventorysystem.entity.Role;
import com.imane.inventorysystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // Connect to your Next.js app
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // Folder where images will be saved
    private static final String UPLOAD_DIR = "uploads/profiles/";

    @PostMapping(value = "/register", consumes = { org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> register(
            @RequestParam("userName") String userName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("role") String role,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            // 1. Check if user already exists
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body("Email is already taken!");
            }

            // 2. Handle Image Upload (Optional)
            String fileName = null;
            if (image != null && !image.isEmpty()) {
                // Create directory if it doesn't exist
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // Give image a unique name to avoid conflicts
                fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(image.getInputStream(), filePath);
            }

            // 3. Create User Object
            User user = new User();
            user.setEmail(email);
            user.setPassword(password); // Note: You should use BCrypt for security later!
            user.setRole(Role.valueOf(role.toUpperCase()));
            user.setImageUrl(fileName); // Save the name/path of the photo
            
            // Generate a username automatically from email or name
            user.setUsername(email.split("@")[0]); 

            userRepository.save(user);
            return ResponseEntity.ok("Registration successful!");

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error saving image: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        // Simple login check by email and password
        return userRepository.findByEmail(loginRequest.getEmail())
                .filter(user -> user.getPassword().equals(loginRequest.getPassword()))
                .map(user -> ResponseEntity.ok("Login successful ! Welcome " + user.getUsername()))
                .orElse(ResponseEntity.status(401).body("Invalid email or password"));
    }
}