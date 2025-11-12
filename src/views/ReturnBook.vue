<template>
  <!-- 图书归还页面容器 -->
  <div class="return-container">
    <div class="page-header">
      <h1>归还图书</h1>
      <p class="subtitle">请输入借阅时的手机号，查看并归还您的借阅图书</p>
    </div>
    
    <div v-if="!showRecords" class="search-card">
      <div class="search-form">
        <div class="form-group">
          <label for="phone">手机号</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="phone"
            placeholder="请输入借阅时的手机号"
            maxlength="11"
            :disabled="isSearching"
            @input="validatePhone"
            @keyup.enter="searchRecords"
          >
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>
        <button 
          class="search-button"
          :disabled="!phone || errors.phone || isSearching"
          @click="searchRecords"
        >
          <span v-if="isSearching">搜索中...</span>
          <span v-else>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            查询借阅记录
          </span>
        </button>
      </div>
    </div>
    
    <div v-else class="records-section">
      <div class="records-header">
        <h2>借阅记录 - {{ phone }}</h2>
        <button class="back-button" @click="resetSearch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          返回重新查询
        </button>
      </div>
      
      <div v-if="isLoadingRecords" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="borrowRecords.length === 0" class="no-records">
        <div class="no-records-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 17H5C3.89543 17 3 16.1046 3 15V4C3 2.89543 3.89543 2 5 2H14C15.1046 2 16 2.89543 16 4V15C16 16.1046 15.1046 17 14 17H10M16 17V19C16 20.1046 15.1046 21 14 21H10C8.89543 21 8 20.1046 8 19V17M9 17V13C9 11.8954 9.89543 11 11 11H13C14.1046 11 15 11.8954 15 13V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="no-records-content">
          <h3>暂无借阅记录</h3>
          <p>未找到该手机号的借阅记录或所有图书已归还</p>
        </div>
      </div>
      
      <div v-else class="records-container">
        <div class="records-table-wrapper">
          <table class="records-table">
            <thead>
              <tr>
                <th>图书编码</th>
                <th>图书名称</th>
                <th>借阅时间</th>
                <th>预计归还时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in borrowRecords" :key="record.id">
                <td>{{ record.book.code }}</td>
                <td class="book-title">{{ record.book.title }}</td>
                <td>{{ formatDate(record.borrowDate) }}</td>
                <td>{{ formatDate(calculateDueDate(record.borrowDate)) }}</td>
                <td :class="'status-' + (record.returnDate ? 'returned' : 'borrowed')">
                  {{ record.returnDate ? '已归还' : '借阅中' }}
                </td>
                <td>
                  <button 
                    v-if="!record.returnDate" 
                    class="return-button"
                    :disabled="isReturning === record.id"
                    @click="handleReturnBook(record)"
                  >
                    <span v-if="isReturning === record.id">处理中...</span>
                    <span v-else>归还图书</span>
                  </button>
                  <span v-else class="returned-text">已归还</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="records-summary">
          共 {{ borrowRecords.length }} 条记录，其中 {{ activeBorrowCount }} 条借阅中，{{ returnedCount }} 条已归还
        </div>
      </div>
    </div>
    
    <!-- 归还确认对话框 -->
    <div v-if="showConfirmDialog" class="dialog-overlay" @click.self="cancelReturn">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>确认归还图书</h3>
          <button class="close-button" @click="cancelReturn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <p>您确定要归还图书《{{ selectedRecord?.book?.title }}》吗？</p>
        </div>
        <div class="dialog-footer">
          <button class="dialog-button secondary" @click="cancelReturn">取消</button>
          <button class="dialog-button primary" @click="confirmReturn" :disabled="isReturning">确认归还</button>
        </div>
      </div>
    </div>
    
    <!-- 归还成功提示 -->
    <div v-if="showSuccessDialog" class="dialog-overlay" @click.self="closeSuccessDialog">
      <div class="dialog-content success-dialog">
        <div class="success-icon-large">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>归还成功！</h3>
        <p>感谢您及时归还图书《{{ returnedBookTitle }}》</p>
        <button class="dialog-button primary large" @click="closeSuccessDialog">确定</button>
      </div>
    </div>
    
    <!-- 消息提示 -->
    <div v-if="message" class="message-toast" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { getBorrowRecords, returnBook as returnBookApi } from '../services/api'

// 数据状态
const phone = ref('')
const errors = reactive({ phone: '' })
const isSearching = ref(false)
const showRecords = ref(false)
const borrowRecords = ref([])
const isLoadingRecords = ref(false)
const showConfirmDialog = ref(false)
const showSuccessDialog = ref(false)
const selectedRecord = ref(null)
const isReturning = ref(null)
const returnedBookTitle = ref('')
const message = ref('')
const messageType = ref('success')

