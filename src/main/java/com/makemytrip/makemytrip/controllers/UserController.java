package com.makemytrip.makemytrip.controllers;

import com.makemytrip.makemytrip.dto.AuthResponseDto;
import com.makemytrip.makemytrip.dto.LoginRequestDto;
import com.makemytrip.makemytrip.dto.RegisterRequestDto;
import com.makemytrip.makemytrip.dto.UserResponseDto;
import com.makemytrip.makemytrip.services.UserServices;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserServices userServices;

    public UserController(UserServices userServices) {
        this.userServices = userServices;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        AuthResponseDto response = userServices.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        AuthResponseDto response = userServices.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserResponseDto user = userServices.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getUsers() {
        return ResponseEntity.ok(userServices.getAllUsers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateProfile(
        @PathVariable Long id,
        @Valid @RequestBody com.makemytrip.makemytrip.dto.UpdateProfileRequestDto request,
        Authentication authentication
    ) {
        String authEmail = authentication != null ? authentication.getName() : null;
        UserResponseDto updated = userServices.updateProfile(id, request, authEmail);
        return ResponseEntity.ok(updated);
    }
}