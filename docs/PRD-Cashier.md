# 收银台（Cashier）产品需求文档 PRD

**文档版本：** 1.0  
**更新日期：** 2026-05-31  
**交付对象：** 开发团队、产品设计  
**关联文档：** [PRD-E-Wallet.md](./PRD-E-Wallet.md)

---

## 一、背景与目标

### 1.1 背景

当前 E-Wallet 在仪表盘（Dashboard）的 **Quick pay** 区块已展示 Biller 列表（水电、燃气、网络等），但点击后**无后续支付流程**。用户侧「向商户 / 公用事业缴费」的核心路径尚未闭环。

**收银台（Cashier）** 是用户完成**对外支付**的统一页面：选择收款方、确认金额、输入交易密码、提交支付，并生成 `Payment` 类型交易记录。

### 1.2 产品目标

| 目标 | 说明 |
|------|------|
| 闭环 Quick pay | 从 Dashboard Biller 点击进入完整缴费流程 |
| 统一支付体验 | 与 Deposit / Withdraw / Transfer 模态框一致的步骤与视觉语言 |
| 跨设备一致 | 支付结果写入后端，手机与电脑看到相同余额与交易记录 |
| 可扩展 | 预留扫码付、账单号查询、商户分类等二期能力 |

### 1.3 不在本期范围（Out of scope）

- **商户端收银系统**（店员 POS、对账后台）
- 真实对接公用事业 / 银行清算通道（本期为演示级「提交即成功」）
- 分期、优惠券、多币种
- 离线支付、NFC

---

## 二、用户与角色

| 角色 | 说明 | 收银台权限 |
|------|------|------------|
| 未登录用户 | 访客 | 不可访问，重定向 `/login` |
| 已登录用户（付款方） | 电子钱包持有人 | 发起支付、查看支付结果 |
| 收款方（Biller / 商户） | 系统配置的缴费对象 | 仅作为数据展示，无登录账号 |

---

## 三、页面定位与入口

### 3.1 路由

| 路径 | 说明 | 需登录 |
|------|------|--------|
| `/cashier` | 收银台首页（选择 Biller 或扫码） | 是 |
| `/cashier/:billerId` | 指定 Biller 的支付流程（跳过选商户） | 是 |
| `/cashier/scan` | 扫码付入口（可选，与 `/cashier` 合并为 Tab 亦可） | 是 |

**建议：** 收银台为**独立页面**（非仅 Modal），便于深链接、分享回跳与浏览器前进/后退；流程内各步骤可在同一页内分步展示（与 `DepositFlowModal` 步骤模式一致）。

### 3.2 入口

| 入口 | 行为 |
|------|------|
| Dashboard → Quick pay → 点击 Biller | 跳转 `/cashier/{billerId}`，Biller 信息预填 |
| Dashboard → 「Scan to pay」图标 | 跳转 `/cashier/scan` 或打开收银台扫码步骤 |
| 底部 Tab（可选） | 新增第 4 个 Tab「Pay / Cashier」，路由 `/cashier` |
| 交易记录 → 「Pay again」 | 二期：基于历史 Payment 快速回填 Biller |

---

## 四、功能需求

### 4.1 收银台首页（`/cashier`）

| 需求项 | 描述 | 验收标准 |
|--------|------|----------|
| 页头 | 标题 **Cashier**（或中文「收银台」），副标题说明「Pay bills and merchants from your wallet」 | 与 Tab 页标题风格一致 |
| 可用余额 | 展示当前 **Available balance** | 与 Dashboard 余额一致，格式 `$1,234.56` |
| Biller 列表 | 复用 / 同步 Dashboard 的 Biller 数据源 | Logo（或首字母）+ 名称，网格布局 |
| 搜索（可选 v1.1） | 按 Biller 名称过滤 | 输入即时过滤列表 |
| 扫码入口 | 明显按钮「Scan QR to pay」 | 进入扫码步骤 |
| 空状态 | 无 Biller 时提示联系客服或稍后重试 | 不白屏 |

