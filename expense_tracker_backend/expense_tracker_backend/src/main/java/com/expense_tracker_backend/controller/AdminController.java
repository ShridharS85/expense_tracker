package com.expense_tracker_backend.controller;

import com.expense_tracker_backend.dto.UserResponse;
import com.expense_tracker_backend.entity.User;
import com.expense_tracker_backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/promote")
    public ResponseEntity<UserResponse> promoteToAdmin(@PathVariable Long id,
                                                       @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(adminService.promoteToAdmin(id, admin));
    }

    @PutMapping("/users/{id}/demote")
    public ResponseEntity<UserResponse> demoteToUser(@PathVariable Long id,
                                                     @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(adminService.demoteToUser(id, admin));
    }
}
