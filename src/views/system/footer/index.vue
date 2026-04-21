<template>
  <div class="app-container footer-config-page" v-loading="loading">
    <el-row :gutter="20">
      <el-col :xl="14" :lg="14" :md="24" :sm="24">
        <el-card class="config-card" shadow="never">
          <template #header>
            <div class="card-head">
              <div>
                <h3>页脚配置</h3>
                <p>统一维护用户端 footer 的品牌文案、联系方式与跳转链接。</p>
              </div>
            </div>
          </template>

          <el-alert
            title="微信、QQ 支持上传二维码图片；邮箱填写可直接对外展示的联系地址；页面链接支持内部路由和外部地址。"
            type="info"
            :closable="false"
            class="page-alert"
          />

          <el-form ref="footerRef" :model="form" :rules="rules" label-width="96px" class="footer-form">
            <section class="form-section">
              <div class="section-head">
                <h4>品牌信息</h4>
                <span>对应 footer 左侧品牌区域</span>
              </div>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="中文名称" prop="brandName">
                    <el-input v-model="form.brandName" maxlength="20" placeholder="请输入品牌名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="英文标识" prop="brandTag">
                    <el-input v-model="form.brandTag" maxlength="40" placeholder="请输入英文标识" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="简介文案" prop="description">
                    <el-input
                      v-model="form.description"
                      type="textarea"
                      :rows="3"
                      maxlength="120"
                      show-word-limit
                      placeholder="请输入 footer 简介文案"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="版权文案" prop="copyrightText">
                    <el-input v-model="form.copyrightText" maxlength="40" placeholder="请输入版权说明文案" />
                  </el-form-item>
                </el-col>
              </el-row>
            </section>

            <section class="form-section">
              <div class="section-head">
                <h4>联系方式</h4>
                <span>微信、QQ 以二维码展示，邮箱以文本地址展示</span>
              </div>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="微信二维码">
                    <ImageUpload
                      v-model="form.wechatQrUrl"
                      :limit="1"
                      :file-type="['png', 'jpg', 'jpeg', 'webp']"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="QQ二维码">
                    <ImageUpload
                      v-model="form.qqQrUrl"
                      :limit="1"
                      :file-type="['png', 'jpg', 'jpeg', 'webp']"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="联系邮箱" prop="email">
                    <el-input v-model="form.email" maxlength="80" placeholder="如 contact@example.com" />
                  </el-form-item>
                </el-col>
              </el-row>
            </section>

            <section v-for="(group, groupIndex) in form.groups" :key="group.key" class="form-section">
              <div class="section-head">
                <h4>{{ group.title || `链接分组 ${groupIndex + 1}` }}</h4>
                <span>支持修改分组标题、链接文字和跳转地址</span>
              </div>

              <el-form-item :label="`分组标题`">
                <el-input v-model="group.title" maxlength="10" placeholder="请输入分组标题" />
              </el-form-item>

              <div v-for="(link, linkIndex) in group.links" :key="`${group.key}-${linkIndex}`" class="link-editor">
                <div class="link-editor__head">链接 {{ linkIndex + 1 }}</div>
                <el-row :gutter="16" class="link-editor__row">
                  <el-col :xl="7" :lg="8" :md="12" :sm="24" :xs="24">
                    <el-form-item label="文字" label-width="54px">
                      <el-input v-model="link.label" maxlength="20" placeholder="请输入链接文字" />
                    </el-form-item>
                  </el-col>
                  <el-col :xl="11" :lg="10" :md="12" :sm="24" :xs="24">
                    <el-form-item label="地址" label-width="54px">
                      <el-input v-model="link.url" maxlength="255" placeholder="支持 /user/home 或 https://example.com" />
                    </el-form-item>
                  </el-col>
                  <el-col :xl="6" :lg="6" :md="24" :sm="24" :xs="24">
                    <el-form-item label="新窗" label-width="54px" class="link-editor__switch">
                      <el-switch v-model="link.newTab" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </section>

            <div class="action-bar">
              <el-button type="primary" :loading="saving" @click="submitForm" v-hasPermi="['system:footer:edit']">
                保存配置
              </el-button>
              <el-button @click="restoreLoaded">恢复本次加载内容</el-button>
              <el-button plain @click="useDefaultTemplate">恢复默认模板</el-button>
            </div>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xl="10" :lg="10" :md="24" :sm="24">
        <el-card class="preview-card" shadow="never">
          <template #header>
            <div class="card-head">
              <div>
                <h3>实时预览</h3>
                <p>右侧预览和用户端 footer 结构保持一致。</p>
              </div>
            </div>
          </template>

          <div class="preview-shell">
            <div class="preview-main">
              <div class="preview-brand">
                <div class="preview-logo">
                  <el-icon><Connection /></el-icon>
                </div>
                <div>
                  <div class="preview-brand-name">{{ form.brandName }}</div>
                  <div class="preview-brand-tag">{{ form.brandTag }}</div>
                </div>
              </div>

              <p class="preview-desc">{{ form.description }}</p>

              <div class="preview-contacts">
                <div class="preview-contact">
                  <div class="preview-contact__title">微信</div>
                  <el-image
                    v-if="form.wechatQrUrl"
                    :src="resolveFooterAsset(form.wechatQrUrl)"
                    fit="cover"
                    class="preview-qr"
                  />
                  <div v-else class="preview-empty">未上传二维码</div>
                </div>
                <div class="preview-contact">
                  <div class="preview-contact__title">QQ</div>
                  <el-image
                    v-if="form.qqQrUrl"
                    :src="resolveFooterAsset(form.qqQrUrl)"
                    fit="cover"
                    class="preview-qr"
                  />
                  <div v-else class="preview-empty">未上传二维码</div>
                </div>
                <div class="preview-contact preview-contact--email">
                  <div class="preview-contact__title">邮箱</div>
                  <div class="preview-email">{{ form.email || '未填写邮箱地址' }}</div>
                </div>
              </div>

              <div class="preview-links">
                <div v-for="group in form.groups" :key="group.key" class="preview-group">
                  <div class="preview-group__title">{{ group.title }}</div>
                  <div
                    v-for="(link, linkIndex) in group.links"
                    :key="`${group.key}-${linkIndex}`"
                    class="preview-link"
                    :class="{ 'is-disabled': !hasFooterLink(link.url) }"
                  >
                    <span>{{ link.label }}</span>
                    <el-icon><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
            </div>

            <div class="preview-bottom">
              <span>© {{ currentYear }}</span>
              <span class="preview-divider">|</span>
              <span>{{ form.copyrightText }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="FooterConfig">
import { getFooterConfig, updateFooterConfig } from '@/api/system/footer'
import { createDefaultFooterConfig, hasFooterLink, normalizeFooterConfig, resolveFooterAsset } from '@/utils/footer'
import { validEmail } from '@/utils/validate'

const { proxy } = getCurrentInstance()

const footerRef = ref()
const loading = ref(false)
const saving = ref(false)
const currentYear = new Date().getFullYear()
const form = ref(createDefaultFooterConfig())
const loadedSnapshot = ref(createDefaultFooterConfig())

const rules = {
  brandName: [{ required: true, message: '中文名称不能为空', trigger: 'blur' }],
  brandTag: [{ required: true, message: '英文标识不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '简介文案不能为空', trigger: 'blur' }],
  email: [
    {
      validator: (rule, value, callback) => {
        if (!value || validEmail(value)) {
          callback()
          return
        }
        callback(new Error('请输入正确的邮箱地址'))
      },
      trigger: ['blur', 'change']
    }
  ]
}

function deepClone(data) {
  return JSON.parse(JSON.stringify(data))
}

async function loadData() {
  loading.value = true
  try {
    const response = await getFooterConfig()
    const normalized = normalizeFooterConfig(response.data)
    form.value = normalized
    loadedSnapshot.value = deepClone(normalized)
  } catch (error) {
    const fallback = createDefaultFooterConfig()
    form.value = fallback
    loadedSnapshot.value = deepClone(fallback)
  } finally {
    loading.value = false
  }
}

function restoreLoaded() {
  form.value = deepClone(loadedSnapshot.value)
}

function useDefaultTemplate() {
  form.value = createDefaultFooterConfig()
}

async function submitForm() {
  try {
    await footerRef.value.validate()
  } catch (error) {
    return
  }

  saving.value = true
  try {
    const payload = normalizeFooterConfig(form.value)
    const response = await updateFooterConfig(payload)
    const normalized = normalizeFooterConfig(response.data)
    form.value = normalized
    loadedSnapshot.value = deepClone(normalized)
    proxy.$modal.msgSuccess('保存成功')
  } finally {
    saving.value = false
  }
}

loadData()
</script>

<style lang="scss" scoped>
.footer-config-page {
  .config-card,
  .preview-card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 16px 40px -28px rgba(15, 23, 42, 0.22);
  }

  .page-alert {
    margin-bottom: 20px;
    border-radius: 14px;
  }

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      margin: 0;
      font-size: 18px;
      color: #0f172a;
    }

    p {
      margin: 6px 0 0;
      color: #64748b;
      font-size: 13px;
    }
  }

  .footer-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-section {
    padding: 22px;
    border-radius: 18px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    border: 1px solid #e2e8f0;
  }

  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 18px;

    h4 {
      margin: 0;
      font-size: 16px;
      color: #0f172a;
    }

    span {
      font-size: 12px;
      color: #94a3b8;
    }
  }

  .link-editor {
    padding: 16px;
    border-radius: 14px;
    background: #fff;
    border: 1px solid #e2e8f0;
    overflow: hidden;

    & + .link-editor {
      margin-top: 14px;
    }
  }

  .link-editor__head {
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }

  .link-editor__row {
    margin-bottom: -18px;

    > :deep(.el-col) {
      min-width: 0;
    }
  }

  .link-editor__switch {
    :deep(.el-form-item__content) {
      min-width: 0;
    }
  }

  .action-bar {
    display: flex;
    gap: 12px;
    padding-top: 8px;
  }

  .preview-shell {
    min-height: 100%;
    padding: 28px;
    border-radius: 22px;
    background:
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.24), transparent 42%),
      radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.18), transparent 35%),
      linear-gradient(180deg, #111b34 0%, #18233f 100%);
    color: #cbd5e1;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .preview-main {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .preview-brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .preview-logo {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f8fbff;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    box-shadow: 0 12px 24px -14px rgba(59, 130, 246, 0.85);
  }

  .preview-brand-name {
    color: #f8fafc;
    font-size: 18px;
    font-weight: 700;
  }

  .preview-brand-tag {
    margin-top: 4px;
    color: #94a3b8;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .preview-desc {
    margin: 0;
    line-height: 1.8;
    color: #94a3b8;
  }

  .preview-contacts {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .preview-contact {
    padding: 14px;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.32);
    border: 1px solid rgba(148, 163, 184, 0.18);
  }

  .preview-contact__title {
    margin-bottom: 10px;
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 600;
  }

  .preview-qr {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 12px;
    overflow: hidden;
  }

  .preview-empty,
  .preview-email {
    min-height: 96px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    text-align: center;
    line-height: 1.6;
    background: rgba(255, 255, 255, 0.04);
    color: #94a3b8;
    word-break: break-all;
  }

  .preview-contact--email .preview-email {
    min-height: 128px;
  }

  .preview-links {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .preview-group {
    padding: 16px;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.28);
    border: 1px solid rgba(148, 163, 184, 0.18);
  }

  .preview-group__title {
    margin-bottom: 12px;
    color: #f8fafc;
    font-size: 14px;
    font-weight: 700;
  }

  .preview-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    color: #cbd5e1;

    &.is-disabled {
      opacity: 0.45;
    }
  }

  .preview-bottom {
    padding-top: 18px;
    border-top: 1px solid rgba(148, 163, 184, 0.14);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    color: #94a3b8;
    font-size: 13px;
  }

  .preview-divider {
    color: rgba(148, 163, 184, 0.45);
  }

  @media (max-width: 1200px) {
    .preview-contacts,
    .preview-links {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .action-bar {
      flex-wrap: wrap;
    }

    .form-section {
      padding: 18px;
    }

    .section-head {
      flex-direction: column;
      gap: 6px;
      align-items: flex-start;
    }

    .link-editor__switch {
      :deep(.el-form-item__content) {
        justify-content: flex-start;
      }
    }
  }
}
</style>