### 4.2 选择收款方（Payee）

| 需求项 | 描述 | 验收标准 |
|--------|------|----------|
| Biller 详情 | 展示名称、Logo、类别（Utility / Telecom 等） | 从 `billerId` 加载 |
| 账单账号（Account no.） | 用户输入缴费账号，如电表号、手机号 | 必填；长度 4–32 字符；仅允许字母数字与 `-` |
| 账号校验 | 前端格式校验；后端可 Mock「账号有效」 | 非法格式提示：「Please enter a valid account number」 |
| 查单（可选 v1.1） | 「Look up bill」拉取应付金额 | Mock 返回固定金额或随机演示金额；失败可改手动输入 |

### 4.3 输入金额（Amount）

| 需求项 | 描述 | 验收标准 |
|--------|------|----------|
| 金额输入 | 用户输入支付金额（USD） | 支持小数点后两位 |
| 快捷金额 | 可选 chips：$10 / $25 / $50 / $100 | 点击填入输入框 |
| 最小金额 | ≥ $0.01 | 低于最小值提示 |
| 最大金额 | ≤ 当前可用余额 | 超过余额提示：「Payment amount exceeds your available balance」 |
| 手续费 | 默认 **$0.00**（账单类免手续费）；或配置为 0.5% 封顶 $5（产品可二选一，见 4.8） | 实时展示 Fee、Total deduction |
| 余额预览 | 展示支付后预估余额 | `balance - totalDeduction` |

### 4.4 确认订单（Review）

| 需求项 | 描述 | 验收标准 |
|--------|------|----------|
| 订单摘要 | Biller 名称、Account no.、Payment amount、Fee、Total deduction | 只读汇总卡片 |
| 返回修改 | 「Back」回到上一步 | 已填数据保留 |
| 继续 | 「Continue」进入交易密码步骤 | — |

### 4.5 交易密码（Security）

| 需求项 | 描述 | 验收标准 |
|--------|------|----------|
| 密码输入 | **Transaction password** 输入框 | 与 Deposit 流程 UI 一致 |
| 校验方式 | 调用 `POST /api/auth/verify-password` | 错误提示：「Incorrect password」 |
| 空密码 | 不可提交 | 「Please enter your transaction password」 |
| 失败次数（可选） | 连续 5 次错误锁定 15 分钟 | 二期；v1 可仅前端提示 |

### 4.6 支付结果（Success / Failure）

| 需求项 | 描述 | 验收标准 |
|--------|------|----------|
| 成功页 | 图标 ✓、标题 **Payment successful** | — |
| 成功字段 | Reference no.、Biller、Account no.、Amount、Fee、Total、Date | 与 Deposit 成功页结构一致 |
| 写交易 | 创建 `businessDescription: Payment` 交易 | 出现在 `/transactions`，余额减少 |
| 失败页 | 网络错误 / 余额不足 / 密码错误 | 明确文案，可重试或返回 |
| 完成操作 | 「Done」→ 回 Dashboard 或 `/transactions`；「Pay again」→ 清空金额保留 Biller | — |

### 4.7 扫码支付（Scan to pay）

| 需求项 | 描述 | 验收标准 |
|--------|------|----------|
| 扫码 UI | 调用设备相机或上传二维码图片（v1 可仅支持手动输入 Wallet ID） | 移动端优先 |
| 二维码内容 | 解析为 **Wallet ID** 或 **Cashier payload**（JSON：`{ type, billerId, amount?, account? }`） | 非法码提示「Invalid QR code」 |
| P2P 扫码 | 若仅为 Wallet ID，走**转账**逻辑（与 Transfer 合并或跳转 Transfer 流程） | 不在收银台重复实现时可跳转并带参 |
| 商户码 | 含 `billerId` + 固定金额时，跳过金额步骤 | 预填金额只读或可改（产品定：默认只读） |

