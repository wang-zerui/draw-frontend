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
          :title="title"
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
          :title="title1"
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

const code = `import Token as TK
class Lexer:
    # 构造函数，初始化文件流对象
    def __init__(self, filePath):
        self.index = 1
        self.filePath = filePath
        self.tokenBuffer = ''
        try:
            self.file_ptr = open(self.filePath, 'r', encoding='utf-8')
        except IOError:
            print("Error: 没有找到文件或读取文件失败")
    # 析构函数，在词法分析正常结束时关闭流对象
    def __del__(self):
        print("析构start~ file close")
        self.file_ptr.close()
    
    
    # 读取一个字符的函数
    def getChar(self):
        # 不用做是否读到文件尾的判断，在getToken中使用额外逻辑判断
        ch = self.file_ptr.read(1)
        return ch.upper()
    

    # 回退一个字符
    def backChar(self, char):
        if char != '':
            self.file_ptr.seek(self.file_ptr.tell() - 1)

    def backMyChar(self, char, point):
        if char != '':
            self.file_ptr.seek(point)

    # 把字符加入目前的缓冲区的Token中
    def putChar(self, char):
        self.tokenBuffer += char

    
    # 判断这个token具体是tokenTable中的哪个Token，返回对应Token的信息
    # 若是查不到，返回默认错误字符
    def JudgeKeyToken(self):
        return TK.TokenTable.get(self.tokenBuffer, TK.Tokens(TK.TokenType.ERRORTOKEN, self.tokenBuffer))
    
    # -------------------------词法分析主驱动函数---------------------------------
    # 在语法分析的过程中调用此函数，每调用一次获得一个Token
    # 该函数本质是模拟DFA的一个实现，通过遍历输入流，检测所有可能的情况的Token是什么
    def getToken(self):
        # 清空上次的缓冲区
        self.tokenBuffer = ''
        # 识别到的字符
        current_char = ''
        # 最终的Token对象，在递归下降分析中进行匹配
        current_token = None
        while(1):
            # 循环控制，跳过符号前的所有的空格和换行，同时判断是否到达文件的末尾
            last_char = self.file_ptr.tell()
            current_char = self.getChar()
            # 空字符判断，读到文件的末尾
            if current_char == '':
                current_token = TK.Tokens(TK.TokenType.NONTOKEN, '')
                return current_token
            # 维护一个Index，为语法分析提供合适的报错需求接口
            elif current_char == '\n':
                self.index += 1
            # 空格的判断，处理掉所有的空格
            elif not current_char.isspace():
                break
            # current_char = pre_proccess()
        # 此时，current_char就是第一个非空白的字符(已经获取到了，不用再次获取)


        # 将此字符放入缓冲区
        self.putChar(current_char)

        # 以字母打头的字母串
        if current_char.isalpha():
            while(1):
                last_char = self.file_ptr.tell()
                current_char = self.getChar()
                # 是字符，那么放入缓冲区
                if current_char.isalnum():
                    self.putChar(current_char)
                else:
                    break
            # 结束循环时，已经移动到了当前字符的下一个字符上
            # 比如遇到的是一个空格，那么此时已经移动到了空格的下一个字符上，如果此时的字符不是一个空格的话，那么是需要一个回退的操作的
            # 当然，如果空格的下一个字符还是一个空格，那么其实这一步并不需要回退，下次再GetToken的时候会在预处理中跳过空格
            self.backMyChar(current_char, last_char)
            #self.backChar(current_char)
            # token的匹配
            current_token = self.JudgeKeyToken()
            # 匹配后，输入序列放入：
            current_token.lexeme = self.tokenBuffer
            return current_token
        
        # 以数字打头的串
        elif current_char.isdigit():
            while(1):
                last_char = self.file_ptr.tell()
                current_char = self.getChar()
                # digit+的表示
                if current_char.isdigit():
                    self.putChar(current_char)
                else:
                    break
            # '.'的识别，且注意识别.后，后面一定是digit+
            if current_char == '.':
                self.putChar(current_char)
                while(1):
                    last_char = self.file_ptr.tell()
                    current_char = self.getChar()
                    # digit+的表示
                    if current_char.isdigit():
                        self.putChar(current_char)
                    else:
                        break
            # 识别结束，回退字符
            #self.backChar(current_char)
            self.backMyChar(current_char, last_char)
            # 不同于ID，这里不用查表，直接new Token，然后放入识别到的数字
            current_token = TK.Tokens(TK.TokenType.CONST_ID, self.tokenBuffer, float(self.tokenBuffer))
            return current_token
        
        # 分隔符
        elif current_char == ';':
            return TK.Tokens(TK.TokenType.SEMICO, ";")
        elif current_char == ',':
            return TK.Tokens(TK.TokenType.COMMA, ",")
        elif current_char == '(':
            return TK.Tokens(TK.TokenType.L_BRACKET, "(")
        elif current_char == ')':
            return TK.Tokens(TK.TokenType.R_BRACKET, ")")
        
        # 用户字符串
        elif current_char == "'":
            # 先清除缓冲区中的单引号，title中不应该有引号
            self.tokenBuffer = ''
            current_char = self.getChar()
            # 遇到匹配的尾单引号时进行匹配
            while(current_char != "'" ):
                # 如果已经是空字符或者是换行了，那么应该报错，单引号匹配有错误
                if current_char == '' or current_char == '\n':
                    self.backMyChar(current_char, last_char)
                    #self.backChar(current_char)
                    return TK.Tokens(TK.TokenType.ERRORTOKEN, "缺少匹配的单引号")
                self.putChar(current_char)
                current_char = self.getChar()
            # 否则，肯定是遇到单引号，USER_STRING识别完毕。且已经移动到单引号的下一个字符，这里不用putChar
            return TK.Tokens(TK.TokenType.USER_STRING, self.tokenBuffer)
            
        # 运算符
        elif current_char == '+':
            return TK.Tokens(TK.TokenType.PLUS, "+")
        ## '-'要额外考虑是注释的情况
        elif current_char == '-':
            last_char = self.file_ptr.tell()
            current_char = self.getChar()
            if current_char == '-':
                while current_char != '\n' and current_char != '':   
                    last_char = self.file_ptr.tell()                 
                    current_char = self.getChar()
                # 不再是注释内容
                #self.backChar(current_char)
                self.backMyChar(current_char, last_char)
                # 假如就是注释，那么特别的，我们这里对getToken进行一次递归调用
                return self.getToken()
            else:
                #self.backChar(current_char)
                self.backMyChar(current_char, last_char)
                return TK.Tokens(TK.TokenType.MINUS,"-")
        ## '**'要额外考虑乘方的情况
        elif current_char == '*':
            last_char = self.file_ptr.tell()
            current_char = self.getChar()
            if current_char == '*':
                return TK.Tokens(TK.TokenType.POWER,"**")
            else:
                #self.backChar(current_char)
                self.backMyChar(current_char, last_char)
                return TK.Tokens(TK.TokenType.MUL, "*")
        ## '/'要额外考虑注释的情况
        elif current_char == '/':
            last_char = self.file_ptr.tell()
            current_char = self.getChar()
            if current_char == '/':
                while current_char != '\n' and current_char != '':
                    last_char = self.file_ptr.tell()
                    current_char = self.getChar()
                # 不再是注释
                self.backMyChar(current_char, last_char)
                #self.backChar(current_char)
                # 已经识别了是注释，那么递归调用
                return self.getToken()
            else:
                self.backMyChar(current_char, last_char)
                #self.backChar(current_char)
                return TK.Tokens(TK.TokenType.DIV, "/")
        # 其余情况为错误字符串
        else:
            return TK.Tokens(TK.TokenType.ERRORTOKEN, self.tokenBuffer)`
