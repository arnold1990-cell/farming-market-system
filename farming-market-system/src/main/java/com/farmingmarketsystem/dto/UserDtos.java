package com.farmingmarketsystem.dto;

public class UserDtos {
    public record UserResponse(Long id, String fullName, String email, String role, boolean enabled) {}
}
