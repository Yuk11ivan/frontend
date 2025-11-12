<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">图书借阅系统</h1>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <footer class="app-footer">
      <p>© 2024 图书借阅系统 - 为您提供优质的阅读服务</p>
    </footer>
    <!-- 全局消息提示组件 -->
    <MessageToast />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import MessageToast from './components/MessageToast.vue'

// 页面加载时的初始化逻辑
onMounted(() => {
  console.log('图书借阅系统已加载')
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  color: #333333;
}

.app-header {
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #000000;
  text-align: center;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  background-color: #FFFFFF;
}

.app-footer {
  background-color: #f8f9fa;
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #dee2e6;
  margin-top: 2rem;
}

.app-footer p {
  font-size: 0.875rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0.75rem 1rem;
  }
  
  .app-title {
    font-size: 1.25rem;
  }
  
  .app-main {
    padding: 1rem;
  }
}
</style>