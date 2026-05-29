package com.farmingmarketsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FarmingMarketSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(FarmingMarketSystemApplication.class, args);
    }
}
