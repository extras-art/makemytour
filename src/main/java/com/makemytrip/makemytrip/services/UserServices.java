package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.config.JwtUtil;
import com.makemytrip.makemytrip.dto.AuthResponseDto;
import com.makemytrip.makemytrip.dto.LoginRequestDto;
import com.makemytrip.makemytrip.dto.RegisterRequestDto;
import com.makemytrip.makemytrip.dto.UserResponseDto;
import com.makemytrip.makemytrip.exceptions.ResourceNotFoundException;
import com.makemytrip.makemytrip.exceptions.UserAlreadyExistsException;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServices {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserServices(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new UserAlreadyExistsException("Email is already registered");
        }

        Users user = new Users();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() != null && !request.getRole().isBlank()
            ? request.getRole()
            : "ROLE_USER"
        );

        Users savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser);
        return AuthResponseDto.fromUserAndToken(savedUser, token);
    }

    @Transactional
    public Users register(Users user) {
        if (userRepository.existsByEmailIgnoreCase(user.getEmail())) {
            throw new UserAlreadyExistsException("Email is already registered");
        }

        user.setEmail(user.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("ROLE_USER");
        }
        return userRepository.save(user);
    }

    public AuthResponseDto login(LoginRequestDto request) {
        Users user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);
        return AuthResponseDto.fromUserAndToken(user, token);
    }

    public UserResponseDto getCurrentUser(String email) {
        Users user = userRepository.findByEmailIgnoreCase(email.trim())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserResponseDto.fromEntity(user);
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
            .map(UserResponseDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public UserResponseDto updateProfile(Long id, com.makemytrip.makemytrip.dto.UpdateProfileRequestDto request, String authEmail) {
        Users user = null;
        if (authEmail != null) {
            user = userRepository.findByEmailIgnoreCase(authEmail).orElse(null);
        }
        if (user == null && id != null) {
            user = userRepository.findById(id).orElse(null);
        }
        if (user == null) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }

        user.setName(request.getName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        Users saved = userRepository.save(user);
        return UserResponseDto.fromEntity(saved);
    }
}