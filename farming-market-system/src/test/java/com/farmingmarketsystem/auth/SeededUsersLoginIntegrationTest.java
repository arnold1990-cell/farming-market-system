package com.farmingmarketsystem.auth;

import com.farmingmarketsystem.dto.AuthDtos;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SeededUsersLoginIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void seededUsersShouldLoginWithExpectedRoles() {
        assertLogin("admin@farm.com", "Admin@123", "ADMIN");
        assertLogin("farmer@farm.com", "Farmer@123", "FARMER");
        assertLogin("buyer@farm.com", "Buyer@123", "BUYER");
        assertLogin("agent@farm.com", "Agent@123", "DELIVERY_AGENT");
    }

    private void assertLogin(String email, String password, String expectedRole) {
        AuthDtos.LoginRequest req = new AuthDtos.LoginRequest(email, password);
        ResponseEntity<AuthDtos.AuthResponse> response = restTemplate.postForEntity("/api/auth/login", req, AuthDtos.AuthResponse.class);

        assertEquals(HttpStatus.OK, response.getStatusCode(), "Login failed for " + email);
        assertNotNull(response.getBody(), "Missing response body for " + email);
        assertNotNull(response.getBody().token(), "Missing token for " + email);
        assertEquals(email, response.getBody().email(), "Wrong email in response for " + email);
        assertEquals(expectedRole, response.getBody().role().name(), "Wrong role for " + email);
    }
}