### 4.8 业务规则汇总

| 规则 | 默认值 | 备注 |
|------|--------|------|
| 交易类型 | `Payment` | 计入 Money flows「Total payment」 |
| 手续费 | $0 | 与 PRD 主文档「账单支付」一致；若启用费率需同步 Dashboard 文案 |
| 支付状态 | 提交即 `Completed` | 演示版；生产可改为 `Pending` → 异步确认 |
| Reference 格式 | `EW-{timestamp36}` 或 `PAY-{uuid8}` | 与现有 Deposit 参考号风格统一 |
| 并发 | 同一用户快速双击仅产生一笔 | 前端防抖 + 后端幂等键（二期） |

---

## 五、信息架构与流程

### 5.1 主流程（Biller 缴费）

```mermaid
flowchart TD
  A[Dashboard Quick pay] --> B[/cashier/:billerId]
  B --> C[输入 Account no.]
  C --> D[输入 Amount]
  D --> E[Review 确认]
  E --> F[Transaction password]
  F --> G{校验通过?}
  G -->|是| H[Payment successful]
  G -->|否| F
  H --> I[写入 Payment 交易]
  I --> J[Dashboard / Transactions]
```

### 5.2 步骤与 UI 模式

与现有 `DepositFlowModal` 对齐，建议步骤枚举：

| Step | 页面标题 | 主要控件 |
|------|----------|----------|
| `payee` | Pay to {Biller} | Account no. 输入 |
| `amount` | Payment amount | 金额输入、Fee 摘要 |
| `review` | Confirm payment | 订单摘要 |
| `password` | Confirm password | 交易密码 |
| `success` | Payment successful | Reference、Done |

---

## 六、数据模型

### 6.1 Biller（收款方）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识，如 `electric-co` |
| `name` | string | 展示名，如 Electric Co. |
| `category` | enum | `utility` \| `telecom` \| `other` |
| `logoUrl` | string? | 可选图片 URL；无则首字母 Avatar |
| `accountLabel` | string | 账号字段标签，如「Meter number」 |
| `accountPattern` | string? | 正则，可选 |

**v1 数据源：** 前端常量或 `GET /api/billers`；与 Dashboard `MOCK_BILLERS` 统一为单一来源。

### 6.2 Payment 交易（扩展现有 Transaction）

复用现有 `WalletTransaction`，`businessDescription = Payment`，建议扩展字段：

| 字段 | 说明 |
|------|------|
| `billerId` | 收款方 ID |
| `billerName` | 快照名称 |
| `accountNumber` | 用户输入的缴费账号（存储需脱敏展示，如 `****1234`） |
| `method` | 固定 `billpay` 或沿用 `ewallet` |

**API：** `POST /api/transactions` 增加可选 body 字段；列表与详情页展示 Biller 信息。

---

## 七、接口需求

### 7.1 新增 / 扩展 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/billers` | 返回 Biller 列表（公开或需登录，建议需登录） |
| GET | `/api/billers/:id` | 单个 Biller 详情 |
| POST | `/api/billers/:id/lookup` | （可选）Mock 查单，body: `{ accountNumber }` |
| POST | `/api/auth/verify-password` | 已有，收银台支付前调用 |
| POST | `/api/transactions` | 已有，body 增加 `billerId`, `billerName`, `accountNumber` |

### 7.2 请求示例（创建 Payment）

```json
{
  "reference": "PAY-M1ABC123",
  "status": "Completed",
  "totalAmount": 85.00,
  "fee": 0,
  "netAmountCredit": 85.00,
  "createdAt": "2026-05-31T12:00:00.000Z",
  "businessDescription": "Payment",
  "method": "billpay",
  "billerId": "electric-co",
  "billerName": "Electric Co.",
  "accountNumber": "1234567890"
}
```

---

## 八、UI/UX 要求

### 8.1 视觉与布局

