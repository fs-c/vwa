../../build/benchmark -t linear -s 16 -c 16 -o ./linear/xs       # 2^4
../../build/benchmark -t linear -s 256 -c 128 -o ./linear/sm      # 2^8
../../build/benchmark -t linear -s 262144 -c 128 -o ./linear/md   # 2^18

../../build/benchmark -t quadratic -s 262144 -c 128 -o ./quadratic/coarse
../../build/benchmark -t quadratic -s 262144 -c 512 -o ./quadratic/fine
