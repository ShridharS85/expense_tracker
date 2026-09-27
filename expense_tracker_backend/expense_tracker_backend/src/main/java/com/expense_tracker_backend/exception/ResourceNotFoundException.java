package com.expense_tracker_backend.exception;

/**
 * Thrown when a requested resource (expense, income, user, etc.) does not exist,
 * or does not exist for the current user. Mapped to HTTP 404 by GlobalExceptionHandler.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
