package com.chat_application.server.Service.JWT;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Service
public class JWT_Service {
    private String secretKey;
    @Value("${jwt.secret:}")
    private String configuredSecret;

    JWT_Service(){ }

    @PostConstruct
    void initSecret() {
        if (configuredSecret != null && !configuredSecret.isBlank()) {
            // Use configured secret from application.properties
            this.secretKey = configuredSecret.trim();
        } else {
            // Fallback to generated secret for dev if not configured
            try {
                KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA256");
                SecretKey keys = keyGen.generateKey();
                this.secretKey = Base64.getEncoder().encodeToString(keys.getEncoded());
                System.out.println("[JWT] No jwt.secret configured; generated a temporary development secret.");
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

    
    public String generateToken(String username){
        Map<String,Object> claims = new HashMap<>(); 
    long expiryMillis = 1000L * 60 * 60 * 24; // 24 hours
    return Jwts.builder()
                    .claims()
                    .add(claims)
                    .subject(username)
                    .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + expiryMillis))
                    .and()
                    .signWith(getKey())
                    .compact();
    }

    private Key getKey() {
        byte[] keyByte = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyByte) ;
    }


    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }


    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date(System.currentTimeMillis()));
    }

    private java.util.Date extractExpiration(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }
}