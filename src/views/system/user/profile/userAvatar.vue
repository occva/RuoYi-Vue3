<template>
  <div class="user-info-head" @click="editCropper()">
    <img :src="options.img" title="点击上传头像" class="img-circle img-lg" />
    <div class="upload-icon">
       <el-icon><Camera /></el-icon>
    </div>
    <el-dialog :title="title" v-model="open" width="800px" append-to-body @opened="modalOpened" @close="closeDialog" class="premium-dialog">
      <el-row>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="true"
            :autoCrop="options.autoCrop"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedBox="options.fixedBox"
            :outputType="options.outputType"
            @realTime="realTime"
            v-if="visible"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }" class="hidden-xs-preview">
          <div class="avatar-upload-preview">
            <img :src="options.previews.url" :style="options.previews.img" />
          </div>
        </el-col>
      </el-row>
      
      <div class="dialog-footer">
        <div class="footer-left">
          <el-upload
            action="#"
            :http-request="requestUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
            class="mobile-upload"
          >
            <el-button class="choice-btn">
              <el-icon><Upload /></el-icon>
              选择图片
            </el-button>
          </el-upload>
          <div class="action-tools">
            <el-button-group>
              <el-button :icon="Plus" @click="changeScale(1)"></el-button>
              <el-button :icon="Minus" @click="changeScale(-1)"></el-button>
              <el-button :icon="RefreshLeft" @click="rotateLeft()"></el-button>
              <el-button :icon="RefreshRight" @click="rotateRight()"></el-button>
            </el-button-group>
          </div>
        </div>
        <div class="footer-right">
          <el-button @click="open = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="uploadImg()" :loading="loading" class="submit-btn">提交修改</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import "vue-cropper/dist/index.css"
import { VueCropper } from "vue-cropper"
import { Plus, Minus, RefreshLeft, RefreshRight, Camera, Upload } from '@element-plus/icons-vue'
import { uploadAvatar } from "@/api/system/user"
import useUserStore from "@/store/modules/user"

const userStore = useUserStore()
const { proxy } = getCurrentInstance()

const open = ref(false)
const visible = ref(false)
const loading = ref(false)
const title = ref("修改头像")

//图片裁剪数据
const options = reactive({
  img: userStore.avatar,     // 裁剪图片的地址
  autoCrop: true,            // 是否默认生成截图框
  autoCropWidth: 200,        // 默认生成截图框宽度
  autoCropHeight: 200,       // 默认生成截图框高度
  fixedBox: true,            // 固定截图框大小 不允许改变
  outputType: "png",         // 默认生成截图为PNG格式
  filename: 'avatar',        // 文件名称
  previews: {}               //预览数据
})

/** 编辑头像 */
function editCropper() {
  open.value = true
}

/** 打开弹出层结束时的回调 */
function modalOpened() {
  visible.value = true
}

/** 覆盖默认上传行为 */
function requestUpload() {}

/** 向左旋转 */
function rotateLeft() {
  proxy.$refs.cropper.rotateLeft()
}

/** 向right旋转 */
function rotateRight() {
  proxy.$refs.cropper.rotateRight()
}

/** 图片缩放 */
function changeScale(num) {
  num = num || 1
  proxy.$refs.cropper.changeScale(num)
}

/** 上传预处理 */
function beforeUpload(file) {
  if (file.type.indexOf("image/") == -1) {
    proxy.$modal.msgError("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。")
  } else {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      options.img = reader.result
      options.filename = file.name
    }
  }
}

/** 上传图片 */
function uploadImg() {
  proxy.$refs.cropper.getCropBlob(data => {
    loading.value = true
    let formData = new FormData()
    formData.append("avatarfile", data, options.filename)
    uploadAvatar(formData).then(response => {
      open.value = false
      options.img = import.meta.env.VITE_APP_BASE_API + response.imgUrl
      userStore.avatar = options.img
      proxy.$modal.msgSuccess("修改成功")
      visible.value = false
    }).finally(() => {
       loading.value = false
    })
  })
}

