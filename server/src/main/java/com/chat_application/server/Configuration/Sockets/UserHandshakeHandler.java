package com.chat_application.server.Configuration.Sockets;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import com.chat_application.server.Service.JWT.JWT_Service;

public class UserHandshakeHandler extends DefaultHandshakeHandler {

    private final JWT_Service jwtService;

    public UserHandshakeHandler(JWT_Service jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected Principal determineUser(@NonNull ServerHttpRequest request, @NonNull WebSocketHandler wsHandler,
            @NonNull Map<String, Object> attributes) {

        String token = extractToken(request);
        if (token != null) {
            try {
                String username = jwtService.extractUsername(token);
                if (username != null) {
                    return new StompPrincipal(username);
                }
            } catch (Exception ignored) {
            }
        }
        return super.determineUser(request, wsHandler, attributes);
    }

    @Nullable
    private String extractToken(ServerHttpRequest request) {
        // Try Authorization header first
        List<String> auth = request.getHeaders().get("Authorization");
        if (auth != null && !auth.isEmpty()) {
            String header = auth.get(0);
            if (header.startsWith("Bearer ")) {
                return header.substring(7);
            }
        }
        // Then query param ?token=...
        String uri = request.getURI().toString();
        int idx = uri.indexOf("token=");
        if (idx > -1) {
            String sub = uri.substring(idx + 6);
            int amp = sub.indexOf('&');
            return amp > -1 ? sub.substring(0, amp) : sub;
        }
        return null;
    }

    private static final class StompPrincipal implements Principal {
        private final String name;
        private StompPrincipal(String name) { this.name = name; }
        @Override public String getName() { return name; }
    }
}
