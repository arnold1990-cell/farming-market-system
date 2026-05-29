package com.farmingmarketsystem.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;

@Configuration
@RequiredArgsConstructor
public class PostgresProductLocationSchemaFixConfig {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @Bean
    public CommandLineRunner fixProductLocationColumnTypes() {
        return args -> {
            if (!isPostgres()) {
                return;
            }
            String pickupType = columnType("pickup_address");
            String locationType = columnType("location_name");

            if ("bytea".equalsIgnoreCase(pickupType)) {
                jdbcTemplate.execute("ALTER TABLE product ALTER COLUMN pickup_address TYPE TEXT USING convert_from(pickup_address, 'UTF8')");
                System.out.println("Migrated product.pickup_address from bytea to text");
            }
            if ("bytea".equalsIgnoreCase(locationType)) {
                jdbcTemplate.execute("ALTER TABLE product ALTER COLUMN location_name TYPE TEXT USING convert_from(location_name, 'UTF8')");
                System.out.println("Migrated product.location_name from bytea to text");
            }
        };
    }

    private String columnType(String columnName) {
        return jdbcTemplate.queryForObject(
                "select data_type from information_schema.columns where table_name = 'product' and column_name = ?",
                String.class,
                columnName
        );
    }

    private boolean isPostgres() {
        try (Connection connection = dataSource.getConnection()) {
            String productName = connection.getMetaData().getDatabaseProductName();
            return productName != null && productName.toLowerCase().contains("postgresql");
        } catch (Exception ignored) {
            return false;
        }
    }
}
