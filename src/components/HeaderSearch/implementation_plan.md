# 美化搜索弹窗实施计划

## 1. 目标
根据 `UI_Design_Specification.md` 中的规范，对全局搜索弹窗 (`src/components/HeaderSearch/index.vue`) 进行美化，使其符合 Premium UI 设计标准。

## 2. 修改内容

### 2.1 组件结构调整
- **文件**: `src/components/HeaderSearch/index.vue`
- **修改**:
    - 在 `<el-dialog>` 上添加自定义类名 `class="header-search-dialog"` 和 `modal-class="header-search-modal"`。
    - 启用关闭按钮 (`:show-close="true"`)。
    - 添加弹窗标题 (`title="菜单搜索"`) 以配合头部样式规范。

### 2.2 样式实现 (Non-scoped SCSS)
- **文件**: `src/components/HeaderSearch/index.vue` (新增 `<style lang="scss">` 块)
- **样式细节**:
    - **遮罩层 (`.header-search-modal`)**:
        - 背景色: `rgba(0, 0, 0, 0.45)`
        - 毛玻璃效果: `backdrop-filter: blur(6px)`
    - **弹窗主体 (`.header-search-dialog`)**:
        - 圆角: `20px`
        - 阴影: `0 24px 64px -12px rgba(0, 0, 0, 0.25)`
    - **标题栏 (`.el-dialog__header`)**:
        - 去除下边框
        - 内边距: `32px 32px 12px`
        - 标题字体: `18px`, Bold `700`
    - **关闭按钮 (`.el-dialog__headerbtn`)**:
        - 尺寸: `32px` x `32px`
        - 圆角: `12px` (Squircle)
        - 默认背景: 浅色填充
        - 悬停交互: 背景变红 (`danger-light-9`), 图标变红, 放大 `1.1` 倍
    - **内容区域 (`.el-dialog__body`)**:
        - 内边距: `0 32px 32px`

## 3. 验证
- 打开页面顶部搜索功能。
- 确认弹窗圆角、阴影符合设计。
- 确认背景遮罩带有模糊效果。
- 确认标题显示且样式正确。
- 确认关闭按钮样式及悬停动画效果。
