import { fileProcessor, deadCodeHandler } from "@handlers/index";
import path from "path";

const { readFileAsync, writeFileAsync } = fileProcessor;

const fileName = "dead-code-input";

const filePath = path.join(__dirname, `../../examples/${fileName}.js`);

const outputPath = path.join(__dirname, `../../output/${fileName.replace('input', 'output')}.js`);

readFileAsync(filePath).then((code) => {
  const res = deadCodeHandler(code)
  console.log('dead-code-handler-test, path', res, outputPath)
  writeFileAsync(outputPath, res)
});
