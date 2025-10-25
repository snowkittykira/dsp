set -e

cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
npx tstl
cp build/libdsp.so build/game/dsp.so
(cd build/game/ && lovr .)
