package com.karigar.servlet;

import com.karigar.dao.BookingDao;
import com.karigar.util.JsonUtil;
import com.karigar.util.OracleSqlErrors;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/api/bookings/create")
public class BookingCreateServlet extends HttpServlet {
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
            String[] required = {"workerId", "userId", "startDate", "endDate", "time", "workerName", "workerPhone", "service", "userName", "userEmail"};
            for (String field : required) {
                if (body.optString(field).trim().isEmpty()) {
                    JsonUtil.writeJson(resp, 400, new JSONObject().put("message", field + " is required"));
                    return;
                }
            }

            long id = bookingDao.createBooking(body);
            JsonUtil.writeJson(resp, 201, new JSONObject()
                    .put("message", "Booking created")
                    .put("id", String.valueOf(id)));
        } catch (SQLException e) {
            e.printStackTrace();
            int ora = OracleSqlErrors.extractErrorCode(e);
            String msg = OracleSqlErrors.collectMessages(e);
            if (msg.isEmpty() && e.getMessage() != null) {
                msg = e.getMessage();
            }
            // Oracle / H2: invalid worker_id or user_id
            if (OracleSqlErrors.isForeignKeyViolation(e)) {
                JsonUtil.writeJson(resp, 400, new JSONObject().put("message",
                        "This worker or user is not in the database. Log in again and pick a worker from the list."));
                return;
            }
            // ORA-00942: table or view does not exist
            if (ora == 942) {
                JsonUtil.writeJson(resp, 503, new JSONObject()
                        .put("message", "Database is not set up for bookings")
                        .put("detail", "Run sql/oracle19c_schema.sql on your Oracle schema (bookings table missing)."));
                return;
            }
            // ORA-00001: unique constraint — rare race; client can retry
            if (ora == 1) {
                JsonUtil.writeJson(resp, 409, new JSONObject().put("message", "Booking id conflict — please try again"));
                return;
            }
            String detail = msg.length() > 400 ? msg.substring(0, 400) : msg;
            if (detail.isEmpty()) {
                detail = ora != 0 ? ("ORA code " + ora + " (see server console)") : "See server console";
            }
            JsonUtil.writeJson(resp, 500, new JSONObject()
                    .put("message", "Booking failed")
                    .put("detail", detail));
        } catch (NumberFormatException e) {
            JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "Invalid worker or user id"));
        } catch (IllegalArgumentException e) {
            JsonUtil.writeJson(resp, 400, new JSONObject().put("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            String m = e.getMessage();
            JsonUtil.writeJson(resp, 500, new JSONObject()
                    .put("message", "Booking failed")
                    .put("detail", m != null && m.length() <= 400 ? m : "See server console"));
        }
    }
}
