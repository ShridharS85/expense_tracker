package com.expense_tracker_backend.dto;


import java.math.BigDecimal;

public class DailySpendingResponse {
    private String date;
    private BigDecimal amount;

    public DailySpendingResponse() {}

    public DailySpendingResponse(String date, BigDecimal amount) {
        this.date = date;
        this.amount = amount;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
