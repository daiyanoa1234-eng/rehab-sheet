# リハビリ自主トレシート

20種の運動から最大4つを選び、A4縦1枚の日本語PDFを直接ダウンロードする静的Webアプリです。

## 使い方

1. 一覧・検索・カテゴリから運動を選びます。
2. 「内容を調整」で回数、セット数、頻度、注意点、自由記述を調整し、矢印で順番を変更します。
3. PDFをダウンロードし、A4・実際のサイズ（100%）で印刷します。氏名は印刷後に手書きします。

「標準値の設定」の変更は同じブラウザに自動保存されます。変更後はJSONを書き出して保管してください。「読み込み」で別のPCにも復元できます。患者情報・シート履歴は保存しません。

注意点60字、自由記述40字、回数・セット数・頻度は各12字までです。改行は空白に変換します。日本語フォントが対応しない絵文字等はPDF生成時に案内します。

## 開発・更新

Node.js 22以降を推奨。`npm ci`、`npm run dev`でローカル実行、`npm test`で検証、`npm run build`で`dist`に静的サイトを生成します。PDF検証は`node --import tsx scripts/verify-pdf.ts`です。

運動マスタは`public/exercises.json`、画像は`public/images/exXX.png`（1024×1024）と`exXX-thumb.png`（256×256）です。生成用の共通・個別プロンプトは`image-prompts.json`にあります。追加・差し替え後はビルドを更新します。

PDFと画面プレビューは`src/layout.ts`の共通配置を使用します。日本語TrueTypeフォントを同梱し、PDFごとに使う文字だけに縮小して埋め込みます。Noto Sans JPはSIL OFL 1.1です（`public/fonts/OFL.txt`）。依存ライブラリのライセンスは`THIRD_PARTY_LICENSES.txt`にまとめています。

## 公開・確認事項

公開先は[GitHub Pages](https://daiyanoa1234-eng.github.io/rehab-sheet/)、ソースは[GitHub](https://github.com/daiyanoa1234-eng/rehab-sheet)です。`main`へのpushでGitHub Actionsがテスト・ビルド・公開を自動実行します。Pagesでは`/rehab-sheet/`を基準パスとしてビルドします。Cloudflare Pagesは使用していません。

旧SitesのURLとGitHub Pagesではブラウザの保存領域が異なります。標準値を引き継ぐ場合は、旧URLでJSONを書き出し、新URLで読み込んでください。

運動の初期値と生成画像は、実際の対象者への指導前に担当療法士が確認・調整してください。画面・PDFの表示は検証済みですが、実機プリンタによる1〜4種の印刷確認と作成時間KPIの測定は未実施です。
