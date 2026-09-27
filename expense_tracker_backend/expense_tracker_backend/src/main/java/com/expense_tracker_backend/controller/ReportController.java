package com.expense_tracker_backend.controller;

import com.expense_tracker_backend.entity.Expense;
import com.expense_tracker_backend.entity.Income;
import com.expense_tracker_backend.entity.User;
import com.expense_tracker_backend.service.ReportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/expenses")
    public ResponseEntity<List<Expense>> getExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reportService.getExpensesForDateRange(user, startDate, endDate));
    }

    @GetMapping("/income")
    public ResponseEntity<List<Income>> getIncomeByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reportService.getIncomeForDateRange(user, startDate, endDate));
    }

    @GetMapping("/export/csv")
    public void exportCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "expense") String type,
            HttpServletResponse response,
            @AuthenticationPrincipal User user) {
        reportService.exportCsv(user, startDate, endDate, type, response);
    }

    @GetMapping("/export/excel")
    public void exportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "expense") String type,
            HttpServletResponse response,
            @AuthenticationPrincipal User user) {
        reportService.exportExcel(user, startDate, endDate, type, response);
    }

    @GetMapping("/export/pdf")
    public void exportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "expense") String type,
            HttpServletResponse response,
            @AuthenticationPrincipal User user) {
        reportService.exportPdf(user, startDate, endDate, type, response);
    }
}
