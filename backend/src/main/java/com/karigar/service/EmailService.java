package com.karigar.service;

import com.karigar.config.MailConfig;

import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

public final class EmailService {
    private EmailService() {
    }

    public static void sendPasswordResetOtp(String toEmail, String otp) throws MessagingException {
        if (!MailConfig.isSmtpConfigured()) {
            throw new IllegalStateException("SMTP not configured");
        }
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", MailConfig.getSmtpHost());
        props.put("mail.smtp.port", MailConfig.getSmtpPort());
        props.put("mail.smtp.ssl.trust", MailConfig.getSmtpHost());

        final String from = MailConfig.getFromAddress();
        final String appPw = MailConfig.getFromAppPassword();

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(from, appPw);
            }
        });

        MimeMessage msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress(from));
        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail, false));
        msg.setSubject("Karigar — password reset code");
        msg.setText("Your password reset code is: " + otp + "\n\n"
                + "This code expires in 15 minutes. If you did not request this, ignore this email.");

        Transport.send(msg);
    }
}
