package com.makemytrip.makemytrip.adminpanel.dto;

import com.makemytrip.makemytrip.models.Hotel;

import java.math.BigDecimal;

public class AdminHotelDTO {

    private Long id;
    private String name;
    private String city;
    private String address;
    private Integer availableRooms;
    private Integer starRating;
    private BigDecimal pricePerNight;
    private Boolean active;
    private long bookingCount;
    private boolean hasActiveBookings;

    public AdminHotelDTO() {}

    public static AdminHotelDTO from(Hotel h, long bookingCount, int reservedRooms) {
        AdminHotelDTO dto = new AdminHotelDTO();
        dto.setId(h.getId());
        dto.setName(h.getName());
        dto.setCity(h.getCity());
        dto.setAddress(h.getAddress());
        dto.setAvailableRooms(h.getAvailableRooms());
        dto.setStarRating(h.getStarRating());
        dto.setPricePerNight(h.getPricePerNight());
        dto.setActive(h.getActive());
        dto.setBookingCount(bookingCount);
        dto.setHasActiveBookings(reservedRooms > 0);
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Integer getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(Integer availableRooms) { this.availableRooms = availableRooms; }
    public Integer getStarRating() { return starRating; }
    public void setStarRating(Integer starRating) { this.starRating = starRating; }
    public BigDecimal getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public long getBookingCount() { return bookingCount; }
    public void setBookingCount(long bookingCount) { this.bookingCount = bookingCount; }
    public boolean isHasActiveBookings() { return hasActiveBookings; }
    public void setHasActiveBookings(boolean hasActiveBookings) { this.hasActiveBookings = hasActiveBookings; }
}