/** 实时预览 */
function realTime(data) {
  options.previews = data
}

/** 关闭窗口 */
function closeDialog() {
  options.img = userStore.avatar
  visible.value = false
}
</script>

<style lang='scss' scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;

  .img-lg {
    width: 120px;
    height: 120px;
    object-fit: cover;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .upload-icon {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    opacity: 0;
    transition: all 0.3s ease;
    
    .el-icon {
       transform: translateY(10px);
       transition: transform 0.3s ease;
    }
  }

  &:hover {
    .img-lg {
      transform: scale(1.1);
    }
    .upload-icon {
      opacity: 1;
      .el-icon {
         transform: translateY(0);
      }
    }
  }
}

.avatar-upload-preview {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 4px solid #fff;
  margin-left: 100px;
}

.dialog-footer {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-top: 32px;
   padding-top: 24px;
   border-top: 1px solid var(--el-border-color-lighter);

   .footer-left {
      display: flex;
      gap: 16px;
      align-items: center;
   }

   .footer-right {
      display: flex;
      gap: 12px;
   }
}

.choice-btn {
   border-radius: 8px;
   gap: 6px;
}

.cancel-btn {
   padding: 0 24px;
   border-radius: 8px;
   height: 38px;
   font-weight: 500;
   background: var(--el-fill-color-light);
   border: none;
   color: var(--el-text-color-regular);
   transition: all 0.3s;

   &:hover {
      background: var(--el-fill-color);
      color: var(--el-text-color-primary);
   }
}

.submit-btn {
   border-radius: 8px;
   height: 38px;
   padding: 0 24px;
   font-weight: 600;
   box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.action-tools {
   :deep(.el-button-group) {
      .el-button {
         padding: 8px 12px;
         &:first-child { border-radius: 8px 0 0 8px; }
         &:last-child { border-radius: 0 8px 8px 0; }
      }
   }
}

@media (max-width: 768px) {
  .hidden-xs-preview {
    display: none !important;
  }
  
  .action-tools {
    display: none !important;
  }

  .cancel-btn {
    display: none !important;
  }

  .dialog-footer {
    justify-content: center;
    gap: 12px;
    
    .footer-left, .footer-right {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .mobile-upload {
      width: 100%;
      :deep(.el-upload) {
        width: 100%;
      }
    }

    .choice-btn, .submit-btn {
      width: 100%;
      margin: 0 !important;
    }
  }
}
</style>

<!-- Unscoped style for global dialog components appended to body -->
<style lang="scss">
.el-overlay {
   backdrop-filter: blur(6px);
   background-color: rgba(0, 0, 0, 0.45) !important;
}

.el-dialog.premium-dialog {
   border-radius: 20px !important;
   overflow: hidden;
   box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.25) !important;
   background: var(--el-bg-color-overlay);
   border: none !important;
   
   .el-dialog__header {
      margin-right: 0;
      padding: 32px 32px 12px;
      border: none;
      
      .el-dialog__title {
         font-weight: 700;
         font-size: 18px;
         color: var(--el-text-color-primary);
         letter-spacing: normal;
       }

      .el-dialog__headerbtn {
         top: 24px;
         right: 24px;
         width: 36px;
         height: 36px;
         border-radius: 12px;
         background: var(--el-fill-color-lighter);
         transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
         display: flex;
         align-items: center;
         justify-content: center;

         &:hover {
            background-color: var(--el-color-danger-light-9);
            .el-dialog__close {
               color: var(--el-color-danger);
               transform: scale(1.1);
            }
         }

         .el-dialog__close {
            font-size: 18px;
            color: var(--el-text-color-secondary) !important;
            transition: all 0.2s;
         }
      }
   }
   
   .el-dialog__body {
      padding: 0 32px 32px;
   }

   @media (max-width: 768px) {
     width: 90% !important;
     margin-top: 15vh !important;
     
     .el-dialog__header {
        padding: 24px 20px 8px;
     }
     
     .el-dialog__body {
        padding: 0 20px 20px;
     }
   }
}
</style>