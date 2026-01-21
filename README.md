# Gem Partner

Gemini アプリの Gem アイコン設定や会話ログの保存ができるパートナー向け拡張機能です。

> [!TIP]
> 使い方や開発の経緯については、[こちらの記事](https://note.com/yuki_tech/n/n560208ff9dea)も併せてご覧ください。

## 機能

- Gemini アプリの会話画面に表示される Gem アイコンをカスタマイズ
- お気に入りの画像を簡単にアップロード
- Gem ごとに好きなアイコンを設定可能
- 画像は拡張機能内に保存され、ページをリロードしても維持
- 会話ログを JSONL 形式でダウンロード可能

## インストール方法

1. このリポジトリをクローンまたは note 記事からダウンロード

   ```bash
   git clone https://github.com/yuki-dev26/gem-partner.git
   ```

2. Chrome で `chrome://extensions/` を開く

3. 右上の「デベロッパーモード」を ON にする

4. 「パッケージ化されていない拡張機能を読み込む」をクリック

5. ダウンロードしたフォルダを選択

## 使い方

1. Gem のページ（`https://gemini.google.com/gem/...`）を開く(※開いている Gem に適用されます)

2. 拡張機能アイコンをクリック

3. 画像を選択する方法は 2 つ：

   - **ドラッグ&ドロップ**: 画像ファイルをドロップエリアにドラッグ
   - **ファイル選択**: 「ファイルを選択」ボタンをクリック

4. プレビューで確認

5. 「保存して適用」をクリック

6. ページが自動的にリロードされ、アイコンが変更されます！

### アイコンの削除

- ポップアップ下部の「設定済みの Gem 一覧」で各アイコンにマウスを合わせる
- 右上の赤い × ボタンをクリックして削除

### 会話ログのダウンロード

1. 拡張機能を開き、「会話ログをダウンロード」ボタンをクリックします
2. JSONL 形式で「入力」「出力」のテキストがダウンロードされます
   ※チャットがロードされている状態のものに限ります(古い内容とかは遡って読み込む必要があります)

## ファイル構成

```text
gem-partner/
├── manifest.json      # 拡張機能の設定ファイル
├── popup.html         # ポップアップのHTML
├── popup.js           # ポップアップの動作
├── style.css          # ポップアップのスタイル
├── icon_replacer.js   # Geminiページでのアイコン置き換え処理
├── log_extractor.js   # チャットログの抽出処理
├── app_icon.png       # 拡張機能のアイコン
└── README.md          # このファイル
```

## 注意事項

- **Gem ページでのみ動作**: Gem のページ（`/gem/...`）で拡張機能を使ってください
- **動作環境**: PC の Chrome ブラウザでのみ挙動確認済み
- **自動保存**: 設定は Chrome のローカルストレージに保存されます
- **推奨画像**: 正方形の画像が最適です（円形に表示されます）
- **削除**: 拡張機能を削除または無効にすると全ての設定がリセットされます
- **非公式**: 非公式の拡張機能です。自己責任でお使いください

## Supporters

[![note メンバーシップ](https://img.shields.io/badge/note-Membership-41C9B4?style=for-the-badge&logo=note&logoColor=white)](https://note.com/yuki_tech/membership/members)

## License

Copyright (c) 2025 [yuki-P](https://x.com/yuki_p02)
Licensed under the [MIT License](LICENSE).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
