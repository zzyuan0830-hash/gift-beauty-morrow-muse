# V5 更新、Cloudflare 上传与回滚

## 唯一源码
`/workspace/gift-beauty-studio-commercial` 是本轮维护入口。`/workspace/sites/morrow-muse-showcase` 是旧的 Sites 发布基线；不要分别改两份页面。

Next.js 源码保留独立 Shopify 接口，默认维护状态。展示包由 `scripts/build-showcase.py` 从同一份组件、商品和资产生成，明确移除 API、Shopify 传输与结账跳转。Cloudflare 静态包不能用来收款。

## 本环境已安装依赖后的执行顺序
```
npm ci
npm test
npm run build
npm run test:design
npm run test:e2e
npm run build:showcase
npm run test:showcase
npm run typecheck
npm run format:check
python3 scripts/package-website.py
python3 scripts/verify-delivery.py
```
浏览器测试需要 Chromium，可用 `PLAYWRIGHT_CHROMIUM_EXECUTABLE` 指定路径；本云环境为 `/usr/bin/chromium`。首次安装依赖需要软件源网络权限。`test:e2e` 使用本地模拟 Shopify，不读取真实店铺凭据。

`.release-work/showcase` 是可重新生成的中间目录，禁止直接编辑或作为主源码。构建程序遇到适配点发生变化会报错，需要维护代码，不能静默发布旧页面。`delivery/v5/STATIC-BUILD.json` 和静态根目录的 `release.json` 记录版本、文件和 SHA256。打包程序检查三份浏览器报告通过后才生成交接包；运行命令的顺序仍需遵守，报告必须来自当前源码。

## 更新现有 Cloudflare 项目（本轮未执行）
1. 保留当前生产版本和旧上传包。V4 旧包位于 `/workspace/sites/releases/cloudflare-pages/morrow-muse-cloudflare-pages.zip`，SHA256 为 `78c0584f5d6b080a826f643d263e3e25eb006d3063ed531f96c86adfadd20d2a`。
2. 在账户现有 Workers 和 Pages 项目 **raspy-cherry-c3b6** 中使用“新部署”上传 `delivery/v5/morrow-muse-v5-cloudflare.zip`。ZIP 根目录就是 `index.html`，无需上传源码、node_modules 或外层文件夹。若界面仅接受文件夹，先解压并上传其中所有内容。
3. 保留已有 `gift.zzyuan.top` 绑定，不新建另一个站点，不改 zzyuan.top 根域名。不要开启把未知路由统一返回首页的 SPA 回退；包内有静态页面目录和 404.html。
4. 部署完成后检查 `https://gift.zzyuan.top/release.json` 中 `version` 为 `v5`，并实际操作首页、搜索、三款礼盒、购物袋增加/删除和刷新。
5. 从中国内地 Wi-Fi 与手机蜂窝分别实测。Cloudflare 部署成功不等于所有地区网络可达；目前这一项尚未验证。
6. 将 Cloudflare 部署编号、操作时间和网络实测结果写入 `DEPLOYMENT-RECORD.md`。本轮没有 Cloudflare 账户连接，所以未替你执行上传。

## 回滚
若新包出现问题，优先在同一 Cloudflare 项目部署记录里恢复之前版本（若账户界面提供该操作）；否则重新上传保留的 V4 ZIP。域名绑定不变。再检查三条商品路由及购物袋。V5 未更改浏览器购物袋键和商品顺序，现有概念选择仍兼容；清空浏览器存储会丢失选择。

## Sites 备用站
旧 Sites 地址仍是历史发布版本，本轮没有 push 或部署。将来若更新该地址，应重用原项目 ID `appgprj_6aedcdc22b5481918717a0008d17d248`，按 Sites 技能要求提交精确源码版本再部署，不能创建同名新项目。
