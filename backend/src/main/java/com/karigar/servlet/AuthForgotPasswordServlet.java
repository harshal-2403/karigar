package com.karigar.servlet;

import com.karigar.config.MailConfig;
import com.karigar.dao.PasswordResetDao;
import com.karigar.dao.UserDao;
import com.karigar.service.EmailService;
import com.karigar.util.JsonUtil;
import com.karigar.util.OtpUtil;
import org.json.JSONObject;

import javax.mail.MessagingException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.concurrent.TimeUnit;

@WebServlet("/api/auth/forgot-password")
public class AuthForgotPasswordServlet extends HttpServlet {
    private static final int OTP_TTL_MINUTES = 15;

    private final UserDao userDao = new UserDao();
    private final PasswordResetDao resetDao = new PasswordResetDao();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            JSONObject body = JsonUtil.readJsonBody(req);
            String email = body.optString("email").trim();
            if (email.isEmpty()) {
                JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "Email is required"));
                return;
            }

            boolean canSend = MailConfig.isSmtpConfigured() || MailConfig.isLogOtpEnabled();
            if (!canSend) {
                JsonUtil.writeJson(resp, 503, new JSONObject().put("message",
                        "Password reset email is not configured. Set KARIGAR_MAIL_FROM and KARIGAR_MAIL_APP_PASSWORD (Gmail App Password), or set KARIGAR_MAIL_LOG_OTP=true for local development."));
                return;
            }

            if (!userDao.emailExists(email)) {
                JsonUtil.writeJson(resp, 200, genericOk());
                return;
            }

            String otp = OtpUtil.generateSixDigit();
            String otpHash = OtpUtil.hashOtpForStorage(email, otp);
            long expiresAt = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(OTP_TTL_MINUTES);
            resetDao.saveOtp(email, otpHash, new Timestamp(expiresAt));

            if (MailConfig.isSmtpConfigured()) {
                try {
                    EmailService.sendPasswordResetOtp(email, otp);
                } catch (MessagingException | IllegalStateException e) {
                    JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Failed to send email. Try again later."));
                    return;
                }
            } else {
                System.err.println("[KARIGAR_MAIL_LOG_OTP] Password reset OTP for " + email + ": " + otp);
            }

            JsonUtil.writeJson(resp, 200, genericOk());
        } catch (SQLException e) {
            JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Request failed"));
        } catch (Exception e) {
            JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Request failed"));
        }
    }

    private static JSONObject genericOk() {
        return new JSONObject().put("message",
                "If an account exists for this email, a verification code has been sent.");
    }
}
