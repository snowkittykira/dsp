#include <assert.h>
#include <lua.h>
#include <lauxlib.h>
#include <math.h>
#include <string.h>

#define BLOCK_SIZE 512
#define SAMPLE_RATE 44100

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

static float check_number_field(lua_State *L, int n, const char *name) {
  lua_getfield(L, n, name);
  float number = luaL_checknumber(L, -1);
  lua_pop(L, 1);
  return number;
}

static float opt_number_field(lua_State *L, int n, const char *name, float default_number) {
  lua_getfield(L, n, name);
  float number = luaL_optnumber(L, -1, default_number);
  lua_pop(L, 1);
  return number;
}

static float opt_integer_field(lua_State *L, int n, const char *name, int default_integer) {
  lua_getfield(L, n, name);
  float integer = luaL_optinteger(L, -1, default_integer);
  lua_pop(L, 1);
  return integer;
}

static void set_number_field(lua_State *L, int n, const char *name, float number) {
  lua_pushnumber(L, number);
  lua_setfield(L, n, name);
}

static void set_integer_field(lua_State *L, int n, const char *name, int integer) {
  lua_pushnumber(L, integer);
  lua_setfield(L, n, name);
}

static int l_get_block_samples(lua_State *L) {
  lua_pushnumber(L, BLOCK_SIZE);
  return 1;
}

static int l_set(lua_State *L){
  float *output = check_pointer_field(L, 1, "output");
  float value = opt_number_field(L, 1, "value", 0);
  for (int s = 0; s < BLOCK_SIZE; s++) {
    output[s] = value;
  }
  return 0;
}

static int l_add(lua_State *L){
  float *output = check_pointer_field(L, 1, "output");
  memset(output, 0, BLOCK_SIZE * sizeof(float));
  int len = lua_objlen(L, 1);
  for (int i = 1; i <= len; i++) {
    float *input = check_pointer_index(L, 1, i);
    for (int s = 0; s < BLOCK_SIZE; s++) {
      output[s] += input[s];
    }
  }
  return 0;
}

static int l_multiply(lua_State *L){
  float *output = check_pointer_field(L, 1, "output");
  for (int s = 0; s < BLOCK_SIZE; s++) {
    output[s] = 1;
  }
  int len = lua_objlen(L, 1);
  for (int i = 1; i <= len; i++) {
    float *input = check_pointer_index(L, 1, i);
    for (int s = 0; s < BLOCK_SIZE; s++) {
      output[s] *= input[s];
    }
  }
  return 0;
}

static float min(float a, float b) {
  return a < b ? a : b;
}

static float max(float a, float b) {
  return a > b ? a : b;
}

static float calculate_filter_coefficient(float cutoff_frequency) {
  float wc = 2 * M_PI * max(0, min(1, cutoff_frequency));
  float y = 1 - cosf(wc);
  return -y + sqrtf(y * (y + 2));
}

static int l_lowpass(lua_State *L) {
  float *output = check_pointer_field(L, 1, "output");
  float *input = check_pointer_field(L, 1, "input");
  float *input_cutoff = check_pointer_field(L, 1, "input_cutoff");
  float last_value = opt_number_field(L, 1, "last_value", 0);

  for (int s = 0; s < BLOCK_SIZE; s++) {
    float alpha = calculate_filter_coefficient(input_cutoff[s]);
    last_value += alpha * (input[s] - last_value);
    last_value = last_value + 1e-20 - 1e-20; // flush denormals
    output[s] = last_value;
  }

  set_number_field(L, 1, "last_value", last_value);
  return 0;
}

static int l_highpass(lua_State *L) {
  float *output = check_pointer_field(L, 1, "output");
  float *input = check_pointer_field(L, 1, "input");
  float *input_cutoff = check_pointer_field(L, 1, "input_cutoff");
  float last_value = opt_number_field(L, 1, "last_value", 0);

  for (int s = 0; s < BLOCK_SIZE; s++) {
    float alpha = calculate_filter_coefficient(input_cutoff[s]);
    last_value += alpha * (input[s] - last_value);
    last_value = last_value + 1e-20 - 1e-20; // flush denormals
    output[s] = input[s] - last_value;
  }

  set_number_field(L, 1, "last_value", last_value);
  return 0;
}

static int l_triangle(lua_State *L) {
  float *output = check_pointer_field(L, 1, "output");
  float *input_frequency = check_pointer_field(L, 1, "input_frequency");
  float *input_duty = check_pointer_field(L, 1, "input_duty");
  float phase = opt_number_field(L, 1, "phase", 0);

  float inv_sample_rate = 1.f/SAMPLE_RATE;

  for (int s = 0; s < BLOCK_SIZE; s++) {
    phase += input_frequency[s] * inv_sample_rate;
    phase = fmod(phase, 1);
    float d = max(0, min(1, input_duty[s]));
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
  float *output = check_pointer_field(L, 1, "output");
  float *input_gate = check_pointer_field(L, 1, "input_gate");
  float attack = check_number_field(L, 1, "attack");
  float decay = check_number_field(L, 1, "decay");
  float sustain = check_number_field(L, 1, "sustain");
  float release = check_number_field(L, 1, "release");

  int stage = opt_integer_field(L, 1, "stage", ADSR_RELEASE);
  float value = opt_number_field(L, 1, "value", 0);
  float release_delta = opt_number_field(L, 1, "release_delta", 0);

  float attack_delta = 1 / max(1, attack * SAMPLE_RATE);
  float decay_delta = -(1 - sustain) / max(1, decay * SAMPLE_RATE);

  for (int s = 0; s < BLOCK_SIZE; s++) {
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

static const luaL_Reg dsp_module[] = {
  { "get_block_samples", l_get_block_samples },
  { "set", l_set },
  { "add", l_add },
  { "multiply", l_multiply },
  { "lowpass", l_lowpass },
  { "highpass", l_highpass },
  { "triangle", l_triangle },
  { "adsr", l_adsr },
  // TODO: sequencer
  // TODO: arpeggiator
  // TODO: delay
  // TODO: noise
  // TODO: limiter
  { NULL, NULL }
};

int luaopen_dsp(lua_State* L) {
  lua_newtable(L);
  luaL_register(L, NULL, dsp_module);
  return 1;
}
