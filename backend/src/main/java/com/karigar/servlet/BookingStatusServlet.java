package com.karigar.servlet;

import com.karigar.dao.BookingDao;
import com.karigar.util.JsonUtil;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/api/bookings/status")
public class BookingStatusServlet extends HttpServlet {
    private final BookingDao bookingDao = new BookingDao();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            JSONObject body;
            try {
                body = JsonUtil.readJsonBody(req);
            } catch (IOException e) {
                if (e.getCause() instanceof JSONException) {
                    JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "Invalid JSON body"));
                    return;
                }
                throw e;
            }
            String userId = body.optString("userId").trim();
            String bookingId = body.optString("bookingId").trim();
            String status = body.optString("status").trim();

            if (userId.isEmpty() || bookingId.isEmpty() || status.isEmpty()) {
                JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "userId, bookingId, and status are required"));
                return;
            }

            long bid = Long.parseLong(bookingId);
            long uid = Long.parseLong(userId);

            boolean ok = bookingDao.updateStatusForUser(bid, uid, status);
            if (!ok) {
                JsonUtil.writeJson(resp, 404, new JSONObject().put("message", "Booking not found or access denied"));
                return;
            }
            JsonUtil.writeJson(resp, 200, new JSONObject().put("message", "Status updated").put("status", status.toLowerCase()));
        } catch (NumberFormatException e) {
            JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "Invalid userId or bookingId"));
        } catch (IllegalArgumentException e) {
            JsonUtil.writeJson(resp, 400, new JSONObject().put("message", e.getMessage()));
        } catch (SQLException e) {
            JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Failed to update booking"));
        }
    }
}
