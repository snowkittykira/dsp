#include <stdio.h>
#include <stdlib.h>
#include <string.h>

//// constants ////

#define BLOCK_SIZE 512
#define SAMPLE_RATE 44100.0f
#define MAX_NODES 512

typedef struct {
  float samples[BLOCK_SIZE];
} Stream;

//// scheduling //////////////////////////////////

typedef struct {
  void (*process) (void *data);
  void (*release) (void *data);
  void* data;
} Node;

static int node_count;
static Node nodes[MAX_NODES];

static void schedule(const Node* node) {
  if(node_count >= MAX_NODES) {
    printf("too many audio nodes\n");
    abort();
  }
  nodes[node_count] = *node;
  node_count++;
}

static void release_all() {
  for (int i = 0; i < node_count; i++) {
    nodes[i].release(nodes[i].data);
  }
  node_count = 0;
}

//// util ////////////////////////////////////////

static void stream_clear(Stream* out) {
  memset(out->samples, 0, BLOCK_SIZE * sizeof(float));
}

static void stream_fill(Stream* out, float fill_value) {
  for (int s = 0; s < BLOCK_SIZE; s++) {
    out->samples[s] = fill_value;
  }
}

static void stream_copy(Stream* out, const Stream* in) {
  memcpy(out->samples, in->samples, BLOCK_SIZE * sizeof(float));
}

static void stream_add(Stream* out, int in_count, const Stream** ins) {
}

//// parameter ///////////////////////////////////

typedef struct {
  Stream output;
  const float *source;
} ParameterData;

static void process_parameter(void *ptr) {
  ParameterData* data = ptr;
  for (int s = 0; s < BLOCK_SIZE; s++) {
    data->output.samples[s] = *data->source;
  }
}

static Stream* new_parameter(const float *source) {

}

//// add /////////////////////////////////////////

typedef struct {
  Stream output;
  int in_count;
  const Stream** ins;
} AddData;

static void process_add(void* ptr) {
  AddData* data = ptr;
  stream_clear(&data->output);
  for (int i = 0; i < data->in_count; i++) {
    for (int s = 0; s < BLOCK_SIZE; s++) {
      //data->output.data[s] += data->ins[i]->data[s];
    }
  }
}

static void release_add(void* ptr) {
  AddData* data = ptr;
  free(data->ins);
  free(data);
}

static const Stream* new_add(int in_count, const Stream** ins) {
  const Stream **ins_copy = calloc(in_count, sizeof(const Stream*));
  memcpy(ins_copy, ins, in_count * sizeof(const Stream*));

  AddData* data = calloc(1, sizeof(AddData));
  *data = (AddData){
    .output = { 0 },
    .in_count = in_count,
    .ins = ins_copy,
  };

  schedule(&(Node){
    .process = process_add,
    .release = release_add,
    .data = data,
  });

  return &data->output;
}

//// low pass ////

typedef struct {
  float last_value;
} LowpassState;

static void new_lowpass(const Stream** out, const Stream* in, const Stream* cutoff_frequency) {
  schedule(&(Node){
    .process = NULL,
    .release = NULL,
    .data = NULL,
  });
}

//// main ////

int main() {
    const Stream input = { 0 };
    const Stream input_cutoff = { 0 };
    const Stream* output;
    new_lowpass(&output, &input, &input_cutoff);
    return 0;
}

