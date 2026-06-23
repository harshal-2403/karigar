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

@WebServlet("/api/auth/register")
public class AuthRegisterServlet extends HttpServlet {
    private final UserDao userDao = new UserDao();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            JSONObject body = JsonUtil.readJsonBody(req);
            String name = body.optString("name").trim();
            String email = body.optString("email").trim();
            String password = body.optString("password");
            if (name.isEmpty() || email.isEmpty() || password.length() < 6) {
                JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "Invalid input"));
                return;
            }

            if (userDao.emailExists(email)) {
                JsonUtil.writeJson(resp, 409, new JSONObject().put("message", "Email already exists"));
                return;
            }

            long id = userDao.createUser(name, email, PasswordUtil.sha256(password));
            JsonUtil.writeJson(resp, 201, new JSONObject()
                    .put("message", "User registered")
                    .put("id", String.valueOf(id)));
        } catch (Exception e) {
            JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Registration failed"));
        }
    }
}
