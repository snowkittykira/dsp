set -e

cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
build/dsp
