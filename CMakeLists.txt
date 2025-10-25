cmake_minimum_required(VERSION 3.10.0)
project(dsp)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_library(dsp
  MODULE
    src/dsp.c
    src/xoroshiro128plus.c)
set_target_properties(dsp PROPERTIES PREFIX "")
target_include_directories(dsp PRIVATE deps/lua)
