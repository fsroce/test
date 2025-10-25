#include "header.h"

int main() {
  // 正确：log 是静态方法，用类名::调用
  LogClass::log("hello world");
  
  // 也可以设置日志级别
  LogClass::setLogLevel(WARN);
  LogClass::log("this is a warning");
  
  return 0;
}