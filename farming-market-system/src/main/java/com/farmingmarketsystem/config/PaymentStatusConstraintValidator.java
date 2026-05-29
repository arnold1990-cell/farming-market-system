package com.farmingmarketsystem.config;

import com.farmingmarketsystem.model.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Arrays;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentStatusConstraintValidator implements ApplicationRunner {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @Override
    public void run(ApplicationArguments args) {
        try (Connection connection = dataSource.getConnection()) {
            String product = connection.getMetaData().getDatabaseProductName();
            if (product == null || !product.toLowerCase().contains("postgresql")) return;

            String definition = jdbcTemplate.query(
                    "SELECT pg_get_constraintdef(c.oid) " +
                            "FROM pg_constraint c " +
                            "JOIN pg_class t ON c.conrelid = t.oid " +
                            "WHERE t.relname = 'payment' AND c.conname = 'payment_status_check'",
                    rs -> rs.next() ? rs.getString(1) : null
            );
            if (definition == null) {
                log.warn("payment_status_check constraint was not found on payment table.");
                return;
            }

            Set<String> dbValues = extractQuotedValues(definition);
            Set<String> enumValues = Arrays.stream(PaymentStatus.values()).map(Enum::name).collect(Collectors.toCollection(TreeSet::new));
            if (!dbValues.equals(enumValues)) {
                log.warn("payment_status_check values do not match PaymentStatus enum. DB={}, ENUM={}", dbValues, enumValues);
            }
        } catch (Exception ex) {
            log.warn("Could not validate payment_status_check at startup: {}", ex.getMessage());
        }
    }

    private Set<String> extractQuotedValues(String definition) {
        Pattern p = Pattern.compile("'([A-Z_]+)'");
        Matcher m = p.matcher(definition);
        Set<String> values = new TreeSet<>();
        while (m.find()) values.add(m.group(1));
        return values;
    }
}
