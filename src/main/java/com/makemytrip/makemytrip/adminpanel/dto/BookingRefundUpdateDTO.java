package com.makemytrip.makemytrip.adminpanel.dto;

public class BookingRefundUpdateDTO {

    private String newStatus; // CONFIRMED | CANCELLED | REFUND_PENDING | REFUNDED

    public BookingRefundUpdateDTO() {}

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
}

