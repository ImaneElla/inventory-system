package com.imane.inventorysystem.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.imane.inventorysystem.dto.LoginRequest;
import com.imane.inventorysystem.entity.Role;
import com.imane.inventorysystem.entity.User;
import com.imane.inventorysystem.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // Folder where images will be saved
    private static final String UPLOAD_DIR = "uploads/profiles/";

    @org.springframework.web.bind.annotation.GetMapping("/users")
    public ResponseEntity<java.util.List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
@DeleteMapping("/users/{id}")
public ResponseEntity<?> deleteUser(
        @PathVariable Integer id,
        @RequestHeader(value = "X-Current-User-Id", required = false) Integer currentUserId
) {

    User user = userRepository
            .findById(id)
            .orElse(null);

    if (user == null) {
        return ResponseEntity
                .badRequest()
                .body(
                        java.util.Map.of(
                                "message",
                                "User not found"
                        )
                );
    }

    if (currentUserId != null && currentUserId.equals(id)) {
        return ResponseEntity
                .badRequest()
                .body(
                        java.util.Map.of(
                                "message",
                                "You cannot delete your own account"
                        )
                );
    }

    userRepository.delete(user);

    return ResponseEntity.ok(
            java.util.Map.of(
                    "message",
                    "User deleted successfully"
            )
    );

}

    @PatchMapping(value = "/users/{id}/profile", consumes = { org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> updateProfile(
            @PathVariable Integer id,
            @RequestHeader(value = "X-Current-User-Id", required = false) Integer currentUserId,
            @RequestParam(value = "userName", required = false) String userName,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        if (currentUserId != null && !currentUserId.equals(id)) {
            return ResponseEntity.status(403).body(java.util.Map.of("message", "You can only update your own profile"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "User not found"));
        }

        try {
            if (userName != null && !userName.isBlank()) {
                user.setUsername(userName.trim());
            }

            if (image != null && !image.isEmpty()) {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(image.getInputStream(), filePath);
                user.setImageUrl(fileName);
            }

            userRepository.save(user);

            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("userName", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole().name());
            if (user.getImageUrl() != null) {
                response.put("imageUrl", "/uploads/profiles/" + user.getImageUrl());
            }
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(java.util.Map.of("message", "Error saving image: " + e.getMessage()));
        }
    }

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
            user.setPassword(password); 
            user.setRole(Role.valueOf(role.toUpperCase()));
            user.setImageUrl(fileName); // Save the name/path of the photo
            
            // Use the userName provided in the request
            user.setUsername(userName); 

            user = userRepository.save(user);
            java.util.Map<String, String> responseMap = new java.util.HashMap<>();
            responseMap.put("message", "Registration successful!");
            responseMap.put("userId", String.valueOf(user.getId()));
            responseMap.put("email", email);
            responseMap.put("userName", userName);
            responseMap.put("role", role);
            if (fileName != null) {
                responseMap.put("imageUrl", "/uploads/profiles/" + fileName);
            }
            return ResponseEntity.ok(responseMap);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error saving image: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        if (loginRequest.getEmail() == null || loginRequest.getEmail().isBlank()
                || loginRequest.getPassword() == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid email or password"));
        }

        String email = loginRequest.getEmail().trim();
        String password = loginRequest.getPassword();

        return userRepository.findByEmailIgnoreCase(email)
                .filter(user -> password.equals(user.getPassword()))
                .map(user -> {
                    java.util.Map<String, String> response = new java.util.HashMap<>();
                    response.put("userId",   String.valueOf(user.getId()));
                    response.put("userName", user.getUsername());
                    response.put("role",     user.getRole().name());
                    response.put("email",    user.getEmail());
                    response.put("message",  "Login successful! Welcome " + user.getUsername());
                    if (user.getImageUrl() != null) {
                        response.put("imageUrl", "/uploads/profiles/" + user.getImageUrl());
                    }
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid email or password")));
    }
}