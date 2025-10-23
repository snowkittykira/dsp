cmake_minimum_required(VERSION 3.5.0)
project(dsp)

# for clangd
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# executable
add_executable(dsp)
target_sources(dsp
  PRIVATE
    dsp.c)
