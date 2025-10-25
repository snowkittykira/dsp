lovr.load = () => {
  const thread = lovr.thread.newThread(`
    require 'lovr.filesystem'
    lovr = {
      audio = require 'lovr.audio',
      data = require 'lovr.data',
      math = require 'lovr.math',
      thread = require 'lovr.thread',
      timer = require 'lovr.timer',
    }
    require 'synth'
  `)
  thread.start()
}

lovr.update = (dt) => {

}
