package com.karigar.servlet;

import com.karigar.dao.BookingDao;
import com.karigar.util.JsonUtil;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/bookings")
public class BookingListServlet extends HttpServlet {
    private final BookingDao bookingDao = new BookingDao();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String userId = req.getParameter("userId");
            if (userId == null || userId.isBlank()) {
                JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "userId is required"));
                return;
            }
            String status = req.getParameter("status");
            if (status != null && !status.isBlank()) {
                String s = status.trim().toLowerCase();
                if (!"all".equals(s) && !"pending".equals(s) && !"completed".equals(s)) {
                    JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "status must be all, pending, or completed"));
                    return;
                }
                if ("all".equals(s)) {
                    status = null;
                }
            } else {
                status = null;
            }
            JSONArray bookings = bookingDao.getBookingsByUserId(userId, status);
            JsonUtil.writeJson(resp, 200, new JSONObject().put("bookings", bookings));
        } catch (Exception e) {
            JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Failed to fetch bookings"));
        }
    }
}
