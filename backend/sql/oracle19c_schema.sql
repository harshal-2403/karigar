-- Run this script in Oracle 19c as your app schema user.

CREATE TABLE app_users (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(150) NOT NULL UNIQUE,
    password_hash VARCHAR2(256) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE workers (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(120) NOT NULL,
    phone VARCHAR2(20) NOT NULL,
    email VARCHAR2(150) NOT NULL,
    service VARCHAR2(50) NOT NULL,
    location VARCHAR2(120) NOT NULL,
    full_address VARCHAR2(500) NOT NULL,
    pincode VARCHAR2(6) NOT NULL,
    latitude VARCHAR2(40),
    longitude VARCHAR2(40),
    experience VARCHAR2(60),
    per_day_charges NUMBER(10,2) NOT NULL,
    description VARCHAR2(1000),
    active NUMBER(1) DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_workers_service ON workers(service);
CREATE INDEX idx_workers_pincode ON workers(pincode);

CREATE TABLE bookings (
    id NUMBER PRIMARY KEY,
    worker_id NUMBER NOT NULL REFERENCES workers(id),
    worker_name VARCHAR2(120) NOT NULL,
    worker_phone VARCHAR2(20) NOT NULL,
    service VARCHAR2(50) NOT NULL,
    user_id NUMBER NOT NULL REFERENCES app_users(id),
    user_name VARCHAR2(120) NOT NULL,
    user_email VARCHAR2(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    booking_time VARCHAR2(10) NOT NULL,
    status VARCHAR2(20) DEFAULT 'pending' NOT NULL,
    per_day_charges NUMBER(10,2) NOT NULL,
    total_price NUMBER(12,2) NOT NULL,
    day_count NUMBER(4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_worker ON bookings(worker_id);
