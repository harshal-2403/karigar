package com.karigar.auth;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

/**
 * Verifies Auth0-issued RS256 JWTs (OIDC ID tokens) using the tenant JWKS endpoint.
 */
public final class Auth0JwtVerifier {

    private final ConfigurableJWTProcessor<SecurityContext> processor;
    private final String issuer;
    private final String clientId;

    public Auth0JwtVerifier(String domain, String clientId) throws MalformedURLException {
        this.clientId = clientId;
        String normalized = normalizeDomain(domain);
        this.issuer = "https://" + normalized + "/";
        URL jwksUrl = new URL("https://" + normalized + "/.well-known/jwks.json");
        JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(jwksUrl);
        ConfigurableJWTProcessor<SecurityContext> p = new DefaultJWTProcessor<>();
        p.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource));
        this.processor = p;
    }

    private static String normalizeDomain(String domain) {
        String d = domain.trim();
        if (d.startsWith("https://")) {
            d = d.substring(8);
        } else if (d.startsWith("http://")) {
            d = d.substring(7);
        }
        while (d.endsWith("/")) {
            d = d.substring(0, d.length() - 1);
        }
        return d;
    }

    /**
     * Validates signature, expiry, and that {@code iss} / {@code aud} match this Auth0 application.
     */
    public JWTClaimsSet verify(String jwt) throws Exception {
        JWTClaimsSet claims = processor.process(jwt, null);
        if (!issuer.equals(claims.getIssuer())) {
            throw new IllegalArgumentException("Invalid issuer");
        }
        List<String> aud = claims.getAudience();
        if (aud == null || !aud.contains(clientId)) {
            throw new IllegalArgumentException("Invalid audience");
        }
        return claims;
    }
}
