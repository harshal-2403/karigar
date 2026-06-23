package com.karigar.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public final class ConnectionManager {
    static {
        try {
            if (DbConfig.useH2()) {
                Class.forName("org.h2.Driver");
            } else {
                Class.forName("oracle.jdbc.OracleDriver");
            }
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("JDBC driver not found", e);
        }
    }

    private ConnectionManager() {
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
                DbConfig.getUrl(),
                DbConfig.getUsername(),
                DbConfig.getPassword()
        );
    }
}
