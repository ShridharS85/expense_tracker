package com.expense_tracker_backend.service.export;


import com.expense_tracker_backend.entity.Expense;
import com.expense_tracker_backend.entity.Income;
import com.opencsv.CSVWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class CsvExportService {

    public void export(List<Expense> expenses, HttpServletResponse response, String filename) {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8))) {
            String[] header = {"Date", "Description", "Category", "Amount"};
            writer.writeNext(header);

            BigDecimal total = BigDecimal.ZERO;

            for (Expense expense : expenses) {
                String[] row = {
                        expense.getDate().toString(),
                        expense.getDescription(),
                        expense.getCategory().name(),
                        expense.getAmount().toPlainString()
                };
                writer.writeNext(row);
                total = total.add(expense.getAmount());
            }

            writer.writeNext(new String[]{"", "", "", ""});
            writer.writeNext(new String[]{"", "", "Total", total.toPlainString()});

        } catch (IOException e) {
            throw new RuntimeException("Failed to export CSV", e);
        }
    }

    public void exportIncome(List<Income> incomes, HttpServletResponse response, String filename) {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8))) {
            String[] header = {"Date", "Description", "Amount"};
            writer.writeNext(header);

            BigDecimal total = BigDecimal.ZERO;

            for (Income income : incomes) {
                String[] row = {
                        income.getDate().toString(),
                        income.getDescription(),
                        income.getAmount().toPlainString()
                };
                writer.writeNext(row);
                total = total.add(income.getAmount());
            }

            writer.writeNext(new String[]{"", "", ""});
            writer.writeNext(new String[]{"", "Total", total.toPlainString()});

        } catch (IOException e) {
            throw new RuntimeException("Failed to export CSV", e);
        }
    }
}
