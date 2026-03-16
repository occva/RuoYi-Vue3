<template>
  <div ref="containerRef" :class="{ 'hidden': hidden }" class="pagination-container">
    <div
      ref="barRef"
      class="pagination-bar"
      :class="{ 'is-affixed': isAffixed }"
      :style="barStyle"
    >
      <el-pagination
        :background="background"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :layout="layout"
        :page-sizes="pageSizes"
        :pager-count="pagerCount"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { scrollTo } from '@/utils/scroll-to'

const props = defineProps({
  total: {
    required: true,
    type: Number
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 20
  },
  pageSizes: {
    type: Array,
    default() {
      return [10, 20, 30, 50]
    }
  },
  // 移动端页码按钮的数量端默认值5
  pagerCount: {
    type: Number,
    default: document.body.clientWidth < 992 ? 5 : 7
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  },
  autoScroll: {
    type: Boolean,
    default: true
  },
  hidden: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits()
const containerRef = ref(null)
const barRef = ref(null)
const isAffixed = ref(false)
const barStyle = ref({})
let scrollContainer = null

const currentPage = computed({
  get() {
    return props.page
  },
  set(val) {
    emit('update:page', val)
  }
})
const pageSize = computed({
  get() {
    return props.limit
  },
  set(val){
    emit('update:limit', val)
  }
})

function handleSizeChange(val) {
  if (currentPage.value * val > props.total) {
    currentPage.value = 1
  }
  emit('pagination', { page: currentPage.value, limit: val })
  if (props.autoScroll) {
    scrollTo(0, 800)
  }
}

function handleCurrentChange(val) {
  emit('pagination', { page: val, limit: pageSize.value })
  if (props.autoScroll) {
    scrollTo(0, 800)
  }
}

function updateAffix() {
  if (!containerRef.value || !barRef.value || props.hidden || props.total <= 0) return

  const barHeight = barRef.value.offsetHeight
  containerRef.value.style.setProperty('--pagination-holder-height', `${barHeight}px`)

  const containerRect = containerRef.value.getBoundingClientRect()
  const scrollRect = scrollContainer?.getBoundingClientRect?.() ?? {
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight
  }
  const bottomOffset = Math.max(window.innerHeight - scrollRect.bottom, 0)
  const shouldAffix = containerRect.bottom > scrollRect.bottom

  if (isAffixed.value !== shouldAffix) {
    isAffixed.value = shouldAffix
  }
  if (!shouldAffix) {
    if (Object.keys(barStyle.value).length > 0) {
      barStyle.value = {}
    }
    return
  }

  const nextStyle = {
    left: `${containerRect.left}px`,
    width: `${containerRect.width}px`,
    bottom: `${bottomOffset}px`
  }
  const currentStyle = barStyle.value
  if (
    currentStyle.left !== nextStyle.left ||
    currentStyle.width !== nextStyle.width ||
    currentStyle.bottom !== nextStyle.bottom
  ) {
    barStyle.value = nextStyle
  }
}

function bindAffixEvents() {
  scrollContainer = containerRef.value?.closest('.app-main')

  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', updateAffix, { passive: true })
  }
  window.addEventListener('scroll', updateAffix, { passive: true })
  window.addEventListener('resize', updateAffix, { passive: true })

  nextTick(() => updateAffix())
}

function unbindAffixEvents() {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', updateAffix)
  }
  window.removeEventListener('scroll', updateAffix)
  window.removeEventListener('resize', updateAffix)
}

onMounted(() => {
  bindAffixEvents()
})

watch(() => [props.total, props.hidden, props.page, props.limit], () => {
  nextTick(() => updateAffix())
})

onBeforeUnmount(() => {
  unbindAffixEvents()
})
</script>

<style scoped>
.pagination-container {
  display: block;
  position: relative;
  bottom: auto;
  z-index: auto;
  min-height: var(--pagination-holder-height, auto);
  margin-top: 20px;
  padding: 0;
  background: transparent;
  backdrop-filter: none;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  background: transparent;
}

.pagination-bar.is-affixed {
  position: fixed;
  z-index: 20;
  padding: 12px 0 8px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), var(--el-bg-color-overlay, #fff) 26px);
  backdrop-filter: blur(8px);
}

.pagination-container.hidden {
  display: none;
}
</style>
