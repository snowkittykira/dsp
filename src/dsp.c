#include <assert.h>
#include <lua.h>
#include <lauxlib.h>
#include <math.h>
#include <stdbool.h>
#include <string.h>

#include "xoroshiro128plus.h"

// lua util

static void *check_pointer(lua_State *L, int n){
  if (!lua_islightuserdata(L, n)) {
    lua_pushstring(L, "expected lightuserdata");
    lua_error(L);
  }
  return lua_touserdata(L, n);
}

static void *check_pointer_field(lua_State *L, int n, const char *name) {
  lua_getfield(L, n, name);
  void *ptr = check_pointer(L, -1);
  lua_pop(L, 1);
  return ptr;
}

static void *check_pointer_index(lua_State *L, int n, int index) {
  lua_pushinteger(L, index);
  lua_gettable(L, n);
  void *ptr = check_pointer(L, -1);
  lua_pop(L, 1);
  return ptr;
}

static double check_number_field(lua_State *L, int n, const char *name) {
  lua_getfield(L, n, name);
  double number = luaL_checknumber(L, -1);
  lua_pop(L, 1);
  return number;
}

static int check_integer_field(lua_State *L, int n, const char *name) {
  lua_getfield(L, n, name);
  int number = luaL_checkinteger(L, -1);
  lua_pop(L, 1);
  return number;
}

static double opt_number_field(lua_State *L, int n, const char *name, double default_number) {
  lua_getfield(L, n, name);
  double number = luaL_optnumber(L, -1, default_number);
  lua_pop(L, 1);
  return number;
}

static int opt_integer_field(lua_State *L, int n, const char *name, int default_integer) {
  lua_getfield(L, n, name);
  int integer = luaL_optinteger(L, -1, default_integer);
  lua_pop(L, 1);
  return integer;
}

static void set_number_field(lua_State *L, int n, const char *name, double number) {
  lua_pushnumber(L, number);
  lua_setfield(L, n, name);
}

static void set_integer_field(lua_State *L, int n, const char *name, int integer) {
  lua_pushnumber(L, integer);
  lua_setfield(L, n, name);
}

static void set_bool_field(lua_State *L, int n, const char *name, bool value) {
  lua_pushboolean(L, value);
  lua_setfield(L, n, name);
}

// dsp

#define SAMPLE_RATE 44100.0

static int l_get_sample_rate(lua_State *L) {
  lua_pushnumber(L, SAMPLE_RATE);
  return 1;
}

static int l_set(lua_State *L){
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *output = check_pointer_field(L, 1, "output");
  float value = check_number_field(L, 1, "value");
  for (int s = 0; s < sample_count; s++) {
    output[s] = value;
  }
  return 0;
}

static int l_add(lua_State *L){
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *output = check_pointer_field(L, 1, "output");
  memset(output, 0, sample_count * sizeof(float));
  lua_getfield(L, 1, "inputs");
  int len = lua_objlen(L, -1);
  for (int i = 1; i <= len; i++) {
    float *input = check_pointer_index(L, -1, i);
    for (int s = 0; s < sample_count; s++) {
      output[s] += input[s];
    }
  }
  return 0;
}

static int l_multiply(lua_State *L){
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *output = check_pointer_field(L, 1, "output");
  for (int s = 0; s < sample_count; s++) {
    output[s] = 1;
  }
  lua_getfield(L, 1, "inputs");
  int len = lua_objlen(L, -1);
  for (int i = 1; i <= len; i++) {
    float *input = check_pointer_index(L, -1, i);
    for (int s = 0; s < sample_count; s++) {
      output[s] *= input[s];
    }
  }
  return 0;
}

static double min(double a, double b) {
  return a < b ? a : b;
}

static double max(double a, double b) {
  return a > b ? a : b;
}

static float minf(float a, float b) {
  return a < b ? a : b;
}

static float maxf(float a, float b) {
  return a > b ? a : b;
}

static int mini(int a, int b) {
  return a < b ? a : b;
}

static int maxi(int a, int b) {
  return a > b ? a : b;
}

#define PI 3.14159265358979323846

static float calculate_filter_coefficient(float cutoff_frequency) {
  float wc = 2 * PI * maxf(0, minf(0.5, cutoff_frequency / SAMPLE_RATE));
  float y = 1 - cosf(wc);
  return -y + sqrtf(y * (y + 2));
}

static int l_lowpass(lua_State *L) {
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *output = check_pointer_field(L, 1, "output");
  float *input = check_pointer_field(L, 1, "input");
  float *input_cutoff = check_pointer_field(L, 1, "input_cutoff");
  float last_value = opt_number_field(L, 1, "last_value", 0);

  for (int s = 0; s < sample_count; s++) {
    float alpha = calculate_filter_coefficient(input_cutoff[s]);
    last_value += alpha * (input[s] - last_value);
    last_value = last_value + 1e-20 - 1e-20; // flush denormals
    output[s] = last_value;
  }

  set_number_field(L, 1, "last_value", last_value);
  return 0;
}

