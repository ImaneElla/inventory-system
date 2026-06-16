package com.imane.inventorysystem.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ConversationResponse {
    private UUID id;
    private String title;
    private LocalDateTime createdAt;
    private int messageCount;

    public ConversationResponse(UUID id, String title, LocalDateTime createdAt, int messageCount) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.messageCount = messageCount;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public int getMessageCount() { return messageCount; }
}
