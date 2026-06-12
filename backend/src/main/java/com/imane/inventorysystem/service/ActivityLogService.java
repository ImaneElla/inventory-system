package com.imane.inventorysystem.service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.imane.inventorysystem.dto.ActivityLogRequest;
import com.imane.inventorysystem.dto.ActivityLogResponse;
import com.imane.inventorysystem.entity.ActivityLog;
import com.imane.inventorysystem.entity.User;
import com.imane.inventorysystem.repository.ActivityLogRepository;
import com.imane.inventorysystem.repository.UserRepository;

@Service
@Transactional
public class ActivityLogService {

    private final ActivityLogRepository repo;
    private final UserRepository userRepo;

    public ActivityLogService(ActivityLogRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getAllLogs() {
        return repo.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ActivityLogResponse saveLog(ActivityLogRequest request, Integer currentUserId) {
        User user = null;
        if (currentUserId != null) {
            user = userRepo.findById(currentUserId).orElse(null);
        }

        ActivityLog log = new ActivityLog();
        log.setWhat(request.getWhat());
        log.setIcon(request.getIcon() != null ? request.getIcon() : "system");

        if (user != null) {
            log.setUserName(user.getUsername());
            log.setUserRole(user.getRole().name());
            log.setUserAvatar(user.getImageUrl());
        } else {
            log.setUserName("System");
            log.setUserRole("SYSTEM");
            log.setUserAvatar(null);
        }

        ActivityLog saved = repo.save(log);
        return mapToResponse(saved);
    }

    public void clearAllLogs() {
        repo.deleteAll();
    }

    private ActivityLogResponse mapToResponse(ActivityLog log) {
        ActivityLogResponse.Who who = ActivityLogResponse.Who.builder()
                .name(log.getUserName())
                .role(log.getUserRole())
                .avatar(log.getUserAvatar())
                .build();

        return ActivityLogResponse.builder()
                .id(String.valueOf(log.getId()))
                .what(log.getWhat())
                .when(log.getCreatedAt())
                .icon(log.getIcon())
                .who(who)
                .build();
    }
}