static int l_highpass(lua_State *L) {
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *output = check_pointer_field(L, 1, "output");
  float *input = check_pointer_field(L, 1, "input");
  float *input_cutoff = check_pointer_field(L, 1, "input_cutoff");
  float last_value = opt_number_field(L, 1, "last_value", 0);

  for (int s = 0; s < sample_count; s++) {
    float alpha = calculate_filter_coefficient(input_cutoff[s]);
    last_value += alpha * (input[s] - last_value);
    last_value = last_value + 1e-20 - 1e-20; // flush denormals
    output[s] = input[s] - last_value;
  }

  set_number_field(L, 1, "last_value", last_value);
  return 0;
}

static int l_triangle(lua_State *L) {
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *output = check_pointer_field(L, 1, "output");
  float *input_frequency = check_pointer_field(L, 1, "input_frequency");
  float *input_duty = check_pointer_field(L, 1, "input_duty");
  double phase = opt_number_field(L, 1, "phase", 0);

  double inv_sample_rate = 1./SAMPLE_RATE;

  for (int s = 0; s < sample_count; s++) {
    phase += input_frequency[s] * inv_sample_rate;
    phase = fmod(phase, 1);
    float d = maxf(0, minf(1, input_duty[s]));
    if (phase < d) {
      output[s] = phase/d * 2 - 1;
    } else {
      output[s] = (1-phase)/(1-d) * 2 - 1;
    }
  }

  set_number_field(L, 1, "phase", phase);
  return 0;
}

enum {
  ADSR_ATTACK,
  ADSR_DECAY,
  ADSR_SUSTAIN,
  ADSR_RELEASE,
};

static int l_adsr(lua_State *L) {
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *output = check_pointer_field(L, 1, "output");
  float *input_gate = check_pointer_field(L, 1, "input_gate");
  double attack = check_number_field(L, 1, "attack");
  double decay = check_number_field(L, 1, "decay");
  double sustain = check_number_field(L, 1, "sustain");
  double release = check_number_field(L, 1, "release");

  int stage = opt_integer_field(L, 1, "stage", ADSR_RELEASE);
  double value = opt_number_field(L, 1, "value", 0);
  double release_delta = opt_number_field(L, 1, "release_delta", 0);

  double attack_delta = 1 / max(1, attack * SAMPLE_RATE);
  double decay_delta = -(1 - sustain) / max(1, decay * SAMPLE_RATE);

  for (int s = 0; s < sample_count; s++) {
    if (input_gate[s] >= 0.5f) {
      if (stage == ADSR_RELEASE) {
        stage = ADSR_ATTACK;
      }
    } else if (stage != ADSR_RELEASE) {
      stage = ADSR_RELEASE;
      release_delta = -value / max(1, release * SAMPLE_RATE);
    }
    switch(stage) {
      case ADSR_ATTACK:
        value += attack_delta;
        if (value >= 1) {
          value = 1;
          stage = ADSR_DECAY;
        }
        break;
      case ADSR_DECAY:
        value += decay_delta;
        if (value <= sustain) {
          value = sustain;
          stage = ADSR_SUSTAIN;
        }
        break;
      case ADSR_SUSTAIN:
        break;
      case ADSR_RELEASE:
        if (value > 0) {
          value += release_delta;
          if (value < 0) {
            value = 0;
          }
        }
        break;
    }
    assert(value >= 0 && value <= 1);
    output[s] = value;
  }

  set_integer_field(L, 1, "stage", stage);
  set_number_field(L, 1, "value", value);
  set_number_field(L, 1, "release_delta", release_delta);
  return 0;
}

static int l_stereo_limiter(lua_State *L) {
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *output_left = check_pointer_field(L, 1, "output_left");
  float *output_right = check_pointer_field(L, 1, "output_right");
  float *input_left = check_pointer_field(L, 1, "input_left");
  float *input_right = check_pointer_field(L, 1, "input_right");
  double divisor = opt_number_field(L, 1, "divisor", 1);
  bool hit_limiter = false;

  for (int s = 0; s < sample_count; s++) {
    float amplitude = maxf(fabsf(input_left[s]), fabsf(input_right[s]));
    if (amplitude > 1) {
      divisor = max(divisor, amplitude);
      hit_limiter = true;
    }
    assert(divisor >= 1);
    output_left[s] = input_left[s] / divisor;
    output_right[s] = input_right[s] / divisor;
    divisor = max(1, divisor * 0.99);
  }

  set_number_field(L, 1, "divisor", divisor);
  set_bool_field(L, 1, "hit_limiter", hit_limiter);
  return 0;
}

