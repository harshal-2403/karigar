-- Run once on Oracle if you already applied oracle19c_schema.sql before this feature.

CREATE TABLE password_reset_otps (
    email VARCHAR2(150) PRIMARY KEY,
    otp_hash VARCHAR2(256) NOT NULL,
    expires_at TIMESTAMP NOT NULL
);
