package com.farmingmarketsystem.repository;
import com.farmingmarketsystem.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface DeliveryRepository extends JpaRepository<Delivery, Long> { Optional<Delivery> findByOrderId(Long orderId); List<Delivery> findByDeliveryAgentId(Long agentId); }
