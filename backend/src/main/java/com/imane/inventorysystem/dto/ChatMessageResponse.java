package com.imane.inventorysystem.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ChatMessageResponse {
    private UUID id;
    private String sender;
    private String text;
    private LocalDateTime timestamp;
    private UUID conversationId;

    public ChatMessageResponse(UUID id, String sender, String text, LocalDateTime timestamp, UUID conversationId) {
        this.id = id;
        this.sender = sender;
        this.text = text;
        this.timestamp = timestamp;
        this.conversationId = conversationId;
    }

    public UUID getId() { return id; }
    public String getSender() { return sender; }
    public String getText() { return text; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public UUID getConversationId() { return conversationId; }
}
