package com.makemytrip.makemytrip.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 15;
    private static final long WINDOW_MS = 60_000L; // 1 minute

    private final Map<String, Deque<Long>> clientRequestLog = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String uri = request.getRequestURI();

        // Rate limit sensitive auth endpoints: /api/users/login and /api/users/register
        if ("POST".equalsIgnoreCase(request.getMethod()) &&
            (uri.endsWith("/api/users/login") || uri.endsWith("/api/users/register"))) {

            String clientIp = extractClientIp(request);
            long now = Instant.now().toEpochMilli();

            Deque<Long> timestamps = clientRequestLog.computeIfAbsent(
                clientIp + ":" + uri,
                k -> new ArrayDeque<>()
            );

            synchronized (timestamps) {
                // Evict timestamps older than 1 minute
                while (!timestamps.isEmpty() && (now - timestamps.peekFirst()) > WINDOW_MS) {
                    timestamps.pollFirst();
                }

                if (timestamps.size() >= MAX_REQUESTS_PER_MINUTE) {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setHeader("Retry-After", "60");
                    response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
                    response.setHeader("X-RateLimit-Remaining", "0");

                    String json = String.format(
                        "{\"timestamp\":\"%s\",\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many attempts from this IP. Please wait 1 minute before trying again.\",\"path\":\"%s\"}",
                        LocalDateTime.now(), uri
                    );
                    response.getWriter().write(json);
                    return;
                }

                timestamps.addLast(now);
                response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
                response.setHeader("X-RateLimit-Remaining", String.valueOf(MAX_REQUESTS_PER_MINUTE - timestamps.size()));
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }
}
