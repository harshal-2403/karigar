package com.karigar.config;

/**
 * Gmail SMTP (or compatible) for sending password-reset OTPs.
 * <p>
 * Set {@code KARIGAR_MAIL_FROM} to your Gmail address and {@code KARIGAR_MAIL_APP_PASSWORD}
 * to an <a href="https://support.google.com/accounts/answer/185833">App Password</a>
 * (required if 2-Step Verification is on).
 * </p>
 */
public final class MailConfig {
    private MailConfig() {
    }

    public static String getSmtpHost() {
        return System.getenv().getOrDefault("KARIGAR_SMTP_HOST", "smtp.gmail.com");
    }

    public static String getSmtpPort() {
        return System.getenv().getOrDefault("KARIGAR_SMTP_PORT", "587");
    }

    /** Sender address (must match the account used for SMTP auth with Gmail). */
    public static String getFromAddress() {
        String v = System.getenv("KARIGAR_MAIL_FROM");
        return v == null ? "" : v.trim();
    }

    /** Gmail App Password (not your normal login password). */
    public static String getFromAppPassword() {
        String v = System.getenv("KARIGAR_MAIL_APP_PASSWORD");
        return v == null ? "" : v.trim();
    }

    public static boolean isSmtpConfigured() {
        return !getFromAddress().isEmpty() && !getFromAppPassword().isEmpty();
    }

    /** When true and SMTP is not configured, OTP is printed to stderr (development only). */
    public static boolean isLogOtpEnabled() {
        return "true".equalsIgnoreCase(System.getenv("KARIGAR_MAIL_LOG_OTP"));
    }
}
