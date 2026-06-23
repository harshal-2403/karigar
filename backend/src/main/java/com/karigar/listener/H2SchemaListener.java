package com.karigar.listener;

import com.karigar.config.ConnectionManager;
import com.karigar.config.DbConfig;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Creates tables in embedded H2 on first startup (when {@link DbConfig#useH2()}).
 */
public class H2SchemaListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        if (!DbConfig.useH2()) {
            return;
        }
        try (Connection con = ConnectionManager.getConnection()) {
            applySchema(con);
        } catch (SQLException e) {
            throw new RuntimeException("H2 schema init failed: " + e.getMessage(), e);
        }
    }

    private static void applySchema(Connection con) throws SQLException {
        try (Statement st = con.createStatement()) {
            st.execute("CREATE TABLE IF NOT EXISTS app_users ("
                    + "id BIGINT PRIMARY KEY,"
                    + "name VARCHAR(100) NOT NULL,"
                    + "email VARCHAR(150) NOT NULL UNIQUE,"
                    + "password_hash VARCHAR(256) NOT NULL,"
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL"
                    + ")");
            st.execute("CREATE TABLE IF NOT EXISTS workers ("
                    + "id BIGINT PRIMARY KEY,"
                    + "name VARCHAR(120) NOT NULL,"
                    + "phone VARCHAR(20) NOT NULL,"
                    + "email VARCHAR(150) NOT NULL,"
                    + "service VARCHAR(50) NOT NULL,"
                    + "location VARCHAR(120) NOT NULL,"
                    + "full_address VARCHAR(500) NOT NULL,"
                    + "pincode VARCHAR(6) NOT NULL,"
                    + "latitude VARCHAR(40),"
                    + "longitude VARCHAR(40),"
                    + "experience VARCHAR(60),"
                    + "per_day_charges DECIMAL(10,2) NOT NULL,"
                    + "description VARCHAR(1000),"
                    + "active INTEGER DEFAULT 1 NOT NULL,"
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL"
                    + ")");
            st.execute("CREATE TABLE IF NOT EXISTS bookings ("
                    + "id BIGINT PRIMARY KEY,"
                    + "worker_id BIGINT NOT NULL REFERENCES workers(id),"
                    + "worker_name VARCHAR(120) NOT NULL,"
                    + "worker_phone VARCHAR(20) NOT NULL,"
                    + "service VARCHAR(50) NOT NULL,"
                    + "user_id BIGINT NOT NULL REFERENCES app_users(id),"
                    + "user_name VARCHAR(120) NOT NULL,"
                    + "user_email VARCHAR(150) NOT NULL,"
                    + "start_date DATE NOT NULL,"
                    + "end_date DATE NOT NULL,"
                    + "booking_time VARCHAR(10) NOT NULL,"
                    + "status VARCHAR(20) DEFAULT 'pending' NOT NULL,"
                    + "per_day_charges DECIMAL(10,2) NOT NULL,"
                    + "total_price DECIMAL(12,2) NOT NULL,"
                    + "day_count INTEGER NOT NULL,"
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL"
                    + ")");
            st.execute("CREATE INDEX IF NOT EXISTS idx_workers_service ON workers(service)");
            st.execute("CREATE INDEX IF NOT EXISTS idx_workers_pincode ON workers(pincode)");
            st.execute("CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id)");
            st.execute("CREATE INDEX IF NOT EXISTS idx_bookings_worker ON bookings(worker_id)");
            st.execute("CREATE TABLE IF NOT EXISTS password_reset_otps ("
                    + "email VARCHAR(150) PRIMARY KEY,"
                    + "otp_hash VARCHAR(256) NOT NULL,"
                    + "expires_at TIMESTAMP NOT NULL"
                    + ")");
        }
    }
}
