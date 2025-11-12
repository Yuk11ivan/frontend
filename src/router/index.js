import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载
const BookList = () => import('../views/BookList.vue')
const BookDetail = () => import('../views/BookDetail.vue')
const BorrowBook = () => import('../views/BorrowBook.vue')
const ReturnBook = () => import('../views/ReturnBook.vue')
const BorrowRecords = () => import('../views/BorrowRecords.vue')
const BookManage = () => import('../views/BookManage.vue')

const routes = [
  {
    path: '/',
    name: 'BookList',
    component: BookList,
    meta: {
      title: '图书列表'
    }
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: BookDetail,
    props: true,
    meta: {
      title: '图书详情'
    }
  },
  {
    path: '/borrow/:bookId',
    name: 'BorrowBook',
    component: BorrowBook,
    props: true,
    meta: {
      title: '借阅图书'
    }
  },
  {
    path: '/return',
    name: 'ReturnBook',
    component: ReturnBook,
    meta: {
      title: '归还图书'
    }
  },
  {
    path: '/records',
    name: 'BorrowRecords',
    component: BorrowRecords,
    meta: {
      title: '借阅记录'
    }
  },
  {
    path: '/manage',
    name: 'BookManage',
    component: BookManage,
    meta: {
      title: '图书管理'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 使用环境变量中的基础路径
  routes
})

// 全局前置守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 图书借阅系统` : '图书借阅系统'
  next()
})

export default router