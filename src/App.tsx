import { useAuth } from "./hooks/useAuth";
import S3ObjectDemo from "./components/S3BucketList";

function App() {
  const { signOut } = useAuth();

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* 固定ヘッダー */}
      <header
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          borderBottom: "1px solid #ddd",
          padding: "1rem",
          zIndex: 1000,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h1 style={{ margin: 0 }}>AWS Cognito + S3 Demo</h1>
          <button
            onClick={signOut}
            type="button"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            サインアウト
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div style={{ padding: "2rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
        <S3ObjectDemo />
      </div>
    </main>
  );
}

export default App;
