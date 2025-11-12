# 图书借阅系统前端

一个现代化的图书借阅管理系统前端应用，基于Vue 3和Vite构建，提供图书浏览、借阅、归还和记录查询等功能。

## 项目特点

- **响应式设计**：适配各种屏幕尺寸，提供良好的移动端和桌面端体验
- **图书管理**：查看图书列表、图书详情、按分类筛选
- **借阅功能**：图书借阅、归还、借阅记录查询
- **搜索功能**：支持按书名、作者、图书编码搜索
- **模拟数据**：内置模拟数据，无需后端服务也能查看功能演示

## 技术栈

- **前端框架**：Vue 3
- **构建工具**：Vite 5
- **路由管理**：Vue Router 4
- **HTTP客户端**：Axios
- **样式**：原生CSS（响应式设计）

## 安装和运行

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/[your-username]/book-borrowing-system.git
   cd book-borrowing-system
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 开发模式运行
   ```bash
   npm run dev
   ```
   访问 http://localhost:5173

4. 构建生产版本
   ```bash
   npm run build
   ```
   构建输出将在 `dist` 目录中

## 项目结构

```
src/
├── assets/           # 静态资源
├── components/       # Vue组件
├── router/           # 路由配置
├── services/         # API服务
├── views/            # 页面组件
├── App.vue           # 应用入口组件
└── main.js           # 应用入口文件
```

## 主要功能模块

### 1. 图书列表（BookList）
- 展示所有图书
- 按分类筛选
- 搜索图书
- 查看图书详情

### 2. 图书详情（BookDetail）
- 展示图书详细信息
- 查看借阅记录
- 借阅图书（如果可借）

### 3. 图书借阅（BorrowBook）
- 填写借阅信息
- 提交借阅申请

### 4. 图书归还（ReturnBook）
- 查询待归还图书
- 归还图书

### 5. 借阅记录（BorrowRecords）
- 查看所有借阅记录
- 按条件筛选
- 分页显示

## GitHub Pages部署

该项目已配置支持GitHub Pages部署，使用以下步骤部署：

1. 确保项目构建成功
   ```bash
   npm run build
   ```

2. 配置GitHub Pages使用 `dist` 目录

3. 推送代码到GitHub仓库

## 注意事项

- 项目使用模拟数据作为API不可用时的回退方案
- 生产环境部署时需要配置正确的API基础路径
- 移动端和桌面端都有专门的响应式设计优化

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！