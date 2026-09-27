package com.expense_tracker_backend.service;


import com.expense_tracker_backend.dto.*;
import com.expense_tracker_backend.entity.User;
import com.expense_tracker_backend.repository.ExpenseRepository;
import com.expense_tracker_backend.repository.IncomeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

    public DashboardService(IncomeRepository incomeRepository, ExpenseRepository expenseRepository) {
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
    }

    public DashboardResponse getDashboard(User user) {
        BigDecimal totalIncome = incomeRepository.getTotalByUserId(user.getId());
        BigDecimal totalExpenses = expenseRepository.getTotalByUserId(user.getId());
        BigDecimal balance = totalIncome.subtract(totalExpenses);

        return new DashboardResponse(totalIncome, totalExpenses, balance);
    }

    public List<MonthlyExpensesResponse> getMonthlyExpenses(User user, int months) {
        LocalDate startDate = LocalDate.now().minusMonths(months);
        List<Object[]> results = expenseRepository.getMonthlyExpenses(user.getId(), startDate);

        List<MonthlyExpensesResponse> response = new ArrayList<>();
        String[] monthNames = {"January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"};

        for (Object[] row : results) {
            int year = (int) row[0];
            int month = (int) row[1];
            BigDecimal amount = (BigDecimal) row[2];
            String label = monthNames[month - 1] + " " + year;
            response.add(new MonthlyExpensesResponse(label, amount));
        }

        return response;
    }

    public List<CategoryDistributionResponse> getCategoryDistribution(User user) {
        List<Object[]> results = expenseRepository.getCategoryDistribution(user.getId());

        List<CategoryDistributionResponse> response = new ArrayList<>();
        for (Object[] row : results) {
            String category = ((Enum<?>) row[0]).toString();
            BigDecimal amount = (BigDecimal) row[1];
            response.add(new CategoryDistributionResponse(category, amount));
        }

        return response;
    }

    public List<DailySpendingResponse> getDailySpending(User user, int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        LocalDate endDate = LocalDate.now();
        List<Object[]> results = expenseRepository.getDailySpending(user.getId(), startDate, endDate);

        List<DailySpendingResponse> response = new ArrayList<>();
        for (Object[] row : results) {
            LocalDate date = (LocalDate) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            response.add(new DailySpendingResponse(date.toString(), amount));
        }

        return response;
    }
}
