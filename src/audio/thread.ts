import * as dsp from 'audio/dsp'

//// main loop ///////////////////////////////////

const start = () => {
  while (true) {
    dsp.process_if_needed()
    collectgarbage('step', 0)
    lovr.timer.sleep(0.001)
  }
}

//// construct audio graph ///////////////////////

const tri = dsp.triangle(dsp.new_stream(220), dsp.new_stream(0.5))
const lim = dsp.stereo_limiter([tri, tri])

dsp.set_output(lim)

//// start ///////////////////////////////////////

start()
