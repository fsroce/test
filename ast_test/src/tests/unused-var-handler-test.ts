import { fileProcessor, removeUnusedVariableAndFunction } from "@handlers/index";
import path from "path";

const { readFileAsync, writeFileAsync } = fileProcessor;

const fileName = "unused-vars-input";

const filePath = path.join(__dirname, `../../examples/${fileName}.js`);

const outputPath = path.join(__dirname, `../../output/${fileName.replace('input', 'output')}.js`);

readFileAsync(filePath).then((code) => {
  const res = removeUnusedVariableAndFunction(code)
  writeFileAsync(outputPath, res.cleanedCode)
});
