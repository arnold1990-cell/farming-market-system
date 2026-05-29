package com.farmingmarketsystem.repository;

import com.farmingmarketsystem.model.RedFlag;
import com.farmingmarketsystem.model.RedFlagStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RedFlagRepository extends JpaRepository<RedFlag, Long> {
    List<RedFlag> findByStatusOrderByCreatedAtDesc(RedFlagStatus status);
}
