package com.farmingmarketsystem.repository;
import com.farmingmarketsystem.model.Currency;
import com.farmingmarketsystem.model.AvailabilityStatus;
import com.farmingmarketsystem.model.Product;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByFarmerId(Long farmerId);
    List<Product> findByAvailabilityStatusOrderByCreatedAtDesc(AvailabilityStatus availabilityStatus);
    List<Product> findByAvailabilityStatus(AvailabilityStatus availabilityStatus);
    List<Product> findByAvailabilityStatusAndFeaturedTrue(AvailabilityStatus availabilityStatus);
    List<Product> findByAvailableTrueOrderByCreatedAtDesc();
    @Query("select p from Product p where (p.availabilityStatus = com.farmingmarketsystem.model.AvailabilityStatus.AVAILABLE or p.available = true) order by p.createdAt desc")
    List<Product> findPublicProducts();
    @Query("""
            select p from Product p
            where (:categoryId is null or p.category.id = :categoryId)
            and (:location is null or :location = '' or p.locationName like concat('%', :location, '%'))
            and (:keyword is null or :keyword = '' or p.name like concat('%', :keyword, '%') or p.description like concat('%', :keyword, '%'))
            """)
    List<Product> search(Long categoryId, String location, String keyword);

    @Query("""
            select p from Product p
            where (p.availabilityStatus = com.farmingmarketsystem.model.AvailabilityStatus.AVAILABLE or p.available = true)
              and (:featured is null or p.featured = :featured)
              and (:categoryId is null or p.category.id = :categoryId)
              and (:currency is null or p.currency = :currency)
              and (
                    :location is null
                    or :location = ''
                    or p.pickupAddress like concat('%', :location, '%')
                    or p.locationName like concat('%', :location, '%')
                  )
              and (:search is null or :search = '' or p.name like concat('%', :search, '%'))
              and (:minPrice is null or p.price >= :minPrice)
              and (:maxPrice is null or p.price <= :maxPrice)
            order by p.createdAt desc
            """)
    List<Product> publicSearch(@Param("featured") Boolean featured,
                               @Param("categoryId") Long categoryId,
                               @Param("currency") Currency currency,
                               @Param("location") String location,
                               @Param("search") String search,
                               @Param("minPrice") java.math.BigDecimal minPrice,
                               @Param("maxPrice") java.math.BigDecimal maxPrice);
}
