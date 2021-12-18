<template>
  <div class="hello">
    <a-row style="margin: 0 -12px">
      <a-col
        style="padding: 0 12px"
        :xl="12"
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
          title="Parser.py"
        >
          <codemirror v-model="code" :options="cmOptions" />
        </a-card>
      </a-col>
      <a-col
        style="padding: 0 12px"
        :xl="12"
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
          title="ExprNode.py"
        >
          <codemirror v-model="code1" :options="cmOptions" />
        </a-card>
      </a-col>
    </a-row>
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
  name: "Parser",
  data() {
    return {
      code1: `import Token

# 定义二元操作符集
biOpList = [Token.TokenType.PLUS, Token.TokenType.MINUS, Token.TokenType.MUL,
            Token.TokenType.DIV, Token.TokenType.POWER]


class ExprNode:
    def __init__(self, operator):
        self.operator = operator
        # 二元运算符类型，左右子节点
        if self.operator in biOpList:
            self.left = None
            self.right = None
        # 函数类型，函数指针+单子节点
        elif self.operator == Token.TokenType.FUNC:
            self.funcPtr = None
            self.son = None
        self.value = None

    # 字符串转换,含重写
    def __str__(self):
        return str(self.operator)

    # 不同操作符运算不同
    def eval(self):
        if self.operator == Token.TokenType.PLUS:
            self.value = self.right.value + self.left.value
        elif self.operator == Token.TokenType.MINUS:
            self.value = self.left.value - self.right.value
        elif self.operator == Token.TokenType.MUL:
            self.value = self.right.value * self.left.value
        elif self.operator == Token.TokenType.DIV:
            if self.right.value != 0:
                self.value = self.left.value / self.right.value
        elif self.operator == Token.TokenType.POWER:
            self.value = self.left.value ** self.right.value
        elif self.operator == Token.TokenType.FUNC:
            v = self.son.value
            fp = self.funcPtr(v)
            self.value = fp
        return self.value
`,
      code: `import numpy as np
import Token as TK
import ExprNode

colorList = ["DIMGRAY", "GOLDENROD", "KHAKI", "DARKSEAGREEN",
             "DARKKHAKI", "PINK", "LIGHTSALMON", "LIGHTCORAL"]
ltList = ["DOTS", "DASHED", "SOLID"]


class Parser:
    def __init__(self,lexer):
        # 定义初始化变量（语法分析器内部）
        self.lexer = lexer  # 词法分析器
        self.token = None
        self.param = 0
        self.x_origin, self.y_origin = 0, 0
        self.x_scale, self.y_scale = 1, 1
        self.rot = 0
        self.color, self.lineWidth, self.lineType = None, 2, "SOLID"
        self.x_label, self.y_label = "", ""
        self.title = ""
        self.gridOn, self.dynamicOn = 0, 0
        self.x_ptr, self.y_ptr = None, None
        self.tValue = 0
        self.radius = None

    def start(self,x):  # 进入语句
        self.radius = None
        print("start", str(x))

    def end(self,x):  # 离开语句
        print("end", str(x))

    def callMatch(self,x):  # 匹配token类型
        print('match token', str(x))

    def toString(self, x):  # 打印语法树
        self.PrintTree(x, 1)

    def PrintTree(self, root, indent):  # 打印语法树
        for i in range(indent):  # 控制树缩进
            print('\t', end=' ')
        if root.operator == TK.TokenType.PLUS:
            print('+ ')
        elif root.operator == TK.TokenType.MINUS:
            print('- ')
        elif root.operator == TK.TokenType.MUL:
            print('* ')
        elif root.operator == TK.TokenType.DIV:
            print("/ ")
        elif root.operator == TK.TokenType.POWER:
            print("** ")
        elif root.operator == TK.TokenType.FUNC:
            print("{} ".format(root.funcPtr))
        elif root.operator == TK.TokenType.CONST_ID:
            print('{:5f} '.format(root.value))
        elif root.operator == TK.TokenType.T:
            print('{} '.format(root.value))
        else:
            print("Invalid Type!")
            raise Exception("出错行号：", self.lexer.index, " Invalid type ")
        if root.operator == TK.TokenType.CONST_ID or root.operator == TK.TokenType.T:
            return  # 常数和参数是叶子节点
        elif root.operator == TK.TokenType.FUNC:
            self.PrintTree(root.son, indent + 1)  # 函数只有一个孩子节点
        # 递归先序遍历
        else:
            self.PrintTree(root.left, indent + 1)
            self.PrintTree(root.right, indent + 1)

    # 根据当前的单词值，处理初等项（最高优先级）
    def prim(self):  # 识别一个标识符或数字、或括号内
        if self.token.tokenType == TK.TokenType.PLUS:
            self.match(TK.TokenType.PLUS)
            right = self.prim()
            left = None
            right = self.makeBiNode(TK.TokenType.PLUS, left, right)
        elif self.token.tokenType == TK.TokenType.MINUS:
            self.match(TK.TokenType.MINUS)
            right = self.prim()
            left = ExprNode.ExprNode(TK.TokenType.CONST_ID)
            left.value = 0.0
            right = self.makeBiNode(TK.TokenType.MINUS, left, right)
        else:
            right = self.component()
        return right

    # 处理*和/，并返回表达式结果，乘、除的优先级高于加、减(包含了负号)
    def term(self):
        left = self.prim()
        while self.token.tokenType == TK.TokenType.MUL or self.token.tokenType == TK.TokenType.DIV:
            temp = self.token.tokenType
            self.match(temp)
            right = self.prim()
            left = self.makeBiNode(temp, left, right)
        return left

    # 处理 + 和 -，并返回表达式结果
    def expr(self):
        self.start("Expression")
        left = self.term()
        while self.token.tokenType == TK.TokenType.PLUS or self.token.tokenType == TK.TokenType.MINUS:
            temp = self.token.tokenType
            self.match(temp)
            right = self.term()
            left = self.makeBiNode(temp, left, right)
        self.toString(left)
        self.end("Expression")
        return left

    # 处理幂关系
    def component(self):
        left = self.atom()
        if self.token.tokenType == TK.TokenType.POWER:
            self.match(TK.TokenType.POWER)
            right = self.component()
            left = self.makeBiNode(TK.TokenType.POWER, left, right)
        return left

    # 识别函数、常数、参数
    def atom(self):
        if self.token.tokenType == TK.TokenType.CONST_ID:
            temp = self.token.value
            self.match(TK.TokenType.CONST_ID)
            address = self.makeUnNode(TK.TokenType.CONST_ID, temp)
        elif self.token.tokenType == TK.TokenType.T:
            self.match(TK.TokenType.T)
            if len(self.Tvalue) == 1:
                address = self.makeUnNode(TK.TokenType.T, 0.0)
            else:
                address = self.makeUnNode(TK.TokenType.T, self.Tvalue)
        elif self.token.tokenType == TK.TokenType.FUNC:
            temp_ptr = self.token.function
            self.match(TK.TokenType.FUNC)
            self.match(TK.TokenType.L_BRACKET)
            self.callMatch("(")
            temp = self.expr()
            address = self.makeBiNode(TK.TokenType.FUNC, temp_ptr, temp)
            self.match(TK.TokenType.R_BRACKET)
            self.callMatch(")")
        elif self.token.tokenType == TK.TokenType.L_BRACKET:
            self.match(TK.TokenType.L_BRACKET)
            self.callMatch("(")
            address = self.expr()
            self.match(TK.TokenType.R_BRACKET)
            self.callMatch(")")
        else:
            print(self.token.tokenType)
            raise Exception("出错行号：", self.lexer.index, " 与期望记号不符 ", self.token.lexeme, "Atom")
        return address

    # 生成含二元子树节点
    def makeBiNode(self, op, left, right):
        ExprPtr = ExprNode.ExprNode(op)
        if op == TK.TokenType.FUNC:
            ExprPtr.funcPtr = left
            ExprPtr.son = right
        else:
            ExprPtr.left = left
            ExprPtr.right = right
        ExprPtr.eval()
        return ExprPtr

    # 生成含一元子树节点
    def makeUnNode(self, op, value):  # 常数和变量的节点，叶子结点
        ExprPtr = ExprNode.ExprNode(op)
        ExprPtr.value = value
        return ExprPtr

    # 移进分析函数，通过分支
    def move(self):
        self.start("Statement")
        if self.token.tokenType == TK.TokenType.ORIGIN:
            self.originStat()
        elif self.token.tokenType == TK.TokenType.SCALE:
            self.scaleStat()
        elif self.token.tokenType == TK.TokenType.FOR:
            self.forStat()
            self.recordLine()
        elif self.token.tokenType == TK.TokenType.ROT:
            self.rotStat()
        elif self.token.tokenType == TK.TokenType.TITLE:
            self.titleStat()
        elif self.token.tokenType == TK.TokenType.XLABEL:
            self.xLabelStat()
        elif self.token.tokenType == TK.TokenType.YLABEL:
            self.yLabelStat()
        elif self.token.tokenType == TK.TokenType.GRID:
            self.gridStat()
        elif self.token.tokenType == TK.TokenType.DYNAMIC:
            self.dynamicStat()
        elif self.token.tokenType == TK.TokenType.SEMICO:
            self.emptyStat()
        elif self.token.tokenType in [TK.TokenType.CONST_ID, TK.TokenType.L_BRACKET, TK.TokenType.MINUS]:
            self.expr()
        else:
            print(self.token.tokenType)
            raise Exception("出错行号：", self.lexer.index, " 与期望记号不符 ", self.token.lexeme, "Move")
        self.end("Statement")

    def match(self, token_type):  # 匹配token符号，带出错处理
        if self.token.tokenType != token_type:
            print(self.token.tokenType)
            raise Exception("出错行号：", self.lexer.index, " 与期望记号不符 ", token_type, self.token.lexeme, "Match")
        self.get()

    def get(self):           
        # 调用getToken()方法
        # 设置当前token
        self.token = self.lexer.getToken()
        # 如果出错则报错
        if self.token == TK.TokenType.ERRORTOKEN:
            print(self.token.tokenType)
            raise Exception("出错行号：", self.lexer.index, " 记号错误 ", self.lexer.lexeme, "Get")

    def parser(self):  # 语法分析器本体
        self.start("Parser")
        if self.lexer.file_ptr is None:
            print("文件打开错误")
        else:
            self.get()  # 获取第一个token
            self.program()  # 开始递归下降分析
            self.lexer.__del__()  # 关闭词法分析器
            self.end("Parser")  # 退出语法分析器

    def program(self):
        self.start("Program")
        while self.token.tokenType != TK.TokenType.NONTOKEN:
            self.move()
            self.match(TK.TokenType.SEMICO)
            self.callMatch(";")
        self.end("Program")

    def originStat(self):      # origin语句
        self.start("OriginStatement")
        self.match(TK.TokenType.ORIGIN)
        self.callMatch("ORIGIN")
        self.match(TK.TokenType.IS)
        self.callMatch("IS")
        self.match(TK.TokenType.L_BRACKET)

        self.callMatch("(")
        temp = self.expr()
        self.x_origin = temp.eval()
        self.match(TK.TokenType.COMMA)
        self.callMatch(",")
        temp = self.expr()
        self.y_origin = temp.eval()
        self.match(TK.TokenType.R_BRACKET)
        self.callMatch(")")
        self.end("OriginStatement")

    def scaleStat(self):   # scale语句
        self.start("ScaleStatement")
        self.match(TK.TokenType.SCALE)
        self.callMatch("SCALE")
        self.match(TK.TokenType.IS)
        self.callMatch("IS")

        self.match(TK.TokenType.L_BRACKET)
        self.callMatch("(")
        temp = self.expr()
        self.x_scale = temp.eval()
        self.match(TK.TokenType.COMMA)
        self.callMatch(",")
        temp = self.expr()
        self.y_scale = temp.eval()
        self.y_origin = temp.eval()
        self.match(TK.TokenType.R_BRACKET)
        self.callMatch(")")
        self.end("ScaleStatement")

    def forStat(self):     # for-draw语句
        self.start("ForStatement")
        self.match(TK.TokenType.FOR)
        self.callMatch("FOR")
        self.match(TK.TokenType.T)
        self.callMatch("T")
        self.match(TK.TokenType.FROM)
        self.callMatch("FROM")
        start_ptr = self.expr()
        start_v = start_ptr.eval()
        self.match(TK.TokenType.TO)
        self.callMatch("TO")
        end_ptr = self.expr()
        end_v = end_ptr.eval()
        self.match(TK.TokenType.STEP)
        self.callMatch("STEP")
        step_ptr = self.expr()
        step_v = step_ptr.eval()
        self.Tvalue = np.arange(start_v, end_v, step_v)

        if self.token.tokenType == TK.TokenType.DRAW:
            self.match(TK.TokenType.DRAW)
            self.callMatch("DRAW")
            self.match(TK.TokenType.L_BRACKET)
            self.callMatch("(")
            v1 = self.expr().value
            self.x_ptr = v1
            self.match(TK.TokenType.COMMA)
            self.callMatch(",")
            v2 = self.expr().value
            self.y_ptr = v2
            self.match(TK.TokenType.R_BRACKET)
            self.callMatch(")")

            if self.token.tokenType == TK.TokenType.IN:
                self.match(TK.TokenType.IN)
                self.callMatch("IN")
                if str(self.token.lexeme) in colorList:
                    self.color = self.token.lexeme
                self.match(TK.TokenType.COLOR)
                self.callMatch(self.color)

            if self.token.tokenType == TK.TokenType.LINE:
                self.match(TK.TokenType.LINE)
                self.callMatch("LINE")
                # 数字类
                if self.token.tokenType in [TK.TokenType.CONST_ID, TK.TokenType.L_BRACKET, TK.TokenType.MINUS]:
                    lineWidth_ptr = self.expr()
                    self.lineWidth = lineWidth_ptr.eval()

                # 字型类
                if str(self.token.lexeme) in ltList:
                    lt = str(self.token.lexeme)
                    self.match(TK.TokenType.LINE_TYPE)
                    self.callMatch(lt)
                    self.lineType = lt

        elif self.token.tokenType == TK.TokenType.SCATTER:
            self.match(TK.TokenType.SCATTER)
            self.callMatch("SCATTER")
            self.match(TK.TokenType.L_BRACKET)
            self.callMatch("(")
            v1 = self.expr().value
            self.x_ptr = v1
            self.match(TK.TokenType.COMMA)
            self.callMatch(",")
            v2 = self.expr().value
            self.y_ptr = v2
            self.match(TK.TokenType.COMMA)
            self.callMatch(",")
            v3 = self.expr().value
            self.radius = v3
            self.match(TK.TokenType.R_BRACKET)
            self.callMatch(")")
            self.lineType = "scatter"
            if self.token.tokenType == TK.TokenType.IN:
                self.match(TK.TokenType.IN)
                self.callMatch("IN")
                if str(self.token.lexeme) in colorList:
                    self.color = self.token.lexeme
                self.match(TK.TokenType.COLOR)
                self.callMatch(self.color)

        self.end("ForStatement")

    def rotStat(self):     # rot语句
        self.start("RotStatement")
        self.match(TK.TokenType.ROT)
        self.callMatch("ROT")
        self.match(TK.TokenType.IS)
        self.callMatch("IS")
        temp = self.expr()
        self.rot = temp.eval()
        self.end("RotStatement")

    def titleStat(self):
        self.start("TitleStatement")
        self.match(TK.TokenType.TITLE)
        self.callMatch("TITLE")
        self.title = self.token.lexeme
        self.match(TK.TokenType.USER_STRING)
        self.callMatch(self.title)
        self.end("TitleStatement")

    def xLabelStat(self):
        self.start("XLabelStatement")
        self.match(TK.TokenType.XLABEL)
        self.callMatch("XLABEL")
        self.x_label = self.token.lexeme
        self.match(TK.TokenType.USER_STRING)
        self.callMatch(self.x_label)
        self.end("XLabelStatement")

    def yLabelStat(self):
        self.start("YLabelStatement")
        self.match(TK.TokenType.YLABEL)
        self.callMatch("YLABEL")
        self.y_label = self.token.lexeme
        self.match(TK.TokenType.USER_STRING)
        self.callMatch(self.y_label)
        self.end("YLabelStatement")

    def gridStat(self):
        self.start("GridStatement")
        self.match(TK.TokenType.GRID)
        self.callMatch("GRID")

        if self.token.tokenType == TK.TokenType.ON:
            self.gridOn = 1
            self.match(TK.TokenType.ON)
            self.callMatch("ON")
        elif self.token.tokenType == TK.TokenType.OFF:
            self.gridOn = 0
            self.match(TK.TokenType.OFF)
            self.callMatch("OFF")
        self.end("GridStatement")

    def dynamicStat(self):
        self.start("DynamicStatement")
        self.match(TK.TokenType.DYNAMIC)
        self.callMatch("DYNAMIC")
        if self.token.tokenType == TK.TokenType.ON:
            self.dynamicOn = 1
            self.match(TK.TokenType.ON)
            self.callMatch("ON")
        elif self.token.tokenType == TK.TokenType.OFF:
            self.dynamicOn = 0
            self.match(TK.TokenType.OFF)
            self.callMatch("OFF")
        self.end("DynamicStatement")

    def emptyStat(self):
        self.start("EmptyStatement")
        self.end("EmptyStatement")

    def recordLine(self):
        pass`,
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
