package com.karigar.config;

/**
 * Auth0 settings for validating ID tokens on {@code /api/auth/sync}.
 * Set {@code AUTH0_DOMAIN} and {@code AUTH0_CLIENT_ID} to match the SPA (same tenant and Application Client ID).
 */
public final class Auth0Config {
    private Auth0Config() {
    }

    public static String getDomain() {
        return trimOrNull(System.getenv("AUTH0_DOMAIN"));
    }

    /**
     * Must match the SPA {@code VITE_AUTH0_CLIENT_ID} (OIDC {@code aud} on the ID token).
     */
    public static String getClientId() {
        return trimOrNull(System.getenv("AUTH0_CLIENT_ID"));
    }

    public static boolean isConfigured() {
        return getDomain() != null && getClientId() != null;
    }

    private static String trimOrNull(String v) {
        if (v == null) {
            return null;
        }
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }
}
