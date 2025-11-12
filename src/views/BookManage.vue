<template>
  <div class="manage-container">
    <div class="page-header">
      <h1>图书管理</h1>
      <p class="subtitle">管理图书信息，包括添加、编辑和删除操作</p>
    </div>
    
    <div class="action-bar">
      <button class="add-button" @click="openAddDialog">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        添加图书
      </button>
    </div>
    
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜索图书名称、作者或编码"
        class="search-input"
        @input="handleSearch"
      >
      <select v-model="categoryFilter" class="category-select" @change="handleSearch">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </div>
    
    <div class="books-content">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <div v-else-if="books.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="empty-text">
          <h3>暂无图书数据</h3>
          <p>点击"添加图书"按钮开始添加图书信息</p>
        </div>
      </div>
      <div v-else class="books-table-wrapper">
        <table class="books-table">
          <thead>
            <tr>
              <th>图书编码</th>
              <th>图书名称</th>
              <th>作者</th>
              <th>分类</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in filteredBooks" :key="book.id">
              <td class="code-cell">{{ book.code }}</td>
              <td class="title-cell">{{ book.title }}</td>
              <td class="author-cell">{{ book.author }}</td>
              <td class="category-cell">{{ book.category?.name || '未分类' }}</td>
              <td class="status-cell">
                <span class="status-badge" :class="book.status">
                  {{ book.status === 'available' ? '可借阅' : '已借出' }}
                </span>
              </td>
              <td class="action-cell">
                <button class="edit-button" @click="openEditDialog(book)">编辑</button>
                <button 
                  class="delete-button" 
                  @click="openDeleteDialog(book)"
                  :disabled="book.status === 'borrowed'"
                >删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 添加/编辑图书对话框 -->
    <div v-if="showBookDialog" class="dialog-overlay" @click.self="closeBookDialog">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>{{ isEditMode ? '编辑图书' : '添加图书' }}</h3>
          <button class="close-button" @click="closeBookDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="saveBook">
            <div class="form-group">
              <label for="book-code">图书编码 *</label>
              <input 
                type="text" 
                id="book-code" 
                v-model="formData.code" 
                placeholder="请输入图书编码"
                :disabled="isSubmitting || (isEditMode && bookBeingEdited?.status === 'borrowed')"
              >
              <span v-if="errors.code" class="error-message">{{ errors.code }}</span>
            </div>
            <div class="form-group">
              <label for="book-title">图书名称 *</label>
              <input 
                type="text" 
                id="book-title" 
                v-model="formData.title" 
                placeholder="请输入图书名称"
                :disabled="isSubmitting || (isEditMode && bookBeingEdited?.status === 'borrowed')"
              >
              <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
            </div>
            <div class="form-group">
              <label for="book-author">作者 *</label>
              <input 
                type="text" 
                id="book-author" 
                v-model="formData.author" 
                placeholder="请输入作者姓名"
                :disabled="isSubmitting || (isEditMode && bookBeingEdited?.status === 'borrowed')"
              >
              <span v-if="errors.author" class="error-message">{{ errors.author }}</span>
            </div>
            <div class="form-group">
              <label for="book-category">分类 *</label>
              <select 
                id="book-category" 
                v-model="formData.categoryId" 
                :disabled="isSubmitting || (isEditMode && bookBeingEdited?.status === 'borrowed')"
              >
                <option value="" disabled>请选择分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <span v-if="errors.categoryId" class="error-message">{{ errors.categoryId }}</span>
            </div>
            <div class="form-group">
              <label for="book-description">描述（可选）</label>
              <textarea 
                id="book-description" 
                v-model="formData.description" 
                placeholder="请输入图书描述" 
                rows="3"
                :disabled="isSubmitting || (isEditMode && bookBeingEdited?.status === 'borrowed')"
              ></textarea>
            </div>
            <div class="dialog-footer">
              <button type="button" class="dialog-button secondary" @click="closeBookDialog" :disabled="isSubmitting">取消</button>
              <button type="submit" class="dialog-button primary" :disabled="isSubmitting || (isEditMode && bookBeingEdited?.status === 'borrowed')">
                <span v-if="isSubmitting">处理中...</span>
                <span v-else>{{ isEditMode ? '保存修改' : '添加图书' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click.self="closeDeleteDialog">
      <div class="dialog-content delete-dialog">
        <div class="dialog-header">
          <h3>确认删除</h3>
          <button class="close-button" @click="closeDeleteDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <p class="warning-text">您确定要删除图书《{{ bookToDelete?.title }}》吗？</p>
          <p class="delete-hint">此操作无法撤销，删除后数据将无法恢复。</p>
        </div>
        <div class="dialog-footer">
          <button class="dialog-button secondary" @click="closeDeleteDialog" :disabled="isDeleting">取消</button>
          <button class="dialog-button danger" @click="confirmDelete" :disabled="isDeleting">
            <span v-if="isDeleting">处理中...</span>
            <span v-else>确认删除</span>
          </button>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { getAllBooks, getCategories, addBook, updateBook, deleteBook } from '../services/api'

// 数据状态
const books = ref([])
const categories = ref([])
const loading = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('')
const showBookDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditMode = ref(false)
const bookBeingEdited = ref(null)
const bookToDelete = ref(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const message = ref('')
const messageType = ref('success')

// 表单数据
const formData = reactive({
  code: '',
  title: '',
  author: '',
  categoryId: '',
  description: ''
})

// 表单验证错误
const errors = reactive({
  code: '',
  title: '',
  author: '',
  categoryId: ''
})

// 计算过滤后的图书列表
const filteredBooks = computed(() => {
  return books.value.filter(book => {
    const matchesSearch = !searchQuery.value || 
      book.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      book.code.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesCategory = !categoryFilter.value || 
      book.category?.id.toString() === categoryFilter.value
    
    return matchesSearch && matchesCategory
  })
})

// 加载图书和分类数据
const loadData = async () => {
  try {
    loading.value = true
    const [booksData, categoriesData] = await Promise.all([
      getAllBooks(),
      getCategories()
    ])
    books.value = booksData
    categories.value = categoriesData
  } catch (error) {
    showMessage('加载数据失败: ' + (error.response?.data?.message || '未知错误'), 'error')
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
}

// 验证表单
const validateForm = () => {
  let isValid = true
  
  errors.code = ''
  errors.title = ''
  errors.author = ''
  errors.categoryId = ''
  
  if (!formData.code.trim()) {
    errors.code = '请输入图书编码'
    isValid = false
  }
  
  if (!formData.title.trim()) {
    errors.title = '请输入图书名称'
    isValid = false
  }
  
  if (!formData.author.trim()) {
    errors.author = '请输入作者姓名'
    isValid = false
  }
  
  if (!formData.categoryId) {
    errors.categoryId = '请选择分类'
    isValid = false
  }
  
  return isValid
}

// 打开添加对话框
const openAddDialog = () => {
  isEditMode.value = false
  bookBeingEdited.value = null
  resetForm()
  showBookDialog.value = true
}

// 打开编辑对话框
const openEditDialog = (book) => {
  isEditMode.value = true
  bookBeingEdited.value = book
  formData.code = book.code
  formData.title = book.title
  formData.author = book.author
  formData.categoryId = book.category?.id || ''
  formData.description = book.description || ''
  resetErrors()
  showBookDialog.value = true
}

// 关闭图书对话框
const closeBookDialog = () => {
  showBookDialog.value = false
  resetForm()
  resetErrors()
}

// 打开删除对话框
const openDeleteDialog = (book) => {
  bookToDelete.value = book
  showDeleteDialog.value = true
}

// 关闭删除对话框
const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  bookToDelete.value = null
}

// 保存图书（添加或编辑）
const saveBook = async () => {
  if (!validateForm()) return
  
  try {
    isSubmitting.value = true
    
    if (isEditMode.value && bookBeingEdited.value) {
      // 编辑模式
      await updateBook(bookBeingEdited.value.id, {
        code: formData.code,
        title: formData.title,
        author: formData.author,
        categoryId: formData.categoryId,
        description: formData.description
      })
      showMessage('图书信息更新成功')
      
      // 更新本地数据
      const index = books.value.findIndex(b => b.id === bookBeingEdited.value.id)
      if (index !== -1) {
        books.value[index] = {
          ...books.value[index],
          code: formData.code,
          title: formData.title,
          author: formData.author,
          category: categories.value.find(cat => cat.id === formData.categoryId),
          description: formData.description
        }
      }
    } else {
      // 添加模式
      const newBook = await addBook({
        code: formData.code,
        title: formData.title,
        author: formData.author,
        categoryId: formData.categoryId,
        description: formData.description
      })
      
      // 添加到本地列表
      books.value.push({
        ...newBook,
        category: categories.value.find(cat => cat.id === formData.categoryId)
      })
      showMessage('图书添加成功')
    }
    
    closeBookDialog()
  } catch (error) {
    showMessage((isEditMode.value ? '更新' : '添加') + '失败: ' + (error.response?.data?.message || '未知错误'), 'error')
    console.error((isEditMode.value ? 'Failed to update book:' : 'Failed to add book:'), error)
  } finally {
    isSubmitting.value = false
  }
}

// 确认删除
const confirmDelete = async () => {
  if (!bookToDelete.value) return
  
  try {
    isDeleting.value = true
    await deleteBook(bookToDelete.value.id)
    
    // 从本地列表中移除
    books.value = books.value.filter(book => book.id !== bookToDelete.value.id)
    
    showMessage('图书删除成功')
    closeDeleteDialog()
  } catch (error) {
    showMessage('删除失败: ' + (error.response?.data?.message || '未知错误'), 'error')
    console.error('Failed to delete book:', error)
  } finally {
    isDeleting.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑通过computed属性自动处理
}

// 重置表单
const resetForm = () => {
  formData.code = ''
  formData.title = ''
  formData.author = ''
  formData.categoryId = ''
  formData.description = ''
}

// 重置错误信息
const resetErrors = () => {
  errors.code = ''
  errors.title = ''
  errors.author = ''
  errors.categoryId = ''
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
  loadData()
})
</script>

<style scoped>
.manage-container {
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

.action-bar {
  margin-bottom: 20px;
  text-align: right;
}

.add-button {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.add-button:hover {
  background-color: #218838;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.category-select {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-width: 150px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.category-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.books-content {
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

.books-table-wrapper {
  overflow-x: auto;
}

.books-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.books-table th,
.books-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.books-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
  font-size: 14px;
  white-space: nowrap;
}

.books-table td {
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
  font-weight: 500;
}

.author-cell {
  max-width: 200px;
}

.category-cell {
  white-space: nowrap;
}

.status-cell .status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.available {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-badge.borrowed {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.action-cell {
  white-space: nowrap;
}

.edit-button,
.delete-button {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
  margin-right: 8px;
}

.edit-button {
  background-color: #17a2b8;
  color: white;
}

.edit-button:hover {
  background-color: #138496;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover:not(:disabled) {
  background-color: #c82333;
}

.delete-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
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
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
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
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  display: block;
  margin-top: 6px;
  color: #dc3545;
  font-size: 13px;
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
  font-size: 14px;
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

.dialog-button.danger {
  background-color: #dc3545;
  color: white;
}

.dialog-button.danger:hover:not(:disabled) {
  background-color: #c82333;
}

.dialog-button:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.warning-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin: 0 0 12px 0;
}

.delete-hint {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
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
  .manage-container {
    padding: 24px 16px;
  }
  
  .page-header h1 {
    font-size: 28px;
  }
  
  .action-buttons {
    justify-content: center;
    margin-top: 20px;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .search-input,
  .category-select {
    width: 100%;
    min-width: auto;
  }
  
  .books-content {
    padding: 20px 16px;
  }
  
  .action-cell {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .edit-button,
  .delete-button {
    margin-right: 0;
    width: 100%;
  }
  
  .dialog-content {
    margin: 20px;
    max-width: none;
  }
}
</style>