cmake_minimum_required(VERSION 3.10.0)
project(dsp)

# for clangd
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# executable
add_library(dsp
  SHARED
    src/dsp.c
    src/xoroshiro128plus.c)
set_target_properties(dsp PROPERTIES PREFIX "")
target_include_directories(dsp PRIVATE deps/lua)
