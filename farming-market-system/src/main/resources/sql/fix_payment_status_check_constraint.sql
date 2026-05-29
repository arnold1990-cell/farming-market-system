-- Run this against PostgreSQL if your DB was created with an older payment_status_check.
ALTER TABLE payment DROP CONSTRAINT IF EXISTS payment_status_check;

ALTER TABLE payment
ADD CONSTRAINT payment_status_check
CHECK (
    status IN (
        'PENDING',
        'INITIATED',
        'PAID',
        'FAILED',
        'CASH_PENDING_CONFIRMATION',
        'CASH_CONFIRMED',
        'CASH_REJECTED',
        'CASH_UNVERIFIED',
        'REFUNDED'
    )
);
