import { createContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, type AuthUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();

    // OAuth リダイレクト後の認証状態変更を監視
    const unsubscribe = Hub.listen("auth", (data) => {
      const { payload } = data;
      console.log("Auth Hub event:", payload.event, payload);

      switch (payload.event) {
        case "signInWithRedirect":
        case "signInWithRedirect_failure":
        case "signedIn":
          checkAuthState();
          break;
        case "signedOut":
          setUser(null);
          setIsLoading(false);
          break;
      }
    });

    // URLパラメータでエラーがある場合の処理
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (error) {
      console.error("Auth error from URL:", error, errorDescription);
      // エラーパラメータをクリア
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return unsubscribe;
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { signOut } = await import("aws-amplify/auth");
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const value = {
    user,
    isLoading,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
