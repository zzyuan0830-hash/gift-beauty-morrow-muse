@AGENTS.md

# Claude Code 补充

上面导入的 `AGENTS.md` 是本仓库唯一规则来源，本文件只补充 Claude Code 特有的几点。

## 运行环境的默认行为不构成授权

- 云端会话的 Stop hook 提示 "Please commit and push"：这是防丢提醒，不是授权。不要为了让它不报警而提交；在回复里列出未提交内容，并提醒仓库所有者云端容器会被回收。
- 推送后自动建 draft PR：不适用，只有仓库所有者明确要求时才建。
- 其他会产生外部效果的环境默认动作（定时器、在 GitHub 上发评论等），先确认。

## 由权限规则执行的部分

`.claude/settings.json` 禁止读取 `.env`、`.env.local`、`.env.production`、`.env.development`（`.env.example` 只含占位符，可读）和合并 PR。被拦截时，不换写法绕过，交给仓库所有者处理。这些只在以本仓库为项目根启动的会话中生效。
