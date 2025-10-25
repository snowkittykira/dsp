/** @noSelfInFile **/

export function get_sample_rate(): number
export function get_block_samples(): number
export function set_block_samples(block_samples: number): void

export function set(state: {
  sample_count: number
  output: LuaUserdata
  value: number
}): void

export function add(state: {
  sample_count: number
  output: LuaUserdata
  inputs: LuaUserdata[]
}): void

export function multiply(state: {
  sample_count: number
  output: LuaUserdata
  inputs: LuaUserdata[]
}): void

export function lowpass(state: {
  sample_count: number
  output: LuaUserdata
  input: LuaUserdata
  input_cutoff: LuaUserdata
  last_value?: number
}): void

export function highpass(state: {
  sample_count: number
  output: LuaUserdata
  input: LuaUserdata
  input_cutoff: LuaUserdata
  last_value?: number
}): void

export function triangle(state: {
  sample_count: number
  output: LuaUserdata
  input_frequency: LuaUserdata
  input_duty: LuaUserdata
  phase?: number
}): void

export function adsr(state: {
  sample_count: number
  output: LuaUserdata
  input_gate: LuaUserdata
  attack: number
  decay: number
  sustain: number
  release: number
  stage?: number
  value?: number
  release_delta?: number
}): void

export function stereo_limiter(state: {
  sample_count: number
  output_left: LuaUserdata
  output_right: LuaUserdata
  input_left: LuaUserdata
  input_right: LuaUserdata
  hit_limiter?: boolean
}): void

export function stereo_interleave(state: {
  sample_count: number
  output_stereo: LuaUserdata
  input_left: LuaUserdata
  input_right: LuaUserdata
}): void
