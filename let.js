const traverse = require('babel-traverse').default;
const generate = require('babel-generator').default;
const babelCore = require('babel-core');
const parse = babelCore.transform;

let code = 'const a = 1;';

const ast = parse(code).ast;             // 生成AST

traverse(ast, {                          // 遍历所有AST节点    
  VariableDeclaration(path) {            // 找到变量声明的节点
    if (path.node.kind === 'const') {
      path.node.kind = 'var';            // 将声明关键字类型替换为 'var'
    }
  }
});

code = generate(ast).code;               // 将AST再转换为代码 

console.log(code);

var a = 1;