<template>
  <div id="app">
    <a-layout id="components-layout-demo-top-side-2">
      <a-layout-sider v-model="collapsed" collapsible>
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
        <a-menu theme="dark" :default-selected-keys="['1','sub1', 'sub2', 'sub3']" mode="inline">
          <a-sub-menu key="sub1">
            <span slot="title"><a-icon type="user" /><span>孙蕴琦</span></span>
            <a-menu-item key="1"> 词法分析器 </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub2">
            <span slot="title"><a-icon type="user" /><span>赵闰琪</span></span>
            <a-menu-item key="2"> 语法分析器 </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub3">
            <span slot="title"><a-icon type="user" /><span>王泽睿</span></span>
            <a-menu-item key="3"> 语义分析器 </a-menu-item>
            <a-menu-item key="4"> 前端 </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout style="padding: 0 24px 24px">
          <a-layout-content
            :style="{
              background: '#fff',
              padding: '24px',
              margin: 0,
              minHeight: '280px',
            }"
          >
            <a-row style="margin: 0 -12px">
              <a-col
                style="padding: 0 12px"
                :xl="8"
                :lg="24"
                :md="24"
                :sm="24"
                :xs="24"
              >
                <a-card
                  :bodyStyle="{
                    height: '800px',
                    'padding-right': '1px',
                    'padding-left': '1px',
                    'padding-top': '1px',
                    'padding-bottom': '0px',
                  }"
                  title="代码编辑"
                >
                  <template #extra>
                    <a-button @click="compile" type="primary"
                      >编译绘制</a-button
                    ></template
                  >
                  <a-alert
                    :message="successMsg"
                    type="success"
                    show-icon
                    v-show="isSuccess"
                  />
                  <a-alert
                    :message="errorMsg"
                    type="warning"
                    show-icon
                    v-show="isError"
                  />
                  <codemirror v-model="code" :options="cmOptions" />
                </a-card>
              </a-col>
              <a-col
                style="padding: 0 12px"
                :xl="16"
                :lg="24"
                :md="24"
                :sm="24"
                :xs="24"
              >
                <a-card title="绘图结果">
                  <v-chart
                    class="chart"
                    :option="option"
                    autoresize
                    :update-options="{
                      notMerge: true,
                      lazyUpdate: false,
                      replaceMerge: ['xAxis', 'yAxis', 'series'],
                    }"
                    ref="chart"
                  />
                </a-card>
              </a-col>
            </a-row>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
  </div>
</template>

<script>
const isGridOn = (grid) => {
  return grid === 1 ? true : false;
};

import VChart from "vue-echarts";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/theme/monokai.css";
// require active-line.js
import "codemirror/addon/selection/active-line.js";

// styleSelectedText
import "codemirror/addon/selection/mark-selection.js";
import "codemirror/addon/search/searchcursor.js";

// hint
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/javascript-hint.js";
import "codemirror/addon/selection/active-line.js";

// highlightSelectionMatches
import "codemirror/addon/scroll/annotatescrollbar.js";
import "codemirror/addon/search/matchesonscrollbar.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/match-highlighter.js";

// keyMap
import "codemirror/mode/clike/clike.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/comment/comment.js";
import "codemirror/addon/dialog/dialog.js";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/search.js";
import "codemirror/keymap/sublime.js";

// foldGutter
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/markdown-fold.js";
import "codemirror/addon/fold/xml-fold.js";
export default {
  name: "app",
  data() {
    return {
      code: `// 坐标偏移语句
ORIGIN IS (80,70);  -- Tab测试
//// 比例设置语句
SCALE is (1,1);
-- 角度旋转语句
ROT IS 3/(2*PI);
--------- 绘图语句
FOR T FROM 1 TO 1000 STEP 1 DRAW(T+5**(2-3)/4,sin(T/30)) IN DIMGRAY LINE 3.5 DOTS;
XLABEL '年份';
YLABEL 'GDP总值亿元';   -- 中间注释测试
TITLE 'GDP总量变化';
GRID ON;
DYNAMIC ON;
// 末尾注释，检测最后一行注释是否存在问题`,
      cmOptions: {
        tabSize: 4,
        styleActiveLine: false,
        lineNumbers: true,
        styleSelectedText: false,
        line: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
        mode: "text/javascript",
        matchBrackets: true,
        showCursorWhenSelecting: true,
        theme: "monokai",
      },
      option: {},
      updateOption: {},
      isImage: false,
      isError: false,
      isSuccess: false,
      errorMsg: "",
      successMsg: "",
      collapsed: false,
    };
  },
  methods: {
    onCmReady(cm) {
      console.log("the editor is readied!", cm);
    },
    onCmFocus(cm) {
      console.log("the editor is focused!", cm);
    },
    onCmCodeChange(newCode) {
      console.log("this is new code", newCode);
      this.code = newCode;
    },
    getLineType(lineType) {
      if (lineType == "SOLID") {
        return "solid";
      } else if (lineType == "DOTS") {
        return "dotted";
      } else if (lineType == "DASHED") {
        return "dashed";
      }
    },
    compile() {
      const successMsg = "编译成功";

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "text/plain");

      var raw = this.code;

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };
      console.log("test");
      fetch(
        "https://service-dy26wz1i-1301774019.gz.apigw.tencentcs.com/release/APIService-1639560055",
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          if (result.error_code === 0) {
            this.successMsg = successMsg;
            this.isSuccess = true;
            this.isError = false;
            this.draw(result.result);
          } else {
            this.isSuccess = false;
            this.isError = true;
            this.errorMsg = "编译失败：" + result.msg;
          }
        })
        .catch((error) => {
          this.errorMsg = "接口调用错误";
          this.isSuccess = false;
          this.isError = true;
        });
    },
    draw(data) {
      this.$refs.chart.clear();
      const lines = data.lines;
      let series = [];
      for (let line of lines) {
        console.log(line);
        const color = line.color;
        const width = line.width || 2;
        const lineType = this.getLineType(line.lineType);
        const dots = line.dots;
        const xys = [];
        for (let dot of dots) {
          xys.push([dot.x, dot.y]);
        }
        series.push({
          data: xys,
          type: "line",
          itemStyle: {
            color,
          },
          lineStyle: {
            width,
            color,
            type: lineType,
          },
        });
      }

      const option = {
        animationDuration: data.dynamic === 0 ? 0 : 3000,
        toolbox: {
          feature: {
            saveAsImage: {
              name: data.title,
              pixelRatio: 2,
            },
          },
        },
        title: {
          text: data.title,
          left: "center",
        },
        xAxis: {
          name: data.xLabel,
          type: "value",
          axisPointer: {
            snap: true,
          },
          splitLine: {
            show: isGridOn(data.grid),
          },
        },
        yAxis: {
          name: data.yLabel,
          type: "value",
          splitLine: {
            show: isGridOn(data.grid),
          },
        },
        tooltip: {
          trigger: "item",
          formatter: "{c0}",
        },
        series,
      };

      this.option = option;
      this.isImage = true;
      console.log(this.option);
    },
  },
  computed: {},
  mounted() {
    console.log("the current CodeMirror instance object:", this.codemirror);
    // you can use this.codemirror to do something...
  },
  components: {
    VChart,
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
