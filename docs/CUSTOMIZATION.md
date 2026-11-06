# 品牌与内容修改指南

## 快速修改入口
| 内容 | 文件 | 说明 |
|---|---|---|
| 品牌名、文字标识、标语、元描述 | `config/brand.json` | 共享页头/页脚、首页、About 和页面标题读取这里 |
| 概念商品资料 | `config/concepts.json` | 名称、故事、内容物、概念价格、尺寸；presentation为顾客可见包装文案，target保留设计方向；不必打开供应商资料 |
| 商品数据适配与图库 | `lib/design-catalog.ts` | 将概念字段映射为共用 Product；更换图片后一起更新 alt 文本 |
| 原创概念素材 | `public/concepts/` | 本地 WebP 图、640px版本、包装插图 |
| 品牌色、字体和布局 | `app/globals.css` | 使用 CSS 变量；末尾是恢复后的设计覆盖，修改时检查前后同名规则 |
| 首页叙事 | `app/page.tsx` | hero、分类、场景和品牌段落 |
| 送礼指南 | `app/gifting/page.tsx`、`lib/gifting.ts` | 共用商品来源；预算和品类筛选，无自动虚构推荐 |
| 概念 FAQ/信息页 | `app/faq/page.tsx`、`lib/preview-policies.ts` | 必须与实际演示行为一致 |
| 站点图标 | `app/icon.svg` | 更名后替换 M 字母标识 |
| 未来真实业务 | `config/launch.json`、云端安全环境变量 | 不要用品牌配置代替经营主体和商用验收 |

## 重命名注意事项
品牌配置覆盖共用文字标识和主要品牌文案，但不会重绘 AI 图片里的标签、修改 SVG 字形、历史文档和构建包名称。完整更名请检索 `Morrow`、`morrow-muse` 并逐项检查；保留第三方原有版权声明。图片中的文字需要重新制作或合法编辑，不能宣称一键品牌替换已处理它们。

`lib/preview-policies.ts` 当前条款中的工作品牌名也需同步替换。浏览器存储 key 在 `lib/design-bag.ts`；改成买方独有 key 可隔离先前展示站，既有预览购物袋将不再加载。

## 编辑商品
保持每个商品 id 唯一，价格为有效正数，至少一张有效本地图片。当前概念 variant ID 按记录顺序生成；重新排序/删除商品应同时提升 `DESIGN_BAG_KEY` 版本，避免旧购物袋指向不同商品。新商品必须补齐描述、内容物、规格、alt 文本和页面自测，不用假库存或认证填空。

未来真实商品来自 Shopify 的 SKU、价格、库存和图片；不能仅把概念商品的 availableForSale 改为 true 来出售。实际支付切换仍要走独立店铺和上线验收。

## 交付修改后
运行 `npm test`、`npm run build`、`npm run typecheck`、`npm run test:design` 和 `npm run test:e2e`。截图至少覆盖首页、目录、详情、指南、购物袋和390px手机。运行 `python3 scripts/package-website.py` 生成新的源码包与 Linux 运行包；再按包内 README 验证启动。
