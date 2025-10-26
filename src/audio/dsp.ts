//// stream //////////////////////////////////////

import * as dsp_c from 'dsp_c'

export type Stream = LuaUserdata & { __pointer_type: 'stream' }
export type ValueOf<T> = [T]
export type Value = ValueOf<number>

export const sample_rate = dsp_c.get_sample_rate()
export const max_block_size = 512
export const sizeof_sample = 4 // f32

let current_block_size = 0

// keep references to blobs so they don't get collected
const stream_blobs: Blob[] = []

export const new_stream = (value = 0): Stream => {
  const blob = lovr.data.newBlob(sizeof_sample * max_block_size, 'stream')
  stream_blobs.push(blob)
  const stream = blob.getPointer() as Stream
  dsp_c.set({
    sample_count: max_block_size,
    output: stream,
    value: value
  })
  return stream
}

export const set_block_size = (n: number) => {
  current_block_size = n
}

export const get_block_size = () => {
  return current_block_size
}

//// dsp scheduling //////////////////////////////

const scheduled_functions: (() => void)[] = []

export const schedule = (fn: () => void) => {
  scheduled_functions.push(fn)
}

export const process_scheduled = () => {
  for (let fn of scheduled_functions) {
    fn()
  }
}

//// output //////////////////////////////////////

let main_output: [Stream, Stream]
let output_frames = 2048

const output_sound = lovr.data.newSound(output_frames, 'f32', 'stereo', sample_rate, 'stream')
const output_source = lovr.audio.newSource(output_sound, {
  pitchable: false,
  spatial: false,
})
output_source.setVolume(0.1)

const output_blob = lovr.data.newBlob(2 * sizeof_sample * max_block_size, 'output_blob')

export const process_if_needed = () => {
  // check sound
  while (output_sound.getCapacity() >= 512) {
    // determine block size
    current_block_size = math.min (max_block_size, output_sound.getCapacity())
    // run all nodes
    process_scheduled()
    // interleave
    dsp_c.stereo_interleave({
      sample_count: current_block_size,
      output_stereo: output_blob.getPointer(),
      input_left: main_output[0],
      input_right: main_output[1]
    })
    output_sound.setFrames(output_blob, current_block_size)
    if (!output_source.isPlaying()) {
      output_source.play()
    }
  }
}

export const set_output = (streams: [Stream, Stream]) => {
  main_output = streams
}

//// nodes ///////////////////////////////////////

export const add = (...inputs: Stream[]): Stream => {
  const output = new_stream()
  const state = { sample_count: 0, output, inputs }
  schedule(() => {
    state.sample_count = current_block_size
    dsp_c.add(state)
  })
  return output
}

export const stereo_add = (...items: [Stream, Stream][]): [Stream, Stream] => {
  return [
    add(...items.map(x => x[0])),
    add(...items.map(x => x[1])),
  ]
}

export const multiply = (...inputs: Stream[]): Stream => {
  const output = new_stream()
  const state = { sample_count: 0, output, inputs }
  schedule(() => {
    state.sample_count = current_block_size
    dsp_c.multiply(state)
  })
  return output
}

export const stereo_multiply = (as: [Stream, Stream], b: Stream): [Stream, Stream] => {
  return [
    multiply(as[0], b),
    multiply(as[1], b),
  ]
}

export const lowpass = (input: Stream, input_cutoff: Stream) => {
  const output = new_stream()
  const state = { sample_count: 0, output, input, input_cutoff }
  schedule(() => {
    state.sample_count = current_block_size
    dsp_c.lowpass(state)
  })
  return output
}

export const highpass = (input: Stream, input_cutoff: Stream) => {
  const output = new_stream()
  const state = { sample_count: 0, output, input, input_cutoff }
  schedule(() => {
    state.sample_count = current_block_size
    dsp_c.highpass(state)
  })
  return output
}

