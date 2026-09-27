package com.expense_tracker_backend.service;


import com.expense_tracker_backend.entity.Expense;
import com.expense_tracker_backend.entity.Income;
import com.expense_tracker_backend.entity.User;
import com.expense_tracker_backend.repository.ExpenseRepository;
import com.expense_tracker_backend.repository.IncomeRepository;
import com.expense_tracker_backend.service.export.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReportService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final CsvExportService csvExportService;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;

    public ReportService(ExpenseRepository expenseRepository,
                         IncomeRepository incomeRepository,
                         CsvExportService csvExportService,
                         ExcelExportService excelExportService,
                         PdfExportService pdfExportService) {
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
        this.csvExportService = csvExportService;
        this.excelExportService = excelExportService;
        this.pdfExportService = pdfExportService;
    }

    public List<Expense> getExpensesForDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserIdAndDateBetweenOrderByDateAsc(user.getId(), startDate, endDate);
    }

    public List<Income> getIncomeForDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return incomeRepository.findByUserIdAndDateBetweenOrderByDateAsc(user.getId(), startDate, endDate);
    }

    public void exportCsv(User user, LocalDate startDate, LocalDate endDate, String type, HttpServletResponse response) {
        if ("income".equalsIgnoreCase(type)) {
            List<Income> incomes = getIncomeForDateRange(user, startDate, endDate);
            String filename = "income_" + startDate + "_to_" + endDate + ".csv";
            csvExportService.exportIncome(incomes, response, filename);
        } else {
            List<Expense> expenses = getExpensesForDateRange(user, startDate, endDate);
            String filename = "expenses_" + startDate + "_to_" + endDate + ".csv";
            csvExportService.export(expenses, response, filename);
        }
    }

    public void exportExcel(User user, LocalDate startDate, LocalDate endDate, String type, HttpServletResponse response) {
        if ("income".equalsIgnoreCase(type)) {
            List<Income> incomes = getIncomeForDateRange(user, startDate, endDate);
            String filename = "income_" + startDate + "_to_" + endDate + ".xlsx";
            excelExportService.exportIncome(incomes, response, filename);
        } else {
            List<Expense> expenses = getExpensesForDateRange(user, startDate, endDate);
            String filename = "expenses_" + startDate + "_to_" + endDate + ".xlsx";
            excelExportService.export(expenses, response, filename);
        }
    }

    public void exportPdf(User user, LocalDate startDate, LocalDate endDate, String type, HttpServletResponse response) {
        if ("income".equalsIgnoreCase(type)) {
            List<Income> incomes = getIncomeForDateRange(user, startDate, endDate);
            String filename = "income_" + startDate + "_to_" + endDate + ".pdf";
            pdfExportService.exportIncome(incomes, response, filename, user.getName());
        } else {
            List<Expense> expenses = getExpensesForDateRange(user, startDate, endDate);
            String filename = "expenses_" + startDate + "_to_" + endDate + ".pdf";
            pdfExportService.export(expenses, response, filename, user.getName());
        }
    }
}
