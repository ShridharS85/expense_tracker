package com.expense_tracker_backend.service.export;

import com.expense_tracker_backend.entity.Expense;
import com.expense_tracker_backend.entity.Income;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class PdfExportService {

    // Fixed locale so the currency symbol/format is consistent regardless of the
    // server's default JVM locale, and matches the frontend (which always formats as USD).
    private static final Locale REPORT_LOCALE = Locale.US;
    private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
    private static final DateTimeFormatter TABLE_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public void export(List<Expense> expenses, HttpServletResponse response,
                       String filename, String userName) {

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        try {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, response.getOutputStream());
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.DARK_GRAY);
            Paragraph title = new Paragraph("Expense Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.GRAY);

            // NOTE: expenses is expected to be pre-sorted ascending by date (oldest first)
            // by the caller (ReportService), so index 0 is the earliest and the last index
            // is the latest date in the range.
            String dateRange = expenses.isEmpty() ? "No data" :
                    expenses.get(0).getDate().format(DISPLAY_DATE)
                            + " to " +
                            expenses.get(expenses.size() - 1).getDate().format(DISPLAY_DATE);

            Paragraph subtitle = new Paragraph(
                    "User: " + userName + " | Period: " + dateRange, subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.DARK_GRAY);

            String[] headers = {"Date", "Description", "Category", "Amount"};
            for (String header : headers) {
                addHeaderCell(table, header, headerFont);
            }

            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(REPORT_LOCALE);
            BigDecimal total = BigDecimal.ZERO;

            if (expenses.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No transactions in this date range.", cellFont));
                emptyCell.setColspan(4);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                emptyCell.setPadding(12);
                table.addCell(emptyCell);
            }

            for (Expense expense : expenses) {
                addBodyCell(table, expense.getDate().format(TABLE_DATE), cellFont, Element.ALIGN_CENTER);
                addBodyCell(table, expense.getDescription(), cellFont, Element.ALIGN_LEFT);
                addBodyCell(table, expense.getCategory().name(), cellFont, Element.ALIGN_CENTER);
                addBodyCell(table, currencyFormat.format(expense.getAmount()), cellFont, Element.ALIGN_RIGHT);
                total = total.add(expense.getAmount());
            }

            document.add(table);

            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.DARK_GRAY);
            Paragraph totalPara = new Paragraph("Total: " + currencyFormat.format(total), totalFont);
            totalPara.setAlignment(Element.ALIGN_RIGHT);
            totalPara.setSpacingBefore(15);
            document.add(totalPara);

            document.close();

        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Failed to export PDF", e);
        }
    }

    public void exportIncome(List<Income> incomes, HttpServletResponse response,
                             String filename, String userName) {

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        try {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, response.getOutputStream());
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.DARK_GRAY);
            Paragraph title = new Paragraph("Income Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.GRAY);

            String dateRange = incomes.isEmpty() ? "No data" :
                    incomes.get(0).getDate().format(DISPLAY_DATE)
                            + " to " +
                            incomes.get(incomes.size() - 1).getDate().format(DISPLAY_DATE);

            Paragraph subtitle = new Paragraph(
                    "User: " + userName + " | Period: " + dateRange, subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.DARK_GRAY);

            String[] headers = {"Date", "Description", "Amount"};
            for (String header : headers) {
                addHeaderCell(table, header, headerFont);
            }

            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(REPORT_LOCALE);
            BigDecimal total = BigDecimal.ZERO;

            if (incomes.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No transactions in this date range.", cellFont));
                emptyCell.setColspan(3);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                emptyCell.setPadding(12);
                table.addCell(emptyCell);
            }

            for (Income income : incomes) {
                addBodyCell(table, income.getDate().format(TABLE_DATE), cellFont, Element.ALIGN_CENTER);
                addBodyCell(table, income.getDescription(), cellFont, Element.ALIGN_LEFT);
                addBodyCell(table, currencyFormat.format(income.getAmount()), cellFont, Element.ALIGN_RIGHT);
                total = total.add(income.getAmount());
            }

            document.add(table);

            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.DARK_GRAY);
            Paragraph totalPara = new Paragraph("Total: " + currencyFormat.format(total), totalFont);
            totalPara.setAlignment(Element.ALIGN_RIGHT);
            totalPara.setSpacingBefore(15);
            document.add(totalPara);

            document.close();

        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Failed to export PDF", e);
        }
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(BaseColor.DARK_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(6);
        cell.setBorderColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);
    }
}
