#include <string.h>

#define BLOCK_SIZE 512
#define SAMPLE_RATE 44100.0f
#define MAX_NODES = 512

typedef struct {
  float data[BLOCK_SIZE];
} Stream;

typedef struct {
  void (*process) (void *data);
  void (*release) (void *data);
  void* data;
} Node;

void schedule(const Node* node) {

}

typedef struct {
  float last_value;
} LowpassState;

void new_lowpass(const Stream** out, const Stream* in, const Stream* cutoff_frequency) {
  schedule(&(Node){
    .process = NULL,
    .release = NULL,
    .data = NULL,
  });
}



void stream_clear(Stream* out) {
  memset(out->data, 0, BLOCK_SIZE * sizeof(float));
}

void stream_fill(Stream* out, float fill_value) {
  for (int s = 0; s < BLOCK_SIZE; s++) {
    out->data[s] = fill_value;
  }
}

void stream_copy(Stream* out, const Stream* in) {
  memcpy(out->data, in->data, BLOCK_SIZE * sizeof(float));
}

void stream_add(Stream* out, int in_count, const Stream** ins) {
  stream_clear(out);
  for (int i = 0; i < in_count; i++) {
    for (int s = 0; s < BLOCK_SIZE; s++) {
      out->data[s] += ins[i]->data[s];
    }
  }
}

int main() {
    const Stream input = { 0 };
    const Stream input_cutoff = { 0 };
    const Stream* output;
    new_lowpass(&output, &input, &input_cutoff);
    return 0;
}

