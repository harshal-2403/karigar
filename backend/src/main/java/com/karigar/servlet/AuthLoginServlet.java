package com.karigar.servlet;

import com.karigar.dao.UserDao;
import com.karigar.util.JsonUtil;
import com.karigar.util.PasswordUtil;
import org.json.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/auth/login")
public class AuthLoginServlet extends HttpServlet {
    private final UserDao userDao = new UserDao();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            JSONObject body = JsonUtil.readJsonBody(req);
            String email = body.optString("email").trim();
            String password = body.optString("password");
            if (email.isEmpty() || password.isEmpty()) {
                JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "Email and password are required"));
                return;
            }

            JSONObject user = userDao.login(email, PasswordUtil.sha256(password));
            if (user == null) {
                JsonUtil.writeJson(resp, 401, new JSONObject().put("message", "Invalid credentials"));
                return;
            }

            JsonUtil.writeJson(resp, 200, new JSONObject()
                    .put("message", "Login successful")
                    .put("user", user));
        } catch (Exception e) {
            JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Login failed"));
        }
    }
}
