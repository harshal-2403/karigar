package com.karigar.util;

import java.security.SecureRandom;

public final class OtpUtil {
    private static final SecureRandom RANDOM = new SecureRandom();

    private OtpUtil() {
    }

    /** 6-digit numeric OTP. */
    public static String generateSixDigit() {
        int n = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(n);
    }

    public static String hashOtpForStorage(String email, String otp) {
        return PasswordUtil.sha256(email.toLowerCase().trim() + ":" + otp.trim());
    }
}
