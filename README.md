# ディーゼロ開発環境用 MCPサーバー

D-ZEROフロントエンド開発環境用のModel Context Protocol（MCP）サーバーです。
以下の機能を提供します：

- **Figmaデータの取得**: FigmaファイルやノードのデータをAPIを通じて取得
- **コーディングガイドラインの提供**: D-ZEROのフロントエンド開発規約の提供
- **CLINEとの統合**: CLINEのMCPサーバーとして動作し、AIアシスタントとの対話をサポート

このサーバーを使用することで、開発者はFigmaデザインの参照やコーディング規約の確認をAIアシスタントとの会話を通じて行うことができます。

## `cline_mcp_settings.json`

CLINEの「MCP Servers」設定から、「Installed」タブを選択し、Configure MCP Serversで`cline_mcp_settings.json`ファイルを編集します。

```json
{
	"mcpServers": {
		"coding_guidelines": {
			"command": "npx",
			"args": ["-y", "@d-zero/mcp-server"],
			"env": {
				"FIGMA_ACCESS_TOKEN": "abcd_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
			},
			"disabled": false,
			"autoApprove": []
		}
	}
}
```

`@d-zero/mcp-server`パッケージの実行に失敗する場合は、グローバルにインストールしてフルパスを指定してください（[参考Issue](https://github.com/cline/cline/issues/1247)）。

Figmaのアクセストークンは https://www.figma.com/developers/api#access-tokens から取得してください。

## Contribution

このMCPサーバー自体の開発には`.env`ファイルが必要です。

```env
# Figma API設定
FIGMA_ACCESS_TOKEN=abcd_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# テスト用のFigma URL
FIGMA_TEST_URL=https://www.figma.com/file/abcdef123456/FileName
```
