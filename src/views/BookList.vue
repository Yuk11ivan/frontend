<template>
  <div class="book-list-container">
    <div class="main-content">
      <!-- 左侧分类导航 -->
      <aside class="category-sidebar">
        <h3 class="sidebar-title">图书分类</h3>
        <ul class="category-list">
          <li
            class="category-item"
            :class="{ active: selectedCategory === null }"
            @click="selectCategory(null)"
          >
            全部图书
          </li>
          <!---- 分类列表将通过数据动态生成 ---->
          <li
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            :class="{ active: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </li>
        </ul>
        <div class="sidebar-actions">
          <router-link to="/manage" class="action-btn">
            图书管理
          </router-link>
          <router-link to="/return" class="action-btn return-btn">
            归还图书
          </router-link>
          <router-link to="/records" class="action-btn records-btn">
            借阅记录
          </router-link>
        </div>
      </aside>

      <!-- 右侧主内容区 -->
      <section class="content-area">
        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-bar">
            <input
              type="text"
              v-model="searchQuery"
              class="search-input"
              placeholder="搜索书名、作者或图书编码..."
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">
              搜索
            </button>
          </div>
          <div class="search-filters">
            <button
              class="filter-btn"
              :class="{ active: selectedStatus === null }"
              @click="selectStatus(null)"
            >
              全部状态
            </button>
            <button
              class="filter-btn available"
              :class="{ active: selectedStatus === 'available' }"
              @click="selectStatus('available')"
            >
              可借阅
            </button>
            <button
              class="filter-btn borrowed"
              :class="{ active: selectedStatus === 'borrowed' }"
              @click="selectStatus('borrowed')"
            >
              已借出
            </button>
          </div>
        </div>

        <!-- 小标题 -->
        <div class="section-title">
          <h2>探索知识海洋，享受阅读乐趣</h2>
        </div>

        <!-- 图书列表区域 -->
        <div class="books-section">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <span>加载中...</span>
          </div>
          <div v-else-if="books.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="empty-text">暂无符合条件的图书</p>
          </div>
          <div v-else class="books-grid">
            <!---- 图书卡片将通过数据动态生成 ---->
            <BookCard
              v-for="book in books"
              :key="book.id"
              :book="book"
              @click="navigateToDetail(book.id)"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from '../components/BookCard.vue'
import { getAllBooks, getCategories, searchBooks } from '../services/api'

const router = useRouter()

// 响应式数据
const categories = ref([
  { id: 1, name: '文学小说' },
  { id: 2, name: '历史传记' },
  { id: 3, name: '科学技术' },
  { id: 4, name: '经济管理' },
  { id: 5, name: '生活休闲' }
])

const books = ref([
  {
    id: 1,
    code: 'BK001',
    title: '活着',
    author: '余华',
    categoryId: 1,
    category: { name: '文学小说' },
    status: 'available'
  },
  {
    id: 2,
    code: 'BK002',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    categoryId: 1,
    category: { name: '文学小说' },
    status: 'available'
  },
  {
    id: 3,
    code: 'BK003',
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    categoryId: 3,
    category: { name: '科学技术' },
    status: 'borrowed'
  },
  {
    id: 4,
    code: 'BK004',
    title: '围城',
    author: '钱钟书',
    categoryId: 1,
    category: { name: '文学小说' },
    status: 'available'
  },
  {
    id: 5,
    code: 'BK005',
    title: '原则',
    author: '雷·达里奥',
    categoryId: 4,
    category: { name: '经济管理' },
    status: 'available'
  },
  {
    id: 6,
    code: 'BK006',
    title: '三体',
    author: '刘慈欣',
    categoryId: 3,
    category: { name: '科学技术' },
    status: 'available'
  },
  {
    id: 7,
    code: 'BK007',
    title: '平凡的世界',
    author: '路遥',
    categoryId: 1,
    category: { name: '文学小说' },
    status: 'available'
  },
  {
    id: 8,
    code: 'BK008',
    title: '明朝那些事儿',
    author: '当年明月',
    categoryId: 2,
    category: { name: '历史传记' },
    status: 'borrowed'
  },
  {
    id: 9,
    code: 'BK009',
    title: '被讨厌的勇气',
    author: '岸见一郎',
    categoryId: 5,
    category: { name: '生活休闲' },
    status: 'available'
  },
  {
    id: 10,
    code: 'BK010',
    title: '解忧杂货店',
    author: '东野圭吾',
    categoryId: 1,
    category: { name: '文学小说' },
    status: 'available'
  },
  {
    id: 11,
    code: 'BK011',
    title: '未来简史',
    author: '尤瓦尔·赫拉利',
    categoryId: 3,
    category: { name: '科学技术' },
    status: 'available'
  },
  {
    id: 12,
    code: 'BK012',
    title: '巴菲特致股东的信',
    author: '沃伦·巴菲特',
    categoryId: 4,
    category: { name: '经济管理' },
    status: 'borrowed'
  },
  {
    id: 13,
    code: 'BK013',
    title: '鲁迅全集',
    author: '鲁迅',
    categoryId: 1,
    category: { name: '文学小说' },
    status: 'available'
  },
  {
    id: 14,
    code: 'BK014',
    title: '中国近代史',
    author: '徐中约',
    categoryId: 2,
    category: { name: '历史传记' },
    status: 'available'
  },
  {
    id: 15,
    code: 'BK015',
    title: '高效能人士的七个习惯',
    author: '史蒂芬·柯维',
    categoryId: 4,
    category: { name: '经济管理' },
    status: 'available'
  },
  {
    id: 16,
    code: 'BK016',
    title: '围城',
    author: '钱钟书',
    categoryId: 1,
    category: { name: '文学小说' },
    status: 'available'
  },
  {
    id: 17,
    code: 'BK017',
    title: '孙子兵法',
    author: '孙武',
    categoryId: 4,
    category: { name: '经济管理' },
    status: 'borrowed'
  },
  {
    id: 18,
    code: 'BK018',
    title: '活着本来单纯',
    author: '丰子恺',
    categoryId: 5,
    category: { name: '生活休闲' },
    status: 'available'
  },
  {
    id: 19,
    code: 'BK019',
    title: '时间简史',
    author: '史蒂芬·霍金',
    categoryId: 3,
    category: { name: '科学技术' },
    status: 'available'
  },
  {
    id: 20,
    code: 'BK020',
    title: '红楼梦',
    author: '曹雪芹',
    categoryId: 1,
    category: { name: '文学小说' },
    status: 'available'
  }
])

