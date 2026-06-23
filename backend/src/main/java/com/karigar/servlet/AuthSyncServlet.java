package com.karigar.servlet;

import com.karigar.auth.Auth0JwtVerifier;
import com.karigar.config.Auth0Config;
import com.karigar.dao.UserDao;
import com.karigar.util.JsonUtil;
import com.nimbusds.jwt.JWTClaimsSet;
import org.json.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Links Auth0 identity to an app_users row (by email) for bookings and profile.
 * Requires {@code Authorization: Bearer &lt;ID token&gt;} with a valid Auth0 OIDC ID token.
 */
@WebServlet("/api/auth/sync")
public class AuthSyncServlet extends HttpServlet {

    private final UserDao userDao = new UserDao();
    private volatile Auth0JwtVerifier verifier;

    private Auth0JwtVerifier getVerifier() throws Exception {
        Auth0JwtVerifier v = verifier;
        if (v != null) {
            return v;
        }
        synchronized (this) {
            v = verifier;
            if (v == null) {
                v = new Auth0JwtVerifier(Auth0Config.getDomain(), Auth0Config.getClientId());
                verifier = v;
            }
            return v;
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            if (!Auth0Config.isConfigured()) {
                JsonUtil.writeJson(resp, 503, new JSONObject()
                        .put("message", "Auth0 is not configured on the server (set AUTH0_DOMAIN and AUTH0_CLIENT_ID)"));
                return;
            }

            String auth = req.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) {
                JsonUtil.writeJson(resp, 401, new JSONObject().put("message", "Missing or invalid Authorization header"));
                return;
            }
            String token = auth.substring(7).trim();
            if (token.isEmpty()) {
                JsonUtil.writeJson(resp, 401, new JSONObject().put("message", "Empty bearer token"));
                return;
            }

            Auth0JwtVerifier jwtVerifier;
            try {
                jwtVerifier = getVerifier();
            } catch (Exception e) {
                JsonUtil.writeJson(resp, 503, new JSONObject().put("message", "Auth0 verifier init failed"));
                return;
            }

            JWTClaimsSet claims;
            try {
                claims = jwtVerifier.verify(token);
            } catch (IllegalArgumentException e) {
                JsonUtil.writeJson(resp, 401, new JSONObject().put("message", "Invalid token: " + e.getMessage()));
                return;
            } catch (Exception e) {
                JsonUtil.writeJson(resp, 401, new JSONObject().put("message", "Invalid token"));
                return;
            }

            Object emailClaim = claims.getClaim("email");
            String email = emailClaim != null ? emailClaim.toString().trim() : "";
            if (email.isEmpty() || !email.contains("@")) {
                JsonUtil.writeJson(resp, 400, new JSONObject().put("message", "Token has no valid email claim"));
                return;
            }

            Object nameClaim = claims.getClaim("name");
            String name =
                    nameClaim != null && !nameClaim.toString().isBlank()
                            ? nameClaim.toString().trim()
                            : email.split("@")[0];

            JSONObject user = userDao.findOrCreateAuthUser(name, email);
            JsonUtil.writeJson(resp, 200, new JSONObject().put("user", user));
        } catch (Exception e) {
            JsonUtil.writeJson(resp, 500, new JSONObject().put("message", "Sync failed"));
        }
    }
}
