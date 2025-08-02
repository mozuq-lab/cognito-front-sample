import { useState } from "react";
import {
  signIn,
  signUp,
  confirmSignUp,
  signInWithRedirect,
} from "aws-amplify/auth";

interface LoginProps {
  onSignInSuccess: () => void;
}

export default function Login({ onSignInSuccess }: LoginProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "confirm">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn({ username: email, password });
      onSignInSuccess();
    } catch (err) {
      setError((err as Error).message || "サインインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      setMode("confirm");
    } catch (err) {
      setError((err as Error).message || "サインアップに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });
      setMode("signin");
    } catch (err) {
      setError((err as Error).message || "確認に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (err) {
      console.error("Google sign in error:", err);
      setError((err as Error).message || "Googleログインに失敗しました");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          minWidth: "400px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
          {mode === "signin" && "ログイン"}
          {mode === "signup" && "新規登録"}
          {mode === "confirm" && "確認コード入力"}
        </h2>

        {error && (
          <div
            style={{
              backgroundColor: "#fee",
              color: "#c33",
              padding: "0.75rem",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {mode === "signin" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                padding: "0.75rem",
                backgroundColor: "#db4437",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.9rem",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <span>G</span>
              {loading ? "認証中..." : "Googleでログイン"}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "1rem 0",
                color: "#666",
              }}
            >
              <div
                style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}
              />
              <span style={{ padding: "0 1rem" }}>または</span>
              <div
                style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}
              />
            </div>

            <form
              onSubmit={handleSignIn}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "ログイン中..." : "メールでログイン"}
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                style={{
                  padding: "0.75rem",
                  backgroundColor: "transparent",
                  color: "#007bff",
                  border: "1px solid #007bff",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                新規登録はこちら
              </button>
            </form>
          </div>
        )}

        {mode === "signup" && (
          <form
            onSubmit={handleSignUp}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <input
              type="password"
              placeholder="パスワード (8文字以上)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "登録中..." : "新規登録"}
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              style={{
                padding: "0.75rem",
                backgroundColor: "transparent",
                color: "#007bff",
                border: "1px solid #007bff",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ログインに戻る
            </button>
          </form>
        )}

        {mode === "confirm" && (
          <form
            onSubmit={handleConfirmSignUp}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              {email} に確認コードを送信しました。メールをご確認ください。
            </p>
            <input
              type="text"
              placeholder="確認コード"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
              style={{
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "確認中..." : "確認"}
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              style={{
                padding: "0.75rem",
                backgroundColor: "transparent",
                color: "#007bff",
                border: "1px solid #007bff",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ログインに戻る
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
