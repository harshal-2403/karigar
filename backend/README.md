# Karigar Backend (JDBC + Servlets + JSP + Oracle or embedded H2)

## Stack
- Java 11
- Maven WAR project
- Servlets (API)
- JSP (basic welcome page)
- JDBC
- **Local dev:** embedded H2 (file under `./data/`) — no Oracle install required
- **Production:** Oracle 19c (optional)

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password` — body: `{ "email" }` — sends a 6-digit OTP to the user’s email (Gmail SMTP)
- `POST /api/auth/reset-password` — body: `{ "email", "otp", "newPassword" }`
- `POST /api/workers/register`
- `GET /api/workers?service=&pincode=`
- `POST /api/bookings/create`
- `GET /api/bookings?userId=` (optional `&status=all|pending|completed`)
- `POST /api/bookings/status` — body: `{ "userId", "bookingId", "status": "completed"|"cancelled" }`
- `GET /api/health`

## Database

### Local (default): embedded H2
- By default, `KARIGAR_USE_H2` is treated as `true` and `DB_URL` is unset → data is stored under `./data/`.
- Tables are created automatically on startup.
- Run the API: `.\run-jetty.ps1` (downloads Maven once) or `mvn jetty:run` with `JAVA_HOME` pointing at a **JDK** (not JRE-only).

### Oracle (production)
1. Create Oracle schema/user.
2. Run `sql/oracle19c_schema.sql`.
3. If you already had a database from before password reset was added, also run `sql/oracle_password_reset_otps.sql` once.
4. Set environment variables:
   - `KARIGAR_USE_H2=false`
   - `DB_URL` (example: `jdbc:oracle:thin:@localhost:1521/FREEPDB1`)
   - `DB_USERNAME`
   - `DB_PASSWORD`

## Build
```bash
mvn clean package
```

This generates `target/karigar-backend.war`.

## Deploy
Deploy the WAR to Tomcat 9+.

App context becomes:
- `http://localhost:8080/karigar-backend`

Health check:
- `http://localhost:8080/karigar-backend/api/health`

## Password reset email (Gmail)

The backend sends OTPs via **SMTP** (not the Gmail API). Configure:

| Variable | Description |
|----------|-------------|
| `KARIGAR_MAIL_FROM` | Gmail address used to send mail (same account as the app password) |
| `KARIGAR_MAIL_APP_PASSWORD` | [Gmail App Password](https://support.google.com/accounts/answer/185833) (16 characters; spaces optional) |
| `KARIGAR_SMTP_HOST` | Optional, default `smtp.gmail.com` |
| `KARIGAR_SMTP_PORT` | Optional, default `587` |
| `KARIGAR_MAIL_LOG_OTP` | Set to `true` to print OTPs to the server log instead of sending email (local dev only) |

See `env.mail.example`. Restart Jetty after setting environment variables.

**Security:** `forgot-password` returns the same message whether or not the email is registered (no account enumeration).

## Frontend Setup
In React app, set:
```env
VITE_API_URL=http://localhost:8080/karigar-backend
```
