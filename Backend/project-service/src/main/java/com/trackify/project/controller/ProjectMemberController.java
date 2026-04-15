package com.trackify.project.controller;

import com.trackify.common.dto.ApiResponse;
import com.trackify.project.dto.AddMemberRequest;
import com.trackify.project.dto.ProjectMemberResponse;
import com.trackify.project.service.ProjectMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectMemberController {

    private final ProjectMemberService memberService;

    @GetMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponse>>> getMembers(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(
                ApiResponse.ok("Members fetched successfully", memberService.getProjectMembers(projectId)));
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> addMember(
            @PathVariable Long projectId,
            @Valid @RequestBody AddMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Member added successfully", memberService.addMember(projectId, request)));
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId) {
        memberService.removeMember(projectId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Member removed successfully", null));
    }
}
