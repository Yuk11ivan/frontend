<template>
  <div class="records-container">
    <div class="page-header">
      <h1>借阅记录查询</h1>
      <p class="subtitle">查询图书的借阅历史和当前状态</p>
    </div>
    
    <div class="search-filters">
      <div class="filter-group">
        <label for="phone-filter">手机号查询</label>
        <input 
          type="tel" 
          id="phone-filter" 
          v-model="filters.phone" 
          placeholder="输入借阅人手机号"
          maxlength="11"
        >
      </div>
      <div class="filter-group">
        <label for="status-filter">状态筛选</label>
        <select id="status-filter" v-model="filters.status">
          <option value="">全部状态</option>
          <option value="active">借阅中</option>
          <option value="returned">已归还</option>
        </select>
      </div>
      <div class="action-buttons">
        <button class="search-button" @click="searchRecords">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.65 16.65M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          查询
        </button>
        <button class="reset-button" @click="resetFilters">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V7H4M23 20V17H20M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15M20.49 15a9 9 0 0 1-14.85 3.36L1 14M3.51 9a9 9 0 0 0 14.85 3.36M23 10l-4.64-4.36A9 9 0 0 1 3.51 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          重置
        </button>
      </div>
    </div>
    
    <div class="records-content">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <div v-else-if="records.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 17H5C3.89543 17 3 16.1046 3 15V4C3 2.89543 3.89543 2 5 2H14C15.1046 2 16 2.89543 16 4V15C16 16.1046 15.1046 17 14 17H10M16 17V19C16 20.1046 15.1046 21 14 21H10C8.89543 21 8 20.1046 8 19V17M9 17V13C9 11.8954 9.89543 11 11 11H13C14.1046 11 15 11.8954 15 13V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="empty-text">
          <h3>暂无记录</h3>
          <p>没有找到符合条件的借阅记录</p>
        </div>
      </div>
      <div v-else class="records-table-wrapper">
        <table class="records-table">
          <thead>
            <tr>
              <th>图书编码</th>
              <th>图书名称</th>
              <th>借阅人手机号</th>
              <th>借阅时间</th>
              <th>归还时间</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td class="code-cell">{{ record.book.code }}</td>
              <td class="title-cell">
                <router-link :to="`/book/${record.book.id}`" class="book-link">{{ record.book.title }}</router-link>
              </td>
              <td class="phone-cell">{{ record.phone }}</td>
              <td class="date-cell">{{ formatDate(record.borrowDate) }}</td>
              <td class="date-cell">{{ record.returnDate ? formatDate(record.returnDate) : '-' }}</td>
              <td>
                <span class="status-badge" :class="record.returnDate ? 'returned' : 'active'">
                  {{ record.returnDate ? '已归还' : '借阅中' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="pagination.total > pagination.pageSize" class="pagination">
          <button 
            class="page-button" 
            :disabled="pagination.currentPage === 1"
            @click="changePage(pagination.currentPage - 1)"
          >上一页</button>
          <div class="page-info">
            第 {{ pagination.currentPage }} 页，共 {{ Math.ceil(pagination.total / pagination.pageSize) }} 页，总计 {{ pagination.total }} 条
          </div>
          <button 
            class="page-button" 
            :disabled="pagination.currentPage >= Math.ceil(pagination.total / pagination.pageSize)"
            @click="changePage(pagination.currentPage + 1)"
          >下一页</button>
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
import { ref, reactive, onMounted } from 'vue'
import { getBorrowRecords } from '../services/api'

// 搜索过滤条件
const filters = reactive({
  phone: '',
  status: ''
})

// 数据状态
const records = ref([])
const loading = ref(false)
const message = ref('')
const messageType = ref('success')

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 加载记录
const loadRecords = async (page = 1, refresh = false) => {
  if (!refresh) {
    loading.value = true
  }
  
  try {
    const params = {
      phone: filters.phone || undefined,
      status: filters.status || undefined,
      page,
      pageSize: pagination.pageSize
    }
    
    const response = await getBorrowRecords(params)
    // 假设后端返回格式包含data和total字段
    records.value = response.data || response
    pagination.total = response.total || records.value.length
    pagination.currentPage = page
  } catch (error) {
    showMessage('加载记录失败: ' + (error.response?.data?.message || '未知错误'), 'error')
    console.error('Failed to load records:', error)
  } finally {
    loading.value = false
  }
}

// 搜索记录
const searchRecords = () => {
  pagination.currentPage = 1
  loadRecords(1)
}

// 重置过滤条件
const resetFilters = () => {
  filters.phone = ''
  filters.status = ''
  pagination.currentPage = 1
  loadRecords(1)
}

// 切换页面
const changePage = (page) => {
  if (page >= 1 && page <= Math.ceil(pagination.total / pagination.pageSize)) {
    loadRecords(page)
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
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 页面挂载时加载数据
onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.records-container {
  max-width: 1400px;
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

.search-filters {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-button,
.reset-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.search-button {
  background-color: #007bff;
  color: white;
}

.search-button:hover {
  background-color: #0056b3;
}

.reset-button {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.reset-button:hover {
  background-color: #e9ecef;
}

.records-content {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  min-height: 400px;
}

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
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

.empty-icon {
  color: #ced4da;
  margin-bottom: 24px;
}

.empty-text h3 {
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  margin: 0 0 8px 0;
}

.empty-text p {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

.records-table-wrapper {
  overflow-x: auto;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
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
  white-space: nowrap;
}

.records-table td {
  color: #333;
  font-size: 14px;
}

.code-cell {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 500;
  color: #007bff;
  white-space: nowrap;
}

.title-cell {
  max-width: 300px;
}

.book-link {
  color: #007bff;
  text-decoration: none;
  transition: color 0.2s ease;
  display: inline-block;
}

.book-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.phone-cell {
  white-space: nowrap;
}

.date-cell {
  white-space: nowrap;
  color: #666;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.status-badge.returned {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.page-button {
  padding: 8px 16px;
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-button:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.page-button:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.page-info {
  font-size: 14px;
  color: #6c757d;
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
  .records-container {
    padding: 24px 16px;
  }
  
  .page-header h1 {
    font-size: 28px;
  }
  
  .search-filters {
    flex-direction: column;
    align-items: stretch;
    padding: 20px 16px;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .action-buttons {
    justify-content: stretch;
  }
  
  .search-button,
  .reset-button {
    flex: 1;
    justify-content: center;
  }
  
  .records-content {
    padding: 20px 16px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  
  .page-info {
    order: -1;
    text-align: center;
  }
}
</style>