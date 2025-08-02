import { useAuth } from "../hooks/useAuth";
import App from "../App";
import Login from "../Login";

export default function AppWithAuth() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        読み込み中...
      </div>
    );
  }

  if (!user) {
    return <Login onSignInSuccess={() => {
      // より優雅な状態更新 - reloadではなく状態を再チェック
      window.location.reload();
    }} />;
  }

  return <App />;
}
