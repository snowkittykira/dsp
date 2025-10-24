#include <lua.h>
#include <lauxlib.h>
#include <math.h>
#include <string.h>

#define BLOCK_SIZE 512
#define SAMPLE_RATE 44100

void *checkpointer(lua_State *L, int n){
  if (!lua_islightuserdata(L, n)) {
    lua_pushstring(L, "expected lightuserdata");
    lua_error(L);
  }
  return lua_touserdata(L, n);
}

static int l_get_block_samples(lua_State *L) {
  lua_pushnumber(L, BLOCK_SIZE);
  return 1;
}

static int l_set(lua_State *L){
  float *out = checkpointer(L, 1);
  float value = luaL_checknumber(L, 2);
  for (int s = 0; s < BLOCK_SIZE; s++) {
    out[s] = value;
  }
  return 0;
}

static int l_add(lua_State *L){
  float *out = checkpointer(L, 1);
  memset(out, 0, BLOCK_SIZE * sizeof(float));
  for (int i = 2; i <= lua_gettop(L); i++) {
    float *in = checkpointer(L, i);
    for (int s = 0; s < BLOCK_SIZE; s++) {
      out[s] += in[s];
    }
  }
  return 0;
}

static int l_multiply(lua_State *L){
  float *out = checkpointer(L, 1);
  for (int s = 0; s < BLOCK_SIZE; s++) {
    out[s] = 1;
  }
  for (int i = 2; i <= lua_gettop(L); i++) {
    float *in = checkpointer(L, i);
    for (int s = 0; s < BLOCK_SIZE; s++) {
      out[s] *= in[s];
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
  float *out = checkpointer(L, 1);
  float *in = checkpointer(L, 2);
  float *in_cutoff = checkpointer(L, 3);
  lua_getfield(L, 4, "last_value");
  float last_value = luaL_optnumber(L, -1, 0);

  for (int s = 0; s < BLOCK_SIZE; s++) {
    float alpha = calculate_filter_coefficient(in_cutoff[s]);
    last_value += alpha * (in[s] - last_value);
    last_value = last_value + 1e-20 - 1e-20; // flush denormals
    out[s] = last_value;
  }

  lua_pushnumber(L, last_value);
  lua_setfield(L, 3, "last_value");
  return 0;
}

static int l_highpass(lua_State *L) {
  float *out = checkpointer(L, 1);
  float *in = checkpointer(L, 2);
  float *in_cutoff = checkpointer(L, 3);
  lua_getfield(L, 4, "last_value");
  float last_value = luaL_optnumber(L, -1, 0);

  for (int s = 0; s < BLOCK_SIZE; s++) {
    float alpha = calculate_filter_coefficient(in_cutoff[s]);
    last_value += alpha * (in[s] - last_value);
    last_value = last_value + 1e-20 - 1e-20; // flush denormals
    out[s] = in[s] - last_value;
  }

  lua_pushnumber(L, last_value);
  lua_setfield(L, 4, "last_value");
  return 0;
}

static int l_triangle(lua_State *L) {
  float *out = checkpointer(L, 1);
  float *frequency = checkpointer(L, 2);
  float *duty = checkpointer(L, 3);
  float inv_sample_rate = 1.f/SAMPLE_RATE;
  lua_getfield(L, 4, "phase");
  float phase = luaL_optnumber(L, -1, 0);

  for (int s = 0; s < BLOCK_SIZE; s++) {
    phase += frequency[s] * inv_sample_rate;
    phase = fmod(phase, 1);
    float d = max(0, min(1, duty[s]));
    if (phase < d) {
      out[s] = phase/d * 2 - 1;
    } else {
      out[s] = (1-phase)/(1-d) * 2 - 1;
    }
  }

  lua_pushnumber(L, phase);
  lua_setfield(L, 4, "phase");
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
  // TODO: adsr
  { NULL, NULL }
};

int luaopen_dsp(lua_State* L) {
  
}
