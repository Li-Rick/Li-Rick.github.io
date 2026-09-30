# 李沅润 · Rick

P5R 红黑动态首页 + P3R 蓝色阅读与摄影空间。原生 HTML/CSS/JavaScript，GitHub Pages 可直接托管，无需构建或运行时 CDN。

## 页面与内容

- `/`：基础介绍、四个菜单、动态几何背景、顺序入场和光标反馈。
- `/academic/`：21 篇笔记，支持全文搜索、分类与排序。
- `/academic/note/?id=n01`：阅读器、目录、表格、公式、流程图和 Markdown 下载。
- `/photography/`：26 张照片，自动轮播、拖动、缩略图定位、大图与原图。
- `/projects/`：GitHub 项目入口。
- `/about/`：介绍和开源致谢。

已移除测试文章与 Hello World 的页面，旧归档、标签与分类页跳转到文献库。

## 预览与验证

运行 `node preview.cjs`，访问 http://127.0.0.1:4173 。
运行 `node scripts/verify-content.cjs` 检查笔记、图片、附件和页面本地链接。

## 内容维护

- `content/notes.json`：笔记元数据；`content/notes/`：Markdown 正文。
- `content/photos.json`：照片标题、原始文件名、尺寸和路径。
- `content/photos/`：图片原件；`content/thumbs/`：用于快速浏览的 WebP 缩略图。
- `content/media/`：笔记引用的本地 PDF 和图表。
- `assets/site-v2.js`：公用布局和主页；`assets/upgrade.css`：P3R 与动效样式。
- `assets/logo.svg`：红蓝 R 矢量标志，也用作 favicon。

`python scripts/import-content.py` 从用户指定的 `D:/WIG` 根目录 Markdown 和 `C:/Users/Lenovo/Pictures/壁纸` 导入内容，需要 Pillow。原文件保持不变，已有笔记 ID 保持稳定。研究草稿及子目录中的代理配置、临时文件和演示文稿不纳入笔记库。照片名称为根据画面编写的描述，原始文件名保存在索引中；未推测拍摄地点、器材和时间。

导入包含 14 篇论文精读、5 篇综述和 2 篇索引，保留原有论述、假设及待验证标注。此次为内容迁移，不是重新核实论文事实。

## 交互

首页支持上下键与 Enter；相册支持左右键、触摸拖动、Esc 关闭。自动轮播默认每 5.5 秒切换，悬停、焦点进入、页面隐藏及大图打开时暂停；手动选图后暂停自动播放。

顶部动效开关保存偏好；系统“减少动态效果”生效时关闭背景动画、光标动效和默认自动轮播。正常系统光标保留。公式及流程图库仅在含有相应内容的文章中加载。

## 开源许可

详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，完整许可随 `vendor/` 保存。Anime.js、Embla、Marked、DOMPurify、KaTeX、Mermaid 均本地托管。

## 发布

完整发布包在 `.preview/rick-persona-site.zip`，包含运行所需网页、样式、脚本、笔记、图片、附件和许可证，不包含原始导入目录、缓存或本地预览记录。

发布到已有仓库时，应同时删除 `2021/06/10/测试文章/index.html` 和 `2026/03/06/hello-world/index.html`，以免旧页面残留；归档替换文件已在包内。

当前仓库原为 Hexo 生成产物。如后续继续使用其他源码仓库生成 Hexo，需同步本次静态页面，避免覆盖改版。页面使用根路径，适用于 `Li-Rick.github.io` 用户站点。

