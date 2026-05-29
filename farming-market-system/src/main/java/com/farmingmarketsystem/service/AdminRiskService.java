package com.farmingmarketsystem.service;

import com.farmingmarketsystem.model.RedFlag;
import com.farmingmarketsystem.model.RedFlagStatus;
import com.farmingmarketsystem.repository.CommissionRecordRepository;
import com.farmingmarketsystem.repository.RedFlagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminRiskService {
    private final RedFlagRepository redFlagRepository;
    private final CommissionRecordRepository commissionRecordRepository;

    public List<RedFlag> redFlags() {
        return redFlagRepository.findAll();
    }

    public List<?> commissions() {
        return commissionRecordRepository.findAll();
    }

    @Transactional
    public RedFlag resolveRedFlag(Long id, String notes) {
        var flag = redFlagRepository.findById(id).orElseThrow();
        flag.setStatus(RedFlagStatus.RESOLVED);
        flag.setResolvedAt(Instant.now());
        flag.setAdminNotes(notes);
        return redFlagRepository.save(flag);
    }

    public Map<String, Object> monetizationSummary() {
        var records = commissionRecordRepository.findAll();
        BigDecimal total = records.stream().map(r -> r.getPlatformCommissionAmount()).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<Long, BigDecimal> byFarmer = new LinkedHashMap<>();
        records.forEach(r -> byFarmer.merge(r.getFarmer().getId(), r.getPlatformCommissionAmount(), BigDecimal::add));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalCommission", total);
        out.put("totalSalesCount", records.size());
        out.put("commissionByFarmer", byFarmer);
        out.put("redFlagsOpen", redFlagRepository.findByStatusOrderByCreatedAtDesc(RedFlagStatus.OPEN).size());
        return out;
    }
}
