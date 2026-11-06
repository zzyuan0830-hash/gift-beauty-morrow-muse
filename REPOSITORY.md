# 礼品美妆网站 · Morrow & Muse

GitHub 仓库：`zzyuan0830-hash/gift-beauty-morrow-muse`。用户已明确选择公开仓库。

## 内容与版本
- `v5.0.0`：与核验过的 V5 源码 ZIP 逐文件一致的稳定代码提交；不移动或覆盖该标签。
- `main`：V5 源码加 GitHub 管理、归档和回滚说明；目前没有 V6 功能改动。
- `releases/v5/morrow-muse-v5-cloudflare.zip`：原 V5 静态上传包，可用于同一 Cloudflare 项目的恢复部署。
- 原开发入口为 `/workspace/gift-beauty-studio-commercial`；后续以本 Git 工作副本为维护入口，避免两份源码各自改动。

## 运行
Node >=22.9.0。依次运行 `npm ci`、`npm run build`、`npm run preview:design`。
本地调试地址不是公网链接。完整命令见 README。
静态包构建：`npm run build:showcase`；静态浏览器验收：`npm run test:showcase`。

## 已有验收证据的来源
原开发自测：20 个单元测试、13 组源码展示测试、13 组静态包测试、10 组模拟 Shopify 测试。报告在 evidence/v5。
用户从独立验收聊天提供的报告称：线上 V5 在1440px桌面、768px平板、390px手机视口通过，69张截图已归档，首页9/9图片在滚动解码后正常；release.json 与原上传包一致。
该独立聊天的大型证据包未复制进本 Git 仓库，不冒称这里已读取或重新核验其全文。
大陆蜂窝真机、其他浏览器和真实交易仍未验证。概念展示站不收款。

## 备份边界
源码和小型回滚上传包保存在本 Git 工作副本；大型完整验收归档另存用户备份位置。云端聊天与 Git 仓库都不能替代独立备份。
本文件描述仓库布局；GitHub 是否创建、是否上传成功必须以实际远端验证为准。

## 后续 V6
从 main 创建 v6 开发分支，保留 v5.0.0；按变更运行测试后审阅再发布。没有设置自动部署、GitHub Actions 或生产凭据。
不与冰葵仓库同步，不使用其店铺凭据、客户资料或认证缓存。
