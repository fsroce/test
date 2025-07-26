function testFunction() {
  let usedVariable = "hello";
  console.log(usedVariable);
  {
    console.log("this is reachable");
  }
  {
    console.log("this is reachable");
  }
  {
    console.log("this is reachable too");
  }
  console.log("this is also reachable");
  {
    console.log("this is reachable");
    console.log("this is reachable");
    console.log("this is reachable");
  }
  {
    console.log("this is reachable");
  }
}