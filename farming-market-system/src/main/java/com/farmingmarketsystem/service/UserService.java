package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.UserDtos;
import com.farmingmarketsystem.exception.ResourceNotFoundException;
import com.farmingmarketsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<UserDtos.UserResponse> getAllUsers() { return userRepository.findAll().stream().map(u -> new UserDtos.UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(), u.isEnabled())).toList(); }
    public UserDtos.UserResponse getByEmail(String email) { var u=userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found")); return new UserDtos.UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(), u.isEnabled()); }
    public UserDtos.UserResponse disable(Long userId) { var u=userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found")); u.setEnabled(false); userRepository.save(u); return new UserDtos.UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(), u.isEnabled()); }
}
