# Web Developer Tools Suite (开发者在线工具箱)

一个现代、高效、开箱即用的在线开发者与实用工具集合，基于 React 18、TypeScript 和 Tailwind CSS 构建。

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

- **正则表达式测试 (Regex Tester)**
  - 实时正则匹配测试、语法高亮与修饰符控制

- **文本对比 (Text Diff)**
  - 侧边对比与逐行差异识别

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

---

## 🚀 技术栈 (Tech Stack)

- **前端框架**: React 18 + TypeScript + Vite
- **样式工具**: Tailwind CSS
- **核心解析库**: `js-yaml`, `jsonrepair`, `lucide-react`
- **构建部署**: Standard ESM Node.js container with Vite build pipeline

---

## 💻 本地运行 (Local Setup)

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 构建生产包
npm run build
```

---

## 📄 开源许可 (License)

MIT License.
