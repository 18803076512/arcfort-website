# ArcFort Weld 索引后续核查与执行清单

检查日期：2026-10-25。正式站修复提交：`8c1bbe14d52267b0065d964c2c549d1e5dca8eca`。

## 结论

已完成部署后的索引结构复查。当前可验证范围没有发现孤立页面、不可达产品或重复的完整 title、H1、meta description。下一项必须定位的是 Search Console 通知中的“重定向错误”的实际 URL；不能以两条旧别名已修复推定整个错误分类已关闭。

## 通知与当前证据

本次读取了用户邮箱中 Google Search Console 的原始事务通知，仅保留业务结论，不保存邮件头、个人邮箱、追踪链接或账户标识。

| 日期       | 原始通知                        | 已知事实                       | 尚缺证据                             |
| ---------- | ------------------------------- | ------------------------------ | ------------------------------------ |
| 2026-10-22 | 已发现 - 尚未编入索引：验证通过 | 通知确认 48 个网页的该问题修正 | 具体 48 个 URL、各页当前索引状态     |
| 2026-10-22 | 重定向错误                      | 这是另一项索引原因通知         | 受影响 URL、数量、最后抓取、验证状态 |
| 2026-10-07 | 网页会自动重定向                | 搜索结果读取到该历史通知摘要   | 是否全部为预期旧地址需逐页核对       |

两封 10 月 22 日邮件均无附件，正文未列出受影响的网站 URL。通知日期不等于 Google 最后抓取日期；“验证通过”不等于每页已经获得搜索排名。前次 GSC Wizard 连接返回订阅不可用，本轮未反复调用同一付费接口，也没有购买服务、改动账户或提交索引请求。

## 发布复核

- PR #132 已合并，生产 Vercel 部署成功，线上完整健康检查通过。
- 合并提交的后续 main CI 也已完成：`quality` 和 `product-intelligence-database` 均成功。
- main CI：<https://github.com/18803076512/arcfort-website/actions/runs/40201693055>。
- 精确修复和线上 88 地址审计见同目录 `indexing-review-2026-10-25.md`。

## 站内链接和元数据复查

来源：与已发布运行时代码一致的生产构建 HTML，另读取线上动态 `/products`、`/rfq` 页面；以 sitemap 为页面集合，用 HTML `<a href>` 建立链接图，从首页计算最短路径。正文链接单独按 `<main>` 统计，避免把全站导航次数误认为产品的独立内容推荐。

| 指标                                   | 本次结果                  |
| -------------------------------------- | ------------------------- |
| HTML 页面                              | 82                        |
| sitemap 下载文件                       | 6（不参与 HTML 链接深度） |
| 孤立 HTML 页面                         | 0                         |
| 从首页不可达 HTML 页面                 | 0                         |
| 首页一层可达 / 两层可达                | 53 / 28                   |
| 产品页面                               | 40                        |
| 产品最大链接深度                       | 2                         |
| 缺少正文入链的产品                     | 0                         |
| 缺少带产品信息 RFQ 链接的产品          | 0                         |
| 重复完整 title / H1 / meta description | 0 / 0 / 0                 |

这些是当前页面结构结果，不是 Google 收录或抓取频率证明，也不等于页面正文完全不同。HTML 链接检查不证明浏览器询价成功、最终邮箱投递或转化率。Google 的内部链接建议是让重要页面有可抓取且有上下文的入口；这里未发现需要紧急补救的孤立页面。

## 首批 Google URL 检查队列

以下 8 页按现有商业价值与站内结构挑选，**不是邮件中 48 个受影响 URL 的复原清单**，也不宣称它们存在索引错误。先读取实际报告和剩余额度，再选择其中必要页面检查。

