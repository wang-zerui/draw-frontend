<template>
  <div class="hello">
    <a-card
      :bodyStyle="{
        height: '800px',
        'padding-right': '1px',
        'padding-left': '1px',
        'padding-top': '1px',
        'padding-bottom': '0px',
      }"
      title="词法分析器"
    >
      <codemirror v-model="code" :options="cmOptions" />
    </a-card>
  </div>
</template>
<script>
// language
import "codemirror/mode/python/python.js";

// theme css
import "codemirror/theme/idea.css";

// require active-line.js
import "codemirror/addon/selection/active-line.js";

// closebrackets
import "codemirror/addon/edit/closebrackets.js";

// keyMap
import "codemirror/mode/clike/clike.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/comment/comment.js";
import "codemirror/addon/dialog/dialog.js";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/search.js";
import "codemirror/keymap/emacs.js";
export default {
  name: "Compiler",
  data() {
    return {
      code: `from Parser import Parser
import numpy as np

class Semantic(Parser):
    def init(self):
        self.result = {
            'dynamic': 0,
            'grid': 0,
            'title': "",
            'xLabel': "",
            'yLabel': "",
            'lines': []
        }

    # 计算xy
    def getDots(self, x, y):
        x *= self.x_scale
        y *= self.y_scale
        temp1 = x * np.cos(self.rot) + y * np.sin(self.rot)
        y *= np.cos(self.rot) - x * np.sin(self.rot)
        x = temp1
        x += self.x_origin
        y += self.y_origin
        dots = [ {'x': x[i], 'y':y[i]} for i in range(len(x))]
        return dots

    def getScatterDots(self, x, y, r):
        x *= self.x_scale
        y *= self.y_scale
        temp1 = x * np.cos(self.rot) + y * np.sin(self.rot)
        y *= np.cos(self.rot) - x * np.sin(self.rot)
        x = temp1
        x += self.x_origin
        y += self.y_origin
        dots = [ {'x': x[i], 'y':y[i], 'r':r[i]} for i in range(len(x))]
        return dots

    # override
    def recordLine(self):
        dots = None
        if self.lineType == "scatter":
            dots = self.getScatterDots(self.x_ptr, self.y_ptr, self.radius)
        else:
            dots = self.getDots(self.x_ptr, self.y_ptr)
        line = {
            'color': self.color,
            'lineType': self.lineType,
            'dots': dots,
            'width': self.lineWidth
        }
        self.result['lines'].append(line)

    # get final result
    # {
    #     "dynamic": 0,
    #     "grid": 0,
    #     "title": "",
    #     "xLabel": "x轴名称",
    #     "yLabel": "y轴名称",
    #     "lines": [
    #         {
    #             "color": "red",
    #             "lineType": "dotted",
    #             "dots": [
    #                 {
    #                     "x": 1.0,
    #                     "y": 2.0
    #                 },{
    #                     "x": 2.0,
    #                     "y": 4.0
    #                 },{
    #                     "x": 3.0,
    #                     "y": 6.0
    #                 }
    #             ]
    #         },
    #         {
    #             "color": "blue",
    #             "lineType": "dotted",
    #             "dots": [
    #                 {
    #                     "x": 1.0,
    #                     "y": 2.0
    #                 },{
    #                     "x": 2.0,
    #                     "y": 4.0
    #                 },{
    #                     "x": 3.0,
    #                     "y": 6.0
    #                 }
    #             ]
    #         }
    #     ]
    # }
    def getResult(self):
        self.result['dynamic'] = self.dynamicOn
        self.result['grid'] = self.gridOn
        self.result['title'] = self.title
        self.result['xLabel'] = self.x_label
        self.result['yLabel'] = self.y_label
        return self.result`,
      cmOptions: {
        autoCloseBrackets: true,
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: "text/x-python",
        theme: "idea",
        keyMap: "emacs",
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
  },
  computed: {},
  mounted() {},
  components: {},
};
</script>

<style>
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
