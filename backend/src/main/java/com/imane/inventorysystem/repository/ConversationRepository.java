package com.imane.inventorysystem.repository;

import com.imane.inventorysystem.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findAllByOrderByCreatedAtDesc();
    List<Conversation> findByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteById(UUID id);
}