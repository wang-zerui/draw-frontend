<template>
  <div id="app">
    <a-layout id="components-layout-demo-responsive" >
      <a-layout-sider
        breakpoint="lg"
        collapsed-width="0"
        @collapse="onCollapse"
        @breakpoint="onBreakpoint"
      >
        <div
          style="
            font-size: 25px;
            font-weight: 800;
            text-align: center;
            color: white;
            margin-top: 20px;
            margin-bottom: 20px;
          "
        >
          绘图语言解释器
        </div>
        <a-menu
          theme="dark"
          :default-selected-keys="['1', 'sub1', 'sub2', 'sub3']"
          mode="inline"
        >
          <a-sub-menu key="sub1">
            <span slot="title"><a-icon type="user" /><span>孙蕴琦</span></span>
            <a-menu-item key="1" @click="changeMenu('lexer')">
              词法分析器
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub2">
            <span slot="title"><a-icon type="user" /><span>赵闰祺</span></span>
            <a-menu-item key="2" @click="changeMenu('parser')">
              语法分析器
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub3">
            <span slot="title"><a-icon type="user" /><span>王泽睿</span></span>
            <a-menu-item key="3" @click="changeMenu('sem')">
              语义分析器
            </a-menu-item>
            <a-menu-item key="4" @click="changeMenu('/')">
              前端
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-header :style="{ background: '#fff', padding: 0 }" ><span style="padding-left:20px;font-size:20px">软工编译原理 绘图语言解释器</span></a-layout-header>
        <a-layout-content :style="{ margin: '10px 16px 0' }">
          <!--定义路由出口-->
          <router-view />
        </a-layout-content>
        <a-layout-footer style="textalign: center; height: 0px">
          
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      collapsed: false,
    };
  },
  methods: {
    onCollapse(collapsed, type) {
      console.log(collapsed, type);
    },
    onBreakpoint(broken) {
      console.log(broken);
    },
    changeMenu(route) {
      console.log(route);
      //获取路由对象并切换
      this.$router.push(route).catch((err) => {
        console.log("输出报错", err);
      });
    },
  },
  components: {
    // Compiler,
  },
};
</script>

<style>
.header {
  height: 90px;
  background: transparent;
}
.logo {
  width: 150px;
  height: 150px;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.chart {
  height: 800px;
  width: 100%;
}
.CodeMirror {
  height: 800px !important;
}
.CodeMirror-focused .cm-matchhighlight {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVQI12NgYGBgkKzc8x9CMDAwAAAmhwSbidEoSQAAAABJRU5ErkJggg==);
  background-position: bottom;
  background-repeat: repeat-x;
}
.cm-matchhighlight {
  background-color: lightgreen;
}
.CodeMirror-selection-highlight-scrollbar {
  background-color: green;
}
</style>
