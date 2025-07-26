function testFunction() {
  let usedVariable = "hello";
  
  console.log(usedVariable);
  {
    console.log("this is reachable");
  }

  if (false) {
    return "early return";
    console.log("this is unreachable"); // 死代码
    let anotherUnused = 42; // 死代码
  } else {
    console.log("this is reachable");

  }

  {
    console.log("this is reachable too");
  }

  console.log("this is also reachable");

  switch (1) {
    case 1:
      console.log("this is reachable")
    case 2:
      console.log("this is reachable");
    default:
      console.log("this is reachable");
  }
  switch (1) {
    case 1:
      console.log("this is reachable")
      break;
    case 2:
      console.log("this is unreachable");
      break;
    default:
      console.log("this is unreachable");
      break;
  }
}
