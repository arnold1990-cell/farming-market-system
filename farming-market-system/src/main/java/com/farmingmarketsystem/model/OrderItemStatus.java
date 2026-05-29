package com.farmingmarketsystem.model;

public enum OrderItemStatus {
    PENDING,
    AWAITING_FARMER_CONFIRMATION,
    CONFIRMED,
    READY_FOR_PICKUP,
    DELIVERING,
    COMPLETED,
    CANCELLED,
    PAYMENT_DISPUTED,
    FARMER_NO_RESPONSE
}
