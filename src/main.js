import Vue from 'vue'
import App from './App.vue'
import ECharts from 'vue-echarts'
import './plugins/ant-design-vue.js'
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import "echarts";

Vue.config.productionTip = false
Vue.use(VueCodemirror)

Vue.component('v-chart', ECharts)


new Vue({
  render: h => h(App),
}).$mount('#app')
