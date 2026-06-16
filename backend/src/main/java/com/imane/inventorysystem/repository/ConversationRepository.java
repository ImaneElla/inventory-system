package com.imane.inventorysystem.repository;

import com.imane.inventorysystem.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

import com.imane.inventorysystem.entity.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findAllByOrderByCreatedAtDesc();
}