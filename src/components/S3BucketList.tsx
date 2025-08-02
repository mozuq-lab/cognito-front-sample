import { useState, useEffect } from "react";
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { fetchAuthSession } from "aws-amplify/auth";
import { useAuth } from "../hooks/useAuth";

interface S3Object {
  Key?: string;
  LastModified?: Date;
  Size?: number;
}

interface UserInfo {
  userId: string;
  email?: string;
  accessKeyId?: string;
  identityId?: string;
}

export default function S3ObjectDemo() {
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bucketName, setBucketName] = useState(""); // テスト用バケット名
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserInfoAndObjects();
    }
  }, [user]);

  const fetchUserInfoAndObjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await fetchAuthSession();

      if (!session.credentials) {
        throw new Error("認証情報を取得できませんでした");
      }

      // ユーザー情報を設定
      setUserInfo({
        userId: user?.userId || "不明",
        email: user?.signInDetails?.loginId || "不明",
        accessKeyId:
          `${session.credentials.accessKeyId?.substring(0, 10)}...` ||
          "取得できませんでした",
        identityId: session.identityId || "取得できませんでした",
      });

      // バケット名が設定されている場合のみS3オブジェクトを取得
      if (bucketName) {
        await fetchS3Objects(session.credentials);
      }
    } catch (err) {
      console.error("AWS操作エラー:", err);
      setError((err as Error).message || "AWS操作に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchS3Objects = async (credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  }) => {
    const s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
      forcePathStyle: true,
      useAccelerateEndpoint: false,
    });

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 10,
    });

    const response = await s3Client.send(command);
    setObjects(response.Contents || []);
  };

  const uploadTestFile = async () => {
    try {
      setUploadStatus("アップロード中...");

      const session = await fetchAuthSession();
      if (!session.credentials || !bucketName) {
        throw new Error("認証情報またはバケット名が不足しています");
      }

      const s3Client = new S3Client({
        region: "us-east-1",
        credentials: {
          accessKeyId: session.credentials.accessKeyId,
          secretAccessKey: session.credentials.secretAccessKey,
          sessionToken: session.credentials.sessionToken,
        },
        forcePathStyle: true,
        useAccelerateEndpoint: false,
      });

      const testContent = `テストファイル - ${new Date().toISOString()}`;
      const fileName = `test-${Date.now()}.txt`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: testContent,
        ContentType: "text/plain",
      });

      await s3Client.send(command);
      setUploadStatus(`✅ ${fileName} をアップロードしました`);

      // オブジェクト一覧を更新
      await fetchS3Objects(session.credentials);
    } catch (err) {
      console.error("アップロードエラー:", err);
      setUploadStatus(`❌ アップロード失敗: ${(err as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>AWS Identity Pool テスト</h2>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "1rem" }}>
        <h2>AWS Identity Pool テスト</h2>
        <div
          style={{
            backgroundColor: "#fee",
            color: "#c33",
            padding: "0.75rem",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          エラー: {error}
        </div>
        <button
          type="button"
          onClick={fetchUserInfoAndObjects}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>AWS Identity Pool認証テスト</h2>

      {/* 認証情報セクション */}
      {userInfo && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            padding: "1.5rem",
            border: "1px solid #dee2e6",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ margin: "0 0 1rem 0", color: "#495057" }}>
            🔐 認証情報 (Identity Pool経由)
          </h3>

          <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.9rem" }}>
            <div>
              <strong>ユーザーID:</strong> {userInfo.userId}
            </div>
            <div>
              <strong>メールアドレス:</strong> {userInfo.email}
            </div>
            <div>
              <strong>Identity ID:</strong> <code>{userInfo.identityId}</code>
            </div>
            <div>
              <strong>Access Key:</strong> <code>{userInfo.accessKeyId}</code>
            </div>
          </div>

          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              backgroundColor: "#d4edda",
              borderRadius: "4px",
              border: "1px solid #c3e6cb",
              color: "#155724",
            }}
          >
            ✅ Identity Pool経由でAWS一時認証情報を正常に取得しました
          </div>
        </div>
      )}

      {/* S3操作テストセクション */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "1.5rem",
          border: "1px solid #dee2e6",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ margin: "0 0 1rem 0", color: "#495057" }}>
          📁 S3オブジェクト操作テスト
        </h3>

        {/* バケット名入力 */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="bucket-name-input"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
            }}
          >
            テスト用S3バケット名:
          </label>
          <input
            id="bucket-name-input"
            type="text"
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            placeholder="例: my-test-bucket"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              marginBottom: "0.5rem",
            }}
          />
          <small style={{ color: "#666" }}>
            注意: 指定したバケットに対するアクセス権限が必要です
          </small>
        </div>

        {/* 操作ボタン */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={fetchUserInfoAndObjects}
            disabled={!bucketName}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: bucketName ? "pointer" : "not-allowed",
              opacity: bucketName ? 1 : 0.5,
            }}
          >
            オブジェクト一覧取得
          </button>
          <button
            type="button"
            onClick={uploadTestFile}
            disabled={!bucketName}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: bucketName ? "pointer" : "not-allowed",
              opacity: bucketName ? 1 : 0.5,
            }}
          >
            テストファイルアップロード
          </button>
        </div>

        {/* アップロード状況 */}
        {uploadStatus && (
          <div
            style={{
              padding: "0.5rem",
              backgroundColor: uploadStatus.includes("✅")
                ? "#d4edda"
                : "#f8d7da",
              color: uploadStatus.includes("✅") ? "#155724" : "#721c24",
              borderRadius: "4px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {uploadStatus}
          </div>
        )}

        {/* オブジェクト一覧 */}
        {bucketName && (
          <div>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#6c757d" }}>
              バケット内オブジェクト ({objects.length}件)
            </h4>
            {objects.length === 0 ? (
              <p style={{ color: "#666", fontStyle: "italic" }}>
                オブジェクトがありません
              </p>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {objects.map((object, index) => (
                  <li
                    key={object.Key || index}
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderBottom:
                        index < objects.length - 1
                          ? "1px solid #dee2e6"
                          : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span style={{ fontWeight: "bold", color: "#495057" }}>
                      {object.Key || "キーなし"}
                    </span>
                    <div style={{ textAlign: "right", color: "#666" }}>
                      <div>
                        {object.Size
                          ? `${(object.Size / 1024).toFixed(2)} KB`
                          : "-"}
                      </div>
                      <div style={{ fontSize: "0.8rem" }}>
                        {object.LastModified
                          ? object.LastModified.toLocaleDateString("ja-JP")
                          : "-"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={fetchUserInfoAndObjects}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        🔄 認証情報を更新
      </button>
    </div>
  );
}
