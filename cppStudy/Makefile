CXX = clang++
CXXFLAGS = -std=gnu++14 -fcolor-diagnostics -fansi-escape-codes -g
TARGET = main

# 自动查找当前目录下所有 cpp 文件（排除 review 目录）
SRCS = $(filter-out $(wildcard review/*.cpp), $(wildcard *.cpp))
OBJS = $(SRCS:.cpp=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(OBJS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET)

.PHONY: all clean
