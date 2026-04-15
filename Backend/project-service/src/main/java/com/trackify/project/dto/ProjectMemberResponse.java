package com.trackify.project.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectMemberResponse {
    private Long id;
    private Long projectId;
    private Long userId;
    private String userEmail;
    private String userName;
    private String userRole;
    private LocalDateTime addedAt;
}
