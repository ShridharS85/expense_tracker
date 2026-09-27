package com.expense_tracker_backend.repository;


import com.expense_tracker_backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAllByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal getTotalByUserId(Long userId);

    @Query("SELECT e.date, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.date >= :startDate AND e.date <= :endDate GROUP BY e.date ORDER BY e.date")
    List<Object[]> getDailySpending(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT e.date, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND YEAR(e.date) = :year AND MONTH(e.date) = :month GROUP BY e.date ORDER BY e.date")
    List<Object[]> getDailySpendingByMonth(Long userId, int year, int month);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId GROUP BY e.category")
    List<Object[]> getCategoryDistribution(Long userId);

    @Query("SELECT YEAR(e.date), MONTH(e.date), SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.date >= :startDate GROUP BY YEAR(e.date), MONTH(e.date) ORDER BY YEAR(e.date), MONTH(e.date)")
    List<Object[]> getMonthlyExpenses(Long userId, LocalDate startDate);

    List<Expense> findByUserIdAndDateBetweenOrderByDateAsc(Long userId, LocalDate startDate, LocalDate endDate);
}