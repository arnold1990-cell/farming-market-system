package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.CalendarDtos;
import com.farmingmarketsystem.service.CalendarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/calendar/events")
@RequiredArgsConstructor
public class CalendarController {
    private final CalendarService calendarService;

    @GetMapping
    public ResponseEntity<List<CalendarDtos.EventResponse>> list(Authentication authentication,
                                                                 @RequestParam(required = false) LocalDate dateFrom,
                                                                 @RequestParam(required = false) LocalDate dateTo) {
        return ResponseEntity.ok(calendarService.list(authentication != null ? authentication.getName() : null, dateFrom, dateTo));
    }

    @PostMapping
    public ResponseEntity<CalendarDtos.EventResponse> create(Authentication authentication,
                                                             @Valid @RequestBody CalendarDtos.UpsertRequest request) {
        return ResponseEntity.ok(calendarService.create(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CalendarDtos.EventResponse> update(@PathVariable Long id,
                                                             Authentication authentication,
                                                             @Valid @RequestBody CalendarDtos.UpsertRequest request) {
        return ResponseEntity.ok(calendarService.update(id, authentication.getName(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        calendarService.delete(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
