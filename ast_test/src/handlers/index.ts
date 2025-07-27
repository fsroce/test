export * as fileProcessor from './file-processor';
import deadCodeHandler from './dead-code-handler';
import removeUnusedVariableAndFunction from './unused-var-handler';

export {
  deadCodeHandler,
  removeUnusedVariableAndFunction
}