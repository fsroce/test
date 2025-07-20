function testFunction() {
  let usedVariable = "hello";
  
  console.log(usedVariable);

  if (true) {
    return "early return";
    console.log("this is unreachable"); // 死代码
    let anotherUnused = 42; // 死代码
  }

  console.log("this is also unreachable"); // 死代码
}
