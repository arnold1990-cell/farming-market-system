package com.farmingmarketsystem.repository;

import com.farmingmarketsystem.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
}
