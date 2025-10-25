#pragma once
#include <iostream>
#include <string>

#define print(x) std::cout << x << std::endl;

enum LogLevel {
  INFO = 0,
  WARN = 1,
  ERROR = 2
};

class LogClass {
  private:
    static LogLevel m_logLevel;
  public:
    LogClass(const LogLevel level = INFO);
    static void log(const std::string &msg);
    static void setLogLevel(LogLevel level);
};