package com.farmingmarketsystem.dto;

import com.farmingmarketsystem.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AuthDtos {
    public record RegisterRequest(@NotBlank String fullName, @Email @NotBlank String email, String phoneNumber, @NotBlank String password, @NotNull Role role) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record AuthResponse(String token, Long userId, String email, Role role) {}
}
