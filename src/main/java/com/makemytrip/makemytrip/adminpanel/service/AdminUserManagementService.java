package com.makemytrip.makemytrip.adminpanel.service;

import com.makemytrip.makemytrip.adminpanel.dto.AdminBookingDTO;
import com.makemytrip.makemytrip.adminpanel.dto.AdminUserDTO;
import com.makemytrip.makemytrip.adminpanel.dto.AdminUserDetailDTO;
import com.makemytrip.makemytrip.exceptions.ResourceNotFoundException;
import com.makemytrip.makemytrip.models.Booking;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.BookingRepository;
import com.makemytrip.makemytrip.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminUserManagementService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public AdminUserManagementService(UserRepository userRepository, BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<AdminUserDTO> listUsers(String search, String role) {
        List<Users> all = userRepository.findAll();
        return all.stream()
            .filter(u -> {
                if (search != null && !search.isBlank()) {
                    String s = search.toLowerCase();
                    boolean nameMatch = u.getName() != null && u.getName().toLowerCase().contains(s);
                    boolean emailMatch = u.getEmail() != null && u.getEmail().toLowerCase().contains(s);
                    if (!nameMatch && !emailMatch) return false;
                }
                if (role != null && !role.isBlank()) {
                    return role.equalsIgnoreCase(u.getRole());
                }
                return true;
            })
            .sorted(Comparator.comparing(Users::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(AdminUserDTO::from)
            .collect(Collectors.toList());
    }

    public AdminUserDetailDTO getUserDetail(Long userId) {
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        List<Booking> bookings = bookingRepository.findByUser_Id(userId);
        List<AdminBookingDTO> bookingDTOs = bookings.stream()
            .map(AdminBookingDTO::from)
            .collect(Collectors.toList());
        return new AdminUserDetailDTO(AdminUserDTO.from(user), bookingDTOs);
    }

    /**
     * Update user role. Throws 403 if admin tries to change their own role.
     */
    public AdminUserDTO updateRole(Long userId, String newRole, String requestingAdminEmail) {
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Self-lockout protection
        if (user.getEmail().equalsIgnoreCase(requestingAdminEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Admins cannot modify their own role to prevent self-lockout.");
        }

        // Validate role
        if (!"ROLE_USER".equals(newRole) && !"ROLE_ADMIN".equals(newRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid role. Must be ROLE_USER or ROLE_ADMIN.");
        }

        user.setRole(newRole);
        Users saved = userRepository.save(user);
        return AdminUserDTO.from(saved);
    }
}

