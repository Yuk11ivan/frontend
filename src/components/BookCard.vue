<template>
  <div class="book-card"
       :class="{ 'book-borrowed': book.status === 'borrowed' }"
       @click="$emit('click')">
    <!-- 图书封面占位区 -->
    <div class="book-cover">
      <div class="book-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <path d="M9 7H39C40.6569 7 42 8.34315 42 10V38C42 39.6569 40.6569 41 39 41H9C7.34315 41 6 39.6569 6 38V10C6 8.34315 7.34315 7 9 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M36 7V41" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 15H36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 21H36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 27H30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 33H24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div v-if="book.status === 'borrowed'" class="status-badge">
        已借出
      </div>
    </div>
    
    <!-- 图书信息 -->
    <div class="book-info">
      <h3 class="book-title" :title="book.title">{{ book.title }}</h3>
      <p class="book-author" :title="book.author">{{ book.author }}</p>
      <p class="book-category">{{ book.category?.name || '未分类' }}</p>
      <p class="book-code">编码: {{ book.code }}</p>
      <div class="book-status">
        <span class="status-indicator" :class="book.status">
          {{ book.status === 'available' ? '可借阅' : '已借出' }}
        </span>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="book-actions">
      <button 
        v-if="book.status === 'available' " 
        class="action-button secondary"
        @click.stop="$emit('click')"
      >
        查看详情
      </button>
      <button 
        v-else 
        class="action-button disabled"
        disabled
      >
        已被借出
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// 定义 props
const props = defineProps({
  book: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      code: '',
      title: '',
      author: '',
      category: null,
      status: 'available'
    })
  }
})

// 定义事件
const emit = defineEmits(['click'])
</script>

<style scoped>
.book-card {
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid transparent;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: #e0e0e0;
}

.book-card:active {
  transform: translateY(0);
  transition-duration: 0.1s;
}

.book-card.book-borrowed {
  opacity: 0.8;
}

/* 图书封面 */
.book-cover {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #f5f5f7 0%, #e5e5ea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.book-icon {
  color: #86868b;
}

.status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #6f42c1;
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* 图书信息 */
.book-info {
  padding: 1rem;
  flex: 1;
}

.book-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.6em;
}

.book-author {
  font-size: 0.875rem;
  color: #666666;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-category {
  font-size: 0.75rem;
  color: #6f42c1;
  background-color: #f8f0ff;
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.book-code {
  font-size: 0.75rem;
  color: #666666;
  margin-bottom: 0.5rem;
}

.book-status {
  margin-top: auto;
}

.status-indicator {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.status-indicator.available {
  background-color: #e8f5e9;
  color: #20c997;
}

.status-indicator.borrowed {
  background-color: #f8f0ff;
  color: #6f42c1;
}

/* 操作按钮 */
.book-actions {
  padding: 0 1rem 1rem;
}

.action-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.action-button:active::before {
  width: 300px;
  height: 300px;
}

.action-button.primary {
  background-color: #007BFF;
  color: #ffffff;
}

.action-button.primary:hover {
  background-color: #0066CC;
}

.action-button.disabled {
  background-color: #f8f9fa;
  color: #666666;
  cursor: not-allowed;
  border: 1px solid #dee2e6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .book-cover {
    height: 140px;
  }
  
  .book-icon {
    transform: scale(0.8);
  }
  
  .book-info {
    padding: 0.75rem;
  }
  
  .book-actions {
    padding: 0 0.75rem 0.75rem;
  }
}
</style>