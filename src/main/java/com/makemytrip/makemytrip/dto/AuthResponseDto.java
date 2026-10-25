package com.makemytrip.makemytrip.dto;

import com.makemytrip.makemytrip.models.Users;

public class AuthResponseDto {

    private String token;
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;

    public AuthResponseDto() {}

    public AuthResponseDto(String token, Long id, String name, String email, String phone, String role) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
    }

    public static AuthResponseDto fromUserAndToken(Users user, String token) {
        return new AuthResponseDto(
            token,
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole()
        );
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
