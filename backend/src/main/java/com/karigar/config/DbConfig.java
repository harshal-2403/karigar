package com.karigar.config;

/**
 * <p>Local development defaults to embedded H2 (file under {@code ./data/}) so the API works without Oracle.</p>
 * <p>For Oracle, set environment {@code KARIGAR_USE_H2=false} and {@code DB_URL=jdbc:oracle:thin:@...}</p>
 */
public final class DbConfig {
    private DbConfig() {
    }

    /**
     * When {@code DB_URL} is unset, default to H2 unless {@code KARIGAR_USE_H2=false}.
     * When {@code DB_URL} is set, driver is chosen from the JDBC URL prefix.
     */
    public static boolean useH2() {
        String explicit = System.getenv("DB_URL");
        if (explicit != null && !explicit.isBlank()) {
            String u = explicit.trim();
            if (u.startsWith("jdbc:h2")) {
                return true;
            }
            if (u.startsWith("jdbc:oracle")) {
                return false;
            }
        }
        return !"false".equalsIgnoreCase(System.getenv().getOrDefault("KARIGAR_USE_H2", "true"));
    }

    public static String getUrl() {
        String explicit = System.getenv("DB_URL");
        if (explicit != null && !explicit.isBlank()) {
            return explicit.trim();
        }
        if (useH2()) {
            String base = System.getProperty("karigar.data.dir");
            if (base == null || base.isBlank()) {
                base = System.getProperty("user.dir") + "/data";
            }
            String path = base.replace('\\', '/');
            return "jdbc:h2:file:" + path + "/karigar;AUTO_SERVER=TRUE;DATABASE_TO_LOWER=TRUE";
        }
        return "jdbc:oracle:thin:@localhost:1521/FREEPDB1";
    }

    public static String getUsername() {
        if (useH2()) {
            return System.getenv().getOrDefault("DB_USERNAME", "sa");
        }
        return System.getenv().getOrDefault("DB_USERNAME", "karigar");
    }

    public static String getPassword() {
        if (useH2()) {
            return System.getenv().getOrDefault("DB_PASSWORD", "");
        }
        return System.getenv().getOrDefault("DB_PASSWORD", "karigar123");
    }
}
