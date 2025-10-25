cmake_minimum_required(VERSION 3.10.0)
project(dsp)

add_library(dsp MODULE src/dsp.c src/xoroshiro128plus.c)
set_target_properties(dsp PROPERTIES PREFIX "")

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

if(NOT LOVR)
  find_package(Lua REQUIRED)
  target_include_directories(dsp PRIVATE ${LUA_INCLUDE_DIR})
  target_link_libraries(dsp PRIVATE ${LUA_LIBRARIES})
endif()
