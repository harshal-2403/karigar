package com.karigar.dao;

import com.karigar.config.ConnectionManager;
import com.karigar.util.PasswordUtil;
import org.json.JSONObject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserDao {
    public boolean emailExists(String email) throws SQLException {
        String sql = "SELECT COUNT(1) FROM app_users WHERE email = ?";
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, email.toLowerCase());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        }
        return false;
    }

    public long createUser(String name, String email, String passwordHash) throws SQLException {
        String nextIdSql = "SELECT COALESCE(MAX(id), 0) + 1 FROM app_users";
        String sql = "INSERT INTO app_users (id, name, email, password_hash) VALUES (?, ?, ?, ?)";
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement idPs = con.prepareStatement(nextIdSql);
             ResultSet idRs = idPs.executeQuery();
             PreparedStatement ps = con.prepareStatement(sql)) {
            long nextId = 1L;
            if (idRs.next()) {
                nextId = idRs.getLong(1);
            }
            ps.setLong(1, nextId);
            ps.setString(2, name);
            ps.setString(3, email.toLowerCase());
            ps.setString(4, passwordHash);
            ps.executeUpdate();
            return nextId;
        }
    }

    public JSONObject login(String email, String passwordHash) throws SQLException {
        String sql = "SELECT id, name, email FROM app_users WHERE email = ? AND password_hash = ?";
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, email.toLowerCase());
            ps.setString(2, passwordHash);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    JSONObject user = new JSONObject();
                    user.put("id", String.valueOf(rs.getLong("id")));
                    user.put("name", rs.getString("name"));
                    user.put("email", rs.getString("email"));
                    return user;
                }
            }
        }
        return null;
    }

    /**
     * @return true if a row was updated
     */
    public boolean updatePasswordHash(String email, String newPasswordHash) throws SQLException {
        String sql = "UPDATE app_users SET password_hash = ? WHERE email = ?";
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, newPasswordHash);
            ps.setString(2, email.toLowerCase());
            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Returns id, name, email for an existing row, or null if not found.
     */
    public JSONObject findUserByEmail(String email) throws SQLException {
        String sql = "SELECT id, name, email FROM app_users WHERE email = ?";
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, email.toLowerCase());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    JSONObject user = new JSONObject();
                    user.put("id", String.valueOf(rs.getLong("id")));
                    user.put("name", rs.getString("name"));
                    user.put("email", rs.getString("email"));
                    return user;
                }
            }
        }
        return null;
    }
}
