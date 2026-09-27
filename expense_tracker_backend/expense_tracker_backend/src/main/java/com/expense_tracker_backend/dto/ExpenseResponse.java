package com.expense_tracker_backend.dto;


import com.expense_tracker_backend.enums.ExpenseCategory;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseResponse {
    private Long id;
    private String description;
    private BigDecimal amount;
    private ExpenseCategory category;
    private LocalDate date;

    public ExpenseResponse() {}

    public ExpenseResponse(Long id, String description, BigDecimal amount,
                           ExpenseCategory category, LocalDate date) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.category = category;
        this.date = date;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public ExpenseCategory getCategory() { return category; }
    public void setCategory(ExpenseCategory category) { this.category = category; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