const code1 = `from enum import Enum
import numpy as np

class TokenType(Enum):
    # 常数
    CONST_ID = 'CONST_ID'
    # 唯一参数T
    T = 'T'
    # 支持函数：SIN COS TAN SQRT EXP LN
    FUNC = 'FUNCTION'
    # 保留关键字
    ## FOR T FROM 起点 TO 终点 STEP 步长 DRAW(x,y);
    FOR = 'FOR'
    FROM = 'FROM'
    TO = 'TO'
    STEP = 'STEP'
    DRAW = 'DRAW'
    SCATTER = 'SCATTER'
    ## ORIGIN IS (x, y)
    ORIGIN = 'ORIGIN'
    IS = 'IS'
    ## ROT IS (X, Y)
    ROT = 'ROT'
    ## SCALE IS (X,Y)
    SCALE = 'SCALE'
    ## IN [COLOR_NAME]
    IN = 'IN'
    COLOR = 'COLOR'
    ## LINE[LINE_WIDTH][LINE_TYPE]
    LINE = 'LINE'
    LINE_TYPE = 'LINE_TYPE'
    ## TITLE('USER_STRING')
    TITLE = 'TITLE'
    USER_STRING = 'USER_STRING'
    ## XLABEL('USER_STRING'), YLABEL('USER_STRING')
    XLABEL = 'XLABEL'
    YLABEL = 'YLABEL'
    ## GRID ON GRID OFF
    GRID = 'GRID'
    ON = 'ON'
    OFF = 'OFF'
    ## DYNAMIC ON DYNAMIC OFF
    DYNAMIC = 'DYNAMIC'
    # 分隔符
    SEMICO = ";"
    L_BRACKET = "("
    R_BRACKET = ")"
    COMMA = ","
    # 运算符
    PLUS = '+'
    MINUS = '-'
    MUL = '*'
    DIV = '/'
    MOD = '%'
    POWER = '**'
    # 空记号 源程序结束
    NONTOKEN = 'NULL'
    # 出错符号，非法输入
    ERRORTOKEN = 'ERROR'


class Tokens:
    # 构造函数，默认情况下值为0，函数指针指向空
    def __init__(self, tokenType, lexeme, value = 0.0, function = None):
        self.tokenType = tokenType
        self.lexeme = lexeme
        self.value = value
        self.function = function
    # 展示token的内容，便于调试
    def disp(self):
        # print('{:<10s}|{:x<10s}|{:<10f}|{}'.format(self.tokenType.name,  self.lexeme, self.value, self.function))
        print('{:<30s}|{:<28s}\t|{:<10f}|{}'.format(self.tokenType.name,  self.lexeme, self.value, self.function))

TokenTable = {
    # 常量：COUST_ID
    "PI" : Tokens(TokenType.CONST_ID, "PI", 3.1415926, None),
    "E"  : Tokens(TokenType.CONST_ID,"E",2.71828,None),
    # 唯一变量T ：T
    "T"  : Tokens(TokenType.T, "T"),
    # 函数
    "SIN": Tokens(TokenType.FUNC, "SIN", 0, np.sin),
    "COS": Tokens(TokenType.FUNC, "COS", 0, np.cos),
    "TAN": Tokens(TokenType.FUNC, "TAN", 0, np.tan),
    "SQRT": Tokens(TokenType.FUNC, "SQRT", 0, np.sqrt),
    "EXP": Tokens(TokenType.FUNC, "EXP", 0, np.exp),
    "LN": Tokens(TokenType.FUNC, "LN", 0, np.log),
    # 保留关键字
    "ORIGIN":Tokens(TokenType.ORIGIN, "ORIGIN"),
    "IS":Tokens(TokenType.IS, "IS"),
    "ROT":Tokens(TokenType.ROT, "ROT"),
    "SCALE":Tokens(TokenType.SCALE, "SCALE"),
    "FOR":Tokens(TokenType.FOR, "FOR"),
    "FROM":Tokens(TokenType.FROM, "FROM"),
    "TO":Tokens(TokenType.TO, "TO"),
    "STEP":Tokens(TokenType.STEP,"STEP"),
    "DRAW":Tokens(TokenType.DRAW, "DRAW"),
    "SCATTER":Tokens(TokenType.SCATTER,"SCATTER"),
    "COLOR":Tokens(TokenType.COLOR, "COLOR"),
    "LINE":Tokens(TokenType.LINE,"LINE"),
    "DOTS":Tokens(TokenType.LINE_TYPE,"DOTS"),
    "DASHED":Tokens(TokenType.LINE_TYPE,"DASHED"),
    "SOLID":Tokens(TokenType.LINE_TYPE,"SOLID"),
    "XLABEL":Tokens(TokenType.XLABEL,"XLABEL"),
    "YLABEL":Tokens(TokenType.YLABEL,"YLABEL"),
    "TITLE":Tokens(TokenType.TITLE,"TITLE"),
    "GRID":Tokens(TokenType.GRID, "GRID"),
    "ON":Tokens(TokenType.ON, "ON"),
    "OFF":Tokens(TokenType.OFF, "OFF"),
    "DYNAMIC":Tokens(TokenType.DYNAMIC, "DYNAMIC"),
    # 颜色
    "DIMGRAY":Tokens(TokenType.COLOR,"DIMGRAY"),
    "GOLDENROD":Tokens(TokenType.COLOR,"GOLDENROD"),
    "KHAKI":Tokens(TokenType.COLOR,"KHAKI"),
    "DARKSEAGREEN":Tokens(TokenType.COLOR,"DARKSEAGREEN"),
    "DARKKHAKI":Tokens(TokenType.COLOR,"DARKKHAKI"),
    "PINK":Tokens(TokenType.COLOR,"PINK"),
    "LIGHTSALMON":Tokens(TokenType.COLOR,"LIGHTSALMON"),
    "LIGHTCORAL":Tokens(TokenType.COLOR,"LIGHTCORAL"),
    "IN":Tokens(TokenType.IN, "IN")
}`
export default {
  name: "Parser",
  data() {
    return {
      title1: "Lexer.py",
      title: "Token.py",
      code,
      code1,
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
