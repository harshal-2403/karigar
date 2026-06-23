package com.karigar.servlet;

import com.karigar.dao.PasswordResetDao;
import com.karigar.dao.UserDao;
import com.karigar.util.JsonUtil;
import com.karigar.util.OtpUtil;
import com.karigar.util.PasswordUtil;
import org.json.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/api/auth/reset-password")
public class AuthResetPasswordServlet extends HttpServlet {
    private final UserDao userDao = new UserDao();
    private final PasswordResetDao resetDao = new PasswordResetDao();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            JSONObject body = JsonUtil.readJsonBody(req);
            String email = body.optString("email").trim();
            String otp = body.optString("otp").trim();
            String newPassword = body.optString("newPassword");
            if (email.isEmpty() || otp.isEmpty() || newPassword.length() < 6) {
                JsonUtil.writeJson(resp, 400, new JSONObject().put("message",
                        "Email, OTP, and a new password (min 6 characters) are required"));
                return;
            }

            String storedHash = resetDao.getValidOtpHash(email);
            if (storedHash == null) {
                JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "Invalid or expired code. Request a new one."));
                return;
            }

            String submittedHash = OtpUtil.hashOtpForStorage(email, otp);
            if (!storedHash.equals(submittedHash)) {
                JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "Invalid verification code"));
                return;
            }

            if (!userDao.emailExists(email)) {
                resetDao.deleteByEmail(email);
                JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "Account not found"));
                return;
            }

            boolean updated = userDao.updatePasswordHash(email, PasswordUtil.sha256(newPassword));
            resetDao.deleteByEmail(email);
            if (!updated) {
                JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Could not update password"));
                return;
            }

            JsonUtil.writeJson(resp, 200, new JSONObject().put("message", "Password has been reset. You can log in now."));
        } catch (SQLException e) {
            JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Reset failed"));
        } catch (Exception e) {
            JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Reset failed"));
        }
    }
}
