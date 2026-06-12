package com.imane.inventorysystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Getter(lombok.AccessLevel.NONE)
    @Setter
    @Column(nullable = false)
    private String password;

    @com.fasterxml.jackson.annotation.JsonIgnore
    public String getPassword() {
        return password;
    }

    @Column(nullable = true)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "last_seen", nullable = true)
    private java.time.LocalDateTime lastSeen;

    @jakarta.persistence.Transient
    @com.fasterxml.jackson.annotation.JsonProperty("isOnline")
    public boolean getIsOnline() {
        if (lastSeen == null) return false;
        // Consider online if active within the last 5 minutes
        return lastSeen.isAfter(java.time.LocalDateTime.now().minusMinutes(5));
    }
}