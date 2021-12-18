import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/lexer',
        name: '词法分析器',
        component: () => import('../components/Lexer.vue'),
    },
    {
        path: '/parser',
        name: '语法分析器',
        component: () => import('../components/Parser.vue'),
    },
    {
        path: '/sem',
        name: '语义分析器',
        component: () => import('../components/Sem.vue'),
    },
    {
        path: '/',
        name: '前端',
        component: () => import('../components/Compiler.vue'),
        },
  ]
 
const router = new VueRouter({
    mode: 'history',
    routes
})

export default router;
  