package com.imane.inventorysystem.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogResponse {
    private String id;
    private Who who;
    private String what;
    private LocalDateTime when;
    private String icon;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Who {
        private String name;
        private String role;
        private String avatar;
    }
}
