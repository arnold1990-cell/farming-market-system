-- Run this on PostgreSQL if product location columns were accidentally created as bytea.
ALTER TABLE product
ALTER COLUMN pickup_address TYPE TEXT USING convert_from(pickup_address, 'UTF8');

ALTER TABLE product
ALTER COLUMN location_name TYPE TEXT USING convert_from(location_name, 'UTF8');
