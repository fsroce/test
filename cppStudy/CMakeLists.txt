cmake_minimum_required(VERSION 3.10)
project(cppStudy)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g")

# 自动查找当前目录下所有 cpp 文件
file(GLOB SOURCES "*.cpp")

# 排除 review 目录下的文件
file(GLOB REVIEW_SOURCES "review/*.cpp")
list(REMOVE_ITEM SOURCES ${REVIEW_SOURCES})

add_executable(main ${SOURCES})
