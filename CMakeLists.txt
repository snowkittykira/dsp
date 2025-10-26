cmake_minimum_required(VERSION 3.10.0)
project(dsp_c)

add_library(dsp_c MODULE src/dsp_c.c src/xoroshiro128plus.c)
set_target_properties(dsp_c PROPERTIES PREFIX "")

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

if(NOT LOVR)
  find_package(Lua REQUIRED)
  target_include_directories(dsp_c PRIVATE ${LUA_INCLUDE_DIR})
  target_link_libraries(dsp_c PRIVATE ${LUA_LIBRARIES})
endif()
