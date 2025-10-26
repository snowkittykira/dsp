set -e

cmake -B build
cmake --build build --config Release
npx tstl
cp build/dsp_c.so build/game/dsp_c.so
(cd build/game/ && lovr .)
