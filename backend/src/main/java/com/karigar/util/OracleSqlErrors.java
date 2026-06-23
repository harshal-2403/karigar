                package com.karigar.util;

import java.sql.SQLException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Oracle JDBC often wraps errors; {@link SQLException#getErrorCode()} may be 0 on the outer exception.
 * Walks {@link SQLException#getNextException()} and {@link Throwable#getCause()} and parses ORA-xxxxx from messages.
 */
public final class OracleSqlErrors {
    private static final Pattern ORA_CODE = Pattern.compile("ORA-(\\d{5})");

    private OracleSqlErrors() {
    }

    public static int extractErrorCode(Throwable t) {
        Throwable cur = t;
        while (cur != null) {
            if (cur instanceof SQLException) {
                for (SQLException ex = (SQLException) cur; ex != null; ex = ex.getNextException()) {
                    int c = ex.getErrorCode();
                    if (c != 0) {
                        return c;
                    }
                    int fromMsg = parseOraFromMessage(ex.getMessage());
                    if (fromMsg != 0) {
                        return fromMsg;
                    }
                }
            }
            cur = cur.getCause();
        }
        return 0;
    }

    /**
     * Oracle ORA-02291/02292, JDBC SQLSTATE 23503 (H2/Postgres-style), or message heuristics.
     */
    public static boolean isForeignKeyViolation(SQLException e) {
        int ora = extractErrorCode(e);
        if (ora == 2291 || ora == 2292) {
            return true;
        }
        Throwable cur = e;
        while (cur != null) {
            if (cur instanceof SQLException) {
                for (SQLException ex = (SQLException) cur; ex != null; ex = ex.getNextException()) {
                    String st = ex.getSQLState();
                    if ("23503".equals(st) || "23506".equals(st)) {
                        return true;
                    }
                }
            }
            cur = cur.getCause();
        }
        String m = collectMessages(e).toLowerCase();
        return m.contains("ora-02291") || m.contains("ora-02292")
                || m.contains("referential integrity") || m.contains("foreign key");
    }

    public static String collectMessages(Throwable t) {
        StringBuilder sb = new StringBuilder();
        Throwable cur = t;
        while (cur != null) {
            if (cur instanceof SQLException) {
                for (SQLException ex = (SQLException) cur; ex != null; ex = ex.getNextException()) {
                    if (ex.getMessage() != null && !ex.getMessage().isBlank()) {
                        if (sb.length() > 0) {
                            sb.append(" | ");
                        }
                        sb.append(ex.getMessage().trim());
                    }
                }
            } else if (cur.getMessage() != null && !cur.getMessage().isBlank()) {
                if (sb.length() > 0) {
                    sb.append(" | ");
                }
                sb.append(cur.getMessage().trim());
            }
            cur = cur.getCause();
        }
        return sb.toString();
    }

    private static int parseOraFromMessage(String message) {
        if (message == null) {
            return 0;
        }
        Matcher m = ORA_CODE.matcher(message);
        if (!m.find()) {
            return 0;
        }
        try {
            return Integer.parseInt(m.group(1));
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