export const triangle = (input_frequency: Stream, input_duty: Stream) => {
  const output = new_stream()
  const state = { sample_count: 0, output, input_frequency, input_duty }
  schedule(() => {
    state.sample_count = current_block_size
    dsp_c.triangle(state)
  })
  return output
}

export const adsr = (input_gate: Stream, attack: Value, decay: Value, sustain: Value, release: Value) => {
  const output = new_stream()
  const state = {
    sample_count: 0,
    output,
    input_gate,
    attack: 0,
    decay: 0,
    sustain: 0,
    release: 0 
  }
  schedule(() => {
    state.sample_count = current_block_size
    state.attack = attack[0]
    state.decay = decay[0]
    state.sustain = sustain[0]
    state.release = release[0]
    dsp_c.adsr(state)
  })
  return output
}

export const stereo_limiter = (inputs: [Stream, Stream]) => {
  const outputs = [new_stream(), new_stream()] as [Stream, Stream]
  const state = {
    sample_count: 0,
    output_left: outputs[0],
    output_right: outputs[1],
    input_left: inputs[0],
    input_right: inputs[1],
    hit_limiter: false
  }
  schedule(() => {
    state.sample_count = current_block_size
    dsp_c.stereo_limiter(state)
    if (state.hit_limiter) {
      print('hit limiter!')
    }
  })
  return outputs
}

class DelayBuffer {
  readonly max_delay_samples: number
  readonly buffer_size: number
  readonly buffer: Blob

  private write_index = 0
  // this offset represents delay time 0 *at the start of the buffer duration*
  private read_index = 0
  private wrote_this_step = true

  constructor(
    readonly buffer_time: number,
  ) {
    this.max_delay_samples = math.ceil(buffer_time * sample_rate)
    // + block_size here so that we get the full time even when reading after writing
    this.buffer_size = math.ceil(this.max_delay_samples + 1 + max_block_size)
    this.buffer = lovr.data.newBlob(sizeof_sample * this.buffer_size)

    schedule(() => this.process())
  }

  process() {
    assert(this.wrote_this_step) // there must be a writer or else we'd play old samples
    this.wrote_this_step = false
    // the read index to *start* reading a stream at
    // points to the beginning of this step's write (which has not happened yet)
    this.read_index = this.write_index
  }

  write_stream(input: Stream) {
    assert(!this.wrote_this_step)
    this.wrote_this_step = true

    const write_state = {
      sample_count: current_block_size,
      buffer: this.buffer.getPointer(),
      buffer_size: this.buffer_size,
      write_index: this.write_index,
      input
    }
    dsp_c.delay_writer(write_state)
    this.write_index = write_state.write_index
  }

  read_stream_into(output: Stream, input_delay_time: Stream) {
    // this is the minimum amount a delay can be
    const min_delay_samples = this.wrote_this_step ? 0 : max_block_size
    const max_delay_samples = this.max_delay_samples
    
    dsp_c.delay_reader({
      sample_count: current_block_size,
      buffer: this.buffer.getPointer(),
      buffer_size: this.buffer_size,
      read_index: this.read_index,
      min_delay_samples,
      max_delay_samples,
      output,
      input_delay_time
    })
  }
}

export const new_delay_buffer = (buffer_time: number) => {
  return new DelayBuffer(buffer_time)
}

export const delay_writer = (delay_buffer: DelayBuffer, input: Stream) => {
  schedule(() => {
    delay_buffer.write_stream(input)
  })
}

export const delay_reader = (delay_buffer: DelayBuffer, input_delay_time: Stream) => {
  const output = new_stream()
  schedule(() => {
    delay_buffer.read_stream_into(output, input_delay_time)
  })
  return output
}

export const white_noise = () => {
  const output = new_stream()
  const state = { sample_count: 0, output }
  schedule(() => {
    state.sample_count = current_block_size
    dsp_c.white_noise(state)
  })
  return output
}

export const pink_noise = () => {
  const output = new_stream()
  const state = { sample_count: 0, output }
  schedule(() => {
    state.sample_count = current_block_size
    dsp_c.pink_noise(state)
  })
  return output
}
