# ディーゼロ開発環境用 MCPサーバー

## `cline_mcp_settings.json`

CLINEの「MCP Servers」設定から、「Installed」タブを選択し、Configure MCP Serversで`cline_mcp_settings.json`ファイルを編集します。

```json
{
	"mcpServers": {
		"coding_guidelines": {
			"command": "npx",
			"args": ["-y", "@d-zero/mcp-server"],
			"disabled": false,
			"autoApprove": []
		}
	}
}
```

失敗する場合は、グローバルにインストールしてフルパスを指定してください（[参考Issue](https://github.com/cline/cline/issues/1247)）。
