package com.imane.inventorysystem.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import com.imane.inventorysystem.repository.UserRepository;
import com.imane.inventorysystem.entity.User;
import java.time.LocalDateTime;

@Component
public class UserActivityInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;

    public UserActivityInterceptor(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String userIdStr = request.getHeader("X-Current-User-Id");
        if (userIdStr != null && !userIdStr.isBlank()) {
            try {
                Integer userId = Integer.parseInt(userIdStr.trim());
                userRepository.findById(userId).ifPresent(user -> {
                    user.setLastSeen(LocalDateTime.now());
                    userRepository.save(user);
                });
            } catch (NumberFormatException e) {
                // Ignore invalid user ID format
            }
        }
        return true;
    }
}