// 计算属性
const activeBorrowCount = computed(() => {
  return borrowRecords.value.filter(record => !record.returnDate).length
})

const returnedCount = computed(() => {
  return borrowRecords.value.filter(record => !!record.returnDate).length
})

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

// 搜索借阅记录
const searchRecords = async () => {
  validatePhone()
  if (errors.phone || !phone.value) return
  
  try {
    isSearching.value = true
    const records = await getBorrowRecords(phone.value)
    borrowRecords.value = records
    showRecords.value = true
  } catch (error) {
    showMessage('查询失败: ' + (error.response?.data?.message || '未知错误'), 'error')
    console.error('Failed to search records:', error)
  } finally {
    isSearching.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  showRecords.value = false
  borrowRecords.value = []
  phone.value = ''
  errors.phone = ''
}

// 归还图书
const handleReturnBook = (record) => {
  selectedRecord.value = record
  showConfirmDialog.value = true
}

// 取消归还
const cancelReturn = () => {
  showConfirmDialog.value = false
  selectedRecord.value = null
}

// 确认归还
const confirmReturn = async () => {
  if (!selectedRecord.value) return
  
  try {
    isReturning.value = selectedRecord.value.id
    await returnBookApi(selectedRecord.value.id)
    returnedBookTitle.value = selectedRecord.value.book.title
    showConfirmDialog.value = false
    showSuccessDialog.value = true
    
    // 更新本地记录状态
    const recordIndex = borrowRecords.value.findIndex(r => r.id === selectedRecord.value.id)
    if (recordIndex !== -1) {
      borrowRecords.value[recordIndex].returnDate = new Date().toISOString()
    }
    
    selectedRecord.value = null
  } catch (error) {
    showMessage('归还失败: ' + (error.response?.data?.message || '未知错误'), 'error')
    console.error('Failed to return book:', error)
  } finally {
    isReturning.value = null
  }
}

// 关闭成功对话框
const closeSuccessDialog = () => {
  showSuccessDialog.value = false
  returnedBookTitle.value = ''
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

// 计算应归还日期（假设借阅期限为30天）
const calculateDueDate = (borrowDateString) => {
  if (!borrowDateString) return ''
  const borrowDate = new Date(borrowDateString)
  const dueDate = new Date(borrowDate)
  dueDate.setDate(dueDate.getDate() + 30)
  return dueDate
}

// 显示消息提示
const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}
</script>

<style scoped>
.return-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 120px);
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

.search-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
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

.error-message {
  display: block;
  margin-top: 6px;
  color: #dc3545;
  font-size: 14px;
}

.search-button {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.search-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.search-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.records-section {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 32px;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.records-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
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
.no-records {
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

.no-records-icon {
  color: #ced4da;
  margin-bottom: 24px;
}

.no-records-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  margin: 0 0 8px 0;
}

.no-records-content p {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

.records-container {
  margin-top: 24px;
}

.records-table-wrapper {
  overflow-x: auto;
  margin-bottom: 16px;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
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
  font-size: 14px;
}

.records-table td {
  color: #333;
  font-size: 14px;
}

.book-title {
  max-width: 250px;
  font-weight: 500;
}

.status-borrowed {
  color: #dc3545;
  font-weight: 500;
}

.status-returned {
  color: #28a745;
  font-weight: 500;
}

.return-button {
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.return-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.return-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.returned-text {
  font-size: 13px;
  color: #6c757d;
}

.records-summary {
  font-size: 14px;
  color: #6c757d;
  text-align: right;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
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

.dialog-body p {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
}

.dialog-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
}

.dialog-button.primary {
  background-color: #007bff;
  color: white;
}

.dialog-button.primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.dialog-button.secondary {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.dialog-button.secondary:hover {
  background-color: #e9ecef;
}

.dialog-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.dialog-button.large {
  padding: 12px 32px;
  font-size: 16px;
}

/* 成功对话框样式 */
.success-dialog {
  text-align: center;
  padding: 40px 24px;
}

.success-icon-large {
  width: 80px;
  height: 80px;
  background-color: rgba(40, 167, 69, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
  color: #28a745;
}

.success-dialog h3 {
  font-size: 24px;
  font-weight: 600;
  color: #111;
  margin: 0 0 12px 0;
}

.success-dialog p {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
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
  .return-container {
    padding: 24px 16px;
  }
  
  .page-header h1 {
    font-size: 28px;
  }
  
  .search-card,
  .records-section {
    padding: 24px 16px;
  }
  
  .records-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .records-table {
    min-width: 600px;
  }
  
  .dialog-content {
    margin: 20px;
    max-width: none;
  }
}
</style>