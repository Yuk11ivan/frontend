import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import MessageToast from './components/MessageToast.vue'

const app = createApp(App)

app.use(router)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('错误详情:', err.stack)
  console.log('Vue 实例信息:', instance ? JSON.stringify(instance.$options, null, 2) : '无实例')
  console.log('Vue 错误信息:', info)
}

// 全局提供消息服务
let showMessage = null
app.config.globalProperties.$showMessage = (text, type = 'success', duration = 3000) => {
  if (showMessage) {
    showMessage(text, type, duration)
  } else {
    console.log(`${type}: ${text}`)
  }
}

// 全局注册MessageToast组件
app.component('MessageToast', MessageToast)

app.mount('#app')