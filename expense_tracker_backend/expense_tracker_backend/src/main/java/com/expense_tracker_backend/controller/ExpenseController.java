package com.expense_tracker_backend.controller;

import com.expense_tracker_backend.dto.ExpenseRequest;
import com.expense_tracker_backend.dto.ExpenseResponse;
import com.expense_tracker_backend.entity.User;
import com.expense_tracker_backend.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(expenseService.getAllExpenses(user));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> add(@Valid @RequestBody ExpenseRequest request,
                                               @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(expenseService.addExpense(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody ExpenseRequest request,
                                                  @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(expenseService.updateExpense(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal User user) {
        expenseService.deleteExpense(id, user);
        return ResponseEntity.noContent().build();
    }
}
