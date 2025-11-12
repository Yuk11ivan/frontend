import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',  // 代理到后端的基础URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

// 模拟数据 - 在API不可用时使用
const mockCategories = [
  { id: 1, name: '文学小说', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: '历史传记', createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: '科学技术', createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: '哲学宗教', createdAt: new Date(), updatedAt: new Date() },
  { id: 5, name: '艺术设计', createdAt: new Date(), updatedAt: new Date() }
]

const mockBooks = [
  { 
    id: 1, 
    code: 'BK001', 
    title: '活着', 
    author: '余华', 
    status: 'available',
    category: { name: '文学小说' },
    description: '讲述了一个人和他命运之间的友情，展现了人生的苦难与坚韧',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 2, 
    code: 'BK002', 
    title: '百年孤独', 
    author: '加西亚·马尔克斯', 
    status: 'available',
    category: { name: '文学小说' },
    description: '魔幻现实主义文学的代表作，讲述了布恩迪亚家族七代人的传奇故事',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 3, 
    code: 'BK003', 
    title: '人类简史', 
    author: '尤瓦尔·赫拉利', 
    status: 'borrowed',
    category: { name: '科学技术' },
    description: '从智人到智神的演化历程，重新审视人类历史的宏大叙事',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 4, 
    code: 'BK004', 
    title: '围城', 
    author: '钱钟书', 
    status: 'available',
    category: { name: '文学小说' },
    description: '现代文学史上的经典讽刺小说，描绘了知识分子的精神困境',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 5, 
    code: 'BK005', 
    title: '原则', 
    author: '雷·达里奥', 
    status: 'available',
    category: { name: '经济管理' },
    description: '华尔街投资大神的人生经验与工作原则',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 6, 
    code: 'BK006', 
    title: '三体', 
    author: '刘慈欣', 
    status: 'available',
    category: { name: '科学技术' },
    description: '中国科幻文学的里程碑作品，展现了宏大的宇宙图景',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 7, 
    code: 'BK007', 
    title: '平凡的世界', 
    author: '路遥', 
    status: 'available',
    category: { name: '文学小说' },
    description: '中国当代现实主义文学的经典之作，描绘普通人的奋斗历程',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 8, 
    code: 'BK008', 
    title: '明朝那些事儿', 
    author: '当年明月', 
    status: 'borrowed',
    category: { name: '历史传记' },
    description: '以通俗幽默的方式讲述明朝历史',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 9, 
    code: 'BK009', 
    title: '被讨厌的勇气', 
    author: '岸见一郎', 
    status: 'available',
    category: { name: '生活休闲' },
    description: '阿德勒心理学的通俗解读，教你如何获得真正的自由',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 10, 
    code: 'BK010', 
    title: '解忧杂货店', 
    author: '东野圭吾', 
    status: 'available',
    category: { name: '文学小说' },
    description: '穿越时空的奇幻温情故事，探讨人生选择的意义',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 11, 
    code: 'BK011', 
    title: '未来简史', 
    author: '尤瓦尔·赫拉利', 
    status: 'available',
    category: { name: '科学技术' },
    description: '探讨人类未来发展趋势，思考科技与人类的关系',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 12, 
    code: 'BK012', 
    title: '巴菲特致股东的信', 
    author: '沃伦·巴菲特', 
    status: 'borrowed',
    category: { name: '经济管理' },
    description: '价值投资的经典之作，巴菲特投资思想的精华',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 13, 
    code: 'BK013', 
    title: '鲁迅全集', 
    author: '鲁迅', 
    status: 'available',
    category: { name: '文学小说' },
    description: '中国现代文学的奠基之作，批判封建思想，呼唤社会变革',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 14, 
    code: 'BK014', 
    title: '中国近代史', 
    author: '徐中约', 
    status: 'available',
    category: { name: '历史传记' },
    description: '全面客观地讲述中国近代历史的发展历程',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 15, 
    code: 'BK015', 
    title: '高效能人士的七个习惯', 
    author: '史蒂芬·柯维', 
    status: 'available',
    category: { name: '经济管理' },
    description: '个人成长与管理的经典之作，培养高效能人士的思维方式',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 16, 
    code: 'BK016', 
    title: '围城', 
    author: '钱钟书', 
    status: 'available',
    category: { name: '文学小说' },
    description: '现代文学史上的经典讽刺小说，描绘了知识分子的精神困境',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 17, 
    code: 'BK017', 
    title: '孙子兵法', 
    author: '孙武', 
    status: 'borrowed',
    category: { name: '经济管理' },
    description: '中国古代兵学经典，蕴含深刻的战略思想和管理智慧',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 18, 
    code: 'BK018', 
    title: '活着本来单纯', 
    author: '丰子恺', 
    status: 'available',
    category: { name: '生活休闲' },
    description: '感悟生活的随笔集，传递简单纯真的生活态度',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 19, 
    code: 'BK019', 
    title: '时间简史', 
    author: '史蒂芬·霍金', 
    status: 'available',
    category: { name: '科学技术' },
    description: '通俗易懂地介绍相对论、量子力学等现代物理学理论',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 20, 
    code: 'BK020', 
    title: '红楼梦', 
    author: '曹雪芹', 
    status: 'available',
    category: { name: '文学小说' },
    description: '中国古典文学四大名著之一，描绘了贾、史、王、薛四大家族的兴衰史',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockBorrowRecords = [
  {
    id: 1,
    bookId: 3,
    bookTitle: '三体',
    borrowerName: '张三',
    borrowerPhone: '13800138001',
    borrowDate: new Date('2023-10-15'),
    dueDate: new Date('2023-11-14'),
    returnDate: null,
    status: 'active'
  },
  {
    id: 2,
    bookId: 1,
    bookTitle: '百年孤独',
    borrowerName: '李四',
    borrowerPhone: '13800138002',
    borrowDate: new Date('2023-10-01'),
    dueDate: new Date('2023-10-31'),
    returnDate: new Date('2023-10-25'),
    status: 'returned'
  }
]

// 辅助函数：检查API是否可用
const isApiAvailable = async () => {
  try {
    await api.get('/health', { timeout: 2000 })
    return true
  } catch (error) {
    console.warn('API不可用，使用模拟数据')
    return false
  }
}

// API方法封装 - 增加错误处理和回退到模拟数据

// 分类相关
export const getCategories = async () => {
  try {
    const available = await isApiAvailable()
    if (available) {
      return await api.get('/categories')
    }
    return mockCategories
  } catch (error) {
    console.error('获取分类失败，使用模拟数据', error)
    return mockCategories
  }
}

// 根据图书ID获取借阅记录
export const getBookBorrowRecords = async (bookId) => {
  try {
    // 确保bookId是数字类型
    const numericBookId = parseInt(bookId, 10)
    
    // 尝试从API获取数据
    const response = await api.get(`/books/${numericBookId}/borrow-records`)
    // 确保返回数据是数组类型
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('获取图书借阅记录失败:', error)
    // 确保bookId是数字类型用于过滤
    const numericBookId = parseInt(bookId, 10)
    // 返回匹配的模拟数据，如果没有匹配项，返回空数组
    const filteredRecords = mockBorrowRecords.filter(record => record.bookId === numericBookId)
    return filteredRecords
  }
}

// 根据图书编码获取图书信息
export const getBookByCode = async (code) => {
  try {
    const response = await api.get(`/books/code/${code}`)
    return response.data
  } catch (error) {
    console.error('根据编码获取图书失败:', error)
    // 在模拟数据中查找
    const book = mockBooks.find(b => b.code === code)
    return book || null
  }
}

export const addCategory = async (category) => {
  try {
    return await api.post('/categories', category)
  } catch (error) {
    console.error('添加分类失败', error)
    throw error
  }
}

export const updateCategory = async (id, category) => {
  try {
    return await api.put(`/categories/${id}`, category)
  } catch (error) {
    console.error('更新分类失败', error)
    throw error
  }
}

export const deleteCategory = async (id) => {
  try {
    return await api.delete(`/categories/${id}`)
  } catch (error) {
    console.error('删除分类失败', error)
    throw error
  }
}

// 图书相关
export const getAllBooks = async () => {
  try {
    const available = await isApiAvailable()
    if (available) {
      return await api.get('/books')
    }
    return mockBooks
  } catch (error) {
    console.error('获取图书列表失败，使用模拟数据', error)
    return mockBooks
  }
}

export const getBookById = async (id) => {
  try {
    const available = await isApiAvailable()
    if (available) {
      return await api.get(`/books/${id}`)
    }
    
    // 尝试从全局变量中获取图书数据（如果存在）
    if (window && window.originalBooks && Array.isArray(window.originalBooks)) {
      const book = window.originalBooks.find(b => b.id === parseInt(id))
      if (book) {
        return book
      }
    }
    
    // 如果全局变量中没有，则在mockBooks中查找
    const book = mockBooks.find(b => b.id === parseInt(id))
    if (!book) {
      // 返回一个模拟的图书对象，避免页面加载失败
      return {
        id: parseInt(id),
        code: `BK${String(parseInt(id)).padStart(3, '0')}`,
        title: `图书 #${id}`,
        author: '未知作者',
        status: 'available',
        category: { name: '未分类' },
        description: '该图书暂无详细信息',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
    return book
  } catch (error) {
    console.error('获取图书详情失败', error)
    // 发生错误时，返回一个默认的图书对象
    return {
      id: parseInt(id),
      code: `BK${String(parseInt(id)).padStart(3, '0')}`,
      title: `图书 #${id}`,
      author: '未知作者',
      status: 'available',
      category: { name: '未分类' },
      description: '加载图书信息时发生错误',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

export const searchBooks = async (query) => {
  try {
    const available = await isApiAvailable()
    if (available) {
      return await api.get('/books/search', { params: { q: query } })
    }
    // 模拟搜索逻辑
    return mockBooks.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.code.toLowerCase().includes(query.toLowerCase())
    )
  } catch (error) {
    console.error('搜索图书失败', error)
    throw error
  }
}

export const addBook = async (book) => {
  try {
    const newBook = await api.post('/books', book)
    return newBook
  } catch (error) {
    console.error('添加图书失败', error)
    // 模拟添加成功，返回带有id的新图书
    const newBook = {
      ...book,
      id: mockBooks.length + 1,
      status: 'available',
      category: mockCategories.find(cat => cat.id === parseInt(book.categoryId)),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    mockBooks.push(newBook)
    return newBook
  }
}

export const updateBook = async (id, bookData) => {
  try {
    const updatedBook = await api.put(`/books/${id}`, bookData)
    return updatedBook
  } catch (error) {
    console.error('更新图书失败', error)
    // 模拟更新图书
    const index = mockBooks.findIndex(b => b.id === parseInt(id))
    if (index !== -1) {
      mockBooks[index] = {
        ...mockBooks[index],
        ...bookData,
        category: mockCategories.find(cat => cat.id === parseInt(bookData.categoryId)),
        updatedAt: new Date()
      }
      return mockBooks[index]
    }
    throw new Error('图书不存在')
  }
}

export const deleteBook = async (id) => {
  try {
    return await api.delete(`/books/${id}`)
  } catch (error) {
    console.error('删除图书失败', error)
    // 模拟删除图书
    const index = mockBooks.findIndex(b => b.id === parseInt(id))
    if (index !== -1) {
      mockBooks.splice(index, 1)
      return { success: true }
    }
    throw new Error('图书不存在')
  }
}

// 借阅相关
export const borrowBook = async (bookId, borrowerInfo) => {
  try {
    return await api.post(`/borrow/${bookId}`, borrowerInfo)
  } catch (error) {
    console.error('借阅图书失败', error)
    // 模拟借阅成功
    const book = mockBooks.find(b => b.id === parseInt(bookId))
    if (book) {
      book.status = 'borrowed'
      
      const borrowRecord = {
        id: mockBorrowRecords.length + 1,
        bookId: parseInt(bookId),
        bookTitle: book.title,
        borrowerName: borrowerInfo.name,
        borrowerPhone: borrowerInfo.phone,
        borrowDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        returnDate: null,
        status: 'active'
      }
      
      mockBorrowRecords.push(borrowRecord)
      return borrowRecord
    }
    throw new Error('图书不存在')
  }
}

export const returnBook = async (bookId) => {
  try {
    return await api.put(`/return/${bookId}`)
  } catch (error) {
    console.error('归还图书失败', error)
    // 模拟归还成功
    const book = mockBooks.find(b => b.id === parseInt(bookId))
    if (book) {
      book.status = 'available'
      
      const record = mockBorrowRecords.find(r => r.bookId === parseInt(bookId) && !r.returnDate)
      if (record) {
        record.returnDate = new Date()
        record.status = 'returned'
        return record
      }
    }
    throw new Error('操作失败')
  }
}

export const getBorrowRecords = async (params = {}) => {
  try {
    const available = await isApiAvailable()
    if (available) {
      return await api.get('/borrow-records', { params })
    }
    // 模拟分页和过滤
    let records = [...mockBorrowRecords]
    
    // 按状态过滤
    if (params.status) {
      records = records.filter(r => r.status === params.status)
    }
    
    // 模拟分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      records: records.slice(startIndex, endIndex),
      total: records.length,
      page,
      pageSize
    }
  } catch (error) {
    console.error('获取借阅记录失败，使用模拟数据', error)
    return {
      records: mockBorrowRecords,
      total: mockBorrowRecords.length,
      page: 1,
      pageSize: 10
    }
  }
}

export const getBorrowRecordsByPhone = async (phone) => {
  try {
    const available = await isApiAvailable()
    if (available) {
      return await api.get(`/borrow-records/phone/${phone}`)
    }
    // 模拟按手机号查询
    return mockBorrowRecords.filter(record => record.borrowerPhone === phone)
  } catch (error) {
    console.error('按手机号查询借阅记录失败', error)
    // 模拟按手机号查询
    return mockBorrowRecords.filter(record => record.borrowerPhone === phone)
  }
}

export default api