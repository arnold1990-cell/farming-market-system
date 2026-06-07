package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.UserDtos;
import com.farmingmarketsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/users") @RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    @GetMapping public ResponseEntity<List<UserDtos.UserResponse>> all(){ return ResponseEntity.ok(userService.getAllUsers()); }
    @GetMapping("/me") public ResponseEntity<UserDtos.UserResponse> me(Authentication a){ return ResponseEntity.ok(userService.getByEmail(a.getName())); }
    @PatchMapping("/{id}/disable") public ResponseEntity<UserDtos.UserResponse> disable(@PathVariable Long id){ return ResponseEntity.ok(userService.disable(id)); }
    @PatchMapping("/{id}/enable") public ResponseEntity<UserDtos.UserResponse> enable(@PathVariable Long id){ return ResponseEntity.ok(userService.enable(id)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ userService.delete(id); return ResponseEntity.noContent().build(); }
}
