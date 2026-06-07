package com.farmingmarketsystem.config;

import com.farmingmarketsystem.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/register", "/api/auth/login", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/ussd", "/api/ussd/product").permitAll()
                        .requestMatchers("/api/payments/orange-money/callback", "/api/payments/myzaka/callback").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/health",
                                "/api/farmers",
                                "/api/farmers/map",
                                "/api/farmers/nearby",
                                "/api/farmers/public/**",
                                "/api/public/**",
                                "/api/marketplace/**",
                                "/api/products",
                                "/api/products/map",
                                "/api/products/**",
                                "/api/categories",
                                "/api/categories/**",
                                "/api/reviews/products/**",
                                "/uploads/**"
                        ).permitAll()
                        .requestMatchers("/api/users/me").authenticated()
                        .requestMatchers("/api/cart/**", "/api/orders/my-orders", "/api/orders/place", "/api/orders/checkout", "/api/buyer/orders", "/api/reviews/**", "/api/checkout/**", "/api/payments/online/**", "/api/payments/orange-money/initiate", "/api/payments/myzaka/initiate").hasRole("BUYER")
                        .requestMatchers(HttpMethod.POST, "/api/products", "/api/farmer/products", "/api/products/*/images").hasAnyRole("FARMER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/*", "/api/farmer/products/*").hasAnyRole("FARMER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/products/*/availability", "/api/farmer/products/*/availability", "/api/products/*/images/reorder", "/api/products/images/*").hasAnyRole("FARMER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/*", "/api/farmer/products/*", "/api/products/images/*").hasAnyRole("FARMER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/location/update").hasAnyRole("FARMER", "ADMIN")
                        .requestMatchers("/api/farmer/**", "/api/products/my-products", "/api/products/farmer/dashboard", "/api/orders/farmer", "/api/products/*/orders", "/api/payments/cash/**").hasAnyRole("FARMER","ADMIN")
                        .requestMatchers("/api/delivery/agent/**").hasRole("DELIVERY_AGENT")
                        .requestMatchers("/api/payments/mock/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**", "/api/categories/**", "/api/users/**", "/api/orders/all", "/api/delivery/assign").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
