cmake_minimum_required(VERSION 3.10.0)
project(dsp)

# for clangd
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# executable
add_library(dsp)
target_sources(dsp
  PRIVATE
    src/dsp.c)

target_include_directories(dsp PRIVATE deps/lua)
