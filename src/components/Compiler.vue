<template>
  <div>
    <a-alert
      :message="message"
      :type="alertType"
      show-icon
      :display="isAlertShow"
    />
    <a-row style="margin: 0 -12px; margin-top:10px">
      <a-col
        style="padding: 0 12px"
        :xl="10"
        :lg="24"
        :md="24"
        :sm="24"
        :xs="24"
      >
        <a-card
          :bodyStyle="{
            height: '93vh',
            'padding-right': '1px',
            'padding-left': '1px',
            'padding-top': '1px',
            'padding-bottom': '0px',
          }"
          title="代码编辑"
        >
          <template #extra>
            <a-space>
              <a-select
                label-in-value
                placeholder="选择一个示例"
                style="width: 200px"
                @change="handleChange"
              >
                <a-select-option
                  :value="example.id"
                  :key="index"
                  v-for="(example, index) in examples"
                  >{{ example.title }}</a-select-option
                >
              </a-select>
              <a-button @click="compile" type="primary">编译绘制</a-button>
            </a-space>
          </template>

          <codemirror v-model="code" :options="cmOptions" />
        </a-card>
      </a-col>
      <a-col
        style="padding: 0 12px"
        :xl="14"
        :lg="24"
        :md="24"
        :sm="24"
        :xs="24"
      >
        <a-card
          title="绘图结果"
          :bodyStyle="{
            height: '93vh',
            paddingBottom: 0,
            paddingTop: 5
          }"
        >
          <template #extra>
            <a-space :style="visibility">
              <a-select
                label-in-value
                placeholder="选择一个示例"
                style="width: 200px"
                @change="handleChange"
              >
                <a-select-option
                  :value="example.id"
                  :key="index"
                  v-for="(example, index) in examples"
                  >{{ example.title }}</a-select-option
                >
              </a-select>
              <a-button @click="compile" type="primary">编译绘制</a-button>
            </a-space>
          </template>
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
  </div>
</template>
<script>
const isGridOn = (grid) => {
  return grid === 1 ? true : false;
};

import VChart from "vue-echarts";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/theme/idea.css";
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
  name: "Compiler",
  data() {
    return {
      visibility: "visibility:hidden",
      code: ``,
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
        theme: "idea",
      },
      option: {},
      isAlertShow: false,
      message: '请在下方编写代码，点击"编译"按钮进行绘制',
      alertType: "info",
      collapsed: false,
      examples: []
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
      } else if (lineType === "scatter") {
        return "scatter";
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
            this.message = successMsg;
            this.alertType = "success";
            this.isAlertShow = true;
            this.draw(result.result);
          } else {
            this.message = "编译失败：" + result.msg;
            this.alertType = "error";
            this.isAlertShow = true;
          }
        })
        .catch((error) => {
          this.message = "接口调用错误";
          this.alertType = "error";
          this.isAlertShow = true;
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
        if (lineType === "scatter") {
          for (let dot of dots) {
            xys.push([dot.x, dot.y, dot.r]);
          }
          series.push({
            data: xys,
            type: "scatter",
            symbolSize: function (data) {
              return data[2];
            },
            itemStyle: {
              color,
            },
            lineStyle: {
              color,
            },
          });
        } else {
          for (let dot of dots) {
            xys.push([dot.x, dot.y]);
          }
          series.push({
            data: xys,
            type: "line",
            // symbol: 'circle',
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
      }

      const option = {
        animationDuration: data.dynamic === 0 ? 0 : 3000,
        toolbox: {
          right: 100,
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
      const width = this.$refs.chart.getWidth();
      const height = this.$refs.chart.getHeight();
      const lowerOne = width > height ? height : width;
      this.$refs.chart.resize({width: lowerOne, height: lowerOne});
      //   this.$refs.chart.resize({width: width, height: width});
      console.log(this.option);
    },
    handleChange(value) {
      const id = value.key;
      fetch(
        `https://service-jbi3hb46-1301774019.gz.apigw.tencentcs.com/code/${id}`,
      )
        .then((response) => response.json())
        .then((result) => {
          console.log(result);
          this.code = result.code;
        })
        .catch((error) => console.log("error", error));
    },
  },
  computed: {},
  mounted() {
    fetch("https://service-jbi3hb46-1301774019.gz.apigw.tencentcs.com/code")
      .then((response) => response.json())
      .then((result) => {
        console.log(result)
        const examples = result;
        this.examples = examples;
      })
      .catch((error) => {
        this.message = "获取代码接口调用错误";
        this.alertType = "error";
        this.isAlertShow = true;
      });
  },
  components: {
    VChart,
  },
};
</script>

<style>
.chart {
  /* height: 900px; */
  height: 100%;
}
.chart x-vue-echarts{
  display: flex;
  justify-content: center;
  align-items: center;
}
.CodeMirror {
  height: 93vh !important;
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
