package com.trackify.project.dto;

import java.time.LocalDateTime;

public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProjectResponse() {}

    public ProjectResponse(Long id, String name, String description, Long ownerId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.ownerId = ownerId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ProjectResponseBuilder builder() {
        return new ProjectResponseBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static class ProjectResponseBuilder {
        private Long id;
        private String name;
        private String description;
        private Long ownerId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ProjectResponseBuilder id(Long id) { this.id = id; return this; }
        public ProjectResponseBuilder name(String name) { this.name = name; return this; }
        public ProjectResponseBuilder description(String description) { this.description = description; return this; }
        public ProjectResponseBuilder ownerId(Long ownerId) { this.ownerId = ownerId; return this; }
        public ProjectResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ProjectResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ProjectResponse build() {
            return new ProjectResponse(id, name, description, ownerId, createdAt, updatedAt);
        }
    }
}
