package com.imane.inventorysystem.controller;

import com.imane.inventorysystem.dto.ChatMessageResponse;
import com.imane.inventorysystem.dto.ConversationResponse;
import com.imane.inventorysystem.dto.SendMessageRequest;
import com.imane.inventorysystem.entity.ChatMessage;
import com.imane.inventorysystem.entity.Conversation;
import com.imane.inventorysystem.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ConversationResponse> createConversation(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long userId) {
        Conversation conv = chatService.createConversation(userId);
        return ResponseEntity.ok(toConversationResponse(conv));
    }

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getAllConversations(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long userId) {
        List<ConversationResponse> list = chatService.getAllConversations(userId)
                .stream()
                .map(this::toConversationResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable UUID id) {
        List<ChatMessageResponse> messages = chatService.getMessagesByConversation(id)
                .stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable UUID id,
            @RequestBody SendMessageRequest request) {
        ChatMessage reply = chatService.processMessage(id, request.getText());
        return ResponseEntity.ok(toMessageResponse(reply));
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<?> deleteConversation(@PathVariable UUID conversationId) {
        chatService.deleteConversation(conversationId);
        return ResponseEntity.noContent().build();
    }

    private ConversationResponse toConversationResponse(Conversation c) {
        return new ConversationResponse(
                c.getId(),
                c.getTitle(),
                c.getCreatedAt(),
                c.getMessages() != null ? c.getMessages().size() : 0
        );
    }

    private ChatMessageResponse toMessageResponse(ChatMessage m) {
        return new ChatMessageResponse(
                m.getId(),
                m.getSender(),
                m.getText(),
                m.getTimestamp(),
                m.getConversationId()
        );
    }
}