package com.karigar.dao;

import com.karigar.config.ConnectionManager;
import org.json.JSONArray;
import org.json.JSONObject;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class WorkerDao {
    public long createWorker(JSONObject payload) throws SQLException {
        String nextIdSql = "SELECT COALESCE(MAX(id), 0) + 1 FROM workers";
        String sql = "INSERT INTO workers (id, name, phone, email, service, location, full_address, pincode, latitude, longitude, experience, per_day_charges, description) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement idPs = con.prepareStatement(nextIdSql);
             ResultSet idRs = idPs.executeQuery();
             PreparedStatement ps = con.prepareStatement(sql)) {
            long nextId = 1L;
            if (idRs.next()) {
                nextId = idRs.getLong(1);
            }

            ps.setLong(1, nextId);
            ps.setString(2, payload.optString("name"));
            ps.setString(3, payload.optString("phone"));
            ps.setString(4, payload.optString("email").toLowerCase());
            ps.setString(5, payload.optString("service"));
            ps.setString(6, payload.optString("location"));
            ps.setString(7, payload.optString("fullAddress"));
            ps.setString(8, payload.optString("pincode"));
            ps.setString(9, payload.optString("latitude", null));
            ps.setString(10, payload.optString("longitude", null));
            ps.setString(11, payload.optString("experience", null));
            ps.setBigDecimal(12, BigDecimal.valueOf(payload.optDouble("perDayCharges")));
            ps.setString(13, payload.optString("description", null));
            ps.executeUpdate();
            return nextId;
        }
    }

    public JSONArray getWorkers(String service, String pincode) throws SQLException {
        StringBuilder sql = new StringBuilder(
                "SELECT id, name, phone, email, service, location, full_address, pincode, experience, per_day_charges, description " +
                        "FROM workers WHERE active = 1"
        );
        boolean hasService = service != null && !service.isBlank();
        boolean hasPincode = pincode != null && !pincode.isBlank();

        if (hasService) {
            sql.append(" AND service = ?");
        }
        if (hasPincode) {
            sql.append(" AND pincode = ?");
        }
        sql.append(" ORDER BY created_at DESC");

        JSONArray workers = new JSONArray();
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql.toString())) {
            int idx = 1;
            if (hasService) {
                ps.setString(idx++, service);
            }
            if (hasPincode) {
                ps.setString(idx, pincode);
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    JSONObject worker = new JSONObject();
                    worker.put("_id", String.valueOf(rs.getLong("id")));
                    worker.put("name", rs.getString("name"));
                    worker.put("phone", rs.getString("phone"));
                    worker.put("email", rs.getString("email"));
                    worker.put("service", rs.getString("service"));
                    worker.put("location", rs.getString("location"));
                    worker.put("fullAddress", rs.getString("full_address"));
                    worker.put("pincode", rs.getString("pincode"));
                    worker.put("experience", rs.getString("experience"));
                    worker.put("perDayCharges", rs.getBigDecimal("per_day_charges"));
                    worker.put("description", rs.getString("description"));
                    workers.put(worker);
                }
            }
        }
        return workers;
    }
}
