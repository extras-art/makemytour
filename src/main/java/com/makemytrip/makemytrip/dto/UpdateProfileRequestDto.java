package com.makemytrip.makemytrip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateProfileRequestDto {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @Pattern(
        regexp = "^$|^[0-9+\\-\\s()]{10,15}$",
        message = "Invalid phone number format"
    )
    private String phone;

    public UpdateProfileRequestDto() {}

    public UpdateProfileRequestDto(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