| 页面与意图            | 规范 URL                                                                            | 首页链接深度 | 正文入链页面数 | Google 状态 |
| --------------------- | ----------------------------------------------------------------------------------- | -----------: | -------------: | ----------- |
| 品牌与网站入口        | <https://www.arcfortweld.com/>                                                      |            0 |             81 | 待 GSC      |
| MIG/MAG 采购分类      | <https://www.arcfortweld.com/products/mig-mag-torch-parts>                          |            1 |             32 | 待 GSC      |
| 0.8 mm 导电嘴目录参考 | <https://www.arcfortweld.com/products/mig-mag-torch-parts/mig-contact-tip-m6-0-8mm> |            2 |             15 | 待 GSC      |
| 1.0 mm 导电嘴目录参考 | <https://www.arcfortweld.com/products/mig-mag-torch-parts/mig-contact-tip-m6-1-0mm> |            1 |             17 | 待 GSC      |
| 1.2 mm 导电嘴目录参考 | <https://www.arcfortweld.com/products/mig-mag-torch-parts/mig-contact-tip-m6-1-2mm> |            2 |             13 | 待 GSC      |
| 喷嘴采购              | <https://www.arcfortweld.com/products/mig-mag-torch-parts/mig-gas-nozzle-for-mb15>  |            1 |              9 | 待 GSC      |
| 导电嘴座采购          | <https://www.arcfortweld.com/products/mig-mag-torch-parts/mig-tip-holder-for-mb15>  |            1 |              6 | 待 GSC      |
| 经销商与批量询价      | <https://www.arcfortweld.com/distributor-supply>                                    |            1 |              3 | 待 GSC      |

每页需保留：Google 是否已收录、覆盖原因、最后抓取时间、抓取是否成功、允许抓取/索引、用户声明 canonical、Google 选择 canonical、发现来源。没有完成抓取或 URL 检查时保持“未知”。

## 重定向错误的处理顺序

1. 读取“网页索引编制 → 重定向错误”的当前数量、示例 URL 与验证状态，并导出清单。
2. 对清单中的每个完整 URL 检查 HTTP/HTTPS、www/裸域、路径、查询参数，以及每次 Location 的终点。
3. 如果旧地址按设计永久跳转到唯一规范页面，保留旧地址跳转；确认终点 200、可索引、自规范。
4. 若发现循环、过长跳转、空或无效 Location、终点 4xx/5xx，再针对实际路径修复并补回归验证。
5. 若当前链路健康而 Google 记录早于修复，保留时间证据；确认该分类全部已知问题后再决定验证操作。
6. 对“网页会自动重定向”单独判断，不以该合理排除项数量归零为目标。

## 内容完善：优先真实型号资料

`data/import/products.csv` 中三个 MIG 导电嘴 SKU（AF-MIG-CT-0004/0005/0006）的 description，去掉各自产品名称后完全相同。两个 TIG 陶瓷杯 SKU（AF-TIG-CC-0007/0008）也有相同模板现象。这说明差异化正文值得完善；没有当前 GSC 查询/页面数据，不能据此认定关键词互相竞争或索引失败的原因。

| 优先对象               | 现有内容依据                                                     | 优先补充的真实证据                                            | 当前处理                                   |
| ---------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| M6 0.8 / 1.0 mm 导电嘴 | 15AK 目录参考，列有 25 mm 长度；仍为 needs_review/reference_only | 各 SKU 实物主图、孔径/长度/螺纹量测、材质凭证、适配依据、包装 | 保留现有 URL；数据核准后改写成独立选型说明 |
| M6 1.2 mm 导电嘴       | 通用 M6 × 27 mm 目录参考                                         | 确认实际供货长度、材质及适配焊枪                              | 不把它并入 25 mm 的 15AK 型号说明          |
| MB15 喷嘴、导电嘴座    | 目录参考，适配仍需确认                                           | 实物开口/连接部位照片、尺寸和装配顺序、图片权益               | 优先建立可靠的配套选型入口                 |

上述五个重点产品的图片登记仍为 `needs_confirmation` 权益、`product_family_reference` 匹配、`legacy_reference` 发布状态。保持既有图片门禁；不把旧图改称已审核实拍，不把目录值改称工厂实测。现有 intake 已能收集资料：`data/intake/15ak-technical-confirmation.csv`、`data/intake/15ak-product-image-intake.csv`，不另造重复数据源。

## 执行边界

本轮只读审计与文档更新；没有新增产品、改价格、迁移 URL、改模板、发邮件、提交 GSC/IndexNow 或改 DNS/GA4。没有发现足以支持第二批紧急运行时代码修复的证据。下一步需要通过 GSC 后台或用户导出取得具体错误 URL；浏览器作为插件替代途径须按工具的访问规则取得授权，必要时由业主完成 Google 登录。

