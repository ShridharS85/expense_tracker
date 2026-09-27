package com.expense_tracker_backend.service.export;


import com.expense_tracker_backend.entity.Expense;
import com.expense_tracker_backend.entity.Income;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ExcelExportService {

    private CellStyle headerStyle(Workbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return headerStyle;
    }

    private CellStyle totalStyle(Workbook workbook) {
        CellStyle totalStyle = workbook.createCellStyle();
        Font totalFont = workbook.createFont();
        totalFont.setBold(true);
        totalStyle.setFont(totalFont);
        return totalStyle;
    }

    public void export(List<Expense> expenses, HttpServletResponse response, String filename) {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Expenses");

            Row headerRow = sheet.createRow(0);
            String[] headers = {"Date", "Description", "Category", "Amount"};
            CellStyle headerStyle = headerStyle(workbook);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            BigDecimal total = BigDecimal.ZERO;
            for (Expense expense : expenses) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(expense.getDate().toString());
                row.createCell(1).setCellValue(expense.getDescription());
                row.createCell(2).setCellValue(expense.getCategory().name());
                row.createCell(3).setCellValue(expense.getAmount().doubleValue());
                total = total.add(expense.getAmount());
            }

            Row totalRow = sheet.createRow(rowNum + 1);
            CellStyle totalStyle = totalStyle(workbook);
            Cell totalLabelCell = totalRow.createCell(2);
            totalLabelCell.setCellValue("Total");
            totalLabelCell.setCellStyle(totalStyle);
            Cell totalValueCell = totalRow.createCell(3);
            totalValueCell.setCellValue(total.doubleValue());
            totalValueCell.setCellStyle(totalStyle);

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(response.getOutputStream());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export Excel", e);
        }
    }

    public void exportIncome(List<Income> incomes, HttpServletResponse response, String filename) {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Income");

            Row headerRow = sheet.createRow(0);
            String[] headers = {"Date", "Description", "Amount"};
            CellStyle headerStyle = headerStyle(workbook);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            BigDecimal total = BigDecimal.ZERO;
            for (Income income : incomes) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(income.getDate().toString());
                row.createCell(1).setCellValue(income.getDescription());
                row.createCell(2).setCellValue(income.getAmount().doubleValue());
                total = total.add(income.getAmount());
            }

            Row totalRow = sheet.createRow(rowNum + 1);
            CellStyle totalStyle = totalStyle(workbook);
            Cell totalLabelCell = totalRow.createCell(1);
            totalLabelCell.setCellValue("Total");
            totalLabelCell.setCellStyle(totalStyle);
            Cell totalValueCell = totalRow.createCell(2);
            totalValueCell.setCellValue(total.doubleValue());
            totalValueCell.setCellStyle(totalStyle);

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(response.getOutputStream());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export Excel", e);
        }
    }
}