static int l_stereo_interleave(lua_State *L) {
  int sample_count = check_integer_field(L, 1, "sample_count"); // number of stereo frames to output
  float *output_stereo = check_pointer_field(L, 1, "output_stereo");
  float *input_left = check_pointer_field(L, 1, "input_left");
  float *input_right = check_pointer_field(L, 1, "input_right");

  for (int s = 0; s < sample_count; s++) {
    output_stereo[s * 2] = input_left[s];
    output_stereo[s * 2 + 1] = input_right[s];
  }

  return 0;
}

static int l_delay_writer(lua_State *L) {
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *buffer = check_pointer_field(L, 1, "buffer");
  int buffer_size = check_integer_field(L, 1, "buffer_size");
  int write_index = check_integer_field(L, 1, "write_index");
  float *input = check_pointer_field(L, 1, "input");

  for (int s = 0; s < sample_count; s++) {
    buffer[write_index] = input[s];
    write_index = (write_index + 1) % buffer_size;
  }

  set_number_field(L, 1, "write_index", write_index);
  return 0;
}

static int l_delay_reader(lua_State *L) {
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *buffer = check_pointer_field(L, 1, "buffer");
  int buffer_size = check_integer_field(L, 1, "buffer_size");
  int read_index = check_integer_field(L, 1, "read_index");
  int min_delay_samples = check_integer_field(L, 1, "min_delay_samples");
  int max_delay_samples = check_integer_field(L, 1, "max_delay_samples");
  float *output = check_pointer_field(L, 1, "output");
  float *input_delay_time = check_pointer_field(L, 1, "input_delay_time");

  for (int s = 0; s < sample_count; s++) {
    float delay_time = input_delay_time[s];
    int delay_samples = maxi(min_delay_samples, mini(max_delay_samples, (int)floor(delay_time * SAMPLE_RATE + 0.5)));
    int index = (read_index - delay_samples + buffer_size) % buffer_size;
    output[s] = buffer[index];
    read_index++;
  }

  // note: do not write back read_index

  return 0;
}

static double random_double() {
  return (next() >> 11) * 0x1.0p-53;
}

static int l_white_noise(lua_State *L) {
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *output = check_pointer_field(L, 1, "output");

  for (int s = 0; s < sample_count; s++) {
    output[s] = random_double() * 2 - 1;
  }

  return 0;
}

static int l_pink_noise(lua_State *L) {
  int sample_count = check_integer_field(L, 1, "sample_count");
  float *output = check_pointer_field(L, 1, "output");
  double b0 = opt_number_field(L, 1, "b0", 0);
  double b1 = opt_number_field(L, 1, "b1", 0);
  double b2 = opt_number_field(L, 1, "b2", 0);
  double b3 = opt_number_field(L, 1, "b3", 0);
  double b4 = opt_number_field(L, 1, "b4", 0);
  double b5 = opt_number_field(L, 1, "b5", 0);
  double b6 = opt_number_field(L, 1, "b6", 0);

  for (int s = 0; s < sample_count; s++) {
    float white = random_double() * 2 - 1;
    b0 = 0.99886f * b0 + white * 0.0555179f;
    b1 = 0.99332f * b1 + white * 0.0750759f;
    b2 = 0.96900f * b2 + white * 0.1538520f;
    b3 = 0.86650f * b3 + white * 0.3104856f;
    b4 = 0.55000f * b4 + white * 0.5329522f;
    b5 = -0.7616f * b5 - white * 0.0168980f;
    output[s] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362f;
    b6 = white * 0.115926f;
  }

  set_number_field(L, 1, "b0", b0);
  set_number_field(L, 1, "b1", b1);
  set_number_field(L, 1, "b2", b2);
  set_number_field(L, 1, "b3", b3);
  set_number_field(L, 1, "b4", b4);
  set_number_field(L, 1, "b5", b5);
  set_number_field(L, 1, "b6", b6);

  return 0;
}

static const luaL_Reg dsp_module[] = {
  { "get_sample_rate", l_get_sample_rate },
  { "set", l_set },
  { "add", l_add },
  { "multiply", l_multiply },
  { "lowpass", l_lowpass },
  { "highpass", l_highpass },
  { "triangle", l_triangle },
  { "adsr", l_adsr },
  { "stereo_limiter", l_stereo_limiter },
  { "stereo_interleave", l_stereo_interleave },
  { "delay_writer", l_delay_writer },
  { "delay_reader", l_delay_reader },
  { "white_noise", l_white_noise },
  { "pink_noise", l_pink_noise },
  { NULL, NULL }
};

int luaopen_dsp(lua_State* L) {
  lua_newtable(L);
  luaL_register(L, NULL, dsp_module);
  return 1;
}
