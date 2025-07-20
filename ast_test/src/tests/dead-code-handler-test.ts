import { fileProcessor, deadCodeHandler } from "@handlers/index";
import path from "path";

const { readFileAsync, writeFileAsync } = fileProcessor;

const filePath = path.join(__dirname, "../../examples/dead-code-input.js");

readFileAsync(filePath).then((code) => {
  const res = deadCodeHandler(code)
  const p = path.join(__dirname, "../../output/dead-code-output.js")
  // console.log('dead-code-handler-test', res)
  writeFileAsync(p, res.cleanedCode)
});
