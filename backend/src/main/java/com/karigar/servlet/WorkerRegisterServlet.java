package com.karigar.servlet;

import com.karigar.dao.WorkerDao;
import com.karigar.util.JsonUtil;
import org.json.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/workers/register")
public class WorkerRegisterServlet extends HttpServlet {
    private final WorkerDao workerDao = new WorkerDao();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            JSONObject body = JsonUtil.readJsonBody(req);
            String[] required = {"name", "phone", "email", "service", "location", "fullAddress", "pincode"};
            for (String field : required) {
                if (body.optString(field).trim().isEmpty()) {
                    JsonUtil.writeJson(resp, 400, new JSONObject().put("message", field + " is required"));
                    return;
                }
            }

            long id = workerDao.createWorker(body);
            JsonUtil.writeJson(resp, 201, new JSONObject()
                    .put("message", "Worker registered")
                    .put("id", String.valueOf(id)));
        } catch (Exception e) {
            JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Registration failed"));
        }
    }
}
