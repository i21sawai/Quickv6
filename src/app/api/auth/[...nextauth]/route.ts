import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// ========================================================
// 1. 環境変数の事前バインド（Vercelでの読み込みエラー対策）
// ========================================================
const CLIENT_EMAIL = process.env.SA_CLIENT_EMAIL;
const SPREADSHEET_ID = process.env.USER_SPREADSHEET_ID;
// \n（文字列）を実際の改行コードに確実に置換
const PRIVATE_KEY = process.env.SA_PRIVATE_KEY?.replace(/\\n/g, '\n');

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'パスワード',
      credentials: {
        username: { label: '名前', type: 'text' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials) {
        // デバッグ用ログ（Vercelの環境変数生存チェック）
        console.log("★環境変数チェック:", {
          hasEmail: !!CLIENT_EMAIL,
          hasKey: !!PRIVATE_KEY,
          hasSpreadsheetId: !!SPREADSHEET_ID,
        });

        if (!CLIENT_EMAIL || !PRIVATE_KEY || !SPREADSHEET_ID) {
          console.error("エラー: 必要ない環境変数が設定されていません。");
          return null;
        }

        let user: { email: string; name: string; id: string; role: string; } | undefined;

        try {
          // ========================================================
          // 2. Google Sheets API 認証初期化
          // ========================================================
          const serviceAccountAuth = new JWT({
            email: CLIENT_EMAIL,
            key: PRIVATE_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            subject: CLIENT_EMAIL,
            clientId: process.env.SA_CLIENT_ID
          });

          const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
          await doc.loadInfo();
          const sheet = doc.sheetsByIndex[0];

          // ========================================================
          // 3. 超軽量セルの範囲読み込み（タイムアウト・メモリ上限対策）
          // ========================================================
          // A2セルからC1050セルまで（ヘッダーを除く1000人分以上）を狙い撃ち
          await sheet.loadCells('A2:C1050');

          let userDBRow: { password: string; role: string } | null = null;
          const targetUsername = credentials?.username?.trim();

          // 1000行の超高速ループ（生データの配列走査のため一瞬で終わります）
          for (let i = 1; i <= 1050; i++) { // インデックス1 ＝ スプレッドシートの2行目
            const userIdValue = sheet.getCell(i, 0).value?.toString().trim(); // A列: ID

            if (userIdValue === targetUsername) {
              userDBRow = {
                password: sheet.getCell(i, 1).value?.toString().trim() || '', // B列: パスワード
                role: sheet.getCell(i, 2).value?.toString().trim() || 'user',  // C列: 権限
              };
              break; // ユーザーが見つかった時点で以降のループを即座に打ち切り（最速化）
            }
          }

          // ========================================================
          // 4. ユーザー認証の判定
          // ========================================================
          if (!userDBRow) {
            console.log('User not found in Sheet:', credentials?.username);
          } else {
            // パスワードの厳密な照合
            if (userDBRow.password === credentials?.password) {
              user = {
                email: JSON.stringify({ role: userDBRow.role }),
                name: credentials?.username!,
                id: credentials?.username!,
                role: userDBRow.role,
              };
            } else {
              console.log('Password mismatch for:', credentials?.username);
            }
          }

        } catch (error) {
          console.error("Google Sheets 接続または処理中にエラーが発生しました:", error);
          return null;
        }

        if (user) {
          return user;
        } else {
          return null; // 認証失敗時は一律nullを返して安全に終了
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      return true;
    },
  },
});

export { handler as GET, handler as POST };