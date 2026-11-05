package com.makemytrip.makemytrip.dynamicpricing.service;

import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.Month;

@Component
public class SeasonalCalendarHelper {

    public double getSeasonalMultiplierPct(LocalDateTime dateTime) {
        if (dateTime == null) {
            dateTime = LocalDateTime.now();
        }

        Month month = dateTime.getMonth();
        int dayOfMonth = dateTime.getDayOfMonth();
        DayOfWeek dow = dateTime.getDayOfWeek();

        double multiplier = 0.0;

        // 1. Diwali / Festive window: Oct 15 – Nov 15 (+18%)
        if ((month == Month.OCTOBER && dayOfMonth >= 15) || (month == Month.NOVEMBER && dayOfMonth <= 15)) {
            multiplier = Math.max(multiplier, 18.0);
        }

        // 2. Christmas / New Year: Dec 20 – Jan 5 (+20%)
        if ((month == Month.DECEMBER && dayOfMonth >= 20) || (month == Month.JANUARY && dayOfMonth <= 5)) {
            multiplier = Math.max(multiplier, 20.0);
        }

        // 3. Summer peak: May 1 – May 31 (+15%)
        if (month == Month.MAY) {
            multiplier = Math.max(multiplier, 15.0);
        }

        // 4. Weekend surge: Friday, Saturday, Sunday travel (+15%)
        if (dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            multiplier = Math.max(multiplier, 15.0);
        }

        return multiplier;
    }

    public String getSeasonLabel(LocalDateTime dateTime) {
        if (dateTime == null) {
            dateTime = LocalDateTime.now();
        }

        Month month = dateTime.getMonth();
        int dayOfMonth = dateTime.getDayOfMonth();
        DayOfWeek dow = dateTime.getDayOfWeek();

        if ((month == Month.OCTOBER && dayOfMonth >= 15) || (month == Month.NOVEMBER && dayOfMonth <= 15)) {
            return "Diwali & Festive Window";
        }
        if ((month == Month.DECEMBER && dayOfMonth >= 20) || (month == Month.JANUARY && dayOfMonth <= 5)) {
            return "Year-End Holiday Surge";
        }
        if (month == Month.MAY) {
            return "Summer Vacation Peak";
        }
        if (dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return "Weekend Travel Surge";
        }
        return "Regular Calendar Window";
    }
}

