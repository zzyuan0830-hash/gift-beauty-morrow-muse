# 发布、验证与回滚

## 发布前

- 保留 v2 和本工程独立，不关联冰葵域名/仓库/店铺。
- 确认真实独立 shop 主机、平台网络允许、生产专用 token 和 cookie secret。
- 对所选 Vercel 商业计划、域名、邮箱、Shopify 和支付费用取得明确授权。
- 使用真实资料完成 SHOPIFY-SETUP.md 和 LIVE-ACCEPTANCE.csv；品牌/图像/商品权利及政策签署完成。
- 私有测试环境先使用测试支付；加访问保护，不索引。浏览器用桌面和手机实际检查 Shopify 托管结账及支付服务商外跳页面。
- 执行 npm ci / npm run typecheck / npm test / npm run build / npm run test:e2e。
- npm run check:launch 只检查配置，不替代实际支付或法律/业务验证。

## 部署目标

Vercel，Node runtime；无需自建数据库、订单服务器或处理银行卡。代码产生标准 standalone build，备选自管 Node 启动包仅作技术交接。生产必须 HTTPS，SITE_URL 与请求 origin 精确一致。平台日志不包含正文或 query 参数，不开启会收集客户资料的第三方会话录制。

正式代码、环境变量、域名/SSL、Shopify payment live 模式和外跳 checkout host 审核后，才切 STORE_MODE=live 与 LAUNCH_APPROVED=true。Vercel 部署和实际付款/退款均在审批后执行。正式订单完成前仅能标记“已部署/待营业验证”。

## 上线核对

从真实美国配送场景核对：价格与币种、优惠、库存、运费、税费或进口费说明、有效/无效地址、支付成功/失败/取消、重复点击、订单通知、仓库/追踪号、全额/部分退款及到账。不能用 fixture 数据替代。真实费用金额事先约定，严禁自动购买商品。

## 回滚

1. 紧急暂停新购买：将 STORE_MODE=maintenance 并重新部署/重启配置，确认 /api/cart 返回关闭状态。仅改前端不会自动撤销已经发出的 Shopify checkout URL；如必须完全停单，还需在独立店铺后台按审批的停单程序暂停对应销售渠道/支付，并检查在途结账。
2. Vercel 回退上一个已验证部署；保留正确的 shop、cookie secret 和域名配置。避免跨店 cookie/token 混用。
3. Shopify 已生成的订单、付款和退款不随前端回滚撤销，继续人工核对与履约。
4. 修复后复跑受影响测试和实际集成检查，再批准恢复。

## 已知边界

目前无真实店铺联调、外部监控告警、跨浏览器/真实移动硬件验证、性能实测分数或独立安全审阅。CSP 允许 Next.js 所需 inline scripts/styles，所有商品/政策 HTML 经过白名单净化；部署前可进一步使用 nonce CSP 并验证缓存策略。POST 有来源及大小校验，无自建分布式限流；正式 Vercel WAF/速率限制按流量及套餐配置并测试。无用户账户、订阅、会员、定制礼盒或自动 WMS 接入。
