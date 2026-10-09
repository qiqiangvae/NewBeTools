# Web Developer Tools Suite (开发者在线工具箱)

一个现代、高效、开箱即用的在线开发者与实用工具集合，基于 React 19、TypeScript 与 Vite 构建，样式由 CDN 引入的 Tailwind CSS 提供。

---

## 🌟 功能特性 (Features)

应用内置了一系列高效的在线开发与数据处理工具，支持双语（中文 / English）切换及深色护眼 UI：

### 🛠️ 核心开发工具

- **YAML 工具 (YAML Tool)**
  - 支持 YAML 语法高亮与实时校验
  - 支持 YAML 格式化、缩进定制 (2/4 空格) 及 Key 排序
  - 支持 YAML 实时转 JSON，并可一键发送数据至 JSON 工具
  - 支持单行流格式压缩与语法错误行自动定位

- **JSON 格式化 (JSON Formatter)**
  - 支持 JSON 格式化、压缩与语法自动修复 (`jsonrepair`)
  - 支持 JSONPath 实时检索与过滤
  - 支持一键将 JSON 数据发送至 YAML 工具转换处理

- **数据格式转换 (Format Converter)**
  - JSON、YAML、TOML、CSV 四种格式任意两两互转，全部在浏览器本地完成，数据不出本机
  - CSV 支持自定义分隔符（逗号 / 制表符 / 分号）、首行是否为表头、可选的类型推断，以及「Excel 兼容」输出（CRLF + UTF-8 BOM）
  - 转换有损时逐条列出丢了什么（TOML 无法表达的 `null` 被丢弃、嵌套值被序列化成 JSON 文本、CSV 的重复列名被改名、参差行被补齐或截断），不承诺往返无损
  - 结果可一键送往 JSON 工具或 YAML 工具继续处理；这两个工具也能一键把当前内容送过来

- **正则表达式测试 (Regex Tester)**
  - 实时正则匹配测试、语法高亮与修饰符控制

- **文本对比 (Text Diff)**
  - 侧边对比与逐行差异识别

- **文本处理增强 (Text Processor)**
  - 支持 `\n` 转义还原、去除 `\"`、逐行修剪空格与自定义行首/行尾附加内容
  - 支持按行包裹引号或括号，并可通过最多 20 条历史记录逐步撤销
  - 内置 Markdown 实时预览（仅编辑 / 分屏对照 / 仅预览），提供 9 套预览主题与代码高亮

- **代码格式化 (Code Formatter)**
  - 基于 Gemini 的 AI 代码格式化，支持 JS、Python、HTML 等多种语言
  - 格式化失败（如缺少 API Key）时保留原代码并给出错误提示

- **JWT 解码 (JWT Decoder)**
  - 实时解析 JWT Header、Payload 与 Signature

- **Base64 转换器 (Base64 Converter)**
  - 文本与图片/文件的 Base64 编码与解码

- **哈希生成器 (Hash Generator)**
  - 支持 MD5、SHA-1、SHA-256、SHA-512 等离线安全哈希计算

- **URL 编解码 (URL Converter)**
  - URL 参数解析与 Encode / Decode

- **时间戳转换 (Timestamp Converter)**
  - Unix 时间戳与标准日期时间格式互转

- **UUID 生成器 (UUID Generator)**
  - 支持批量生成 UUID v4，自定义大小写与分隔符

- **进制转换 (Number Base Converter)**
  - 2进制、8进制、10进制、16进制实时互转

- **Unicode / 拼音 / 字符串大小写转换**
  - Unicode 与中文互转、汉字转拼音、CamelCase/snake_case/kebab-case 转换

- **AI 智能助手 (AI Assistant)**
  - 基于 Gemini API 的智能代码辅助与疑问解答

- **IP 地址查询 (IP Lookup)**
  - 查询本机 IP 或任意 IP 地址的详细信息

- **二维码生成 (QR Code)**
  - 将文本或 URL 转换为二维码图片

- **颜色转换 (Color Converter)**
  - HEX、RGB、HSL 颜色格式互转与预设色板

- **单位换算 (Unit Converter)**
  - 存储、长度、时间等常见单位实时换算

- **还贷 / 提前还款计算 (Mortgage Prepayment)**
  - 房贷提前还款计算：缩短年限与减少月供方案对比、利息节省分析

---

## 🚀 技术栈 (Tech Stack)

- **前端框架**: React 19 + TypeScript + Vite
- **样式工具**: Tailwind CSS（由 `index.html` 中的 CDN `<script>` 引入，不是 npm 依赖；自定义主题色定义在该文件的内联 `tailwind.config` 中）
- **图标**: 全部为 `components/Icons.tsx` 中的手写 SVG 组件
- **核心解析库**: `js-yaml`（YAML）、`smol-toml`（TOML）、`papaparse`（CSV 分词）、`jsonrepair`（JSON 修复）、`react-markdown` / `remark-gfm`（Markdown 预览）
- **测试**: Bun 自带的 `bun test`；单元测试与所测模块同目录（`*.test.ts`），另有 `scripts/smoke.tsx` 做渲染冒烟
- **包管理器**: Bun（`bun.lock`）
- **构建部署**: `bun run build` 产出纯静态资源（`dist/`），交给任意静态托管 / Node 容器托管即可

---

## 💻 本地运行 (Local Setup)

```bash
# 1. 安装依赖
bun install

# 2. 启动开发服务器（端口 3000）
bun run dev

# 3. 构建生产包（产物为静态文件，输出到 dist/）
bun run build

# 4. 检查：类型 + 构建 + 单元测试 + 冒烟渲染
bun run verify
```

`bun run verify` 依次执行 `typecheck`、`build`、`test`、`smoke`；这四个脚本也可以单独运行。

AI 助手与代码格式化需要 Gemini API Key：复制 `.env.example` 为 `.env` 并填入 `GEMINI_API_KEY=你的密钥`。Vite 会在构建时通过 `define` 把它注入 `process.env.API_KEY`，未配置时这些功能会显示缺少密钥的提示。其余工具均在浏览器本地运行，只有 AI 功能与 IP 查询会发起网络请求。

界面状态：语言、主题与侧栏折叠会记在 `localStorage`；当前工具会写进 URL 片段（如 `/#json-fmt`），因此刷新和分享链接都能回到同一个工具。数据格式转换还会额外记住输入内容与源/目标格式。

---

## 📄 开源许可 (License)

MIT License.
