<template>
  <TransitionGroup name="message" tag="div" class="message-container">
    <div
      v-for="message in messages"
      :key="message.id"
      class="message-toast"
      :class="message.type"
    >
      <div class="message-content">
        <span v-if="message.type" class="message-icon" :class="`icon-${message.type}`">
          <template v-if="message.type === 'success'">✓</template>
          <template v-else-if="message.type === 'error'">✗</template>
          <template v-else-if="message.type === 'warning'">!</template>
          <template v-else-if="message.type === 'info'">i</template>
        </span>
        {{ message.text }}
      </div>
      <button class="message-close" @click="removeMessage(message.id)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { ref, provide } from 'vue'

// 消息列表
const messages = ref([])
let nextId = 0

// 显示消息的方法
const showMessage = (text, type = 'success', duration = 3000, icon = null) => {
  const id = nextId++
  
  messages.value.push({
    id,
    text,
    type
  })
  
  // 设置自动关闭
  if (duration > 0) {
    setTimeout(() => {
      removeMessage(id)
    }, duration)
  }
}

// 移除消息
const removeMessage = (id) => {
  const index = messages.value.findIndex(msg => msg.id === id)
  if (index !== -1) {
    messages.value.splice(index, 1)
  }
}

// 提供给全局使用
provide('showMessage', showMessage)
</script>

<style scoped>
.message-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.message-toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease-out;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.message-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.message-close {
  background: none;
  border: none;
  color: white;
  opacity: 0.7;
  cursor: pointer;
  padding: 4px;
  margin-left: 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.message-close:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.2);
}

/* 消息类型样式 */
.message-toast.success {
  background-color: #20c997;
}

.message-toast.error {
  background-color: #dc3545;
}

.message-toast.warning {
  background-color: #6f42c1;
  color: white;
}

.message-toast.info {
  background-color: #007BFF;
}

/* 动画 */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.message-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.message-move {
  transition: transform 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-container {
    top: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
  
  .message-toast {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>