const searchQuery = ref('')
const selectedCategory = ref(null)
const selectedStatus = ref(null)
const loading = ref(false)

// 方法
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  filterBooks()
}

const selectStatus = (status) => {
  selectedStatus.value = status
  filterBooks()
}

const handleSearch = async () => {
  try {
    loading.value = true
    // 在模拟环境中，我们使用本地过滤而不是API调用
    filterBooks()
  } catch (error) {
    console.error('搜索图书失败:', error)
    // 这里应该添加错误提示，但原始代码中没有showMessage函数，暂时保留console.error
    console.error('搜索失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理分类切换
const handleCategoryChange = (categoryId) => {
  selectedCategory.value = categoryId
  filterBooks()
}

// 过滤图书
const filterBooks = () => {
  loading.value = true
  
  // 使用setTimeout模拟异步操作
  setTimeout(() => {
    // 始终基于原始完整的图书数据进行过滤
    // 确保我们有原始数据的副本
    if (!window.originalBooks) {
      // 如果还没有原始数据缓存，使用初始的books数据创建一个
      window.originalBooks = JSON.parse(JSON.stringify(books.value))
    }
    
    // 从原始数据开始过滤，而不是当前显示的数据
    let filtered = JSON.parse(JSON.stringify(window.originalBooks))
    
    // 按分类过滤
    if (selectedCategory.value !== null) {
      filtered = filtered.filter(book => book.categoryId === selectedCategory.value)
    }
    
    // 按状态过滤
    if (selectedStatus.value !== null) {
      filtered = filtered.filter(book => book.status === selectedStatus.value)
    }
    
    // 按搜索词过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.code.toLowerCase().includes(query)
      )
    }
    
    // 直接更新显示的图书列表
    books.value = filtered
    
    loading.value = false
  }, 300)
}

const navigateToDetail = (bookId) => {
  router.push(`/book/${bookId}`)
}

// 组件挂载时执行
onMounted(() => {
  console.log('图书列表页面已加载')
  // 这里将来会从API获取真实数据
})
</script>

<style scoped>
.book-list-container {
  width: 100%;
  min-height: 100%;
}

.main-content {
  display: flex;
  gap: 2rem;
  width: 100%;
}

/* 分类侧边栏 */
.category-sidebar {
  width: 240px;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  height: fit-content;
  position: sticky;
  top: 80px;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1d1d1f;
}

.category-list {
  list-style: none;
  margin-bottom: 2rem;
}

.category-item {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #3a3a3c;
  font-size: 0.95rem;
}

.category-item:hover {
  background-color: #f5f5f7;
  color: #0071e3;
}

.category-item.active {
  background-color: #0071e3;
  color: #ffffff;
  font-weight: 500;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background-color: #f5f5f7;
  color: #1d1d1f;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  text-decoration: none;
}

.action-btn:hover {
  background-color: #e5e5ea;
}

.return-btn {
  background-color: #ff9500;
  color: #ffffff;
}

.return-btn:hover {
  background-color: #ff8500;
}

.records-btn {
  background-color: #5856d6;
  color: #ffffff;
}

.records-btn:hover {
  background-color: #4e4cb7;
}

/* 内容区域 */
.content-area {
  flex: 1;
}

/* 搜索区域 */
.search-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d1d6;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #0071e3;
  box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.2);
}

.search-btn {
  padding: 0.875rem 1.5rem;
  background-color: #0071e3;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-btn:hover {
  background-color: #0063cc;
}

.search-filters {
  display: flex;
  gap: 0.75rem;
}

/* 区域标题 */
.section-title {
  margin: 1.5rem 0;
  text-align: center;
}

.section-title h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333333;
  margin: 0;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background-color: #f5f5f7;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #3a3a3c;
}

.filter-btn:hover {
  background-color: #e5e5ea;
}

.filter-btn.active {
  background-color: #0071e3;
  color: #ffffff;
}

.filter-btn.available.active {
  background-color: #34c759;
}

.filter-btn.borrowed.active {
  background-color: #ff9500;
}

/* 图书列表区域 */
.books-section {
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: #86868b;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f5f5f7;
  border-top: 3px solid #0071e3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.empty-image {
  width: 120px;
  height: 120px;
  opacity: 0.5;
}

.empty-text {
  color: #86868b;
  font-size: 1rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }
  
  .category-sidebar {
    width: 100%;
    position: static;
  }
  
  .category-list {
    display: flex;
    overflow-x: auto;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .category-item {
    white-space: nowrap;
    margin-bottom: 0;
  }
  
  .sidebar-actions {
    flex-direction: row;
  }
  
  .action-btn {
    flex: 1;
  }
  
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }
  
  .search-filters {
    flex-wrap: wrap;
  }
  
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>