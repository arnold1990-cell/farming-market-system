package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.AuthDtos;
import com.farmingmarketsystem.exception.BadRequestException;
import com.farmingmarketsystem.model.User;
import com.farmingmarketsystem.repository.UserRepository;
import com.farmingmarketsystem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) throw new BadRequestException("Email already exists");
        User user = userRepository.save(User.builder().fullName(request.fullName()).email(request.email()).password(passwordEncoder.encode(request.password())).role(request.role()).enabled(true).build());
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthDtos.AuthResponse(token, user.getId(), user.getEmail(), user.getRole());
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email()).orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthDtos.AuthResponse(token, user.getId(), user.getEmail(), user.getRole());
    }
}
