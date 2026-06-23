package com.karigar.dao;

import com.karigar.config.ConnectionManager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

/**
 * Stores one-time OTP hashes for password reset (email → hash + expiry).
 */
public class PasswordResetDao {

    public void saveOtp(String email, String otpHash, Timestamp expiresAt) throws SQLException {
        String normalized = email.toLowerCase().trim();
        String delete = "DELETE FROM password_reset_otps WHERE email = ?";
        String insert = "INSERT INTO password_reset_otps (email, otp_hash, expires_at) VALUES (?, ?, ?)";
        try (Connection con = ConnectionManager.getConnection()) {
            try (PreparedStatement del = con.prepareStatement(delete)) {
                del.setString(1, normalized);
                del.executeUpdate();
            }
            try (PreparedStatement ps = con.prepareStatement(insert)) {
                ps.setString(1, normalized);
                ps.setString(2, otpHash);
                ps.setTimestamp(3, expiresAt);
                ps.executeUpdate();
            }
        }
    }

    /**
     * @return stored hash if row exists and not expired; otherwise null
     */
    public String getValidOtpHash(String email) throws SQLException {
        String normalized = email.toLowerCase().trim();
        String sql = "SELECT otp_hash, expires_at FROM password_reset_otps WHERE email = ?";
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, normalized);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }
                Timestamp exp = rs.getTimestamp("expires_at");
                if (exp == null || exp.before(new Timestamp(System.currentTimeMillis()))) {
                    deleteByEmail(normalized);
                    return null;
                }
                return rs.getString("otp_hash");
            }
        }
    }

    public void deleteByEmail(String email) throws SQLException {
        String normalized = email.toLowerCase().trim();
        String sql = "DELETE FROM password_reset_otps WHERE email = ?";
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, normalized);
            ps.executeUpdate();
        }
    }
}
