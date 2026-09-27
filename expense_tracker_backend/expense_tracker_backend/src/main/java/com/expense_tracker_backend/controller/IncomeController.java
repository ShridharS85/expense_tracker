package com.expense_tracker_backend.controller;


import com.expense_tracker_backend.dto.IncomeRequest;
import com.expense_tracker_backend.dto.IncomeResponse;
import com.expense_tracker_backend.entity.User;
import com.expense_tracker_backend.service.IncomeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/income")
public class IncomeController {

    private final IncomeService incomeService;

    public IncomeController(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    @GetMapping
    public ResponseEntity<List<IncomeResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(incomeService.getAllIncome(user));
    }

    @PostMapping
    public ResponseEntity<IncomeResponse> add(@Valid @RequestBody IncomeRequest request,
                                              @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(incomeService.addIncome(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody IncomeRequest request,
                                                 @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(incomeService.updateIncome(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal User user) {
        incomeService.deleteIncome(id, user);
        return ResponseEntity.noContent().build();
    }
}
