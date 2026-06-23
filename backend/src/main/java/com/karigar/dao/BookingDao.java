package com.karigar.dao;

import com.karigar.config.ConnectionManager;
import org.json.JSONArray;
import org.json.JSONObject;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class BookingDao {

    /** org.json optDouble returns NaN for null/missing in some cases; BigDecimal.valueOf(NaN) throws. */
    private static BigDecimal readMoney(JSONObject o, String key) {
        if (!o.has(key) || JSONObject.NULL.equals(o.opt(key))) {
            return BigDecimal.ZERO;
        }
        Object raw = o.opt(key);
        if (raw instanceof Number) {
            double d = ((Number) raw).doubleValue();
            if (Double.isNaN(d) || Double.isInfinite(d)) {
                return BigDecimal.ZERO;
            }
            return BigDecimal.valueOf(d).setScale(2, RoundingMode.HALF_UP);
        }
        String s = o.optString(key, "").trim();
        if (s.isEmpty()) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(s).setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private static int readDayCount(JSONObject o) {
        if (!o.has("dayCount") || JSONObject.NULL.equals(o.opt("dayCount"))) {
            return 1;
        }
        int v = o.optInt("dayCount", 1);
        return v < 1 ? 1 : Math.min(v, 9999);
    }

    /**
     * Synchronized so concurrent requests do not read the same MAX(id)+1 (ORA-00001 on bookings PK).
     */
    public synchronized long createBooking(JSONObject payload) throws SQLException {
        String nextIdSql = "SELECT COALESCE(MAX(id), 0) + 1 FROM bookings";
        String sql = "INSERT INTO bookings (id, worker_id, worker_name, worker_phone, service, user_id, user_name, user_email, start_date, end_date, booking_time, status, per_day_charges, total_price, day_count) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection con = ConnectionManager.getConnection()) {
            long nextId = 1L;
            try (PreparedStatement idPs = con.prepareStatement(nextIdSql);
                 ResultSet idRs = idPs.executeQuery()) {
                if (idRs.next()) {
                    nextId = idRs.getLong(1);
                }
            }

            try (PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setLong(1, nextId);
                ps.setLong(2, Long.parseLong(payload.optString("workerId")));
                ps.setString(3, payload.optString("workerName"));
                ps.setString(4, payload.optString("workerPhone"));
                ps.setString(5, payload.optString("service"));
                ps.setLong(6, Long.parseLong(payload.optString("userId")));
                ps.setString(7, payload.optString("userName"));
                ps.setString(8, payload.optString("userEmail"));
                ps.setDate(9, Date.valueOf(payload.optString("startDate")));
                ps.setDate(10, Date.valueOf(payload.optString("endDate")));
                ps.setString(11, payload.optString("time"));
                ps.setString(12, payload.optString("status", "pending"));
                ps.setBigDecimal(13, readMoney(payload, "perDayCharges"));
                ps.setBigDecimal(14, readMoney(payload, "totalPrice"));
                ps.setInt(15, readDayCount(payload));
                ps.executeUpdate();
                return nextId;
            }
        }
    }

    public JSONArray getBookingsByUserId(String userId) throws SQLException {
        return getBookingsByUserId(userId, null);
    }

    /**
     * @param statusFilter "pending", "completed", or null/"all" for every status
     */
    public JSONArray getBookingsByUserId(String userId, String statusFilter) throws SQLException {
        StringBuilder sql = new StringBuilder(
                "SELECT id, worker_id, worker_name, worker_phone, service, start_date, end_date, booking_time, status, total_price, day_count, per_day_charges "
                        + "FROM bookings WHERE user_id = ?");
        String f = statusFilter == null ? "all" : statusFilter.trim().toLowerCase();
        if ("pending".equals(f)) {
            sql.append(" AND LOWER(TRIM(COALESCE(status, 'pending'))) = 'pending'");
        } else if ("completed".equals(f)) {
            sql.append(" AND LOWER(TRIM(status)) IN ('completed', 'confirmed')");
        }
        sql.append(" ORDER BY created_at DESC");

        JSONArray arr = new JSONArray();
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql.toString())) {
            ps.setLong(1, Long.parseLong(userId));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    JSONObject b = new JSONObject();
                    b.put("id", String.valueOf(rs.getLong("id")));
                    b.put("workerId", String.valueOf(rs.getLong("worker_id")));
                    b.put("workerName", rs.getString("worker_name"));
                    b.put("workerPhone", rs.getString("worker_phone"));
                    b.put("service", rs.getString("service"));
                    b.put("startDate", rs.getDate("start_date").toString());
                    b.put("endDate", rs.getDate("end_date").toString());
                    b.put("time", rs.getString("booking_time"));
                    b.put("status", rs.getString("status"));
                    b.put("totalPrice", rs.getBigDecimal("total_price"));
                    b.put("dayCount", rs.getInt("day_count"));
                    b.put("perDayCharges", rs.getBigDecimal("per_day_charges"));
                    arr.put(b);
                }
            }
        }
        return arr;
    }

    /**
     * Updates status for a booking only if it belongs to the user. Allowed: completed, cancelled.
     */
    public boolean updateStatusForUser(long bookingId, long userId, String newStatus) throws SQLException {
        String s = newStatus == null ? "" : newStatus.trim().toLowerCase();
        if (!"completed".equals(s) && !"cancelled".equals(s)) {
            throw new IllegalArgumentException("status must be completed or cancelled");
        }
        String sql = "UPDATE bookings SET status = ? WHERE id = ? AND user_id = ?";
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, s);
            ps.setLong(2, bookingId);
            ps.setLong(3, userId);
            return ps.executeUpdate() == 1;
        }
    }
}
