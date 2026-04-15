package com.trackify.project.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddMemberRequest {
    private Long userId;
    private String userEmail;
    private String userName;
    private String userRole;
}
