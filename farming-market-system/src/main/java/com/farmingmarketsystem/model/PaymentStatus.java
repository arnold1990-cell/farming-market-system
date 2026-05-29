package com.farmingmarketsystem.model;

public enum PaymentStatus {
    PENDING,
    INITIATED,
    PAID,
    FAILED,
    CASH_PENDING_CONFIRMATION,
    CASH_CONFIRMED,
    CASH_REJECTED,
    CASH_UNVERIFIED,
    REFUNDED
}
