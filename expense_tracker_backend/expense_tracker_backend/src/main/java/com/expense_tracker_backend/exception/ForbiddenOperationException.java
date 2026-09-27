package com.expense_tracker_backend.exception;

/**
 * Thrown when an authenticated user attempts an operation they are not
 * authorized to perform (e.g. editing another user's data). Mapped to HTTP 403.
 */
public class ForbiddenOperationException extends RuntimeException {
    public ForbiddenOperationException(String message) {
        super(message);
    }
}
