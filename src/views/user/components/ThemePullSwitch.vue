<template>
  <button
    class="theme-switch-btn"
    :class="{ 'is-dark': modelValue }"
    type="button"
    :aria-label="modelValue ? '切换到亮色模式' : '切换到暗黑模式'"
    @click="emit('toggle')"
  >
    <svg class="theme-switch-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
      />
    </svg>
  </button>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle'])
</script>

<style lang="scss" scoped>
.theme-switch-btn {
  width: 24px;
  height: 24px;
  margin-right: 0.55rem;
  border: none;
  background: transparent;
  color: #6f83aa;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  outline: none;
  transition: color 0.2s ease, transform 0.2s ease;

  .theme-switch-icon {
    width: 18px;
    height: 18px;
  }

  &:hover {
    transform: translateY(1px);
    color: #3f5682;
  }

  &:focus-visible {
    border-radius: 4px;
    box-shadow: 0 0 0 2px rgba(95, 134, 255, 0.32);
  }

  &.is-dark {
    color: #f2c04f;
  }
}
</style>
