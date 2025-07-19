const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const fs = require("fs");

const fileName = __dirname + "/input.js";

console.log("fileName", fileName);

const code = fs.readFileSync(fileName).toString();

const ast = parser.parse(code);

// console.log('ast', ast)


let flags = []
// walker
traverse(ast, {
  CallExpression(path) {
    const { callee } = path.node;
    if (callee.name === "myFunction") {
      // console.log(path.node)
      const arg = path.node.arguments;
      flags = [arg[0].value, arg[1].value];
    }
  }
});
traverse(ast, {
  FunctionDeclaration(path) {
    if (path.node.id.name === "myFunction") {
      // console.log('FunctionDeclaration', path.node)
      const { body } = path.node;
      // console.log('params', params)
      // console.log('body', body)
      const [s0, s1] = body.body;
      console.log("flags", flags);
      if (flags[0]) {
        body.body[0] = s0.consequent
      } else {
        body.body[0] = s0.alternate;
      }
      if (flags[1]) {
        body.body[1] = s1.alternate;
      } else {
        body.body[1] = s1.consequent
      }
    }
  },
});

const output = generator(ast, {}, code);

fs.writeFileSync(__dirname + "/output.js", output.code)
