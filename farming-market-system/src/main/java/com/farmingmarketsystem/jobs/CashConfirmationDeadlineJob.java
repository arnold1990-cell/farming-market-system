package com.farmingmarketsystem.jobs;

import com.farmingmarketsystem.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CashConfirmationDeadlineJob {
    private final OrderService orderService;

    @Scheduled(fixedDelayString = "${app.cash-confirmation-check-ms:60000}")
    public void checkOverdueCashConfirmations() {
        orderService.markOverdueCashVerifications();
    }
}
