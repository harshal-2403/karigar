import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { API_ENDPOINTS } from "@/config/api";

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AppUser | null;
  login: () => void;
  loginSignup: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthSyncProvider({ children }: { children: ReactNode }) {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user: auth0User,
    getIdTokenClaims,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const logoutRef = useRef(auth0Logout);
  useEffect(() => {
    logoutRef.current = auth0Logout;
  }, [auth0Logout]);

  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !auth0User?.email) {
      setAppUser(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setSyncing(true);
      try {
        const claims = await getIdTokenClaims();
        const idToken = claims?.__raw;
        if (!idToken) {
          setAppUser(null);
          await logoutRef.current({
            logoutParams: { returnTo: `${window.location.origin}/login?error=sync` },
          });
          return;
        }

        const res = await fetch(API_ENDPOINTS.AUTH_SYNC, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const data = (await res.json().catch(() => ({}))) as {
          user?: { id: string; name: string; email: string };
          message?: string;
        };

        if (cancelled) return;

        if (res.ok && data.user) {
          setAppUser({
            id: String(data.user.id),
            name: data.user.name,
            email: data.user.email,
          });
        } else {
          setAppUser(null);
          await logoutRef.current({
            logoutParams: { returnTo: `${window.location.origin}/login?error=sync` },
          });
        }
      } catch {
        if (!cancelled) {
          setAppUser(null);
          await logoutRef.current({
            logoutParams: { returnTo: `${window.location.origin}/login?error=sync` },
          });
        }
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, auth0User?.sub, auth0User?.email, auth0User?.name, getIdTokenClaims]);

  const login = useCallback(() => {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname + window.location.search },
    });
  }, [loginWithRedirect]);

  const loginSignup = useCallback(() => {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname + window.location.search },
      authorizationParams: { screen_hint: "signup" },
    });
  }, [loginWithRedirect]);

  const logout = useCallback(() => {
    setAppUser(null);
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  }, [auth0Logout]);

  const value = useMemo(
    () => ({
      user: appUser,
      isAuthenticated: isAuthenticated && !!appUser,
      isLoading: auth0Loading || (isAuthenticated && !!auth0User?.email && syncing),
      login,
      loginSignup,
      logout,
    }),
    [appUser, isAuthenticated, auth0Loading, auth0User?.email, syncing, login, loginSignup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

  if (!domain || !clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <p className="text-center max-w-md text-sm">
          Add{" "}
          <code className="rounded bg-muted px-1 py-0.5">VITE_AUTH0_DOMAIN</code> and{" "}
          <code className="rounded bg-muted px-1 py-0.5">VITE_AUTH0_CLIENT_ID</code> to your{" "}
          <code className="rounded bg-muted px-1 py-0.5">.env</code> file. The client secret is not
          used in the browser—keep it only on the server.
        </p>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/`,
        scope: "openid profile email",
      }}
      cacheLocation="localstorage"
    >
      <AuthSyncProvider>{children}</AuthSyncProvider>
    </Auth0Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
