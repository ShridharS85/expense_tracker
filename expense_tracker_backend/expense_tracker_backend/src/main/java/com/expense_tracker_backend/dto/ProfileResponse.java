package com.expense_tracker_backend.dto;


import java.time.LocalDateTime;

public class ProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String provider;
    private LocalDateTime createdAt;
    private boolean canChangePassword;

    public ProfileResponse() {}

    public ProfileResponse(Long id, String name, String email, String role,
                           String provider, LocalDateTime createdAt, boolean canChangePassword) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.provider = provider;
        this.createdAt = createdAt;
        this.canChangePassword = canChangePassword;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isCanChangePassword() { return canChangePassword; }
    public void setCanChangePassword(boolean canChangePassword) { this.canChangePassword = canChangePassword; }
}
