// 测试未使用变量移除的示例文件
function testFunction() {
  const usedVar = "我被使用了";
  const unusedVar1 = "我没被使用";
  let unusedVar2 = 42;
  var unusedVar3 = true;
  
  const obj = { 
    prop1: "used",
    prop2: "unused" 
  };
  
  // 只使用了部分变量
  console.log(usedVar);
  console.log(obj.prop1);
  
  return "done";
}

// 未使用的顶级变量
const globalUnused = "global unused";
let anotherUnused = [];

// 被使用的变量
const globalUsed = "I am used";

function anotherFunction() {
  const localVar = "local";
  console.log(globalUsed);
  return localVar;
}

testFunction();
anotherFunction();