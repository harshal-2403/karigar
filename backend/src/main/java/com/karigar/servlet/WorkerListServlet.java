package com.karigar.servlet;

import com.karigar.dao.WorkerDao;
import com.karigar.util.JsonUtil;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/workers")
public class WorkerListServlet extends HttpServlet {
    private final WorkerDao workerDao = new WorkerDao();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String service = req.getParameter("service");
            String pincode = req.getParameter("pincode");
            JSONArray workers = workerDao.getWorkers(service, pincode);
            JsonUtil.writeJson(resp, 200, new JSONObject().put("workers", workers));
        } catch (Exception e) {
            JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Failed to fetch workers"));
        }
    }
}
