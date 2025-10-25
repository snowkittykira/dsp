//// stream //////////////////////////////////////

import * as dsp from 'dsp'

type Stream = LuaUserdata & { __pointer_type: 'stream' }
type ValueOf<T> = [T]
type Value = ValueOf<number>

const sample_rate = dsp.get_sample_rate()
const max_block_size = 512

// keep references to blobs so they don't get collected
const stream_blobs: Blob[] = []

const new_stream = (value = 0): Stream => {
  const blob = lovr.data.newBlob(4 * max_block_size, 'stream')
  stream_blobs.push(blob)
  const stream = blob.getPointer() as Stream
  dsp.set({
    sample_count: max_block_size,
    output: stream,
    value: value
  })
  return stream
}

//// dsp scheduling //////////////////////////////

const scheduled_functions: (() => void)[] = []

const schedule = (fn: () => void) => {
  scheduled_functions.push(fn)
}

const process_scheduled = () => {
  for (let fn of scheduled_functions) {
    fn()
  }
}

//// main loop ///////////////////////////////////

let current_block_size = 0

const start = () => {
  while (true) {
    process_if_needed()
    collectgarbage('step', 0)
    lovr.timer.sleep(0.001)
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

const output_blob = lovr.data.newBlob(2 * 4 * max_block_size, 'output_blob')

const process_if_needed = () => {
  // check sound
  while (output_sound.getCapacity() >= 512) {
    // determine block size
    current_block_size = math.min (max_block_size, output_sound.getCapacity())
    // run all nodes
    process_scheduled()
    // interleave
    dsp.stereo_interleave({
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

//// nodes ///////////////////////////////////////

const add = (...inputs: Stream[]): Stream => {
  const output = new_stream()
  const state = { sample_count: 0, output, inputs }
  schedule(() => {
    state.sample_count = current_block_size
    dsp.add(state)
  })
  return output
}

const stereo_add = (...items: [Stream, Stream][]): [Stream, Stream] => {
  return [
    add(...items.map(x => x[0])),
    add(...items.map(x => x[1])),
  ]
}

const multiply = (...inputs: Stream[]): Stream => {
  const output = new_stream()
  const state = { sample_count: 0, output, inputs }
  schedule(() => {
    state.sample_count = current_block_size
    dsp.multiply(state)
  })
  return output
}

const stereo_multiply = (as: [Stream, Stream], b: Stream): [Stream, Stream] => {
  return [
    multiply(as[0], b),
    multiply(as[1], b),
  ]
}

const lowpass = (input: Stream, input_cutoff: Stream) => {
  const output = new_stream()
  const state = { sample_count: 0, output, input, input_cutoff }
  schedule(() => {
    state.sample_count = current_block_size
    dsp.lowpass(state)
  })
  return output
}

const highpass = (input: Stream, input_cutoff: Stream) => {
  const output = new_stream()
  const state = { sample_count: 0, output, input, input_cutoff }
  schedule(() => {
    state.sample_count = current_block_size
    dsp.highpass(state)
  })
  return output
}

const triangle = (input_frequency: Stream, input_duty: Stream) => {
  const output = new_stream()
  const state = { sample_count: 0, output, input_frequency, input_duty }
  schedule(() => {
    state.sample_count = current_block_size
    dsp.triangle(state)
  })
  return output
}

const adsr = (input_gate: Stream, attack: Value, decay: Value, sustain: Value, release: Value) => {
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
    dsp.adsr(state)
  })
  return output
}

const stereo_limiter = (inputs: [Stream, Stream]) => {
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
    dsp.stereo_limiter(state)
    if (state.hit_limiter) {
      print('hit limiter!')
    }
  })
  return outputs
}

//// construct audio graph ///////////////////////

const tri = triangle(new_stream(220), new_stream(0.5))
const lim = stereo_limiter([tri, tri])
main_output = lim

//// start ///////////////////////////////////////

start()
