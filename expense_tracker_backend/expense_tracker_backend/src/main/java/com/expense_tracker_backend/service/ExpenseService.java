package com.expense_tracker_backend.service;


import com.expense_tracker_backend.dto.ExpenseRequest;
import com.expense_tracker_backend.dto.ExpenseResponse;
import com.expense_tracker_backend.entity.Expense;
import com.expense_tracker_backend.entity.User;
import com.expense_tracker_backend.exception.ForbiddenOperationException;
import com.expense_tracker_backend.exception.ResourceNotFoundException;
import com.expense_tracker_backend.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public List<ExpenseResponse> getAllExpenses(User user) {
        return expenseRepository.findAllByUserIdOrderByDateDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<Expense> getExpensesByDateRange(User user, java.time.LocalDate start, java.time.LocalDate end) {
        return expenseRepository.findByUserIdAndDateBetweenOrderByDateAsc(user.getId(), start, end);
    }

    public ExpenseResponse addExpense(ExpenseRequest request, User user) {
        Expense expense = new Expense();
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());
        expense.setUser(user);

        return toResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request, User user) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You can only edit your own expenses");
        }

        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());

        return toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long id, User user) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You can only delete your own expenses");
        }

        expenseRepository.delete(expense);
    }

    private ExpenseResponse toResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getDate()
        );
    }
}
