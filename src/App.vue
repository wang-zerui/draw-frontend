<template>
    <div id="app">
      <a-card style="margin-top:20px"  title="绘图结果">
        <v-chart class="chart" :option="option" autoresize :update-options="{notMerge:true,lazyUpdate:false,replaceMerge:['xAxis', 'yAxis','series']}" ref="chart" />
      </a-card>
      <a-card bodyStyle="{padding-left:20px;padding-right:20px;padding-top:1px;padding-bottom:0px;}"  title="代码编辑" >
        <template #extra> <a-button @click="compile" type="primary">编译绘制</a-button></template>
        <a-alert :message="successMsg" type="success" show-icon v-show="isSuccess"/>
        <a-alert :message="errorMsg" type="warning" show-icon v-show="isError"/>
        <codemirror v-model="code" :options="cmOptions" />
      </a-card>
      
    </div>
</template>

<script>

const isGridOn = (grid) => {
  return grid === 1 ? true : false
}
const isDynamicOn = (dynamic) => {
  return dynamic === 1 ? true : false
}

// let dots = [];
// for(let i=0 ; i<10; i++){
//   dots.push({
//     x: i,
//     y: i*i
//   })
// }

// const data = {
//   dynamic: "ON",
//   grid: "OFF",
//   title: "",
//   xLabel: "x轴名称",
//   yLabel: "y轴名称",
//   width: 1,
//   lines: [
//     {
//       color: "blue",
//       lineType: "dotted",
//       dots,
//     }
//   ],
// };

// const lines = data.lines;
// console.log(lines);
// let series = [];
// for(let line of lines){
//   console.log(line)
//   const color = line.color;
//   const width = line.width || 2;
//   const lineType = line.lineType;
//   const dots = line.dots;
//   const xys = [];
//   for(let dot of dots){ 
//     xys.push([dot.x, dot.y]);
//   }
//   series.push({
//     data: xys,
//     type: 'line',
//     itemStyle: {
//       color,
//     },
//     lineStyle: {
//       width,
//       color,
//       type: lineType,
//     }
//   }) 
// }
// const test = {
//   title: {
//     text: data.title,
//   },
//   xAxis: {
//     type: "value",
//     axisPointer: {
//       snap: true,
//     },
//     splitLine: {
//       show: isGridOn(data.grid),
//     },
//   },
//   yAxis: {
//     type: "value",
//     splitLine: {
//       show: isGridOn(data.grid),
//     },
//   },
//   tooltip: {
//     trigger: "item",
//     formatter: "{c0}",
//   },
//   series,
// };

import VChart from "vue-echarts";

export default {
  name: 'app',
  data() {
    return {
      code: `  // 坐标偏移语句
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
        mode: 'text/javascript',
        theme: 'base16-dark',
        lineNumbers: true,
        line: true,
        // more CodeMirror options...
      },
      option: {},
      updateOption: {},
      isImage: false,
      isError: false,
      isSuccess: false,
      errorMsg: "",
      successMsg: ""
    }
  },
  methods: {
    onCmReady(cm) {
      console.log('the editor is readied!', cm)
    },
    onCmFocus(cm) {
      console.log('the editor is focused!', cm)
    },
    onCmCodeChange(newCode) {
      console.log('this is new code', newCode)
      this.code = newCode
    },
    getLineType(lineType) {
      if(lineType == 'SOLID'){
        return "solid";
      }else if(lineType == "DOTS"){
        return "dotted";
      }else if(lineType == "DASHED"){
        return "dashed";
      }
    },
    compile() {
      const successMsg = "编译成功";

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "text/plain");

      var raw = this.code;

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      };
      console.log("test")
      fetch("https://service-dy26wz1i-1301774019.gz.apigw.tencentcs.com/release/APIService-1639560055", requestOptions)
        .then(response => response.json())
        .then(result => {
          if(result.error_code === 0){
            this.successMsg = successMsg;
            this.isSuccess = true;
            this.isError = false;
            this.draw(result.result);
          }else{
            this.isSuccess = false;
            this.isError = true;
            this.errorMsg = "编译失败："+result.msg;
          }
          
        })
        .catch(error => {
          this.errorMsg = "接口调用错误";
          this.isSuccess = false;
          this.isError = true;
        });
    },
    draw(data) {
      this.$refs.chart.clear()
      const lines = data.lines;
      let series = [];
      for(let line of lines){
        console.log(line)
        const color = line.color;
        const width = line.width || 2;
        const lineType = this.getLineType(line.lineType);
        const dots = line.dots;
        const xys = [];
        for(let dot of dots){ 
          xys.push([dot.x, dot.y]);
        }
        series.push({
          data: xys,
          type: 'line',
          itemStyle: {
            color,
          },
          lineStyle: {
            width,
            color,
            type: lineType,
          }
        }) 
      }
      
      const option = {
        animationDuration: data.dynamic===0?0:3000,
        toolbox: {
            feature: {
                saveAsImage: {
                    name:data.title,
                    pixelRatio:2
                }
            }
        },
        title: {
          text: data.title,
          left: 'center',
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
      console.log(this.option)
    }
  },
  computed: {
  },
  mounted() {
    console.log('the current CodeMirror instance object:', this.codemirror)
    // you can use this.codemirror to do something...
  },
  components: {
    VChart
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 10px;
  padding: 50px;
}
.chart {
  height: 800px;
  width: 100%
}
</style>
