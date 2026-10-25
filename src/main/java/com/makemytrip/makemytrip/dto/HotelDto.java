package com.makemytrip.makemytrip.dto;

import com.makemytrip.makemytrip.models.Hotel;

import java.math.BigDecimal;

public class HotelDto {

    private Long id;
    private String name;
    private String hotelName;
    private String city;
    private String location;
    private String address;
    private BigDecimal pricePerNight;
    private Integer availableRooms;
    private Integer starRating;
    private Boolean active;

    public HotelDto() {}

    public static HotelDto fromEntity(Hotel hotel) {
        if (hotel == null) return null;
        HotelDto dto = new HotelDto();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setHotelName(hotel.getName());
        dto.setCity(hotel.getCity());
        dto.setLocation(hotel.getCity());
        dto.setAddress(hotel.getAddress());
        dto.setPricePerNight(hotel.getPricePerNight());
        dto.setAvailableRooms(hotel.getAvailableRooms());
        dto.setStarRating(hotel.getStarRating());
        dto.setActive(hotel.getActive());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public BigDecimal getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(BigDecimal pricePerNight) { this.pricePerNight = pricePerNight; }

    public Integer getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(Integer availableRooms) { this.availableRooms = availableRooms; }

    public Integer getStarRating() { return starRating; }
    public void setStarRating(Integer starRating) { this.starRating = starRating; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
