package com.expense_tracker_backend.service;


import com.expense_tracker_backend.dto.IncomeRequest;
import com.expense_tracker_backend.dto.IncomeResponse;
import com.expense_tracker_backend.entity.Income;
import com.expense_tracker_backend.entity.User;
import com.expense_tracker_backend.exception.ForbiddenOperationException;
import com.expense_tracker_backend.exception.ResourceNotFoundException;
import com.expense_tracker_backend.repository.IncomeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncomeService {

    private final IncomeRepository incomeRepository;

    public IncomeService(IncomeRepository incomeRepository) {
        this.incomeRepository = incomeRepository;
    }

    public List<IncomeResponse> getAllIncome(User user) {
        return incomeRepository.findAllByUserIdOrderByDateDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public IncomeResponse addIncome(IncomeRequest request, User user) {
        Income income = new Income();
        income.setDescription(request.getDescription());
        income.setAmount(request.getAmount());
        income.setDate(request.getDate());
        income.setUser(user);

        return toResponse(incomeRepository.save(income));
    }

    public IncomeResponse updateIncome(Long id, IncomeRequest request, User user) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income not found"));

        if (!income.getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You can only edit your own income");
        }

        income.setDescription(request.getDescription());
        income.setAmount(request.getAmount());
        income.setDate(request.getDate());

        return toResponse(incomeRepository.save(income));
    }

    public void deleteIncome(Long id, User user) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income not found"));

        if (!income.getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You can only delete your own income");
        }

        incomeRepository.delete(income);
    }

    private IncomeResponse toResponse(Income income) {
        return new IncomeResponse(
                income.getId(),
                income.getDescription(),
                income.getAmount(),
                income.getDate()
        );
    }
}
