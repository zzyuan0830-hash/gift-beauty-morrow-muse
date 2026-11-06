# 独立 Shopify 接入说明

## 身份与授权边界

仅使用为 Morrow & Muse 新设立、用户明确指定的独立店铺。环境网络白名单内已有的店铺域名不代表获得使用授权，不能从冰葵迁移 token、订单或客户数据。当前未建店、未取得 token，不能做真实店铺联调。

用户或获授权的操作者完成店铺开通、选择实际经营主体和计划；费用确认后再购买。后台业务名称、地址、时区及客服邮箱使用真实资料。市场只启用美国，商品及结账须为 USD；验证大陆主体在所选支付服务下的结算方式，不能用虚构美国主体开通 Shopify Payments。

## API 配置

1. 在独立店铺创建 Shopify 官方 Headless 销售渠道/Storefront，发布授权商品到该渠道。
2. 取得**私有 Storefront API token**，在云环境安全变量/Vercel 服务端环境中配置 `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`。不要粘贴到聊天、源码或下载包。
3. 配置 `SHOPIFY_STORE_DOMAIN` 为准确的 `xxx.myshopify.com` 主机名，明确 `STORE_INDEPENDENT_CONFIRMED=true`。本项目从不自动搜索或复用其他店铺凭据。
4. Storefront 所需权限：读取产品及目录、产品库存（`quantityAvailable`）、购物车读写所需 unauthenticated checkout scopes；以 Headless 后台和 API 2026-10 的实际权限显示为准。**不需要 Admin API、客户读取或订单管理权限**。订单运营在后台完成。
5. API 固定 `2026-10`，在升级前执行兼容性测试。网络配置需要允许该新店铺主机；已有白名单不自动覆盖它。不能绕过网络策略。
6. 生成随机 32 字节 base64 `CART_COOKIE_SECRET`，与其他项目完全隔离。轮换密钥会使旧购物袋 cookie 失效；不影响已创建订单。
7. `SITE_URL` 必须是完整准确的外部 origin，不含子路径或尾部参数。生产必须 HTTPS。若 checkout 使用自定义域名，配置一个准确的 `SHOPIFY_CHECKOUT_HOST`；禁止通配符。

## 商品资料及展示门槛

创建 product metafield definitions，namespace 全部为 `commerce`，并开放 Storefront PUBLIC_READ：

| key | Shopify 类型 | 要求 |
| --- | --- | --- |
| approved | boolean | 运营确认真实商品、销售资料与内容审核后为 true |
| images_verified | boolean | 真实图片及使用权、三种有效视图确认后为 true |
| shipping_verified | boolean | 该 SKU 对美国有已确认承运线路后为 true |
| category | single_line_text_field | gift-sets / fragrance / body-care |
| preassembled | boolean | 固定礼盒必须 true；实物预组装并有独立可发库存 |
| specifications | multi_line_text_field | 实际规格、容量、尺寸等 |
| contents | multi_line_text_field | 精确内容物；单品也须说明实物构成 |
| usage | multi_line_text_field | 供应商审核的使用说明与注意事项 |
| ingredients | multi_line_text_field | 实际成分/材料、适用护理信息，不生成疗效声明 |

每个变体需唯一 SKU、正数 USD 价格，且 Storefront quantityAvailable 必须可读、为非负整数；未知库存会阻止展示该产品。设置实际库存、发货地点和跟踪库存，关闭缺货继续销售（除非未来另行实现明确的预售业务）。固定礼盒不能与单品共用同一未拆分库存；若未预组装并分配库存，不设置 preassembled=true。

当前范围支持每产品最多 100 变体、最多 20 张展示图片、单 SKU 1–20 件、购物车最多 100 行、目录最多 2,000 个产品。截断目录/变体/购物袋不会静默允许结账。范围扩大时需要调整查询和重新测量真实 API 限制。

## 设计预览、测试与正式模式

- design：本轮新增的明确预览模式，无需店铺凭据。同一套页面读取概念资料；购物袋仅用独立本机 key。真实 /api/cart GET/POST 均返回 403 DESIGN_ONLY。不得把此模式当成支付测试或真实商店；也不会在 Shopify 故障时自动回退到 design。


- maintenance：默认关闭；可以看品牌与礼赠信息，没有购买功能。
- test：先在独立 Shopify 后台启用适当的测试支付，核验后才设 `SHOPIFY_TEST_PAYMENTS_CONFIRMED=true`；前端不能替你打开或验证支付网关的测试模式。非公开测试环境增加部署访问保护，不索引。
- live：完成 `config/launch.json` 全部审核项，准确填写 businessName/supportEmail/publicOrigin；配置 `LAUNCH_APPROVED=true` 并获得正式发布授权后方可开放。清单是运营签署，不是自动认证。关闭测试支付、核对正式配置、完成上线验收再确认营业。

在 Shopify 后台发布真实 shipping/refund/privacy/terms policies。结账前缺任何一份均拒绝跳转。政策正文清理后展示，支持基础段落、链接和表格，不允许嵌入脚本/iframe。

## 接口契约

`GET /api/cart`：无缓存获取当前 cookie 对应的公开购物袋；失效或损坏 cookie 恢复空袋。无配置返回 503。

`POST /api/cart`：仅 JSON、最多 8 KB，Origin 必须准确匹配；action 为 add/update/remove/checkout。add 使用 variantId+quantity，update 使用 lineId+quantity，remove 使用 lineId，checkout 使用上次返回的 digest。客户端不提交可信价格。

409 表示需要重新查看数量、库存或价格；400 输入错误；403 来源错误；503 配置或上游故障。mutation 不自动重试，避免网络未知状态下重复添加。前端按钮在请求期间禁用，跨标签页操作仍应以 Shopify 读回结果为准。

生产部署目标为 Vercel：只在 `VERCEL=1` 时读取平台提供的 `x-vercel-forwarded-for`，校验后作为 Shopify-Storefront-Buyer-IP 传递。换其他主机时必须先确认可信反向代理来源，不能直接信任客户端伪造的 X-Forwarded-For。
