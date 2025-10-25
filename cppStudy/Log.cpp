#include "header.h"

static const std::string levels[] = { "INFO", "WARN", "ERROR" };

// 定义静态成员变量
LogLevel LogClass::m_logLevel;

// 构造函数实现
LogClass::LogClass(const LogLevel level) {
  m_logLevel = level;
  print("LogClass::LogClass()~ now log level is " + levels[m_logLevel]);
}
// 祈构函数
LogClass::~LogClass() {
  print("LogClass::~LogClass()");
}
void LogClass::setLogLevel(const LogLevel level) {
  m_logLevel = level;
}

void LogClass::log(const std::string &msg) {
  print(levels[m_logLevel] + ": " + msg);
}
