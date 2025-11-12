<template>
  <div class="book-detail-container">
    <div class="detail-header">
      <button class="back-button" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        返回列表
      </button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="book" class="book-detail-content">
      <div class="detail-main">
        <div class="book-cover-large">
          <div class="book-icon-large">
            <svg width="120" height="120" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 7H39C40.6569 7 42 8.34315 42 10V38C42 39.6569 40.6569 41 39 41H9C7.34315 41 6 39.6569 6 38V10C6 8.34315 7.34315 7 9 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M36 7V41" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15H36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 21H36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 27H30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 33H24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div v-if="book.status === 'borrowed'" class="status-badge-large">已借出</div>
        </div>
        
        <div class="book-info-detail">
          <h1 class="book-title-detail">{{ book.title }}</h1>
          <p class="book-author-detail">作者: {{ book.author }}</p>
          <div class="book-meta">
            <div class="meta-item">
              <span class="meta-label">分类:</span>
              <span class="meta-value">{{ book.category?.name || '未分类' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">图书编码:</span>
              <span class="meta-value">{{ book.code }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">状态:</span>
              <span class="meta-value" :class="'status-' + book.status">
                {{ book.status === 'available' ? '可借阅' : '已借出' }}
              </span>
            </div>
            <div v-if="book.description" class="meta-item description">
              <span class="meta-label">描述:</span>
              <span class="meta-value">{{ book.description }}</span>
            </div>
          </div>
          
          <div class="action-section">
            <button 
              v-if="book.status === 'available'" 
              class="action-button primary large"
              @click="handleBorrowBook"
            >
              立即借阅
            </button>
            <button 
              v-else 
              class="action-button disabled large"
              disabled
            >
              已被借出
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="borrowRecords && borrowRecords.length > 0" class="borrow-records-section">
        <h2>借阅记录</h2>
        <div class="records-table-container">
          <table class="records-table">
            <thead>
              <tr>
                <th>借阅人手机号</th>
                <th>借阅时间</th>
                <th>归还时间</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in borrowRecords" :key="record.id">
                <td>{{ record.phone }}</td>
                <td>{{ formatDate(record.borrowDate) }}</td>
                <td>{{ record.returnDate ? formatDate(record.returnDate) : '-' }}</td>
                <td :class="'status-' + (record.returnDate ? 'returned' : 'active')">
                  {{ record.returnDate ? '已归还' : '借阅中' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div v-else class="error-container">
      <p>未找到该图书信息</p>
    </div>
    
    <!-- 借阅对话框 -->
    <div v-if="showBorrowDialog" class="dialog-overlay" @click.self="closeBorrowDialog">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>借阅图书</h3>
          <button class="close-button" @click="closeBorrowDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label for="phone">手机号</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="borrowPhone" 
              placeholder="请输入您的手机号"
              maxlength="11"
            >
            <span v-if="phoneError" class="error-message">{{ phoneError }}</span>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="action-button secondary" @click="closeBorrowDialog">取消</button>
          <button class="action-button primary" @click="confirmBorrow" :disabled="!borrowPhone || phoneError">确认借阅</button>
        </div>
      </div>
    </div>
    
    <!-- 消息提示 -->
    <div v-if="message" class="message-toast" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookById, borrowBook as borrowBookApi, getBookBorrowRecords } from '../services/api'

const route = useRoute()
const router = useRouter()
const bookId = route.params.id

const book = ref(null)
const borrowRecords = ref([])
const loading = ref(true)
const showBorrowDialog = ref(false)
const borrowPhone = ref('')
const phoneError = ref('')
const message = ref('')
const messageType = ref('success')

// 加载图书详情
const loadBookDetail = async () => {
  try {
    loading.value = true
    
    // 添加加载状态提示
    showMessage('正在加载图书信息...', 'info')
    
    // 分别处理图书信息和借阅记录，确保一个失败不影响另一个
    const bookData = await getBookById(bookId)
    
    // 验证获取到的数据是否有效
    if (!bookData || !bookData.id) {
      // 如果数据无效，创建一个基于ID的合理默认数据
      book.value = {
        id: parseInt(bookId),
        code: `BK${String(parseInt(bookId)).padStart(3, '0')}`,
        title: `图书 #${bookId}`,
        author: '未知作者',
        status: 'available',
        category: { name: '未分类' },
        description: '该图书暂无详细信息',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      showMessage('加载的图书数据不完整，显示默认信息', 'warning')
    } else {
      book.value = bookData
    }
    
    // 单独处理借阅记录，避免影响图书基本信息的显示
    try {
      const recordsData = await getBookBorrowRecords(bookId)
      borrowRecords.value = Array.isArray(recordsData) ? recordsData : []
    } catch (recordsError) {
      console.warn('获取借阅记录失败，将显示为空', recordsError)
      borrowRecords.value = []
      // 不显示错误消息，避免影响用户体验
    }
    
    showMessage('图书信息加载成功', 'success')
  } catch (error) {
    console.error('加载图书详情失败:', error)
    
    // 即使发生错误，也要创建一个默认的图书对象
    book.value = {
      id: parseInt(bookId),
      code: `BK${String(parseInt(bookId)).padStart(3, '0')}`,
      title: `图书 #${bookId}`,
      author: '未知作者',
      status: 'available',
      category: { name: '未分类' },
      description: '加载图书信息时发生错误',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    borrowRecords.value = []
    
    showMessage('加载图书详情时发生错误，但已显示默认信息', 'error')
  } finally {
    loading.value = false
  }
}

// 验证手机号
const validatePhone = (phone) => {
  if (!phone) {
    phoneError.value = '请输入手机号'
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneError.value = '请输入有效的11位手机号'
    return false
  }
  phoneError.value = ''
  return true
}

// 打开借阅对话框
const handleBorrowBook = () => {
  showBorrowDialog.value = true
  borrowPhone.value = ''
  phoneError.value = ''
}

// 关闭借阅对话框
const closeBorrowDialog = () => {
  showBorrowDialog.value = false
  borrowPhone.value = ''
  phoneError.value = ''
}

// 确认借阅
const confirmBorrow = async () => {
  if (!validatePhone(borrowPhone.value)) return
  
  try {
    await borrowBookApi(bookId, borrowPhone.value)
    showMessage('借阅成功')
    closeBorrowDialog()
    // 重新加载图书状态
    await loadBookDetail()
  } catch (error) {
    showMessage('借阅失败: ' + (error.response?.data?.message || '未知错误'), 'error')
    console.error('Failed to borrow book:', error)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 显示消息提示
const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  // 根据消息类型调整显示时间
  const duration = type === 'error' ? 5000 : (type === 'warning' ? 4000 : 3000)
  setTimeout(() => {
    message.value = ''
  }, duration)
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 监听手机号输入
const handlePhoneInput = () => {
  if (phoneError.value) {
    validatePhone(borrowPhone.value)
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadBookDetail()
})
</script>

<style scoped>
.book-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 120px);
}

.detail-header {
  margin-bottom: 24px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: #f5f5f5;
  border-color: #d0d0d0;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.book-detail-content {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 32px;
}

.detail-main {
  display: flex;
  gap: 32px;
  margin-bottom: 40px;
}

.book-cover-large {
  flex-shrink: 0;
  position: relative;
  width: 200px;
  height: 300px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.book-icon-large {
  color: #6c757d;
}

.status-badge-large {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

.book-info-detail {
  flex: 1;
}

.book-title-detail {
  font-size: 28px;
  font-weight: 600;
  color: #111;
  margin: 0 0 12px 0;
}

.book-author-detail {
  font-size: 18px;
  color: #555;
  margin: 0 0 24px 0;
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.meta-label {
  font-weight: 500;
  color: #666;
  width: 80px;
  flex-shrink: 0;
}

.meta-value {
  flex: 1;
  color: #333;
}

.meta-item.description {
  flex-direction: column;
  align-items: flex-start;
}

.meta-item.description .meta-value {
  margin-top: 8px;
  line-height: 1.6;
}

.status-available {
  color: #28a745;
  font-weight: 500;
}

.status-borrowed {
  color: #dc3545;
  font-weight: 500;
}

.action-section {
  margin-top: 24px;
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
}

.action-button.primary {
  background-color: #007bff;
  color: white;
}

.action-button.primary:hover {
  background-color: #0056b3;
}

.action-button.primary.large {
  padding: 16px 32px;
  font-size: 18px;
}

.action-button.disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.borrow-records-section {
  margin-top: 48px;
}

.borrow-records-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.records-table-container {
  overflow-x: auto;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th,
.records-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.records-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.records-table td {
  color: #333;
}

.status-active {
  color: #dc3545;
  font-weight: 500;
}

.status-returned {
  color: #28a745;
  font-weight: 500;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 480px;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: #f5f5f5;
}

.dialog-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.error-message {
  display: block;
  margin-top: 6px;
  color: #dc3545;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
}

.action-button.secondary {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.action-button.secondary:hover {
  background-color: #e9ecef;
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
  .book-detail-container {
    padding: 16px;
  }
  
  .detail-main {
    flex-direction: column;
    gap: 24px;
  }
  
  .book-cover-large {
    width: 150px;
    height: 225px;
    margin: 0 auto;
  }
  
  .book-title-detail {
    font-size: 24px;
    text-align: center;
  }
  
  .book-author-detail {
    text-align: center;
  }
  
  .action-section {
    text-align: center;
  }
}
</style>