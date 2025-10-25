set -e

cmake -B build
cmake --build build --config Release
npx tstl
cp build/dsp.so build/game/dsp.so
(cd build/game/ && lovr .)
