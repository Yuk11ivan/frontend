<template>
  <div class="borrow-container">
    <div class="page-header">
      <h1>借阅图书</h1>
      <p class="subtitle">请输入图书编码和您的联系信息完成借阅</p>
    </div>
    
    <div class="borrow-form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="book-code">图书编码</label>
          <input 
            type="text" 
            id="book-code" 
            v-model="bookCode" 
            placeholder="请输入图书编码"
            :disabled="isChecking || isSubmitting"
            @input="validateBookCode"
            @blur="checkBookCode"
          >
          <div v-if="isChecking" class="code-checking">
            验证中...
          </div>
          <div v-else-if="bookInfo" class="book-info-preview">
            <div class="book-preview-content">
              <div class="book-icon-small">
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 7H39C40.6569 7 42 8.34315 42 10V38C42 39.6569 40.6569 41 39 41H9C7.34315 41 6 39.6569 6 38V10C6 8.34315 7.34315 7 9 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M36 7V41" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 15H36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="book-details-preview">
                <p class="book-title-preview">{{ bookInfo.title }}</p>
                <p class="book-author-preview">作者: {{ bookInfo.author }}</p>
              </div>
              <div v-if="!bookInfo.available" class="book-unavailable">
                不可借阅
              </div>
            </div>
          </div>
          <span v-if="errors.bookCode" class="error-message">{{ errors.bookCode }}</span>
        </div>
        
        <div class="form-group">
          <label for="phone">手机号</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="phone" 
            placeholder="请输入您的手机号"
            maxlength="11"
            :disabled="isSubmitting"
            @input="validatePhone"
          >
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>
        
        <div class="form-actions">
          <router-link to="/" class="action-button secondary">
            返回图书列表
          </router-link>
          <button 
            type="submit" 
            class="action-button primary"
            :disabled="!isFormValid || isSubmitting || (bookInfo && !bookInfo.available)"
          >
            <span v-if="isSubmitting">处理中...</span>
            <span v-else>确认借阅</span>
          </button>
        </div>
      </form>
    </div>
    
    <div v-if="borrowSuccess" class="success-message">
      <div class="success-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>借阅成功！</h3>
      <p>您已成功借阅《{{ bookInfo.title }}》</p>
      <p class="reminder">请记得按时归还图书。</p>
      <div class="success-actions">
        <router-link to="/" class="action-button primary">
          返回图书列表
        </router-link>
      </div>
    </div>
    
    <!-- 消息提示 -->
    <div v-if="message" class="message-toast" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { getBookByCode, borrowBook } from '../services/api'

// 表单数据
const bookCode = ref('')
const phone = ref('')
const bookInfo = ref(null)
const isChecking = ref(false)
const isSubmitting = ref(false)
const borrowSuccess = ref(false)
const errors = reactive({
  bookCode: '',
  phone: ''
})
const message = ref('')
const messageType = ref('success')

// 计算属性 - 表单是否有效
const isFormValid = computed(() => {
  return bookCode.value.trim() !== '' && 
         phone.value.trim() !== '' && 
         !errors.bookCode && 
         !errors.phone &&
         bookInfo.value !== null
})

// 验证图书编码
const validateBookCode = () => {
  if (!bookCode.value.trim()) {
    errors.bookCode = '请输入图书编码'
    bookInfo.value = null
  } else {
    errors.bookCode = ''
  }
}

// 检查图书编码是否存在
const checkBookCode = async () => {
  if (!bookCode.value.trim()) return
  
  try {
    isChecking.value = true
    errors.bookCode = ''
    const book = await getBookByCode(bookCode.value)
    bookInfo.value = book
    
    if (!book.available) {
      errors.bookCode = '该图书当前不可借阅'
    }
  } catch (error) {
    errors.bookCode = '未找到该图书'
    bookInfo.value = null
  } finally {
    isChecking.value = false
  }
}

// 验证手机号
const validatePhone = () => {
  if (!phone.value) {
    errors.phone = '请输入手机号'
  } else if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    errors.phone = '请输入有效的11位手机号'
  } else {
    errors.phone = ''
  }
}

// 处理表单提交
const handleSubmit = async () => {
  // 验证所有字段
  validateBookCode()
  validatePhone()
  
  if (!isFormValid.value) return
  
  try {
    isSubmitting.value = true
    await borrowBook(bookInfo.value.id, phone.value)
    borrowSuccess.value = true
    showMessage('借阅成功', 'success')
  } catch (error) {
    showMessage('借阅失败: ' + (error.response?.data?.message || '未知错误'), 'error')
    console.error('Failed to borrow book:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 显示消息提示
const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 监听路由参数，自动填充图书编码
import { useRoute } from 'vue-router'
const route = useRoute()

watch(() => route.query.code, (newCode) => {
  if (newCode && !bookCode.value) {
    bookCode.value = newCode
    validateBookCode()
    checkBookCode()
  }
}, { immediate: true })
</script>

<style scoped>
.borrow-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #111;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.borrow-form-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 32px;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 16px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.code-checking {
  margin-top: 8px;
  font-size: 14px;
  color: #6c757d;
  display: flex;
  align-items: center;
}

.book-info-preview {
  margin-top: 12px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.book-preview-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.book-icon-small {
  color: #007bff;
}

.book-details-preview {
  flex: 1;
}

.book-title-preview {
  font-weight: 500;
  color: #333;
  margin: 0 0 4px 0;
}

.book-author-preview {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.book-unavailable {
  font-size: 14px;
  color: #dc3545;
  font-weight: 500;
  padding: 4px 8px;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
}

.error-message {
  display: block;
  margin-top: 6px;
  color: #dc3545;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.action-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-button.primary {
  background-color: #007bff;
  color: white;
}

.action-button.primary:hover {
  background-color: #0056b3;
}

.action-button.secondary {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.action-button.secondary:hover {
  background-color: #e9ecef;
}

.action-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.success-message {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 40px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background-color: rgba(40, 167, 69, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: #28a745;
}

.success-message h3 {
  font-size: 24px;
  font-weight: 600;
  color: #111;
  margin: 0 0 12px 0;
}

.success-message p {
  font-size: 16px;
  color: #666;
  margin: 0 0 8px 0;
}

.reminder {
  font-size: 14px !important;
  color: #888 !important;
  margin-bottom: 32px !important;
}

.success-actions {
  margin-top: 16px;
}

/* 消息提示样式 */
.message-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.message-toast.success {
  background-color: #28a745;
}

.message-toast.error {
  background-color: #dc3545;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .borrow-container {
    padding: 24px 16px;
  }
  
  .page-header h1 {
    font-size: 28px;
  }
  
  .borrow-form-card {
    padding: 24px 16px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .action-button {
    width: 100%;
  }
}
</style>