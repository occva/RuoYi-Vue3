<template>
  <details v-if="tools && tools.length" class="tool-trace">
    <summary class="tool-trace-summary">
      <span>工具调用（{{ tools.length }}）</span>
      <span class="tool-trace-hint">查看数据来源</span>
    </summary>
    <div class="tool-trace-list">
      <div v-for="(tool, index) in tools" :key="`${tool.name}_${index}`" class="tool-trace-item">
        <div class="tool-trace-head">
          <span class="tool-name">{{ tool.label || tool.name }}</span>
          <span :class="['tool-status', `is-${tool.status || 'success'}`]">
            {{ toolStatusText(tool.status) }}
          </span>
        </div>
        <div v-if="tool.argsSummary" class="tool-line">参数：{{ tool.argsSummary }}</div>
        <div v-if="tool.resultSummary" class="tool-line">结果：{{ tool.resultSummary }}</div>
        <div v-if="tool.errorMessage" class="tool-line is-error">错误：{{ tool.errorMessage }}</div>
        <div v-if="tool.durationMs !== undefined && tool.durationMs !== null" class="tool-duration">
          {{ tool.durationMs }} ms
        </div>
      </div>
    </div>
  </details>
</template>

<script setup>
defineProps({
  tools: {
    type: Array,
    default: () => []
  }
})

function toolStatusText(status) {
  if (status === 'running') return '执行中'
  if (status === 'error') return '失败'
  return '成功'
}
</script>

<style lang="scss" scoped>
.tool-trace {
  margin-bottom: 0.6rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
  padding-bottom: 0.5rem;

  &[open] .tool-trace-summary {
    color: #1d4ed8;
  }
}

.tool-trace-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: pointer;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }

  &::after {
    content: "";
    width: 7px;
    height: 7px;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform: rotate(45deg);
    transition: transform 0.18s ease;
    flex-shrink: 0;
  }
}

.tool-trace[open] .tool-trace-summary::after {
  transform: rotate(225deg);
}

.tool-trace-hint {
  margin-left: auto;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 500;
}

.tool-trace-list {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.tool-trace-item {
  position: relative;
  padding: 0.55rem 0.65rem;
  border: 1px solid rgba(203, 213, 225, 0.72);
  border-radius: 8px;
  background: #f8fafc;
  color: #334155;
  font-size: 0.76rem;
  line-height: 1.45;
}

.tool-trace-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.tool-name {
  color: #0f172a;
  font-weight: 700;
}

.tool-status {
  padding: 0.08rem 0.42rem;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;

  &.is-error {
    background: #fee2e2;
    color: #b91c1c;
  }

  &.is-running {
    background: #e0f2fe;
    color: #0369a1;
  }
}

.tool-line {
  color: #475569;
  overflow-wrap: anywhere;

  &.is-error {
    color: #b91c1c;
  }
}

.tool-duration {
  margin-top: 0.25rem;
  color: #94a3b8;
  font-size: 0.68rem;
  text-align: right;
}
</style>
