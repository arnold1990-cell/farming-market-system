package com.farmingmarketsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig {
    @Value("${APP_CORS_ALLOWED_ORIGIN_PATTERNS:}")
    private String configuredAllowedOriginPatterns;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(resolveAllowedOriginPatterns());
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        cfg.setExposedHeaders(List.of("Authorization", "Content-Type"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return new CorsFilter(src);
    }

    private List<String> resolveAllowedOriginPatterns() {
        Set<String> allowedOrigins = new LinkedHashSet<>(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://10.0.2.2:*",
                "http://192.168.*:*",
                "http://172.*:*",
                "http://10.*:*"
        ));

        if (configuredAllowedOriginPatterns == null || configuredAllowedOriginPatterns.isBlank()) {
            return List.copyOf(allowedOrigins);
        }

        allowedOrigins.addAll(Arrays.stream(configuredAllowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toSet()));

        return List.copyOf(allowedOrigins);
    }
}
