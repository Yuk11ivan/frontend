# GitHub Pages 部署指南

## 项目部署状态

✅ 代码已成功推送到 GitHub 仓库！

## GitHub Pages 配置步骤

按照以下步骤配置 GitHub Pages 以部署您的图书借阅系统：

1. **登录 GitHub 账户**
   - 访问 [GitHub.com](https://github.com) 并登录您的账户

2. **进入仓库设置**
   - 导航到您的仓库：https://github.com/Yuk11ivan/frontend
   - 点击仓库顶部的 "Settings" 选项卡

3. **配置 Pages**
   - 在左侧导航栏中找到并点击 "Pages"
   - 在 "Build and deployment" 部分，找到 "Source" 选项
   - 选择 "Deploy from a branch" 选项
   - 从下拉菜单中选择 "main" 分支
   - 重要：在分支名称旁边，点击下拉菜单并选择 "/dist" 文件夹
   - 点击 "Save" 按钮保存设置

4. **等待部署完成**
   - GitHub 会自动开始部署过程
   - 通常需要 1-5 分钟完成部署
   - 部署完成后，您会在 Pages 页面看到绿色的成功消息

5. **访问部署的网站**
   - 部署成功后，您可以通过以下 URL 访问您的网站：
   - https://yuk11ivan.github.io/frontend/

## 注意事项

1. **构建配置**
   - 项目已正确配置了 `base: '/book-borrowing-system/'`，但您的仓库名称是 `frontend`
   - 如果需要，您可以修改 `vite.config.js` 中的 base 配置以匹配您的实际仓库路径
   - 例如：将 `base: '/book-borrowing-system/'` 改为 `base: '/frontend/'`

2. **重新构建和推送**
   - 如果修改了 base 配置，需要重新构建项目：
     ```bash
     npm run build
     git add dist
     git commit -m "Update build with new base path"
     git push
     ```

3. **部署问题排查**
   - 如果部署失败，请检查以下几点：
     - 是否正确选择了 `/dist` 文件夹
     - `index.html` 文件是否存在于 dist 目录中
     - 浏览器控制台是否有路由相关错误

4. **自定义域名（可选）**
   - 如果需要使用自定义域名，可以在 Pages 设置中添加
   - 您需要在您的域名提供商处设置相应的 DNS 记录

## 验证部署

部署完成后，请验证以下功能是否正常工作：

1. 图书列表页面是否正确显示
2. 点击图书卡片上的 "查看详情" 按钮是否能正确导航
3. 图书详情页面是否能正常加载和显示
4. 整个网站的导航是否正常工作

如果您在部署过程中遇到任何问题，请随时联系技术支持获取帮助。

---

**配置日期**：2024年7月23日
**项目**：图书借阅系统