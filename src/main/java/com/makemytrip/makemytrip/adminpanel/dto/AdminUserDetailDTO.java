package com.makemytrip.makemytrip.adminpanel.dto;

import java.util.List;

public class AdminUserDetailDTO {

    private AdminUserDTO user;
    private List<AdminBookingDTO> bookings;

    public AdminUserDetailDTO() {}

    public AdminUserDetailDTO(AdminUserDTO user, List<AdminBookingDTO> bookings) {
        this.user = user;
        this.bookings = bookings;
    }

    public AdminUserDTO getUser() { return user; }
    public void setUser(AdminUserDTO user) { this.user = user; }
    public List<AdminBookingDTO> getBookings() { return bookings; }
    public void setBookings(List<AdminBookingDTO> bookings) { this.bookings = bookings; }
}

