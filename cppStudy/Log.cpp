#include "header.h"

// 定义静态成员变量
LogLevel LogClass::m_logLevel;

// 构造函数实现
LogClass::LogClass(const LogLevel level) {
  m_logLevel = level;
}

void LogClass::setLogLevel(const LogLevel level) {
  m_logLevel = level;
}

void LogClass::log(const std::string &msg) {
  const std::string levels[] = { "INFO:", "WARN:", "ERROR:" };
  print(levels[m_logLevel] + " " + msg);
}