参考：

- <https://support.google.com/webmasters/answer/7440203?hl=zh-Hans>
- <https://developers.google.com/search/docs/crawling-indexing/links-crawlable>

## 附：82 页站内结构清单

此表不是 Google 收录清单。深度按可抓取链接最短路径计算；正文入链表示从其他页面 `<main>` 中链接到此页的不同来源页数量。

| 路径                                                             | 深度 | 正文入链来源页 | HTML 来源 |
| ---------------------------------------------------------------- | ---: | -------------: | --------- |
| `/`                                                              |    0 |             81 | 构建      |
| `/about`                                                         |    1 |             22 | 构建      |
| `/applications`                                                  |    1 |              8 | 构建      |
| `/applications/automotive`                                       |    1 |             32 | 构建      |
| `/applications/construction`                                     |    1 |             16 | 构建      |
| `/applications/metal-fabrication`                                |    1 |             18 | 构建      |
| `/applications/pipeline`                                         |    1 |             23 | 构建      |
| `/applications/repair-workshop`                                  |    1 |             13 | 构建      |
| `/applications/shipbuilding`                                     |    1 |             31 | 构建      |
| `/contact`                                                       |    1 |              3 | 构建      |
| `/distributor-supply`                                            |    1 |              3 | 构建      |
| `/downloads`                                                     |    1 |             28 | 构建      |
| `/guides`                                                        |    1 |             18 | 构建      |
| `/guides/how-to-prepare-a-welding-parts-rfq`                     |    2 |             18 | 构建      |
| `/guides/identify-welding-torch-consumables-from-photos-samples` |    2 |              6 | 构建      |
| `/guides/mig-contact-tip-size-thread-selection`                  |    2 |              9 | 构建      |
| `/guides/mig-gas-nozzle-diffuser-selection-guide`                |    2 |              3 | 构建      |
| `/guides/mig-torch-front-end-parts-identification`               |    2 |              4 | 构建      |
| `/guides/mig-torch-liner-selection-guide`                        |    2 |              2 | 构建      |
| `/guides/mig-vs-tig-torch-consumables`                           |    2 |             13 | 构建      |
| `/guides/oem-welding-products-private-label-guide`               |    2 |             11 | 构建      |
| `/guides/plasma-cutter-consumables-parts-guide`                  |    2 |              9 | 构建      |
| `/guides/plasma-electrode-nozzle-buying-guide`                   |    2 |              3 | 构建      |
| `/guides/robotic-mig-welding-torch-replacement-guide`            |    2 |              4 | 构建      |
| `/guides/tig-torch-consumable-stack-selection`                   |    2 |              6 | 构建      |
| `/guides/tig-torch-parts-names-identification-guide`             |    2 |              5 | 构建      |
| `/guides/tig-torch-switch-replacement-compatibility`             |    2 |              4 | 构建      |
| `/guides/welding-cable-connector-selection`                      |    2 |              7 | 构建      |
| `/guides/welding-electrode-wire-rfq-guide`                       |    2 |              7 | 构建      |
| `/guides/welding-machine-sourcing-checklist`                     |    2 |              5 | 构建      |
| `/oem-service`                                                   |    1 |             13 | 构建      |
| `/privacy`                                                       |    1 |              0 | 构建      |
| `/products`                                                      |    1 |             61 | 线上      |
| `/products/mig-mag-torch-parts`                                  |    1 |             32 | 构建      |
| `/products/mig-mag-torch-parts/mig-contact-tip-m6-0-8mm`         |    2 |             15 | 构建      |
| `/products/mig-mag-torch-parts/mig-contact-tip-m6-1-0mm`         |    1 |             17 | 构建      |
| `/products/mig-mag-torch-parts/mig-contact-tip-m6-1-2mm`         |    2 |             13 | 构建      |
| `/products/mig-mag-torch-parts/mig-diffuser`                     |    2 |              7 | 构建      |
| `/products/mig-mag-torch-parts/mig-gas-nozzle-for-mb15`          |    1 |              9 | 构建      |
| `/products/mig-mag-torch-parts/mig-mag-welding-torch`            |    1 |              5 | 构建      |
| `/products/mig-mag-torch-parts/mig-swan-neck`                    |    1 |              4 | 构建      |
| `/products/mig-mag-torch-parts/mig-tip-holder-for-mb15`          |    1 |              6 | 构建      |
| `/products/mig-mag-torch-parts/mig-torch-liner`                  |    1 |              4 | 构建      |
| `/products/mig-mag-torch-parts/mig-torch-switch`                 |    2 |              2 | 构建      |
| `/products/plasma-cutting-consumables`                           |    1 |             23 | 构建      |
| `/products/plasma-cutting-consumables/plasma-cutting-tip`        |    1 |              7 | 构建      |
| `/products/plasma-cutting-consumables/plasma-cutting-torch`      |    1 |              5 | 构建      |
| `/products/plasma-cutting-consumables/plasma-electrode`          |    1 |             15 | 构建      |
| `/products/plasma-cutting-consumables/plasma-nozzle`             |    1 |             13 | 构建      |
| `/products/plasma-cutting-consumables/plasma-shield`             |    1 |              3 | 构建      |
| `/products/plasma-cutting-consumables/plasma-swirl-ring`         |    1 |              3 | 构建      |
| `/products/plasma-cutting-consumables/plasma-torch-spacer`       |    2 |              2 | 构建      |
| `/products/tig-torch-parts`                                      |    1 |             25 | 构建      |
| `/products/tig-torch-parts/tig-back-cap`                         |    1 |             10 | 构建      |
| `/products/tig-torch-parts/tig-ceramic-cup-5`                    |    1 |             16 | 构建      |
| `/products/tig-torch-parts/tig-ceramic-cup-6`                    |    2 |              7 | 构建      |
| `/products/tig-torch-parts/tig-collet`                           |    1 |              2 | 构建      |
| `/products/tig-torch-parts/tig-collet-body`                      |    1 |             11 | 构建      |
| `/products/tig-torch-parts/tig-gas-lens-1-6mm`                   |    1 |              6 | 构建      |
| `/products/tig-torch-parts/tig-tungsten-electrode`               |    2 |              2 | 构建      |
| `/products/tig-torch-parts/tig-welding-torch`                    |    1 |              4 | 构建      |
| `/products/welding-accessories`                                  |    1 |             27 | 构建      |
| `/products/welding-accessories/co2-flowmeter`                    |    2 |              4 | 构建      |
| `/products/welding-accessories/dinse-connector`                  |    1 |             12 | 构建      |
| `/products/welding-accessories/ground-clamp`                     |    1 |              4 | 构建      |
| `/products/welding-accessories/robot-welding-torch`              |    2 |              4 | 构建      |
| `/products/welding-accessories/stud-welding-accessories`         |    2 |              1 | 构建      |
| `/products/welding-accessories/welding-cable`                    |    1 |              2 | 构建      |
| `/products/welding-accessories/welding-cable-connector`          |    1 |             12 | 构建      |
| `/products/welding-accessories/welding-protective-cover`         |    2 |              2 | 构建      |
| `/products/welding-accessories/wire-feeder-accessories`          |    1 |             10 | 构建      |
| `/products/welding-consumables`                                  |    1 |             15 | 构建      |
| `/products/welding-consumables/electrode-holder`                 |    1 |              7 | 构建      |
| `/products/welding-consumables/spot-welding-electrode`           |    1 |              5 | 构建      |
| `/products/welding-consumables/welding-electrode`                |    1 |              5 | 构建      |
| `/products/welding-consumables/welding-wire`                     |    1 |              5 | 构建      |
| `/products/welding-machines`                                     |    1 |              9 | 构建      |
| `/products/welding-machines/stud-welding-gun`                    |    1 |              3 | 构建      |
| `/products/welding-machines/wire-feeder`                         |    1 |              4 | 构建      |
| `/quality-control`                                               |    1 |              9 | 构建      |
| `/rfq`                                                           |    1 |             80 | 线上      |
| `/shipping-payment`                                              |    1 |             48 | 构建      |
