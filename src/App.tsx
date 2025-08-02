import { useAuth } from "./hooks/useAuth";
import S3ObjectDemo from "./components/S3BucketList";

function App() {
  const { signOut } = useAuth();

  return (
    <main>
      <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            borderBottom: "1px solid #ddd",
            paddingBottom: "1rem",
          }}
        >
          <h1>AWS Cognito + S3 Demo</h1>
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
            }}
          >
            サインアウト
          </button>
        </header>

        <S3ObjectDemo />
      </div>
    </main>
  );
}

export default App;
