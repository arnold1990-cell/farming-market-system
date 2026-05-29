package com.farmingmarketsystem.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "payments")
public class PaymentProviderProperties {
    private Provider orangeMoney = new Provider();
    private Provider myzaka = new Provider();

    @Getter
    @Setter
    public static class Provider {
        private boolean enabled = false;
        private String baseUrl = "";
        private String merchantId = "";
        private String apiKey = "";
        private String callbackUrl = "";
    }
}
