package com.farmingmarketsystem.repository;

import com.farmingmarketsystem.model.CommissionRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommissionRecordRepository extends JpaRepository<CommissionRecord, Long> {
    List<CommissionRecord> findByFarmerId(Long farmerId);
}
