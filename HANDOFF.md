# V5 handoff

## Goal
在 V4 编辑式设计基础上，先检查线上访问，再精修三款礼盒、移动交互和统一发布流程。概念资料优先，暂缓供应商、真实商品和支付。

## State
- 已实现：三款礼盒专属内容物与包装章节、三张新增 AI 展开图、本地 WebP、图片切换/放大、移动购买入口显隐和焦点、加入反馈、预览袋数量及跨标签同步。
- 已实现：同一源码生成 Node 网站与 Cloudflare 静态包，共享目录/礼赠页面组件；版本清单、校验与回滚说明。
- 已联调：仅云端本地预览与模拟 Shopify 接口；未连接真实商户。
- 已验证范围与结果：见 `VALIDATION-V5.md` 和 `evidence/v5/`，属于开发自测。
- 待完成：Cloudflare 上传、实际公网及大陆网络验收；真实 Shopify、商品、支付、履约全部未验证。

## Decisions
保留原首页与品牌风格，深入产品详情。每款两张不同 AI 构图，详情裁切明确标注，不冒充第三张实物照片。固定礼盒仍为概念，未开放自选组合、赠言或额外包装收费。静态站明确不能支付。

## Changes
关键文件：`components/GiftSetStory.tsx`, `lib/gift-stories.ts`, `lib/design-catalog.ts`, `components/Gallery.tsx`, `components/MobilePurchase.tsx`, `components/Header.tsx`, `components/Purchase.tsx`, `lib/dialog-focus.ts`, `lib/design-bag.ts`, `lib/browser-bag.ts`, `components/ShopView.tsx`, `components/GiftingView.tsx`, `scripts/build-showcase.py`, `scripts/package-website.py`, `scripts/verify-delivery.py`, `tests/gift-polish.spec.ts`。完整文件和哈希在 `FILES-V5.txt`。

## Validation
安装/启动/测试见 `README.md`。测试结果和截图单独打包为 `morrow-muse-v5-test-evidence.zip`，原始生成 PNG 也在其中。构建失败、测试中发现的问题和修复记录见 `VALIDATION-V5.md`；最终是否通过以报告为准。

## Open Issues
本聊天仍是旧网络配置；用户报告的新检查任务已加域名但代理不可连。网页读取也未获取网站正文。不能证明公网成功或失败。当前无 Cloudflare 账户连接可执行上传，不需要反复重新配置 DNS。图片细节仍有生成差异；非制造图纸。没有真实商品、实际库存或配送服务。

## Next Action
用户将经测试的 V5 静态 ZIP 上传至现有 Cloudflare 项目，查看 `/release.json` 为 v5，再从实际大陆网络检查。将结果和部署编号记录在 `docs/v5/DEPLOYMENT-RECORD.md`。若后续安排继续开发，以本工程为唯一源码。

## Risks
概念展示不能收款营业，不能宣称完成真实交易验收；静态上传包没有商业后台。现有 Cloudflare 绑定不等于大陆全网可达。商标、转售合同、图片用途与供应商资料须另行核验。没有修改 Bingkui、生产域名或真实店铺资料，没有购买服务或发送邮件。
