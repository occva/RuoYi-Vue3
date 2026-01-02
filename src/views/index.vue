<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>Association 社团管理系统</h2>
        <p>
          专注于高校社团的数字化管理平台，提供社团全生命周期管理、活动精细化运营及成员高效协作解决方案。基于 RuoYi-Vue 深度定制，融合 Modern Premium 设计语言。
        </p>
        <p>
          <b>当前版本:</b> <span>v1.0.0 (Based on RuoYi v3.9.1)</span>
        </p>
        <p>
          <el-button type="primary" icon="Cloudy" plain @click="goTarget('https://github.com/occva/RuoYi-Vue3.git')">项目地址</el-button>
          <el-button icon="Document" plain @click="goTarget('#')">开发文档</el-button>
        </p>
      </el-col>

      <el-col :sm="24" :lg="12" style="padding-left: 50px">
        <el-row>
          <el-col :span="12">
            <h2>技术栈</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <h4>后端技术</h4>
            <ul>
              <li>Spring Boot 3.3</li>
              <li>Spring Security + JWT</li>
              <li>MyBatis Plus</li>
              <li>MySQL + Redis</li>
            </ul>
          </el-col>
          <el-col :span="6">
            <h4>前端技术</h4>
            <ul>
              <li>Vue 3 + Script Setup</li>
              <li>Element Plus</li>
              <li>Vite 构建工具</li>
              <li>Scss + Premium UI</li>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    
    <el-divider />
    
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="premium-card">
          <template #header>
            <div class="card-header">
              <span>核心功能</span>
            </div>
          </template>
          <div class="body feature-list">
            <div class="feature-item">
              <el-icon class="icon" color="#409eff"><Management /></el-icon>
              <div class="content">
                <div class="title">社团管理</div>
                <div class="desc">创建、审核、注销及分类管理，支持热门社团推荐。</div>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="icon" color="#67c23a"><UserFilled /></el-icon>
              <div class="content">
                <div class="title">成员体系</div>
                <div class="desc">社长/副社长/成员三级权限，入退社全流程闭环。</div>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="icon" color="#e6a23c"><Flag /></el-icon>
              <div class="content">
                <div class="title">活动运营</div>
                <div class="desc">活动发布、在线报名、二维码/一键签到及状态流转。</div>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="icon" color="#f56c6c"><BellFilled /></el-icon>
              <div class="content">
                <div class="title">互动通知</div>
                <div class="desc">社团公告发布、重要消息置顶及入社申请审核通知。</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="premium-card">
          <template #header>
            <div class="card-header">
              <span>更新日志</span>
              <el-tag size="small" effect="plain">2026-01-02</el-tag>
            </div>
          </template>
          <el-collapse accordion model-value="1">
            <el-collapse-item title="v1.0.0 核心业务上线" name="1">
              <ol class="update-list">
                <li><span class="tag new">New</span> 完成社团/成员/活动/公告四大模块</li>
                <li><span class="tag new">New</span> 实现"申请-审核-自动入库"业务闭环</li>
                <li><span class="tag feature">Feature</span> 新增活动报名名单与在线签到功能</li>
                <li><span class="tag optimize">Optimize</span> 集成动态数据字典，移除硬编码</li>
                <li><span class="tag style">Style</span> 管理后台全面升级 Premium UI 风格</li>
                <li><span class="tag fix">Fix</span> 修复数据库字段映射与 Mapper 缺陷</li>
              </ol>
            </el-collapse-item>
             <el-collapse-item title="v0.9.0 基础架构升级" name="2">
              <ol class="update-list">
                <li>集成 RuoYi-Vue 脚手架</li>
                <li>后端升级至 Java 21 + Spring Boot 3.3</li>
                <li>前端架构迁移至 Vite + Vue 3</li>
                <li>初始化 Association 数据库 Schema</li>
              </ol>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="premium-card">
           <template #header>
            <div class="card-header">
              <span>后续规划</span>
            </div>
          </template>
          <div class="body">
            <ul class="todo-list">
              <li><el-checkbox label="社团荣誉/成就体系建设" /></li>
              <li><el-checkbox label="社团财务管理模块 (会费/报销)" /></li>
              <li><el-checkbox label="AI 智能社团助手 (自动答疑)" /></li>
              <li><el-checkbox label="活动数据可视化大屏" /></li>
              <li><el-checkbox label="移动端/小程序适配" /></li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
const version = ref('1.0.0')

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: #676a6c;
  overflow-x: hidden;
  background-color: #f7f9fb;
  min-height: calc(100vh - 84px);
  padding: 24px;

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 500;
    color: #303133;
  }

  p {
    margin-top: 10px;
    line-height: 1.6;
    b { font-weight: 700; }
  }

  h4 {
    margin-top: 10px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  ul {
    padding-left: 20px;
    li {
      margin-bottom: 5px;
      color: #606266;
    }
  }

  .premium-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    background: #fff;
    margin-bottom: 20px;
    height: 100%;

    :deep(.el-card__header) {
      padding: 15px 20px;
      border-bottom: 1px solid #EBEEF5;
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        font-size: 16px;
        color: #303133;
      }
    }
    
    .body {
      padding: 10px 0;
    }
  }

  .feature-list {
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;
      padding: 0 10px;

      .icon {
        font-size: 24px;
        margin-right: 12px;
        margin-top: 2px;
        padding: 8px;
        background-color: #f2f6fc;
        border-radius: 8px;
      }

      .content {
        .title {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
          color: #303133;
        }
        .desc {
          font-size: 13px;
          color: #909399;
          line-height: 1.4;
        }
      }
    }
  }

  .update-list {
    padding-left: 20px;
    margin: 0;
    li {
      margin-bottom: 8px;
      line-height: 1.5;
    }
    .tag {
      font-size: 12px;
      padding: 1px 4px;
      border-radius: 3px;
      margin-right: 4px;
      font-weight: bold;
      
      &.new { color: #fff; background-color: #67c23a; }
      &.feature { color: #fff; background-color: #409eff; }
      &.optimize { color: #fff; background-color: #e6a23c; }
      &.style { color: #fff; background-color: #eb5bc0; }
      &.fix { color: #fff; background-color: #f56c6c; }
    }
  }

  .todo-list {
    list-style: none;
    padding-left: 10px;
    li {
      margin-bottom: 12px;
    }
  }
}
</style>