- 延续现有 **浅色主题**、移动端优先、`max-width: 420px` 居中（与 `index.css` / Dashboard 一致）
- 复用 `DepositFlowModal.css`（`dfm-*`）中的输入框、按钮、摘要行、成功态
- Biller 网格与 Dashboard Quick pay **视觉一致**，避免两套样式

### 8.2 文案（英文 UI，与现网一致）

| 场景 | 文案 |
|------|------|
| 页标题 | Cashier |
| 副标题 | Pay bills and merchants from your wallet |
| 余额不足 | Payment amount exceeds your available balance |
| 支付成功 | Payment successful |
| 密码错误 | Incorrect password |

### 8.3 无障碍与移动端

- 输入框 `autoComplete` 合理设置
- 主按钮触控区域 ≥ 44px
- 支持 `safe-area-inset-bottom`（已有 App 容器样式）

---

## 九、权限与路由变更

### 9.1 更新主 PRD 路由表（建议）

| 路径 | 页面 | 需登录 |
|------|------|--------|
| `/cashier` | 收银台 | 是 |
| `/cashier/:billerId` | 指定 Biller 支付 | 是 |

### 9.2 导航方案（二选一，建议 A）

| 方案 | 说明 | 优缺点 |
|------|------|--------|
| **A. 保持 3 Tab** | 仅从 Dashboard Quick pay / Scan 进入收银台 | 改动小，Tab 不拥挤 |
| **B. 4 Tab** | 增加「Pay」Tab → `/cashier` | 入口更明显，需改 `BottomTabs` 与主 PRD 3.4 |

**推荐 v1：方案 A**；若收银台使用频率高，v1.1 再升 Tab。

---

## 十、非功能需求

| 类别 | 要求 |
|------|------|
| 性能 | 首屏 < 2s（Biller 列表 ≤ 20 条） |
| 安全 | 账号全量仅存后端；前端展示脱敏；HTTPS |
| 兼容 | iOS Safari、Android Chrome；Vercel 部署 SPA 路由需包含 `/cashier/*` |
| 可测 | 提供 Mock Biller 与 Mock 查单，便于 QA 无真实通道测试 |

---

## 十一、验收检查清单

- [ ] 未登录访问 `/cashier` 跳转 `/login`
- [ ] Dashboard Quick pay 点击 Biller 进入收银台且 Biller 正确
- [ ] 完整走通：Account no. → Amount → Review → Password → Success
- [ ] 密码错误不扣款、不生成交易
- [ ] 余额不足在 Amount 或 Review 步骤拦截
- [ ] 成功后余额减少、Money flows「Total payment」增加、交易列表可见
- [ ] 交易详情展示 Biller 名称与脱敏账号
- [ ] 手机与电脑同一账号数据一致（依赖后端 API）
- [ ] 浏览器刷新 `/cashier/:billerId` 不 404（SPA fallback）
- [ ] 构建通过，无 TypeScript / Lint 错误

---

## 十二、版本规划

| 版本 | 范围 |
|------|------|
| **v1.0** | 独立页面、Biller 列表、Account + Amount + Review + Password + Success、写 Payment 交易 |
| **v1.1** | 扫码付、Mock 查单、Biller 搜索、Pay again |
| **v2.0** | 真实通道对接、Pending 状态、商户后台、幂等与对账 |

---

## 十三、与主 PRD 的变更同步

实施收银台后，请回写 [PRD-E-Wallet.md](./PRD-E-Wallet.md)：

1. **3.5** Biller 交互：由「预留入口」改为「跳转 `/cashier/:billerId`」  
2. **五、路由表**：增加 `/cashier` 相关路径  
3. **六、数据与接口**：补充 Biller、Payment 扩展字段  
4. **七、验收清单**：增加收银台相关项  
5. **1.3 技术形态**：更新为「前端 SPA + 后端 API（Express + SQLite）」若后端已上线  

---

**文档结束。评审通过后进入设计与开发排期。**
