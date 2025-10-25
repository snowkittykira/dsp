/** @noSelf **/
declare namespace lovr {
  /**
   * The `lovr.conf` callback lets you configure default settings for LÖVR.  It is called once right before the game starts.
   * 
   * :::note
   * Make sure you put `lovr.conf` in a file called `conf.lua`, a special file that's loaded before the rest of the framework initializes.
   * :::
   * 
   * `lovr.conf(t)`
   * 
   * @param t - The table to edit the configuration settings on.
   * 
   * Disabling unused modules can improve startup time.
   * 
   * `t.window` can be set to nil to avoid creating the window.  The window can later be opened manually using `lovr.system.openWindow`.
   * 
   * Enabling the `t.graphics.debug` flag will add additional error checks and will send messages from the GPU driver to the `lovr.log` callback.  This will decrease performance but can help provide information on performance problems or other bugs.  It will also cause `lovr.graphics.newShader` to embed debugging information in shaders which allows inspecting variables and stepping through shaders line-by-line in tools like RenderDoc.
   * 
   * `t.graphics.debug` can also be enabled using the `--graphics-debug` command line option.
   */
  function conf(t: { version: string, identity: string, saveprecedence: boolean, modules: { audio: boolean, data: boolean, event: boolean, graphics: boolean, headset: boolean, math: boolean, physics: boolean, system: boolean, thread: boolean, timer: boolean, }, audio: { spatializer: string, samplerate: number, start: boolean, }, graphics: { debug: boolean, vsync: boolean, stencil: boolean, antialias: boolean, hdr: boolean, shadercache: boolean, }, headset: { drivers: LuaTable, start: boolean, supersample: number, seated: boolean, antialias: boolean, stencil: boolean, submitdepth: boolean, overlay: boolean, }, math: { globals: boolean, }, thread: { workers: number, }, window: { width: number, height: number, fullscreen: boolean, resizable: boolean, title: string, icon: string, }, }): void

  /**
   * This callback is called every frame, and receives a `Pass` object as an argument which can be used to render graphics to the display.  If a VR headset is connected, this function renders to the headset display, otherwise it will render to the desktop window.
   * 
   * `skip = lovr.draw(pass)`
   * 
   * @param pass - A render pass targeting the main display (headset or window).
   * @returns If truthy, the input Pass will not be submitted to the GPU.
   * 
   * To render to the desktop window when a VR headset is connected, use the `lovr.mirror` callback.
   * 
   * The display is cleared to the global background color before this callback is called, which can be changed using `lovr.graphics.setBackgroundColor`.
   * 
   * Since the `lovr.graphics.submit` function always returns true, the following idiom can be used to submit graphics work manually and override the default submission:
   * 
   *     function lovr.draw(pass)
   *       local passes = {}
   * 
   *       -- ... record multiple passes and add to passes table
   * 
   *       return lovr.graphics.submit(passes)
   *     end
   */
  function draw(pass: Pass): boolean

  /**
   * The `lovr.errhand` callback is run whenever an error occurs.  It receives a parameter containing the error message.  It should return a handler function that will run in a loop to render the error screen.
   * 
   * This handler function is of the same type as the one returned by `lovr.run` and has the same requirements (such as pumping events).  If an error occurs while this handler is running, the program will terminate immediately -- `lovr.errhand` will not be given a second chance.  Errors which occur in the error handler or in the handler it returns may not be cleanly reported, so be careful.
   * 
   * A default error handler is supplied that renders the error message as text to the headset and to the window.
   * 
   * `handler = lovr.errhand(message)`
   * 
   * @param message - The error message.
   * @returns The error handler function.  It should return nil to continue running, "restart" to restart the app, or a number representing an exit status.
   */
  function errhand(message: string): (this: void, ...args: any[]) => any

  /**
   * The `lovr.filechanged` callback is called when a file is changed.  File watching must be enabled, either by passing `--watch` when starting LÖVR or by calling `lovr.filesystem.watch`.
   * 
   * Currently, only files in the source directory are watched.  On Android, files in the sdcard directory are watched.
   * 
   * `lovr.filechanged(path, action, oldpath)`
   * 
   * @param path - The path to the file that changed.
   * @param action - What happened to the file.
   * @param oldpath - The old path, for `rename` actions.
   * 
   * LÖVR provides a default implementation for `lovr.filechanged` that restarts the project if a non-hidden file was changed:
   * 
   *     function lovr.filechanged(path)
   *       if not path:match('^%.') then
   *         lovr.event.restart()
   *       end
   *     end
   */
  function filechanged(path: string, action: FileAction, oldpath: string): void

  /**
   * The `lovr.focus` callback is called whenever the application acquires or loses focus (for example, when opening or closing the system VR menu).  The callback receives a `focused` argument, indicating whether or not the application is now focused.  Additionally, both the headset and desktop window have separate focus states, so a `display` argument indicates which display gained or lost input focus.  It may make sense to pause the game, reduce visual fidelity, or mute audio when the application loses focus.
   * 
   * `lovr.focus(focused, display)`
   * 
   * @param focused - Whether the program is now focused.
   * @param display - Whether the headset or desktop window changed input focus.
   */
  function focus(focused: boolean, display: DisplayType): void

  /**
   * This callback is called when a key is pressed.
   * 
   * `lovr.keypressed(key, scancode, repeat)`
   * 
   * @param key - The key that was pressed.
   * @param scancode - The id of the key (ignores keyboard layout, may vary between keyboards).
   * @param repeat - Whether the event is the result of a key repeat instead of an actual press.
   */
  function keypressed(key: KeyCode, scancode: number, repeat: boolean): void

  /**
   * This callback is called when a key is released.
   * 
   * `lovr.keyreleased(key, scancode)`
   * 
   * @param key - The key that was released.
   * @param scancode - The id of the key (ignores keyboard layout, may vary between keyboards).
   */
  function keyreleased(key: KeyCode, scancode: number): void

  /**
   * This callback is called once when the app starts.  It should be used to perform initial setup work, like loading resources and initializing classes and variables.
   * 
   * `lovr.load(arg)`
   * 
   * @param arg - The command line arguments provided to the program.
   * 
   * If the project was loaded from a restart using `lovr.event.restart`, the return value from the previously-run `lovr.restart` callback will be made available to this callback as the `restart` key in the `arg` table.
   * 
   * The `arg` table follows the [Lua standard](https://en.wikibooks.org/wiki/Lua_Programming/command_line_parameter).  The arguments passed in from the shell are put into a global table named `arg` and passed to `lovr.load`, but with indices offset such that the "script" (the project path) is at index 0.  So all arguments (if any) intended for the project are at successive indices starting with 1, and the executable and its "internal" arguments are in normal order but stored in negative indices.
   */
  function load(arg: LuaTable): void

  /**
   * This callback is called when a message is logged.  The default implementation of this callback prints the message to the console using `print`, but it's possible to override this callback to render messages in VR, write them to a file, filter messages, and more.
   * 
   * The message can have a "tag" that is a short string representing the sender, and a "level" indicating how severe the message is.
   * 
   * The `t.graphics.debug` flag in `lovr.conf` can be used to get log messages from the GPU driver, tagged as `GPU`.  The `t.headset.debug` will enable OpenXR messages from the VR runtime, tagged as `XR`.
   * 
   * It is also possible to emit custom log messages using `lovr.event.push`, or by calling the callback.
   * 
   * `lovr.log(message, level, tag)`
   * 
   * @param message - The log message.  It may end in a newline.
   * @param level - The log level (`debug`, `info`, `warn`, or `error`).
   * @param tag - The log tag.
   */
  function log(message: string, level: string, tag: string): void

  /**
   * This callback is called every frame after rendering to the headset and is usually used to render a mirror of the headset display onto the desktop window.  It can be overridden for custom mirroring behavior.  For example, a stereo view could be drawn instead of a single eye or a 2D HUD could be rendered.
   * 
   * `skip = lovr.mirror(pass)`
   * 
   * @param pass - A render pass targeting the window.
   * @returns If truthy, the input Pass will not be submitted to the GPU.
   */
  function mirror(pass: Pass): boolean

  /**
   * The `lovr.mount` callback is called when the headset is put on or taken off.
   * 
   * `lovr.mount(mounted)`
   * 
   * @param mounted - Whether the headset is mounted.
   */
  function mount(mounted: boolean): void

  /**
   * This callback is called when the mouse is moved.
   * 
   * `lovr.mousemoved(x, y, dx, dy)`
   * 
   * @param x - The new x position of the mouse.
   * @param y - The new y position of the mouse.
   * @param dx - The movement on the x axis since the last mousemove event.
   * @param dy - The movement on the y axis since the last mousemove event.
   */
  function mousemoved(x: number, y: number, dx: number, dy: number): void

  /**
   * This callback is called when a mouse button is pressed.
   * 
   * `lovr.mousepressed(x, y, button)`
   * 
   * @param x - The x position of the mouse when the button was pressed.
   * @param y - The y position of the mouse when the button was pressed.
   * @param button - The button that was pressed.  Will be 1 for the primary button, 2 for the secondary button, or 3 for the middle mouse button.
   */
  function mousepressed(x: number, y: number, button: number): void

  /**
   * This callback is called when a mouse button is released.
   * 
   * `lovr.mousereleased(x, y, button)`
   * 
   * @param x - The x position of the mouse when the button was released.
   * @param y - The y position of the mouse when the button was released.
   * @param button - The button that was released.  Will be 1 for the primary button, 2 for the secondary button, or 3 for the middle mouse button.
   */
  function mousereleased(x: number, y: number, button: number): void

  /**
   * This callback contains a permission response previously requested with `lovr.system.requestPermission`.  The callback contains information on whether permission was granted or denied.
   * 
   * `lovr.permission(permission, granted)`
   * 
   * @param permission - The type of permission.
   * @param granted - Whether permission was granted or denied.
   */
  function permission(permission: Permission, granted: boolean): void

  /**
   * This callback is called right before the application is about to quit.  Use it to perform any necessary cleanup work.  A truthy value can be returned from this callback to abort quitting.
   * 
   * `abort = lovr.quit()`
   * 
   * @returns Whether quitting should be aborted.
   */
  function quit(): boolean

  /**
   * The `lovr.recenter` callback is called whenever the user performs a "recenter" gesture to realign the virtual coordinate space.  On most VR systems this will move the origin to the user's current position and rotate its yaw to match the view direction.  The y=0 position will always be on the floor or at eye level, depending on whether `t.headset.seated` was set in `lovr.conf`.
   * 
   * `lovr.recenter()`
   * 
   * Note that the pose of the `floor` device will not always be at the origin of the coordinate space.  It uses a fixed position on the floor in the real world, usually the center of the configured play area.  This allows virtual objects to be positioned in a room without having them jump around after a recenter.
   */
  function recenter(): void

  /**
   * This callback is called when the desktop window is resized.
   * 
   * `lovr.resize(width, height)`
   * 
   * @param width - The new width of the window.
   * @param height - The new height of the window.
   */
  function resize(width: number, height: number): void

  /**
   * This callback is called when a restart from `lovr.event.restart` is happening.  A value can be returned to send it to the next LÖVR instance, available as the `restart` key in the argument table passed to `lovr.load`.  Object instances can not be used as the restart value, since they are destroyed as part of the cleanup process.
   * 
   * `cookie = lovr.restart()`
   * 
   * @returns The value to send to the next `lovr.load`.
   * 
   * Only nil, booleans, numbers, and strings are supported types for the return value.
   */
  function restart(): any

  /**
   * This callback is the main entry point for a LÖVR program.  It calls `lovr.load` and returns a function that will be called every frame.
   * 
   * `loop = lovr.run()`
   * 
   * @returns The main loop function.
   * 
   * The main loop function can return one of the following values:
   * 
   * - Returning `nil` will keep the main loop running.
   * - Returning the string 'restart' plus an optional value will restart LÖVR.  The value can be
   *   accessed in the `restart` key of the `arg` global.
   * - Returning a number will exit LÖVR using the number as the exit code (0 means success).
   * 
   * Care should be taken when overriding this callback.  For example, if the main loop does not call `lovr.system.pollEvents` then the OS will think LÖVR is unresponsive, or if the quit event is not handled then closing the window won't work.
   */
  function run(): (this: void, ...args: any[]) => any

  /**
   * This callback is called when text has been entered.
   * 
   * For example, when `shift + 1` is pressed on an American keyboard, `lovr.textinput` will be called with `!`.
   * 
   * `lovr.textinput(text, code)`
   * 
   * @param text - The UTF-8 encoded character.
   * @param code - The integer codepoint of the character.
   * 
   * Some characters in UTF-8 unicode take multiple bytes to encode.  Due to the way Lua works, the length of these strings will be bigger than 1 even though they are just a single character.  The `utf8` library included with LÖVR can be used to manipulate UTF-8 strings.  `Pass:text` will also correctly handle UTF-8.
   */
  function textinput(text: string, code: number): void

  /**
   * The `lovr.threaderror` callback is called whenever an error occurs in a Thread.  It receives the Thread object where the error occurred and an error message.
   * 
   * The default implementation of this callback will call `lovr.errhand` with the error.
   * 
   * `lovr.threaderror(thread, message)`
   * 
   * @param thread - The Thread that errored.
   * @param message - The error message.
   */
  function threaderror(thread: Thread, message: string): void

  /**
   * The `lovr.update` callback should be used to update your game's logic.  It receives a single parameter, `dt`, which represents the amount of elapsed time between frames.  You can use this value to scale timers, physics, and animations in your game so they play at a smooth, consistent speed.
   * 
   * `lovr.update(dt)`
   * 
   * @param dt - The number of seconds elapsed since the last update.
   */
  function update(dt: number): void

  /**
   * The `lovr.visible` callback is called whenever the application becomes visible or invisible. `lovr.draw` may still be called even while invisible to give the VR runtime timing info.  If the VR runtime decides the application doesn't need to render anymore, LÖVR will detect this and stop calling `lovr.draw`.
   * 
   * This event is also fired when the desktop window is minimized or restored.  It's possible to distinguish between the headset and window using the `display` parameter.
   * 
   * `lovr.visible(visible, display)`
   * 
   * @param visible - Whether the application is visible.
   * @param display - Whether the headset or desktop window changed visibility.
   */
  function visible(visible: boolean, display: DisplayType): void

  /**
   * This callback is called on scroll action, from a mouse wheel or a touchpad
   * 
   * `lovr.wheelmoved(dx, dy)`
   * 
   * @param dx - The relative horizontal motion; rightward movement resuts in positive values.
   * @param dy - The relative vertical motion; upward movement results in positive values.
   */
  function wheelmoved(dx: number, dy: number): void


  namespace enet {
  }

  namespace http {
  }

  namespace lovr {
    /**
     * Get the current major, minor, and patch version of LÖVR.
     * 
     * `[major, minor, patch, codename, commit] = lovr.getVersion()`
     * 
     * @returns 
     * major - The major version.
     * minor - The minor version.
     * patch - The patch number.
     * codename - The version codename.
     * commit - The commit hash (not available in all builds).
     */
    function getVersion(): LuaMultiReturn<[major: number, minor: number, patch: number, codename: string, commit: string]>

  }

  namespace audio {
    /**
     * Returns the global air absorption coefficients for the medium.  This affects Sources that have the `absorption` effect enabled, causing audio volume to drop off with distance as it is absorbed by the medium it's traveling through (air, water, etc.).  The difference between absorption and the attenuation effect is that absorption is more subtle and is frequency-dependent, so higher-frequency bands can get absorbed more quickly than lower ones. This can be used to apply "underwater" effects and stuff.
     * 
     * `[low, mid, high] = lovr.audio.getAbsorption()`
     * 
     * @returns 
     * low - The absorption coefficient for the low frequency band.
     * mid - The absorption coefficient for the mid frequency band.
     * high - The absorption coefficient for the high frequency band.
     * 
     * Absorption is currently only supported by the phonon spatializer.
     * 
     * The frequency bands correspond to `400Hz`, `2.5KHz`, and `15KHz`.
     * 
     * The default coefficients are `.0002`, `.0017`, and `.0182` for low, mid, and high.
     */
    function getAbsorption(): LuaMultiReturn<[low: number, mid: number, high: number]>

    /**
     * Returns information about the active playback or capture device.
     * 
     * `[name, id] = lovr.audio.getDevice(type)`
     * 
     * @param type - The type of device to query.
     * @returns 
     * name - The name of the device, or `nil` if no device is set.
     * id - The opaque id of the device, or `nil` if no device is set.
     * 
     * If no device has been set yet, this function returns `nil`.
     * 
     * The device doesn't need to be started.
     */
    function getDevice(type?: AudioType): LuaMultiReturn<[name: string | undefined, id: any | undefined]>

    /**
     * Returns a list of playback or capture devices.  Each device has an `id`, `name`, and a `default` flag indicating whether it's the default device.
     * 
     * To use a specific device id for playback or capture, pass it to `lovr.audio.setDevice`.
     * 
     * `devices = lovr.audio.getDevices(type)`
     * 
     * @param type - The type of devices to query (playback or capture).
     * @returns The list of devices.
     */
    function getDevices(type?: AudioType): LuaTable

    /**
     * Returns the orientation of the virtual audio listener in angle/axis representation.
     * 
     * `[angle, ax, ay, az] = lovr.audio.getOrientation()`
     * 
     * @returns 
     * angle - The number of radians the listener is rotated around its axis of rotation.
     * ax - The x component of the axis of rotation.
     * ay - The y component of the axis of rotation.
     * az - The z component of the axis of rotation.
     */
    function getOrientation(): LuaMultiReturn<[angle: number, ax: number, ay: number, az: number]>

    /**
     * Returns the position and orientation of the virtual audio listener.
     * 
     * `[x, y, z, angle, ax, ay, az] = lovr.audio.getPose()`
     * 
     * @returns 
     * x - The x position of the listener, in meters.
     * y - The y position of the listener, in meters.
     * z - The z position of the listener, in meters.
     * angle - The number of radians the listener is rotated around its axis of rotation.
     * ax - The x component of the axis of rotation.
     * ay - The y component of the axis of rotation.
     * az - The z component of the axis of rotation.
     */
    function getPose(): LuaMultiReturn<[x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number]>

    /**
     * Returns the position of the virtual audio listener, in meters.
     * 
     * `[x, y, z] = lovr.audio.getPosition()`
     * 
     * @returns 
     * x - The x position of the listener.
     * y - The y position of the listener.
     * z - The z position of the listener.
     */
    function getPosition(): LuaMultiReturn<[x: number, y: number, z: number]>

    /**
     * Returns the sample rate used by the playback device.  This can be changed using `lovr.conf`.
     * 
     * `rate = lovr.audio.getSampleRate()`
     * 
     * @returns The sample rate of the playback device, in Hz.
     */
    function getSampleRate(): number

    /**
     * Returns the name of the active spatializer (`simple`, `oculus`, or `phonon`).
     * 
     * The `t.audio.spatializer` setting in `lovr.conf` can be used to express a preference for a particular spatializer.  If it's `nil`, all spatializers will be tried in the following order: `phonon`, `oculus`, `simple`.
     * 
     * `spatializer = lovr.audio.getSpatializer()`
     * 
     * @returns The name of the active spatializer.
     * 
     * Using a feature or effect that is not supported by the current spatializer will not error, it just won't do anything.
     * 
     * <table>
     *   <thead>
     *     <tr>
     *       <td>Feature</td>
     *       <td>simple</td>
     *       <td>phonon</td>
     *       <td>oculus</td>
     *     </tr>
     *   </thead>
     *   <tbody>
     *     <tr>
     *       <td>Effect: Spatialization</td>
     *       <td>x</td>
     *       <td>x</td>
     *       <td>x</td>
     *     </tr>
     *     <tr>
     *       <td>Effect: Attenuation</td>
     *       <td>x</td>
     *       <td>x</td>
     *       <td>x</td>
     *     </tr>
     *     <tr>
     *       <td>Effect: Absorption</td>
     *       <td></td>
     *       <td>x</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td>Effect: Occlusion</td>
     *       <td></td>
     *       <td>x</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td>Effect: Transmission</td>
     *       <td></td>
     *       <td>x</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td>Effect: Reverb</td>
     *       <td></td>
     *       <td>x</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td>lovr.audio.setGeometry</td>
     *       <td></td>
     *       <td>x</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td>Source:setDirectivity</td>
     *       <td>x</td>
     *       <td>x</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td>Source:setRadius</td>
     *       <td></td>
     *       <td>x</td>
     *       <td></td>
     *     </tr>
     *   </tbody> </table>
     */
    function getSpatializer(): string

    /**
     * Returns the master volume.  All audio sent to the playback device has its volume multiplied by this factor.
     * 
     * `volume = lovr.audio.getVolume(units)`
     * 
     * @param units - The units to return (linear or db).
     * @returns The master volume.
     * 
     * The default volume is 1.0 (0 dB).
     */
    function getVolume(units?: VolumeUnit): number

    /**
     * Returns whether an audio device is started.
     * 
     * `started = lovr.audio.isStarted(type)`
     * 
     * @param type - The type of device to check.
     * @returns Whether the device is active.
     */
    function isStarted(type?: AudioType): boolean

    /**
     * Creates a new Source from an ogg, wav, or mp3 file.
     * 
     * `source = lovr.audio.newSource(file, options)`
     * 
     * @param file - A filename or Blob containing audio data to load.
     * @param options - Optional options.
     * @returns The new Source.
     */
    function newSource(file: string | Blob, options?: { decode?: boolean, pitchable?: boolean, spatial?: boolean, effects?: LuaTable, }): Source

    /**
     * Creates a new Source from an ogg, wav, or mp3 file.
     * 
     * `source = lovr.audio.newSource(sound, options)`
     * 
     * @param sound - The Sound containing raw audio samples to play.
     * @param options - Optional options.
     * @returns The new Source.
     */
    function newSource(sound: Sound, options?: { decode?: boolean, pitchable?: boolean, spatial?: boolean, effects?: LuaTable, }): Source

    /**
     * Sets the global air absorption coefficients for the medium.  This affects Sources that have the `absorption` effect enabled, causing audio volume to drop off with distance as it is absorbed by the medium it's traveling through (air, water, etc.).  The difference between absorption and the attenuation effect is that absorption is more subtle and is frequency-dependent, so higher-frequency bands can get absorbed more quickly than lower ones.  This can be used to apply "underwater" effects and stuff.
     * 
     * `lovr.audio.setAbsorption(low, mid, high)`
     * 
     * @param low - The absorption coefficient for the low frequency band.
     * @param mid - The absorption coefficient for the mid frequency band.
     * @param high - The absorption coefficient for the high frequency band.
     * 
     * Absorption is currently only supported by the phonon spatializer.
     * 
     * The frequency bands correspond to `400Hz`, `2.5KHz`, and `15KHz`.
     * 
     * The default coefficients are `.0002`, `.0017`, and `.0182` for low, mid, and high.
     */
    function setAbsorption(low: number, mid: number, high: number): void

    /**
     * Switches either the playback or capture device to a new one.
     * 
     * If a device for the given type is already active, it will be stopped and destroyed.  The new device will not be started automatically, use `lovr.audio.start` to start it.
     * 
     * A device id (previously retrieved using `lovr.audio.getDevices`) can be given to use a specific audio device, or `nil` can be used for the id to use the default audio device.
     * 
     * A sink can be also be provided when changing the device.  A sink is an audio stream (`Sound` object with a `stream` type) that will receive all audio samples played (for playback) or all audio samples captured (for capture).  When an audio device with a sink is started, be sure to periodically call `Sound:read` on the sink to read audio samples from it, otherwise it will overflow and discard old data.  The sink can have any format, data will be converted as needed. Using a sink for the playback device will reduce performance, but this isn't the case for capture devices.
     * 
     * Audio devices can be started in `shared` or `exclusive` mode.  Exclusive devices may have lower latency than shared devices, but there's a higher chance that requesting exclusive access to an audio device will fail (either because it isn't supported or allowed).  One strategy is to first try the device in exclusive mode, switching to shared if it doesn't work.
     * 
     * `success = lovr.audio.setDevice(type, id, sink, mode)`
     * 
     * @param type - The device to switch.
     * @param id - The id of the device to use, or `nil` to use the default device.
     * @param sink - An optional audio stream to use as a sink for the device.
     * @param mode - The sharing mode for the device.
     * @returns Whether creating the audio device succeeded.
     */
    function setDevice(type?: AudioType, id?: any, sink?: Sound, mode?: AudioShareMode): boolean

    /**
     * Sets a mesh of triangles to use for modeling audio effects, using a table of vertices or a Model.  When the appropriate effects are enabled, audio from `Source` objects will correctly be occluded by walls and bounce around to create realistic reverb.
     * 
     * An optional `AudioMaterial` may be provided to specify the acoustic properties of the geometry.
     * 
     * `success = lovr.audio.setGeometry(vertices, indices, material)`
     * 
     * @param vertices - A flat table of vertices.  Each vertex is 3 numbers representing its x, y, and z position. The units used for audio coordinates are up to you, but meters are recommended.
     * @param indices - A list of indices, indicating how the vertices are connected into triangles.  Indices are 1-indexed and are 32 bits (they can be bigger than 65535).
     * @param material - The acoustic material to use.
     * @returns Whether audio geometry is supported by the current spatializer and the geometry was loaded successfully.
     * 
     * This is currently only supported/used by the `phonon` spatializer.
     * 
     * The `Effect`s that use geometry are:
     * 
     * - `occlusion`
     * - `reverb`
     * - `transmission`
     * 
     * If an existing geometry has been set, this function will replace it.
     * 
     * The triangles must use counterclockwise winding.
     */
    function setGeometry(vertices: LuaTable, indices: LuaTable, material?: AudioMaterial): boolean

    /**
     * Sets a mesh of triangles to use for modeling audio effects, using a table of vertices or a Model.  When the appropriate effects are enabled, audio from `Source` objects will correctly be occluded by walls and bounce around to create realistic reverb.
     * 
     * An optional `AudioMaterial` may be provided to specify the acoustic properties of the geometry.
     * 
     * `success = lovr.audio.setGeometry(model, material)`
     * 
     * @param model - A model to use for the audio geometry.
     * @param material - The acoustic material to use.
     * @returns Whether audio geometry is supported by the current spatializer and the geometry was loaded successfully.
     * 
     * This is currently only supported/used by the `phonon` spatializer.
     * 
     * The `Effect`s that use geometry are:
     * 
     * - `occlusion`
     * - `reverb`
     * - `transmission`
     * 
     * If an existing geometry has been set, this function will replace it.
     * 
     * The triangles must use counterclockwise winding.
     */
    function setGeometry(model: Model, material?: AudioMaterial): boolean

    /**
     * Sets the orientation of the virtual audio listener in angle/axis representation.
     * 
     * `lovr.audio.setOrientation(angle, ax, ay, az)`
     * 
     * Set the listener orientation using numbers.
     * 
     * @param angle - The number of radians the listener should be rotated around its rotation axis.
     * @param ax - The x component of the axis of rotation.
     * @param ay - The y component of the axis of rotation.
     * @param az - The z component of the axis of rotation.
     */
    function setOrientation(angle: number, ax: number, ay: number, az: number): void

    /**
     * Sets the orientation of the virtual audio listener in angle/axis representation.
     * 
     * `lovr.audio.setOrientation(orientation)`
     * 
     * Set the listener orientation using a vector.
     * 
     * @param orientation - The orientation of the listener.
     */
    function setOrientation(orientation: quaternion): void

    /**
     * Sets the position and orientation of the virtual audio listener.
     * 
     * `lovr.audio.setPose(x, y, z, angle, ax, ay, az)`
     * 
     * Set the pose of the listener using numbers.
     * 
     * @param x - The x position of the listener.
     * @param y - The y position of the listener.
     * @param z - The z position of the listener.
     * @param angle - The number of radians the listener is rotated around its axis of rotation.
     * @param ax - The x component of the axis of rotation.
     * @param ay - The y component of the axis of rotation.
     * @param az - The z component of the axis of rotation.
     * 
     * The position of the listener doesn't use any specific units, but usually they can be thought of as meters to match the headset module.
     */
    function setPose(x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number): void

    /**
     * Sets the position and orientation of the virtual audio listener.
     * 
     * `lovr.audio.setPose(position, orientation)`
     * 
     * Set the pose of the listener using vector types.
     * 
     * @param position - The position of the listener.
     * @param orientation - The orientation of the listener.
     * 
     * The position of the listener doesn't use any specific units, but usually they can be thought of as meters to match the headset module.
     */
    function setPose(position: vector, orientation: quaternion): void

    /**
     * Sets the position of the virtual audio listener.  The position doesn't have any specific units, but usually they can be thought of as meters, to match the headset module.
     * 
     * `lovr.audio.setPosition(x, y, z)`
     * 
     * Set the listener position using numbers.
     * 
     * @param x - The x position of the listener.
     * @param y - The y position of the listener.
     * @param z - The z position of the listener.
     */
    function setPosition(x: number, y: number, z: number): void

    /**
     * Sets the position of the virtual audio listener.  The position doesn't have any specific units, but usually they can be thought of as meters, to match the headset module.
     * 
     * `lovr.audio.setPosition(position)`
     * 
     * Set the listener position using a vector.
     * 
     * @param position - The listener position.
     */
    function setPosition(position: vector): void

    /**
     * Sets the master volume.  All audio sent to the playback device has its volume multiplied by this factor.
     * 
     * `lovr.audio.setVolume(volume, units)`
     * 
     * @param volume - The master volume.
     * @param units - The units of the value.
     * 
     * The volume will be clamped to a 0-1 range (0 dB).
     */
    function setVolume(volume: number, units?: VolumeUnit): void

    /**
     * Starts the active playback or capture device.  By default the playback device is initialized and started, but this can be controlled using the `t.audio.start` flag in `lovr.conf`.
     * 
     * `started = lovr.audio.start(type)`
     * 
     * @param type - The type of device to start.
     * @returns Whether the device was successfully started.
     * 
     * Starting an audio device may fail if:
     * 
     * - The device is already started
     * - No device was initialized with `lovr.audio.setDevice`
     * - Lack of `audiocapture` permission on Android (see `lovr.system.requestPermission`)
     * - Some other problem accessing the audio device
     */
    function start(type?: AudioType): boolean

    /**
     * Stops the active playback or capture device.  This may fail if:
     * 
     * - The device is not started
     * - No device was initialized with `lovr.audio.setDevice`
     * 
     * `stopped = lovr.audio.stop(type)`
     * 
     * @param type - The type of device to stop.
     * @returns Whether the device was successfully stopped.
     * 
     * Switching devices with `lovr.audio.setDevice` will stop the existing one.
     */
    function stop(type?: AudioType): boolean

  }

  namespace data {
    /**
     * Creates a new Blob.
     * 
     * `blob = lovr.data.newBlob(size, name)`
     * 
     * @param size - The amount of data to allocate for the Blob, in bytes.  All of the bytes will be filled with zeroes.
     * @param name - A name for the Blob (used in error messages)
     * @returns The new Blob.
     */
    function newBlob(size: number, name?: string): Blob

    /**
     * Creates a new Blob.
     * 
     * `blob = lovr.data.newBlob(contents, name)`
     * 
     * @param contents - A string to use for the Blob's contents.
     * @param name - A name for the Blob (used in error messages)
     * @returns The new Blob.
     */
    function newBlob(contents: string, name?: string): Blob

    /**
     * Creates a new Blob.
     * 
     * `blob = lovr.data.newBlob(source, name)`
     * 
     * @param source - A Blob to copy the contents from.
     * @param name - A name for the Blob (used in error messages)
     * @returns The new Blob.
     */
    function newBlob(source: Blob, name?: string): Blob

    /**
     * Creates a new Image.  Image data can be loaded and decoded from an image file.  Alternatively, a blank image can be created with a given width, height, and format.
     * 
     * `image = lovr.data.newImage(file)`
     * 
     * Load image data from a file.
     * 
     * @param file - A filename or Blob containing an image file to load.
     * @returns The new Image.
     * 
     * The supported image file formats are png, jpg, hdr, dds, ktx1, ktx2, and astc.
     * 
     * DDS and KTX files can contain cubemaps and array textures, in any of the texture formats LÖVR supports.
     */
    function newImage(file: string | Blob): Image

    /**
     * Creates a new Image.  Image data can be loaded and decoded from an image file.  Alternatively, a blank image can be created with a given width, height, and format.
     * 
     * `image = lovr.data.newImage(width, height, format, data)`
     * 
     * Create an Image with a given size and pixel format.
     * 
     * @param width - The width of the texture.
     * @param height - The height of the texture.
     * @param format - The format of the texture's pixels.
     * @param data - Raw pixel values to use as the contents.  If `nil`, the data will all be zero.
     * @returns The new Image.
     * 
     * The supported image file formats are png, jpg, hdr, dds, ktx1, ktx2, and astc.
     * 
     * DDS and KTX files can contain cubemaps and array textures, in any of the texture formats LÖVR supports.
     */
    function newImage(width: number, height: number, format?: TextureFormat, data?: Blob): Image

    /**
     * Creates a new Image.  Image data can be loaded and decoded from an image file.  Alternatively, a blank image can be created with a given width, height, and format.
     * 
     * `image = lovr.data.newImage(source)`
     * 
     * Clone an existing Image.
     * 
     * @param source - The Image to clone.
     * @returns The new Image.
     * 
     * The supported image file formats are png, jpg, hdr, dds, ktx1, ktx2, and astc.
     * 
     * DDS and KTX files can contain cubemaps and array textures, in any of the texture formats LÖVR supports.
     */
    function newImage(source: Image): Image

    /**
     * Loads a 3D model from a file.  The supported 3D file formats are OBJ and glTF.
     * 
     * `modelData = lovr.data.newModelData(file)`
     * 
     * @param file - A filename or Blob containing the model data to import.
     * @returns The new ModelData.
     */
    function newModelData(file: string | Blob): ModelData

    /**
     * Creates a new Rasterizer from a TTF or BMFont file.
     * 
     * `rasterizer = lovr.data.newRasterizer(file, size)`
     * 
     * @param file - A filename or Blob containing the font file to load.
     * @param size - The resolution to render the font at, in pixels (TTF only).  Higher resolutions use more memory and processing power but may provide better quality results for some fonts/situations.
     * @returns The new Rasterizer.
     */
    function newRasterizer(file: string | Blob, size?: number): Rasterizer

    /**
     * Creates a new Rasterizer from a TTF or BMFont file.
     * 
     * `rasterizer = lovr.data.newRasterizer(size)`
     * 
     * Create a Rasterizer for the default font included with LÖVR (Varela Round).
     * 
     * @param size - The resolution to render the font at, in pixels (TTF only).  Higher resolutions use more memory and processing power but may provide better quality results for some fonts/situations.
     * @returns The new Rasterizer.
     */
    function newRasterizer(size?: number): Rasterizer

    /**
     * Creates a new Sound.  A sound can be loaded from an audio file, or it can be created empty with capacity for a certain number of audio frames.
     * 
     * When loading audio from a file, use the `decode` option to control whether compressed audio should remain compressed or immediately get decoded to raw samples.
     * 
     * When creating an empty sound, the `contents` parameter can be set to `'stream'` to create an audio stream.  On streams, `Sound:setFrames` will always write to the end of the stream, and `Sound:getFrames` will always read the oldest samples from the beginning.  The number of frames in the sound is the total capacity of the stream's buffer.
     * 
     * `sound = lovr.data.newSound(frames, format, channels, sampleRate, contents)`
     * 
     * Create a raw or stream Sound from a frame count and format info:
     * 
     * @param frames - The number of frames the Sound can hold.
     * @param format - The sample data type.
     * @param channels - The channel layout.
     * @param sampleRate - The sample rate, in Hz.
     * @param contents - A Blob containing raw audio samples to use as the initial contents, 'stream' to create an audio stream, or `nil` to leave the data initialized to zero.
     * @returns Sounds good.
     * 
     * It is highly recommended to use an audio format that matches the format of the audio module: `f32` sample formats at a sample rate of 48000, with 1 channel for spatialized sources or 2 channels for unspatialized sources.  This will avoid the need to convert audio during playback, which boosts performance of the audio thread.
     * 
     * The WAV importer supports 16, 24, and 32 bit integer data and 32 bit floating point data.  The data must be mono, stereo, or 4-channel full-sphere ambisonic.  The `WAVE_FORMAT_EXTENSIBLE` extension is supported.
     * 
     * Ambisonic channel layouts are supported for import (but not yet for playback).  Ambisonic data can be loaded from WAV files.  It must be first-order full-sphere ambisonic data with 4 channels.  If the WAV has a `WAVE_FORMAT_EXTENSIBLE` chunk with an `AMBISONIC_B_FORMAT` format GUID, then the data is understood as using the AMB format with Furse-Malham channel ordering and normalization.  *All other* 4-channel files are assumed to be using the AmbiX format with ACN channel ordering and SN3D normalization.  AMB files will get automatically converted to AmbiX on import, so ambisonic Sounds will always be in a consistent format.
     * 
     * OGG and MP3 files will always have the `f32` format when loaded.
     */
    function newSound(frames: number, format?: SampleFormat, channels?: ChannelLayout, sampleRate?: number, contents?: Blob | 'stream' | undefined): Sound

    /**
     * Creates a new Sound.  A sound can be loaded from an audio file, or it can be created empty with capacity for a certain number of audio frames.
     * 
     * When loading audio from a file, use the `decode` option to control whether compressed audio should remain compressed or immediately get decoded to raw samples.
     * 
     * When creating an empty sound, the `contents` parameter can be set to `'stream'` to create an audio stream.  On streams, `Sound:setFrames` will always write to the end of the stream, and `Sound:getFrames` will always read the oldest samples from the beginning.  The number of frames in the sound is the total capacity of the stream's buffer.
     * 
     * `sound = lovr.data.newSound(file, decode)`
     * 
     * Load a sound from a filename or Blob containing the data of an audio file.  Compressed audio formats (OGG, MP3) can optionally be decoded into raw sounds.
     * 
     * If you want to load a Blob containing raw audio samples, use the first variant of this function and pass the Blob as the `contents`.
     * 
     * @param file - A filename or Blob containing a sound file to load.
     * @param decode - Whether compressed audio files should be immediately decoded.
     * @returns Sounds good.
     * 
     * It is highly recommended to use an audio format that matches the format of the audio module: `f32` sample formats at a sample rate of 48000, with 1 channel for spatialized sources or 2 channels for unspatialized sources.  This will avoid the need to convert audio during playback, which boosts performance of the audio thread.
     * 
     * The WAV importer supports 16, 24, and 32 bit integer data and 32 bit floating point data.  The data must be mono, stereo, or 4-channel full-sphere ambisonic.  The `WAVE_FORMAT_EXTENSIBLE` extension is supported.
     * 
     * Ambisonic channel layouts are supported for import (but not yet for playback).  Ambisonic data can be loaded from WAV files.  It must be first-order full-sphere ambisonic data with 4 channels.  If the WAV has a `WAVE_FORMAT_EXTENSIBLE` chunk with an `AMBISONIC_B_FORMAT` format GUID, then the data is understood as using the AMB format with Furse-Malham channel ordering and normalization.  *All other* 4-channel files are assumed to be using the AmbiX format with ACN channel ordering and SN3D normalization.  AMB files will get automatically converted to AmbiX on import, so ambisonic Sounds will always be in a consistent format.
     * 
     * OGG and MP3 files will always have the `f32` format when loaded.
     */
    function newSound(file: string | Blob, decode?: boolean): Sound

  }

  namespace event {
    /**
     * Clears the event queue, removing any unprocessed events.
     * 
     * `lovr.event.clear()`
     */
    function clear(): void

    /**
     * This function returns a Lua iterator for all of the unprocessed items in the event queue.  Each event consists of a name as a string, followed by event-specific arguments.  This function is called in the default implementation of `lovr.run`, so it is normally not necessary to poll for events yourself.
     * 
     * `iterator = lovr.event.poll()`
     * 
     * @returns The iterator function, usable in a for loop.
     */
    function poll(): (this: void, ...args: any[]) => any

    /**
     * Pushes an event onto the event queue.  It will be processed the next time `lovr.event.poll` is called.  For an event to be processed properly, there needs to be a function in the `lovr.handlers` table with a key that's the same as the event name.
     * 
     * `lovr.event.push(name, ...)`
     * 
     * @param name - The name of the event.
     * @param ... - The arguments for the event.  Currently, up to 4 are supported.
     * 
     * Arguments can be nil, booleans, numbers, strings, lightuserdata, vectors, tables, and LÖVR objects.
     */
    function push(name: string, ...rest: any[]): void

    /**
     * Pushes an event to quit.  An optional number can be passed to set the exit code for the application.  An exit code of zero indicates normal termination, whereas a nonzero exit code indicates that an error occurred.
     * 
     * `lovr.event.quit(code)`
     * 
     * @param code - The exit code of the program.
     * 
     * This function is equivalent to calling `lovr.event.push('quit', code)`.
     * 
     * The event won't be processed until the next time `lovr.event.poll` is called.
     * 
     * The `lovr.quit` callback will be called when the event is processed, which can be used to do any cleanup work.  The callback can also return `false` to abort the quitting process.
     */
    function quit(code?: number): void

    /**
     * Pushes an event to restart the framework.
     * 
     * `lovr.event.restart()`
     * 
     * The event won't be processed until the next time `lovr.event.poll` is called.
     * 
     * The `lovr.restart` callback can be used to persist a value between restarts.
     */
    function restart(): void

  }

  namespace filesystem {
    /**
     * Appends content to the end of a file.
     * 
     * `[success, error] = lovr.filesystem.append(filename, content)`
     * 
     * @param filename - The file to append to.
     * @param content - A string or Blob to append to the file.
     * @returns 
     * success - Whether the operation was successful.
     * error - The error message, or `nil` if there was no error.
     * 
     * If the file does not exist, it is created.
     */
    function append(filename: string, content: string | Blob): LuaMultiReturn<[success: boolean, error: string | undefined]>

    /**
     * Creates a directory in the save directory.  Also creates any intermediate directories that don't exist.
     * 
     * `[success, error] = lovr.filesystem.createDirectory(path)`
     * 
     * @param path - The directory to create, recursively.
     * @returns 
     * success - Whether the directory was created.
     * error - The error message.
     */
    function createDirectory(path: string): LuaMultiReturn<[success: boolean, error: string | undefined]>

    /**
     * Returns the application data directory.  This will be something like:
     * 
     * - `C:\Users\user\AppData\Roaming` on Windows.
     * - `/home/user/.config` on Linux.
     * - `/Users/user/Library/Application Support` on macOS.
     * 
     * `path = lovr.filesystem.getAppdataDirectory()`
     * 
     * @returns The absolute path to the appdata directory.
     */
    function getAppdataDirectory(): string | undefined

    /**
     * Returns a sorted table containing all files and folders in a single directory.
     * 
     * `items = lovr.filesystem.getDirectoryItems(path)`
     * 
     * @param path - The directory.
     * @returns A table with a string for each file and subfolder in the directory.
     * 
     * This function calls `table.sort` to sort the results, so if `table.sort` is not available in the global scope the results are not guaranteed to be sorted.
     */
    function getDirectoryItems(path: string): string[]

    /**
     * Returns the absolute path of the LÖVR executable.
     * 
     * `path = lovr.filesystem.getExecutablePath()`
     * 
     * @returns The absolute path of the LÖVR executable, or `nil` if it is unknown.
     */
    function getExecutablePath(): string | undefined

    /**
     * Returns the identity of the game, which is used as the name of the save directory.  The default is `default`.  It can be changed using `t.identity` in `lovr.conf`.
     * 
     * `identity = lovr.filesystem.getIdentity()`
     * 
     * @returns The name of the save directory, or `nil` if it isn't set.
     * 
     * On Android, this is always the package id (like `org.lovr.app`).
     */
    function getIdentity(): string | undefined

    /**
     * Returns when a file was last modified, since some arbitrary time in the past.
     * 
     * `[time, error] = lovr.filesystem.getLastModified(path)`
     * 
     * @param path - The file to check.
     * @returns 
     * time - The modification time of the file, in seconds, or `nil` if there was an error.
     * error - The error message, if there was an error.
     */
    function getLastModified(path: string): LuaMultiReturn<[time: number | undefined, error: string | undefined]>

    /**
     * Get the absolute path of the mounted archive containing a path in the virtual filesystem.  This can be used to determine if a file is in the game's source directory or the save directory.
     * 
     * `realpath = lovr.filesystem.getRealDirectory(path)`
     * 
     * @param path - The path to check.
     * @returns The absolute path of the mounted archive containing `path`, or `nil` if the file is not in the virtual filesystem.
     */
    function getRealDirectory(path: string): string | undefined

    /**
     * Returns the require path.  The require path is a semicolon-separated list of patterns that LÖVR will use to search for files when they are `require`d.  Any question marks in the pattern will be replaced with the module that is being required.  It is similar to Lua\'s `package.path` variable, but the main difference is that the patterns are relative to the virtual filesystem.
     * 
     * `path = lovr.filesystem.getRequirePath()`
     * 
     * @returns The semicolon separated list of search patterns.
     * 
     * The default reqiure path is '?.lua;?/init.lua'.
     */
    function getRequirePath(): string

    /**
     * Returns the absolute path to the save directory.
     * 
     * `path = lovr.filesystem.getSaveDirectory()`
     * 
     * @returns The absolute path to the save directory.
     * 
     * The save directory takes the following form:
     * 
     *     <appdata>/LOVR/<identity>
     * 
     * Where `<appdata>` is `lovr.filesystem.getAppdataDirectory` and `<identity>` is `lovr.filesystem.getIdentity` and can be customized using `lovr.conf`.
     */
    function getSaveDirectory(): string

    /**
     * Returns the size of a file, in bytes.
     * 
     * `[size, error] = lovr.filesystem.getSize(file)`
     * 
     * @param file - The file.
     * @returns 
     * size - The size of the file, in bytes, or `nil` if there was an error.
     * error - The error message, if the operation was not successful.
     * 
     * If the file does not exist, an error is thrown.
     */
    function getSize(file: string): LuaMultiReturn<[size: number | undefined, error: string | undefined]>

    /**
     * Get the absolute path of the project's source directory or archive.
     * 
     * `path = lovr.filesystem.getSource()`
     * 
     * @returns The absolute path of the project's source, or `nil` if it's unknown.
     */
    function getSource(): string | undefined

    /**
     * Returns the absolute path of the user's home directory.
     * 
     * `path = lovr.filesystem.getUserDirectory()`
     * 
     * @returns The absolute path of the user's home directory.
     */
    function getUserDirectory(): string | undefined

    /**
     * Returns the absolute path of the working directory.  Usually this is where the executable was started from.
     * 
     * `path = lovr.filesystem.getWorkingDirectory()`
     * 
     * @returns The current working directory, or `nil` if it's unknown.
     */
    function getWorkingDirectory(): string | undefined

    /**
     * Check if a path exists and is a directory.
     * 
     * `isDirectory = lovr.filesystem.isDirectory(path)`
     * 
     * @param path - The path to check.
     * @returns Whether or not the path is a directory.
     */
    function isDirectory(path: string): boolean

    /**
     * Check if a path exists and is a file.
     * 
     * `isFile = lovr.filesystem.isFile(path)`
     * 
     * @param path - The path to check.
     * @returns Whether or not the path is a file.
     */
    function isFile(path: string): boolean

    /**
     * Returns whether the current project source is fused to the executable.
     * 
     * `fused = lovr.filesystem.isFused()`
     * 
     * @returns Whether or not the project is fused.
     */
    function isFused(): boolean

    /**
     * Load a file containing Lua code, returning a Lua chunk that can be run.
     * 
     * `chunk = lovr.filesystem.load(filename, mode)`
     * 
     * @param filename - The file to load.
     * @param mode - The type of code that can be loaded.  `t` allows text, `b` allows binary, and `bt` allows both.
     * @returns The runnable chunk.
     * 
     * An error is thrown if the file contains syntax errors.
     */
    function load(filename: string, mode?: string): (this: void, ...args: any[]) => any

    /**
     * Mounts a directory or `.zip` archive, adding it to the virtual filesystem.  This allows you to read files from it.
     * 
     * `[success, error] = lovr.filesystem.mount(path, mountpoint, append, root)`
     * 
     * @param path - The path to mount.
     * @param mountpoint - The path in the virtual filesystem to mount to.
     * @param append - Whether the archive will be added to the end or the beginning of the search path.
     * @param root - A subdirectory inside the archive to use as the root.  If `nil`, the actual root of the archive is used.
     * @returns 
     * success - Whether the archive was successfully mounted.
     * error - The error message, if the archive failed to mount.
     * 
     * The `append` option lets you control the priority of the archive's files in the event of naming collisions.
     * 
     * This function is not thread safe.  Mounting or unmounting an archive while other threads call lovr.filesystem functions is not supported.
     */
    function mount(path: string, mountpoint?: string, append?: boolean, root?: string): LuaMultiReturn<[success: boolean, error: string | undefined]>

    /**
     * Creates a new Blob that contains the contents of a file.
     * 
     * `blob = lovr.filesystem.newBlob(filename)`
     * 
     * @param filename - The file to load.
     * @returns The new Blob.
     */
    function newBlob(filename: string): Blob

    /**
     * Opens a file, returning a `File` object that can be used to read/write the file contents.
     * 
     * Normally you can just use `lovr.filesystem.read`, `lovr.filesystem.write`, etc.  However, those methods open and close the file each time they are called.  So, when performing multiple operations on a file, creating a File object and keeping it open will have less overhead.
     * 
     * `[file, error] = lovr.filesystem.newFile(path, mode)`
     * 
     * @param path - The path of the file to open.
     * @param mode - The mode to open the file in (`r`, `w`, or `a`).
     * @returns 
     * file - A new file object, or nil if an error occurred.
     * error - The error message, if an error occurred.
     */
    function newFile(path: string, mode: OpenMode): LuaMultiReturn<[file: File, error: string]>

    /**
     * Read the contents of a file.
     * 
     * `[contents, error] = lovr.filesystem.read(filename)`
     * 
     * @param filename - The name of the file to read.
     * @returns 
     * contents - The contents of the file, or nil if the file could not be read.
     * error - The error message, if any.
     */
    function read(filename: string): LuaMultiReturn<[contents: string | undefined, error: string | undefined]>

    /**
     * Remove a file or directory in the save directory.
     * 
     * `[success, error] = lovr.filesystem.remove(path)`
     * 
     * @param path - The file or directory to remove.
     * @returns 
     * success - Whether the path was removed.
     * error - The error message, if any.
     * 
     * A directory can only be removed if it is empty.
     * 
     * To recursively remove a folder, use this function with `lovr.filesystem.getDirectoryItems`.
     */
    function remove(path: string): LuaMultiReturn<[success: boolean, error: string | undefined]>

    /**
     * Set the name of the save directory.  This function can only be called once and is called automatically at startup, so this function normally isn't called manually.  However, the identity can be changed by setting the `t.identity` option in `lovr.conf`.
     * 
     * `lovr.filesystem.setIdentity(identity)`
     * 
     * @param identity - The name of the save directory.
     */
    function setIdentity(identity: string): void

    /**
     * Sets the require path.  The require path is a semicolon-separated list of patterns that LÖVR will use to search for files when they are `require`d.  Any question marks in the pattern will be replaced with the module that is being required.  It is similar to Lua\'s `package.path` variable, except the patterns will be checked using `lovr.filesystem` APIs. This allows `require` to work even when the project is packaged into a zip archive, or when the project is launched from a different directory.
     * 
     * `lovr.filesystem.setRequirePath(path)`
     * 
     * @param path - An optional semicolon separated list of search patterns.
     * 
     * The default reqiure path is '?.lua;?/init.lua'.
     */
    function setRequirePath(path?: string): void

    /**
     * Unmounts a directory or archive previously mounted with `lovr.filesystem.mount`.
     * 
     * `success = lovr.filesystem.unmount(path)`
     * 
     * @param path - The path to unmount.
     * @returns Whether the archive was unmounted.
     * 
     * This function is not thread safe.  Mounting or unmounting an archive while other threads call lovr.filesystem functions is not supported.
     */
    function unmount(path: string): boolean

    /**
     * Stops watching files.
     * 
     * `lovr.filesystem.unwatch()`
     */
    function unwatch(): void

    /**
     * Starts watching the filesystem for changes.  File events will be reported by the `lovr.filechanged` callback.
     * 
     * Currently, on PC, only files in the source directory will be watched.  On Android, files in the save directory will be watched instead, so that pushing new files with `adb` can be detected.
     * 
     * `lovr.filesystem.watch()`
     */
    function watch(): void

    /**
     * Write to a file in the save directory.
     * 
     * `[success, error] = lovr.filesystem.write(filename, content)`
     * 
     * @param filename - The file to write to.
     * @param content - A string or Blob to write to the file.
     * @returns 
     * success - Whether the write was successful.
     * error - The error message, if there was an error.
     * 
     * If the file does not exist, it is created.
     * 
     * If the file already has data in it, it will be replaced with the new content.
     * 
     * If the path contains subdirectories, all of the parent directories need to exist first or the write will fail.  Use `lovr.filesystem.createDirectory` to make sure they're created first.
     */
    function write(filename: string, content: string | Blob): LuaMultiReturn<[success: boolean, error: string]>

  }

  namespace graphics {
    /**
     * Compiles shader code to SPIR-V bytecode.  The bytecode can be passed to `lovr.graphics.newShader` to create shaders, which will be faster than creating it from GLSL. The bytecode is portable, so bytecode compiled on one platform will work on other platforms. This allows shaders to be precompiled in a build step.
     * 
     * `bytecode = lovr.graphics.compileShader(stage, source)`
     * 
     * @param stage - The type of shader to compile.
     * @param source - A string, filename, or Blob with shader code.
     * @returns A Blob containing compiled SPIR-V code.
     * 
     * The input can be GLSL or SPIR-V.  If it's SPIR-V, it will be returned unchanged as a Blob.
     * 
     * If the shader fails to compile, an error will be thrown with the error message.
     */
    function compileShader(stage: ShaderStage, source: string | Blob): Blob

    /**
     * Returns the global background color.  The textures in a render pass will be cleared to this color at the beginning of the pass if no other clear option is specified.  Additionally, the headset and window will be cleared to this color before rendering.
     * 
     * `[r, g, b, a] = lovr.graphics.getBackgroundColor()`
     * 
     * @returns 
     * r - The red component of the background color.
     * g - The green component of the background color.
     * b - The blue component of the background color.
     * a - The alpha component of the background color.
     * 
     * Setting the background color in `lovr.draw` will apply on the following frame, since the default pass is cleared before `lovr.draw` is called.
     * 
     * Internally, this color is applied to the default pass objects when retrieving one of them using `lovr.headset.getPass` or `lovr.graphics.getWindowPass`.  Both are called automatically by the default `lovr.run` implementation.
     * 
     * Using the background color to clear the display is expected to be more efficient than manually clearing after a render pass begins, especially on mobile GPUs.
     */
    function getBackgroundColor(): LuaMultiReturn<[r: number, g: number, b: number, a: number]>

    /**
     * Returns the default Font.  The default font is Varela Round, created at 32px with a spread value of `4.0`.  It's used by `Pass:text` if no Font is provided.
     * 
     * `font = lovr.graphics.getDefaultFont()`
     * 
     * @returns The default Font object.
     */
    function getDefaultFont(): Font

    /**
     * Returns information about the graphics device and driver.
     * 
     * `device = lovr.graphics.getDevice()`
     * 
     * @returns 
     * 
     * The device and vendor ID numbers will usually be PCI IDs, which are standardized numbers consisting of 4 hex digits.  Various online databases and system utilities can be used to look up these numbers.  Here are some example vendor IDs for a few popular GPU manufacturers:
     * 
     * <table>
     *   <thead>
     *     <tr>
     *       <td>ID</td>
     *       <td>Vendor</td>
     *     </tr>
     *   </thead>
     *   <tbody>
     *     <tr>
     *       <td><code>0x1002</code></td>
     *       <td>Advanced Micro Devices, Inc.</td>
     *     </tr>
     *     <tr>
     *       <td><code>0x8086</code></td>
     *       <td>Intel Corporation</td>
     *     </tr>
     *     <tr>
     *       <td><code>0x10de</code></td>
     *       <td>NVIDIA Corporation</td>
     *     </tr>
     *   </tbody> </table>
     * 
     * It is not currently possible to get the version of the driver, although this could be added.
     * 
     * Regarding multiple GPUs: If OpenXR is enabled, the OpenXR runtime has control over which GPU is used, which ensures best compatibility with the VR headset.  Otherwise, the "first" GPU returned by the renderer will be used.  There is currently no other way to pick a GPU to use.
     */
    function getDevice(): LuaTable

    /**
     * Returns a table indicating which features are supported by the GPU.
     * 
     * `features = lovr.graphics.getFeatures()`
     * 
     * @returns 
     */
    function getFeatures(): LuaTable

    /**
     * Returns limits of the current GPU.
     * 
     * `limits = lovr.graphics.getLimits()`
     * 
     * @returns 
     * 
     * The limit ranges are as follows:
     * 
     * <table>
     *   <thead>
     *     <tr>
     *       <td>Limit</td>
     *       <td>Minimum</td>
     *       <td>Maximum</td>
     *     </tr>
     *   </thead>
     *   <tbody>
     *     <tr>
     *       <td><code>textureSize2D</code></td>
     *       <td>4096</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>textureSize3D</code></td>
     *       <td>256</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>textureSizeCube</code></td>
     *       <td>4096</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>textureLayers</code></td>
     *       <td>256</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>renderSize</code></td>
     *       <td>{ 4096, 4096, 6 }</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>uniformBuffersPerStage</code></td>
     *       <td>9</td>
     *       <td>32*</td>
     *     </tr>
     *     <tr>
     *       <td><code>storageBuffersPerStage</code></td>
     *       <td>4</td>
     *       <td>32*</td>
     *     </tr>
     *     <tr>
     *       <td><code>sampledTexturesPerStage</code></td>
     *       <td>32</td>
     *       <td>32*</td>
     *     </tr>
     *     <tr>
     *       <td><code>storageTexturesPerStage</code></td>
     *       <td>4</td>
     *       <td>32*</td>
     *     </tr>
     *     <tr>
     *       <td><code>samplersPerStage</code></td>
     *       <td>15</td>
     *       <td>32*</td>
     *     </tr>
     *     <tr>
     *       <td><code>resourcesPerShader</code></td>
     *       <td>32</td>
     *       <td>32*</td>
     *     </tr>
     *     <tr>
     *       <td><code>uniformBufferRange</code></td>
     *       <td>65536</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>storageBufferRange</code></td>
     *       <td>134217728 (128MB)</td>
     *       <td>1073741824 (1GB)*</td>
     *     </tr>
     *     <tr>
     *       <td><code>uniformBufferAlign</code></td>
     *       <td></td>
     *       <td>256</td>
     *     </tr>
     *     <tr>
     *       <td><code>storageBufferAlign</code></td>
     *       <td></td>
     *       <td>64</td>
     *     </tr>
     *     <tr>
     *       <td><code>vertexAttributes</code></td>
     *       <td>16</td>
     *       <td>16*</td>
     *     </tr>
     *     <tr>
     *       <td><code>vertexBufferStride</code></td>
     *       <td>2048</td>
     *       <td>65535*</td>
     *     </tr>
     *     <tr>
     *       <td><code>vertexShaderOutputs</code></td>
     *       <td>64</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>clipDistances</code></td>
     *       <td>0</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>cullDistances</code></td>
     *       <td>0</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>clipAndCullDistances</code></td>
     *       <td>0</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>computeDispatchCount</code></td>
     *       <td>{ 65536, 65536, 65536 }</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>computeWorkgroupSize</code></td>
     *       <td>{ 128, 128, 64 }</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>computeWorkgroupVolume</code></td>
     *       <td>128</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>computeSharedMemory</code></td>
     *       <td>16384 (16KB)</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>pushConstantSize</code></td>
     *       <td>128</td>
     *       <td>256*</td>
     *     </tr>
     *     <tr>
     *       <td><code>indirectDrawCount</code></td>
     *       <td>1</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>instances</code></td>
     *       <td>134217727</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>anisotropy</code></td>
     *       <td>0.0</td>
     *       <td></td>
     *     </tr>
     *     <tr>
     *       <td><code>pointSize</code></td>
     *       <td>1.0</td>
     *       <td></td>
     *     </tr>
     *   </tbody> </table>
     * 
     * Note: in the table above, `*` means that LÖVR itself is imposing a cap on the limit, instead of the GPU.
     */
    function getLimits(): LuaTable

    /**
     * Returns the window pass.  This is a builtin render `Pass` object that renders to the desktop window texture.  If the desktop window was not open when the graphics module was initialized, this function will return `nil`.
     * 
     * `pass = lovr.graphics.getWindowPass()`
     * 
     * @returns The window pass, or `nil` if there is no window.
     * 
     * `lovr.conf` may be used to change the settings for the pass:  `t.graphics.antialias` enables antialiasing, and `t.graphics.stencil` enables the stencil buffer.
     * 
     * This pass clears the window texture to the background color, which can be changed using `lovr.graphics.setBackgroundColor`.
     */
    function getWindowPass(): Pass | undefined

    /**
     * Returns the type of operations the GPU supports for a texture format, if any.
     * 
     * `[linear, srgb] = lovr.graphics.isFormatSupported(format, ...features)`
     * 
     * @param format - The texture format to query.
     * @param ...features - Zero or more features to check.  If no features are given, this function will return whether the GPU supports *any* feature for this format.  Otherwise, this function will only return true if *all* of the input features are supported.
     * @returns 
     * linear - Whether the GPU supports these operations for textures with this format, when created with the `linear` flag set to `true`.
     * srgb - Whether the GPU supports these operations for textures with this format, when created with the `linear` flag set to `false`.
     */
    function isFormatSupported(format: TextureFormat, ...features: TextureFeature[]): LuaMultiReturn<[linear: boolean, srgb: boolean]>

    /**
     * Returns whether the **super experimental** HDR mode is active.
     * 
     * To enable HDR, add `t.graphics.hdr` to `lovr.conf`.  When enabled, LÖVR will try to create an HDR10 window.  If the GPU supports it, then this function will return true and the window texture will be HDR:
     * 
     * - Its format will be `rgb10a2` instead of `rgba8`.
     * - The display will assume its colors are in the Rec.2020 color space, instead of sRGB.
     * - The display will assume its colors are encoded with the PQ transfer function, instead of sRGB.
     * 
     * For now, it's up to you to write PQ-encoded Rec.2020 color data from your shader when rendering to the window.
     * 
     * `hdr = lovr.graphics.isHDR()`
     * 
     * @returns Whether HDR is enabled.
     * 
     * The following shader helper functions make it easier to convert between sRGB colors and HDR10:
     * 
     *     vec3 pqToLinear(vec3 color);
     *     vec3 linearToPQ(vec3 color);
     *     vec3 sRGBToRec2020(vec3 color);
     *     vec3 rec2020ToSRGB(vec3 color);
     */
    function isHDR(): boolean

    /**
     * Returns whether timing stats are enabled.  When enabled, `Pass:getStats` will return `submitTime` and `gpuTime` durations.  Timing is enabled by default when `t.graphics.debug` is set in `lovr.conf`.  Timing has a small amount of overhead, so it should only be enabled when needed.
     * 
     * `enabled = lovr.graphics.isTimingEnabled()`
     * 
     * @returns Whether timing is enabled.
     */
    function isTimingEnabled(): boolean

    /**
     * Creates a Buffer.
     * 
     * `buffer = lovr.graphics.newBuffer(size)`
     * 
     * @param size - The size of the Buffer, in bytes.
     * @returns The new Buffer.
     * 
     * The format table can contain a list of `DataType`s or a list of tables to provide extra information about each field.  Each inner table has the following keys:
     * 
     * - `type` is the `DataType` of the field and is required.
     * - `name` is the name of the field.  The field name is used to match table keys up to buffer
     *   fields when writing table data to the Buffer, and is also used to match up buffer fields with
     *   vertex attribute names declared in a `Shader`.  LÖVR has a set of <a
     *   href="Shaders#vertex-attributes">default vertex attributes</a> that shaders will automatically
     *   use, allowing you to create a custom mesh without having to write shader code or add custom
     *   vertex attributes in a shader.
     * - `offset` is the byte offset of the field.  Any fields with a `nil` offset will be placed next
     *   to each other sequentially in memory, subject to any padding required by the Buffer's layout.
     *   In practice this means that you probably want to provide an `offset` for either all of the
     *   fields or none of them.
     * - `length` is the array size of the field (optional, leave as `nil` for non-arrays).
     * - `stride` is the number of bytes between each item in an array (optional).
     * 
     * As a shorthand, the name, type, and optionally the length of a field can be provided as a list instead of using keys.
     * 
     * If no table or Blob is used to define the initial Buffer contents, its data will be undefined.
     */
    function newBuffer(size: number): Buffer

    /**
     * Creates a Buffer.
     * 
     * `buffer = lovr.graphics.newBuffer(blob)`
     * 
     * @param blob - A Blob with the initial contents of the Buffer.
     * @returns The new Buffer.
     * 
     * The format table can contain a list of `DataType`s or a list of tables to provide extra information about each field.  Each inner table has the following keys:
     * 
     * - `type` is the `DataType` of the field and is required.
     * - `name` is the name of the field.  The field name is used to match table keys up to buffer
     *   fields when writing table data to the Buffer, and is also used to match up buffer fields with
     *   vertex attribute names declared in a `Shader`.  LÖVR has a set of <a
     *   href="Shaders#vertex-attributes">default vertex attributes</a> that shaders will automatically
     *   use, allowing you to create a custom mesh without having to write shader code or add custom
     *   vertex attributes in a shader.
     * - `offset` is the byte offset of the field.  Any fields with a `nil` offset will be placed next
     *   to each other sequentially in memory, subject to any padding required by the Buffer's layout.
     *   In practice this means that you probably want to provide an `offset` for either all of the
     *   fields or none of them.
     * - `length` is the array size of the field (optional, leave as `nil` for non-arrays).
     * - `stride` is the number of bytes between each item in an array (optional).
     * 
     * As a shorthand, the name, type, and optionally the length of a field can be provided as a list instead of using keys.
     * 
     * If no table or Blob is used to define the initial Buffer contents, its data will be undefined.
     */
    function newBuffer(blob: Blob): Buffer

    /**
     * Creates a Buffer.
     * 
     * `buffer = lovr.graphics.newBuffer(format, length)`
     * 
     * @param format - A list of fields in the Buffer.  A `DataType` can also be used for buffers that are simple arrays.
     * @param length - The length of the Buffer.
     * @returns The new Buffer.
     * 
     * The format table can contain a list of `DataType`s or a list of tables to provide extra information about each field.  Each inner table has the following keys:
     * 
     * - `type` is the `DataType` of the field and is required.
     * - `name` is the name of the field.  The field name is used to match table keys up to buffer
     *   fields when writing table data to the Buffer, and is also used to match up buffer fields with
     *   vertex attribute names declared in a `Shader`.  LÖVR has a set of <a
     *   href="Shaders#vertex-attributes">default vertex attributes</a> that shaders will automatically
     *   use, allowing you to create a custom mesh without having to write shader code or add custom
     *   vertex attributes in a shader.
     * - `offset` is the byte offset of the field.  Any fields with a `nil` offset will be placed next
     *   to each other sequentially in memory, subject to any padding required by the Buffer's layout.
     *   In practice this means that you probably want to provide an `offset` for either all of the
     *   fields or none of them.
     * - `length` is the array size of the field (optional, leave as `nil` for non-arrays).
     * - `stride` is the number of bytes between each item in an array (optional).
     * 
     * As a shorthand, the name, type, and optionally the length of a field can be provided as a list instead of using keys.
     * 
     * If no table or Blob is used to define the initial Buffer contents, its data will be undefined.
     */
    function newBuffer(format: LuaTable | DataType, length?: number): Buffer

    /**
     * Creates a Buffer.
     * 
     * `buffer = lovr.graphics.newBuffer(format, data)`
     * 
     * @param format - A list of fields in the Buffer.  A `DataType` can also be used for buffers that are simple arrays.
     * @param data - The initial data to put into the Buffer.  The length of the Buffer will be determined by the length of the table or the size of the Blob, combined with the format information.
     * @returns The new Buffer.
     * 
     * The format table can contain a list of `DataType`s or a list of tables to provide extra information about each field.  Each inner table has the following keys:
     * 
     * - `type` is the `DataType` of the field and is required.
     * - `name` is the name of the field.  The field name is used to match table keys up to buffer
     *   fields when writing table data to the Buffer, and is also used to match up buffer fields with
     *   vertex attribute names declared in a `Shader`.  LÖVR has a set of <a
     *   href="Shaders#vertex-attributes">default vertex attributes</a> that shaders will automatically
     *   use, allowing you to create a custom mesh without having to write shader code or add custom
     *   vertex attributes in a shader.
     * - `offset` is the byte offset of the field.  Any fields with a `nil` offset will be placed next
     *   to each other sequentially in memory, subject to any padding required by the Buffer's layout.
     *   In practice this means that you probably want to provide an `offset` for either all of the
     *   fields or none of them.
     * - `length` is the array size of the field (optional, leave as `nil` for non-arrays).
     * - `stride` is the number of bytes between each item in an array (optional).
     * 
     * As a shorthand, the name, type, and optionally the length of a field can be provided as a list instead of using keys.
     * 
     * If no table or Blob is used to define the initial Buffer contents, its data will be undefined.
     */
    function newBuffer(format: LuaTable | DataType, data: LuaTable | Blob): Buffer

    /**
     * Creates a new Font.
     * 
     * `font = lovr.graphics.newFont(file, size, spread)`
     * 
     * Creates a new Font from a font file.
     * 
     * @param file - A filename or Blob containing a TTF or BMFont file.
     * @param size - The size of the Font in pixels (TTF only).  Larger sizes are slower to initialize and use more memory, but have better quality.
     * @param spread - For signed distance field fonts (currently all fonts), the width of the SDF, in pixels.  The greater the distance the font is viewed from, the larger this value needs to be for the font to remain properly antialiased.  Increasing this will have a performance penalty similar to increasing the size of the font.
     * @returns The new Font.
     */
    function newFont(file: string | Blob, size?: number, spread?: number): Font

    /**
     * Creates a new Font.
     * 
     * `font = lovr.graphics.newFont(size, spread)`
     * 
     * Creates a new Font using the default typeface (Varela Round).
     * 
     * @param size - The size of the Font in pixels (TTF only).  Larger sizes are slower to initialize and use more memory, but have better quality.
     * @param spread - For signed distance field fonts (currently all fonts), the width of the SDF, in pixels.  The greater the distance the font is viewed from, the larger this value needs to be for the font to remain properly antialiased.  Increasing this will have a performance penalty similar to increasing the size of the font.
     * @returns The new Font.
     */
    function newFont(size?: number, spread?: number): Font

    /**
     * Creates a new Font.
     * 
     * `font = lovr.graphics.newFont(rasterizer, spread)`
     * 
     * Creates a new Font from an existing Rasterizer.
     * 
     * @param rasterizer - An existing Rasterizer to use to load glyph images.
     * @param spread - For signed distance field fonts (currently all fonts), the width of the SDF, in pixels.  The greater the distance the font is viewed from, the larger this value needs to be for the font to remain properly antialiased.  Increasing this will have a performance penalty similar to increasing the size of the font.
     * @returns The new Font.
     */
    function newFont(rasterizer: Rasterizer, spread?: number): Font

    /**
     * Creates a new Material from a table of properties and textures.  All fields are optional.  Once a Material is created, its properties can not be changed.  Instead, a new Material should be created with the updated properties.
     * 
     * `material = lovr.graphics.newMaterial(properties)`
     * 
     * @param properties - Material properties.
     * @returns The new material.
     * 
     * The non-texture material properties can be accessed in shaders using `Material.<property>`, where the property is the same as the Lua table key.  The textures use capitalized names in shader code, e.g. `ColorTexture`.
     */
    function newMaterial(properties: { color?: vector, glow?: vector, uvShift?: vector, uvScale?: vector, metalness?: number, roughness?: number, clearcoat?: number, clearcoatRoughness?: number, occlusionStrength?: number, normalScale?: number, alphaCutoff?: number, texture: Texture, glowTexture: Texture, metalnessTexture: Texture, roughnessTexture: Texture, clearcoatTexture: Texture, occlusionTexture: Texture, normalTexture: Texture, }): Material

    /**
     * Creates a Mesh.  The capacity of the Mesh must be provided upfront, using either a vertex count or the vertex data itself.  A custom vertex format can be given to specify the set of attributes in each vertex, which get sent to the vertex shader.  If the format isn't given, the default vertex format will be used:
     * 
     *     {
     *       { 'VertexPosition', 'vec3' },
     *       { 'VertexNormal', 'vec3' },
     *       { 'VertexUV', 'vec2' }
     *     }
     * 
     * `mesh = lovr.graphics.newMesh(count, storage)`
     * 
     * @param count - The number of vertices in the Mesh.
     * @param storage - The storage mode of the Mesh.
     * @returns The new Mesh.
     * 
     * The Mesh will always use the `gpu` storage mode if it's created from a vertex buffer.
     */
    function newMesh(count: number, storage?: MeshStorage): Mesh

    /**
     * Creates a Mesh.  The capacity of the Mesh must be provided upfront, using either a vertex count or the vertex data itself.  A custom vertex format can be given to specify the set of attributes in each vertex, which get sent to the vertex shader.  If the format isn't given, the default vertex format will be used:
     * 
     *     {
     *       { 'VertexPosition', 'vec3' },
     *       { 'VertexNormal', 'vec3' },
     *       { 'VertexUV', 'vec2' }
     *     }
     * 
     * `mesh = lovr.graphics.newMesh(vertices, storage)`
     * 
     * @param vertices - A table of vertices, formatted according to the vertex format.  The length of the table will be used to set the vertex count of the Mesh.
     * @param storage - The storage mode of the Mesh.
     * @returns The new Mesh.
     * 
     * The Mesh will always use the `gpu` storage mode if it's created from a vertex buffer.
     */
    function newMesh(vertices: LuaTable, storage?: MeshStorage): Mesh

    /**
     * Creates a Mesh.  The capacity of the Mesh must be provided upfront, using either a vertex count or the vertex data itself.  A custom vertex format can be given to specify the set of attributes in each vertex, which get sent to the vertex shader.  If the format isn't given, the default vertex format will be used:
     * 
     *     {
     *       { 'VertexPosition', 'vec3' },
     *       { 'VertexNormal', 'vec3' },
     *       { 'VertexUV', 'vec2' }
     *     }
     * 
     * `mesh = lovr.graphics.newMesh(blob, storage)`
     * 
     * @param blob - A Blob containing vertex data, formatted according to the vertex format.  The size of the Blob will be used to set the vertex count of the Mesh, and must be a multiple of the vertex size.
     * @param storage - The storage mode of the Mesh.
     * @returns The new Mesh.
     * 
     * The Mesh will always use the `gpu` storage mode if it's created from a vertex buffer.
     */
    function newMesh(blob: Blob, storage?: MeshStorage): Mesh

    /**
     * Creates a Mesh.  The capacity of the Mesh must be provided upfront, using either a vertex count or the vertex data itself.  A custom vertex format can be given to specify the set of attributes in each vertex, which get sent to the vertex shader.  If the format isn't given, the default vertex format will be used:
     * 
     *     {
     *       { 'VertexPosition', 'vec3' },
     *       { 'VertexNormal', 'vec3' },
     *       { 'VertexUV', 'vec2' }
     *     }
     * 
     * `mesh = lovr.graphics.newMesh(format, count, storage)`
     * 
     * @param format - A table of attributes describing the format of each vertex.  Each attribute is a table that must have `name` and `type` keys, where the name is a string and the type is a `DataType`. Attributes can also have an `offset` key, which is a byte offset relative to the start of the vertex.  As a shorthand, the name and type can be given as a pair without keys. Additionally, the format can have a `stride` key to set the number of bytes between subsequent vertices.
     * @param count - The number of vertices in the Mesh.
     * @param storage - The storage mode of the Mesh.
     * @returns The new Mesh.
     * 
     * The Mesh will always use the `gpu` storage mode if it's created from a vertex buffer.
     */
    function newMesh(format: LuaTable, count: number, storage?: MeshStorage): Mesh

    /**
     * Creates a Mesh.  The capacity of the Mesh must be provided upfront, using either a vertex count or the vertex data itself.  A custom vertex format can be given to specify the set of attributes in each vertex, which get sent to the vertex shader.  If the format isn't given, the default vertex format will be used:
     * 
     *     {
     *       { 'VertexPosition', 'vec3' },
     *       { 'VertexNormal', 'vec3' },
     *       { 'VertexUV', 'vec2' }
     *     }
     * 
     * `mesh = lovr.graphics.newMesh(format, vertices, storage)`
     * 
     * @param format - A table of attributes describing the format of each vertex.  Each attribute is a table that must have `name` and `type` keys, where the name is a string and the type is a `DataType`. Attributes can also have an `offset` key, which is a byte offset relative to the start of the vertex.  As a shorthand, the name and type can be given as a pair without keys. Additionally, the format can have a `stride` key to set the number of bytes between subsequent vertices.
     * @param vertices - A table of vertices, formatted according to the vertex format.  The length of the table will be used to set the vertex count of the Mesh.
     * @param storage - The storage mode of the Mesh.
     * @returns The new Mesh.
     * 
     * The Mesh will always use the `gpu` storage mode if it's created from a vertex buffer.
     */
    function newMesh(format: LuaTable, vertices: LuaTable, storage?: MeshStorage): Mesh

    /**
     * Creates a Mesh.  The capacity of the Mesh must be provided upfront, using either a vertex count or the vertex data itself.  A custom vertex format can be given to specify the set of attributes in each vertex, which get sent to the vertex shader.  If the format isn't given, the default vertex format will be used:
     * 
     *     {
     *       { 'VertexPosition', 'vec3' },
     *       { 'VertexNormal', 'vec3' },
     *       { 'VertexUV', 'vec2' }
     *     }
     * 
     * `mesh = lovr.graphics.newMesh(format, blob, storage)`
     * 
     * @param format - A table of attributes describing the format of each vertex.  Each attribute is a table that must have `name` and `type` keys, where the name is a string and the type is a `DataType`. Attributes can also have an `offset` key, which is a byte offset relative to the start of the vertex.  As a shorthand, the name and type can be given as a pair without keys. Additionally, the format can have a `stride` key to set the number of bytes between subsequent vertices.
     * @param blob - A Blob containing vertex data, formatted according to the vertex format.  The size of the Blob will be used to set the vertex count of the Mesh, and must be a multiple of the vertex size.
     * @param storage - The storage mode of the Mesh.
     * @returns The new Mesh.
     * 
     * The Mesh will always use the `gpu` storage mode if it's created from a vertex buffer.
     */
    function newMesh(format: LuaTable, blob: Blob, storage?: MeshStorage): Mesh

    /**
     * Creates a Mesh.  The capacity of the Mesh must be provided upfront, using either a vertex count or the vertex data itself.  A custom vertex format can be given to specify the set of attributes in each vertex, which get sent to the vertex shader.  If the format isn't given, the default vertex format will be used:
     * 
     *     {
     *       { 'VertexPosition', 'vec3' },
     *       { 'VertexNormal', 'vec3' },
     *       { 'VertexUV', 'vec2' }
     *     }
     * 
     * `mesh = lovr.graphics.newMesh(buffer)`
     * 
     * @param buffer - A Buffer containing vertex data.  Its length will be used as the vertex count, and its format will be used as the vertex format.
     * @returns The new Mesh.
     * 
     * The Mesh will always use the `gpu` storage mode if it's created from a vertex buffer.
     */
    function newMesh(buffer: Buffer): Mesh

    /**
     * Loads a 3D model from a file.  Currently, OBJ, glTF, and binary STL files are supported.
     * 
     * `model = lovr.graphics.newModel(file, options)`
     * 
     * @param file - A filename or Blob containing 3D model data to import.
     * @param options - An optional table of Model options.
     * @returns The new Model.
     * 
     * Currently, the following features are not supported by the model importer:
     * 
     * - glTF: Only the default scene is loaded.
     * - glTF: Currently, each skin in a Model can have up to 256 joints.
     * - glTF: Meshes can't appear multiple times in the node hierarchy with different skins, they need
     *   to use 1 skin consistently.
     * - glTF: `KHR_texture_transform` is supported, but all textures in a material will use the same
     *   transform.
     * - STL: ASCII STL files are not supported.
     * 
     * Diffuse and emissive textures will be loaded using sRGB encoding, all other textures will be loaded as linear.
     * 
     * Loading a model file will fail if the asset references textures or other files using absolute paths.  Relative paths should be used instead, and will be relative to the model file within the virtual filesystem.
     */
    function newModel(file: string | Blob, options?: { mipmaps?: boolean, materials?: boolean, }): Model

    /**
     * Loads a 3D model from a file.  Currently, OBJ, glTF, and binary STL files are supported.
     * 
     * `model = lovr.graphics.newModel(modelData, options)`
     * 
     * @param modelData - An existing ModelData object to use for the Model.
     * @param options - An optional table of Model options.
     * @returns The new Model.
     * 
     * Currently, the following features are not supported by the model importer:
     * 
     * - glTF: Only the default scene is loaded.
     * - glTF: Currently, each skin in a Model can have up to 256 joints.
     * - glTF: Meshes can't appear multiple times in the node hierarchy with different skins, they need
     *   to use 1 skin consistently.
     * - glTF: `KHR_texture_transform` is supported, but all textures in a material will use the same
     *   transform.
     * - STL: ASCII STL files are not supported.
     * 
     * Diffuse and emissive textures will be loaded using sRGB encoding, all other textures will be loaded as linear.
     * 
     * Loading a model file will fail if the asset references textures or other files using absolute paths.  Relative paths should be used instead, and will be relative to the model file within the virtual filesystem.
     */
    function newModel(modelData: ModelData, options?: { mipmaps?: boolean, materials?: boolean, }): Model

    /**
     * Creates and returns a new Pass object.  The canvas (the set of textures the Pass renders to) can be specified when creating the Pass, or later using `Pass:setCanvas`.
     * 
     * `pass = lovr.graphics.newPass(...textures)`
     * 
     * Create a pass that renders to a set of textures.
     * 
     * @param ...textures - One or more textures the pass will render to.  This can be changed later using `Pass:setCanvas`.
     * @returns The new Pass.
     * 
     * Fun facts about render passes:
     * 
     * - Textures must have been created with the `render` `TextureUsage`.
     * - Textures must have the same dimensions, layer counts, and sample counts.
     * - When rendering to textures with multiple layers, each draw will be broadcast to all layers.
     *   Render passes have multiple "views" (cameras), and each layer uses a corresponding view,
     *   allowing each layer to be rendered from a different viewpoint.  This enables fast stereo
     *   rendering, but can also be used to efficiently render to cubemaps.  The `ViewIndex` variable
     *   can also be used in shaders to set up any desired per-view behavior.
     * - Mipmaps will automatically be generated for textures at the end of the render pass.
     * - It's okay to have zero color textures, but in this case there must be a depth texture.
     * - It's possible to render to a specific mipmap level of a Texture, or a subset of its layers, by
     *   rendering to texture views, see `lovr.graphics.newTextureView`.
     */
    function newPass(...textures: Texture[]): Pass

    /**
     * Creates and returns a new Pass object.  The canvas (the set of textures the Pass renders to) can be specified when creating the Pass, or later using `Pass:setCanvas`.
     * 
     * `pass = lovr.graphics.newPass(canvas)`
     * 
     * Create a pass, with extra canvas settings.
     * 
     * @param canvas - Render target configuration.  Up to 4 textures can be provided in table keys 1 through 4, as well as the following keys:
     * @returns The new Pass.
     * 
     * Fun facts about render passes:
     * 
     * - Textures must have been created with the `render` `TextureUsage`.
     * - Textures must have the same dimensions, layer counts, and sample counts.
     * - When rendering to textures with multiple layers, each draw will be broadcast to all layers.
     *   Render passes have multiple "views" (cameras), and each layer uses a corresponding view,
     *   allowing each layer to be rendered from a different viewpoint.  This enables fast stereo
     *   rendering, but can also be used to efficiently render to cubemaps.  The `ViewIndex` variable
     *   can also be used in shaders to set up any desired per-view behavior.
     * - Mipmaps will automatically be generated for textures at the end of the render pass.
     * - It's okay to have zero color textures, but in this case there must be a depth texture.
     * - It's possible to render to a specific mipmap level of a Texture, or a subset of its layers, by
     *   rendering to texture views, see `lovr.graphics.newTextureView`.
     */
    function newPass(canvas: { depth: { format?: TextureFormat, texture: Texture, }, samples?: number, }): Pass

    /**
     * Creates and returns a new Pass object.  The canvas (the set of textures the Pass renders to) can be specified when creating the Pass, or later using `Pass:setCanvas`.
     * 
     * `pass = lovr.graphics.newPass()`
     * 
     * Create an empty Pass without a canvas.
     * 
     * @returns The new Pass.
     * 
     * Fun facts about render passes:
     * 
     * - Textures must have been created with the `render` `TextureUsage`.
     * - Textures must have the same dimensions, layer counts, and sample counts.
     * - When rendering to textures with multiple layers, each draw will be broadcast to all layers.
     *   Render passes have multiple "views" (cameras), and each layer uses a corresponding view,
     *   allowing each layer to be rendered from a different viewpoint.  This enables fast stereo
     *   rendering, but can also be used to efficiently render to cubemaps.  The `ViewIndex` variable
     *   can also be used in shaders to set up any desired per-view behavior.
     * - Mipmaps will automatically be generated for textures at the end of the render pass.
     * - It's okay to have zero color textures, but in this case there must be a depth texture.
     * - It's possible to render to a specific mipmap level of a Texture, or a subset of its layers, by
     *   rendering to texture views, see `lovr.graphics.newTextureView`.
     */
    function newPass(): Pass

    /**
     * Creates a new Sampler.  Samplers are immutable, meaning their parameters can not be changed after the sampler is created.  Instead, a new sampler should be created with the updated properties.
     * 
     * `sampler = lovr.graphics.newSampler(parameters)`
     * 
     * @param parameters - Parameters for the sampler.
     * @returns The new sampler.
     */
    function newSampler(parameters: { filter?: { [1]: FilterMode, [2]: FilterMode, [3]: FilterMode, }, wrap?: { [1]: WrapMode, [2]: WrapMode, [3]: WrapMode, }, compare?: CompareMode, anisotropy?: number, mipmaprange: LuaTable, }): Sampler

    /**
     * Creates a Shader, which is a small program that runs on the GPU.
     * 
     * Shader code is usually written in GLSL and compiled to SPIR-V bytecode.  SPIR-V is faster to load but requires a build step.  Either form can be used to create a shader.
     * 
     * By default, the provided shader code is expected to implement a `vec4 lovrmain() { ... }` function that is called for each vertex or fragment.  If the `raw` option is set to `true`, the code is treated as a raw shader and the `lovrmain` function is not required. In this case, the shader code is expected to implement its own `main` function.
     * 
     * `shader = lovr.graphics.newShader(vertex, fragment, options)`
     * 
     * Create a graphics shader.  It has a vertex stage that computes vertex positions, and a fragment stage that computes pixel colors.
     * 
     * @param vertex - A string, path to a file, or Blob containing GLSL or SPIR-V code for the vertex stage.  Can also be a `DefaultShader` to use that shader's vertex code.
     * @param fragment - A string, path to a file, or Blob containing GLSL or SPIR-V code for the fragment stage. Can also be a `DefaultShader` to use that shader's fragment code.
     * @param options - An optional table of Shader options.
     * @returns The new shader.
     */
    function newShader(vertex: string | DefaultShader | Blob, fragment: string | DefaultShader | Blob, options?: { flags: LuaTable, label: string, raw: boolean, }): Shader

    /**
     * Creates a Shader, which is a small program that runs on the GPU.
     * 
     * Shader code is usually written in GLSL and compiled to SPIR-V bytecode.  SPIR-V is faster to load but requires a build step.  Either form can be used to create a shader.
     * 
     * By default, the provided shader code is expected to implement a `vec4 lovrmain() { ... }` function that is called for each vertex or fragment.  If the `raw` option is set to `true`, the code is treated as a raw shader and the `lovrmain` function is not required. In this case, the shader code is expected to implement its own `main` function.
     * 
     * `shader = lovr.graphics.newShader(compute, options)`
     * 
     * Create a compute shader.
     * 
     * @param compute - A string, path to a file, or Blob containing GLSL or SPIR-V code for the compute stage.
     * @param options - An optional table of Shader options.
     * @returns The new shader.
     */
    function newShader(compute: string | Blob, options?: { flags: LuaTable, label: string, raw: boolean, }): Shader

    /**
     * Creates a Shader, which is a small program that runs on the GPU.
     * 
     * Shader code is usually written in GLSL and compiled to SPIR-V bytecode.  SPIR-V is faster to load but requires a build step.  Either form can be used to create a shader.
     * 
     * By default, the provided shader code is expected to implement a `vec4 lovrmain() { ... }` function that is called for each vertex or fragment.  If the `raw` option is set to `true`, the code is treated as a raw shader and the `lovrmain` function is not required. In this case, the shader code is expected to implement its own `main` function.
     * 
     * `shader = lovr.graphics.newShader(defaultshader, options)`
     * 
     * Create a copy of one of the default shaders (used to provide different flags).
     * 
     * @param defaultshader - One of the default shaders to use.
     * @param options - An optional table of Shader options.
     * @returns The new shader.
     */
    function newShader(defaultshader: DefaultShader, options?: { flags: LuaTable, label: string, raw: boolean, }): Shader

    /**
     * Creates a new Texture.  Image filenames or `Image` objects can be used to provide the initial pixel data and the dimensions, format, and type.  Alternatively, dimensions can be provided, which will create an empty texture.
     * 
     * `texture = lovr.graphics.newTexture(file, options)`
     * 
     * @param file - A filename or Blob containing an image file to load.
     * @param options - Texture options.
     * @returns The new Texture.
     * 
     * If no `type` is provided in the options table, LÖVR will guess the `TextureType` of the Texture based on the number of layers:
     * 
     * - If there's only 1 layer, the type will be `2d`.
     * - If there are 6 images provided, the type will be `cube`.
     * - Otherwise, the type will be `array`.
     * 
     * Note that an Image can contain multiple layers and mipmaps.  When a single Image is provided, its layer count will be used as the Texture's layer count.
     * 
     * If multiple Images are used to initialize the Texture, they must all have a single layer, and their dimensions, format, and mipmap counts must match.
     * 
     * When providing cubemap images in a table, they can be in one of the following forms:
     * 
     *     { 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' }
     *     { right = 'px.png', left = 'nx.png', top = 'py.png', bottom = 'ny.png', back = 'pz.png', front = 'nz.png' }
     *     { px = 'px.png', nx = 'nx.png', py = 'py.png', ny = 'ny.png', pz = 'pz.png', nz = 'nz.png' }
     * 
     * (Where 'p' stands for positive and 'n' stands for negative).
     * 
     * If no `usage` is provided in the options table, LÖVR will guess the `TextureUsage` of the Texture.  The `sample` usage is always included, but if the texture was created without any images then the texture will have the `render` usage as well.
     * 
     * The supported image formats are png, jpg, hdr, dds, ktx1, ktx2, and astc.
     * 
     * If image data is provided, mipmaps will be generated for any missing mipmap levels.
     */
    function newTexture(file: string | Blob, options?: { type: TextureType, format?: TextureFormat, linear?: boolean, samples?: number, mipmaps?: boolean | number, usage: TextureUsage[], label: string, }): Texture

    /**
     * Creates a new Texture.  Image filenames or `Image` objects can be used to provide the initial pixel data and the dimensions, format, and type.  Alternatively, dimensions can be provided, which will create an empty texture.
     * 
     * `texture = lovr.graphics.newTexture(width, height, options)`
     * 
     * @param width - The width of the Texture, in pixels.
     * @param height - The height of the Texture, in pixels.
     * @param options - Texture options.
     * @returns The new Texture.
     * 
     * If no `type` is provided in the options table, LÖVR will guess the `TextureType` of the Texture based on the number of layers:
     * 
     * - If there's only 1 layer, the type will be `2d`.
     * - If there are 6 images provided, the type will be `cube`.
     * - Otherwise, the type will be `array`.
     * 
     * Note that an Image can contain multiple layers and mipmaps.  When a single Image is provided, its layer count will be used as the Texture's layer count.
     * 
     * If multiple Images are used to initialize the Texture, they must all have a single layer, and their dimensions, format, and mipmap counts must match.
     * 
     * When providing cubemap images in a table, they can be in one of the following forms:
     * 
     *     { 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' }
     *     { right = 'px.png', left = 'nx.png', top = 'py.png', bottom = 'ny.png', back = 'pz.png', front = 'nz.png' }
     *     { px = 'px.png', nx = 'nx.png', py = 'py.png', ny = 'ny.png', pz = 'pz.png', nz = 'nz.png' }
     * 
     * (Where 'p' stands for positive and 'n' stands for negative).
     * 
     * If no `usage` is provided in the options table, LÖVR will guess the `TextureUsage` of the Texture.  The `sample` usage is always included, but if the texture was created without any images then the texture will have the `render` usage as well.
     * 
     * The supported image formats are png, jpg, hdr, dds, ktx1, ktx2, and astc.
     * 
     * If image data is provided, mipmaps will be generated for any missing mipmap levels.
     */
    function newTexture(width: number, height: number, options?: { type: TextureType, format?: TextureFormat, linear?: boolean, samples?: number, mipmaps?: boolean | number, usage: TextureUsage[], label: string, }): Texture

    /**
     * Creates a new Texture.  Image filenames or `Image` objects can be used to provide the initial pixel data and the dimensions, format, and type.  Alternatively, dimensions can be provided, which will create an empty texture.
     * 
     * `texture = lovr.graphics.newTexture(width, height, layers, options)`
     * 
     * @param width - The width of the Texture, in pixels.
     * @param height - The height of the Texture, in pixels.
     * @param layers - The number of layers in the Texture.
     * @param options - Texture options.
     * @returns The new Texture.
     * 
     * If no `type` is provided in the options table, LÖVR will guess the `TextureType` of the Texture based on the number of layers:
     * 
     * - If there's only 1 layer, the type will be `2d`.
     * - If there are 6 images provided, the type will be `cube`.
     * - Otherwise, the type will be `array`.
     * 
     * Note that an Image can contain multiple layers and mipmaps.  When a single Image is provided, its layer count will be used as the Texture's layer count.
     * 
     * If multiple Images are used to initialize the Texture, they must all have a single layer, and their dimensions, format, and mipmap counts must match.
     * 
     * When providing cubemap images in a table, they can be in one of the following forms:
     * 
     *     { 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' }
     *     { right = 'px.png', left = 'nx.png', top = 'py.png', bottom = 'ny.png', back = 'pz.png', front = 'nz.png' }
     *     { px = 'px.png', nx = 'nx.png', py = 'py.png', ny = 'ny.png', pz = 'pz.png', nz = 'nz.png' }
     * 
     * (Where 'p' stands for positive and 'n' stands for negative).
     * 
     * If no `usage` is provided in the options table, LÖVR will guess the `TextureUsage` of the Texture.  The `sample` usage is always included, but if the texture was created without any images then the texture will have the `render` usage as well.
     * 
     * The supported image formats are png, jpg, hdr, dds, ktx1, ktx2, and astc.
     * 
     * If image data is provided, mipmaps will be generated for any missing mipmap levels.
     */
    function newTexture(width: number, height: number, layers: number, options?: { type: TextureType, format?: TextureFormat, linear?: boolean, samples?: number, mipmaps?: boolean | number, usage: TextureUsage[], label: string, }): Texture

    /**
     * Creates a new Texture.  Image filenames or `Image` objects can be used to provide the initial pixel data and the dimensions, format, and type.  Alternatively, dimensions can be provided, which will create an empty texture.
     * 
     * `texture = lovr.graphics.newTexture(image, options)`
     * 
     * @param image - An Image object holding pixel data to load into the Texture.
     * @param options - Texture options.
     * @returns The new Texture.
     * 
     * If no `type` is provided in the options table, LÖVR will guess the `TextureType` of the Texture based on the number of layers:
     * 
     * - If there's only 1 layer, the type will be `2d`.
     * - If there are 6 images provided, the type will be `cube`.
     * - Otherwise, the type will be `array`.
     * 
     * Note that an Image can contain multiple layers and mipmaps.  When a single Image is provided, its layer count will be used as the Texture's layer count.
     * 
     * If multiple Images are used to initialize the Texture, they must all have a single layer, and their dimensions, format, and mipmap counts must match.
     * 
     * When providing cubemap images in a table, they can be in one of the following forms:
     * 
     *     { 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' }
     *     { right = 'px.png', left = 'nx.png', top = 'py.png', bottom = 'ny.png', back = 'pz.png', front = 'nz.png' }
     *     { px = 'px.png', nx = 'nx.png', py = 'py.png', ny = 'ny.png', pz = 'pz.png', nz = 'nz.png' }
     * 
     * (Where 'p' stands for positive and 'n' stands for negative).
     * 
     * If no `usage` is provided in the options table, LÖVR will guess the `TextureUsage` of the Texture.  The `sample` usage is always included, but if the texture was created without any images then the texture will have the `render` usage as well.
     * 
     * The supported image formats are png, jpg, hdr, dds, ktx1, ktx2, and astc.
     * 
     * If image data is provided, mipmaps will be generated for any missing mipmap levels.
     */
    function newTexture(image: string, options?: { type: TextureType, format?: TextureFormat, linear?: boolean, samples?: number, mipmaps?: boolean | number, usage: TextureUsage[], label: string, }): Texture

    /**
     * Creates a new Texture.  Image filenames or `Image` objects can be used to provide the initial pixel data and the dimensions, format, and type.  Alternatively, dimensions can be provided, which will create an empty texture.
     * 
     * `texture = lovr.graphics.newTexture(images, options)`
     * 
     * @param images - A table of filenames or Images to load into the Texture.
     * @param options - Texture options.
     * @returns The new Texture.
     * 
     * If no `type` is provided in the options table, LÖVR will guess the `TextureType` of the Texture based on the number of layers:
     * 
     * - If there's only 1 layer, the type will be `2d`.
     * - If there are 6 images provided, the type will be `cube`.
     * - Otherwise, the type will be `array`.
     * 
     * Note that an Image can contain multiple layers and mipmaps.  When a single Image is provided, its layer count will be used as the Texture's layer count.
     * 
     * If multiple Images are used to initialize the Texture, they must all have a single layer, and their dimensions, format, and mipmap counts must match.
     * 
     * When providing cubemap images in a table, they can be in one of the following forms:
     * 
     *     { 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' }
     *     { right = 'px.png', left = 'nx.png', top = 'py.png', bottom = 'ny.png', back = 'pz.png', front = 'nz.png' }
     *     { px = 'px.png', nx = 'nx.png', py = 'py.png', ny = 'ny.png', pz = 'pz.png', nz = 'nz.png' }
     * 
     * (Where 'p' stands for positive and 'n' stands for negative).
     * 
     * If no `usage` is provided in the options table, LÖVR will guess the `TextureUsage` of the Texture.  The `sample` usage is always included, but if the texture was created without any images then the texture will have the `render` usage as well.
     * 
     * The supported image formats are png, jpg, hdr, dds, ktx1, ktx2, and astc.
     * 
     * If image data is provided, mipmaps will be generated for any missing mipmap levels.
     */
    function newTexture(images: (string | Blob | Image)[], options?: { type: TextureType, format?: TextureFormat, linear?: boolean, samples?: number, mipmaps?: boolean | number, usage: TextureUsage[], label: string, }): Texture

    /**
     * Creates a new Texture view.  A texture view does not store any pixels on its own, but instead uses the pixel data of a "parent" Texture object.  The width, height, format, sample count, and usage flags all match the parent.  The view may have a different `TextureType`, and it may reference a subset of the parent texture's layers and mipmap levels.
     * 
     * Texture views are used for:
     * 
     * - Reinterpretation of texture contents.  For example, a cubemap can be treated as an array
     *   texture.
     * - Rendering to a particular array layer or mipmap level of a texture.
     * - Binding a particular range of layers or mipmap levels to a shader.
     * 
     * `view = lovr.graphics.newTextureView(parent, options)`
     * 
     * @param parent - The parent Texture to create a view of.
     * @param options - Options for the texture view.
     * @returns The new texture view.
     */
    function newTextureView(parent: Texture, options?: { type: TextureType, layer?: number, layercount?: number, mipmap?: number, mipmapcount?: number, label: string, }): Texture

    /**
     * Presents the window texture to the desktop window.  This function is called automatically by the default implementation of `lovr.run`, so it normally does not need to be called.
     * 
     * `lovr.graphics.present()`
     * 
     * This should be called after submitting the window pass (`lovr.graphics.getWindowPass`).  If the window texture has not been rendered to since the last present, this function does nothing.
     */
    function present(): void

    /**
     * Changes the global background color.  The textures in a render pass will be cleared to this color at the beginning of the pass if no other clear option is specified.  Additionally, the headset and window will be cleared to this color before rendering.
     * 
     * `lovr.graphics.setBackgroundColor(r, g, b, a)`
     * 
     * @param r - The red component of the background color.
     * @param g - The green component of the background color.
     * @param b - The blue component of the background color.
     * @param a - The alpha component of the background color.
     * 
     * Setting the background color in `lovr.draw` will apply on the following frame, since the default pass is cleared before `lovr.draw` is called.
     * 
     * Internally, this color is applied to the default pass objects when retrieving one of them using `lovr.headset.getPass` or `lovr.graphics.getWindowPass`.  Both are called automatically by the default `lovr.run` implementation.
     * 
     * Using the background color to clear the display is expected to be more efficient than manually clearing after a render pass begins, especially on mobile GPUs.
     */
    function setBackgroundColor(r: number, g: number, b: number, a?: number): void

    /**
     * Changes the global background color.  The textures in a render pass will be cleared to this color at the beginning of the pass if no other clear option is specified.  Additionally, the headset and window will be cleared to this color before rendering.
     * 
     * `lovr.graphics.setBackgroundColor(hex, a)`
     * 
     * @param hex - A hexcode (like `0xffffff`) to use for the background color (does not support alpha).
     * @param a - The alpha component of the background color.
     * 
     * Setting the background color in `lovr.draw` will apply on the following frame, since the default pass is cleared before `lovr.draw` is called.
     * 
     * Internally, this color is applied to the default pass objects when retrieving one of them using `lovr.headset.getPass` or `lovr.graphics.getWindowPass`.  Both are called automatically by the default `lovr.run` implementation.
     * 
     * Using the background color to clear the display is expected to be more efficient than manually clearing after a render pass begins, especially on mobile GPUs.
     */
    function setBackgroundColor(hex: number, a?: number): void

    /**
     * Changes the global background color.  The textures in a render pass will be cleared to this color at the beginning of the pass if no other clear option is specified.  Additionally, the headset and window will be cleared to this color before rendering.
     * 
     * `lovr.graphics.setBackgroundColor(table)`
     * 
     * @param table - A table containing 3 or 4 color components.
     * 
     * Setting the background color in `lovr.draw` will apply on the following frame, since the default pass is cleared before `lovr.draw` is called.
     * 
     * Internally, this color is applied to the default pass objects when retrieving one of them using `lovr.headset.getPass` or `lovr.graphics.getWindowPass`.  Both are called automatically by the default `lovr.run` implementation.
     * 
     * Using the background color to clear the display is expected to be more efficient than manually clearing after a render pass begins, especially on mobile GPUs.
     */
    function setBackgroundColor(table: number[]): void

    /**
     * Enables or disables timing stats.  When enabled, `Pass:getStats` will return `submitTime` and `gpuTime` durations.  Timing is enabled by default when `t.graphics.debug` is set in `lovr.conf`.  Timing has a small amount of overhead, so it should only be enabled when needed.
     * 
     * `lovr.graphics.setTimingEnabled(enable)`
     * 
     * @param enable - Whether timing should be enabled.
     */
    function setTimingEnabled(enable: boolean): void

    /**
     * Submits work to the GPU.
     * 
     * `true = lovr.graphics.submit(...)`
     * 
     * @param ... - The pass objects to submit.  Falsy values will be skipped.
     * @returns Always returns true, for convenience when returning from `lovr.draw`.
     * 
     * The submitted `Pass` objects will run in the order specified.  Commands within a single Pass do not have any ordering guarantees.
     * 
     * Submitting work to the GPU is not thread safe.  No other `lovr.graphics` or `Pass` functions may run at the same time as `lovr.graphics.submit`.
     * 
     * Calling this function will invalidate any temporary buffers or passes that were created during the frame.
     * 
     * Submitting work to the GPU is a relatively expensive operation.  It's a good idea to batch all `Pass` objects into 1 submission if possible, unless there's a good reason not to.  One such reason would be that the frame has so much work that some of it needs to be submitted early to prevent the GPU from running out of things to do.  Another would be for `Readback` objects.
     * 
     * By default, this function is called with the default pass at the end of `lovr.draw` and `lovr.mirror`.
     * 
     * It is valid to submit zero passes.  This will send an empty batch of work to the GPU.
     */
    function submit(...rest: (Pass | false | undefined)[]): boolean

    /**
     * Submits work to the GPU.
     * 
     * `true = lovr.graphics.submit(t)`
     * 
     * @param t - A table of passes to submit.  Falsy values will be skipped.
     * @returns Always returns true, for convenience when returning from `lovr.draw`.
     * 
     * The submitted `Pass` objects will run in the order specified.  Commands within a single Pass do not have any ordering guarantees.
     * 
     * Submitting work to the GPU is not thread safe.  No other `lovr.graphics` or `Pass` functions may run at the same time as `lovr.graphics.submit`.
     * 
     * Calling this function will invalidate any temporary buffers or passes that were created during the frame.
     * 
     * Submitting work to the GPU is a relatively expensive operation.  It's a good idea to batch all `Pass` objects into 1 submission if possible, unless there's a good reason not to.  One such reason would be that the frame has so much work that some of it needs to be submitted early to prevent the GPU from running out of things to do.  Another would be for `Readback` objects.
     * 
     * By default, this function is called with the default pass at the end of `lovr.draw` and `lovr.mirror`.
     * 
     * It is valid to submit zero passes.  This will send an empty batch of work to the GPU.
     */
    function submit(t: (Pass | false)[]): boolean

    /**
     * Waits for all submitted GPU work to finish.  A normal application that is trying to render graphics at a high framerate should never use this function, since waiting like this prevents the CPU from doing other useful work.  Otherwise, reasons to use this function might be for debugging or to force a `Readback` to finish immediately.
     * 
     * `lovr.graphics.wait()`
     */
    function wait(): void

  }

  namespace headset {
    /**
     * Animates a model to match its input state.  The buttons and joysticks on a controller will move as they're pressed/moved and hand models will move to match hand tracking joints.
     * 
     * The model must have been created using `lovr.headset.newModel` with the `animated` flag set to `true`.
     * 
     * `success = lovr.headset.animate(model)`
     * 
     * @param model - The model to animate.
     * @returns Whether the animation was applied successfully to the Model.  If the Model was not compatible or animation data for the device was not available, this will be `false`.
     * 
     * It's possible to animate a custom hand model by retargeting joint poses, see the `Interaction/Custom_Hand_Rig` example.
     */
    function animate(model: Model): boolean

    /**
     * Animates a model to match its input state.  The buttons and joysticks on a controller will move as they're pressed/moved and hand models will move to match hand tracking joints.
     * 
     * The model must have been created using `lovr.headset.newModel` with the `animated` flag set to `true`.
     * 
     * `success = lovr.headset.animate(device, model)`
     * 
     * @param device - The device to use for the animation data.
     * @param model - The model to animate.
     * @returns Whether the animation was applied successfully to the Model.  If the Model was not compatible or animation data for the device was not available, this will be `false`.
     * 
     * It's possible to animate a custom hand model by retargeting joint poses, see the `Interaction/Custom_Hand_Rig` example.
     */
    function animate(device: Device, model: Model): boolean

    /**
     * Returns the current angular velocity of a device.
     * 
     * `[x, y, z] = lovr.headset.getAngularVelocity(device)`
     * 
     * @param device - The device to get the velocity of.
     * @returns 
     * x - The x component of the angular velocity.
     * y - The y component of the angular velocity.
     * z - The z component of the angular velocity.
     * 
     * If the device isn't tracked, all zeroes will be returned.
     */
    function getAngularVelocity(device?: Device): LuaMultiReturn<[x: number, y: number, z: number]>

    /**
     * Get the current state of an analog axis on a device.  Some axes are multidimensional, for example a 2D touchpad or thumbstick with x/y axes.  For multidimensional axes, this function will return multiple values, one number for each axis.  In these cases, it can be useful to use the `select` function built in to Lua to select a particular axis component.
     * 
     * `... = lovr.headset.getAxis(device, axis)`
     * 
     * @param device - The device.
     * @param axis - The axis.
     * @returns The current state of the components of the axis, or `nil` if the device does not have any information about the axis.
     * 
     * The axis values will be between 0 and 1 for 1D axes, and between -1 and 1 for each component of a multidimensional axis.
     * 
     * When hand tracking is active, pinch strength will be mapped to the `trigger` axis.
     */
    function getAxis(device: Device, axis: DeviceAxis): LuaMultiReturn<[...rest: (number | undefined)[]]>

    /**
     * Returns the depth of the play area, in meters.
     * 
     * `depth = lovr.headset.getBoundsDepth()`
     * 
     * @returns The depth of the play area, in meters.
     * 
     * If the VR system is not roomscale, this will return zero.
     */
    function getBoundsDepth(): number

    /**
     * Returns the size of the play area, in meters.
     * 
     * `[width, depth] = lovr.headset.getBoundsDimensions()`
     * 
     * @returns 
     * width - The width of the play area, in meters.
     * depth - The depth of the play area, in meters.
     * 
     * If the VR system is not roomscale, this will return zero.
     */
    function getBoundsDimensions(): LuaMultiReturn<[width: number, depth: number]>

    /**
     * Returns a list of points representing the boundaries of the play area, or `nil` if the current headset driver does not expose this information.
     * 
     * `points = lovr.headset.getBoundsGeometry(t)`
     * 
     * @param t - A table to fill with the points.  If `nil`, a new table will be created.
     * @returns A flat table of 3D points representing the play area boundaries.
     */
    function getBoundsGeometry(t?: LuaTable): LuaTable

    /**
     * Returns the width of the play area, in meters.
     * 
     * `width = lovr.headset.getBoundsWidth()`
     * 
     * @returns The width of the play area, in meters.
     * 
     * If the VR system is not roomscale, this will return zero.
     */
    function getBoundsWidth(): number

    /**
     * Returns the near and far clipping planes used to render to the headset.  Objects closer than the near clipping plane or further than the far clipping plane will be clipped out of view.
     * 
     * `[near, far] = lovr.headset.getClipDistance()`
     * 
     * @returns 
     * near - The distance to the near clipping plane, in meters.
     * far - The distance to the far clipping plane, in meters, or 0 for an infinite far clipping plane with a reversed Z range.
     * 
     * The default near and far clipping planes are 0.01 meters and 0.0 meters.
     */
    function getClipDistance(): LuaMultiReturn<[near: number, far: number]>

    /**
     * Returns the headset delta time, which is the difference between the current and previous predicted display times.  When the headset is active, this will be the `dt` value passed in to `lovr.update`.
     * 
     * `dt = lovr.headset.getDeltaTime()`
     * 
     * @returns The delta time.
     */
    function getDeltaTime(): number

    /**
     * Returns the direction a device is pointing.  It will always be normalized.
     * 
     * `[x, y, z] = lovr.headset.getDirection(device)`
     * 
     * @param device - The device to get the direction of.
     * @returns 
     * x - The x component of the direction.
     * y - The y component of the direction.
     * z - The z component of the direction.
     * 
     * If the device isn't tracked, all zeroes will be returned.
     * 
     * This is the same as `quat(lovr.headset.getOrientation(device)):direction():unpack()`.
     */
    function getDirection(device?: Device): LuaMultiReturn<[x: number, y: number, z: number]>

    /**
     * Returns the texture dimensions of the headset display (for one eye), in pixels.
     * 
     * `[width, height] = lovr.headset.getDisplayDimensions()`
     * 
     * @returns 
     * width - The width of the display.
     * height - The height of the display.
     */
    function getDisplayDimensions(): LuaMultiReturn<[width: number, height: number]>

    /**
     * Returns the height of the headset display (for one eye), in pixels.
     * 
     * `height = lovr.headset.getDisplayHeight()`
     * 
     * @returns The height of the display.
     */
    function getDisplayHeight(): number

    /**
     * Returns the width of the headset display (for one eye), in pixels.
     * 
     * `width = lovr.headset.getDisplayWidth()`
     * 
     * @returns The width of the display.
     */
    function getDisplayWidth(): number

    /**
     * Returns the `HeadsetDriver` that is currently in use, plus the name of the VR runtime.  The order of headset drivers can be changed using `lovr.conf`.
     * 
     * `[driver, runtime] = lovr.headset.getDriver()`
     * 
     * @returns 
     * driver - The current headset backend, e.g. `openxr` or `simulator`.
     * runtime - The name of the VR runtime, e.g. `SteamVR/OpenXR`.
     */
    function getDriver(): LuaMultiReturn<[driver: HeadsetDriver, runtime: string]>

    /**
     * Returns a table of features that are supported by the current headset runtime.
     * 
     * `features = lovr.headset.getFeatures()`
     * 
     * @returns 
     */
    function getFeatures(): LuaTable

    /**
     * Returns the current foveation settings, previously set by `lovr.headset.setFoveation`.'
     * 
     * `[level, dynamic] = lovr.headset.getFoveation()`
     * 
     * @returns 
     * level - The foveation level (or the maximum level when dynamic foveation is active).
     * dynamic - Whether dynamic foveation is active, allowing the system to reduce foveation based on GPU load.
     * 
     * Foveation is disabled by default.
     */
    function getFoveation(): LuaMultiReturn<[level: FoveationLevel, dynamic: boolean]>

    /**
     * Returns pointers to the OpenXR instance and session objects.
     * 
     * This can be used with FFI or other native plugins to integrate with other OpenXR code.
     * 
     * `[instance, session] = lovr.headset.getHandles()`
     * 
     * @returns 
     * instance - The OpenXR instance handle (`XrInstance`).
     * session - The OpenXR session handle (`XrSession`).
     */
    function getHandles(): LuaMultiReturn<[instance: any, session: any]>

    /**
     * Returns a table with all of the currently tracked hand devices.
     * 
     * `hands = lovr.headset.getHands()`
     * 
     * @returns The currently tracked hand devices.
     * 
     * The hand paths will *always* be either `hand/left` or `hand/right`.
     */
    function getHands(): Device[]

    /**
     * Returns the list of active `Layer` objects.  These are the layers that will be rendered in the headset's display.  They are rendered in order.
     * 
     * `layers = lovr.headset.getLayers()`
     * 
     * @returns The list of layers.
     * 
     * Currently some VR systems are able to sort the layers by their Z depth, but on others layers later in the list will render on top of previous layers, regardless of depth.
     * 
     * There is currently a maximum of 10 layers.
     */
    function getLayers(): Layer[]

    /**
     * Returns the name of the headset as a string.  The exact string that is returned depends on the hardware and VR SDK that is currently in use.
     * 
     * `name = lovr.headset.getName()`
     * 
     * @returns The name of the headset as a string.
     */
    function getName(): string

    /**
     * Returns the current orientation of a device, in angle/axis form.
     * 
     * `[angle, ax, ay, az] = lovr.headset.getOrientation(device)`
     * 
     * @param device - The device to get the orientation of.
     * @returns 
     * angle - The amount of rotation around the axis of rotation, in radians.
     * ax - The x component of the axis of rotation.
     * ay - The y component of the axis of rotation.
     * az - The z component of the axis of rotation.
     * 
     * If the device isn't tracked, all zeroes will be returned.
     */
    function getOrientation(device?: Device): LuaMultiReturn<[angle: number, ax: number, ay: number, az: number]>

    /**
     * Returns a `Pass` that renders to the headset display.
     * 
     * `pass = lovr.headset.getPass()`
     * 
     * @returns The pass.
     * 
     * The same Pass will be returned until `lovr.headset.submit` is called.
     * 
     * The first time this function is called during a frame, the views of the Pass will be initialized with the headset view poses and view angles.
     * 
     * The pass will be cleared to the background color, which can be changed using `lovr.graphics.setBackgroundColor`.
     * 
     * The pass will have a depth buffer.  If `t.headset.stencil` was set to a truthy value in `lovr.conf`, the depth buffer will use the `d32fs8` format, otherwise `d32f` will be used.
     * 
     * If `t.headset.antialias` was set to a truthy value in `lovr.conf`, the pass will be multisampled.
     */
    function getPass(): Pass | undefined

    /**
     * Returns the current passthrough mode.
     * 
     * `mode = lovr.headset.getPassthrough()`
     * 
     * @returns The current passthrough mode.
     */
    function getPassthrough(): PassthroughMode

    /**
     * Returns the set of supported passthrough modes.
     * 
     * `modes = lovr.headset.getPassthroughModes()`
     * 
     * @returns The set of supported passthrough modes.  Keys will be `PassthroughMode` strings, and values will be booleans indicating whether the mode is supported.
     */
    function getPassthroughModes(): LuaTable

    /**
     * Returns the current position and orientation of a device.
     * 
     * `[x, y, z, angle, ax, ay, az] = lovr.headset.getPose(device)`
     * 
     * @param device - The device to get the pose of.
     * @returns 
     * x - The x position.
     * y - The y position.
     * z - The z position.
     * angle - The amount of rotation around the axis of rotation, in radians.
     * ax - The x component of the axis of rotation.
     * ay - The y component of the axis of rotation.
     * az - The z component of the axis of rotation.
     * 
     * Units are in meters.
     * 
     * If the device isn't tracked, all zeroes will be returned.
     */
    function getPose(device?: Device): LuaMultiReturn<[x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number]>

    /**
     * Returns the current position of a device, in meters, relative to the play area.
     * 
     * `[x, y, z] = lovr.headset.getPosition(device)`
     * 
     * @param device - The device to get the position of.
     * @returns 
     * x - The x position of the device.
     * y - The y position of the device.
     * z - The z position of the device.
     * 
     * If the device isn't tracked, all zeroes will be returned.
     */
    function getPosition(device?: Device): LuaMultiReturn<[x: number, y: number, z: number]>

    /**
     * Returns the refresh rate of the headset display, in Hz.
     * 
     * `rate = lovr.headset.getRefreshRate()`
     * 
     * @returns The refresh rate of the display, or `nil` if I have no idea what it is.
     */
    function getRefreshRate(): number | undefined

    /**
     * Returns a table with all the refresh rates supported by the headset display, in Hz.
     * 
     * `rates = lovr.headset.getRefreshRates()`
     * 
     * @returns A flat table of the refresh rates supported by the headset display, or nil if not supported.
     */
    function getRefreshRates(): LuaTable | undefined

    /**
     * Returns a list of joint transforms tracked by a device.  Currently, only hand devices are able to track joints.
     * 
     * `transforms = lovr.headset.getSkeleton(device)`
     * 
     * @param device - The hand device to query (`left` or `right`).
     * @returns A list of joint transforms for the device.  Each transform is a table with 3 numbers for the position of the joint, 1 number for the joint radius (in meters), and 4 numbers for the angle/axis orientation of the joint.  There is also a `radius` key with the radius of the joint as well.
     * 
     * If the Device does not support tracking joints or the transforms are unavailable, this function returns `nil`.
     * 
     * The joint orientation is similar to the graphics coordinate system: -Z is the forwards direction, pointing towards the fingertips.  The +Y direction is "up", pointing out of the back of the hand.  The +X direction is to the right, perpendicular to X and Z.
     * 
     * Here's a picture, courtesy of Khronos Group:
     * 
     * ![Hand Skeleton Joints](https://lovr.org/img/hand-skeleton.png)
     * 
     * Hand joints are returned in the following order:
     * 
     * <table>
     *   <thead>
     *     <tr>
     *       <td colspan="2">Joint</td>
     *       <td>Index</td>
     *     </tr>
     *   </thead>
     *   <tbody>
     *     <tr>
     *       <td colspan="2">Palm</td>
     *       <td>1</td>
     *     </tr>
     *     <tr>
     *       <td colspan="2">Wrist</td>
     *       <td>2</td>
     *     </tr>
     *     <tr>
     *       <td rowspan="4">Thumb</td>
     *       <td>Metacarpal</td>
     *       <td>3</td>
     *     </tr>
     *     <tr>
     *       <td>Proximal</td>
     *       <td>4</td>
     *     </tr>
     *     <tr>
     *       <td>Distal</td>
     *       <td>5</td>
     *     </tr>
     *     <tr>
     *       <td>Tip</td>
     *       <td>6</td>
     *     </tr>
     *     <tr>
     *       <td rowspan="5">Index</td>
     *       <td>Metacarpal</td>
     *       <td>7</td>
     *     </tr>
     *     <tr>
     *       <td>Proximal</td>
     *       <td>8</td>
     *     </tr>
     *     <tr>
     *       <td>Intermediate</td>
     *       <td>9</td>
     *     </tr>
     *     <tr>
     *       <td>Distal</td>
     *       <td>10</td>
     *     </tr>
     *     <tr>
     *       <td>Tip</td>
     *       <td>11</td>
     *     </tr>
     *     <tr>
     *       <td rowspan="5">Middle</td>
     *       <td>Metacarpal</td>
     *       <td>12</td>
     *     </tr>
     *     <tr>
     *       <td>Proximal</td>
     *       <td>13</td>
     *     </tr>
     *     <tr>
     *       <td>Intermediate</td>
     *       <td>14</td>
     *     </tr>
     *     <tr>
     *       <td>Distal</td>
     *       <td>15</td>
     *     </tr>
     *     <tr>
     *       <td>Tip</td>
     *       <td>16</td>
     *     </tr>
     *     <tr>
     *       <td rowspan="5">Ring</td>
     *       <td>Metacarpal</td>
     *       <td>17</td>
     *     </tr>
     *     <tr>
     *       <td>Proximal</td>
     *       <td>18</td>
     *     </tr>
     *     <tr>
     *       <td>Intermediate</td>
     *       <td>19</td>
     *     </tr>
     *     <tr>
     *       <td>Distal</td>
     *       <td>20</td>
     *     </tr>
     *     <tr>
     *       <td>Tip</td>
     *       <td>21</td>
     *     </tr>
     *     <tr>
     *       <td rowspan="5">Pinky</td>
     *       <td>Metacarpal</td>
     *       <td>22</td>
     *     </tr>
     *     <tr>
     *       <td>Proximal</td>
     *       <td>23</td>
     *     </tr>
     *     <tr>
     *       <td>Intermediate</td>
     *       <td>24</td>
     *     </tr>
     *     <tr>
     *       <td>Distal</td>
     *       <td>25</td>
     *     </tr>
     *     <tr>
     *       <td>Tip</td>
     *       <td>26</td>
     *     </tr>
     *   </tbody> </table>
     */
    function getSkeleton(device: Device): number[][] | undefined

    /**
     * Returns a list of joint transforms tracked by a device.  Currently, only hand devices are able to track joints.
     * 
     * `transforms = lovr.headset.getSkeleton(device, t)`
     * 
     * @param device - The hand device to query (`left` or `right`).
     * @param t - A table to fill with the joint transforms, instead of allocating a new one.
     * @returns A list of joint transforms for the device.  Each transform is a table with 3 numbers for the position of the joint, 1 number for the joint radius (in meters), and 4 numbers for the angle/axis orientation of the joint.  There is also a `radius` key with the radius of the joint as well.
     * 
     * If the Device does not support tracking joints or the transforms are unavailable, this function returns `nil`.
     * 
     * The joint orientation is similar to the graphics coordinate system: -Z is the forwards direction, pointing towards the fingertips.  The +Y direction is "up", pointing out of the back of the hand.  The +X direction is to the right, perpendicular to X and Z.
     * 
     * Here's a picture, courtesy of Khronos Group:
     * 
     * ![Hand Skeleton Joints](https://lovr.org/img/hand-skeleton.png)
     * 
     * Hand joints are returned in the following order:
     * 
     * <table>
     *   <thead>
     *     <tr>
     *       <td colspan="2">Joint</td>
     *       <td>Index</td>
     *     </tr>
     *   </thead>
     *   <tbody>
     *     <tr>
     *       <td colspan="2">Palm</td>
     *       <td>1</td>
     *     </tr>
     *     <tr>
     *       <td colspan="2">Wrist</td>
     *       <td>2</td>
     *     </tr>
     *     <tr>
     *       <td rowspan="4">Thumb</td>
     *       <td>Metacarpal</td>
     *       <td>3</td>
     *     </tr>
     *     <tr>
     *       <td>Proximal</td>
     *       <td>4</td>
     *     </tr>
     *     <tr>
     *       <td>Distal</td>
     *       <td>5</td>
     *     </tr>
     *     <tr>
     *       <td>Tip</td>
     *       <td>6</td>
     *     </tr>
     *     <tr>
     *       <td rowspan="5">Index</td>
     *       <td>Metacarpal</td>
     *       <td>7</td>
     *     </tr>
     *     <tr>
     *       <td>Proximal</td>
     *       <td>8</td>
     *     </tr>
     *     <tr>
     *       <td>Intermediate</td>
     *       <td>9</td>
     *     </tr>
     *     <tr>
     *       <td>Distal</td>
     *       <td>10</td>
     *     </tr>
     *     <tr>
     *       <td>Tip</td>
     *       <td>11</td>
     *     </tr>
     *     <tr>
     *       <td rowspan="5">Middle</td>
     *       <td>Metacarpal</td>
     *       <td>12</td>
     *     </tr>
     *     <tr>
     *       <td>Proximal</td>
     *       <td>13</td>
     *     </tr>
     *     <tr>
     *       <td>Intermediate</td>
     *       <td>14</td>
     *     </tr>
     *     <tr>
     *       <td>Distal</td>
     *       <td>15</td>
     *     </tr>
     *     <tr>
     *       <td>Tip</td>
     *       <td>16</td>
     *     </tr>
     *     <tr>
     *       <td rowspan="5">Ring</td>
     *       <td>Metacarpal</td>
     *       <td>17</td>
     *     </tr>
     *     <tr>
     *       <td>Proximal</td>
     *       <td>18</td>
     *     </tr>
     *     <tr>
     *       <td>Intermediate</td>
     *       <td>19</td>
     *     </tr>
     *     <tr>
     *       <td>Distal</td>
     *       <td>20</td>
     *     </tr>
     *     <tr>
     *       <td>Tip</td>
     *       <td>21</td>
     *     </tr>
     *     <tr>
     *       <td rowspan="5">Pinky</td>
     *       <td>Metacarpal</td>
     *       <td>22</td>
     *     </tr>
     *     <tr>
     *       <td>Proximal</td>
     *       <td>23</td>
     *     </tr>
     *     <tr>
     *       <td>Intermediate</td>
     *       <td>24</td>
     *     </tr>
     *     <tr>
     *       <td>Distal</td>
     *       <td>25</td>
     *     </tr>
     *     <tr>
     *       <td>Tip</td>
     *       <td>26</td>
     *     </tr>
     *   </tbody> </table>
     */
    function getSkeleton(device: Device, t: LuaTable): number[][] | undefined

    /**
     * Returns a Texture that will be submitted to the headset display.  This will be the render target used in the headset's render pass.  The texture is not guaranteed to be the same every frame, and must be called every frame to get the current texture.
     * 
     * `texture = lovr.headset.getTexture()`
     * 
     * @returns The headset texture.
     * 
     * This function may return `nil` if the headset is not being rendered to this frame.
     */
    function getTexture(): Texture | undefined

    /**
     * Returns the estimated time in the future at which the light from the pixels of the current frame will hit the eyes of the user.
     * 
     * This can be used as a replacement for `lovr.timer.getTime` for timestamps that are used for rendering to get a smoother result that is synchronized with the display of the headset.
     * 
     * `time = lovr.headset.getTime()`
     * 
     * @returns The predicted display time, in seconds.
     * 
     * This has a different epoch than `lovr.timer.getTime`, so it is not guaranteed to be close to that value.
     */
    function getTime(): number

    /**
     * Returns the current linear velocity of a device, in meters per second.
     * 
     * `[vx, vy, vz] = lovr.headset.getVelocity(device)`
     * 
     * @param device - The device to get the velocity of.
     * @returns 
     * vx - The x component of the linear velocity.
     * vy - The y component of the linear velocity.
     * vz - The z component of the linear velocity.
     * 
     * If the device isn't tracked, all zeroes will be returned.
     */
    function getVelocity(device?: Device): LuaMultiReturn<[vx: number, vy: number, vz: number]>

    /**
     * Returns the view angles of one of the headset views.
     * 
     * These can be used with `Mat4:fov` to create a projection matrix.
     * 
     * If tracking data is unavailable for the view or the index is invalid, `nil` is returned.
     * 
     * `[left, right, top, bottom] = lovr.headset.getViewAngles(view)`
     * 
     * @param view - The view index.
     * @returns 
     * left - The left view angle, in radians.
     * right - The right view angle, in radians.
     * top - The top view angle, in radians.
     * bottom - The bottom view angle, in radians.
     */
    function getViewAngles(view: number): LuaMultiReturn<[left: number | undefined, right: number | undefined, top: number | undefined, bottom: number | undefined]>

    /**
     * Returns the number of views used for rendering.  Each view consists of a pose in space and a set of angle values that determine the field of view.
     * 
     * This is usually 2 for stereo rendering configurations, but it can also be different.  For example, one way of doing foveated rendering uses 2 views for each eye -- one low quality view with a wider field of view, and a high quality view with a narrower field of view.
     * 
     * `count = lovr.headset.getViewCount()`
     * 
     * @returns The number of views.
     */
    function getViewCount(): number

    /**
     * Returns the pose of one of the headset views.  This info can be used to create view matrices or do other eye-dependent calculations.
     * 
     * If tracking data is unavailable for the view or the index is invalid, `nil` is returned.
     * 
     * `[x, y, z, angle, ax, ay, az] = lovr.headset.getViewPose(view)`
     * 
     * @param view - The view index.
     * @returns 
     * x - The x coordinate of the view position, in meters.
     * y - The y coordinate of the view position, in meters.
     * z - The z coordinate of the view position, in meters.
     * angle - The amount of rotation around the rotation axis, in radians.
     * ax - The x component of the axis of rotation.
     * ay - The y component of the axis of rotation.
     * az - The z component of the axis of rotation.
     */
    function getViewPose(view: number): LuaMultiReturn<[x: number | undefined, y: number | undefined, z: number | undefined, angle: number | undefined, ax: number | undefined, ay: number | undefined, az: number | undefined]>

    /**
     * Returns whether a headset session is active.  When true, there is an active connection to the VR hardware.  When false, most headset methods will not work properly until `lovr.headset.start` is used to start a session.
     * 
     * `active = lovr.headset.isActive()`
     * 
     * @returns Whether the headset session is active.
     */
    function isActive(): boolean

    /**
     * Returns whether a button on a device is pressed.
     * 
     * `down = lovr.headset.isDown(device, button)`
     * 
     * @param device - The device.
     * @param button - The button.
     * @returns Whether the button on the device is currently pressed, or `nil` if the device does not have the specified button.
     * 
     * When hand tracking is active, pinching will be mapped to the `trigger` button.
     */
    function isDown(device: Device, button: DeviceButton): boolean | undefined

    /**
     * Returns whether LÖVR has VR input focus.  Focus is lost when the VR system menu is shown.  The `lovr.focus` callback can be used to detect when this changes.
     * 
     * `focused = lovr.headset.isFocused()`
     * 
     * @returns Whether the application is focused.
     */
    function isFocused(): boolean

    /**
     * Returns whether the headset is mounted.  Usually this uses a proximity sensor on the headset to detect whether someone is wearing the headset.
     * 
     * `mounted = lovr.headset.isMounted()`
     * 
     * @returns Whether the headset is mounted.
     */
    function isMounted(): boolean

    /**
     * Returns whether the headset coordinate space is in seated mode.
     * 
     * Seated mode is enabled by setting `t.headset.seated` to true in `lovr.conf`.  In seated mode, `y=0` will be at eye level, instead of on the floor like in standing-scale experiences.
     * 
     * The seated coordinate space can be more convenient for applications that are rendering a simple interface in front of the user (like a video player) instead of a roomscale 3D scene.  y=0 will also be at the correct height at startup, whether the user is sitting or standing.
     * 
     * `seated = lovr.headset.isSeated()`
     * 
     * @returns Whether the experience is seated.
     */
    function isSeated(): boolean

    /**
     * Returns whether a button on a device is currently touched.
     * 
     * `touched = lovr.headset.isTouched(device, button)`
     * 
     * @param device - The device.
     * @param button - The button.
     * @returns Whether the button on the device is currently touched, or `nil` if the device does not have the button or it isn't touch-sensitive.
     */
    function isTouched(device: Device, button: DeviceButton): boolean | undefined

    /**
     * Returns whether any active headset driver is currently returning pose information for a device.
     * 
     * `tracked = lovr.headset.isTracked(device)`
     * 
     * @param device - The device to get the pose of.
     * @returns Whether the device is currently tracked.
     * 
     * If a device is tracked, it is guaranteed to return a valid pose until the next call to `lovr.headset.update`.
     */
    function isTracked(device?: Device): boolean

    /**
     * Returns whether LÖVR's content is being presented to the headset display.  Normally this will be true, but some VR runtimes allow applications to be hidden or "minimized", similar to desktop windows.
     * 
     * `visible = lovr.headset.isVisible()`
     * 
     * @returns Whether the application is visible.
     * 
     * `lovr.draw` may still be called even when the application is invisible, and apps should continue to render the scene normally because the VR system may use this for timing info.  If the VR system decides that the application no longer needs to render, LÖVR will stop calling `lovr.draw`.
     */
    function isVisible(): boolean

    /**
     * Creates a new `Layer`.
     * 
     * `layer = lovr.headset.newLayer(width, height)`
     * 
     * @param width - The width of the Layer texture, in pixels.
     * @param height - The height of the Layer texture, in pixels.
     * @returns The new Layer.
     */
    function newLayer(width: number, height: number): Layer

    /**
     * Loads a new Model object for the specified model key.
     * 
     * Model keys are lightuserdata values that act as an ID for a specific model.  Use `lovr.headset.getModelKeys` to retrieve a list of model keys for the currently connected hardware.
     * 
     * It is recommended to refresh the list of model keys in the `lovr.modelschanged` event, which gets fired whenever the list of keys changes.  `lovr.modelschanged` is also fired once at startup when the models are ready to load.  In the callback, you can get the new list of model keys and load models for any keys that haven't been loaded yet.
     * 
     * There isn't any correspondence between a model key and a `Device`, because there could be multiple models for a device, or some models that do not correspond to a device at all.  For example, the hand device could have a model for a controller, a wrist tracker, or a hand mesh.
     * 
     * Once a model is loaded, call `lovr.headset.isTracked` with the model to check if it should be visible, and `lovr.headset.getPose` to get the position and orientation to draw the model at.
     * 
     * To reposition the nodes in the model to match the current state of the buttons, joysticks, etc., call `lovr.headset.animate` with the model.
     * 
     * `model = lovr.headset.newModel(key)`
     * 
     * @param key - A model key to load, previously obtained with `lovr.headset.getModelKeys`.
     * @returns The new Model, or `nil` if a model could not be loaded.
     */
    function newModel(key: any): Model

    /**
     * Loads a new Model object for the specified model key.
     * 
     * Model keys are lightuserdata values that act as an ID for a specific model.  Use `lovr.headset.getModelKeys` to retrieve a list of model keys for the currently connected hardware.
     * 
     * It is recommended to refresh the list of model keys in the `lovr.modelschanged` event, which gets fired whenever the list of keys changes.  `lovr.modelschanged` is also fired once at startup when the models are ready to load.  In the callback, you can get the new list of model keys and load models for any keys that haven't been loaded yet.
     * 
     * There isn't any correspondence between a model key and a `Device`, because there could be multiple models for a device, or some models that do not correspond to a device at all.  For example, the hand device could have a model for a controller, a wrist tracker, or a hand mesh.
     * 
     * Once a model is loaded, call `lovr.headset.isTracked` with the model to check if it should be visible, and `lovr.headset.getPose` to get the position and orientation to draw the model at.
     * 
     * To reposition the nodes in the model to match the current state of the buttons, joysticks, etc., call `lovr.headset.animate` with the model.
     * 
     * `model = lovr.headset.newModel(device)`
     * 
     * @param device - The device to load a model for.
     * @returns The new Model, or `nil` if a model could not be loaded.
     */
    function newModel(device?: Device): Model

    /**
     * Sets a background layer.  This will render behind any transparent pixels in the main 3D content. It works similarly to other `Layer` objects, but using a cubemap or equirectangular texture.
     * 
     * The background texture is sent to the VR runtime once, and the runtime is responsible for compositing it behind the rest of the scene.  This can improve performance greatly, since the background doesn't need to be re-rendered every frame.  It also ensures the background remains tracked smoothly even if LÖVR is struggling to render at a high frame rate.
     * 
     * `lovr.headset.setBackground(background)`
     * 
     * @param background - The image(s) or texture to use for the background.  Backgrounds can either be cubemaps (6 images) or equirectangular (a single panoramic 2D image).
     * 
     * Textures can have any color format, but it will be converted to `rgba8` before getting copied to the VR runtime.  Images currently have to be `rgba8`.
     * 
     * There is no `lovr.headset.getBackground` because LÖVR does not store the Image or Texture after setting it as a background, to save memory.
     */
    function setBackground(background: Image | Image[] | Texture): void

    /**
     * Sets a background layer.  This will render behind any transparent pixels in the main 3D content. It works similarly to other `Layer` objects, but using a cubemap or equirectangular texture.
     * 
     * The background texture is sent to the VR runtime once, and the runtime is responsible for compositing it behind the rest of the scene.  This can improve performance greatly, since the background doesn't need to be re-rendered every frame.  It also ensures the background remains tracked smoothly even if LÖVR is struggling to render at a high frame rate.
     * 
     * `lovr.headset.setBackground()`
     * 
     * Disables any previously set background.
     * 
     * There is no `lovr.headset.getBackground` because LÖVR does not store the Image or Texture after setting it as a background, to save memory.
     */
    function setBackground(): void

    /**
     * Sets the near and far clipping planes used to render to the headset.  Objects closer than the near clipping plane or further than the far clipping plane will be clipped out of view.
     * 
     * `lovr.headset.setClipDistance(near, far)`
     * 
     * @param near - The distance to the near clipping plane, in meters.
     * @param far - The distance to the far clipping plane, in meters, or 0 for an infinite far clipping plane with a reversed Z range.
     * 
     * The default clip distances are 0.01 and 0.0.
     */
    function setClipDistance(near: number, far: number): void

    /**
     * Sets foveated rendering settings.  Currently only fixed foveated rendering is supported.  This renders the edges of the screen at a lower resolution to improve GPU performance.  Higher foveation levels will save more GPU time, but make the edges of the screen more blocky.
     * 
     * `success = lovr.headset.setFoveation(level, dynamic)`
     * 
     * @param level - The foveation level (or the maximum level when dynamic foveation is active).
     * @param dynamic - Whether the system is allowed to dynamically adjust the foveation level based on GPU load.
     * @returns Whether foveation was enabled successfully.
     * 
     * Foveation is disabled by default.
     */
    function setFoveation(level: FoveationLevel, dynamic?: boolean): boolean

    /**
     * Sets foveated rendering settings.  Currently only fixed foveated rendering is supported.  This renders the edges of the screen at a lower resolution to improve GPU performance.  Higher foveation levels will save more GPU time, but make the edges of the screen more blocky.
     * 
     * `success = lovr.headset.setFoveation()`
     * 
     * Disables foveation.
     * 
     * @returns Whether foveation was enabled successfully.
     * 
     * Foveation is disabled by default.
     */
    function setFoveation(): boolean

    /**
     * Sets the list of active `Layer` objects.  These are the layers that will be rendered in the headset's display.  They are rendered in order.
     * 
     * `lovr.headset.setLayers(...layers)`
     * 
     * @param ...layers - Zero or more layers to render in the headset.
     * 
     * Currently some VR systems are able to sort the layers by their Z depth, but on others layers later in the list will render on top of previous layers, regardless of depth.
     * 
     * There is currently a maximum of 10 layers.
     */
    function setLayers(...layers: Layer[]): void

    /**
     * Sets the list of active `Layer` objects.  These are the layers that will be rendered in the headset's display.  They are rendered in order.
     * 
     * `lovr.headset.setLayers(t)`
     * 
     * @param t - A table with zero or more layers starting at index 1.
     * 
     * Currently some VR systems are able to sort the layers by their Z depth, but on others layers later in the list will render on top of previous layers, regardless of depth.
     * 
     * There is currently a maximum of 10 layers.
     */
    function setLayers(t: LuaTable): void

    /**
     * Sets a new passthrough mode.  Not all headsets support all passthrough modes.  Use `lovr.headset.getPassthroughModes` to see which modes are supported.
     * 
     * `success = lovr.headset.setPassthrough(mode)`
     * 
     * @param mode - The passthrough mode to request.
     * @returns Whether the passthrough mode was supported and successfully enabled.
     * 
     * When using one of the transparent passthrough modes, be sure to set the alpha of the background color to zero using `lovr.graphics.setBackgroundColor`, so the background shows through.
     * 
     * Quest Link currently requires some extra steps to enable passthrough, see [this article](https://developers.meta.com/horizon/documentation/native/android/mobile-passthrough-over-link) for details.
     */
    function setPassthrough(mode: PassthroughMode): boolean

    /**
     * Sets a new passthrough mode.  Not all headsets support all passthrough modes.  Use `lovr.headset.getPassthroughModes` to see which modes are supported.
     * 
     * `success = lovr.headset.setPassthrough(transparent)`
     * 
     * @param transparent - Whether the headset should use a transparent passthrough mode.  When false, this will request the `opaque` mode.  When true, either `blend` or `add` will be requested, based on what the VR runtime supports.
     * @returns Whether the passthrough mode was supported and successfully enabled.
     * 
     * When using one of the transparent passthrough modes, be sure to set the alpha of the background color to zero using `lovr.graphics.setBackgroundColor`, so the background shows through.
     * 
     * Quest Link currently requires some extra steps to enable passthrough, see [this article](https://developers.meta.com/horizon/documentation/native/android/mobile-passthrough-over-link) for details.
     */
    function setPassthrough(transparent: boolean): boolean

    /**
     * Sets a new passthrough mode.  Not all headsets support all passthrough modes.  Use `lovr.headset.getPassthroughModes` to see which modes are supported.
     * 
     * `success = lovr.headset.setPassthrough()`
     * 
     * Switch to the headset's default passthrough mode.
     * 
     * @returns Whether the passthrough mode was supported and successfully enabled.
     * 
     * When using one of the transparent passthrough modes, be sure to set the alpha of the background color to zero using `lovr.graphics.setBackgroundColor`, so the background shows through.
     * 
     * Quest Link currently requires some extra steps to enable passthrough, see [this article](https://developers.meta.com/horizon/documentation/native/android/mobile-passthrough-over-link) for details.
     */
    function setPassthrough(): boolean

    /**
     * Sets the display refresh rate, in Hz.
     * 
     * `success = lovr.headset.setRefreshRate(rate)`
     * 
     * @param rate - The new refresh rate, in Hz.
     * @returns Whether the display refresh rate was successfully set.
     * 
     * Changing the display refresh-rate usually also changes the frequency of lovr.update() and lovr.draw() as they depend on the refresh rate.  However, it's ultimately up to the VR runtime to decide how often the application gets to render, based on available resources.
     */
    function setRefreshRate(rate: number): boolean

    /**
     * Starts the headset session.  This must be called after the graphics module is initialized. Normally it is called automatically by `boot.lua`, but this can be disabled by setting `t.headset.start` to false in `lovr.conf`.
     * 
     * `lovr.headset.start()`
     */
    function start(): void

    /**
     * Stops the headset session.  This tears down the connection to the VR runtime and hardware. `lovr.draw` will instead start rendering to the desktop window, as though the headset module was disabled.  However, certain information about the headset can still be queried, such as its name, supported passthrough modes, display size, etc.  A headset session can be started later using `lovr.headset.start`.
     * 
     * `lovr.headset.stop()`
     * 
     * The headset module behaves in the following manner when there is no headset session:
     * 
     * - `lovr.headset.isActive` returns `false`.
     * - `lovr.headset.getPass` returns `nil`.
     * - All devices will be untracked.
     */
    function stop(): void

    /**
     * Causes the device to stop any active haptics vibration.
     * 
     * `lovr.headset.stopVibration(device)`
     * 
     * @param device - The device to stop the vibration on.
     */
    function stopVibration(device?: Device): void

    /**
     * Submits the current headset texture to the VR display.  This should be called after calling `lovr.graphics.submit` with the headset render pass.  Normally this is taken care of by `lovr.run`.
     * 
     * `lovr.headset.submit()`
     */
    function submit(): void

    /**
     * Updates the headset module, blocking until it is time to start a new frame and polling new input states.  This should only be called once at the beginning of a frame, and is normally taken care of by the default `lovr.run` implementation.
     * 
     * `lovr.headset.update()`
     */
    function update(): void

    /**
     * Causes the device to vibrate with a custom strength, duration, and frequency, if possible.
     * 
     * `vibrated = lovr.headset.vibrate(device, strength, duration, frequency)`
     * 
     * @param device - The device to vibrate.
     * @param strength - The strength of the vibration (amplitude), between 0 and 1.
     * @param duration - The duration of the vibration, in seconds.
     * @param frequency - The frequency of the vibration, in hertz.  0 will use a default frequency.
     * @returns Whether the vibration was successfully triggered by an active headset driver.
     */
    function vibrate(device?: Device, strength?: number, duration?: number, frequency?: number): boolean

    /**
     * Returns whether a button on a device was pressed this frame.
     * 
     * `pressed = lovr.headset.wasPressed(device, button)`
     * 
     * @param device - The device.
     * @param button - The button to check.
     * @returns Whether the button on the device was pressed this frame.
     * 
     * The internal `lovr.headset.update` function updates pressed/released status.
     */
    function wasPressed(device: Device, button: DeviceButton): boolean

    /**
     * Returns whether a button on a device was released this frame.
     * 
     * `released = lovr.headset.wasReleased(device, button)`
     * 
     * @param device - The device.
     * @param button - The button to check.
     * @returns Whether the button on the device was released this frame.
     * 
     * Some headset backends are not able to return pressed/released information.  These drivers will always return false for `lovr.headset.wasPressed` and `lovr.headset.wasReleased`.
     * 
     * Typically the internal `lovr.headset.update` function will update pressed/released status.
     */
    function wasReleased(device: Device, button: DeviceButton): boolean

  }

  namespace math {
    /**
     * Drains the temporary vector pool, invalidating existing temporary vectors.
     * 
     * This is called automatically at the end of each frame.
     * 
     * `lovr.math.drain()`
     */
    function drain(): void

    /**
     * Converts a color from gamma space to linear space.
     * 
     * `[lr, lg, lb] = lovr.math.gammaToLinear(gr, gg, gb)`
     * 
     * @param gr - The red component of the gamma-space color.
     * @param gg - The green component of the gamma-space color.
     * @param gb - The blue component of the gamma-space color.
     * @returns 
     * lr - The red component of the resulting linear-space color.
     * lg - The green component of the resulting linear-space color.
     * lb - The blue component of the resulting linear-space color.
     */
    function gammaToLinear(gr: number, gg: number, gb: number): LuaMultiReturn<[lr: number, lg: number, lb: number]>

    /**
     * Converts a color from gamma space to linear space.
     * 
     * `[lr, lg, lb] = lovr.math.gammaToLinear(color)`
     * 
     * A table can also be used.
     * 
     * @param color - A table containing the components of a gamma-space color.
     * @returns 
     * lr - The red component of the resulting linear-space color.
     * lg - The green component of the resulting linear-space color.
     * lb - The blue component of the resulting linear-space color.
     */
    function gammaToLinear(color: number[]): LuaMultiReturn<[lr: number, lg: number, lb: number]>

    /**
     * Converts a color from gamma space to linear space.
     * 
     * `y = lovr.math.gammaToLinear(x)`
     * 
     * Convert a single color channel.
     * 
     * @param x - The color channel to convert.
     * @returns The converted color channel.
     */
    function gammaToLinear(x: number): number

    /**
     * Get the seed used to initialize the random generator.
     * 
     * `seed = lovr.math.getRandomSeed()`
     * 
     * @returns The new seed.
     */
    function getRandomSeed(): number

    /**
     * Converts a color from linear space to gamma space.
     * 
     * `[gr, gg, gb] = lovr.math.linearToGamma(lr, lg, lb)`
     * 
     * @param lr - The red component of the linear-space color.
     * @param lg - The green component of the linear-space color.
     * @param lb - The blue component of the linear-space color.
     * @returns 
     * gr - The red component of the resulting gamma-space color.
     * gg - The green component of the resulting gamma-space color.
     * gb - The blue component of the resulting gamma-space color.
     */
    function linearToGamma(lr: number, lg: number, lb: number): LuaMultiReturn<[gr: number, gg: number, gb: number]>

    /**
     * Converts a color from linear space to gamma space.
     * 
     * `[gr, gg, gb] = lovr.math.linearToGamma(color)`
     * 
     * A table can also be used.
     * 
     * @param color - A table containing the components of a linear-space color.
     * @returns 
     * gr - The red component of the resulting gamma-space color.
     * gg - The green component of the resulting gamma-space color.
     * gb - The blue component of the resulting gamma-space color.
     */
    function linearToGamma(color: number[]): LuaMultiReturn<[gr: number, gg: number, gb: number]>

    /**
     * Converts a color from linear space to gamma space.
     * 
     * `y = lovr.math.linearToGamma(x)`
     * 
     * Convert a single color channel.
     * 
     * @param x - The color channel to convert.
     * @returns The converted color channel.
     */
    function linearToGamma(x: number): number

    /**
     * Creates a temporary 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.mat4()`
     * 
     * Sets the matrix to the identity matrix.
     * 
     * @returns The new matrix.
     */
    function mat4(): Mat4

    /**
     * Creates a temporary 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.mat4(n)`
     * 
     * Copies the values from an existing matrix.
     * 
     * @param n - An existing matrix to copy the values from.
     * @returns The new matrix.
     */
    function mat4(n: Mat4): Mat4

    /**
     * Creates a temporary 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.mat4(position, scale, rotation)`
     * 
     * @param position - The translation of the matrix.
     * @param scale - The scale of the matrix.
     * @param rotation - The rotation of the matrix.
     * @returns The new matrix.
     */
    function mat4(position?: vector, scale?: vector, rotation?: quaternion): Mat4

    /**
     * Creates a temporary 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.mat4(position, rotation)`
     * 
     * @param position - The translation of the matrix.
     * @param rotation - The rotation of the matrix.
     * @returns The new matrix.
     */
    function mat4(position?: vector, rotation?: quaternion): Mat4

    /**
     * Creates a temporary 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.mat4(...)`
     * 
     * @param ... - 16 numbers to use as the raw values of the matrix (column-major).
     * @returns The new matrix.
     */
    function mat4(...rest: number[]): Mat4

    /**
     * Creates a temporary 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.mat4(d)`
     * 
     * Sets the diagonal values to a number and everything else to 0.
     * 
     * @param d - A number to use for the diagonal elements.
     * @returns The new matrix.
     */
    function mat4(d: number): Mat4

    /**
     * Creates a new `Curve` from a list of control points.
     * 
     * `curve = lovr.math.newCurve(x, y, z, ...)`
     * 
     * Create a Curve from a set of initial control points.
     * 
     * @param x - The x coordinate of the first control point.
     * @param y - The y coordinate of the first control point.
     * @param z - The z coordinate of the first control point.
     * @param ... - Additional control points.
     * @returns The new Curve.
     */
    function newCurve(x: number, y: number, z: number, ...rest: any[]): Curve

    /**
     * Creates a new `Curve` from a list of control points.
     * 
     * `curve = lovr.math.newCurve(v, ...)`
     * 
     * Create a Curve from a set of initial control points, using vectors.
     * 
     * @param v - The first control point.
     * @param ... - Additional control points.
     * @returns The new Curve.
     */
    function newCurve(v: vector, ...rest: any[]): Curve

    /**
     * Creates a new `Curve` from a list of control points.
     * 
     * `curve = lovr.math.newCurve(points)`
     * 
     * Create a Curve from control points in a table.  The table values can be numbers or `Vec3` objects.
     * 
     * @param points - A table of control points, formatted as numbers or `Vec3` objects.
     * @returns The new Curve.
     */
    function newCurve(points: LuaTable): Curve

    /**
     * Creates a new `Curve` from a list of control points.
     * 
     * `curve = lovr.math.newCurve(n)`
     * 
     * Create an empty Curve, reserving space ahead of time for a certain number of control points.
     * 
     * @param n - The number of points to reserve for the Curve.
     * @returns The new Curve.
     */
    function newCurve(n: number): Curve

    /**
     * Creates a new 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.newMat4()`
     * 
     * Sets the matrix to the identity matrix.
     * 
     * @returns The new matrix.
     */
    function newMat4(): Mat4

    /**
     * Creates a new 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.newMat4(n)`
     * 
     * Copies the values from an existing matrix.
     * 
     * @param n - An existing matrix to copy the values from.
     * @returns The new matrix.
     */
    function newMat4(n: Mat4): Mat4

    /**
     * Creates a new 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.newMat4(position, scale, rotation)`
     * 
     * @param position - The translation of the matrix.
     * @param scale - The scale of the matrix.
     * @param rotation - The rotation of the matrix.
     * @returns The new matrix.
     */
    function newMat4(position?: vector, scale?: vector, rotation?: quaternion): Mat4

    /**
     * Creates a new 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.newMat4(position, rotation)`
     * 
     * @param position - The translation of the matrix.
     * @param rotation - The rotation of the matrix.
     * @returns The new matrix.
     */
    function newMat4(position?: vector, rotation?: quaternion): Mat4

    /**
     * Creates a new 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.newMat4(...)`
     * 
     * @param ... - 16 numbers to use as the raw values of the matrix (column-major).
     * @returns The new matrix.
     */
    function newMat4(...rest: number[]): Mat4

    /**
     * Creates a new 4D matrix.  This function takes the same arguments as `Mat4:set`.
     * 
     * `m = lovr.math.newMat4(d)`
     * 
     * Sets the diagonal values to a number and everything else to 0.
     * 
     * @param d - A number to use for the diagonal elements.
     * @returns The new matrix.
     */
    function newMat4(d: number): Mat4

    /**
     * Creates a new quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.newQuat(angle, ax, ay, az, raw)`
     * 
     * @param angle - An angle to use for the rotation, in radians.
     * @param ax - The x component of the axis of rotation.
     * @param ay - The y component of the axis of rotation.
     * @param az - The z component of the axis of rotation.
     * @param raw - Whether the components should be interpreted as raw `(x, y, z, w)` components.
     * @returns The new quaternion.
     */
    function newQuat(angle?: number, ax?: number, ay?: number, az?: number, raw?: boolean): quaternion

    /**
     * Creates a new quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.newQuat(r)`
     * 
     * @param r - An existing quaternion to copy the values from.
     * @returns The new quaternion.
     */
    function newQuat(r: quaternion): quaternion

    /**
     * Creates a new quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.newQuat(v)`
     * 
     * Uses the direction of a vector.
     * 
     * @param v - A normalized direction vector.
     * @returns The new quaternion.
     */
    function newQuat(v: vector): quaternion

    /**
     * Creates a new quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.newQuat(v, u)`
     * 
     * Sets the rotation to represent the rotation between two vectors.
     * 
     * @param v - A normalized direction vector.
     * @param u - Another normalized direction vector.
     * @returns The new quaternion.
     */
    function newQuat(v: vector, u: vector): quaternion

    /**
     * Creates a new quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.newQuat(m)`
     * 
     * @param m - A matrix to use the rotation from.
     * @returns The new quaternion.
     */
    function newQuat(m: Mat4): quaternion

    /**
     * Creates a new quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.newQuat()`
     * 
     * Set the quaternion to the identity (0, 0, 0, 1).
     * 
     * @returns The new quaternion.
     */
    function newQuat(): quaternion

    /**
     * Creates a new `RandomGenerator`, which can be used to generate random numbers. If you just want some random numbers, you can use `lovr.math.random`. Individual RandomGenerator objects are useful if you need more control over the random sequence used or need a random generator isolated from other instances.
     * 
     * `randomGenerator = lovr.math.newRandomGenerator()`
     * 
     * Create a RandomGenerator with a default seed.
     * 
     * @returns The new RandomGenerator.
     */
    function newRandomGenerator(): RandomGenerator

    /**
     * Creates a new `RandomGenerator`, which can be used to generate random numbers. If you just want some random numbers, you can use `lovr.math.random`. Individual RandomGenerator objects are useful if you need more control over the random sequence used or need a random generator isolated from other instances.
     * 
     * `randomGenerator = lovr.math.newRandomGenerator(seed)`
     * 
     * @param seed - The initial seed for the RandomGenerator.
     * @returns The new RandomGenerator.
     */
    function newRandomGenerator(seed: number): RandomGenerator

    /**
     * Creates a new `RandomGenerator`, which can be used to generate random numbers. If you just want some random numbers, you can use `lovr.math.random`. Individual RandomGenerator objects are useful if you need more control over the random sequence used or need a random generator isolated from other instances.
     * 
     * `randomGenerator = lovr.math.newRandomGenerator(low, high)`
     * 
     * This variant allows creation of random generators with precise 64-bit seed values, since Lua's number format loses precision with really big numbers.
     * 
     * @param low - The lower 32 bits of the seed.
     * @param high - The upper 32 bits of the seed.
     * @returns The new RandomGenerator.
     */
    function newRandomGenerator(low: number, high: number): RandomGenerator

    ///**
    // * Creates a new 2D vector.  This function takes the same arguments as `Vec2:set`.
    // * 
    // * `v = lovr.math.newVec2(x, y)`
    // * 
    // * @param x - The x value of the vector.
    // * @param y - The y value of the vector.
    // * @returns The new vector.
    // */
    //function newVec2(x?: number, y?: number): Vec2

    ///**
    // * Creates a new 2D vector.  This function takes the same arguments as `Vec2:set`.
    // * 
    // * `v = lovr.math.newVec2(u)`
    // * 
    // * @param u - A vector to copy the values from.
    // * @returns The new vector.
    // */
    //function newVec2(u: Vec2): Vec2

    /**
     * Creates a new 3D vector.  This function takes the same arguments as `Vec3:set`.
     * 
     * `v = lovr.math.newVec3(x, y, z)`
     * 
     * @param x - The x value of the vector.
     * @param y - The y value of the vector.
     * @param z - The z value of the vector.
     * @returns The new vector.
     */
    function newVec3(x?: number, y?: number, z?: number): vector

    /**
     * Creates a new 3D vector.  This function takes the same arguments as `Vec3:set`.
     * 
     * `v = lovr.math.newVec3(u)`
     * 
     * @param u - A vector to copy the values from.
     * @returns The new vector.
     */
    function newVec3(u: vector): vector

    /**
     * Creates a new 3D vector.  This function takes the same arguments as `Vec3:set`.
     * 
     * `v = lovr.math.newVec3(m)`
     * 
     * @param m - A matrix to use the position of.
     * @returns The new vector.
     */
    function newVec3(m: Mat4): vector

    /**
     * Creates a new 3D vector.  This function takes the same arguments as `Vec3:set`.
     * 
     * `v = lovr.math.newVec3(q)`
     * 
     * @param q - A quat to use the direction of.
     * @returns The new vector.
     */
    function newVec3(q: quaternion): vector

    ///**
    // * Creates a new 4D vector.  This function takes the same arguments as `Vec4:set`.
    // * 
    // * `v = lovr.math.newVec4(x, y, z, w)`
    // * 
    // * @param x - The x value of the vector.
    // * @param y - The y value of the vector.
    // * @param z - The z value of the vector.
    // * @param w - The w value of the vector.
    // * @returns The new vector.
    // */
    //function newVec4(x?: number, y?: number, z?: number, w?: number): Vec4

    ///**
    // * Creates a new 4D vector.  This function takes the same arguments as `Vec4:set`.
    // * 
    // * `v = lovr.math.newVec4(u)`
    // * 
    // * @param u - A vector to copy the values from.
    // * @returns The new vector.
    // */
    //function newVec4(u: Vec4): Vec4

    /**
     * Returns a 1D, 2D, 3D, or 4D simplex noise value.  The number will be between 0 and 1.
     * 
     * `noise = lovr.math.noise(x)`
     * 
     * @param x - The x coordinate of the input.
     * @returns The noise value, between 0 and 1.
     */
    function noise(x: number): number

    /**
     * Returns a 1D, 2D, 3D, or 4D simplex noise value.  The number will be between 0 and 1.
     * 
     * `noise = lovr.math.noise(x, y)`
     * 
     * @param x - The x coordinate of the input.
     * @param y - The y coordinate of the input.
     * @returns The noise value, between 0 and 1.
     */
    function noise(x: number, y: number): number

    /**
     * Returns a 1D, 2D, 3D, or 4D simplex noise value.  The number will be between 0 and 1.
     * 
     * `noise = lovr.math.noise(x, y, z)`
     * 
     * @param x - The x coordinate of the input.
     * @param y - The y coordinate of the input.
     * @param z - The z coordinate of the input.
     * @returns The noise value, between 0 and 1.
     */
    function noise(x: number, y: number, z: number): number

    /**
     * Returns a 1D, 2D, 3D, or 4D simplex noise value.  The number will be between 0 and 1.
     * 
     * `noise = lovr.math.noise(x, y, z, w)`
     * 
     * @param x - The x coordinate of the input.
     * @param y - The y coordinate of the input.
     * @param z - The z coordinate of the input.
     * @param w - The w coordinate of the input.
     * @returns The noise value, between 0 and 1.
     */
    function noise(x: number, y: number, z: number, w: number): number

    /**
     * Creates a temporary quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.quat(angle, ax, ay, az, raw)`
     * 
     * @param angle - An angle to use for the rotation, in radians.
     * @param ax - The x component of the axis of rotation.
     * @param ay - The y component of the axis of rotation.
     * @param az - The z component of the axis of rotation.
     * @param raw - Whether the components should be interpreted as raw `(x, y, z, w)` components.
     * @returns The new quaternion.
     */
    function quat(angle?: number, ax?: number, ay?: number, az?: number, raw?: boolean): quaternion

    /**
     * Creates a temporary quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.quat(r)`
     * 
     * @param r - An existing quaternion to copy the values from.
     * @returns The new quaternion.
     */
    function quat(r: quaternion): quaternion

    /**
     * Creates a temporary quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.quat(v)`
     * 
     * Uses the direction of a vector.
     * 
     * @param v - A normalized direction vector.
     * @returns The new quaternion.
     */
    function quat(v: vector): quaternion

    /**
     * Creates a temporary quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.quat(v, u)`
     * 
     * Sets the rotation to represent the rotation between two vectors.
     * 
     * @param v - A normalized direction vector.
     * @param u - Another normalized direction vector.
     * @returns The new quaternion.
     */
    function quat(v: vector, u: vector): quaternion

    /**
     * Creates a temporary quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.quat(m)`
     * 
     * @param m - A matrix to use the rotation from.
     * @returns The new quaternion.
     */
    function quat(m: Mat4): quaternion

    /**
     * Creates a temporary quaternion.  This function takes the same arguments as `Quat:set`.
     * 
     * `q = lovr.math.quat()`
     * 
     * Set the quaternion to the identity (0, 0, 0, 1).
     * 
     * @returns The new quaternion.
     */
    function quat(): quaternion

    /**
     * Returns a uniformly distributed pseudo-random number.  This function has improved randomness over Lua's `math.random` and also guarantees that the sequence of random numbers will be the same on all platforms (given the same seed).
     * 
     * `x = lovr.math.random()`
     * 
     * Generate a pseudo-random floating point number in the range `[0,1)`
     * 
     * @returns A pseudo-random number.
     * 
     * You can set the random seed using `lovr.math.setRandomSeed`.
     */
    function random(): number

    /**
     * Returns a uniformly distributed pseudo-random number.  This function has improved randomness over Lua's `math.random` and also guarantees that the sequence of random numbers will be the same on all platforms (given the same seed).
     * 
     * `x = lovr.math.random(high)`
     * 
     * Generate a pseudo-random integer in the range `[1,high]`
     * 
     * @param high - The maximum number to generate.
     * @returns A pseudo-random number.
     * 
     * You can set the random seed using `lovr.math.setRandomSeed`.
     */
    function random(high: number): number

    /**
     * Returns a uniformly distributed pseudo-random number.  This function has improved randomness over Lua's `math.random` and also guarantees that the sequence of random numbers will be the same on all platforms (given the same seed).
     * 
     * `x = lovr.math.random(low, high)`
     * 
     * Generate a pseudo-random integer in the range `[low,high]`
     * 
     * @param low - The minimum number to generate.
     * @param high - The maximum number to generate.
     * @returns A pseudo-random number.
     * 
     * You can set the random seed using `lovr.math.setRandomSeed`.
     */
    function random(low: number, high: number): number

    /**
     * Returns a pseudo-random number from a normal distribution (a bell curve).  You can control the center of the bell curve (the mean value) and the overall width (sigma, or standard deviation).
     * 
     * `x = lovr.math.randomNormal(sigma, mu)`
     * 
     * @param sigma - The standard deviation of the distribution.  This can be thought of how "wide" the range of numbers is or how much variability there is.
     * @param mu - The average value returned.
     * @returns A normally distributed pseudo-random number.
     */
    function randomNormal(sigma?: number, mu?: number): number

    /**
     * Seed the random generator with a new seed.  Each seed will cause `lovr.math.random` and `lovr.math.randomNormal` to produce a unique sequence of random numbers.  This is done once automatically at startup by `lovr.run`.
     * 
     * `lovr.math.setRandomSeed(seed)`
     * 
     * @param seed - The new seed.
     */
    function setRandomSeed(seed: number): void

    /**
     * Creates a temporary 2D vector.  This function takes the same arguments as `Vec2:set`.
     * 
     * `v = lovr.math.vec2(x, y)`
     * 
     * @param x - The x value of the vector.
     * @param y - The y value of the vector.
     * @returns The new vector.
     */
    function vec2(x?: number, y?: number): vector

    /**
     * Creates a temporary 2D vector.  This function takes the same arguments as `Vec2:set`.
     * 
     * `v = lovr.math.vec2(u)`
     * 
     * @param u - A vector to copy the values from.
     * @returns The new vector.
     */
    function vec2(u: vector): vector

    /**
     * Creates a temporary 3D vector.  This function takes the same arguments as `Vec3:set`.
     * 
     * `v = lovr.math.vec3(x, y, z)`
     * 
     * @param x - The x value of the vector.
     * @param y - The y value of the vector.
     * @param z - The z value of the vector.
     * @returns The new vector.
     */
    function vec3(x?: number, y?: number, z?: number): vector

    /**
     * Creates a temporary 3D vector.  This function takes the same arguments as `Vec3:set`.
     * 
     * `v = lovr.math.vec3(u)`
     * 
     * @param u - A vector to copy the values from.
     * @returns The new vector.
     */
    function vec3(u: vector): vector

    /**
     * Creates a temporary 3D vector.  This function takes the same arguments as `Vec3:set`.
     * 
     * `v = lovr.math.vec3(m)`
     * 
     * @param m - A matrix to use the position of.
     * @returns The new vector.
     */
    function vec3(m: Mat4): vector

    /**
     * Creates a temporary 3D vector.  This function takes the same arguments as `Vec3:set`.
     * 
     * `v = lovr.math.vec3(q)`
     * 
     * @param q - A quat to use the direction of.
     * @returns The new vector.
     */
    function vec3(q: quaternion): vector

    /**
     * Creates a temporary 4D vector.  This function takes the same arguments as `Vec4:set`.
     * 
     * `v = lovr.math.vec4(x, y, z, w)`
     * 
     * @param x - The x value of the vector.
     * @param y - The y value of the vector.
     * @param z - The z value of the vector.
     * @param w - The w value of the vector.
     * @returns The new vector.
     */
    function vec4(x?: number, y?: number, z?: number, w?: number): vector

    /**
     * Creates a temporary 4D vector.  This function takes the same arguments as `Vec4:set`.
     * 
     * `v = lovr.math.vec4(u)`
     * 
     * @param u - A vector to copy the values from.
     * @returns The new vector.
     */
    function vec4(u: vector): vector

  }

  namespace physics {
    /**
     * Creates a new BallJoint.
     * 
     * `ball = lovr.physics.newBallJoint(colliderA, colliderB, x, y, z)`
     * 
     * @param colliderA - The first collider to attach the Joint to, or `nil` to attach the joint to a fixed position in the World.
     * @param colliderB - The second collider to attach the Joint to.
     * @param x - The x position of the joint anchor point, in world coordinates.
     * @param y - The y position of the joint anchor point, in world coordinates.
     * @param z - The z position of the joint anchor point, in world coordinates.
     * @returns The new BallJoint.
     * 
     * A ball joint is like a ball and socket between the two colliders.  It tries to keep the distance between the colliders and the anchor position the same, but does not constrain the angle between them.
     * 
     * If the anchor is nil, the position of the first Collider is the anchor.  If the first collider is nil, then the position of the second Collider is the anchor.
     */
    function newBallJoint(colliderA: Collider, colliderB: Collider, x: number, y: number, z: number): BallJoint

    /**
     * Creates a new BallJoint.
     * 
     * `ball = lovr.physics.newBallJoint(colliderA, colliderB, anchor)`
     * 
     * @param colliderA - The first collider to attach the Joint to, or `nil` to attach the joint to a fixed position in the World.
     * @param colliderB - The second collider to attach the Joint to.
     * @param anchor - The joint anchor point, in world coordinates.
     * @returns The new BallJoint.
     * 
     * A ball joint is like a ball and socket between the two colliders.  It tries to keep the distance between the colliders and the anchor position the same, but does not constrain the angle between them.
     * 
     * If the anchor is nil, the position of the first Collider is the anchor.  If the first collider is nil, then the position of the second Collider is the anchor.
     */
    function newBallJoint(colliderA: Collider, colliderB: Collider, anchor: vector): BallJoint

    /**
     * Creates a new BoxShape.
     * 
     * `box = lovr.physics.newBoxShape(width, height, depth)`
     * 
     * @param width - The width of the box, in meters.
     * @param height - The height of the box, in meters.
     * @param depth - The depth of the box, in meters.
     * @returns The new BoxShape.
     * 
     * A Shape can be attached to a Collider using `Collider:addShape`.
     */
    function newBoxShape(width?: number, height?: number, depth?: number): BoxShape

    /**
     * Creates a new CapsuleShape.  Capsules are cylinders with hemispheres on each end.
     * 
     * `capsule = lovr.physics.newCapsuleShape(radius, length)`
     * 
     * @param radius - The radius of the capsule, in meters.
     * @param length - The length of the capsule, not including the caps, in meters.
     * @returns The new CapsuleShape.
     * 
     * A Shape can be attached to a Collider using `Collider:addShape`.
     */
    function newCapsuleShape(radius?: number, length?: number): CapsuleShape

    /**
     * Creates a new ConeJoint.
     * 
     * `cone = lovr.physics.newConeJoint(colliderA, colliderB, x, y, z, ax, ay, az)`
     * 
     * @param colliderA - The first collider to attach the Joint to, or `nil` to attach the joint to a fixed position in the World.
     * @param colliderB - The second collider to attach the Joint to.
     * @param x - The x position of the joint anchor point, in world space.
     * @param y - The y position of the joint anchor point, in world space.
     * @param z - The z position of the joint anchor point, in world space.
     * @param ax - The x component of the cone axis, in world space.
     * @param ay - The y component of the cone axis, in world space.
     * @param az - The z component of the cone axis, in world space.
     * @returns The new ConeJoint.
     * 
     * A ConeJoint is similar to a BallJoint, where the relative position between the colliders will be constrained to a single point.  However, the ConeJoint also limits the rotation away from the cone axis.  This can be useful for limb joints, ropes, etc.
     * 
     * If the anchor is nil, the position of the first Collider is the anchor.  If the first Collider is nil, the position of the second collider is the anchor.
     * 
     * If the axis is nil, it defaults to the direction between the anchor and the second Collider.
     */
    function newConeJoint(colliderA: Collider, colliderB: Collider, x: number, y: number, z: number, ax: number, ay: number, az: number): ConeJoint

    /**
     * Creates a new ConeJoint.
     * 
     * `cone = lovr.physics.newConeJoint(colliderA, colliderB, anchor, axis)`
     * 
     * @param colliderA - The first collider to attach the Joint to, or `nil` to attach the joint to a fixed position in the World.
     * @param colliderB - The second collider to attach the Joint to.
     * @param anchor - The joint anchor point, in world space.
     * @param axis - The cone axis, in world space.
     * @returns The new ConeJoint.
     * 
     * A ConeJoint is similar to a BallJoint, where the relative position between the colliders will be constrained to a single point.  However, the ConeJoint also limits the rotation away from the cone axis.  This can be useful for limb joints, ropes, etc.
     * 
     * If the anchor is nil, the position of the first Collider is the anchor.  If the first Collider is nil, the position of the second collider is the anchor.
     * 
     * If the axis is nil, it defaults to the direction between the anchor and the second Collider.
     */
    function newConeJoint(colliderA: Collider, colliderB: Collider, anchor: vector, axis: vector): ConeJoint

    /**
     * Creates a new ConvexShape.
     * 
     * `shape = lovr.physics.newConvexShape(points, scale)`
     * 
     * @param points - A list of vertices to compute a convex hull from.  Can be a table of tables (each with 3 numbers) or a table of numbers (every 3 numbers form a 3D point).
     * @param scale - A scale to apply to the points.
     * @returns The new ConvexShape.
     */
    function newConvexShape(points: LuaTable, scale?: number): ConvexShape

    /**
     * Creates a new ConvexShape.
     * 
     * `shape = lovr.physics.newConvexShape(object, scale)`
     * 
     * @param object - An object to use for the points of the convex hull.
     * @param scale - A scale to apply to the points.
     * @returns The new ConvexShape.
     */
    function newConvexShape(object: ModelData | Model | Mesh, scale?: number): ConvexShape

    /**
     * Creates a new ConvexShape.
     * 
     * `shape = lovr.physics.newConvexShape(template, scale)`
     * 
     * Clones an existing ConvexShape, which is faster than passing the same points multiple times. Clones can have their own scale.  The clone's scale doesn't get multiplied with the scale of the template.
     * 
     * @param template - An existing ConvexShape to clone.
     * @param scale - A scale to apply to the points.
     * @returns The new ConvexShape.
     */
    function newConvexShape(template: ConvexShape, scale?: number): ConvexShape

    /**
     * Creates a new CylinderShape.
     * 
     * `cylinder = lovr.physics.newCylinderShape(radius, length)`
     * 
     * @param radius - The radius of the cylinder, in meters.
     * @param length - The length of the cylinder, in meters.
     * @returns The new CylinderShape.
     * 
     * A Shape can be attached to a Collider using `Collider:addShape`.
     */
    function newCylinderShape(radius?: number, length?: number): CylinderShape

    /**
     * Creates a new DistanceJoint.
     * 
     * `joint = lovr.physics.newDistanceJoint(colliderA, colliderB, x1, y1, z1, x2, y2, z2)`
     * 
     * @param colliderA - The first collider to attach the Joint to, or `nil` to attach the joint to a fixed position in the World.
     * @param colliderB - The second collider to attach the Joint to.
     * @param x1 - The x position of the first anchor point, in world coordinates.
     * @param y1 - The y position of the first anchor point, in world coordinates.
     * @param z1 - The z position of the first anchor point, in world coordinates.
     * @param x2 - The x position of the second anchor point, in world coordinates.
     * @param y2 - The y position of the second anchor point, in world coordinates.
     * @param z2 - The z position of the second anchor point, in world coordinates.
     * @returns The new DistanceJoint.
     * 
     * A distance joint tries to keep the two colliders a fixed distance apart.  The distance is determined by the initial distance between the anchor points.  The joint allows for rotation on the anchor points.
     * 
     * If no anchors are given, they default to the positions of the Colliders.
     */
    function newDistanceJoint(colliderA: Collider, colliderB: Collider, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): DistanceJoint

    /**
     * Creates a new DistanceJoint.
     * 
     * `joint = lovr.physics.newDistanceJoint(colliderA, colliderB, first, second)`
     * 
     * @param colliderA - The first collider to attach the Joint to, or `nil` to attach the joint to a fixed position in the World.
     * @param colliderB - The second collider to attach the Joint to.
     * @param first - The first anchor point, in world coordinates.
     * @param second - The second anchor point, in world coordinates.
     * @returns The new DistanceJoint.
     * 
     * A distance joint tries to keep the two colliders a fixed distance apart.  The distance is determined by the initial distance between the anchor points.  The joint allows for rotation on the anchor points.
     * 
     * If no anchors are given, they default to the positions of the Colliders.
     */
    function newDistanceJoint(colliderA: Collider, colliderB: Collider, first: vector, second: vector): DistanceJoint

    /**
     * Creates a new HingeJoint.
     * 
     * `hinge = lovr.physics.newHingeJoint(colliderA, colliderB, x, y, z, ax, ay, az)`
     * 
     * @param colliderA - The first collider to attach the Joint to, or `nil` to attach the joint to a fixed position in the World.
     * @param colliderB - The second collider to attach the Joint to.
     * @param x - The x position of the hinge anchor, in world coordinates.
     * @param y - The y position of the hinge anchor, in world coordinates.
     * @param z - The z position of the hinge anchor, in world coordinates.
     * @param ax - The x component of the hinge axis direction.
     * @param ay - The y component of the hinge axis direction.
     * @param az - The z component of the hinge axis direction.
     * @returns The new HingeJoint.
     * 
     * A hinge joint constrains two colliders to allow rotation only around the hinge's axis.
     * 
     * If the anchor is nil, the position of the first Collider is the anchor.  If the first Collider is nil, the position of the second collider is the anchor.
     * 
     * If the axis is nil, it defaults to the direction between the anchor and the second Collider.
     */
    function newHingeJoint(colliderA: Collider, colliderB: Collider, x: number, y: number, z: number, ax: number, ay: number, az: number): HingeJoint

    /**
     * Creates a new HingeJoint.
     * 
     * `hinge = lovr.physics.newHingeJoint(colliderA, colliderB, anchor, axis)`
     * 
     * @param colliderA - The first collider to attach the Joint to, or `nil` to attach the joint to a fixed position in the World.
     * @param colliderB - The second collider to attach the Joint to.
     * @param anchor - The anchor point, in world coordinates.
     * @param axis - The hinge axis direction.
     * @returns The new HingeJoint.
     * 
     * A hinge joint constrains two colliders to allow rotation only around the hinge's axis.
     * 
     * If the anchor is nil, the position of the first Collider is the anchor.  If the first Collider is nil, the position of the second collider is the anchor.
     * 
     * If the axis is nil, it defaults to the direction between the anchor and the second Collider.
     */
    function newHingeJoint(colliderA: Collider, colliderB: Collider, anchor: vector, axis: vector): HingeJoint

    /**
     * Creates a new MeshShape.
     * 
     * `mesh = lovr.physics.newMeshShape(vertices, indices, scale)`
     * 
     * @param vertices - The table of vertices in the mesh.  Each vertex is a table with 3 numbers.
     * @param indices - A table of triangle indices representing how the vertices are connected in the Mesh.
     * @param scale - A scale to apply to the mesh vertices.
     * @returns The new MeshShape.
     */
    function newMeshShape(vertices: LuaTable, indices: LuaTable, scale?: number): MeshShape

    /**
     * Creates a new MeshShape.
     * 
     * `mesh = lovr.physics.newMeshShape(object, scale)`
     * 
     * @param object - An object to use the triangles from.  Meshes must use the `cpu` storage mode.
     * @param scale - A scale to apply to the mesh vertices.
     * @returns The new MeshShape.
     */
    function newMeshShape(object: ModelData | Model | Mesh, scale?: number): MeshShape

    /**
     * Creates a new MeshShape.
     * 
     * `mesh = lovr.physics.newMeshShape(template, scale)`
     * 
     * Clones an existing MeshShape, which is faster than passing the same mesh multiple times. Clones can have their own scale.  The clone's scale doesn't get multiplied with the scale of the template.
     * 
     * @param template - An existing MeshShape to clone.
     * @param scale - A scale to apply to the mesh vertices.
     * @returns The new MeshShape.
     */
    function newMeshShape(template: MeshShape, scale?: number): MeshShape

    /**
     * Creates a new SliderJoint.
     * 
     * `slider = lovr.physics.newSliderJoint(colliderA, colliderB, ax, ay, az)`
     * 
     * @param colliderA - The first collider to attach the Joint to, or `nil` to attach the joint to a fixed position in the World.
     * @param colliderB - The second collider to attach the Joint to.
     * @param ax - The x component of the slider axis.
     * @param ay - The y component of the slider axis.
     * @param az - The z component of the slider axis.
     * @returns The new SliderJoint.
     * 
     * A slider joint constrains two colliders to only allow movement along the slider's axis.
     */
    function newSliderJoint(colliderA: Collider, colliderB: Collider, ax: number, ay: number, az: number): SliderJoint

    /**
     * Creates a new SliderJoint.
     * 
     * `slider = lovr.physics.newSliderJoint(colliderA, colliderB, axis)`
     * 
     * @param colliderA - The first collider to attach the Joint to, or `nil` to attach the joint to a fixed position in the World.
     * @param colliderB - The second collider to attach the Joint to.
     * @param axis - The slider axis direction.
     * @returns The new SliderJoint.
     * 
     * A slider joint constrains two colliders to only allow movement along the slider's axis.
     */
    function newSliderJoint(colliderA: Collider, colliderB: Collider, axis: vector): SliderJoint

    /**
     * Creates a new SphereShape.
     * 
     * `sphere = lovr.physics.newSphereShape(radius)`
     * 
     * @param radius - The radius of the sphere, in meters.
     * @returns The new SphereShape.
     * 
     * A Shape can be attached to a Collider using `Collider:addShape`.
     */
    function newSphereShape(radius?: number): SphereShape

    /**
     * Creates a new TerrainShape.
     * 
     * `terrain = lovr.physics.newTerrainShape(scale)`
     * 
     * Create a flat floor collider.
     * 
     * @param scale - The width and depth of the terrain, in meters.
     * @returns The new TerrainShape.
     * 
     * A Shape can be attached to a Collider using `Collider:addShape`. For immobile terrain use the `Collider:setKinematic`.
     */
    function newTerrainShape(scale: number): TerrainShape

    /**
     * Creates a new TerrainShape.
     * 
     * `terrain = lovr.physics.newTerrainShape(scale, heightmap, stretch)`
     * 
     * Create terrain from a heightmap image.
     * 
     * @param scale - The width and depth of the terrain, in meters.
     * @param heightmap - A heightmap image describing the terrain elevation at different points.  The red channel brightness of each pixel determines the elevation at corresponding coordinates.
     * @param stretch - A vertical multiplier for height values to obtain terrain height.  When the image format has pixel values only in the 0 to 1 range, this can be used to scale the height to meters.
     * @returns The new TerrainShape.
     * 
     * A Shape can be attached to a Collider using `Collider:addShape`. For immobile terrain use the `Collider:setKinematic`.
     */
    function newTerrainShape(scale: number, heightmap: Image, stretch?: number): TerrainShape

    /**
     * Creates a new TerrainShape.
     * 
     * `terrain = lovr.physics.newTerrainShape(scale, callback, samples)`
     * 
     * Create terrain defined with a callback function.
     * 
     * @param scale - The width and depth of the terrain, in meters.
     * @param callback - A function that computes terrain height from x and z coordinates.  The x and z inputs will range from `-scale / 2` to `scale / 2`.
     * @param samples - The number of samples taken across the x and z dimensions.  More samples will result in higher terrain fidelity, but use more CPU and memory.
     * @returns The new TerrainShape.
     * 
     * A Shape can be attached to a Collider using `Collider:addShape`. For immobile terrain use the `Collider:setKinematic`.
     */
    function newTerrainShape(scale: number, callback: (this: void, ...args: any[]) => any, samples?: number): TerrainShape

    /**
     * Creates a new WeldJoint.
     * 
     * `joint = lovr.physics.newWeldJoint(colliderA, colliderB)`
     * 
     * @param colliderA - The first collider to attach the Joint to, or `nil` to attach the joint to a fixed position in the World.
     * @param colliderB - The second collider to attach the Joint to.
     * @returns The new WeldJoint.
     * 
     * The joint will try to keep the Colliders in the relative pose they were at when the joint was created.
     */
    function newWeldJoint(colliderA: Collider, colliderB: Collider): WeldJoint

    /**
     * Creates a new physics World.
     * 
     * `world = lovr.physics.newWorld(settings)`
     * 
     * @param settings - An optional table with settings for the physics simulation.
     * @returns A whole new World.
     */
    function newWorld(settings?: { tags?: LuaTable, staticTags?: LuaTable, maxColliders?: number, threadSafe?: boolean, allowSleep?: boolean, stabilization?: number, maxOverlap?: number, restitutionThreshold?: number, velocitySteps?: number, positionSteps?: number, }): World

  }

  namespace system {
    /**
     * Returns the clipboard text.
     * 
     * `text = lovr.system.getClipboardText()`
     * 
     * @returns The clipboard text.
     */
    function getClipboardText(): string | undefined

    /**
     * Returns the number of logical cores on the system.
     * 
     * `cores = lovr.system.getCoreCount()`
     * 
     * @returns The number of logical cores on the system.
     */
    function getCoreCount(): number

    /**
     * Returns the position of the mouse.
     * 
     * `[x, y] = lovr.system.getMousePosition()`
     * 
     * @returns 
     * x - The x position of the mouse, relative to the top-left of the window.
     * y - The y position of the mouse, relative to the top-left of the window.
     */
    function getMousePosition(): LuaMultiReturn<[x: number, y: number]>

    /**
     * Returns the x position of the mouse.
     * 
     * `x = lovr.system.getMouseX()`
     * 
     * @returns The x position of the mouse, relative to the top-left of the window.
     */
    function getMouseX(): number

    /**
     * Returns the y position of the mouse.
     * 
     * `y = lovr.system.getMouseY()`
     * 
     * @returns The y position of the mouse, relative to the top-left of the window.
     */
    function getMouseY(): number

    /**
     * Returns the current operating system.
     * 
     * `os = lovr.system.getOS()`
     * 
     * @returns Either "Windows", "macOS", "Linux", "Android" or "Web".
     */
    function getOS(): string

    /**
     * Returns the window pixel density.  High DPI windows will usually return 2.0 to indicate that there are 2 pixels for every window coordinate in each axis.  On a normal display, 1.0 is returned, indicating that window coordinates match up with pixels 1:1.
     * 
     * `density = lovr.system.getWindowDensity()`
     * 
     * @returns The pixel density of the window.
     */
    function getWindowDensity(): number

    /**
     * Returns the dimensions of the desktop window.
     * 
     * `[width, height] = lovr.system.getWindowDimensions()`
     * 
     * @returns 
     * width - The width of the desktop window.
     * height - The height of the desktop window.
     * 
     * If the window is not open, this will return zeros.
     */
    function getWindowDimensions(): LuaMultiReturn<[width: number, height: number]>

    /**
     * Returns the height of the desktop window.
     * 
     * `width = lovr.system.getWindowHeight()`
     * 
     * @returns The height of the desktop window.
     * 
     * If the window is not open, this will return zero.
     */
    function getWindowHeight(): number

    /**
     * Returns the width of the desktop window.
     * 
     * `width = lovr.system.getWindowWidth()`
     * 
     * @returns The width of the desktop window.
     * 
     * If the window is not open, this will return zero.
     */
    function getWindowWidth(): number

    /**
     * Returns whether key repeat is enabled.
     * 
     * `enabled = lovr.system.hasKeyRepeat()`
     * 
     * @returns Whether key repeat is enabled.
     * 
     * Key repeat is disabled by default.
     */
    function hasKeyRepeat(): boolean

    /**
     * Returns whether a key on the keyboard is pressed.
     * 
     * `down = lovr.system.isKeyDown(...)`
     * 
     * @param ... - The set of keys to check.
     * @returns Whether any of the keys are currently pressed.
     */
    function isKeyDown(...rest: KeyCode[]): boolean

    /**
     * Returns whether a mouse button is currently pressed.
     * 
     * `down = lovr.system.isMouseDown(button)`
     * 
     * @param button - The index of a button to check.  Use 1 for the primary mouse button, 2 for the secondary button, and 3 for the middle button.  Other indices can be used, but are hardware-specific.
     * @returns Whether the mouse button is currently down.
     */
    function isMouseDown(button: number): boolean

    /**
     * Returns whether the desktop window is focused.
     * 
     * `focused = lovr.system.isWindowFocused()`
     * 
     * @returns Whether the desktop window is focused.
     */
    function isWindowFocused(): boolean

    /**
     * Returns whether the desktop window is open.  `t.window` can be set to `nil` in `lovr.conf` to disable automatic opening of the window.  In this case, the window can be opened manually using `lovr.system.openWindow`.
     * 
     * `open = lovr.system.isWindowOpen()`
     * 
     * @returns Whether the desktop window is open.
     */
    function isWindowOpen(): boolean

    /**
     * Returns whether the desktop window is visible (open and not minimized).
     * 
     * `visible = lovr.system.isWindowVisible()`
     * 
     * @returns Whether the desktop window is visible.
     */
    function isWindowVisible(): boolean

    /**
     * Opens the desktop window.  If the window is already open, this function does nothing.
     * 
     * `lovr.system.openWindow(options)`
     * 
     * @param options - Window options.
     * 
     * By default, the window is opened automatically, but this can be disabled by setting `t.window` to `nil` in `conf.lua`.
     */
    function openWindow(options: { width?: number, height?: number, fullscreen: boolean, resizable: boolean, title: string, icon: string, }): void

    /**
     * Fills the event queue with unprocessed events from the operating system.  This function should be called often, otherwise the operating system will consider the application unresponsive. This function is called in the default implementation of `lovr.run`, and the events are later processed by `lovr.event.poll`.
     * 
     * `lovr.system.pollEvents()`
     */
    function pollEvents(): void

    /**
     * Requests permission to use a feature.  Usually this will pop up a dialog box that the user needs to confirm.  Once the permission request has been acknowledged, the `lovr.permission` callback will be called with the result.  Currently, this is only used for requesting microphone access on Android devices.
     * 
     * `lovr.system.requestPermission(permission)`
     * 
     * @param permission - The permission to request.
     */
    function requestPermission(permission: Permission): void

    /**
     * Sets the clipboard text.
     * 
     * `lovr.system.setClipboardText(text)`
     * 
     * @param text - The string to set as the clipboard text.
     */
    function setClipboardText(text: string): void

    /**
     * Enables or disables key repeat.  Key repeat affects whether `lovr.keypressed` will be fired multiple times while a key is held down.  The `repeat` parameter of the callback can be used to detect whether a key press comes from a "repeat" or not.
     * 
     * `lovr.system.setKeyRepeat(enable)`
     * 
     * @param enable - Whether key repeat should be enabled.
     * 
     * Key repeat is disabled by default.  `lovr.textinput` is not affected by key repeat.
     */
    function setKeyRepeat(enable: boolean): void

    /**
     * Returns whether a key on the keyboard was pressed this frame.
     * 
     * `pressed = lovr.system.wasKeyPressed(...)`
     * 
     * @param ... - The set of keys to check.
     * @returns Whether any of the specified keys were pressed this frame.
     * 
     * Technically this returns whether the key was pressed between the last 2 calls to `lovr.system.pollEvents`, but that function is called automatically at the beginning of each frame in `lovr.run`, so it all works out!
     */
    function wasKeyPressed(...rest: KeyCode[]): boolean

    /**
     * Returns whether a key on the keyboard was released this frame.
     * 
     * `released = lovr.system.wasKeyReleased(...)`
     * 
     * @param ... - The set of keys to check.
     * @returns Whether any of the specified keys were released this frame.
     * 
     * Technically this returns whether the key was released between the last 2 calls to `lovr.system.pollEvents`, but that function is called automatically at the beginning of each frame in `lovr.run`, so it all works out!
     */
    function wasKeyReleased(...rest: KeyCode[]): boolean

    /**
     * Returns whether a button on the mouse was pressed this frame.
     * 
     * `pressed = lovr.system.wasMousePressed(button)`
     * 
     * @param button - The index of a button to check.  Use 1 for the primary mouse button, 2 for the secondary button, and 3 for the middle button.  Other indices can be used, but are hardware-specific.
     * @returns Whether the mouse button was pressed this frame.
     * 
     * Technically this returns whether the button was pressed between the last 2 calls to `lovr.system.pollEvents`, but that function is called automatically at the beginning of each frame in `lovr.run`, so it all works out!
     */
    function wasMousePressed(button: number): boolean

    /**
     * Returns whether a button on the mouse was released this frame.
     * 
     * `released = lovr.system.wasMouseReleased(button)`
     * 
     * @param button - The index of a button to check.  Use 1 for the primary mouse button, 2 for the secondary button, and 3 for the middle button.  Other indices can be used, but are hardware-specific.
     * @returns Whether the mouse button was released this frame.
     * 
     * Technically this returns whether the button was released between the last 2 calls to `lovr.system.pollEvents`, but that function is called automatically at the beginning of each frame in `lovr.run`, so it all works out!
     */
    function wasMouseReleased(button: number): boolean

  }

  namespace thread {
    /**
     * Returns a named Channel for communicating between threads.
     * 
     * `channel = lovr.thread.getChannel(name)`
     * 
     * @param name - The name of the Channel to get.
     * @returns The Channel with the specified name.
     */
    function getChannel(name: string): Channel

    /**
     * Creates a new unnamed `Channel` object.  Usually it's more convenient to use `lovr.thread.getChannel`, since other threads can use that function to query the channel by name.  Unnamed channels don't require a unique name, but they need to be sent to other threads somehow (e.g. on a different Channel or as an argument to `Thread:start`).
     * 
     * `channel = lovr.thread.newChannel()`
     * 
     * @returns The new Channel.
     */
    function newChannel(): Channel

    /**
     * Creates a new Thread from Lua code.
     * 
     * `thread = lovr.thread.newThread(code)`
     * 
     * @param code - The code to run in the Thread.
     * @returns The new Thread.
     * 
     * The Thread won\'t start running immediately.  Use `Thread:start` to start it.
     * 
     * The string argument is assumed to be a filename if there isn't a newline in the first 1024 characters.  For really short thread code, an extra newline can be added to trick LÖVR into loading it properly.
     */
    function newThread(code: string): Thread

    /**
     * Creates a new Thread from Lua code.
     * 
     * `thread = lovr.thread.newThread(file)`
     * 
     * @param file - A filename or Blob containing code to run in the Thread.
     * @returns The new Thread.
     * 
     * The Thread won\'t start running immediately.  Use `Thread:start` to start it.
     * 
     * The string argument is assumed to be a filename if there isn't a newline in the first 1024 characters.  For really short thread code, an extra newline can be added to trick LÖVR into loading it properly.
     */
    function newThread(file: string | Blob): Thread

  }

  namespace timer {
    /**
     * Returns the average delta over the last second.
     * 
     * `delta = lovr.timer.getAverageDelta()`
     * 
     * @returns The average delta, in seconds.
     */
    function getAverageDelta(): number

    /**
     * Returns the time between the last two frames.  This is the same value as the `dt` argument provided to `lovr.update` when VR is disabled.  When VR is enabled, the `dt` will instead be `lovr.headset.getDeltaTime`.
     * 
     * `dt = lovr.timer.getDelta()`
     * 
     * @returns The delta time, in seconds.
     * 
     * The return value of this function will remain the same until `lovr.timer.step` is called.  This function should not be used to measure times for game behavior or benchmarking, use `lovr.timer.getTime` for that.
     */
    function getDelta(): number

    /**
     * Returns the current frames per second, averaged over the last 90 frames.
     * 
     * `fps = lovr.timer.getFPS()`
     * 
     * @returns The current FPS.
     */
    function getFPS(): number

    /**
     * Returns the time since some time in the past.  This can be used to measure the difference between two points in time.
     * 
     * `time = lovr.timer.getTime()`
     * 
     * @returns The current time, in seconds.
     */
    function getTime(): number

    /**
     * Sleeps the application for a specified number of seconds.  While the game is asleep, no code will be run, no graphics will be drawn, and the window will be unresponsive.
     * 
     * `lovr.timer.sleep(duration)`
     * 
     * @param duration - The number of seconds to sleep for.
     */
    function sleep(duration: number): void

    /**
     * Steps the timer, returning the new delta time.  This is called automatically in `lovr.run` and it's used to calculate the new `dt` to pass to `lovr.update`.
     * 
     * `delta = lovr.timer.step()`
     * 
     * @returns The amount of time since the last call to this function, in seconds.
     */
    function step(): number

  }

  namespace utf8 {
  }
}

/**
 * The superclass of all LÖVR objects.  All objects have these methods.
 * 
 * Note that the functions here don't apply to any vector objects, see `Vectors`.
 */
declare interface LovrObject {
  /**
   * Immediately destroys Lua's reference to the object it's called on.  After calling this function on an object, it is an error to do anything with the object from Lua (call methods on it, pass it to other functions, etc.).  If nothing else is using the object, it will be destroyed immediately, which can be used to destroy something earlier than it would normally be garbage collected in order to reduce memory.
   * 
   * `Object.release()`
   * 
   * The object may not be destroyed immediately if something else is referring to it (e.g. it is pushed to a Channel or exists in the payload of a pending event).
   */
  release(): void

  /**
   * Returns the name of the object's type as a string.
   * 
   * `type = Object.type()`
   * 
   * @returns The type of the object.
   */
  type(): string

}

/** Different types of audio material presets, for use with `lovr.audio.setGeometry`. */
declare type AudioMaterial = 'generic' | 'brick' | 'carpet' | 'ceramic' | 'concrete' | 'glass' | 'gravel' | 'metal' | 'plaster' | 'rock' | 'wood'

/** Audio devices can be created in shared mode or exclusive mode.  In exclusive mode, the audio device is the only one active on the system, which gives better performance and lower latency. However, exclusive devices aren't always supported and might not be allowed, so there is a higher chance that creating one will fail. */
declare type AudioShareMode = 'shared' | 'exclusive'

/** When referencing audio devices, this indicates whether it's the playback or capture device. */
declare type AudioType = 'playback' | 'capture'

/**
 * Different types of effects that can be applied with `Source:setEffectEnabled`.
 * 
 * The active spatializer will determine which effects are supported.  If an unsupported effect is enabled on a Source, no error will be reported.  Instead, it will be silently ignored.
 * 
 * See `lovr.audio.getSpatializer` for a table of the supported effects for each spatializer.
 */
declare type Effect = 'absorption' | 'attenuation' | 'occlusion' | 'reverb' | 'spatialization' | 'transmission'

/** When figuring out how long a Source is or seeking to a specific position in the sound file, units can be expressed in terms of seconds or in terms of frames.  A frame is one set of samples for each channel (one sample for mono, two samples for stereo). */
declare type TimeUnit = 'seconds' | 'frames'

/** When accessing the volume of Sources or the audio listener, this can be done in linear units with a 0 to 1 range, or in decibels with a range of -∞ to 0. */
declare type VolumeUnit = 'linear' | 'db'

/**
 * A Source is an object representing a single sound.  Currently ogg, wav, and mp3 formats are supported.
 * 
 * When a Source is playing, it will send audio to the speakers.  Sources do not play automatically when they are created.  Instead, the `play`, `pause`, and `stop` functions can be used to control when they should play.
 * 
 * `Source:seek` and `Source:tell` can be used to control the playback position of the Source.  A Source can be set to loop when it reaches the end using `Source:setLooping`.
 */
declare interface Source extends LovrObject {
  /**
   * Creates a copy of the Source, referencing the same `Sound` object and inheriting all of the settings of this Source.  However, it will be created in the stopped state and will be rewound to the beginning.
   * 
   * `source = Source.clone()`
   * 
   * @returns A genetically identical copy of the Source.
   * 
   * This is a good way to create multiple Sources that play the same sound, since the audio data won't be loaded multiple times and can just be reused.  You can also create multiple `Source` objects and pass in the same `Sound` object for each one, which will have the same effect.
   */
  clone(): Source

  /**
   * Returns the directivity settings for the Source.
   * 
   * The directivity is controlled by two parameters: the weight and the power.
   * 
   * The weight is a number between 0 and 1 controlling the general "shape" of the sound emitted. 0.0 results in a completely omnidirectional sound that can be heard from all directions.  1.0 results in a full dipole shape that can be heard only from the front and back.  0.5 results in a cardioid shape that can only be heard from one direction.  Numbers in between will smoothly transition between these.
   * 
   * The power is a number that controls how "focused" or sharp the shape is.  Lower power values can be heard from a wider set of angles.  It is an exponent, so it can get arbitrarily large.  Note that a power of zero will still result in an omnidirectional source, regardless of the weight.
   * 
   * `[weight, power] = Source.getDirectivity()`
   * 
   * @returns 
   * weight - The dipole weight.  0.0 is omnidirectional, 1.0 is a dipole, 0.5 is cardioid.
   * power - The dipole power, controlling how focused the directivity shape is.
   */
  getDirectivity(): LuaMultiReturn<[weight: number, power: number]>

  /**
   * Returns the duration of the Source.
   * 
   * `duration = Source.getDuration(unit)`
   * 
   * @param unit - The unit to return.
   * @returns The duration of the Source.
   */
  getDuration(unit?: TimeUnit): number

  /**
   * Returns the orientation of the Source, in angle/axis representation.
   * 
   * `[angle, ax, ay, az] = Source.getOrientation()`
   * 
   * @returns 
   * angle - The number of radians the Source is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getOrientation(): LuaMultiReturn<[angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the pitch of the Source.
   * 
   * `pitch = Source.getPitch()`
   * 
   * @returns The pitch.
   * 
   * The default pitch is 1.  Every doubling/halving of the pitch will raise/lower the pitch by one octave.  Changing the pitch also changes the playback speed.
   */
  getPitch(): number

  /**
   * Returns the position and orientation of the Source.
   * 
   * `[x, y, z, angle, ax, ay, az] = Source.getPose()`
   * 
   * @returns 
   * x - The x position of the Source, in meters.
   * y - The y position of the Source, in meters.
   * z - The z position of the Source, in meters.
   * angle - The number of radians the Source is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getPose(): LuaMultiReturn<[x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the position of the Source, in meters.  Setting the position will cause the Source to be distorted and attenuated based on its position relative to the listener.
   * 
   * `[x, y, z] = Source.getPosition()`
   * 
   * @returns 
   * x - The x coordinate.
   * y - The y coordinate.
   * z - The z coordinate.
   */
  getPosition(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the radius of the Source, in meters.
   * 
   * This does not control falloff or attenuation.  It is only used for smoothing out occlusion.  If a Source doesn't have a radius, then when it becomes occluded by a wall its volume will instantly drop.  Giving the Source a radius that approximates its emitter's size will result in a smooth transition between audible and occluded, improving realism.
   * 
   * `radius = Source.getRadius()`
   * 
   * @returns The radius of the Source, in meters.
   */
  getRadius(): number

  /**
   * Returns the `Sound` object backing the Source.  Multiple Sources can share one Sound, allowing its data to only be loaded once.  An easy way to do this sharing is by using `Source:clone`.
   * 
   * `sound = Source.getSound()`
   * 
   * @returns The Sound object.
   */
  getSound(): Sound

  /**
   * Returns the current volume factor for the Source.
   * 
   * `volume = Source.getVolume(units)`
   * 
   * @param units - The units to return (linear or db).
   * @returns The volume of the Source.
   */
  getVolume(units?: VolumeUnit): number

  /**
   * Returns whether a given `Effect` is enabled for the Source.
   * 
   * `enabled = Source.isEffectEnabled(effect)`
   * 
   * @param effect - The effect.
   * @returns Whether the effect is enabled.
   * 
   * The active spatializer will determine which effects are supported.  If an unsupported effect is enabled on a Source, no error will be reported.  Instead, it will be silently ignored.  See `lovr.audio.getSpatializer` for a table showing the effects supported by each spatializer.
   * 
   * Calling this function on a non-spatial Source will always return false.
   */
  isEffectEnabled(effect: Effect): boolean

  /**
   * Returns whether or not the Source will loop when it finishes.
   * 
   * `looping = Source.isLooping()`
   * 
   * @returns Whether or not the Source is looping.
   */
  isLooping(): boolean

  /**
   * Returns whether or not the Source is playing.
   * 
   * `playing = Source.isPlaying()`
   * 
   * @returns Whether the Source is playing.
   */
  isPlaying(): boolean

  /**
   * Returns whether the Source was created with the `spatial` flag.  Non-spatial sources are routed directly to the speakers and can not use effects.
   * 
   * `spatial = Source.isSpatial()`
   * 
   * @returns Whether the source is spatial.
   */
  isSpatial(): boolean

  /**
   * Pauses the source.  It can be resumed with `Source:resume` or `Source:play`. If a paused source is rewound, it will remain paused.
   * 
   * `Source.pause()`
   */
  pause(): void

  /**
   * Plays the Source.  This doesn't do anything if the Source is already playing.
   * 
   * `success = Source.play()`
   * 
   * @returns Whether the Source successfully started playing.
   * 
   * There is a maximum of 64 Sources that can be playing at once.  If 64 Sources are already playing, this function will return `false`.
   */
  play(): boolean

  /**
   * Seeks the Source to the specified position.
   * 
   * `Source.seek(position, unit)`
   * 
   * @param position - The position to seek to.
   * @param unit - The units for the seek position.
   * 
   * Seeking a Source backed by a stream `Sound` has no meaningful effect.
   */
  seek(position: number, unit?: TimeUnit): void

  /**
   * Sets the directivity settings for the Source.
   * 
   * The directivity is controlled by two parameters: the weight and the power.
   * 
   * The weight is a number between 0 and 1 controlling the general "shape" of the sound emitted. 0.0 results in a completely omnidirectional sound that can be heard from all directions.  1.0 results in a full dipole shape that can be heard only from the front and back.  0.5 results in a cardioid shape that can only be heard from one direction.  Numbers in between will smoothly transition between these.
   * 
   * The power is a number that controls how "focused" or sharp the shape is.  Lower power values can be heard from a wider set of angles.  It is an exponent, so it can get arbitrarily large.  Note that a power of zero will still result in an omnidirectional source, regardless of the weight.
   * 
   * `Source.setDirectivity(weight, power)`
   * 
   * @param weight - The dipole weight.  0.0 is omnidirectional, 1.0 is a dipole, 0.5 is cardioid.
   * @param power - The dipole power, controlling how focused the directivity shape is.
   */
  setDirectivity(weight: number, power: number): void

  /**
   * Enables or disables an effect on the Source.
   * 
   * `Source.setEffectEnabled(effect, enable)`
   * 
   * @param effect - The effect.
   * @param enable - Whether the effect should be enabled.
   * 
   * The active spatializer will determine which effects are supported.  If an unsupported effect is enabled on a Source, no error will be reported.  Instead, it will be silently ignored.  See `lovr.audio.getSpatializer` for a table showing the effects supported by each spatializer.
   * 
   * Calling this function on a non-spatial Source will throw an error.
   */
  setEffectEnabled(effect: Effect, enable: boolean): void

  /**
   * Sets whether or not the Source loops.
   * 
   * `Source.setLooping(loop)`
   * 
   * @param loop - Whether or not the Source will loop.
   * 
   * Attempting to loop a Source backed by a stream `Sound` will cause an error.
   */
  setLooping(loop: boolean): void

  /**
   * Sets the orientation of the Source in angle/axis representation.
   * 
   * `Source.setOrientation(angle, ax, ay, az)`
   * 
   * Set the orientation using angle/axis numbers.
   * 
   * @param angle - The number of radians the Source should be rotated around its rotation axis.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   */
  setOrientation(angle: number, ax: number, ay: number, az: number): void

  /**
   * Sets the orientation of the Source in angle/axis representation.
   * 
   * `Source.setOrientation(orientation)`
   * 
   * Set the orientation using a quaternion.
   * 
   * @param orientation - The orientation.
   */
  setOrientation(orientation: quaternion): void

  /**
   * Sets the pitch of the Source.
   * 
   * `Source.setPitch(pitch)`
   * 
   * @param pitch - The new pitch.
   * 
   * The default pitch is 1.  Every doubling/halving of the pitch will raise/lower the pitch by one octave.  Changing the pitch also changes the playback speed.
   */
  setPitch(pitch: number): void

  /**
   * Sets the position and orientation of the Source.
   * 
   * `Source.setPose(x, y, z, angle, ax, ay, az)`
   * 
   * Set the pose using numbers.
   * 
   * @param x - The x position of the Source.
   * @param y - The y position of the Source.
   * @param z - The z position of the Source.
   * @param angle - The number of radians the Source is rotated around its axis of rotation.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * 
   * The position doesn't have any defined units, but meters are used by convention.
   */
  setPose(x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number): void

  /**
   * Sets the position and orientation of the Source.
   * 
   * `Source.setPose(position, orientation)`
   * 
   * Set the pose using vector types.
   * 
   * @param position - The position.
   * @param orientation - The orientation.
   * 
   * The position doesn't have any defined units, but meters are used by convention.
   */
  setPose(position: vector, orientation: quaternion): void

  /**
   * Sets the position of the Source.  Setting the position will cause the Source to be distorted and attenuated based on its position relative to the listener.
   * 
   * Only mono sources can be positioned.  Setting the position of a stereo Source will cause an error.
   * 
   * `Source.setPosition(x, y, z)`
   * 
   * Set the position using numbers.
   * 
   * @param x - The x coordinate of the position.
   * @param y - The y coordinate of the position.
   * @param z - The z coordinate of the position.
   * 
   * The position doesn't have any defined units, but meters are used by convention.
   */
  setPosition(x: number, y: number, z: number): void

  /**
   * Sets the position of the Source.  Setting the position will cause the Source to be distorted and attenuated based on its position relative to the listener.
   * 
   * Only mono sources can be positioned.  Setting the position of a stereo Source will cause an error.
   * 
   * `Source.setPosition(position)`
   * 
   * Set the position using a vector.
   * 
   * @param position - The position.
   * 
   * The position doesn't have any defined units, but meters are used by convention.
   */
  setPosition(position: vector): void

  /**
   * Sets the radius of the Source, in meters.
   * 
   * This does not control falloff or attenuation.  It is only used for smoothing out occlusion.  If a Source doesn't have a radius, then when it becomes occluded by a wall its volume will instantly drop.  Giving the Source a radius that approximates its emitter's size will result in a smooth transition between audible and occluded, improving realism.
   * 
   * `Source.setRadius(radius)`
   * 
   * @param radius - The new radius of the Source, in meters.
   */
  setRadius(radius: number): void

  /**
   * Sets the current volume factor for the Source.
   * 
   * `Source.setVolume(volume, units)`
   * 
   * @param volume - The new volume.
   * @param units - The units of the value.
   * 
   * The volume will be clamped to a 0-1 range (0 dB).
   */
  setVolume(volume: number, units?: VolumeUnit): void

  /**
   * Stops the source, also rewinding it to the beginning.
   * 
   * `Source.stop()`
   */
  stop(): void

  /**
   * Returns the current playback position of the Source.
   * 
   * `position = Source.tell(unit)`
   * 
   * @param unit - The unit to return.
   * @returns The current playback position.
   * 
   * The return value for Sources backed by a stream `Sound` has no meaning.
   */
  tell(unit?: TimeUnit): number

}

/** This indicates the different node properties that can be animated. */
declare type AnimationProperty = 'translation' | 'rotation' | 'scale' | 'weights'

/** These are the data types that can be used by vertex data in meshes. */
declare type AttributeType = 'i8' | 'u8' | 'i16' | 'u16' | 'i32' | 'u32' | 'f32'

/** Sounds can have different numbers of channels, and those channels can map to various speaker layouts. */
declare type ChannelLayout = 'mono' | 'stereo' | 'ambisonic'

/** These are the different types of attributes that may be present in meshes loaded from models. */
declare type DefaultAttribute = 'position' | 'normal' | 'uv' | 'color' | 'tangent' | 'joints' | 'weights'

/** The DrawMode of a mesh determines how its vertices are connected together. */
declare type ModelDrawMode = 'points' | 'lines' | 'linestrip' | 'lineloop' | 'strip' | 'triangles' | 'fan'

/** Sounds can store audio samples as 16 bit integers or 32 bit floats. */
declare type SampleFormat = 'f32' | 'i16'

/** Different ways to interpolate between animation keyframes. */
declare type SmoothMode = 'step' | 'linear' | 'cubic'

/**
 * Different data layouts for pixels in `Image` and `Texture` objects.
 * 
 * Formats starting with `d` are depth formats, used for depth/stencil render targets.
 * 
 * Formats starting with `bc` and `astc` are compressed formats.  Compressed formats have better performance since they stay compressed on the CPU and GPU, reducing the amount of memory bandwidth required to look up all the pixels needed for shading.
 * 
 * Formats without the `f` suffix are unsigned normalized formats, which store values in the range `[0,1]`.  The `f` suffix indicates a floating point format which can store values outside this range, and is used for HDR rendering or storing data in a texture.
 */
declare type TextureFormat = 'r8' | 'rg8' | 'rgba8' | 'bgra8' | 'r16' | 'rg16' | 'rgba16' | 'r16f' | 'rg16f' | 'rgba16f' | 'r32f' | 'rg32f' | 'rgba32f' | 'rgb565' | 'rgb5a1' | 'rgb10a2' | 'rg11b10f' | 'd16' | 'd24' | 'd24s8' | 'd32f' | 'd32fs8' | 'bc1' | 'bc2' | 'bc3' | 'bc4u' | 'bc4s' | 'bc5u' | 'bc5s' | 'bc6uf' | 'bc6sf' | 'bc7' | 'astc4x4' | 'astc5x4' | 'astc5x5' | 'astc6x5' | 'astc6x6' | 'astc8x5' | 'astc8x6' | 'astc8x8' | 'astc10x5' | 'astc10x6' | 'astc10x8' | 'astc10x10' | 'astc12x10' | 'astc12x12'

/**
 * A Blob is an object that holds binary data.  It can be passed to most functions that take filename arguments, like `lovr.graphics.newModel` or `lovr.audio.newSource`.  Blobs aren't usually necessary for simple projects, but they can be really helpful if:
 * 
 * - You need to work with low level binary data, potentially using the LuaJIT FFI for increased
 *   performance.
 * - You are working with data that isn't stored as a file, such as programmatically generated data
 *   or a string from a network request.
 * - You want to load data from a file once and then use it to create many different objects.
 * 
 * A Blob's size cannot be changed once it is created.
 */
declare interface Blob extends LovrObject {
  /**
   * Returns the size of the Blob's contents, in bytes.
   * 
   * `bytes = Blob.getSize()`
   * 
   * @returns The size of the Blob, in bytes.
   */
  getSize(): number

  /**
   * Returns the filename the Blob was loaded from, or the custom name given to it when it was created.  This label is also used in error messages.
   * 
   * `name = Blob.getName()`
   * 
   * @returns The name of the Blob.
   * 
   * If a Blob was created without a name, its name will default to the empty string.
   */
  getName(): string

  /**
   * Returns a raw pointer to the Blob's data.  This can be used to interface with other C libraries using the LuaJIT FFI.  Use this only if you know what you're doing!
   * 
   * `pointer = Blob.getPointer()`
   * 
   * @returns A pointer to the data.
   */
  getPointer(): any

  /**
   * Returns a binary string containing the Blob's data.
   * 
   * `data = Blob.getString(offset, size)`
   * 
   * @param offset - A byte offset into the Blob where the string will start.
   * @param size - The number of bytes the string will contain.  If nil, the rest of the data in the Blob will be used, based on the `offset` parameter.
   * @returns The Blob's data.
   * 
   * This effectively allocates a new copy of the Blob as a Lua string, so this should be avoided for really big Blobs!
   */
  getString(offset?: number, size?: number): string

  /**
   * Returns signed 8-bit integers from the data in the Blob.
   * 
   * `... = Blob.getI8(offset, count)`
   * 
   * @param offset - A non-negative byte offset to read from.
   * @param count - The number of integers to read.
   * @returns `count` signed 8-bit integers, from -128 to 127.
   */
  getI8(offset?: number, count?: number): LuaMultiReturn<[...rest: number[]]>

  /**
   * Returns unsigned 8-bit integers from the data in the Blob.
   * 
   * `... = Blob.getU8(offset, count)`
   * 
   * @param offset - A non-negative byte offset to read from.
   * @param count - The number of integers to read.
   * @returns `count` unsigned 8-bit integers, from 0 to 255.
   */
  getU8(offset?: number, count?: number): LuaMultiReturn<[...rest: number[]]>

  /**
   * Returns signed 16-bit integers from the data in the Blob.
   * 
   * `... = Blob.getI16(offset, count)`
   * 
   * @param offset - A non-negative byte offset to read from.
   * @param count - The number of integers to read.
   * @returns `count` signed 16-bit integers, from -32768 to 32767.
   */
  getI16(offset?: number, count?: number): LuaMultiReturn<[...rest: number[]]>

  /**
   * Returns unsigned 16-bit integers from the data in the Blob.
   * 
   * `... = Blob.getU16(offset, count)`
   * 
   * @param offset - A non-negative byte offset to read from.
   * @param count - The number of integers to read.
   * @returns `count` unsigned 16-bit integers, from 0 to 65535.
   */
  getU16(offset?: number, count?: number): LuaMultiReturn<[...rest: number[]]>

  /**
   * Returns signed 32-bit integers from the data in the Blob.
   * 
   * `... = Blob.getI32(offset, count)`
   * 
   * @param offset - A non-negative byte offset to read from.
   * @param count - The number of integers to read.
   * @returns `count` signed 32-bit integers, from -2147483648 to 2147483647.
   */
  getI32(offset?: number, count?: number): LuaMultiReturn<[...rest: number[]]>

  /**
   * Returns unsigned 32-bit integers from the data in the Blob.
   * 
   * `... = Blob.getU32(offset, count)`
   * 
   * @param offset - A non-negative byte offset to read from.
   * @param count - The number of integers to read.
   * @returns `count` unsigned 32-bit integers, from 0 to 4294967296.
   */
  getU32(offset?: number, count?: number): LuaMultiReturn<[...rest: number[]]>

  /**
   * Returns 32-bit floating point numbers from the data in the Blob.
   * 
   * `... = Blob.getF32(offset, count)`
   * 
   * @param offset - A non-negative byte offset to read from.
   * @param count - The number of floats to read.
   * @returns `count` 32-bit floats.
   */
  getF32(offset?: number, count?: number): LuaMultiReturn<[...rest: number[]]>

  /**
   * Returns 64-bit floating point numbers from the data in the Blob.
   * 
   * `... = Blob.getF64(offset, count)`
   * 
   * @param offset - A non-negative byte offset to read from.
   * @param count - The number of doubles to read.
   * @returns `count` 64-bit doubles.
   */
  getF64(offset?: number, count?: number): LuaMultiReturn<[...rest: number[]]>

  /**
   * Writes 8-bit signed integers to the Blob.
   * 
   * `Blob.setI8(offset, ...)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param ... - Numbers to write to the blob as 8-bit signed integers (each taking up 1 byte, ranging from
   * -127 to 128).
   */
  setI8(offset: number, ...rest: number[]): void

  /**
   * Writes 8-bit signed integers to the Blob.
   * 
   * `Blob.setI8(offset, table)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param table - A table of numbers to write to the blob as 8-bit signed integers (each taking up 1 byte, ranging from -127 to 128).
   */
  setI8(offset: number, table: number): void

  /**
   * Writes 8-bit unsigned integers to the Blob.
   * 
   * `Blob.setU8(offset, ...)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param ... - Numbers to write to the blob as 8-bit unsigned integers (each taking up 1 byte, ranging from 0 to 255).
   */
  setU8(offset: number, ...rest: number[]): void

  /**
   * Writes 8-bit unsigned integers to the Blob.
   * 
   * `Blob.setU8(offset, table)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param table - A table of numbers to write to the blob as 8-bit unsigned integers (each taking up 1 byte, ranging from 0 to 255).
   */
  setU8(offset: number, table: number): void

  /**
   * Writes 16-bit signed integers to the Blob.
   * 
   * `Blob.setI16(offset, ...)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param ... - Numbers to write to the blob as 16-bit signed integers (each taking up 2 bytes, ranging from
   * -32768 to 32767).
   */
  setI16(offset: number, ...rest: number[]): void

  /**
   * Writes 16-bit signed integers to the Blob.
   * 
   * `Blob.setI16(offset, table)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param table - A table of numbers to write to the blob as 16-bit signed integers (each taking up 2 bytes, ranging from -32768 to 32767).
   */
  setI16(offset: number, table: number): void

  /**
   * Writes 16-bit unsigned integers to the Blob.
   * 
   * `Blob.setU16(offset, ...)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param ... - Numbers to write to the blob as 16-bit unsigned integers (each taking up 2 bytes, ranging from 0 to 65535).
   */
  setU16(offset: number, ...rest: number[]): void

  /**
   * Writes 16-bit unsigned integers to the Blob.
   * 
   * `Blob.setU16(offset, table)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param table - A table of numbers to write to the blob as 16-bit unsigned integers (each taking up 2 bytes, ranging from 0 to 65535).
   */
  setU16(offset: number, table: number): void

  /**
   * Writes 32-bit signed integers to the Blob.
   * 
   * `Blob.setI32(offset, ...)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param ... - Numbers to write to the blob as 32-bit signed integers (each taking up 4 bytes, ranging from
   * -2147483648 to 2147483647).
   */
  setI32(offset: number, ...rest: number[]): void

  /**
   * Writes 32-bit signed integers to the Blob.
   * 
   * `Blob.setI32(offset, table)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param table - A table of numbers to write to the blob as 32-bit signed integers (each taking up 4 bytes, ranging from -2147483648 to 2147483647).
   */
  setI32(offset: number, table: number): void

  /**
   * Writes 32-bit unsigned integers to the Blob.
   * 
   * `Blob.setU32(offset, ...)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param ... - Numbers to write to the blob as 32-bit unsigned integers (each taking up 4 bytes, ranging from 0 to 4294967296).
   */
  setU32(offset: number, ...rest: number[]): void

  /**
   * Writes 32-bit unsigned integers to the Blob.
   * 
   * `Blob.setU32(offset, table)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param table - A table of numbers to write to the blob as 32-bit unsigned integers (each taking up 4 bytes, ranging from 0 to 4294967296).
   */
  setU32(offset: number, table: number): void

  /**
   * Writes 32-bit floating point numbers to the Blob.
   * 
   * `Blob.setF32(offset, ...)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param ... - Numbers to write to the blob as 32-bit floats (each taking up 4 bytes).
   */
  setF32(offset: number, ...rest: number[]): void

  /**
   * Writes 32-bit floating point numbers to the Blob.
   * 
   * `Blob.setF32(offset, table)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param table - A table of numbers to write to the blob as 32-bit floats (each taking up 4 bytes).
   */
  setF32(offset: number, table: number): void

  /**
   * Writes 64-bit floating point numbers to the Blob.
   * 
   * `Blob.setF64(offset, ...)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param ... - Numbers to write to the blob as 64-bit floating point numbers (each taking up 8 bytes).
   */
  setF64(offset: number, ...rest: number[]): void

  /**
   * Writes 64-bit floating point numbers to the Blob.
   * 
   * `Blob.setF64(offset, table)`
   * 
   * @param offset - A non-negative byte offset to start writing at.
   * @param table - A table of numbers to write to the blob as 64-bit floating point numbers (each taking up 8 bytes).
   */
  setF64(offset: number, table: number): void

}

/**
 * An Image stores raw 2D pixel info for `Texture`s.  It has a width, height, and format.  The Image can be initialized with the contents of an image file or it can be created with uninitialized contents.  The supported image formats are `png`, `jpg`, `hdr`, `dds`, `ktx`, and `astc`.
 * 
 * Usually you can just use Textures, but Image can be useful if you want to manipulate individual pixels, load Textures in a background thread, or use the FFI to efficiently access the raw image data.
 */
declare interface Image extends LovrObject {
  /**
   * Encodes the Image to an **uncompressed** png.  This intended mainly for debugging.
   * 
   * `blob = Image.encode()`
   * 
   * @returns A new Blob containing the PNG image data.
   */
  encode(): Blob

  /**
   * Returns a Blob containing the raw bytes of the Image.
   * 
   * `blob = Image.getBlob()`
   * 
   * @returns The Blob instance containing the bytes for the `Image`.
   */
  getBlob(): Blob

  /**
   * Returns the dimensions of the Image, in pixels.
   * 
   * `[width, height] = Image.getDimensions()`
   * 
   * @returns 
   * width - The width of the Image, in pixels.
   * height - The height of the Image, in pixels.
   */
  getDimensions(): LuaMultiReturn<[width: number, height: number]>

  /**
   * Returns the format of the Image.
   * 
   * `format = Image.getFormat()`
   * 
   * @returns The format of the pixels in the Image.
   */
  getFormat(): TextureFormat

  /**
   * Returns the height of the Image, in pixels.
   * 
   * `height = Image.getHeight()`
   * 
   * @returns The height of the Image, in pixels.
   */
  getHeight(): number

  /**
   * Returns the value of a pixel of the Image.
   * 
   * `[r, g, b, a] = Image.getPixel(x, y)`
   * 
   * @param x - The x coordinate of the pixel to get (0-indexed).
   * @param y - The y coordinate of the pixel to get (0-indexed).
   * @returns 
   * r - The red component of the pixel, from 0.0 to 1.0.
   * g - The green component of the pixel, from 0.0 to 1.0.
   * b - The blue component of the pixel, from 0.0 to 1.0.
   * a - The alpha component of the pixel, from 0.0 to 1.0.
   * 
   * The following texture formats are supported: `r8`, `rg8`, `rgba8`, `r16`, `rg16`, `rgba16`, `r32f`, `rg32f`, `rgba32f`.
   */
  getPixel(x: number, y: number): LuaMultiReturn<[r: number, g: number, b: number, a: number]>

  /**
   * Returns a raw pointer to the Image's pixel data.  This can be used to interface with other C libraries or the LuaJIT FFI.
   * 
   * `pointer = Image.getPointer(level, layer)`
   * 
   * @param level - The mipmap level to get the pointer of (for DDS and KTX images).
   * @param layer - The array layer to get the pointer of (for DDS and KTX images).
   * @returns A pointer to the raw pixel data.
   */
  getPointer(level?: number, layer?: number): any

  /**
   * Returns the width of the Image, in pixels.
   * 
   * `width = Image.getWidth()`
   * 
   * @returns The width of the Image, in pixels.
   */
  getWidth(): number

  /**
   * Transforms pixels in the Image using a function.
   * 
   * The callback function passed to this function will be called once for each pixel.  For each pixel, the function will be called with its x and y coordinate and the red, green, blue, and alpha components of its color.  Whatever the function returns will be used as the new color for the pixel.
   * 
   * The callback function will potentially be called thousands of times, so it's best to keep the amount of code in there small and fast.
   * 
   * `Image.mapPixel(callback, x, y, w, h)`
   * 
   * @param callback - The function that will be called for each pixel.
   * @param x - The x coordinate of the upper-left corner of the area of the Image to affect.
   * @param y - The y coordinate of the upper-left corner of the area of the Image to affect.
   * @param w - The width of the area to affect.
   * @param h - The height of the area to affect.
   * 
   * The following texture formats are supported: `r8`, `rg8`, `rgba8`, `r16`, `rg16`, `rgba16`, `r32f`, `rg32f`, `rgba32f`.
   */
  mapPixel(callback: (this: void, ...args: any[]) => any, x?: number, y?: number, w?: number, h?: number): void

  /**
   * Copies a rectangle of pixels from one Image to this one.
   * 
   * `Image.paste(source, x, y, fromX, fromY, width, height)`
   * 
   * @param source - The Image to copy pixels from.
   * @param x - The x coordinate to paste to (0-indexed).
   * @param y - The y coordinate to paste to (0-indexed).
   * @param fromX - The x coordinate in the source to paste from (0-indexed).
   * @param fromY - The y coordinate in the source to paste from (0-indexed).
   * @param width - The width of the region to copy.
   * @param height - The height of the region to copy.
   * 
   * The two Images must have the same pixel format.
   * 
   * Compressed images cannot be copied.
   * 
   * The rectangle cannot go outside the dimensions of the source or destination textures.
   */
  paste(source: Image, x?: number, y?: number, fromX?: number, fromY?: number, width?: number, height?: number): void

  /**
   * Sets the value of a single pixel of the Image.
   * 
   * If you need to change a bunch of pixels, consider using `Image:mapPixel`.
   * 
   * `Image.setPixel(x, y, r, g, b, a)`
   * 
   * @param x - The x coordinate of the pixel to set (0-indexed).
   * @param y - The y coordinate of the pixel to set (0-indexed).
   * @param r - The red component of the pixel, from 0.0 to 1.0.
   * @param g - The green component of the pixel, from 0.0 to 1.0.
   * @param b - The blue component of the pixel, from 0.0 to 1.0.
   * @param a - The alpha component of the pixel, from 0.0 to 1.0.
   * 
   * The following texture formats are supported: `r8`, `rg8`, `rgba8`, `r16`, `rg16`, `rgba16`, `r32f`, `rg32f`, `rgba32f`.
   */
  setPixel(x: number, y: number, r: number, g: number, b: number, a?: number): void

}

/**
 * A ModelData is a container object that loads and holds data contained in 3D model files.  This can include a variety of things like the node structure of the asset, the vertex data it contains, contains, the `Image` and `Material` properties, and any included animations.
 * 
 * The current supported formats are OBJ, glTF, and STL.
 * 
 * Usually you can just load a `Model` directly, but using a `ModelData` can be helpful if you want to load models in a thread or access more low-level information about the Model.
 */
declare interface ModelData extends LovrObject {
  /**
   * Returns the number of channels in an animation.
   * 
   * A channel is a set of keyframes targeting a single property of a node.
   * 
   * `count = ModelData.getAnimationChannelCount(animation)`
   * 
   * @param animation - The name or index of an animation.
   * @returns The number of channels in the animation.
   */
  getAnimationChannelCount(animation: number | string): number

  /**
   * Returns the number of animations in the model.
   * 
   * `count = ModelData.getAnimationCount()`
   * 
   * @returns The number of animations in the model.
   */
  getAnimationCount(): number

  /**
   * Returns the duration of an animation.
   * 
   * `duration = ModelData.getAnimationDuration(animation)`
   * 
   * @param animation - The name or index of an animation.
   * @returns The duration of the animation, in seconds.
   * 
   * The duration of the animation is calculated as the latest timestamp of all of its channels.
   */
  getAnimationDuration(animation: string | number): number

  /**
   * Returns a single keyframe in a channel of an animation.
   * 
   * `[time, ...] = ModelData.getAnimationKeyframe(animation, channel, keyframe)`
   * 
   * @param animation - The name or index of an animation.
   * @param channel - The index of a channel in the animation.
   * @param keyframe - The index of a keyframe in the channel.
   * @returns 
   * time - The timestamp of the keyframe.
   * ... - The data for the keyframe (3 or more numbers, depending on the property).
   * 
   * The number of values returned after `time` depends on the `AnimationProperty` targeted by the channel:
   * 
   * - `translation`: 3 numbers
   * - `rotation`: 4 numbers (returned as raw quaternion components)
   * - `scale`: 3 numbers
   * - `weights`: variable, contains 1 number for each blend shape in the node
   */
  getAnimationKeyframe(animation: number, channel: number, keyframe: number): LuaMultiReturn<[time: number, ...rest: number[]]>

  /**
   * Returns the number of keyframes in a channel of an animation.
   * 
   * `count = ModelData.getAnimationKeyframeCount(animation, channel)`
   * 
   * @param animation - The name or index of an animation.
   * @param channel - The index of a channel in the animation.
   * @returns The number of keyframes in the channel.
   */
  getAnimationKeyframeCount(animation: string | number, channel: number): number

  /**
   * Returns the name of an animation.
   * 
   * `name = ModelData.getAnimationName(index)`
   * 
   * @param index - The index of an animation.
   * @returns The name of the animation, or `nil` if the animation doesn't have a name.
   */
  getAnimationName(index: number): string | undefined

  /**
   * Returns the index of the node targeted by an animation's channel.
   * 
   * `node = ModelData.getAnimationNode(animation, channel)`
   * 
   * @param animation - The index or name of an animation.
   * @param channel - The index of a channel in the animation.
   * @returns The index of the node targeted by the channel.
   */
  getAnimationNode(animation: number, channel: number): number

  /**
   * Returns the property targeted by an animation's channel.
   * 
   * `property = ModelData.getAnimationProperty(animation, channel)`
   * 
   * @param animation - The name or index of an animation.
   * @param channel - The index of a channel in the animation.
   * @returns The property (translation, rotation, scale, or weights) affected by the keyframes.
   */
  getAnimationProperty(animation: string | number, channel: number): AnimationProperty

  /**
   * Returns the smooth mode of a channel in an animation.
   * 
   * `smooth = ModelData.getAnimationSmoothMode(animation, channel)`
   * 
   * @param animation - The name or index of an animation.
   * @param channel - The index of a channel in the animation.
   * @returns The smooth mode of the keyframes.
   */
  getAnimationSmoothMode(animation: string | number, channel: number): SmoothMode

  /**
   * Returns the number of blend shapes in the model.
   * 
   * `count = ModelData.getBlendShapeCount()`
   * 
   * @returns The number of blend shapes in the model.
   */
  getBlendShapeCount(): number

  /**
   * Returns the name of a blend shape in the model.
   * 
   * `name = ModelData.getBlendShapeName(index)`
   * 
   * @param index - The index of a blend shape.
   * @returns The name of the blend shape.
   * 
   * This function will throw an error if the blend shape index is invalid.
   */
  getBlendShapeName(index: number): string

  /**
   * Returns one of the Blobs in the model, by index.
   * 
   * `blob = ModelData.getBlob(index)`
   * 
   * @param index - The index of the Blob to get.
   * @returns The Blob object.
   */
  getBlob(index: number): Blob

  /**
   * Returns the number of Blobs in the model.
   * 
   * `count = ModelData.getBlobCount()`
   * 
   * @returns The number of Blobs in the model.
   */
  getBlobCount(): number

  /**
   * Returns the 6 values of the model's axis-aligned bounding box.
   * 
   * `[minx, maxx, miny, maxy, minz, maxz] = ModelData.getBoundingBox()`
   * 
   * @returns 
   * minx - The minimum x coordinate of the vertices in the model.
   * maxx - The maximum x coordinate of the vertices in the model.
   * miny - The minimum y coordinate of the vertices in the model.
   * maxy - The maximum y coordinate of the vertices in the model.
   * minz - The minimum z coordinate of the vertices in the model.
   * maxz - The maximum z coordinate of the vertices in the model.
   */
  getBoundingBox(): LuaMultiReturn<[minx: number, maxx: number, miny: number, maxy: number, minz: number, maxz: number]>

  /**
   * Returns a sphere approximately enclosing the vertices in the model.
   * 
   * `[x, y, z, radius] = ModelData.getBoundingSphere()`
   * 
   * @returns 
   * x - The x coordinate of the position of the sphere.
   * y - The y coordinate of the position of the sphere.
   * z - The z coordinate of the position of the sphere.
   * radius - The radius of the bounding sphere.
   */
  getBoundingSphere(): LuaMultiReturn<[x: number, y: number, z: number, radius: number]>

  /**
   * Returns the center of the model's axis-aligned bounding box, relative to the model's origin.
   * 
   * `[x, y, z] = ModelData.getCenter()`
   * 
   * @returns 
   * x - The x offset of the center of the bounding box.
   * y - The y offset of the center of the bounding box.
   * z - The z offset of the center of the bounding box.
   */
  getCenter(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the depth of the model, computed from its axis-aligned bounding box.
   * 
   * `depth = ModelData.getDepth()`
   * 
   * @returns The depth of the model.
   */
  getDepth(): number

  /**
   * Returns the width, height, and depth of the model, computed from its axis-aligned bounding box.
   * 
   * `[width, height, depth] = ModelData.getDimensions()`
   * 
   * @returns 
   * width - The width of the model.
   * height - The height of the model.
   * depth - The depth of the model.
   */
  getDimensions(): LuaMultiReturn<[width: number, height: number, depth: number]>

  /**
   * Returns the height of the model, computed from its axis-aligned bounding box.
   * 
   * `height = ModelData.getHeight()`
   * 
   * @returns The height of the model.
   */
  getHeight(): number

  /**
   * Returns one of the Images in the model, by index.
   * 
   * `image = ModelData.getImage(index)`
   * 
   * @param index - The index of the Image to get.
   * @returns The Image object.
   */
  getImage(index: number): Image

  /**
   * Returns the number of Images in the model.
   * 
   * `count = ModelData.getImageCount()`
   * 
   * @returns The number of Images in the model.
   */
  getImageCount(): number

  /**
   * Returns a table with all of the properties of a material.
   * 
   * `properties = ModelData.getMaterial(material)`
   * 
   * @param material - The name or index of a material.
   * @returns The material properties.
   */
  getMaterial(material: number): LuaTable

  /**
   * Returns the number of materials in the model.
   * 
   * `count = ModelData.getMaterialCount()`
   * 
   * @returns The number of materials in the model.
   */
  getMaterialCount(): number

  /**
   * Returns the name of a material in the model.
   * 
   * `name = ModelData.getMaterialName(index)`
   * 
   * @param index - The index of a material.
   * @returns The name of the material, or nil if the material does not have a name.
   */
  getMaterialName(index: number): string

  /**
   * Returns the number of meshes in the model.
   * 
   * `count = ModelData.getMeshCount()`
   * 
   * @returns The number of meshes in the model.
   */
  getMeshCount(): number

  /**
   * Returns the draw mode of a mesh.  This controls how its vertices are connected together (points, lines, or triangles).
   * 
   * `mode = ModelData.getMeshDrawMode(mesh)`
   * 
   * @param mesh - The index of a mesh.
   * @returns The draw mode of the mesh.
   */
  getMeshDrawMode(mesh: number): ModelDrawMode

  /**
   * Returns one of the vertex indices in a mesh.  If a mesh has vertex indices, they define the order and connectivity of the vertices in the mesh, allowing a vertex to be reused multiple times without duplicating its data.
   * 
   * `vertexindex = ModelData.getMeshIndex(mesh, index)`
   * 
   * @param mesh - The index of a mesh to get the vertex from.
   * @param index - The index of a vertex index in the mesh to retrieve.
   * @returns The vertex index.  Like all indices in Lua, this is 1-indexed.
   */
  getMeshIndex(mesh: number, index: number): number

  /**
   * Returns the number of vertex indices in a mesh.  Vertex indices allow for vertices to be reused when defining triangles.
   * 
   * `count = ModelData.getMeshIndexCount(mesh)`
   * 
   * @param mesh - The index of a mesh.
   * @returns The number of vertex indices in the mesh.
   * 
   * This may return zero if the mesh does not use indices.
   */
  getMeshIndexCount(mesh: number): number

  /**
   * Returns the data format of vertex indices in a mesh.  If a mesh doesn't use vertex indices, this function returns nil.
   * 
   * `[type, blob, offset, stride] = ModelData.getMeshIndexFormat(mesh)`
   * 
   * @param mesh - The index of a mesh.
   * @returns 
   * type - The data type of each vertex index (always u16 or u32).
   * blob - The index of a Blob in the mesh where the binary data is stored.
   * offset - A byte offset into the Blob's data where the index data starts.
   * stride - The number of bytes between subsequent vertex indices.  Indices are always tightly packed, so this will always be 2 or 4 depending on the data type.
   */
  getMeshIndexFormat(mesh: number): LuaMultiReturn<[type: AttributeType, blob: number, offset: number, stride: number]>

  /**
   * Returns the index of the material applied to a mesh.
   * 
   * `material = ModelData.getMeshMaterial(mesh)`
   * 
   * @param mesh - The index of a mesh.
   * @returns The index of the material applied to the mesh, or nil if the mesh does not have a material.
   */
  getMeshMaterial(mesh: number): number

  /**
   * Returns the data for a single vertex in a mesh.  The data returned depends on the vertex format of a mesh, which is given by `ModelData:getMeshVertexFormat`.
   * 
   * `... = ModelData.getMeshVertex(mesh, vertex)`
   * 
   * @param mesh - The index of a mesh to get the vertex from.
   * @param vertex - The index of a vertex in the mesh to retrieve.
   * @returns The data for all of the attributes of the vertex.
   */
  getMeshVertex(mesh: number, vertex: number): LuaMultiReturn<[...rest: number[]]>

  /**
   * Returns the number of vertices in a mesh.
   * 
   * `count = ModelData.getMeshVertexCount(mesh)`
   * 
   * @param mesh - The index of a mesh.
   * @returns The number of vertices in the mesh.
   */
  getMeshVertexCount(mesh: number): number

  /**
   * Returns the vertex format of a mesh.  The vertex format defines the properties associated with each vertex (position, color, etc.), including their types and binary data layout.
   * 
   * `format = ModelData.getMeshVertexFormat(mesh)`
   * 
   * @param mesh - The index of a mesh.
   * @returns The vertex format of the mesh.
   * 
   * The format is given as a table of vertex attributes.  Each attribute is a table containing the following:
   * 
   *     { name, type, components, blob, offset, stride }
   * 
   * - The `name` will be a `DefaultAttribute`.
   * - The `type` will be an `AttributeType`.
   * - The `component` count will be 1-4.
   * - The `blob` is an index of one of the Blobs in the model (see `ModelData:getBlob`).
   * - The `offset` is a byte offset from the start of the Blob where the attribute's data starts.
   * - The `stride` is the number of bytes between consecutive values.
   */
  getMeshVertexFormat(mesh: number): LuaTable

  /**
   * Returns extra information stored in the model file.  Currently this is only implemented for glTF models and returns the JSON string from the glTF or glb file.  The metadata can be used to get application-specific data or add support for glTF extensions not supported by LÖVR.
   * 
   * `metadata = ModelData.getMetadata()`
   * 
   * @returns The metadata from the model file.
   */
  getMetadata(): string

  /**
   * Given a parent node, this function returns a table with the indices of its children.
   * 
   * `children = ModelData.getNodeChildren(node)`
   * 
   * @param node - The name or index of the parent node.
   * @returns A table containing the node index of each child of the parent node.
   */
  getNodeChildren(node: string | number): number[]

  /**
   * Returns the number of nodes in the model.
   * 
   * `count = ModelData.getNodeCount()`
   * 
   * @returns The number of nodes in the model.
   */
  getNodeCount(): number

  /**
   * Returns a table of mesh indices attached to a node.  Meshes define the geometry and materials of a model, as opposed to the nodes which define the transforms and hierarchy.  A node can have multiple meshes, and meshes can be reused in multiple nodes.
   * 
   * `meshes = ModelData.getNodeMeshes(node)`
   * 
   * @param node - The name or index of a node.
   * @returns A table with the node's mesh indices.
   */
  getNodeMeshes(node: string | number): LuaTable

  /**
   * Returns the name of a node.
   * 
   * `name = ModelData.getNodeName(index)`
   * 
   * @param index - The index of the node.
   * @returns The name of the node.
   * 
   * If the node does not have a name, this function returns `nil`.
   */
  getNodeName(index: number): string

  /**
   * Returns local orientation of a node, relative to its parent.
   * 
   * `[angle, ax, ay, az] = ModelData.getNodeOrientation(node)`
   * 
   * @param node - The name or index of a node.
   * @returns 
   * angle - The number of radians the node is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getNodeOrientation(node: string | number): LuaMultiReturn<[angle: number, ax: number, ay: number, az: number]>

  /**
   * Given a child node, this function returns the index of its parent.
   * 
   * `parent = ModelData.getNodeParent(node)`
   * 
   * @param node - The name or index of the child node.
   * @returns The index of the parent node.
   */
  getNodeParent(node: string | number): number

  /**
   * Returns local pose (position and orientation) of a node, relative to its parent.
   * 
   * `[x, y, z, angle, ax, ay, az] = ModelData.getNodePose(node)`
   * 
   * @param node - The name or index of a node.
   * @returns 
   * x - The x coordinate.
   * y - The y coordinate.
   * z - The z coordinate.
   * angle - The number of radians the node is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getNodePose(node: string | number): LuaMultiReturn<[x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns local position of a node, relative to its parent.
   * 
   * `[x, y, z] = ModelData.getNodePosition(node)`
   * 
   * @param node - The name or index of a node.
   * @returns 
   * x - The x coordinate.
   * y - The y coordinate.
   * z - The z coordinate.
   */
  getNodePosition(node: string | number): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns local scale of a node, relative to its parent.
   * 
   * `[sx, sy, sz] = ModelData.getNodeScale(node)`
   * 
   * @param node - The name or index of a node.
   * @returns 
   * sx - The x scale.
   * sy - The y scale.
   * sz - The z scale.
   */
  getNodeScale(node: string | number): LuaMultiReturn<[sx: number, sy: number, sz: number]>

  /**
   * Returns the index of the skin used by a node.  Skins are collections of joints used for skeletal animation.  A model can have multiple skins, and each node can use at most one skin to drive the animation of its meshes.
   * 
   * `skin = ModelData.getNodeSkin(node)`
   * 
   * @param node - The name or index of a node.
   * @returns The index of the node's skin, or nil if the node isn't skeletally animated.
   */
  getNodeSkin(node: string | number): number

  /**
   * Returns local transform (position, orientation, and scale) of a node, relative to its parent.
   * 
   * `[x, y, z, sx, sy, sz, angle, ax, ay, az] = ModelData.getNodeTransform(node)`
   * 
   * @param node - The name or index of a node.
   * @returns 
   * x - The x coordinate.
   * y - The y coordinate.
   * z - The z coordinate.
   * sx - The x scale.
   * sy - The y scale.
   * sz - The z scale.
   * angle - The number of radians the node is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   * 
   * For best results when animating, it's recommended to keep the 3 components of the scale the same.
   */
  getNodeTransform(node: string | number): LuaMultiReturn<[x: number, y: number, z: number, sx: number, sy: number, sz: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the index of the model's root node.
   * 
   * `root = ModelData.getRootNode()`
   * 
   * @returns The index of the root node.
   */
  getRootNode(): number

  /**
   * Returns the number of skins in the model.  A skin is a collection of joints targeted by an animation.
   * 
   * `count = ModelData.getSkinCount()`
   * 
   * @returns The number of skins in the model.
   */
  getSkinCount(): number

  /**
   * Returns the inverse bind matrix for a joint in the skin.
   * 
   * `... = ModelData.getSkinInverseBindMatrix(skin, joint)`
   * 
   * @param skin - The index of a skin.
   * @param joint - The index of a joint in the skin.
   * @returns The 16 components of the 4x4 inverse bind matrix, in column-major order.
   */
  getSkinInverseBindMatrix(skin: number, joint: number): LuaMultiReturn<[...rest: number[]]>

  /**
   * Returns a table with the node indices of the joints in a skin.
   * 
   * `joints = ModelData.getSkinJoints(skin)`
   * 
   * @param skin - The index of a skin.
   * @returns The joints in the skin.
   * 
   * There is currently a maximum of 256 joints per skin.
   */
  getSkinJoints(skin: number): LuaTable

  /**
   * Returns the total number of triangles in the model.  This count includes meshes that are attached to multiple nodes, and the count corresponds to the triangles returned by `ModelData:getTriangles`.
   * 
   * `count = ModelData.getTriangleCount()`
   * 
   * @returns The total number of triangles in the model.
   */
  getTriangleCount(): number

  /**
   * Returns the data for all triangles in the model.  There are a few differences between this and the mesh-specific functions like `ModelData:getMeshVertex` and `ModelData:getMeshIndex`:
   * 
   * - Only vertex positions are returned, not other vertex attributes.
   * - Positions are relative to the origin of the whole model, instead of local to a node.
   * - If a mesh is attached to more than one node, its vertices will be in the table multiple times.
   * - Vertex indices will be relative to the whole triangle list instead of a mesh.
   * 
   * `[vertices, indices] = ModelData.getTriangles()`
   * 
   * @returns 
   * vertices - The triangle vertex positions, returned as a flat (non-nested) table of numbers.  The position of each vertex is given as an x, y, and z coordinate.
   * indices - A list of numbers representing how to connect the vertices into triangles.  Each number is a 1-based index into the `vertices` table, and every 3 indices form a triangle.
   * 
   * After this function is called on a ModelData once, the result is cached.
   */
  getTriangles(): LuaMultiReturn<[vertices: LuaTable, indices: LuaTable]>

  /**
   * Returns the total vertex count of a model.  This count includes meshes that are attached to multiple nodes, and the count corresponds to the vertices returned by `ModelData:getTriangles`.
   * 
   * `count = ModelData.getVertexCount()`
   * 
   * @returns The total number of vertices in the model.
   */
  getVertexCount(): number

  /**
   * Returns the width of the model, computed from its axis-aligned bounding box.
   * 
   * `width = ModelData.getWidth()`
   * 
   * @returns The width of the model.
   */
  getWidth(): number

}

/**
 * A Rasterizer is an object that parses a TTF file, decoding and rendering glyphs from it.
 * 
 * Usually you can just use `Font` objects.
 */
declare interface Rasterizer extends LovrObject {
  /**
   * Returns the advance metric for a glyph, in pixels.  The advance is the horizontal distance to advance the cursor after rendering the glyph.
   * 
   * `advance = Rasterizer.getAdvance(glyph)`
   * 
   * @param glyph - A character or codepoint.
   * @returns The advance of the glyph, in pixels.
   */
  getAdvance(glyph: string | number): number

  /**
   * Returns the ascent metric of the font, in pixels.  The ascent represents how far any glyph of the font ascends above the baseline.
   * 
   * `ascent = Rasterizer.getAscent()`
   * 
   * @returns The ascent of the font, in pixels.
   */
  getAscent(): number

  /**
   * Returns the bearing metric for a glyph, in pixels.  The bearing is the horizontal distance from the cursor to the edge of the glyph.
   * 
   * `bearing = Rasterizer.getBearing(glyph)`
   * 
   * @param glyph - A character or codepoint.
   * @returns The bearing of the glyph, in pixels.
   */
  getBearing(glyph: string | number): number

  /**
   * Returns the bounding box of a glyph, or the bounding box surrounding all glyphs.  Note that font coordinates use a cartesian "y up" coordinate system.
   * 
   * `[x1, y1, x2, y2] = Rasterizer.getBoundingBox(glyph)`
   * 
   * Get the bounding box of a single glyph.
   * 
   * @param glyph - A character or codepoint.
   * @returns 
   * x1 - The left edge of the bounding box, in pixels.
   * y1 - The bottom edge of the bounding box, in pixels.
   * x2 - The right edge of the bounding box, in pixels.
   * y2 - The top edge of the bounding box, in pixels.
   */
  getBoundingBox(glyph: string | number): LuaMultiReturn<[x1: number, y1: number, x2: number, y2: number]>

  /**
   * Returns the bounding box of a glyph, or the bounding box surrounding all glyphs.  Note that font coordinates use a cartesian "y up" coordinate system.
   * 
   * `[x1, y1, x2, y2] = Rasterizer.getBoundingBox()`
   * 
   * Get the bounding box around all glyphs in the font.
   * 
   * @returns 
   * x1 - The left edge of the bounding box, in pixels.
   * y1 - The bottom edge of the bounding box, in pixels.
   * x2 - The right edge of the bounding box, in pixels.
   * y2 - The top edge of the bounding box, in pixels.
   */
  getBoundingBox(): LuaMultiReturn<[x1: number, y1: number, x2: number, y2: number]>

  /**
   * Returns the bezier curve control points defining the shape of a glyph.
   * 
   * `curves = Rasterizer.getCurves(glyph, three)`
   * 
   * @param glyph - A character or codepoint.
   * @param three - Whether the control points should be 3D or 2D.
   * @returns A table of curves.  Each curve is a table of numbers representing the control points (2 for a line, 3 for a quadratic curve, etc.).
   */
  getCurves(glyph: string | number, three: boolean): LuaTable

  /**
   * Returns the descent metric of the font, in pixels.  The descent represents how far any glyph of the font descends below the baseline.
   * 
   * `descent = Rasterizer.getDescent()`
   * 
   * @returns The descent of the font, in pixels.
   */
  getDescent(): number

  /**
   * Returns the dimensions of a glyph, or the largest dimensions of any glyph in the font.
   * 
   * `[width, height] = Rasterizer.getDimensions(glyph)`
   * 
   * @param glyph - A character or codepoint.
   * @returns 
   * width - The width, in pixels.
   * height - The height, in pixels.
   */
  getDimensions(glyph: string): LuaMultiReturn<[width: number, height: number]>

  /**
   * Returns the dimensions of a glyph, or the largest dimensions of any glyph in the font.
   * 
   * `[width, height] = Rasterizer.getDimensions()`
   * 
   * @returns 
   * width - The width, in pixels.
   * height - The height, in pixels.
   */
  getDimensions(): LuaMultiReturn<[width: number, height: number]>

  /**
   * Returns the size of the font, in pixels.  This is the size the rasterizer was created with, and determines the size of images it rasterizes.
   * 
   * `size = Rasterizer.getFontSize()`
   * 
   * @returns The font size, in pixels.
   */
  getFontSize(): number

  /**
   * Returns the number of glyphs stored in the font file.
   * 
   * `count = Rasterizer.getGlyphCount()`
   * 
   * @returns The number of glyphs stored in the font file.
   */
  getGlyphCount(): number

  /**
   * Returns the height of a glyph, or the maximum height of any glyph in the font.
   * 
   * `height = Rasterizer.getHeight(glyph)`
   * 
   * @param glyph - A character or codepoint.
   * @returns The height, in pixels.
   */
  getHeight(glyph: string | number): number

  /**
   * Returns the height of a glyph, or the maximum height of any glyph in the font.
   * 
   * `height = Rasterizer.getHeight()`
   * 
   * @returns The height, in pixels.
   */
  getHeight(): number

  /**
   * Returns the kerning between 2 glyphs, in pixels.  Kerning is a slight horizontal adjustment between 2 glyphs to improve the visual appearance.  It will often be negative.
   * 
   * `keming = Rasterizer.getKerning(first, second)`
   * 
   * @param first - The character or codepoint representing the first glyph.
   * @param second - The character or codepoint representing the second glyph.
   * @returns The kerning between the two glyphs.
   */
  getKerning(first: string | number, second: string | number): number

  /**
   * Returns the leading metric of the font, in pixels.  This is the full amount of space between lines.
   * 
   * `leading = Rasterizer.getLeading()`
   * 
   * @returns The font leading, in pixels.
   */
  getLeading(): number

  /**
   * Returns the width of a glyph, or the maximum width of any glyph in the font.
   * 
   * `width = Rasterizer.getWidth(glyph)`
   * 
   * @param glyph - A character or codepoint.
   * @returns The width, in pixels.
   */
  getWidth(glyph: string | number): number

  /**
   * Returns the width of a glyph, or the maximum width of any glyph in the font.
   * 
   * `width = Rasterizer.getWidth()`
   * 
   * @returns The width, in pixels.
   */
  getWidth(): number

  /**
   * Returns whether the Rasterizer can rasterize a set of glyphs.
   * 
   * `hasGlyphs = Rasterizer.hasGlyphs(...)`
   * 
   * @param ... - Strings (characters) or numbers (codepoints) to check for.
   * @returns true if the Rasterizer can rasterize all of the supplied characters, false otherwise.
   */
  hasGlyphs(...rest: (string | number)[]): boolean

  /**
   * Returns an `Image` containing a rasterized glyph.
   * 
   * `image = Rasterizer.newImage(glyph, spread, padding)`
   * 
   * @param glyph - A character or codepoint to rasterize.
   * @param spread - The width of the distance field, for signed distance field rasterization.
   * @param padding - The number of pixels of padding to add at the edges of the image.
   * @returns The glyph image.  It will be in the `rgba32f` format.
   */
  newImage(glyph: string | number, spread?: number, padding?: number): Image

}

/**
 * A Sound stores the data for a sound.  The supported sound formats are OGG, WAV, and MP3.  Sounds cannot be played directly.  Instead, there are `Source` objects in `lovr.audio` that are used for audio playback.  All Source objects are backed by one of these Sounds, and multiple Sources can share a single Sound to reduce memory usage.
 * 
 * Metadata
 * ---
 * 
 * Sounds hold a fixed number of frames.  Each frame contains one audio sample for each channel. The `SampleFormat` of the Sound is the data type used for each sample (floating point, integer, etc.).  The Sound has a `ChannelLayout`, representing the number of audio channels and how they map to speakers (mono, stereo, etc.).  The sample rate of the Sound indicates how many frames should be played per second.  The duration of the sound (in seconds) is the number of frames divided by the sample rate.
 * 
 * Compression
 * ---
 * 
 * Sounds can be compressed.  Compressed sounds are stored compressed in memory and are decoded as they are played.  This uses a lot less memory but increases CPU usage during playback.  OGG and MP3 are compressed audio formats.  When creating a sound from a compressed format, there is an option to immediately decode it, storing it uncompressed in memory.  It can be a good idea to decode short sound effects, since they won't use very much memory even when uncompressed and it will improve CPU usage.  Compressed sounds can not be written to using `Sound:setFrames`.
 * 
 * Streams
 * ---
 * 
 * Sounds can be created as a stream by passing `'stream'` as their contents when creating them. Audio frames can be written to the end of the stream, and read from the beginning.  This works well for situations where data is being generated in real time or streamed in from some other data source.
 * 
 * Sources can be backed by a stream and they'll just play whatever audio is pushed to the stream. The audio module also lets you use a stream as a "sink" for an audio device.  For playback devices, this works like loopback, so the mixed audio from all playing Sources will get written to the stream.  For capture devices, all the microphone input will get written to the stream. Conversion between sample formats, channel layouts, and sample rates will happen automatically.
 * 
 * Keep in mind that streams can still only hold a fixed number of frames.  If too much data is written before it is read, older frames will start to get overwritten.  Similary, it's possible to read too much data without writing fast enough.
 * 
 * Ambisonics
 * ---
 * 
 * Ambisonic sounds can be imported from WAVs, but can not yet be played.  Sounds with a `ChannelLayout` of `ambisonic` are stored as first-order full-sphere ambisonics using the AmbiX format (ACN channel ordering and SN3D channel normalization).  The AMB format is supported for import and will automatically get converted to AmbiX.  See `lovr.data.newSound` for more info.
 */
declare interface Sound extends LovrObject {
  /**
   * Returns a Blob containing the raw bytes of the Sound.
   * 
   * `blob = Sound.getBlob()`
   * 
   * @returns The Blob instance containing the bytes for the `Sound`.
   * 
   * Samples for each channel are stored interleaved.  The data type of each sample is given by `Sound:getFormat`.
   */
  getBlob(): Blob

  /**
   * Returns the byte stride of the Sound.  This is the size of each frame, in bytes.  For example, a stereo sound with a 32-bit floating point format would have a stride of 8 (4 bytes per sample, and 2 samples per frame).
   * 
   * `stride = Sound.getByteStride()`
   * 
   * @returns The size of a frame, in bytes.
   */
  getByteStride(): number

  /**
   * Returns the number of frames that can be written to the Sound.  For stream sounds, this is the number of frames that can be written without overwriting existing data.  For normal sounds, this returns the same value as `Sound:getFrameCount`.
   * 
   * `capacity = Sound.getCapacity()`
   * 
   * @returns The number of frames that can be written to the Sound.
   */
  getCapacity(): number

  /**
   * Returns the number of channels in the Sound.  Mono sounds have 1 channel, stereo sounds have 2 channels, and ambisonic sounds have 4 channels.
   * 
   * `channels = Sound.getChannelCount()`
   * 
   * @returns The number of channels in the sound.
   */
  getChannelCount(): number

  /**
   * Returns the channel layout of the Sound.
   * 
   * `channels = Sound.getChannelLayout()`
   * 
   * @returns The channel layout.
   */
  getChannelLayout(): ChannelLayout

  /**
   * Returns the duration of the Sound, in seconds.
   * 
   * `duration = Sound.getDuration()`
   * 
   * @returns The duration of the Sound, in seconds.
   * 
   * This can be computed as `(frameCount / sampleRate)`.
   */
  getDuration(): number

  /**
   * Returns the sample format of the Sound.
   * 
   * `format = Sound.getFormat()`
   * 
   * @returns The data type of each sample.
   */
  getFormat(): SampleFormat

  /**
   * Returns the number of frames in the Sound.  A frame stores one sample for each channel.
   * 
   * `frames = Sound.getFrameCount()`
   * 
   * @returns The number of frames in the Sound.
   * 
   * For streams, this returns the number of frames in the stream's buffer.
   */
  getFrameCount(): number

  /**
   * Reads frames from the Sound into a table, Blob, or another Sound.
   * 
   * `[t, count] = Sound.getFrames(count, srcOffset)`
   * 
   * @param count - The number of frames to read.  If nil, reads as many frames as possible.
   * 
   * Compressed sounds will automatically be decoded.
   * 
   * Reading from a stream will ignore the source offset and read the oldest frames.
   * @param srcOffset - A frame offset to apply to the sound when reading frames.
   * @returns 
   * t - A table containing audio frames.
   * count - The number of frames read.
   */
  getFrames(count?: number, srcOffset?: number): LuaMultiReturn<[t: number[], count: number]>

  /**
   * Reads frames from the Sound into a table, Blob, or another Sound.
   * 
   * `[t, count] = Sound.getFrames(t, count, srcOffset, dstOffset)`
   * 
   * @param t - An existing table to read frames into.
   * @param count - The number of frames to read.  If nil, reads as many frames as possible.
   * 
   * Compressed sounds will automatically be decoded.
   * 
   * Reading from a stream will ignore the source offset and read the oldest frames.
   * @param srcOffset - A frame offset to apply to the sound when reading frames.
   * @param dstOffset - An offset to apply to the destination when writing frames (indices for tables, bytes for Blobs, frames for Sounds).
   * @returns 
   * t - A table containing audio frames.
   * count - The number of frames read.
   */
  getFrames(t: LuaTable, count?: number, srcOffset?: number, dstOffset?: number): LuaMultiReturn<[t: number[], count: number]>

  /**
   * Reads frames from the Sound into a table, Blob, or another Sound.
   * 
   * `count = Sound.getFrames(blob, count, srcOffset, dstOffset)`
   * 
   * @param blob - A Blob to read frames into.
   * @param count - The number of frames to read.  If nil, reads as many frames as possible.
   * 
   * Compressed sounds will automatically be decoded.
   * 
   * Reading from a stream will ignore the source offset and read the oldest frames.
   * @param srcOffset - A frame offset to apply to the sound when reading frames.
   * @param dstOffset - An offset to apply to the destination when writing frames (indices for tables, bytes for Blobs, frames for Sounds).
   * @returns The number of frames read.
   */
  getFrames(blob: Blob, count?: number, srcOffset?: number, dstOffset?: number): number

  /**
   * Reads frames from the Sound into a table, Blob, or another Sound.
   * 
   * `count = Sound.getFrames(sound, count, srcOffset, dstOffset)`
   * 
   * @param sound - Another Sound to copy frames into.
   * @param count - The number of frames to read.  If nil, reads as many frames as possible.
   * 
   * Compressed sounds will automatically be decoded.
   * 
   * Reading from a stream will ignore the source offset and read the oldest frames.
   * @param srcOffset - A frame offset to apply to the sound when reading frames.
   * @param dstOffset - An offset to apply to the destination when writing frames (indices for tables, bytes for Blobs, frames for Sounds).
   * @returns The number of frames read.
   */
  getFrames(sound: Sound, count?: number, srcOffset?: number, dstOffset?: number): number

  /**
   * Returns the total number of samples in the Sound.
   * 
   * `samples = Sound.getSampleCount()`
   * 
   * @returns The total number of samples in the Sound.
   * 
   * For streams, this returns the number of samples in the stream's buffer.
   */
  getSampleCount(): number

  /**
   * Returns the sample rate of the Sound, in Hz.  This is the number of frames that are played every second.  It's usually a high number like 48000.
   * 
   * `frequency = Sound.getSampleRate()`
   * 
   * @returns The number of frames per second in the Sound.
   */
  getSampleRate(): number

  /**
   * Returns whether the Sound is compressed.  Compressed sounds are loaded from compressed audio formats like MP3 and OGG.  They use a lot less memory but require some extra CPU work during playback.  Compressed sounds can not be modified using `Sound:setFrames`.
   * 
   * `compressed = Sound.isCompressed()`
   * 
   * @returns Whether the Sound is compressed.
   */
  isCompressed(): boolean

  /**
   * Returns whether the Sound is a stream.
   * 
   * `stream = Sound.isStream()`
   * 
   * @returns Whether the Sound is a stream.
   */
  isStream(): boolean

  /**
   * Writes frames to the Sound.
   * 
   * `count = Sound.setFrames(source, count, dstOffset, srcOffset)`
   * 
   * @param source - A table, Blob, or Sound containing audio frames to write.
   * @param count - How many frames to write.  If nil, writes as many as possible.
   * @param dstOffset - A frame offset to apply when writing the frames.
   * @param srcOffset - A frame, byte, or index offset to apply when reading frames from the source.
   * @returns The number of frames written.
   */
  setFrames(source: LuaTable | Blob | Sound, count?: number, dstOffset?: number, srcOffset?: number): number

}

/** This enum is used to distinguish whether a display is the headset display or the desktop window. */
declare type DisplayType = 'headset' | 'window'

/** Keys that can be pressed on a keyboard.  Notably, numpad keys are missing right now. */
declare type KeyCode = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'space' | 'return' | 'tab' | 'escape' | 'backspace' | 'up' | 'down' | 'left' | 'right' | 'home' | 'end' | 'pageup' | 'pagedown' | 'insert' | 'delete' | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'f9' | 'f10' | 'f11' | 'f12' | '`' | '-' | '=' | '[' | ']' | '\\' | ';' | '\'' | ',' | '.' | '/' | 'kp0' | 'kp1' | 'kp2' | 'kp3' | 'kp4' | 'kp5' | 'kp6' | 'kp7' | 'kp8' | 'kp9' | 'kp.' | 'kp/' | 'kp*' | 'kp-' | 'kp+' | 'kpenter' | 'kp=' | 'lctrl' | 'lshift' | 'lalt' | 'lgui' | 'rctrl' | 'rshift' | 'ralt' | 'rgui' | 'capslock' | 'scrolllock' | 'numlock'

/** The different actions that can be taken on files, reported by `lovr.filechanged` when filesystem watching is active. */
declare type FileAction = 'create' | 'delete' | 'modify' | 'rename'

/** Different ways to open a `File` with `lovr.filesystem.newFile`. */
declare type OpenMode = 'r' | 'w' | 'a'

/** A File is an object that provides read or write access to a file on the filesystem. */
declare interface File extends LovrObject {
  /**
   * Returns the mode the file was opened in.
   * 
   * `mode = File.getMode()`
   * 
   * @returns The mode the file was opened in (`r`, `w`, or `a`).
   */
  getMode(): OpenMode

  /**
   * Returns the file's path.
   * 
   * `path = File.getPath()`
   * 
   * @returns The file path.
   */
  getPath(): string

  /**
   * Returns the size of the file, in bytes.
   * 
   * `[size, error] = File.getSize()`
   * 
   * @returns 
   * size - The size of the file, in bytes, or nil if an error occurred.
   * error - The error message, if an error occurred.
   */
  getSize(): LuaMultiReturn<[size: number, error: string]>

  /**
   * Returns whether the end of file has been reached.  When true, `File:read` will no longer return data.
   * 
   * `eof = File.isEOF()`
   * 
   * @returns Whether the end of the file has been reached.
   */
  isEOF(): boolean

  /**
   * Reads data from the file.
   * 
   * `[data, size] = File.read(bytes)`
   * 
   * @param bytes - The number of bytes to read from the file, or `nil` to read the rest of the file.
   * @returns 
   * data - The data that was read, or nil if an error occurred.
   * size - The number of bytes that were read, or the error message if an error occurred.
   * 
   * The file must have been opened for reading.
   * 
   * The maximum number of bytes that can be read at a time is 2^53 - 1.
   */
  read(bytes: number): LuaMultiReturn<[data: string, size: number]>

  /**
   * Seeks to a new position in the file.  `File:read` and `File:write` will read/write relative to this position.
   * 
   * `File.seek(offset)`
   * 
   * @param offset - The new file offset, in bytes.
   */
  seek(offset: number): void

  /**
   * Returns the seek position of the file, which is where `File:read` and `File:write will read/write from.
   * 
   * `offset = File.tell()`
   * 
   * @returns The file offset, in bytes.
   */
  tell(): number

  /**
   * Writes data to the file.
   * 
   * `[success, message] = File.write(string, size)`
   * 
   * @param string - A string to write to the file.
   * @param size - The number of bytes to write, or nil to write all of the data from the string/Blob.
   * @returns 
   * success - Whether the data was successfully written.
   * message - The error message.
   * 
   * The maximum number of bytes that can be written at a time is 2^53 - 1.
   * 
   * Use `File:seek` to control where the data is written.
   */
  write(string: string, size?: number): LuaMultiReturn<[success: boolean, message: string]>

  /**
   * Writes data to the file.
   * 
   * `[success, message] = File.write(blob, size)`
   * 
   * @param blob - The Blob containing data to write to the file.
   * @param size - The number of bytes to write, or nil to write all of the data from the string/Blob.
   * @returns 
   * success - Whether the data was successfully written.
   * message - The error message.
   * 
   * The maximum number of bytes that can be written at a time is 2^53 - 1.
   * 
   * Use `File:seek` to control where the data is written.
   */
  write(blob: Blob, size?: number): LuaMultiReturn<[success: boolean, message: string]>

}

/**
 * Controls whether premultiplied alpha is enabled.
 * 
 * The premultiplied mode should be used if pixels being drawn have already been blended, or "pre-multiplied", by the alpha channel.  This happens when rendering to a texture that contains pixels with transparent alpha values, since the stored color values have already been faded by alpha and don't need to be faded a second time with the alphamultiply blend mode.
 */
declare type BlendAlphaMode = 'alphamultiply' | 'premultiplied'

/** Different ways pixels can blend with the pixels behind them. */
declare type BlendMode = 'alpha' | 'add' | 'subtract' | 'multiply' | 'lighten' | 'darken' | 'screen'

/**
 * The method used to compare depth and stencil values when performing the depth and stencil tests. Also used for compare modes in `Sampler`s.
 * 
 * This type can also be specified using mathematical notation, e.g. `=`, `>`, `<=`, etc. `notequal` can be provided as `~=` or `!=`.
 */
declare type CompareMode = 'none' | 'equal' | 'notequal' | 'less' | 'lequal' | 'greater' | 'gequal'

/** The different ways of doing triangle backface culling. */
declare type CullMode = 'none' | 'back' | 'front'

/**
 * The different ways to pack Buffer fields into memory.
 * 
 * The default is `packed`, which is suitable for vertex buffers and index buffers.  It doesn't add any padding between elements, and so it doesn't waste any space.  However, this layout won't necessarily work for uniform buffers and storage buffers.
 * 
 * The `std140` layout corresponds to the std140 layout used for uniform buffers in GLSL.  It adds the most padding between fields, and requires the stride to be a multiple of 16.  Example:
 * 
 *     layout(std140) uniform ObjectScales { float scales[64]; };
 * 
 * The `std430` layout corresponds to the std430 layout used for storage buffers in GLSL.  It adds some padding between certain types, and may round up the stride.  Example:
 * 
 *     layout(std430) buffer TileSizes { vec2 sizes[]; }
 */
declare type DataLayout = 'packed' | 'std140' | 'std430'

/**
 * Different types for `Buffer` fields.  These are scalar, vector, or matrix types, usually packed into small amounts of space to reduce the amount of memory they occupy.
 * 
 * The names are encoded as follows:
 * 
 * - The data type:
 *   - `i` for signed integer
 *   - `u` for unsigned integer
 *   - `sn` for signed normalized (-1 to 1)
 *   - `un` for unsigned normalized (0 to 1)
 *   - `f` for floating point
 * - The bit depth of each component
 * - The letter `x` followed by the component count (for vectors)
 * 
 * In addition to these values, the following aliases can be used:
 * 
 * <table>
 *   <thead>
 *     <tr>
 *       <td>Alias</td>
 *       <td>Maps to</td>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td><code>vec2</code></td>
 *       <td><code>f32x2</code></td>
 *     </tr>
 *     <tr>
 *       <td><code>vec3</code></td>
 *       <td><code>f32x3</code></td>
 *     </tr>
 *     <tr>
 *       <td><code>vec4</code></td>
 *       <td><code>f32x4</code></td>
 *     </tr>
 *     <tr>
 *       <td><code>int</code></td>
 *       <td><code>i32</code></td>
 *     </tr>
 *     <tr>
 *       <td><code>uint</code></td>
 *       <td><code>u32</code></td>
 *     </tr>
 *     <tr>
 *       <td><code>float</code></td>
 *       <td><code>f32</code></td>
 *     </tr>
 *     <tr>
 *       <td><code>color</code></td>
 *       <td><code>un8x4</code></td>
 *     </tr>
 *   </tbody> </table>
 * 
 * Additionally, the following convenience rules apply:
 * 
 * - Field types can end in an `s`, which will be stripped off.
 * - Field types can end in `x1`, which will be stripped off.
 * 
 * So you can write, e.g. `lovr.graphics.newBuffer(4, 'floats')`, which is cute!
 */
declare type DataType = 'i8x4' | 'u8x4' | 'sn8x4' | 'un8x4' | 'sn10x3' | 'un10x3' | 'i16' | 'i16x2' | 'i16x4' | 'u16' | 'u16x2' | 'u16x4' | 'sn16x2' | 'sn16x4' | 'un16x2' | 'un16x4' | 'i32' | 'i32x2' | 'i32x3' | 'i32x4' | 'u32' | 'u32x2' | 'u32x3' | 'u32x4' | 'f16x2' | 'f16x4' | 'f32' | 'f32x2' | 'f32x3' | 'f32x4' | 'mat2' | 'mat3' | 'mat4' | 'index16' | 'index32'

/** The set of shaders built in to LÖVR.  These can be passed to `Pass:setShader` or `lovr.graphics.newShader` instead of writing GLSL code.  The shaders can be further customized by using the `flags` option to change their behavior.  If the active shader is set to `nil`, LÖVR picks one of these shaders to use. */
declare type DefaultShader = 'unlit' | 'normal' | 'font' | 'cubemap' | 'equirect' | 'fill'

/** Different ways vertices in a mesh can be connected together and filled in with pixels. */
declare type DrawMode = 'points' | 'lines' | 'triangles'

/** Whether a shape should be drawn filled or outlined. */
declare type DrawStyle = 'fill' | 'line'

/** Controls how `Sampler` objects smooth pixels in textures. */
declare type FilterMode = 'nearest' | 'linear' | 'cubic'

/** Different ways to horizontally align text with `Pass:text`. */
declare type HorizontalAlign = 'left' | 'center' | 'right'

/**
 * Whether a Mesh stores its data on the CPU or GPU.
 * 
 * There are some significant differences and tradeoffs between the two modes:
 * 
 * - CPU meshes store a second copy of the vertices in RAM, which can be expensive for large
 *   meshes.
 * - When vertices are modified, CPU meshes will update the CPU copy, and only upload to the GPU
 *   the next time the Mesh is drawn.  GPU meshes, on the other hand, will immediately upload
 *   modified vertices to the GPU.  This means that calling `Mesh:setVertices` multiple times per
 *   frame will be faster with a CPU mesh.
 * - CPU meshes have an internal vertex buffer that can't be accessed from Lua.
 * - CPU meshes can compute their bounding box using `Mesh:computeBoundingBox`.  GPU meshes can't.
 */
declare type MeshStorage = 'cpu' | 'gpu'

/** Different coordinate spaces for nodes in a `Model`. */
declare type OriginType = 'root' | 'parent'

/** Different shader stages.  Graphics shaders have a `vertex` and `fragment` stage, and compute shaders have a single `compute` stage. */
declare type ShaderStage = 'vertex' | 'fragment' | 'compute'

/** The two types of shaders that can be created. */
declare type ShaderType = 'graphics' | 'compute'

/** Different types of stacks that can be pushed and popped with `Pass:push` and `Pass:pop`. */
declare type StackType = 'transform' | 'state'

/** Different ways of updating the stencil buffer with `Pass:setStencilWrite`. */
declare type StencilAction = 'keep' | 'zero' | 'replace' | 'increment' | 'decrement' | 'incrementwrap' | 'decrementwrap' | 'invert'

/** These are the different ways `Texture` objects can be used.  These are passed in to `lovr.graphics.isFormatSupported` to see which texture operations are supported by the GPU for a given format. */
declare type TextureFeature = 'sample' | 'render' | 'storage' | 'blit' | 'cubic'

/** Different types of textures.  Textures are multidimensional blocks of GPU memory, and the texture's type determines how many dimensions there are, and adds some semantics about what the 3rd dimension means. */
declare type TextureType = '2d' | '3d' | 'cube' | 'array'

/** These are the different things `Texture`s can be used for.  When creating a Texture, a set of these flags can be provided, restricting what operations are allowed on the texture.  Using a smaller set of flags may improve performance.  If none are provided, the only usage flag applied is `sample`. */
declare type TextureUsage = 'sample' | 'render' | 'storage' | 'transfer'

/** Different ways to vertically align text with `Pass:text`. */
declare type VerticalAlign = 'top' | 'middle' | 'bottom'

/** Indicates whether the front face of a triangle uses the clockwise or counterclockwise vertex order. */
declare type Winding = 'clockwise' | 'counterclockwise'

/** Controls how `Sampler` objects wrap textures. */
declare type WrapMode = 'clamp' | 'repeat' | 'mirror' | 'border'

/**
 * A Buffer is a block of memory on the GPU.  It's like a GPU version of a `Blob`.  Lua code can write data to the buffer which uploads to VRAM, and shaders read buffer data during rendering. Compute shaders can also write to buffers.
 * 
 * The **size** of a Buffer is the number of bytes of VRAM it occupies.  It's set when the Buffer is created and can't be changed afterwards.
 * 
 * Buffers can optionally have a **format**, which defines the type of data stored in the buffer. The format determines how Lua values are converted into binary.  Like the size, it can't change after the buffer is created.  `Shader:getBufferFormat` returns the format of a variable in a `Shader`.
 * 
 * When a Buffer has a format, it also has a **length**, which is the number of items it holds, and a **stride**, which is the number of bytes between each item.
 * 
 * `Buffer:setData` is used to upload data to the Buffer.  `Buffer:clear` can also be used to efficiently zero out a Buffer.
 * 
 * `Buffer:getData` can be used to download data from the Buffer, but be aware that it stalls the GPU until the download is complete, which is very slow!  `Buffer:newReadback` will instead download the data in the background, which avoids costly stalls.
 * 
 * Buffers are often used for mesh data.  Vertices stored in buffers can be drawn using `Pass:mesh`.  `Mesh` objects can also be used, which wrap Buffers along with some extra metadata.
 * 
 * Buffers can be "bound" to a variable in a Shader using `Pass:send`.  That means that the next time the shader runs, the data from the Buffer will be used for the stuff in the variable.
 * 
 * It's important to understand that data from a Buffer will only be used at the point when graphics commands are actually submitted.  This example records 2 draws, changing the buffer data between each one:
 * 
 *     buffer:setData(data1)
 *     pass:mesh(buffer)
 *     buffer:setData(data2)
 *     pass:mesh(buffer)
 *     lovr.graphics.submit(pass)
 * 
 * **Both** draws will use `data2` here!  That's because `lovr.graphics.submit` is where the draws actually get processed, so they both see the "final" state of the buffer.  The data in a Buffer can't be 2 things at once!  If you need multiple versions of data, it's best to use a bigger buffer with offsets (or multiple buffers).
 */
declare interface Buffer extends LovrObject {
  /**
   * Clears a range of data in the Buffer to a value.
   * 
   * `Buffer.clear(offset, extent, value)`
   * 
   * @param offset - The offset of the range of the Buffer to clear, in bytes.  Must be a multiple of 4.
   * @param extent - The number of bytes to clear.  If `nil`, clears to the end of the Buffer.  Must be a multiple of 4.
   * @param value - The value to clear to.  This will be interpreted as a 32 bit number, which will be repeated across the clear range.
   */
  clear(offset?: number, extent?: number, value?: number): void

  /**
   * Downloads the Buffer's data from VRAM and returns it as a table.  This function is very very slow because it stalls the CPU until the data is finished downloading, so it should only be used for debugging or non-interactive scripts.  `Buffer:newReadback` is an alternative that returns a `Readback` object, which will not block the CPU.
   * 
   * `t = Buffer.getData(index, count)`
   * 
   * @param index - The index of the first item to read.
   * @param count - The number of items to read.  If nil, reads the remainder of the buffer.
   * @returns The table with the Buffer's data.
   * 
   * The length of the table will equal the number of items read.  Here are some examples of how the table is formatted:
   * 
   *     buffer = lovr.graphics.newBuffer('int', { 7 })
   *     buffer:getData() --> returns { 7 }
   * 
   *     buffer = lovr.graphics.newBuffer('vec3', { 7, 8, 9 })
   *     buffer:getData() --> returns {{ 7, 8, 9 }}
   * 
   *     buffer = lovr.graphics.newBuffer('int', { 1, 2, 3 })
   *     buffer:getData() --> returns { 1, 2, 3 }
   * 
   *     buffer = lovr.graphics.newBuffer({ 'vec2', 'vec2' }, {
   *       vec2(1,2), vec2(3,4),
   *       vec2(5,6), vec2(7,8)
   *     })
   *     buffer:getData() --> returns { { 1, 2, 3, 4 }, { 5, 6, 7, 8 } }
   * 
   *     buffer = lovr.graphics.newBuffer({
   *       { 'a', 'float' },
   *       { 'b', 'float' }
   *     }, { a = 1, b = 2 })
   *     buffer:getData() --> returns { { 1, 2 } }
   * 
   *     buffer = lovr.graphics.newBuffer({
   *       { 'x', 'int', 3 }
   *     }, { x = { 1, 2, 3 } })
   *     buffer:getData() --> returns { { x = { 1, 2, 3 } } }
   * 
   *     buffer = lovr.graphics.newBuffer({
   *       { 'lights', {
   *         { 'pos', 'vec3' },
   *         { 'size', 'float' },
   *       }, 10}
   *     }, data)
   *     buffer:getData() --> returns { { lights = { { pos = ..., size = ... }, ... } } }
   * 
   * In summary, each individual item is wrapped in a table, except if the format is a single number. If the format has nested types or arrays then the tables will be key-value, otherwise they will use numeric keys.
   */
  getData(index?: number, count?: number): LuaTable

  /**
   * Returns the format the Buffer was created with.
   * 
   * `format = Buffer.getFormat()`
   * 
   * @returns A list of fields comprising the format.
   */
  getFormat(): LuaTable

  /**
   * Returns the length of the Buffer, or `nil` if the Buffer was not created with a format.
   * 
   * `length = Buffer.getLength()`
   * 
   * @returns The length of the Buffer.
   */
  getLength(): number

  /**
   * Returns the size of the Buffer in VRAM, in bytes.  This is the same as `length * stride`.
   * 
   * The size of the Buffer can't change after it's created.
   * 
   * `size = Buffer.getSize()`
   * 
   * @returns The size of the Buffer, in bytes.
   */
  getSize(): number

  /**
   * Returns the distance between each item in the Buffer, in bytes, or `nil` if the Buffer was not created with a format.
   * 
   * `stride = Buffer.getStride()`
   * 
   * @returns The stride of the Buffer, in bytes.
   * 
   * When a Buffer is created, the stride can be set explicitly, otherwise it will be automatically computed based on the fields in the Buffer.
   * 
   * Strides can not be zero, and can not be smaller than the size of a single item.
   */
  getStride(): number

  /**
   * Returns a pointer to GPU memory and schedules a copy from this pointer to the buffer's data. The data in the pointer will replace the data in the buffer.  This is intended for use with the LuaJIT FFI or for passing to C libraries.
   * 
   * `pointer = Buffer.mapData(offset, extent)`
   * 
   * @param offset - A byte offset in the buffer to write to.
   * @param extent - The number of bytes to replace.  If nil, writes to the rest of the buffer.
   * @returns A pointer to the Buffer's memory.
   * 
   * The pointer remains valid until the next call to `lovr.graphics.submit`, during which the data in the pointer will be uploaded to the buffer.
   * 
   * The initial contents of the pointer are undefined.
   * 
   * Special care should be taken when writing data:
   * 
   * - Reading data from the pointer will be very slow on some systems, and should be avoided.
   * - It is better to write data to the pointer sequentially.  Random access may be slower.
   */
  mapData(offset?: number, extent?: number): any

  /**
   * Creates and returns a new `Readback` that will download the data in the Buffer from VRAM. Once the readback is complete, `Readback:getData` returns the data as a table, or `Readback:getBlob` returns the data as a `Blob`.
   * 
   * `readback = Buffer.newReadback(offset, extent)`
   * 
   * @param offset - A byte offset to read from.
   * @param extent - The number of bytes to read.  If nil, reads the rest of the buffer.
   * @returns A new Readback object.
   * 
   * The offset and extent arguments must be a multiple of the Buffer's stride (unless it was created without a format).
   */
  newReadback(offset?: number, extent?: number): Readback

  /**
   * Copies data to the Buffer from either a table, `Blob`, or `Buffer`.
   * 
   * `Buffer.setData(table, destinationIndex, sourceIndex, count)`
   * 
   * @param table - A flat or nested table of items to copy to the Buffer (see notes for format).
   * @param destinationIndex - The index of the first value in the Buffer to update.
   * @param sourceIndex - The index in the table to copy from.
   * @param count - The number of items to copy.  `nil` will copy as many items as possible, based on the lengths of the source and destination.
   * 
   * One gotcha is that unspecified fields will be set to zero.  Here's an example:
   * 
   *     buffer = lovr.graphics.newBuffer({{ 'x', 'int' }, { 'y', 'int' }})
   *     buffer:setData({ x = 1, y = 1 }) -- set the data
   *     buffer:setData({ x = 1 }) -- set the data, partially
   *     -- buffer data is now {x=1, y=0}!
   * 
   * This doesn't apply to separate items in the buffer.  For example, if the Buffer's length is 2 and only the 1st item is set, the second item will remain undisturbed:
   * 
   *     buffer = lovr.graphics.newBuffer({{ 'x', 'int' }, { 'y', 'int' }}, 2)
   *     buffer:setData({{ x = 1, y = 1 }, { x = 2, y = 2 }}) -- set the data
   *     buffer:setData({{ x = 1 }}) -- set one item, partially
   *     -- buffer data is now {{x=1, y=0}, {x=2, y=2}}
   */
  setData(table: LuaTable, destinationIndex?: number, sourceIndex?: number, count?: number): void

  /**
   * Copies data to the Buffer from either a table, `Blob`, or `Buffer`.
   * 
   * `Buffer.setData(...numbers)`
   * 
   * Copies a single field to a buffer with numbers (buffer length must be 1).
   * 
   * @param ...numbers - Numerical components to copy to the buffer.
   * 
   * One gotcha is that unspecified fields will be set to zero.  Here's an example:
   * 
   *     buffer = lovr.graphics.newBuffer({{ 'x', 'int' }, { 'y', 'int' }})
   *     buffer:setData({ x = 1, y = 1 }) -- set the data
   *     buffer:setData({ x = 1 }) -- set the data, partially
   *     -- buffer data is now {x=1, y=0}!
   * 
   * This doesn't apply to separate items in the buffer.  For example, if the Buffer's length is 2 and only the 1st item is set, the second item will remain undisturbed:
   * 
   *     buffer = lovr.graphics.newBuffer({{ 'x', 'int' }, { 'y', 'int' }}, 2)
   *     buffer:setData({{ x = 1, y = 1 }, { x = 2, y = 2 }}) -- set the data
   *     buffer:setData({{ x = 1 }}) -- set one item, partially
   *     -- buffer data is now {{x=1, y=0}, {x=2, y=2}}
   */
  setData(...numbers: number[]): void

  /**
   * Copies data to the Buffer from either a table, `Blob`, or `Buffer`.
   * 
   * `Buffer.setData(vector)`
   * 
   * Copies a single vector to a buffer (buffer length must be 1).
   * 
   * @param vector - Vector objects to copy to the buffer.
   * 
   * One gotcha is that unspecified fields will be set to zero.  Here's an example:
   * 
   *     buffer = lovr.graphics.newBuffer({{ 'x', 'int' }, { 'y', 'int' }})
   *     buffer:setData({ x = 1, y = 1 }) -- set the data
   *     buffer:setData({ x = 1 }) -- set the data, partially
   *     -- buffer data is now {x=1, y=0}!
   * 
   * This doesn't apply to separate items in the buffer.  For example, if the Buffer's length is 2 and only the 1st item is set, the second item will remain undisturbed:
   * 
   *     buffer = lovr.graphics.newBuffer({{ 'x', 'int' }, { 'y', 'int' }}, 2)
   *     buffer:setData({{ x = 1, y = 1 }, { x = 2, y = 2 }}) -- set the data
   *     buffer:setData({{ x = 1 }}) -- set one item, partially
   *     -- buffer data is now {{x=1, y=0}, {x=2, y=2}}
   */
  setData(vector: any): void

  /**
   * Copies data to the Buffer from either a table, `Blob`, or `Buffer`.
   * 
   * `Buffer.setData(blob, destinationOffset, sourceOffset, size)`
   * 
   * @param blob - The Blob to copy data from.
   * @param destinationOffset - The byte offset to copy to.
   * @param sourceOffset - The byte offset to copy from.
   * @param size - The number of bytes to copy.  If nil, copies as many bytes as possible.
   * 
   * One gotcha is that unspecified fields will be set to zero.  Here's an example:
   * 
   *     buffer = lovr.graphics.newBuffer({{ 'x', 'int' }, { 'y', 'int' }})
   *     buffer:setData({ x = 1, y = 1 }) -- set the data
   *     buffer:setData({ x = 1 }) -- set the data, partially
   *     -- buffer data is now {x=1, y=0}!
   * 
   * This doesn't apply to separate items in the buffer.  For example, if the Buffer's length is 2 and only the 1st item is set, the second item will remain undisturbed:
   * 
   *     buffer = lovr.graphics.newBuffer({{ 'x', 'int' }, { 'y', 'int' }}, 2)
   *     buffer:setData({{ x = 1, y = 1 }, { x = 2, y = 2 }}) -- set the data
   *     buffer:setData({{ x = 1 }}) -- set one item, partially
   *     -- buffer data is now {{x=1, y=0}, {x=2, y=2}}
   */
  setData(blob: Blob, destinationOffset?: number, sourceOffset?: number, size?: number): void

  /**
   * Copies data to the Buffer from either a table, `Blob`, or `Buffer`.
   * 
   * `Buffer.setData(buffer, destinationOffset, sourceOffset, size)`
   * 
   * @param buffer - The Buffer to copy data from.
   * @param destinationOffset - The byte offset to copy to.
   * @param sourceOffset - The byte offset to copy from.
   * @param size - The number of bytes to copy.  If nil, copies as many bytes as possible.
   * 
   * One gotcha is that unspecified fields will be set to zero.  Here's an example:
   * 
   *     buffer = lovr.graphics.newBuffer({{ 'x', 'int' }, { 'y', 'int' }})
   *     buffer:setData({ x = 1, y = 1 }) -- set the data
   *     buffer:setData({ x = 1 }) -- set the data, partially
   *     -- buffer data is now {x=1, y=0}!
   * 
   * This doesn't apply to separate items in the buffer.  For example, if the Buffer's length is 2 and only the 1st item is set, the second item will remain undisturbed:
   * 
   *     buffer = lovr.graphics.newBuffer({{ 'x', 'int' }, { 'y', 'int' }}, 2)
   *     buffer:setData({{ x = 1, y = 1 }, { x = 2, y = 2 }}) -- set the data
   *     buffer:setData({{ x = 1 }}) -- set one item, partially
   *     -- buffer data is now {{x=1, y=0}, {x=2, y=2}}
   */
  setData(buffer: Buffer, destinationOffset?: number, sourceOffset?: number, size?: number): void

}

/**
 * Font objects are used to render text with `Pass:text`.  The active font can be changed using `Pass:setFont`.  The default font is Varela Round, which is used when no font is active, and can be retrieved using `lovr.graphics.getDefaultFont`.  Custom fonts can be loaded from TTF and BMFont files using `lovr.graphics.newFont`.
 * 
 * Each Font uses a `Rasterizer` to load the font and create images for each glyph. As text is drawn, the Font uploads images from the Rasterizer to a GPU texture atlas as needed.  The Font also performs text layout and mesh generation for strings of text.
 * 
 * For TTF fonts, LÖVR uses a text rendering technique called "multichannel signed distance fields" (MSDF), which makes the font rendering remain crisp when text is viewed up close.
 * 
 * MSDF text requires a special shader to work.  LÖVR will automatically switch to this shader if no shader is active on the `Pass`.  This font shader is also available as a `DefaultShader`.
 */
declare interface Font extends LovrObject {
  /**
   * Returns the ascent of the font.  The ascent is the maximum amount glyphs ascend above the baseline.  The units depend on the font's pixel density.  With the default density, the units correspond to meters.
   * 
   * `ascent = Font.getAscent()`
   * 
   * @returns The ascent of the font.
   */
  getAscent(): number

  /**
   * Returns the descent of the font.  The descent is the maximum amount glyphs descend below the baseline.  The units depend on the font's pixel density.  With the default density, the units correspond to meters.
   * 
   * `descent = Font.getDescent()`
   * 
   * @returns The descent of the font.
   */
  getDescent(): number

  /**
   * Returns the height of the font, sometimes also called the leading.  This is the full height of a line of text, including the space between lines.  Each line of a multiline string is separated on the y axis by this height, multiplied by the font's line spacing.  The units depend on the font's pixel density.  With the default density, the units correspond to meters.
   * 
   * `height = Font.getHeight()`
   * 
   * @returns The height of the font.
   */
  getHeight(): number

  /**
   * Returns the kerning between 2 glyphs.  Kerning is a slight horizontal adjustment between 2 glyphs to improve the visual appearance.  It will often be negative.  The units depend on the font's pixel density.  With the default density, the units correspond to meters.
   * 
   * `keming = Font.getKerning(first, second)`
   * 
   * @param first - The first character or codepoint.
   * @param second - The second character or codepoint.
   * @returns The kerning between the two glyphs.
   */
  getKerning(first: string | number, second: string | number): number

  /**
   * Returns the line spacing of the Font.  When spacing out lines, the height of the font is multiplied the line spacing to get the final spacing value.  The default is 1.0.
   * 
   * `spacing = Font.getLineSpacing()`
   * 
   * @returns The line spacing of the font.
   */
  getLineSpacing(): number

  /**
   * Returns a table of wrapped lines for a piece of text, given a line length limit.
   * 
   * By default the units for `limit` are in meters.  If text is being drawn with scale applied, make sure the scale is also applied to the `limit`.
   * 
   * `lines = Font.getLines(string, wrap)`
   * 
   * @param string - The text to wrap.
   * @param wrap - The line length to wrap at.
   * @returns A table of strings, one for each wrapped line.
   * 
   * The font's pixel density is incorporated into the limit.  So if the font's pixel density is changed to 1 (changing the font's units to pixels), the `limit` will be in pixels as well.
   */
  getLines(string: string, wrap: number): string[]

  /**
   * Returns a table of wrapped lines for a piece of text, given a line length limit.
   * 
   * By default the units for `limit` are in meters.  If text is being drawn with scale applied, make sure the scale is also applied to the `limit`.
   * 
   * `lines = Font.getLines(strings, wrap)`
   * 
   * @param strings - A table of colored strings, each given as a `{ color, string }` pair.  The color can be a `Vec3`, `Vec4`, table, or hexcode.
   * @param wrap - The line length to wrap at.
   * @returns A table of strings, one for each wrapped line.
   * 
   * The font's pixel density is incorporated into the limit.  So if the font's pixel density is changed to 1 (changing the font's units to pixels), the `limit` will be in pixels as well.
   */
  getLines(strings: LuaTable, wrap: number): string[]

  /**
   * Returns the pixel density of the font.  The density is a "pixels per world unit" factor that controls how the pixels in the font's texture are mapped to units in the coordinate space.
   * 
   * The default pixel density is set to the height of the font.  This means that lines of text rendered with a scale of 1.0 come out to 1 unit (meter) tall.  However, if this font was drawn to a 2D texture where the units are in pixels, the font would still be drawn 1 unit (pixel) tall!  Scaling the coordinate space or the size of the text by the height of the font would fix this.  However, a more convenient option is to set the pixel density of the font to 1.0 when doing 2D rendering to make the font's size match up with the pixels of the canvas.
   * 
   * `density = Font.getPixelDensity()`
   * 
   * @returns The pixel density of the font.
   */
  getPixelDensity(): number

  /**
   * Returns the Rasterizer object backing the Font.
   * 
   * `rasterizer = Font.getRasterizer()`
   * 
   * @returns The Rasterizer.
   */
  getRasterizer(): Rasterizer

  /**
   * Returns a table of vertices for a piece of text, along with a Material to use when rendering it. The Material returned by this function may not be the same if the Font's texture atlas needs to be recreated with a bigger size to make room for more glyphs.
   * 
   * `[vertices, material] = Font.getVertices(string, wrap, halign, valign)`
   * 
   * @param string - The text to render.
   * @param wrap - The maximum line length.  The units depend on the pixel density of the font, but are in meters by default.
   * @param halign - The horizontal align.
   * @param valign - The vertical align.
   * @returns 
   * vertices - The table of vertices.  See below for the format of each vertex.
   * material - A Material to use when rendering the vertices.
   * 
   * Each vertex is a table of 4 floating point numbers with the following data:
   * 
   *     { x, y, u, v }
   * 
   * These could be placed in a vertex buffer using the following buffer format:
   * 
   *     {
   *       { 'VertexPosition', 'vec2' },
   *       { 'VertexUV', 'vec2' }
   *     }
   */
  getVertices(string: string, wrap: number, halign: HorizontalAlign, valign: VerticalAlign): LuaMultiReturn<[vertices: number[], material: Material]>

  /**
   * Returns a table of vertices for a piece of text, along with a Material to use when rendering it. The Material returned by this function may not be the same if the Font's texture atlas needs to be recreated with a bigger size to make room for more glyphs.
   * 
   * `[vertices, material] = Font.getVertices(strings, wrap, halign, valign)`
   * 
   * @param strings - A table of colored strings, each given as a `{ color, string }` pair.  The color can be a `Vec3`, `Vec4`, table, or hexcode.
   * @param wrap - The maximum line length.  The units depend on the pixel density of the font, but are in meters by default.
   * @param halign - The horizontal align.
   * @param valign - The vertical align.
   * @returns 
   * vertices - The table of vertices.  See below for the format of each vertex.
   * material - A Material to use when rendering the vertices.
   * 
   * Each vertex is a table of 4 floating point numbers with the following data:
   * 
   *     { x, y, u, v }
   * 
   * These could be placed in a vertex buffer using the following buffer format:
   * 
   *     {
   *       { 'VertexPosition', 'vec2' },
   *       { 'VertexUV', 'vec2' }
   *     }
   */
  getVertices(strings: LuaTable, wrap: number, halign: HorizontalAlign, valign: VerticalAlign): LuaMultiReturn<[vertices: number[], material: Material]>

  /**
   * Returns the maximum width of a piece of text.  This function does not perform wrapping but does respect newlines in the text.
   * 
   * `width = Font.getWidth(string)`
   * 
   * @param string - The text to measure.
   * @returns The maximum width of the text.
   */
  getWidth(string: string): number

  /**
   * Returns the maximum width of a piece of text.  This function does not perform wrapping but does respect newlines in the text.
   * 
   * `width = Font.getWidth(strings)`
   * 
   * @param strings - A table of colored strings, each given as a `{ color, string }` pair.  The color can be a `Vec3`, `Vec4`, table, or hexcode.
   * @returns The maximum width of the text.
   */
  getWidth(strings: LuaTable): number

  /**
   * Sets the line spacing of the Font.  When spacing out lines, the height of the font is multiplied by the line spacing to get the final spacing value.  The default is 1.0.
   * 
   * `Font.setLineSpacing(spacing)`
   * 
   * @param spacing - The new line spacing.
   */
  setLineSpacing(spacing: number): void

  /**
   * Sets the pixel density of the font.  The density is a "pixels per world unit" factor that controls how the pixels in the font's texture are mapped to units in the coordinate space.
   * 
   * The default pixel density is set to the height of the font.  This means that lines of text rendered with a scale of 1.0 come out to 1 unit (meter) tall.  However, if this font was drawn to a 2D texture where the units are in pixels, the font would still be drawn 1 unit (pixel) tall!  Scaling the coordinate space or the size of the text by the height of the font would fix this.  However, a more convenient option is to set the pixel density of the font to 1.0 when doing 2D rendering to make the font's size match up with the pixels of the canvas.
   * 
   * `Font.setPixelDensity(density)`
   * 
   * @param density - The new pixel density of the font.
   */
  setPixelDensity(density: number): void

  /**
   * Sets the pixel density of the font.  The density is a "pixels per world unit" factor that controls how the pixels in the font's texture are mapped to units in the coordinate space.
   * 
   * The default pixel density is set to the height of the font.  This means that lines of text rendered with a scale of 1.0 come out to 1 unit (meter) tall.  However, if this font was drawn to a 2D texture where the units are in pixels, the font would still be drawn 1 unit (pixel) tall!  Scaling the coordinate space or the size of the text by the height of the font would fix this.  However, a more convenient option is to set the pixel density of the font to 1.0 when doing 2D rendering to make the font's size match up with the pixels of the canvas.
   * 
   * `Font.setPixelDensity()`
   * 
   * Resets the pixel density to the default, which is given by `Font:getHeight`.
   */
  setPixelDensity(): void

}

/**
 * Materials are a set of properties and textures that define the properties of a surface, like what color it is, how bumpy or shiny it is, etc. `Shader` code can use the data from a material to compute lighting.
 * 
 * Materials are immutable, and can't be changed after they are created.  Instead, a new Material should be created with the updated properties.
 * 
 * `Pass:setMaterial` changes the active material, causing it to affect rendering until the active material is changed again.
 * 
 * Using material objects is optional.  `Pass:setMaterial` can take a `Texture`, and `Pass:setColor` can change the color of objects, so basic tinting and texturing of surfaces does not require a full material to be created.  Also, a custom material system could be developed by sending textures and other data to shaders manually.
 * 
 * `Model` objects will create materials for all of the materials defined in the model file.
 * 
 * In shader code, non-texture material properties can be accessed as `Material.<property>`, and material textures can be accessed as `<Type>Texture`, e.g. `RoughnessTexture`.
 */
declare interface Material extends LovrObject {
  /**
   * Returns the properties of the Material in a table.
   * 
   * `properties = Material.getProperties()`
   * 
   * @returns The Material properties.
   */
  getProperties(): LuaTable

}

/**
 * Meshes store arbitrary geometry data, and can be drawn with `Pass:draw`.
 * 
 * Meshes hold a list of **vertices**.  The number of vertices is declared upfront when the Mesh is created, and it can not be resized afterwards.
 * 
 * The Mesh has a **vertex format**, which is a set of **attributes** comprising each vertex, like a `position`, `color`, etc.
 * 
 * The **vertex indices** in the Mesh describe the order that the vertices are rendered in.  This is an optimization that allows vertices to be reused if they are used for multiple triangles, without duplicating all of their data.
 * 
 * The Mesh has a **draw mode**, which controls how the vertices are connected together to create pixels.  It can either be `points`, `lines`, or `triangles`.
 * 
 * The Mesh can have a `Material` applied, which defines colors, textures, and other properties of its surface.
 * 
 * The **draw range** of the Mesh defines a subset of the vertices to render when the Mesh is drawn.
 * 
 * The **bounding box** of the Mesh allows LÖVR to skip rendering it when it's out of view.
 */
declare interface Mesh extends LovrObject {
  /**
   * Computes the axis-aligned bounding box of the Mesh from its vertices.
   * 
   * If the Mesh was created with the `gpu` storage mode, this function will do nothing and return `false`.
   * 
   * If the Mesh does not have an attribute named `VertexPosition` with the `f32x3` (aka `vec3`) type, this function will do nothing and return `false`.
   * 
   * Otherwise, the bounding box will be set and the return value will be `true`.
   * 
   * The bounding box can also be assigned manually using `Mesh:setBoundingBox`, which can be used to set the bounding box on a `gpu` mesh or for cases where the bounding box is already known.
   * 
   * Passes will use the bounding box of a Mesh to cull it against the cameras when `Pass:setViewCull` is enabled, which avoids rendering it when it's out of view.
   * 
   * `updated = Mesh.computeBoundingBox()`
   * 
   * @returns Whether the bounding box was updated.
   */
  computeBoundingBox(): boolean

  /**
   * Returns the axis-aligned bounding box of the Mesh, or `nil` if the Mesh doesn't have a bounding box.
   * 
   * Meshes with the `cpu` storage mode can compute their bounding box automatically using `Mesh:computeBoundingBox`.  The bounding box can also be set manually using `Mesh:setBoundingBox`.
   * 
   * Passes will use the bounding box of a Mesh to cull it against the cameras when `Pass:setViewCull` is enabled, which avoids rendering it when it's out of view.
   * 
   * `[minx, maxx, miny, maxy, minz, maxz] = Mesh.getBoundingBox()`
   * 
   * @returns 
   * minx - The minimum x coordinate of the bounding box.
   * maxx - The maximum x coordinate of the bounding box.
   * miny - The minimum y coordinate of the bounding box.
   * maxy - The maximum y coordinate of the bounding box.
   * minz - The minimum z coordinate of the bounding box.
   * maxz - The maximum z coordinate of the bounding box.
   */
  getBoundingBox(): LuaMultiReturn<[minx: number, maxx: number, miny: number, maxy: number, minz: number, maxz: number]>

  /**
   * Returns the `DrawMode` of the mesh, which controls how the vertices in the Mesh are connected together to create pixels.  The default is `triangles`.
   * 
   * `mode = Mesh.getDrawMode()`
   * 
   * @returns The current draw mode.
   */
  getDrawMode(): DrawMode

  /**
   * Returns the range of vertices drawn by the Mesh.  If different sets of mesh data are stored in a single Mesh object, the draw range can be used to select different sets of vertices to render.
   * 
   * `[start, count, offset] = Mesh.getDrawRange()`
   * 
   * @returns 
   * start - The index of the first vertex that will be drawn (or the first index, if the Mesh has vertex indices).
   * count - The number of vertices that will be drawn (or indices, if the Mesh has vertex indices).
   * offset - When the Mesh has vertex indices, an offset that will be added to the index values before fetching the corresponding vertex.  This is ignored if the Mesh does not have vertex indices.
   */
  getDrawRange(): LuaMultiReturn<[start: number, count: number, offset: number]>

  /**
   * Returns the range of vertices drawn by the Mesh.  If different sets of mesh data are stored in a single Mesh object, the draw range can be used to select different sets of vertices to render.
   * 
   * `Mesh.getDrawRange()`
   * 
   * This function returns nothing if no draw range is set.
   */
  getDrawRange(): void

  /**
   * Returns the `Buffer` object that holds the data for the vertex indices in the Mesh.
   * 
   * This can be `nil` if the Mesh doesn't have any indices.
   * 
   * If a Mesh uses the `cpu` storage mode, the index buffer is internal to the `Mesh` and this function will return `nil`.  This ensures that the CPU data for the Mesh does not get out of sync with the GPU data in the Buffer.
   * 
   * `buffer = Mesh.getIndexBuffer()`
   * 
   * @returns The index buffer.
   */
  getIndexBuffer(): Buffer

  /**
   * Returns a table with the Mesh's vertex indices.
   * 
   * `t = Mesh.getIndices()`
   * 
   * @returns A table of numbers with the 1-based vertex indices.
   * 
   * This function will be very very slow if the Mesh's storage is `gpu`, because the data needs to be downloaded from the GPU.
   */
  getIndices(): number[]

  /**
   * Returns the `Material` applied to the Mesh.
   * 
   * `material = Mesh.getMaterial()`
   * 
   * @returns The material.
   */
  getMaterial(): Material

  /**
   * Returns the `Buffer` object that holds the data for the vertices in the Mesh.
   * 
   * If a Mesh uses the `cpu` storage mode, the vertex buffer is internal to the `Mesh` and this function will return `nil`.  This ensures that the CPU data for the Mesh does not get out of sync with the GPU data in the Buffer.
   * 
   * `buffer = Mesh.getVertexBuffer()`
   * 
   * @returns The vertex buffer.
   */
  getVertexBuffer(): Buffer

  /**
   * Returns the number of vertices in the Mesh.  The vertex count is set when the Mesh is created and can't change afterwards.
   * 
   * `count = Mesh.getVertexCount()`
   * 
   * @returns The number of vertices in the Mesh.
   */
  getVertexCount(): number

  /**
   * Returns the vertex format of the Mesh, which is a list of "attributes" that make up the data for each vertex (position, color, UV, etc.).
   * 
   * `format = Mesh.getVertexFormat()`
   * 
   * @returns The vertex format.
   * 
   * If no vertex format is given when the Mesh is created, it will use a default format:
   * 
   *     {
   *       { 'VertexPosition', 'vec3', 0 },
   *       { 'VertexNormal', 'vec3', 12 },
   *       { 'VertexUV', 'vec2', 24 }
   *     }
   * 
   * The name of the vertex attribute corresponds to an `in` input variable in a vertex shader.
   * 
   * There are a few built-in attributes that all shaders will understand and use by default:
   * 
   * <table>
   *   <thead>
   *     <tr>
   *       <td>Name</td>
   *       <td>Description</td>
   *     </tr>
   *   </thead>
   *   <tbody>
   *     <tr>
   *       <td><code>VertexPosition</code></td>
   *       <td>The position of the vertex.</td>
   *     </tr>
   *     <tr>
   *       <td><code>VertexNormal</code></td>
   *       <td>The normal vector of the vertex.</td>
   *     </tr>
   *     <tr>
   *       <td><code>VertexUV</code></td>
   *       <td>The texture coordinate of the vertex.</td>
   *     </tr>
   *     <tr>
   *       <td><code>VertexColor</code></td>
   *       <td>The color of the vertex (linear color space).</td>
   *     </tr>
   *     <tr>
   *       <td><code>VertexTangent</code></td>
   *       <td>The tangent vector of the vertex.</td>
   *     </tr>
   *   </tbody> </table>
   * 
   * See the `Shaders` and `Meshes` guides for more info.
   */
  getVertexFormat(): LuaTable

  /**
   * Returns the stride of the Mesh, which is the number of bytes used by each vertex.
   * 
   * `stride = Mesh.getVertexStride()`
   * 
   * @returns The stride of the Mesh, in bytes.
   */
  getVertexStride(): number

  /**
   * Returns the vertices in the Mesh.
   * 
   * `vertices = Mesh.getVertices(index, count)`
   * 
   * @param index - The index of the first vertex to return.
   * @param count - The number of vertices to return.  If nil, returns the "rest" of the vertices, based on the `index` argument.
   * @returns A table of vertices.  Each vertex is a table of numbers for each vertex attribute, given by the vertex format of the Mesh.
   * 
   * > **This function will be very very slow if the storage mode of the Mesh is `gpu`, because the
   * > data will be downloaded from VRAM.  A better option is to call `Buffer:newReadback` on the
   * > Mesh's underlying vertex buffer (`Mesh:getVertexBuffer`), which will download in the
   * > background instead of waiting for it to complete.**
   */
  getVertices(index?: number, count?: number): number[][]

  /**
   * Sets or removes the axis-aligned bounding box of the Mesh.
   * 
   * Meshes with the `cpu` storage mode can compute their bounding box automatically using `Mesh:computeBoundingBox`.
   * 
   * Passes will use the bounding box of a Mesh to cull it against the cameras when `Pass:setViewCull` is enabled, which avoids rendering it when it's out of view.
   * 
   * `Mesh.setBoundingBox(minx, maxx, miny, maxy, minz, maxz)`
   * 
   * @param minx - The minimum x coordinate of the bounding box.
   * @param maxx - The maximum x coordinate of the bounding box.
   * @param miny - The minimum y coordinate of the bounding box.
   * @param maxy - The maximum y coordinate of the bounding box.
   * @param minz - The minimum z coordinate of the bounding box.
   * @param maxz - The maximum z coordinate of the bounding box.
   */
  setBoundingBox(minx: number, maxx: number, miny: number, maxy: number, minz: number, maxz: number): void

  /**
   * Sets or removes the axis-aligned bounding box of the Mesh.
   * 
   * Meshes with the `cpu` storage mode can compute their bounding box automatically using `Mesh:computeBoundingBox`.
   * 
   * Passes will use the bounding box of a Mesh to cull it against the cameras when `Pass:setViewCull` is enabled, which avoids rendering it when it's out of view.
   * 
   * `Mesh.setBoundingBox()`
   * 
   * Remove the bounding box.
   */
  setBoundingBox(): void

  /**
   * Changes the `DrawMode` of the mesh, which controls how the vertices in the Mesh are connected together to create pixels.  The default is `triangles`.
   * 
   * `Mesh.setDrawMode(mode)`
   * 
   * @param mode - The current draw mode.
   */
  setDrawMode(mode: DrawMode): void

  /**
   * Sets the range of vertices drawn by the Mesh.  If different sets of mesh data are stored in a single Mesh object, the draw range can be used to select different sets of vertices to render.
   * 
   * `Mesh.setDrawRange(start, count, offset)`
   * 
   * @param start - The index of the first vertex that will be drawn (or the first index, if the Mesh has vertex indices).
   * @param count - The number of vertices that will be drawn (or indices, if the Mesh has vertex indices).
   * @param offset - When the Mesh has vertex indices, an offset that will be added to the index values before fetching the corresponding vertex.  This is ignored if the Mesh does not have vertex indices.
   * 
   * When using an index buffer, the draw range defines a range of indices to render instead of a range of vertices.  Additionally, a vertex offset can be set, which is added to the values in the index buffer before fetching the vertices.  This makes it easier to pack multiple sets of indexed mesh data in a single Mesh object, without having to manually offset the data in each index buffer.
   */
  setDrawRange(start: number, count: number, offset: number): void

  /**
   * Sets the range of vertices drawn by the Mesh.  If different sets of mesh data are stored in a single Mesh object, the draw range can be used to select different sets of vertices to render.
   * 
   * `Mesh.setDrawRange()`
   * 
   * Disable the draw range.  The Mesh will draw all of its vertices.
   * 
   * When using an index buffer, the draw range defines a range of indices to render instead of a range of vertices.  Additionally, a vertex offset can be set, which is added to the values in the index buffer before fetching the vertices.  This makes it easier to pack multiple sets of indexed mesh data in a single Mesh object, without having to manually offset the data in each index buffer.
   */
  setDrawRange(): void

  /**
   * Sets a `Buffer` object the Mesh will use for vertex indices.
   * 
   * This can only be used if the Mesh uses the `gpu` storage mode.
   * 
   * The Buffer must have a single field with the `u16`, `u32`, `index16`, or `index32` type.
   * 
   * `Mesh.setIndexBuffer(buffer)`
   * 
   * @param buffer - The index buffer.
   * 
   * The index buffer stores a list of numbers where each number is the index of a vertex in the Mesh.  When drawing the Mesh, the data from the vertex corresponding to the index is used.  This can be used to reorder or reuse vertices, which uses less data than repeating a vertex multiple times in the Mesh.
   */
  setIndexBuffer(buffer: Buffer): void

  /**
   * Sets or clears the vertex indices of the Mesh.  Vertex indices define the list of triangles in the mesh.  They allow vertices to be reused multiple times without duplicating all their data, which can save a lot of memory and processing time if a vertex is used for multiple triangles.
   * 
   * If a Mesh doesn't have vertex indices, then the vertices are rendered in order.
   * 
   * `Mesh.setIndices(t)`
   * 
   * Set vertex indices using a table.
   * 
   * @param t - A list of numbers (1-based).
   */
  setIndices(t: number[]): void

  /**
   * Sets or clears the vertex indices of the Mesh.  Vertex indices define the list of triangles in the mesh.  They allow vertices to be reused multiple times without duplicating all their data, which can save a lot of memory and processing time if a vertex is used for multiple triangles.
   * 
   * If a Mesh doesn't have vertex indices, then the vertices are rendered in order.
   * 
   * `Mesh.setIndices(blob, type)`
   * 
   * Set vertex indices using a Blob.
   * 
   * @param blob - The Blob with index data.
   * @param type - The type of index data in the Blob.  Must be `u16` or `u32`.
   */
  setIndices(blob: Blob, type: DataType): void

  /**
   * Sets or clears the vertex indices of the Mesh.  Vertex indices define the list of triangles in the mesh.  They allow vertices to be reused multiple times without duplicating all their data, which can save a lot of memory and processing time if a vertex is used for multiple triangles.
   * 
   * If a Mesh doesn't have vertex indices, then the vertices are rendered in order.
   * 
   * `Mesh.setIndices()`
   * 
   * Disable vertex indices.
   */
  setIndices(): void

  /**
   * Sets a `Material` to use when drawing the Mesh.
   * 
   * `Mesh.setMaterial(material)`
   * 
   * @param material - The material to use.
   */
  setMaterial(material: Material): void

  /**
   * Sets a `Material` to use when drawing the Mesh.
   * 
   * `Mesh.setMaterial(texture)`
   * 
   * @param texture - The texture to use as the material.
   */
  setMaterial(texture: Texture): void

  /**
   * Sets the data for vertices in the Mesh.
   * 
   * `Mesh.setVertices(vertices, index, count)`
   * 
   * @param vertices - A table of vertices, where each vertex is a table of numbers matching the vertex format of the Mesh.
   * @param index - The index of the first vertex to set.
   * @param count - The number of vertices to set.
   * 
   * Note that a `Pass` that draws a Mesh will only "see" the vertices as they exist when the pass is submitted.  So, if this function is used to change vertices multiple times before submitting the Pass, only the final value of each vertex will be used.  Example:
   * 
   *     function lovr.draw(pass)
   *       -- Due to the second :setVertices call below, the Mesh
   *       -- contains a sphere when this pass is submitted!  So
   *       -- this code will actually draw 2 spheres!
   *       mesh:setVertices(cube)
   *       pass:draw(mesh, x1, y1, z1)
   * 
   *       mesh:setVertices(sphere)
   *       pass:draw(mesh, x2, y2, z2)
   *     end
   * 
   * If you want multiple meshes, then use multiple Mesh objects!  Or, *append* vertices to the Mesh instead of replacing them, and use `Mesh:setDrawRange` to control which vertices are drawn for a particular draw call.
   * 
   * CPU meshes will write the data to CPU memory and upload any changes to the GPU before the Mesh is drawn.  GPU meshes don't store this CPU copy of the data, and will immediately upload the new vertex data to VRAM.  This means that multiple calls to this function might be slower on a `gpu` mesh.
   */
  setVertices(vertices: number[][], index?: number, count?: number): void

  /**
   * Sets the data for vertices in the Mesh.
   * 
   * `Mesh.setVertices(blob, index, count)`
   * 
   * @param blob - A Blob containing binary vertex data.
   * @param index - The index of the first vertex to set.
   * @param count - The number of vertices to set.
   * 
   * Note that a `Pass` that draws a Mesh will only "see" the vertices as they exist when the pass is submitted.  So, if this function is used to change vertices multiple times before submitting the Pass, only the final value of each vertex will be used.  Example:
   * 
   *     function lovr.draw(pass)
   *       -- Due to the second :setVertices call below, the Mesh
   *       -- contains a sphere when this pass is submitted!  So
   *       -- this code will actually draw 2 spheres!
   *       mesh:setVertices(cube)
   *       pass:draw(mesh, x1, y1, z1)
   * 
   *       mesh:setVertices(sphere)
   *       pass:draw(mesh, x2, y2, z2)
   *     end
   * 
   * If you want multiple meshes, then use multiple Mesh objects!  Or, *append* vertices to the Mesh instead of replacing them, and use `Mesh:setDrawRange` to control which vertices are drawn for a particular draw call.
   * 
   * CPU meshes will write the data to CPU memory and upload any changes to the GPU before the Mesh is drawn.  GPU meshes don't store this CPU copy of the data, and will immediately upload the new vertex data to VRAM.  This means that multiple calls to this function might be slower on a `gpu` mesh.
   */
  setVertices(blob: Blob, index?: number, count?: number): void

}

/**
 * Models are 3D model assets loaded from files.  Currently, OBJ, glTF, and binary STL files are supported.
 * 
 * A model can be drawn using `Pass:draw`.
 * 
 * The raw CPU data for a model is held in a `ModelData` object, which can be loaded on threads or reused for multiple Model instances.
 * 
 * Models have a hierarchy of nodes which can have their transforms modified.  Meshes are attached to these nodes.  The same mesh can be attached to multiple nodes, allowing it to be drawn multiple times while only storing a single copy of its data.
 * 
 * Models can have animations.  Animations have keyframes which affect the transforms of nodes. Right now each model can only be drawn with a single animated pose per frame.
 * 
 * Models can have materials, which are collections of properties and textures that define how its surface is affected by lighting.  Each mesh in the model can use a single material.
 */
declare interface Model extends LovrObject {
  /**
   * Animates a Model by setting or blending the transforms of nodes using data stored in the keyframes of an animation.
   * 
   * The animation from the model file is evaluated at the timestamp, resulting in a set of node properties.  These properties are then applied to the nodes in the model, using an optional blend factor.  If the animation doesn't have keyframes that target a given node, the node will remain unchanged.
   * 
   * `Model.animate(animation, time, blend)`
   * 
   * @param animation - The name or index of an animation in the model file.
   * @param time - The timestamp to evaluate the keyframes at, in seconds.
   * @param blend - How much of the animation's pose to blend into the nodes, from 0 to 1.
   * 
   * If the timestamp is larger than the duration of the animation, it will wrap back around to zero, so looping an animation doesn't require using the modulo operator.
   * 
   * To change the speed of the animation, multiply the timestamp by a speed factor.
   * 
   * For each animated property in the animation, if the timestamp used for the animation is less than the timestamp of the first keyframe, the data of the first keyframe will be used.
   * 
   * This function can be called multiple times to layer and blend animations.  The model joints will be drawn in the final resulting pose.
   * 
   * `Model:resetNodeTransforms` can be used to reset the model nodes to their initial transforms, which is helpful to ensure animating starts from a clean slate.
   */
  animate(animation: string, time: number, blend?: number): void

  /**
   * Returns a lightweight copy of a Model.  Most of the data will be shared between the two copies of the model, like the materials, textures, and metadata.  However, the clone has its own set of node transforms, allowing it to be animated separately from its parent.  This allows a single model to be rendered in multiple different animation poses in a frame.
   * 
   * `model = Model.clone()`
   * 
   * @returns A genetically identical copy of the Model.
   * 
   * The node transforms of the clone will be reset to their initial setup poses.
   */
  clone(): Model

  /**
   * Returns the number of animations in the Model.
   * 
   * `count = Model.getAnimationCount()`
   * 
   * @returns The number of animations in the Model.
   */
  getAnimationCount(): number

  /**
   * Returns the duration of an animation in the Model, in seconds.
   * 
   * `duration = Model.getAnimationDuration(animation)`
   * 
   * @param animation - The name or index of an animation.
   * @returns The duration of the animation, in seconds.
   * 
   * The duration of an animation is calculated as the largest timestamp of all of its keyframes.
   */
  getAnimationDuration(animation: string | number): number

  /**
   * Returns the name of an animation in the Model.
   * 
   * `name = Model.getAnimationName(index)`
   * 
   * @param index - The index of an animation.
   * @returns The name of the animation, or `nil` if the animation doesn't have a name.
   */
  getAnimationName(index: number): string | undefined

  /**
   * Returns the number of blend shapes in the model.
   * 
   * `count = Model.getBlendShapeCount()`
   * 
   * @returns The number of blend shapes in the model.
   */
  getBlendShapeCount(): number

  /**
   * Returns the name of a blend shape in the model.
   * 
   * `name = Model.getBlendShapeName(index)`
   * 
   * @param index - The index of a blend shape.
   * @returns The name of the blend shape.
   * 
   * This function will throw an error if the blend shape index is invalid.
   */
  getBlendShapeName(index: number): string

  /**
   * Returns the weight of a blend shape.  A blend shape contains offset values for the vertices of one of the meshes in a Model.  Whenever the Model is drawn, the offsets are multiplied by the weight of the blend shape, allowing for smooth blending between different meshes.  A weight of zero won't apply any displacement and will skip processing of the blend shape.
   * 
   * `weight = Model.getBlendShapeWeight(blendshape)`
   * 
   * @param blendshape - The name or index of a blend shape.
   * @returns The weight of the blend shape.
   * 
   * The initial weights are declared in the model file.
   * 
   * Weights can be any number, but usually they're kept between 0 and 1.
   * 
   * This function will throw an error if the blend shape name or index doesn't exist.
   */
  getBlendShapeWeight(blendshape: string | number): number

  /**
   * Returns the 6 values of the Model's axis-aligned bounding box.
   * 
   * `[minx, maxx, miny, maxy, minz, maxz] = Model.getBoundingBox()`
   * 
   * @returns 
   * minx - The minimum x coordinate of the vertices in the Model.
   * maxx - The maximum x coordinate of the vertices in the Model.
   * miny - The minimum y coordinate of the vertices in the Model.
   * maxy - The maximum y coordinate of the vertices in the Model.
   * minz - The minimum z coordinate of the vertices in the Model.
   * maxz - The maximum z coordinate of the vertices in the Model.
   */
  getBoundingBox(): LuaMultiReturn<[minx: number, maxx: number, miny: number, maxy: number, minz: number, maxz: number]>

  /**
   * Returns a sphere approximately enclosing the vertices in the Model.
   * 
   * `[x, y, z, radius] = Model.getBoundingSphere()`
   * 
   * @returns 
   * x - The x coordinate of the position of the sphere.
   * y - The y coordinate of the position of the sphere.
   * z - The z coordinate of the position of the sphere.
   * radius - The radius of the bounding sphere.
   */
  getBoundingSphere(): LuaMultiReturn<[x: number, y: number, z: number, radius: number]>

  /**
   * Returns the center of the Model's axis-aligned bounding box, relative to the Model's origin.
   * 
   * `[x, y, z] = Model.getCenter()`
   * 
   * @returns 
   * x - The x offset of the center of the bounding box.
   * y - The y offset of the center of the bounding box.
   * z - The z offset of the center of the bounding box.
   */
  getCenter(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the ModelData this Model was created from.
   * 
   * `data = Model.getData()`
   * 
   * @returns The ModelData.
   */
  getData(): ModelData

  /**
   * Returns the depth of the Model, computed from its axis-aligned bounding box.
   * 
   * `depth = Model.getDepth()`
   * 
   * @returns The depth of the Model.
   */
  getDepth(): number

  /**
   * Returns the width, height, and depth of the Model, computed from its axis-aligned bounding box.
   * 
   * `[width, height, depth] = Model.getDimensions()`
   * 
   * @returns 
   * width - The width of the Model.
   * height - The height of the Model.
   * depth - The depth of the Model.
   */
  getDimensions(): LuaMultiReturn<[width: number, height: number, depth: number]>

  /**
   * Returns the height of the Model, computed from its axis-aligned bounding box.
   * 
   * `height = Model.getHeight()`
   * 
   * @returns The height of the Model.
   */
  getHeight(): number

  /**
   * Returns the index buffer used by the Model.  The index buffer describes the order used to draw the vertices in each mesh.
   * 
   * `buffer = Model.getIndexBuffer()`
   * 
   * @returns The index buffer.
   */
  getIndexBuffer(): Buffer

  /**
   * Returns a `Material` loaded from the Model.
   * 
   * `material = Model.getMaterial(which)`
   * 
   * @param which - The name or index of the Material to return.
   * @returns The material.
   */
  getMaterial(which: string | number): Material

  /**
   * Returns the number of materials in the Model.
   * 
   * `count = Model.getMaterialCount()`
   * 
   * @returns The number of materials in the Model.
   */
  getMaterialCount(): number

  /**
   * Returns the name of a material in the Model.
   * 
   * `name = Model.getMaterialName(index)`
   * 
   * @param index - The index of a material.
   * @returns The name of the material.
   */
  getMaterialName(index: number): string

  /**
   * Returns a `Mesh` from the Model.
   * 
   * `mesh = Model.getMesh(index)`
   * 
   * @param index - The index of the Mesh to return.
   * @returns The mesh object.
   */
  getMesh(index: number): Mesh

  /**
   * Returns the number of meshes in the Model.
   * 
   * `count = Model.getMeshCount()`
   * 
   * @returns The number of meshes in the Model.
   */
  getMeshCount(): number

  /**
   * Returns extra information stored in the model file.  Currently this is only implemented for glTF models and returns the JSON string from the glTF or glb file.  The metadata can be used to get application-specific data or add support for glTF extensions not supported by LÖVR.
   * 
   * `metadata = Model.getMetadata()`
   * 
   * @returns The metadata from the model file.
   */
  getMetadata(): string

  /**
   * Given a parent node, this function returns a table with the indices of its children.
   * 
   * `children = Model.getNodeChildren(node)`
   * 
   * @param node - The name or index of the parent node.
   * @returns A table containing the node index of each child of the parent node.
   * 
   * If the node does not have any children, this function returns an empty table.
   */
  getNodeChildren(node: string | number): number[]

  /**
   * Returns the number of nodes in the model.
   * 
   * `count = Model.getNodeCount()`
   * 
   * @returns The number of nodes in the model.
   */
  getNodeCount(): number

  /**
   * Returns the name of a node.
   * 
   * `name = Model.getNodeName(index)`
   * 
   * @param index - The index of the node.
   * @returns The name of the node.
   */
  getNodeName(index: number): string

  /**
   * Returns the orientation of a node.
   * 
   * `[angle, ax, ay, az] = Model.getNodeOrientation(node, origin)`
   * 
   * @param node - The name or index of a node.
   * @param origin - Whether the orientation should be returned relative to the root node or the node's parent.
   * @returns 
   * angle - The number of radians the node is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getNodeOrientation(node: string | number, origin?: OriginType): LuaMultiReturn<[angle: number, ax: number, ay: number, az: number]>

  /**
   * Given a child node, this function returns the index of its parent.
   * 
   * `parent = Model.getNodeParent(node)`
   * 
   * @param node - The name or index of the child node.
   * @returns The index of the parent.
   */
  getNodeParent(node: number): number

  /**
   * Returns the pose (position and orientation) of a node.
   * 
   * `[x, y, z, angle, ax, ay, az] = Model.getNodePose(node, origin)`
   * 
   * @param node - The name or index of a node.
   * @param origin - Whether the pose should be returned relative to the root node or the node's parent.
   * @returns 
   * x - The x position of the node.
   * y - The y position of the node.
   * z - The z position of the node.
   * angle - The number of radians the node is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getNodePose(node: string | number, origin?: OriginType): LuaMultiReturn<[x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the position of a node.
   * 
   * `[x, y, z] = Model.getNodePosition(node, space)`
   * 
   * @param node - The index of the node.
   * @param space - Whether the position should be returned relative to the root node or the node's parent.
   * @returns 
   * x - The x coordinate.
   * y - The y coordinate.
   * z - The z coordinate.
   */
  getNodePosition(node: string | number, space?: OriginType): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the scale of a node.
   * 
   * `[x, y, z] = Model.getNodeScale(node, origin)`
   * 
   * @param node - The name or index of the node.
   * @param origin - Whether the scale should be returned relative to the root node or the node's parent.
   * @returns 
   * x - The x scale.
   * y - The y scale.
   * z - The z scale.
   */
  getNodeScale(node: string | number, origin?: OriginType): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the transform (position, scale, and rotation) of a node.
   * 
   * `[x, y, z, sx, sy, sz, angle, ax, ay, az] = Model.getNodeTransform(node, origin)`
   * 
   * @param node - The index of a node.
   * @param origin - Whether the transform should be returned relative to the root node or the node's parent.
   * @returns 
   * x - The x position of the node.
   * y - The y position of the node.
   * z - The z position of the node.
   * sx - The x scale of the node.
   * sy - The y scale of the node.
   * sz - The z scale of the node.
   * angle - The number of radians the node is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getNodeTransform(node: string | number, origin?: OriginType): LuaMultiReturn<[x: number, y: number, z: number, sx: number, sy: number, sz: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the index of the model's root node.
   * 
   * `root = Model.getRootNode()`
   * 
   * @returns The index of the root node.
   */
  getRootNode(): number

  /**
   * Returns one of the textures in the Model.
   * 
   * `texture = Model.getTexture(index)`
   * 
   * @param index - The index of the texture to get.
   * @returns The texture.
   */
  getTexture(index: number): Texture

  /**
   * Returns the number of textures in the Model.
   * 
   * `count = Model.getTextureCount()`
   * 
   * @returns The number of textures in the Model.
   */
  getTextureCount(): number

  /**
   * Returns the total number of triangles in the Model.
   * 
   * `count = Model.getTriangleCount()`
   * 
   * @returns The total number of triangles in the Model.
   * 
   * This isn't always related to the length of the vertex buffer, since a mesh in the Model could be drawn by multiple nodes.
   */
  getTriangleCount(): number

  /**
   * Returns 2 tables containing mesh data for the Model.
   * 
   * The first table is a list of vertex positions and contains 3 numbers for the x, y, and z coordinate of each vertex.  The second table is a list of triangles and contains 1-based indices into the first table representing the first, second, and third vertices that make up each triangle.
   * 
   * The vertex positions will be affected by node transforms.
   * 
   * `[vertices, indices] = Model.getTriangles()`
   * 
   * @returns 
   * vertices - The triangle vertex positions, returned as a flat (non-nested) table of numbers.  The position of each vertex is given as an x, y, and z coordinate.
   * indices - A list of numbers representing how to connect the vertices into triangles.  Each number is a 1-based index into the `vertices` table, and every 3 indices form a triangle.
   * 
   * After this function is called on a Model once, the result is cached (in its ModelData).
   */
  getTriangles(): LuaMultiReturn<[vertices: number[], indices: number[]]>

  /**
   * Returns a `Buffer` that holds the vertices of all of the meshes in the Model.
   * 
   * `buffer = Model.getVertexBuffer()`
   * 
   * @returns The vertex buffer.
   */
  getVertexBuffer(): Buffer

  /**
   * Returns the total vertex count of the Model.
   * 
   * `count = Model.getVertexCount()`
   * 
   * @returns The total number of vertices.
   * 
   * This isn't always the same as the length of the vertex buffer, since a mesh in the Model could be drawn by multiple nodes.
   */
  getVertexCount(): number

  /**
   * Returns the width of the Model, computed from its axis-aligned bounding box.
   * 
   * `width = Model.getWidth()`
   * 
   * @returns The width of the Model.
   */
  getWidth(): number

  /**
   * Returns whether the Model has any skeletal animations.
   * 
   * `jointed = Model.hasJoints()`
   * 
   * @returns Whether the animation uses joint nodes for skeletal animation.
   * 
   * This will return when there's at least one skin in the model, as returned by `ModelData:getSkinCount`.
   * 
   * Even if this function returns true, the model could still have non-skeletal animations.
   * 
   * Right now a model can only be drawn with one skeletal pose per frame.
   */
  hasJoints(): boolean

  /**
   * Resets blend shape weights to the original ones defined in the model file.
   * 
   * `Model.resetBlendShapes()`
   */
  resetBlendShapes(): void

  /**
   * Resets node transforms to the original ones defined in the model file.
   * 
   * `Model.resetNodeTransforms()`
   */
  resetNodeTransforms(): void

  /**
   * Sets the weight of a blend shape.  A blend shape contains offset values for the vertices of one of the meshes in a Model.  Whenever the Model is drawn, the offsets are multiplied by the weight of the blend shape, allowing for smooth blending between different meshes.  A weight of zero won't apply any displacement and will skip processing of the blend shape.
   * 
   * `Model.setBlendShapeWeight(blendshape, weight)`
   * 
   * @param blendshape - The name or index of a blend shape.
   * @param weight - The new weight for the blend shape.
   * 
   * The initial weights are declared in the model file.
   * 
   * Weights can be any number, but usually they're kept between 0 and 1.
   * 
   * This function will throw an error if the blend shape name or index doesn't exist.
   */
  setBlendShapeWeight(blendshape: string | number, weight: number): void

  /**
   * Sets or blends the orientation of a node to a new orientation.  This sets the local orientation of the node, relative to its parent.
   * 
   * `Model.setNodeOrientation(node, angle, ax, ay, az, blend)`
   * 
   * @param node - The name or index of a node.
   * @param angle - The number of radians the node should be rotated around its rotation axis.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param blend - A number from 0 to 1 indicating how much of the target orientation to blend in.  A value of 0 will not change the node's orientation at all, whereas 1 will fully blend to the target orientation.
   */
  setNodeOrientation(node: string | number, angle: number, ax: number, ay: number, az: number, blend?: number): void

  /**
   * Sets or blends the orientation of a node to a new orientation.  This sets the local orientation of the node, relative to its parent.
   * 
   * `Model.setNodeOrientation(node, orientation, blend)`
   * 
   * @param node - The name or index of a node.
   * @param orientation - The orientation.
   * @param blend - A number from 0 to 1 indicating how much of the target orientation to blend in.  A value of 0 will not change the node's orientation at all, whereas 1 will fully blend to the target orientation.
   */
  setNodeOrientation(node: string | number, orientation: quaternion, blend?: number): void

  /**
   * Sets or blends the pose (position and orientation) of a node to a new pose.  This sets the local pose of the node, relative to its parent.  The scale will remain unchanged.
   * 
   * `Model.setNodePose(node, x, y, z, angle, ax, ay, az, blend)`
   * 
   * @param node - The name or index of a node.
   * @param x - The x component of the position.
   * @param y - The y component of the position.
   * @param z - The z component of the position.
   * @param angle - The number of radians the node should be rotated around its rotation axis.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param blend - A number from 0 to 1 indicating how much of the target pose to blend in.  A value of 0 will not change the node's pose at all, whereas 1 will fully blend to the target pose.
   */
  setNodePose(node: string | number, x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number, blend?: number): void

  /**
   * Sets or blends the pose (position and orientation) of a node to a new pose.  This sets the local pose of the node, relative to its parent.  The scale will remain unchanged.
   * 
   * `Model.setNodePose(node, position, orientation, blend)`
   * 
   * @param node - The name or index of a node.
   * @param position - The target position.  Can also be provided as 3 numbers.
   * @param orientation - The target orientation.  Can also be provided as 4 numbers in angle-axis form.
   * @param blend - A number from 0 to 1 indicating how much of the target pose to blend in.  A value of 0 will not change the node's pose at all, whereas 1 will fully blend to the target pose.
   */
  setNodePose(node: string | number, position: vector, orientation: quaternion, blend?: number): void

  /**
   * Sets or blends the position of a node.  This sets the local position of the node, relative to its parent.
   * 
   * `Model.setNodePosition(node, x, y, z, blend)`
   * 
   * @param node - The name or index of a node.
   * @param x - The x coordinate of the new position.
   * @param y - The y coordinate of the new position.
   * @param z - The z coordinate of the new position.
   * @param blend - A number from 0 to 1 indicating how much of the new position to blend in.  A value of 0 will not change the node's position at all, whereas 1 will fully blend to the target position.
   */
  setNodePosition(node: string | number, x: number, y: number, z: number, blend?: number): void

  /**
   * Sets or blends the position of a node.  This sets the local position of the node, relative to its parent.
   * 
   * `Model.setNodePosition(node, position, blend)`
   * 
   * @param node - The name or index of a node.
   * @param position - The new position.
   * @param blend - A number from 0 to 1 indicating how much of the new position to blend in.  A value of 0 will not change the node's position at all, whereas 1 will fully blend to the target position.
   */
  setNodePosition(node: string | number, position: vector, blend?: number): void

  /**
   * Sets or blends the scale of a node to a new scale.  This sets the local scale of the node, relative to its parent.
   * 
   * `Model.setNodeScale(node, sx, sy, sz, blend)`
   * 
   * @param node - The name or index of a node.
   * @param sx - The x scale.
   * @param sy - The y scale.
   * @param sz - The z scale.
   * @param blend - A number from 0 to 1 indicating how much of the new scale to blend in.  A value of 0 will not change the node's scale at all, whereas 1 will fully blend to the target scale.
   * 
   * For best results when animating, it's recommended to keep the 3 scale components the same.
   */
  setNodeScale(node: string | number, sx: number, sy: number, sz: number, blend?: number): void

  /**
   * Sets or blends the scale of a node to a new scale.  This sets the local scale of the node, relative to its parent.
   * 
   * `Model.setNodeScale(node, scale, blend)`
   * 
   * @param node - The name or index of a node.
   * @param scale - The new scale.
   * @param blend - A number from 0 to 1 indicating how much of the new scale to blend in.  A value of 0 will not change the node's scale at all, whereas 1 will fully blend to the target scale.
   * 
   * For best results when animating, it's recommended to keep the 3 scale components the same.
   */
  setNodeScale(node: string | number, scale: vector, blend?: number): void

  /**
   * Sets or blends the transform of a node to a new transform.  This sets the local transform of the node, relative to its parent.
   * 
   * `Model.setNodeTransform(node, x, y, z, sx, sy, sz, angle, ax, ay, az, blend)`
   * 
   * @param node - The name or index of a node.
   * @param x - The x component of the position.
   * @param y - The y component of the position.
   * @param z - The z component of the position.
   * @param sx - The x component of the scale.
   * @param sy - The y component of the scale.
   * @param sz - The z component of the scale.
   * @param angle - The number of radians the node should be rotated around its rotation axis.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param blend - A number from 0 to 1 indicating how much of the target transform to blend in.  A value of 0 will not change the node's transform at all, whereas 1 will fully blend to the target transform.
   * 
   * For best results when animating, it's recommended to keep the 3 components of the scale the same.
   * 
   * Even though the translation, scale, and rotation parameters are given in TSR order, they are applied in the normal TRS order.
   */
  setNodeTransform(node: string | number, x: number, y: number, z: number, sx: number, sy: number, sz: number, angle: number, ax: number, ay: number, az: number, blend?: number): void

  /**
   * Sets or blends the transform of a node to a new transform.  This sets the local transform of the node, relative to its parent.
   * 
   * `Model.setNodeTransform(node, position, scale, orientation, blend)`
   * 
   * @param node - The name or index of a node.
   * @param position - The position.
   * @param scale - The scale.
   * @param orientation - The orientation.
   * @param blend - A number from 0 to 1 indicating how much of the target transform to blend in.  A value of 0 will not change the node's transform at all, whereas 1 will fully blend to the target transform.
   * 
   * For best results when animating, it's recommended to keep the 3 components of the scale the same.
   * 
   * Even though the translation, scale, and rotation parameters are given in TSR order, they are applied in the normal TRS order.
   */
  setNodeTransform(node: string | number, position: vector, scale: vector, orientation: quaternion, blend?: number): void

  /**
   * Sets or blends the transform of a node to a new transform.  This sets the local transform of the node, relative to its parent.
   * 
   * `Model.setNodeTransform(node, transform, blend)`
   * 
   * @param node - The name or index of a node.
   * @param transform - The transform.
   * @param blend - A number from 0 to 1 indicating how much of the target transform to blend in.  A value of 0 will not change the node's transform at all, whereas 1 will fully blend to the target transform.
   * 
   * For best results when animating, it's recommended to keep the 3 components of the scale the same.
   * 
   * Even though the translation, scale, and rotation parameters are given in TSR order, they are applied in the normal TRS order.
   */
  setNodeTransform(node: string | number, transform: Mat4, blend?: number): void

}

/**
 * Pass objects record work for the GPU.  They contain a list of things to draw and a list of compute shaders to run.
 * 
 * Methods like `Pass:sphere` will "record" a draw on the Pass, which adds it to the list.  Other methods like `Pass:setBlendMode` or `Pass:setShader` will change the way the next draws are processed.
 * 
 * Once all of the work has been recorded to a Pass, it can be sent to the GPU using `lovr.graphics.submit`, which will start processing all of the compute work and draws (in that order).
 * 
 * A Pass can have a canvas, which is a set of textures that the draws will render to.
 * 
 * `Pass:reset` is used to clear all of the computes and draws, putting the Pass in a fresh state.
 * 
 * `lovr.draw` is called every frame with a `Pass` that is configured to render to either the headset or the window.  The Pass will automatically get submitted afterwards.
 */
declare interface Pass extends LovrObject {
  /**
   * Synchronizes compute work.
   * 
   * By default, within a single Pass, multiple calls to `Pass:compute` can run on the GPU in any order, or all at the same time.  This is great because it lets the GPU process the work as efficiently as possible, but sometimes multiple compute dispatches need to be sequenced.
   * 
   * Calling this function will insert a barrier.  All compute operations on the Pass after the barrier will only start once all of the previous compute operations on the Pass are finished.
   * 
   * `Pass.barrier()`
   * 
   * It's only necessary to use a barrier if a compute shader is reading/writing the same bytes of memory that a previous compute operation in the same Pass read/wrote.
   * 
   * Barriers will slow things down because they reduce parallelism by causing the GPU to wait. Strategic reordering of non-dependent :compute calls around the barrier can help.
   * 
   * Calling this function before recording any :computes will do nothing, and calling it after the last :compute will do nothing.
   */
  barrier(): void

  /**
   * Begins a new tally.  The tally will count the number of pixels touched by any draws that occur while the tally is active.  If a pixel fails the depth test or stencil test then it won't be counted, so the tally is a way to detect if objects are visible.
   * 
   * The results for all the tallies in the pass can be copied to a `Buffer` when the Pass finishes by setting a buffer with `Pass:setTallyBuffer`.
   * 
   * `index = Pass.beginTally()`
   * 
   * @returns The index of the tally that was started.
   * 
   * There is currently a maximum of 256 tallies per pass.
   * 
   * If a tally is already active, this function will error.
   */
  beginTally(): number

  /**
   * Draw a box.  This is like `Pass:cube`, except it takes 3 separate values for the scale.
   * 
   * `Pass.box(x, y, z, width, height, depth, angle, ax, ay, az, style)`
   * 
   * @param x - The x coordinate of the center of the box.
   * @param y - The y coordinate of the center of the box.
   * @param z - The z coordinate of the center of the box.
   * @param width - The width of the box.
   * @param height - The height of the box.
   * @param depth - The depth of the box.
   * @param angle - The rotation of the box around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param style - Whether the box should be drawn filled or outlined.
   */
  box(x?: number, y?: number, z?: number, width?: number, height?: number, depth?: number, angle?: number, ax?: number, ay?: number, az?: number, style?: DrawStyle): void

  /**
   * Draw a box.  This is like `Pass:cube`, except it takes 3 separate values for the scale.
   * 
   * `Pass.box(position, size, orientation, style)`
   * 
   * @param position - The position of the box.
   * @param size - The size of the box.
   * @param orientation - The orientation of the box.
   * @param style - Whether the box should be drawn filled or outlined.
   */
  box(position: vector, size: vector, orientation: quaternion, style?: DrawStyle): void

  /**
   * Draw a box.  This is like `Pass:cube`, except it takes 3 separate values for the scale.
   * 
   * `Pass.box(transform, style)`
   * 
   * @param transform - The transform of the box.
   * @param style - Whether the box should be drawn filled or outlined.
   */
  box(transform: Mat4, style?: DrawStyle): void

  /**
   * Draws a capsule.  A capsule is shaped like a cylinder with a hemisphere on each end.
   * 
   * `Pass.capsule(x, y, z, radius, length, angle, ax, ay, az, segments)`
   * 
   * @param x - The x coordinate of the center of the capsule.
   * @param y - The y coordinate of the center of the capsule.
   * @param z - The z coordinate of the center of the capsule.
   * @param radius - The radius of the capsule.
   * @param length - The length of the capsule.
   * @param angle - The rotation of the capsule around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param segments - The number of circular segments to render.
   * 
   * The length of the capsule does not include the end caps.  The local origin of the capsule is in the center, and the local z axis points towards the end caps.
   */
  capsule(x?: number, y?: number, z?: number, radius?: number, length?: number, angle?: number, ax?: number, ay?: number, az?: number, segments?: number): void

  /**
   * Draws a capsule.  A capsule is shaped like a cylinder with a hemisphere on each end.
   * 
   * `Pass.capsule(position, radius, length, orientation, segments)`
   * 
   * @param position - The position of the center of the capsule.
   * @param radius - The radius of the capsule.
   * @param length - The length of the capsule.
   * @param orientation - The orientation of the capsule.
   * @param segments - The number of circular segments to render.
   * 
   * The length of the capsule does not include the end caps.  The local origin of the capsule is in the center, and the local z axis points towards the end caps.
   */
  capsule(position: vector, radius: number, length: number, orientation: quaternion, segments?: number): void

  /**
   * Draws a capsule.  A capsule is shaped like a cylinder with a hemisphere on each end.
   * 
   * `Pass.capsule(transform, segments)`
   * 
   * @param transform - The transform of the capsule.
   * @param segments - The number of circular segments to render.
   * 
   * The length of the capsule does not include the end caps.  The local origin of the capsule is in the center, and the local z axis points towards the end caps.
   */
  capsule(transform: Mat4, segments?: number): void

  /**
   * Draws a capsule.  A capsule is shaped like a cylinder with a hemisphere on each end.
   * 
   * `Pass.capsule(p1, p2, radius, segments)`
   * 
   * Draws a capsule between two points.
   * 
   * @param p1 - The starting point of the capsule.
   * @param p2 - The ending point of the capsule.
   * @param radius - The radius of the capsule.
   * @param segments - The number of circular segments to render.
   * 
   * The length of the capsule does not include the end caps.  The local origin of the capsule is in the center, and the local z axis points towards the end caps.
   */
  capsule(p1: vector, p2: vector, radius?: number, segments?: number): void

  /**
   * Draws a circle.
   * 
   * `Pass.circle(x, y, z, radius, angle, ax, ay, az, style, angle1, angle2, segments)`
   * 
   * @param x - The x coordinate of the center of the circle.
   * @param y - The y coordinate of the center of the circle.
   * @param z - The z coordinate of the center of the circle.
   * @param radius - The radius of the circle.
   * @param angle - The rotation of the circle around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param style - Whether the circle should be filled or outlined.
   * @param angle1 - The angle of the beginning of the arc.
   * @param angle2 - angle of the end of the arc.
   * @param segments - The number of segments to render.
   * 
   * The local origin of the circle is in its center.  The local z axis is perpendicular to the circle.
   */
  circle(x?: number, y?: number, z?: number, radius?: number, angle?: number, ax?: number, ay?: number, az?: number, style?: DrawStyle, angle1?: number, angle2?: number, segments?: number): void

  /**
   * Draws a circle.
   * 
   * `Pass.circle(position, radius, orientation, style, angle1, angle2, segments)`
   * 
   * @param position - The position of the circle.
   * @param radius - The radius of the circle.
   * @param orientation - The orientation of the circle.
   * @param style - Whether the circle should be filled or outlined.
   * @param angle1 - The angle of the beginning of the arc.
   * @param angle2 - angle of the end of the arc.
   * @param segments - The number of segments to render.
   * 
   * The local origin of the circle is in its center.  The local z axis is perpendicular to the circle.
   */
  circle(position: vector, radius: number, orientation: quaternion, style?: DrawStyle, angle1?: number, angle2?: number, segments?: number): void

  /**
   * Draws a circle.
   * 
   * `Pass.circle(transform, style, angle1, angle2, segments)`
   * 
   * @param transform - The transform of the circle.
   * @param style - Whether the circle should be filled or outlined.
   * @param angle1 - The angle of the beginning of the arc.
   * @param angle2 - angle of the end of the arc.
   * @param segments - The number of segments to render.
   * 
   * The local origin of the circle is in its center.  The local z axis is perpendicular to the circle.
   */
  circle(transform: Mat4, style?: DrawStyle, angle1?: number, angle2?: number, segments?: number): void

  /**
   * Runs a compute shader.  There must be an active compute shader set using `Pass:setShader`.
   * 
   * All of the compute shader dispatches in a Pass will run **before** all of the draws in the Pass (if any).  They will also run at the same time in parallel, unless `Pass:barrier` is used to control the order.
   * 
   * `Pass.compute(x, y, z)`
   * 
   * @param x - The number of workgroups to dispatch in the x dimension.
   * @param y - The number of workgroups to dispatch in the y dimension.
   * @param z - The number of workgroups to dispatch in the z dimension.
   * 
   * Compute shaders are usually run once for each pixel in an image, once per particle, once per object, etc.  The 3 arguments represent how many times to run, or "dispatch", the compute shader, in up to 3 dimensions.  Each element of this grid is called a **workgroup**.
   * 
   * To make things even more complicated, each workgroup itself is made up of a set of "mini GPU threads", which are called **local workgroups**.  Like workgroups, the local workgroup size can also be 3D.  It's declared in the shader code, like this:
   * 
   *     layout(local_size_x = w, local_size_y = h, local_size_z = d) in;
   * 
   * All these 3D grids can get confusing, but the basic idea is to make the local workgroup size a small block of e.g. 32 particles or 8x8 pixels or 4x4x4 voxels, and then dispatch however many workgroups are needed to cover a list of particles, image, voxel field, etc.
   * 
   * The reason to do it this way is that the GPU runs its threads in little fixed-size bundles called subgroups.  Subgroups are usually 32 or 64 threads (the exact size is given by the `subgroupSize` property of `lovr.graphics.getDevice`) and all run together.  If the local workgroup size was `1x1x1`, then the GPU would only run 1 thread per subgroup and waste the other 31 or 63.  So for the best performance, be sure to set a local workgroup size bigger than 1!
   * 
   * Inside the compute shader, a few builtin variables can be used to figure out which workgroup is running:
   * 
   * - `uvec3 WorkgroupCount` is the workgroup count per axis (the `Pass:compute` arguments).
   * - `uvec3 WorkgroupSize` is the local workgroup size (declared in the shader).
   * - `uvec3 WorkgroupID` is the index of the current (global) workgroup.
   * - `uvec3 LocalThreadID` is the index of the local workgroup inside its workgroup.
   * - `uint LocalThreadIndex` is a 1D version of `LocalThreadID`.
   * - `uvec3 GlobalThreadID` is the unique identifier for a thread within all workgroups in a
   *   dispatch. It's equivalent to `WorkgroupID * WorkgroupSize + LocalThreadID` (usually what you
   *   want!)
   * 
   * There are limits to the number of workgroups that can be dispatched, see the `workgroupCount` limit in `lovr.graphics.getLimits`.  The local workgroup size is also limited by the `workgroupSize` and `totalWorkgroupSize` limits.
   * 
   * Indirect compute dispatches are useful to "chain" compute shaders together, while keeping all of the data on the GPU.  The first dispatch can do some computation and write some results to buffers, then the second indirect dispatch can use the data in those buffers to know how many times it should run.  An example would be a compute shader that does some sort of object culling, writing the number of visible objects to a buffer along with the IDs of each one. Subsequent compute shaders can be indirectly dispatched to perform extra processing on the visible objects.  Finally, an indirect draw can be used to render them.
   */
  compute(x?: number, y?: number, z?: number): void

  /**
   * Runs a compute shader.  There must be an active compute shader set using `Pass:setShader`.
   * 
   * All of the compute shader dispatches in a Pass will run **before** all of the draws in the Pass (if any).  They will also run at the same time in parallel, unless `Pass:barrier` is used to control the order.
   * 
   * `Pass.compute(buffer, offset)`
   * 
   * Perform an "indirect" dispatch.  Instead of passing in the workgroup counts directly from Lua, the workgroup counts are read from a `Buffer` object at a particular byte offset. Each count should be a 4-byte integer, so in total 12 bytes will be read from the buffer.
   * 
   * @param buffer - A Buffer object containing the x, y, and z workgroup counts, stored as 4 byte unsigned integers.
   * @param offset - The byte offset to read the workgroup counts from in the Buffer.
   * 
   * Compute shaders are usually run once for each pixel in an image, once per particle, once per object, etc.  The 3 arguments represent how many times to run, or "dispatch", the compute shader, in up to 3 dimensions.  Each element of this grid is called a **workgroup**.
   * 
   * To make things even more complicated, each workgroup itself is made up of a set of "mini GPU threads", which are called **local workgroups**.  Like workgroups, the local workgroup size can also be 3D.  It's declared in the shader code, like this:
   * 
   *     layout(local_size_x = w, local_size_y = h, local_size_z = d) in;
   * 
   * All these 3D grids can get confusing, but the basic idea is to make the local workgroup size a small block of e.g. 32 particles or 8x8 pixels or 4x4x4 voxels, and then dispatch however many workgroups are needed to cover a list of particles, image, voxel field, etc.
   * 
   * The reason to do it this way is that the GPU runs its threads in little fixed-size bundles called subgroups.  Subgroups are usually 32 or 64 threads (the exact size is given by the `subgroupSize` property of `lovr.graphics.getDevice`) and all run together.  If the local workgroup size was `1x1x1`, then the GPU would only run 1 thread per subgroup and waste the other 31 or 63.  So for the best performance, be sure to set a local workgroup size bigger than 1!
   * 
   * Inside the compute shader, a few builtin variables can be used to figure out which workgroup is running:
   * 
   * - `uvec3 WorkgroupCount` is the workgroup count per axis (the `Pass:compute` arguments).
   * - `uvec3 WorkgroupSize` is the local workgroup size (declared in the shader).
   * - `uvec3 WorkgroupID` is the index of the current (global) workgroup.
   * - `uvec3 LocalThreadID` is the index of the local workgroup inside its workgroup.
   * - `uint LocalThreadIndex` is a 1D version of `LocalThreadID`.
   * - `uvec3 GlobalThreadID` is the unique identifier for a thread within all workgroups in a
   *   dispatch. It's equivalent to `WorkgroupID * WorkgroupSize + LocalThreadID` (usually what you
   *   want!)
   * 
   * There are limits to the number of workgroups that can be dispatched, see the `workgroupCount` limit in `lovr.graphics.getLimits`.  The local workgroup size is also limited by the `workgroupSize` and `totalWorkgroupSize` limits.
   * 
   * Indirect compute dispatches are useful to "chain" compute shaders together, while keeping all of the data on the GPU.  The first dispatch can do some computation and write some results to buffers, then the second indirect dispatch can use the data in those buffers to know how many times it should run.  An example would be a compute shader that does some sort of object culling, writing the number of visible objects to a buffer along with the IDs of each one. Subsequent compute shaders can be indirectly dispatched to perform extra processing on the visible objects.  Finally, an indirect draw can be used to render them.
   */
  compute(buffer: Buffer, offset?: number): void

  /**
   * Draws a cone.
   * 
   * `Pass.cone(x, y, z, radius, length, angle, ax, ay, az, segments)`
   * 
   * @param x - The x coordinate of the center of the base of the cone.
   * @param y - The y coordinate of the center of the base of the cone.
   * @param z - The z coordinate of the center of the base of the cone.
   * @param radius - The radius of the cone.
   * @param length - The length of the cone.
   * @param angle - The rotation of the cone around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param segments - The number of segments in the cone.
   * 
   * The local origin is at the center of the base of the cone, and the negative z axis points towards the tip.
   */
  cone(x?: number, y?: number, z?: number, radius?: number, length?: number, angle?: number, ax?: number, ay?: number, az?: number, segments?: number): void

  /**
   * Draws a cone.
   * 
   * `Pass.cone(position, radius, length, orientation, segments)`
   * 
   * @param position - The position of the center of the base of the cone.
   * @param radius - The radius of the cone.
   * @param length - The length of the cone.
   * @param orientation - The orientation of the cone.
   * @param segments - The number of segments in the cone.
   * 
   * The local origin is at the center of the base of the cone, and the negative z axis points towards the tip.
   */
  cone(position: vector, radius: number, length: number, orientation: quaternion, segments?: number): void

  /**
   * Draws a cone.
   * 
   * `Pass.cone(transform, segments)`
   * 
   * @param transform - The transform of the cone.
   * @param segments - The number of segments in the cone.
   * 
   * The local origin is at the center of the base of the cone, and the negative z axis points towards the tip.
   */
  cone(transform: Mat4, segments?: number): void

  /**
   * Draws a cone.
   * 
   * `Pass.cone(p1, p2, radius, segments)`
   * 
   * @param p1 - The position of the base of the cone.
   * @param p2 - The position of the tip of the cone.
   * @param radius - The radius of the cone.
   * @param segments - The number of segments in the cone.
   * 
   * The local origin is at the center of the base of the cone, and the negative z axis points towards the tip.
   */
  cone(p1: vector, p2: vector, radius?: number, segments?: number): void

  /**
   * Draws a cube.
   * 
   * `Pass.cube(x, y, z, size, angle, ax, ay, az, style)`
   * 
   * @param x - The x coordinate of the center of the cube.
   * @param y - The y coordinate of the center of the cube.
   * @param z - The z coordinate of the center of the cube.
   * @param size - The size of the cube.
   * @param angle - The rotation of the cube around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param style - Whether the cube should be drawn filled or outlined.
   * 
   * The local origin is in the center of the cube.
   */
  cube(x?: number, y?: number, z?: number, size?: number, angle?: number, ax?: number, ay?: number, az?: number, style?: DrawStyle): void

  /**
   * Draws a cube.
   * 
   * `Pass.cube(position, size, orientation, style)`
   * 
   * @param position - The position of the cube.
   * @param size - The size of the cube.
   * @param orientation - The orientation of the cube.
   * @param style - Whether the cube should be drawn filled or outlined.
   * 
   * The local origin is in the center of the cube.
   */
  cube(position: vector, size: number, orientation: quaternion, style?: DrawStyle): void

  /**
   * Draws a cube.
   * 
   * `Pass.cube(transform, style)`
   * 
   * @param transform - The transform of the cube.
   * @param style - Whether the cube should be drawn filled or outlined.
   * 
   * The local origin is in the center of the cube.
   */
  cube(transform: Mat4, style?: DrawStyle): void

  /**
   * Draws a cylinder.
   * 
   * `Pass.cylinder(x, y, z, radius, length, angle, ax, ay, az, capped, angle1, angle2, segments)`
   * 
   * @param x - The x coordinate of the center of the cylinder.
   * @param y - The y coordinate of the center of the cylinder.
   * @param z - The z coordinate of the center of the cylinder.
   * @param radius - The radius of the cylinder.
   * @param length - The length of the cylinder.
   * @param angle - The rotation of the cylinder around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param capped - Whether the tops and bottoms of the cylinder should be rendered.
   * @param angle1 - The angle of the beginning of the arc.
   * @param angle2 - angle of the end of the arc.
   * @param segments - The number of circular segments to render.
   * 
   * The local origin is in the center of the cylinder, and the length of the cylinder is along the z axis.
   */
  cylinder(x?: number, y?: number, z?: number, radius?: number, length?: number, angle?: number, ax?: number, ay?: number, az?: number, capped?: boolean, angle1?: number, angle2?: number, segments?: number): void

  /**
   * Draws a cylinder.
   * 
   * `Pass.cylinder(position, radius, length, orientation, capped, angle1, angle2, segments)`
   * 
   * @param position - The position of the center of the cylinder.
   * @param radius - The radius of the cylinder.
   * @param length - The length of the cylinder.
   * @param orientation - The orientation of the cylinder.
   * @param capped - Whether the tops and bottoms of the cylinder should be rendered.
   * @param angle1 - The angle of the beginning of the arc.
   * @param angle2 - angle of the end of the arc.
   * @param segments - The number of circular segments to render.
   * 
   * The local origin is in the center of the cylinder, and the length of the cylinder is along the z axis.
   */
  cylinder(position: vector, radius: number, length: number, orientation: quaternion, capped?: boolean, angle1?: number, angle2?: number, segments?: number): void

  /**
   * Draws a cylinder.
   * 
   * `Pass.cylinder(transform, capped, angle1, angle2, segments)`
   * 
   * @param transform - The transform of the cylinder.
   * @param capped - Whether the tops and bottoms of the cylinder should be rendered.
   * @param angle1 - The angle of the beginning of the arc.
   * @param angle2 - angle of the end of the arc.
   * @param segments - The number of circular segments to render.
   * 
   * The local origin is in the center of the cylinder, and the length of the cylinder is along the z axis.
   */
  cylinder(transform: Mat4, capped?: boolean, angle1?: number, angle2?: number, segments?: number): void

  /**
   * Draws a cylinder.
   * 
   * `Pass.cylinder(p1, p2, radius, capped, angle1, angle2, segments)`
   * 
   * @param p1 - The starting point of the cylinder.
   * @param p2 - The ending point of the cylinder.
   * @param radius - The radius of the cylinder.
   * @param capped - Whether the tops and bottoms of the cylinder should be rendered.
   * @param angle1 - The angle of the beginning of the arc.
   * @param angle2 - angle of the end of the arc.
   * @param segments - The number of circular segments to render.
   * 
   * The local origin is in the center of the cylinder, and the length of the cylinder is along the z axis.
   */
  cylinder(p1: vector, p2: vector, radius?: number, capped?: boolean, angle1?: number, angle2?: number, segments?: number): void

  /**
   * Draws a `Model`, `Mesh`, or `Texture`.
   * 
   * `Pass.draw(object, x, y, z, scale, angle, ax, ay, az, instances)`
   * 
   * @param object - The object to draw.
   * @param x - The x coordinate to draw the object at.
   * @param y - The y coordinate to draw the object at.
   * @param z - The z coordinate to draw the object at.
   * @param scale - The scale of the object.
   * @param angle - The rotation of the object around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param instances - The number of instances to draw.
   * 
   * `Model:getMesh` can be used to draw individual meshes of a model.
   * 
   * Textures ignore the `instances` parameter.
   * 
   * When drawing a Texture, the plane will be 1 meter wide at 1.0 scale and the height will be adjusted based on the Texture's aspect ratio.
   */
  draw(object: Model | Mesh | Texture, x?: number, y?: number, z?: number, scale?: number, angle?: number, ax?: number, ay?: number, az?: number, instances?: number): void

  /**
   * Draws a `Model`, `Mesh`, or `Texture`.
   * 
   * `Pass.draw(object, position, scale3, orientation, instances)`
   * 
   * @param object - The object to draw.
   * @param position - The position to draw the object at.
   * @param scale3 - The scale of the object, as a vector.
   * @param orientation - The orientation of the object.
   * @param instances - The number of instances to draw.
   * 
   * `Model:getMesh` can be used to draw individual meshes of a model.
   * 
   * Textures ignore the `instances` parameter.
   * 
   * When drawing a Texture, the plane will be 1 meter wide at 1.0 scale and the height will be adjusted based on the Texture's aspect ratio.
   */
  draw(object: Model | Mesh | Texture, position: vector, scale3: vector, orientation: quaternion, instances?: number): void

  /**
   * Draws a `Model`, `Mesh`, or `Texture`.
   * 
   * `Pass.draw(object, transform, instances)`
   * 
   * @param object - The object to draw.
   * @param transform - The transform of the object.
   * @param instances - The number of instances to draw.
   * 
   * `Model:getMesh` can be used to draw individual meshes of a model.
   * 
   * Textures ignore the `instances` parameter.
   * 
   * When drawing a Texture, the plane will be 1 meter wide at 1.0 scale and the height will be adjusted based on the Texture's aspect ratio.
   */
  draw(object: Model | Mesh | Texture, transform: Mat4, instances?: number): void

  /**
   * Draws a fullscreen triangle.  The `fill` shader is used, which stretches the triangle across the screen.
   * 
   * `Pass.fill(texture)`
   * 
   * @param texture - The texture to fill.  If nil, the texture from the active material is used.
   * 
   * This function has some special behavior for array textures:
   * 
   * - Filling a single-layer texture to a multi-layer canvas will mirror the texture to all layers,
   *   just like regular drawing.
   * - Filling a 2-layer texture to a mono canvas will render the 2 layers side-by-side.
   * - Filling a multi-layer texture to a multi-layer canvas will do a layer-by-layer fill (the layer
   *   counts must match).
   */
  fill(texture: Texture): void

  /**
   * Draws a fullscreen triangle.  The `fill` shader is used, which stretches the triangle across the screen.
   * 
   * `Pass.fill()`
   * 
   * This function has some special behavior for array textures:
   * 
   * - Filling a single-layer texture to a multi-layer canvas will mirror the texture to all layers,
   *   just like regular drawing.
   * - Filling a 2-layer texture to a mono canvas will render the 2 layers side-by-side.
   * - Filling a multi-layer texture to a multi-layer canvas will do a layer-by-layer fill (the layer
   *   counts must match).
   */
  fill(): void

  /**
   * Finishes a tally that was previously started with `Pass:beginTally`.  This will stop counting the number of pixels affected by draws.
   * 
   * The results for all the tallies in the pass can be copied to a `Buffer` when the Pass finishes by setting a buffer with `Pass:setTallyBuffer`.
   * 
   * `index = Pass.finishTally()`
   * 
   * @returns The index of the tally that was finished.
   * 
   * There is currently a maximum of 256 tallies per pass.
   * 
   * If no tally is active, this function will error.
   */
  finishTally(): number

  /**
   * Returns the Pass's canvas, or `nil` if the Pass doesn't have a canvas.  The canvas is a set of textures that the Pass will draw to when it's submitted.
   * 
   * `canvas = Pass.getCanvas()`
   * 
   * @returns The canvas.  Numeric keys will contain the color Textures, along with the following keys:
   * 
   * If the Pass has multiple color textures, a fragment shader should be used to write a different color to each texture.  Here's an example that writes red to the first texture and blue to the second texture:
   * 
   *     // Declare an output variable for the second texture
   *     layout(location = 1) out vec4 secondColor;
   * 
   *     vec4 lovrmain() {
   *       secondColor = vec4(0, 0, 1, 1);
   *       return vec4(1, 0, 0, 1);
   *     }
   */
  getCanvas(): LuaTable

  /**
   * Returns the Pass's canvas, or `nil` if the Pass doesn't have a canvas.  The canvas is a set of textures that the Pass will draw to when it's submitted.
   * 
   * `Pass.getCanvas()`
   * 
   * This function returns nil when a canvas hasn't been set.
   * 
   * If the Pass has multiple color textures, a fragment shader should be used to write a different color to each texture.  Here's an example that writes red to the first texture and blue to the second texture:
   * 
   *     // Declare an output variable for the second texture
   *     layout(location = 1) out vec4 secondColor;
   * 
   *     vec4 lovrmain() {
   *       secondColor = vec4(0, 0, 1, 1);
   *       return vec4(1, 0, 0, 1);
   *     }
   */
  getCanvas(): void

  /**
   * Returns the clear values of the pass.
   * 
   * `clears = Pass.getClear()`
   * 
   * @returns The clear values for the pass.  Each color texture's clear value is stored at its index, as either a 4-number rgba table or a boolean.  If the pass has a depth texture, there will also be a `depth` key with its clear value as a number or boolean.
   * 
   * The default clear color is transparent black.
   */
  getClear(): LuaTable

  /**
   * Returns the dimensions of the textures of the Pass's canvas, in pixels.
   * 
   * `[width, height] = Pass.getDimensions()`
   * 
   * @returns 
   * width - The texture width.
   * height - The texture height.
   * 
   * If the pass doesn't have a canvas, this function returns zeros.
   */
  getDimensions(): LuaMultiReturn<[width: number, height: number]>

  /**
   * Returns the height of the textures of the Pass's canvas, in pixels.
   * 
   * `height = Pass.getHeight()`
   * 
   * @returns The texture height.
   * 
   * If the pass doesn't have a canvas, this function returns zero.
   */
  getHeight(): number

  /**
   * Returns the debug label of the Pass, which will show up when the Pass is printed and in some graphics debugging tools.  This is set when the Pass is created, and can't be changed afterwards.
   * 
   * `label = Pass.getLabel()`
   * 
   * @returns The label, or nil if none was set.
   */
  getLabel(): string

  /**
   * Returns the projection for a single view.
   * 
   * `[left, right, up, down] = Pass.getProjection(view)`
   * 
   * @param view - The view index.
   * @returns 
   * left - The left field of view angle, in radians.
   * right - The right field of view angle, in radians.
   * up - The top field of view angle, in radians.
   * down - The bottom field of view angle, in radians.
   */
  getProjection(view: number): LuaMultiReturn<[left: number, right: number, up: number, down: number]>

  /**
   * Returns the projection for a single view.
   * 
   * `matrix = Pass.getProjection(view, matrix)`
   * 
   * @param view - The view index.
   * @param matrix - The matrix to fill with the projection.
   * @returns The matrix containing the projection.
   */
  getProjection(view: number, matrix: Mat4): Mat4

  /**
   * Returns statistics for the Pass.
   * 
   * `stats = Pass.getStats()`
   * 
   * @returns A table with statistics.
   */
  getStats(): LuaTable

  /**
   * Returns the Buffer that tally results will be written to.  Each time the render pass finishes, the results of all the tallies will be copied to the Buffer at the specified offset.  The buffer can be used in a later pass in a compute shader, or the data in the buffer can be read back using e.g. `Buffer:newReadback`.
   * 
   * If no buffer has been set, this function will return `nil`.
   * 
   * `[buffer, offset] = Pass.getTallyBuffer()`
   * 
   * @returns 
   * buffer - The buffer.
   * offset - An offset in the buffer where results will be written.
   */
  getTallyBuffer(): LuaMultiReturn<[buffer: Buffer, offset: number]>

  /**
   * Returns the view count of a render pass.  This is the layer count of the textures it is rendering to.
   * 
   * `views = Pass.getViewCount()`
   * 
   * @returns The view count.
   * 
   * A render pass has one "camera" for each view.  Whenever something is drawn, it is broadcast to each view (layer) of each texture, using the corresponding camera.
   */
  getViewCount(): number

  /**
   * Get the pose of a single view.
   * 
   * `[x, y, z, angle, ax, ay, az] = Pass.getViewPose(view)`
   * 
   * @param view - The view index.
   * @returns 
   * x - The x position of the viewer, in meters.
   * y - The y position of the viewer, in meters.
   * z - The z position of the viewer, in meters.
   * angle - The number of radians the viewer is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getViewPose(view: number): LuaMultiReturn<[x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Get the pose of a single view.
   * 
   * `matrix = Pass.getViewPose(view, matrix, invert)`
   * 
   * @param view - The view index.
   * @param matrix - The matrix to fill with the view pose.
   * @param invert - Whether the matrix should be inverted.
   * @returns The matrix containing the view pose.
   */
  getViewPose(view: number, matrix: Mat4, invert: boolean): Mat4

  /**
   * Returns the width of the textures of the Pass's canvas, in pixels.
   * 
   * `width = Pass.getWidth()`
   * 
   * @returns The texture width.
   * 
   * If the pass doesn't have a canvas, this function returns zero.
   */
  getWidth(): number

  /**
   * Draws a line between points.  `Pass:mesh` can also be used to draw line segments using the `line` `DrawMode`.
   * 
   * `Pass.line(x1, y1, z1, x2, y2, z2, ...numbers)`
   * 
   * @param x1 - The x coordinate of the first point.
   * @param y1 - The y coordinate of the first point.
   * @param z1 - The z coordinate of the first point.
   * @param x2 - The x coordinate of the next point.
   * @param y2 - The y coordinate of the next point.
   * @param z2 - The z coordinate of the next point.
   * @param ...numbers - More points to add to the line.
   * 
   * There is currently no way to increase line thickness.
   */
  line(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, ...numbers: number[]): void

  /**
   * Draws a line between points.  `Pass:mesh` can also be used to draw line segments using the `line` `DrawMode`.
   * 
   * `Pass.line(t)`
   * 
   * @param t - A table of numbers or `Vec3` objects (not a mix) representing points of the line.
   * 
   * There is currently no way to increase line thickness.
   */
  line(t: (number | vector)[]): void

  /**
   * Draws a line between points.  `Pass:mesh` can also be used to draw line segments using the `line` `DrawMode`.
   * 
   * `Pass.line(v1, v2, ...vectors)`
   * 
   * @param v1 - A vector containing the position of the first point of the line.
   * @param v2 - A vector containing the position of the next point on the line.
   * @param ...vectors - More points to add to the line.
   * 
   * There is currently no way to increase line thickness.
   */
  line(v1: vector, v2: vector, ...vectors: vector[]): void

  /**
   * Draws a mesh.
   * 
   * `Pass.mesh(vertices, x, y, z, scale, angle, ax, ay, az, start, count, instances)`
   * 
   * Draw a range of vertices from a Buffer, using numbers for the transform.
   * 
   * @param vertices - The buffer containing the vertices to draw.
   * @param x - The x coordinate of the position to draw the mesh at.
   * @param y - The y coordinate of the position to draw the mesh at.
   * @param z - The z coordinate of the position to draw the mesh at.
   * @param scale - The scale of the mesh.
   * @param angle - The number of radians the mesh is rotated around its rotational axis.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param start - The 1-based index of the first vertex to render from the vertex buffer (or the first index, when using an index buffer).
   * @param count - The number of vertices to render (or the number of indices, when using an index buffer). When `nil`, as many vertices or indices as possible will be drawn (based on the length of the Buffers and `start`).
   * @param instances - The number of copies of the mesh to render.
   * 
   * The index buffer defines the order the vertices are drawn in.  It can be used to reorder, reuse, or omit vertices from the mesh.
   * 
   * When drawing without a vertex buffer, the `VertexIndex` variable can be used in shaders to compute the position of each vertex, possibly by reading data from other `Buffer` or `Texture` resources.
   * 
   * The active `DrawMode` controls whether the vertices are drawn as points, lines, or triangles.
   * 
   * The active `Material` is applied to the mesh.
   */
  mesh(vertices?: Buffer, x?: number, y?: number, z?: number, scale?: number, angle?: number, ax?: number, ay?: number, az?: number, start?: number, count?: number, instances?: number): void

  /**
   * Draws a mesh.
   * 
   * `Pass.mesh(vertices, position, scales, orientation, start, count, instances)`
   * 
   * Draw a range of vertices from a Buffer, using vector types for the transform.
   * 
   * @param vertices - The buffer containing the vertices to draw.
   * @param position - The position to draw the mesh at.
   * @param scales - The scale of the mesh.
   * @param orientation - The orientation of the mesh.
   * @param start - The 1-based index of the first vertex to render from the vertex buffer (or the first index, when using an index buffer).
   * @param count - The number of vertices to render (or the number of indices, when using an index buffer). When `nil`, as many vertices or indices as possible will be drawn (based on the length of the Buffers and `start`).
   * @param instances - The number of copies of the mesh to render.
   * 
   * The index buffer defines the order the vertices are drawn in.  It can be used to reorder, reuse, or omit vertices from the mesh.
   * 
   * When drawing without a vertex buffer, the `VertexIndex` variable can be used in shaders to compute the position of each vertex, possibly by reading data from other `Buffer` or `Texture` resources.
   * 
   * The active `DrawMode` controls whether the vertices are drawn as points, lines, or triangles.
   * 
   * The active `Material` is applied to the mesh.
   */
  mesh(vertices: Buffer, position: vector, scales: vector, orientation: quaternion, start?: number, count?: number, instances?: number): void

  /**
   * Draws a mesh.
   * 
   * `Pass.mesh(vertices, transform, start, count, instances)`
   * 
   * Draw a range of vertices from a Buffer, using a matrix for the transform.
   * 
   * @param vertices - The buffer containing the vertices to draw.
   * @param transform - The transform to apply to the mesh.
   * @param start - The 1-based index of the first vertex to render from the vertex buffer (or the first index, when using an index buffer).
   * @param count - The number of vertices to render (or the number of indices, when using an index buffer). When `nil`, as many vertices or indices as possible will be drawn (based on the length of the Buffers and `start`).
   * @param instances - The number of copies of the mesh to render.
   * 
   * The index buffer defines the order the vertices are drawn in.  It can be used to reorder, reuse, or omit vertices from the mesh.
   * 
   * When drawing without a vertex buffer, the `VertexIndex` variable can be used in shaders to compute the position of each vertex, possibly by reading data from other `Buffer` or `Texture` resources.
   * 
   * The active `DrawMode` controls whether the vertices are drawn as points, lines, or triangles.
   * 
   * The active `Material` is applied to the mesh.
   */
  mesh(vertices: Buffer, transform: Mat4, start?: number, count?: number, instances?: number): void

  /**
   * Draws a mesh.
   * 
   * `Pass.mesh(vertices, indices, x, y, z, scale, angle, ax, ay, az, start, count, instances, base)`
   * 
   * Draw a mesh using a vertex buffer and an index buffer, using numbers for the transform.
   * 
   * @param vertices - The buffer containing the vertices to draw.
   * @param indices - The buffer containing the vertex indices to draw.
   * @param x - The x coordinate of the position to draw the mesh at.
   * @param y - The y coordinate of the position to draw the mesh at.
   * @param z - The z coordinate of the position to draw the mesh at.
   * @param scale - The scale of the mesh.
   * @param angle - The number of radians the mesh is rotated around its rotational axis.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param start - The 1-based index of the first vertex to render from the vertex buffer (or the first index, when using an index buffer).
   * @param count - The number of vertices to render (or the number of indices, when using an index buffer). When `nil`, as many vertices or indices as possible will be drawn (based on the length of the Buffers and `start`).
   * @param instances - The number of copies of the mesh to render.
   * @param base - A base offset to apply to vertex indices.
   * 
   * The index buffer defines the order the vertices are drawn in.  It can be used to reorder, reuse, or omit vertices from the mesh.
   * 
   * When drawing without a vertex buffer, the `VertexIndex` variable can be used in shaders to compute the position of each vertex, possibly by reading data from other `Buffer` or `Texture` resources.
   * 
   * The active `DrawMode` controls whether the vertices are drawn as points, lines, or triangles.
   * 
   * The active `Material` is applied to the mesh.
   */
  mesh(vertices: Buffer, indices: Buffer, x?: number, y?: number, z?: number, scale?: number, angle?: number, ax?: number, ay?: number, az?: number, start?: number, count?: number, instances?: number, base?: number): void

  /**
   * Draws a mesh.
   * 
   * `Pass.mesh(vertices, indices, position, scales, orientation, start, count, instances, base)`
   * 
   * Draw a mesh using a vertex buffer and an index buffer, using vector types for the transform.
   * 
   * @param vertices - The buffer containing the vertices to draw.
   * @param indices - The buffer containing the vertex indices to draw.
   * @param position - The position to draw the mesh at.
   * @param scales - The scale of the mesh.
   * @param orientation - The orientation of the mesh.
   * @param start - The 1-based index of the first vertex to render from the vertex buffer (or the first index, when using an index buffer).
   * @param count - The number of vertices to render (or the number of indices, when using an index buffer). When `nil`, as many vertices or indices as possible will be drawn (based on the length of the Buffers and `start`).
   * @param instances - The number of copies of the mesh to render.
   * @param base - A base offset to apply to vertex indices.
   * 
   * The index buffer defines the order the vertices are drawn in.  It can be used to reorder, reuse, or omit vertices from the mesh.
   * 
   * When drawing without a vertex buffer, the `VertexIndex` variable can be used in shaders to compute the position of each vertex, possibly by reading data from other `Buffer` or `Texture` resources.
   * 
   * The active `DrawMode` controls whether the vertices are drawn as points, lines, or triangles.
   * 
   * The active `Material` is applied to the mesh.
   */
  mesh(vertices: Buffer, indices: Buffer, position: vector, scales: vector, orientation: quaternion, start?: number, count?: number, instances?: number, base?: number): void

  /**
   * Draws a mesh.
   * 
   * `Pass.mesh(vertices, indices, transform, start, count, instances, base)`
   * 
   * Draw a mesh using a vertex buffer and an index buffer, using a matrix for the transform.
   * 
   * @param vertices - The buffer containing the vertices to draw.
   * @param indices - The buffer containing the vertex indices to draw.
   * @param transform - The transform to apply to the mesh.
   * @param start - The 1-based index of the first vertex to render from the vertex buffer (or the first index, when using an index buffer).
   * @param count - The number of vertices to render (or the number of indices, when using an index buffer). When `nil`, as many vertices or indices as possible will be drawn (based on the length of the Buffers and `start`).
   * @param instances - The number of copies of the mesh to render.
   * @param base - A base offset to apply to vertex indices.
   * 
   * The index buffer defines the order the vertices are drawn in.  It can be used to reorder, reuse, or omit vertices from the mesh.
   * 
   * When drawing without a vertex buffer, the `VertexIndex` variable can be used in shaders to compute the position of each vertex, possibly by reading data from other `Buffer` or `Texture` resources.
   * 
   * The active `DrawMode` controls whether the vertices are drawn as points, lines, or triangles.
   * 
   * The active `Material` is applied to the mesh.
   */
  mesh(vertices: Buffer, indices: Buffer, transform: Mat4, start?: number, count?: number, instances?: number, base?: number): void

  /**
   * Draws a mesh.
   * 
   * `Pass.mesh(vertices, indices, draws, drawcount, offset, stride)`
   * 
   * Perform indirect draws by specifying a `draws` command buffer.  This allows for the drawing of instanced geometry to be orchestrated by a compute shader that writes to the `draws` buffer.  The `draws` buffer contains one or more commands that define how to draw instances. The `stride` determines the number of bytes between each draw command.  By default the draws are assumed to be tightly packed, with 20 bytes between indexed draws and 16 bytes for non-indexed draws.
   * 
   * The `draws` buffer should use one of these formats:
   * 
   *     { -- drawing with vertices and indices
   *       { name = 'indexCount', type = 'u32' },
   *       { name = 'instanceCount', type = 'u32' },
   *       { name = 'firstIndex', type = 'u32' },
   *       { name = 'vertexOffset', type = 'i32' },
   *       { name = 'firstInstance', type = 'u32' }
   *     }
   * 
   *     { -- drawing with vertices; indices = nil
   *       { name = 'vertexCount', type = 'u32' },
   *       { name = 'instanceCount', type = 'u32' },
   *       { name = 'firstVertex', type = 'u32' },
   *       { name = 'firstInstance', type = 'u32' }
   *     }
   * 
   * @param vertices - The buffer containing the vertices to draw.
   * @param indices - The buffer containing the vertex indices to draw.
   * @param draws - The buffer containing indirect draw commands.
   * @param drawcount - The number of indirect draws to draw.
   * @param offset - A byte offset into the draw buffer.
   * @param stride - The number of bytes between consecutive elements in the draw buffer.  When zero or nil, the stride is autodetected, and will be 20 bytes when an index buffer is provided and 16 bytes otherwise.
   * 
   * The index buffer defines the order the vertices are drawn in.  It can be used to reorder, reuse, or omit vertices from the mesh.
   * 
   * When drawing without a vertex buffer, the `VertexIndex` variable can be used in shaders to compute the position of each vertex, possibly by reading data from other `Buffer` or `Texture` resources.
   * 
   * The active `DrawMode` controls whether the vertices are drawn as points, lines, or triangles.
   * 
   * The active `Material` is applied to the mesh.
   */
  mesh(vertices: Buffer, indices: Buffer, draws: Buffer, drawcount?: number, offset?: number, stride?: number): void

  /**
   * Resets the transform back to the origin.
   * 
   * `Pass.origin()`
   */
  origin(): void

  /**
   * Draws a plane.
   * 
   * `Pass.plane(x, y, z, width, height, angle, ax, ay, az, style, columns, rows)`
   * 
   * @param x - The x coordinate of the center of the plane.
   * @param y - The y coordinate of the center of the plane.
   * @param z - The z coordinate of the center of the plane.
   * @param width - The width of the plane.
   * @param height - The height of the plane.
   * @param angle - The rotation of the plane around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param style - Whether the plane should be drawn filled or outlined.
   * @param columns - The number of horizontal segments in the plane.
   * @param rows - The number of vertical segments in the plane.
   */
  plane(x?: number, y?: number, z?: number, width?: number, height?: number, angle?: number, ax?: number, ay?: number, az?: number, style?: DrawStyle, columns?: number, rows?: number): void

  /**
   * Draws a plane.
   * 
   * `Pass.plane(position, size, orientation, style, columns, rows)`
   * 
   * @param position - The position of the plane.
   * @param size - The size of the plane.
   * @param orientation - The orientation of the plane.
   * @param style - Whether the plane should be drawn filled or outlined.
   * @param columns - The number of horizontal segments in the plane.
   * @param rows - The number of vertical segments in the plane.
   */
  plane(position: vector, size: vector, orientation: quaternion, style?: DrawStyle, columns?: number, rows?: number): void

  /**
   * Draws a plane.
   * 
   * `Pass.plane(transform, style, columns, rows)`
   * 
   * @param transform - The transform of the plane.
   * @param style - Whether the plane should be drawn filled or outlined.
   * @param columns - The number of horizontal segments in the plane.
   * @param rows - The number of vertical segments in the plane.
   */
  plane(transform: Mat4, style?: DrawStyle, columns?: number, rows?: number): void

  /**
   * Draws points.  `Pass:mesh` can also be used to draw points using a `Buffer`.
   * 
   * `Pass.points(x, y, z, ...)`
   * 
   * @param x - The x coordinate of the first point.
   * @param y - The y coordinate of the first point.
   * @param z - The z coordinate of the first point.
   * @param ... - More points.
   * 
   * To change the size of points, set the `pointSize` shader flag in `lovr.graphics.newShader` or write to the `PointSize` variable in the vertex shader.  Points are always the same size on the screen, regardless of distance, and the units are in pixels.
   */
  points(x: number, y: number, z: number, ...rest: any[]): void

  /**
   * Draws points.  `Pass:mesh` can also be used to draw points using a `Buffer`.
   * 
   * `Pass.points(t)`
   * 
   * @param t - A table of numbers or Vec3 objects (not both) representing point positions.
   * 
   * To change the size of points, set the `pointSize` shader flag in `lovr.graphics.newShader` or write to the `PointSize` variable in the vertex shader.  Points are always the same size on the screen, regardless of distance, and the units are in pixels.
   */
  points(t: (number | vector)[]): void

  /**
   * Draws points.  `Pass:mesh` can also be used to draw points using a `Buffer`.
   * 
   * `Pass.points(v, ...)`
   * 
   * @param v - A vector containing the position of the first point to draw.
   * @param ... - More points.
   * 
   * To change the size of points, set the `pointSize` shader flag in `lovr.graphics.newShader` or write to the `PointSize` variable in the vertex shader.  Points are always the same size on the screen, regardless of distance, and the units are in pixels.
   */
  points(v: vector, ...rest: any[]): void

  /**
   * Draws a polygon.  The 3D vertices must be coplanar (all lie on the same plane), and the polygon must be convex (does not intersect itself or have any angles between vertices greater than 180 degrees), otherwise rendering artifacts may occur.
   * 
   * `Pass.polygon(x1, y1, z1, x2, y2, z2, ...)`
   * 
   * @param x1 - The x coordinate of the first vertex.
   * @param y1 - The y coordinate of the first vertex.
   * @param z1 - The z coordinate of the first vertex.
   * @param x2 - The x coordinate of the next vertex.
   * @param y2 - The y coordinate of the next vertex.
   * @param z2 - The z coordinate of the next vertex.
   * @param ... - More vertices to add to the polygon.
   * 
   * Currently, the polygon will not have normal vectors.
   * 
   * `Mesh` objects can also be used to draw arbitrary triangle meshes.
   */
  polygon(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, ...rest: any[]): void

  /**
   * Draws a polygon.  The 3D vertices must be coplanar (all lie on the same plane), and the polygon must be convex (does not intersect itself or have any angles between vertices greater than 180 degrees), otherwise rendering artifacts may occur.
   * 
   * `Pass.polygon(t)`
   * 
   * @param t - A table of numbers or `Vec3` objects (not a mix) representing vertices of the polygon.
   * 
   * Currently, the polygon will not have normal vectors.
   * 
   * `Mesh` objects can also be used to draw arbitrary triangle meshes.
   */
  polygon(t: (number | vector)[]): void

  /**
   * Draws a polygon.  The 3D vertices must be coplanar (all lie on the same plane), and the polygon must be convex (does not intersect itself or have any angles between vertices greater than 180 degrees), otherwise rendering artifacts may occur.
   * 
   * `Pass.polygon(v1, v2, ...)`
   * 
   * @param v1 - A vector containing the position of the first vertex of the polygon.
   * @param v2 - A vector containing the position of the next vertex on the polygon.
   * @param ... - More vertices to add to the polygon.
   * 
   * Currently, the polygon will not have normal vectors.
   * 
   * `Mesh` objects can also be used to draw arbitrary triangle meshes.
   */
  polygon(v1: vector, v2: vector, ...rest: any[]): void

  /**
   * Pops the transform or render state stack, restoring it to the state it was in when it was last pushed.
   * 
   * `Pass.pop(stack)`
   * 
   * @param stack - The type of stack to pop.
   * 
   * If a stack is popped without a corresponding push, the stack "underflows" which causes an error.
   */
  pop(stack?: StackType): void

  /**
   * Saves a copy of the transform or render states.  Further changes can be made to the transform or render states, and afterwards `Pass:pop` can be used to restore the original state.  Pushes and pops can be nested, but it's an error to pop without a corresponding push.
   * 
   * `Pass.push(stack)`
   * 
   * @param stack - The type of stack to push.
   * 
   * Each stack has a limit of the number of copies it can store.  There can be 16 transforms and 4 render states saved.
   * 
   * The `state` stack does not save the camera info or shader variables changed with `Pass:send`.
   */
  push(stack?: StackType): void

  /**
   * Resets the Pass, clearing all of its draws and computes and resetting all of its state to the default values.
   * 
   * `Pass.reset()`
   * 
   * The following things won't be reset:
   * 
   * - Pass canvas, set with `Pass:setCanvas`.
   * - Pass clears, set with `Pass:setClear`.
   * - The tally buffer, set with `Pass:setTallyBuffer`.
   */
  reset(): void

  /**
   * Rotates the coordinate system.
   * 
   * `Pass.rotate(angle, ax, ay, az)`
   * 
   * Rotate the coordinate system using numbers.
   * 
   * @param angle - The amount to rotate the coordinate system by, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   */
  rotate(angle: number, ax: number, ay: number, az: number): void

  /**
   * Rotates the coordinate system.
   * 
   * `Pass.rotate(rotation)`
   * 
   * Rotate the coordinate system using a quaternion.
   * 
   * @param rotation - A quaternion containing the rotation to apply.
   */
  rotate(rotation: quaternion): void

  /**
   * Draws a rounded rectangle.
   * 
   * `Pass.roundrect(x, y, z, width, height, thickness, angle, ax, ay, az, radius, segments)`
   * 
   * @param x - The x coordinate of the center of the rectangle.
   * @param y - The y coordinate of the center of the rectangle.
   * @param z - The z coordinate of the center of the rectangle.
   * @param width - The width of the rectangle.
   * @param height - The height of the rectangle.
   * @param thickness - The thickness of the rectangle.
   * @param angle - The rotation of the rectangle around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param radius - The radius of the rectangle corners.  If the radius is zero or negative, the rectangle will have sharp corners.
   * @param segments - The number of circular segments to use for each corner.  This increases the smoothness, but increases the number of vertices in the mesh.
   */
  roundrect(x?: number, y?: number, z?: number, width?: number, height?: number, thickness?: number, angle?: number, ax?: number, ay?: number, az?: number, radius?: number, segments?: number): void

  /**
   * Draws a rounded rectangle.
   * 
   * `Pass.roundrect(position, size, orientation, radius, segments)`
   * 
   * @param position - The position of the rectangle.
   * @param size - The size of the rectangle (width, height, thickness).
   * @param orientation - The orientation of the rectangle.
   * @param radius - The radius of the rectangle corners.  If the radius is zero or negative, the rectangle will have sharp corners.
   * @param segments - The number of circular segments to use for each corner.  This increases the smoothness, but increases the number of vertices in the mesh.
   */
  roundrect(position: vector, size: vector, orientation: quaternion, radius?: number, segments?: number): void

  /**
   * Draws a rounded rectangle.
   * 
   * `Pass.roundrect(transform, radius, segments)`
   * 
   * @param transform - The transform of the rectangle.
   * @param radius - The radius of the rectangle corners.  If the radius is zero or negative, the rectangle will have sharp corners.
   * @param segments - The number of circular segments to use for each corner.  This increases the smoothness, but increases the number of vertices in the mesh.
   */
  roundrect(transform: Mat4, radius?: number, segments?: number): void

  /**
   * Scales the coordinate system.
   * 
   * `Pass.scale(sx, sy, sz)`
   * 
   * Scale the coordinate system using numbers.
   * 
   * @param sx - The x component of the scale.
   * @param sy - The y component of the scale.
   * @param sz - The z component of the scale.
   */
  scale(sx: number, sy?: number, sz?: number): void

  /**
   * Scales the coordinate system.
   * 
   * `Pass.scale(scale)`
   * 
   * Scale the coordinate system using a vector.
   * 
   * @param scale - The scale to apply.
   */
  scale(scale: vector): void

  /**
   * Sends a value to a variable in the Pass's active `Shader`.  The active shader is changed using `Pass:setShader`.
   * 
   * `Pass.send(name, buffer, offset, extent)`
   * 
   * @param name - The name of the Shader variable.
   * @param buffer - The Buffer to assign.
   * @param offset - An offset from the start of the buffer where data will be read, in bytes.
   * @param extent - The number of bytes that will be available for reading.  If zero, as much data as possible will be bound, depending on the offset, buffer size, and the `uniformBufferRange` or `storageBufferRange` limit.
   * 
   * The new value will persist until a new shader is set that uses a different "type" for the binding number of the variable.  See `Pass:setShader` for more details.
   */
  send(name: string, buffer: Buffer, offset?: number, extent?: number): void

  /**
   * Sends a value to a variable in the Pass's active `Shader`.  The active shader is changed using `Pass:setShader`.
   * 
   * `Pass.send(name, texture)`
   * 
   * @param name - The name of the Shader variable.
   * @param texture - The Texture to assign.
   * 
   * The new value will persist until a new shader is set that uses a different "type" for the binding number of the variable.  See `Pass:setShader` for more details.
   */
  send(name: string, texture: Texture): void

  /**
   * Sends a value to a variable in the Pass's active `Shader`.  The active shader is changed using `Pass:setShader`.
   * 
   * `Pass.send(name, sampler)`
   * 
   * @param name - The name of the Shader variable.
   * @param sampler - The Sampler to assign.
   * 
   * The new value will persist until a new shader is set that uses a different "type" for the binding number of the variable.  See `Pass:setShader` for more details.
   */
  send(name: string, sampler: Sampler): void

  /**
   * Sends a value to a variable in the Pass's active `Shader`.  The active shader is changed using `Pass:setShader`.
   * 
   * `Pass.send(name, data)`
   * 
   * @param name - The name of the Shader variable.
   * @param data - Numbers, booleans, vectors, or tables to assign to the data or uniform buffer.
   * 
   * The new value will persist until a new shader is set that uses a different "type" for the binding number of the variable.  See `Pass:setShader` for more details.
   */
  send(name: string, data: any): void

  /**
   * Sets whether alpha to coverage is enabled.  Alpha to coverage factors the alpha of a pixel into antialiasing calculations.  It can be used to get antialiased edges on textures with transparency.  It's often used for foliage.
   * 
   * `Pass.setAlphaToCoverage(enable)`
   * 
   * @param enable - Whether alpha to coverage should be enabled.
   * 
   * By default, alpha to coverage is disabled.
   */
  setAlphaToCoverage(enable: boolean): void

  /**
   * Sets the blend mode.  When a pixel is drawn, the blend mode controls how it is mixed with the color and alpha of the pixel underneath it.
   * 
   * `Pass.setBlendMode(blend, alphaBlend)`
   * 
   * Sets the blend mode for all canvas textures.
   * 
   * @param blend - The blend mode.
   * @param alphaBlend - The alpha blend mode, used to control premultiplied alpha.
   * 
   * The default blend mode is `alpha` with the `alphamultiply` alpha mode.
   */
  setBlendMode(blend: BlendMode, alphaBlend: BlendAlphaMode): void

  /**
   * Sets the blend mode.  When a pixel is drawn, the blend mode controls how it is mixed with the color and alpha of the pixel underneath it.
   * 
   * `Pass.setBlendMode()`
   * 
   * Disables blending.  When something is drawn, its pixel colors will replace any existing color in the target texture.  This can work okay for opaque objects, but won't render text or transparency properly.
   * 
   * The default blend mode is `alpha` with the `alphamultiply` alpha mode.
   */
  setBlendMode(): void

  /**
   * Sets the blend mode.  When a pixel is drawn, the blend mode controls how it is mixed with the color and alpha of the pixel underneath it.
   * 
   * `Pass.setBlendMode(index, blend, alphaBlend)`
   * 
   * Sets the blend mode for a single canvas texture.
   * 
   * @param index - The index of the canvas texture that will use the new blend mode.
   * @param blend - The blend mode.
   * @param alphaBlend - The alpha blend mode, used to control premultiplied alpha.
   * 
   * The default blend mode is `alpha` with the `alphamultiply` alpha mode.
   */
  setBlendMode(index: number, blend: BlendMode, alphaBlend: BlendAlphaMode): void

  /**
   * Sets the blend mode.  When a pixel is drawn, the blend mode controls how it is mixed with the color and alpha of the pixel underneath it.
   * 
   * `Pass.setBlendMode(index)`
   * 
   * Disables blending for a single canvas texture.
   * 
   * @param index - The index of the canvas texture that will use the new blend mode.
   * 
   * The default blend mode is `alpha` with the `alphamultiply` alpha mode.
   */
  setBlendMode(index: number): void

  /**
   * Sets the Pass's canvas.  The canvas is a set of textures that the Pass will draw to when it's submitted, along with configuration for the depth buffer and antialiasing.
   * 
   * `Pass.setCanvas(...textures)`
   * 
   * @param ...textures - One or more color textures the pass will render to.
   * 
   * Changing the canvas will reset the pass, as though `Pass:reset` was called.
   * 
   * All textures must have the same dimensions, layer counts, and multisample counts.  They also must have been created with the `render` usage flag.
   * 
   * The number of layers in the textures determines how many views (cameras) the pass has.  Each draw will be rendered to all texture layers, as seen from the corresponding camera.  For example, VR rendering will use a canvas texture with 2 layers, one for each eye.
   * 
   * To render to a specific mipmap level or layer of a texture, use texture views (`lovr.graphics.newTextureView`).
   * 
   * Mipmaps will be regenerated for all of canvas textures at the end of a render pass.
   * 
   * If the Pass has multiple color textures, a fragment shader should be used to write a different color to each texture.  Here's an example that writes red to the first texture and blue to the second texture:
   * 
   *     // Declare an output variable for the second texture
   *     layout(location = 1) out vec4 secondColor;
   * 
   *     vec4 lovrmain() {
   *       secondColor = vec4(0, 0, 1, 1);
   *       return vec4(1, 0, 0, 1);
   *     }
   */
  setCanvas(...textures: Texture[]): void

  /**
   * Sets the Pass's canvas.  The canvas is a set of textures that the Pass will draw to when it's submitted, along with configuration for the depth buffer and antialiasing.
   * 
   * `Pass.setCanvas(canvas)`
   * 
   * @param canvas - The canvas.  Each numeric key is a color texture to render to (up to 4), along with the following keys to control depth buffer and antialiasing settings:
   * 
   * Changing the canvas will reset the pass, as though `Pass:reset` was called.
   * 
   * All textures must have the same dimensions, layer counts, and multisample counts.  They also must have been created with the `render` usage flag.
   * 
   * The number of layers in the textures determines how many views (cameras) the pass has.  Each draw will be rendered to all texture layers, as seen from the corresponding camera.  For example, VR rendering will use a canvas texture with 2 layers, one for each eye.
   * 
   * To render to a specific mipmap level or layer of a texture, use texture views (`lovr.graphics.newTextureView`).
   * 
   * Mipmaps will be regenerated for all of canvas textures at the end of a render pass.
   * 
   * If the Pass has multiple color textures, a fragment shader should be used to write a different color to each texture.  Here's an example that writes red to the first texture and blue to the second texture:
   * 
   *     // Declare an output variable for the second texture
   *     layout(location = 1) out vec4 secondColor;
   * 
   *     vec4 lovrmain() {
   *       secondColor = vec4(0, 0, 1, 1);
   *       return vec4(1, 0, 0, 1);
   *     }
   */
  setCanvas(canvas: { depth?: any, samples?: number, }): void

  /**
   * Sets the Pass's canvas.  The canvas is a set of textures that the Pass will draw to when it's submitted, along with configuration for the depth buffer and antialiasing.
   * 
   * `Pass.setCanvas()`
   * 
   * Disable the canvas.  Any draws in the Pass will be skipped when it is submitted (compute shaders will still run though).
   * 
   * Changing the canvas will reset the pass, as though `Pass:reset` was called.
   * 
   * All textures must have the same dimensions, layer counts, and multisample counts.  They also must have been created with the `render` usage flag.
   * 
   * The number of layers in the textures determines how many views (cameras) the pass has.  Each draw will be rendered to all texture layers, as seen from the corresponding camera.  For example, VR rendering will use a canvas texture with 2 layers, one for each eye.
   * 
   * To render to a specific mipmap level or layer of a texture, use texture views (`lovr.graphics.newTextureView`).
   * 
   * Mipmaps will be regenerated for all of canvas textures at the end of a render pass.
   * 
   * If the Pass has multiple color textures, a fragment shader should be used to write a different color to each texture.  Here's an example that writes red to the first texture and blue to the second texture:
   * 
   *     // Declare an output variable for the second texture
   *     layout(location = 1) out vec4 secondColor;
   * 
   *     vec4 lovrmain() {
   *       secondColor = vec4(0, 0, 1, 1);
   *       return vec4(1, 0, 0, 1);
   *     }
   */
  setCanvas(): void

  /**
   * Sets the clear values of the pass.  This controls the initial colors of the canvas texture pixels at the beginning of the render pass.  For each color texture, it can be one of the following:
   * 
   * - A specific RGBA color value (or number for the depth texture).
   * - `true`, to do a "fast clear" to undefined values.  This is useful if the pass is going to end
   *   up drawing to all of the texture's pixels.
   * - `false`, to avoid clearing and load the texture's existing pixels.  This can be slow on mobile
   *   GPUs.
   * 
   * `Pass.setClear(hex)`
   * 
   * Set the clear color for all color textures, using a hexcode.
   * 
   * @param hex - A hexcode color to clear all color textures to.
   * 
   * If the depth clear is not given, it will be set to 0.
   * 
   * All clear colors will default to transparent black (all zeros) when the Pass is created.
   */
  setClear(hex: number): void

  /**
   * Sets the clear values of the pass.  This controls the initial colors of the canvas texture pixels at the beginning of the render pass.  For each color texture, it can be one of the following:
   * 
   * - A specific RGBA color value (or number for the depth texture).
   * - `true`, to do a "fast clear" to undefined values.  This is useful if the pass is going to end
   *   up drawing to all of the texture's pixels.
   * - `false`, to avoid clearing and load the texture's existing pixels.  This can be slow on mobile
   *   GPUs.
   * 
   * `Pass.setClear(r, g, b, a)`
   * 
   * Set the clear color for all color textures, using numbers.
   * 
   * @param r - The red component of the clear color.
   * @param g - The green component of the clear color.
   * @param b - The blue component of the clear color.
   * @param a - The alpha component of the clear color.
   * 
   * If the depth clear is not given, it will be set to 0.
   * 
   * All clear colors will default to transparent black (all zeros) when the Pass is created.
   */
  setClear(r: number, g: number, b: number, a?: number): void

  /**
   * Sets the clear values of the pass.  This controls the initial colors of the canvas texture pixels at the beginning of the render pass.  For each color texture, it can be one of the following:
   * 
   * - A specific RGBA color value (or number for the depth texture).
   * - `true`, to do a "fast clear" to undefined values.  This is useful if the pass is going to end
   *   up drawing to all of the texture's pixels.
   * - `false`, to avoid clearing and load the texture's existing pixels.  This can be slow on mobile
   *   GPUs.
   * 
   * `Pass.setClear(clear)`
   * 
   * Set the clear color for all color textures, using a boolean.
   * 
   * @param clear - Whether color textures should be cleared.
   * 
   * If the depth clear is not given, it will be set to 0.
   * 
   * All clear colors will default to transparent black (all zeros) when the Pass is created.
   */
  setClear(clear: boolean): void

  /**
   * Sets the clear values of the pass.  This controls the initial colors of the canvas texture pixels at the beginning of the render pass.  For each color texture, it can be one of the following:
   * 
   * - A specific RGBA color value (or number for the depth texture).
   * - `true`, to do a "fast clear" to undefined values.  This is useful if the pass is going to end
   *   up drawing to all of the texture's pixels.
   * - `false`, to avoid clearing and load the texture's existing pixels.  This can be slow on mobile
   *   GPUs.
   * 
   * `Pass.setClear(t)`
   * 
   * Set the clear color for all color textures using a table, or set clear values for individual textures.
   * 
   * @param t - A table of clear values.  This can be a table of 4 numbers to use for all color textures, or it can be a list of boolean and/or RGBA tables to use for each individual color texture.  It can also have a `depth` key with a boolean/number for the depth texture's clear.
   * 
   * If the depth clear is not given, it will be set to 0.
   * 
   * All clear colors will default to transparent black (all zeros) when the Pass is created.
   */
  setClear(t: LuaTable): void

  /**
   * Sets the color used for drawing.  Color components are from 0 to 1.
   * 
   * `Pass.setColor(r, g, b, a)`
   * 
   * @param r - The red component of the color.
   * @param g - The green component of the color.
   * @param b - The blue component of the color.
   * @param a - The alpha component of the color.
   * 
   * The default color is `(1, 1, 1, 1)`.
   */
  setColor(r: number, g: number, b: number, a?: number): void

  /**
   * Sets the color used for drawing.  Color components are from 0 to 1.
   * 
   * `Pass.setColor(t)`
   * 
   * @param t - A table of 3 or 4 color components.
   * 
   * The default color is `(1, 1, 1, 1)`.
   */
  setColor(t: number[]): void

  /**
   * Sets the color used for drawing.  Color components are from 0 to 1.
   * 
   * `Pass.setColor(hex, a)`
   * 
   * @param hex - A hexcode.
   * @param a - The alpha component of the color.
   * 
   * The default color is `(1, 1, 1, 1)`.
   */
  setColor(hex: number, a?: number): void

  /**
   * Sets the color channels affected by drawing, on a per-channel basis.  Disabling color writes is often used to render to the depth or stencil buffer without affecting existing pixel colors.
   * 
   * `Pass.setColorWrite(enable)`
   * 
   * @param enable - Whether all color components should be affected by draws.
   * 
   * By default, color writes are enabled for all channels.
   */
  setColorWrite(enable: boolean): void

  /**
   * Sets the color channels affected by drawing, on a per-channel basis.  Disabling color writes is often used to render to the depth or stencil buffer without affecting existing pixel colors.
   * 
   * `Pass.setColorWrite(r, g, b, a)`
   * 
   * @param r - Whether the red component should be affected by draws.
   * @param g - Whether the green component should be affected by draws.
   * @param b - Whether the blue component should be affected by draws.
   * @param a - Whether the alpha component should be affected by draws.
   * 
   * By default, color writes are enabled for all channels.
   */
  setColorWrite(r: boolean, g: boolean, b: boolean, a: boolean): void

  /**
   * Sets the color channels affected by drawing, on a per-channel basis.  Disabling color writes is often used to render to the depth or stencil buffer without affecting existing pixel colors.
   * 
   * `Pass.setColorWrite(index, enable)`
   * 
   * @param index - The index of the canvas texture to update.
   * @param enable - Whether all color components should be affected by draws.
   * 
   * By default, color writes are enabled for all channels.
   */
  setColorWrite(index: number, enable: boolean): void

  /**
   * Sets the color channels affected by drawing, on a per-channel basis.  Disabling color writes is often used to render to the depth or stencil buffer without affecting existing pixel colors.
   * 
   * `Pass.setColorWrite(index, r, g, b, a)`
   * 
   * @param index - The index of the canvas texture to update.
   * @param r - Whether the red component should be affected by draws.
   * @param g - Whether the green component should be affected by draws.
   * @param b - Whether the blue component should be affected by draws.
   * @param a - Whether the alpha component should be affected by draws.
   * 
   * By default, color writes are enabled for all channels.
   */
  setColorWrite(index: number, r: boolean, g: boolean, b: boolean, a: boolean): void

  /**
   * Sets whether the front or back faces of triangles are culled.
   * 
   * `Pass.setCullMode(mode)`
   * 
   * @param mode - Whether `front` faces, `back` faces, or `none` of the faces should be culled.
   * 
   * By default, face culling is disabled.
   */
  setCullMode(mode: CullMode): void

  /**
   * Sets whether the front or back faces of triangles are culled.
   * 
   * `Pass.setCullMode()`
   * 
   * Disable face culling.
   * 
   * By default, face culling is disabled.
   */
  setCullMode(): void

  /**
   * Enables or disables depth clamp.  Normally, when pixels fall outside of the clipping planes, they are clipped (not rendered).  Depth clamp will instead render these pixels, clamping their depth on to the clipping planes.
   * 
   * `Pass.setDepthClamp(enable)`
   * 
   * @param enable - Whether depth clamp should be enabled.
   * 
   * This isn\'t supported on all GPUs.  Use the `depthClamp` feature of `lovr.graphics.getFeatures` to check for support.  If depth clamp is enabled when unsupported, it will silently fall back to depth clipping.
   * 
   * Depth clamping is not enabled by default.
   */
  setDepthClamp(enable: boolean): void

  /**
   * Set the depth offset.  This is a constant offset added to the depth value of pixels, as well as a "sloped" depth offset that is scaled based on the "slope" of the depth at the pixel.
   * 
   * This can be used to fix Z fighting when rendering decals or other nearly-overlapping objects, and is also useful for shadow biasing when implementing shadow mapping.
   * 
   * `Pass.setDepthOffset(offset, sloped)`
   * 
   * @param offset - The depth offset.
   * @param sloped - The sloped depth offset.
   * 
   * The default depth offset is zero for both values.
   * 
   * This only applies to triangles, not points or lines.
   * 
   * The units for these offsets aren't specified very well -- they depend on the format of the depth texture, and the GPU can use them slightly differently for its depth calculations.  However, an `offset` of 1 will roughly correspond to the smallest-possible depth difference (e.g. 2^-16 for a `d16` depth texture).
   * 
   * The sloped depth scale is multiplied by the slope of the depth of the triangle.  For example, if pixels in the triangle all have the same depth (i.e. the triangle is facing the camera), then the slope of the depth will be zero and the sloped depth offset won't have any effect.  As the triangle starts to face away from the camera, the slope of the depth will increase and the sloped depth offset will begin to apply.  This can also be thought of corresponding to the normal vector of the triangle relative to the camera.
   * 
   * Note that the offsets can be negative.  With LÖVR's default projection matrix, depth values of zero are far away and one are close up, so positive depth offsets will push depth values "closer" to the viewer.  With flipped projection matrices (a depth test of `lequal`), negative depth offsets would be used instead.
   */
  setDepthOffset(offset?: number, sloped?: number): void

  /**
   * Sets the depth test.
   * 
   * `Pass.setDepthTest(test)`
   * 
   * @param test - The new depth test to use.
   * 
   * When using LÖVR's default projection (reverse Z with infinite far plane) the default depth test is `gequal`, depth values of 0.0 are on the far plane and depth values of 1.0 are on the near plane, closer to the camera.
   * 
   * The near and far clipping planes are set with `Pass:setProjection`.  The default is set with `lovr.headset.setClipDistance`.
   * 
   * A depth buffer must be present to use the depth test, but this is enabled by default.
   */
  setDepthTest(test: CompareMode): void

  /**
   * Sets the depth test.
   * 
   * `Pass.setDepthTest()`
   * 
   * Disable the depth test.
   * 
   * When using LÖVR's default projection (reverse Z with infinite far plane) the default depth test is `gequal`, depth values of 0.0 are on the far plane and depth values of 1.0 are on the near plane, closer to the camera.
   * 
   * The near and far clipping planes are set with `Pass:setProjection`.  The default is set with `lovr.headset.setClipDistance`.
   * 
   * A depth buffer must be present to use the depth test, but this is enabled by default.
   */
  setDepthTest(): void

  /**
   * Sets whether draws write to the depth buffer.  When a pixel is drawn, if depth writes are enabled and the pixel passes the depth test, the depth buffer will be updated with the pixel's depth value.
   * 
   * `Pass.setDepthWrite(write)`
   * 
   * @param write - Whether the depth buffer should be affected by draws.
   * 
   * The default depth write is `true`.
   */
  setDepthWrite(write: boolean): void

  /**
   * Sets whether the front or back faces of triangles are culled.
   * 
   * `Pass.setFaceCull(mode)`
   * 
   * @param mode - Whether `front` faces, `back` faces, or `none` of the faces should be culled.
   * 
   * By default, face culling is disabled.
   */
  setFaceCull(mode: CullMode): void

  /**
   * Sets whether the front or back faces of triangles are culled.
   * 
   * `Pass.setFaceCull()`
   * 
   * Disable face culling.
   * 
   * By default, face culling is disabled.
   */
  setFaceCull(): void

  /**
   * Sets the font used for `Pass:text`.
   * 
   * `Pass.setFont(font)`
   * 
   * @param font - The Font to use when rendering text.
   */
  setFont(font: Font): void

  /**
   * Sets the material.  This will apply to most drawing, except for text, skyboxes, and models, which use their own materials.
   * 
   * `Pass.setMaterial(material)`
   * 
   * @param material - The texture or material to apply to surfaces.
   */
  setMaterial(material: Texture | Material): void

  /**
   * Sets the material.  This will apply to most drawing, except for text, skyboxes, and models, which use their own materials.
   * 
   * `Pass.setMaterial()`
   * 
   * Use the default material.
   */
  setMaterial(): void

  /**
   * Changes the way vertices are connected together when drawing using `Pass:mesh`.
   * 
   * `Pass.setMeshMode(mode)`
   * 
   * @param mode - The mesh mode to use.
   * 
   * The default mesh mode is `triangles`.
   */
  setMeshMode(mode: DrawMode): void

  /**
   * Sets the projection for a single view.  4 field of view angles can be used, similar to the field of view returned by `lovr.headset.getViewAngles`.  Alternatively, a projection matrix can be used for other types of projections like orthographic, oblique, etc.
   * 
   * Up to 6 views are supported.  The Pass returned by `lovr.headset.getPass` will have its views automatically configured to match the headset.
   * 
   * `Pass.setProjection(view, left, right, up, down, near, far)`
   * 
   * @param view - The index of the view to update.
   * @param left - The left field of view angle, in radians.
   * @param right - The right field of view angle, in radians.
   * @param up - The top field of view angle, in radians.
   * @param down - The bottom field of view angle, in radians.
   * @param near - The near clipping plane distance, in meters.
   * @param far - The far clipping plane distance, in meters.
   * 
   * A far clipping plane of 0.0 can be used for an infinite far plane with reversed Z range.  This is the default because it improves depth precision and reduces Z fighting.  Using a non-infinite far plane requires the depth buffer to be cleared to 1.0 instead of 0.0 and the default depth test to be changed to `lequal` instead of `gequal`.
   * 
   * By default, the projection is set by the headset.  Each HMD has a specific field of view given by `lovr.headset.getViewAngles`, and the clipping planes can be customized with `lovr.headset.setClipDistance`.
   */
  setProjection(view: number, left: number, right: number, up: number, down: number, near?: number, far?: number): void

  /**
   * Sets the projection for a single view.  4 field of view angles can be used, similar to the field of view returned by `lovr.headset.getViewAngles`.  Alternatively, a projection matrix can be used for other types of projections like orthographic, oblique, etc.
   * 
   * Up to 6 views are supported.  The Pass returned by `lovr.headset.getPass` will have its views automatically configured to match the headset.
   * 
   * `Pass.setProjection(view, matrix)`
   * 
   * @param view - The index of the view to update.
   * @param matrix - The projection matrix for the view.
   * 
   * A far clipping plane of 0.0 can be used for an infinite far plane with reversed Z range.  This is the default because it improves depth precision and reduces Z fighting.  Using a non-infinite far plane requires the depth buffer to be cleared to 1.0 instead of 0.0 and the default depth test to be changed to `lequal` instead of `gequal`.
   * 
   * By default, the projection is set by the headset.  Each HMD has a specific field of view given by `lovr.headset.getViewAngles`, and the clipping planes can be customized with `lovr.headset.setClipDistance`.
   */
  setProjection(view: number, matrix: Mat4): void

  /**
   * Sets the default `Sampler` to use when sampling textures.  It is also possible to send a custom sampler to a shader using `Pass:send` and use that instead, which allows customizing the sampler on a per-texture basis.
   * 
   * `Pass.setSampler(sampler)`
   * 
   * @param sampler - The Sampler shaders will use when reading from textures.  It can also be a `FilterMode`, for convenience (other sampler settings will use their defaults).
   * 
   * The `getPixel` shader helper function will use this sampler.
   * 
   * When a Pass is reset, its sampler will be reset to `linear`.
   * 
   * The sampler applies to all draws in the pass on submit, regardless of when the sampler is set.
   * 
   * If you need different samplers for each draw, currently you have to send a `Sampler` object to a Shader (this is not ideal).
   */
  setSampler(sampler?: Sampler | FilterMode): void

  /**
   * Sets the scissor rectangle.  Any pixels outside the scissor rectangle will not be drawn.
   * 
   * `Pass.setScissor(x, y, w, h)`
   * 
   * @param x - The x coordinate of the upper-left corner of the scissor rectangle.
   * @param y - The y coordinate of the upper-left corner of the scissor rectangle.
   * @param w - The width of the scissor rectangle.
   * @param h - The height of the scissor rectangle.
   * 
   * `x` and `y` can not be negative.  `w` and `h` must be positive.
   * 
   * By default, the scissor covers the entire canvas.
   */
  setScissor(x: number, y: number, w: number, h: number): void

  /**
   * Sets the scissor rectangle.  Any pixels outside the scissor rectangle will not be drawn.
   * 
   * `Pass.setScissor()`
   * 
   * Disable the scissor.
   * 
   * `x` and `y` can not be negative.  `w` and `h` must be positive.
   * 
   * By default, the scissor covers the entire canvas.
   */
  setScissor(): void

  /**
   * Sets the active shader.  The Shader will affect all drawing operations until it is changed again.
   * 
   * `Pass.setShader(shader)`
   * 
   * @param shader - The shader to use.
   * 
   * Changing the shader will preserve variable values (the ones set using `Pass:send`) **unless** the new shader declares a variable with the same as one in the old shader, but a different type. The variable "type" means one of the following:
   * 
   * - Uniform buffer (`uniform`).
   * - Storage buffer (`buffer`).
   * - Sampled texture, (`uniform texture<type>`).
   * - Storage texture, (`uniform image<type>`).
   * - Sampler (`uniform sampler`).
   * 
   * If there's a clash in types, the variable will be reset to use a default resource:
   * 
   * - Buffer variables do not have well-defined behavior when they are reset like this, and may
   *   return random data or even crash the GPU.
   * - Texture variable will use a default texture with a single white pixel.
   * - Sampler variables will use a default sampler with a `linear` filter mode and `repeat` wrap
   *   mode.
   * 
   * Uniform variables with basic types like `float`, `vec3`, `mat4`, etc. will have their data preserved as long as both shaders declare the variable with the same name and type.
   */
  setShader(shader: Shader | DefaultShader): void

  /**
   * Sets the active shader.  The Shader will affect all drawing operations until it is changed again.
   * 
   * `Pass.setShader()`
   * 
   * Switch back to using an automatic shader for drawing.
   * 
   * Changing the shader will preserve variable values (the ones set using `Pass:send`) **unless** the new shader declares a variable with the same as one in the old shader, but a different type. The variable "type" means one of the following:
   * 
   * - Uniform buffer (`uniform`).
   * - Storage buffer (`buffer`).
   * - Sampled texture, (`uniform texture<type>`).
   * - Storage texture, (`uniform image<type>`).
   * - Sampler (`uniform sampler`).
   * 
   * If there's a clash in types, the variable will be reset to use a default resource:
   * 
   * - Buffer variables do not have well-defined behavior when they are reset like this, and may
   *   return random data or even crash the GPU.
   * - Texture variable will use a default texture with a single white pixel.
   * - Sampler variables will use a default sampler with a `linear` filter mode and `repeat` wrap
   *   mode.
   * 
   * Uniform variables with basic types like `float`, `vec3`, `mat4`, etc. will have their data preserved as long as both shaders declare the variable with the same name and type.
   */
  setShader(): void

  /**
   * Sets the stencil test.  Any pixels that fail the stencil test won't be drawn.  For example, setting the stencil test to `('equal', 1)` will only draw pixels that have a stencil value of 1. The stencil buffer can be modified by drawing while stencil writes are enabled with `lovr.graphics.setStencilWrite`.
   * 
   * `Pass.setStencilTest(test, value, mask)`
   * 
   * @param test - The new stencil test to use.
   * @param value - The stencil value to compare against.
   * @param mask - An optional mask to apply to stencil values before the comparison.
   * 
   * The stencil test is disabled by default.
   * 
   * Setting the stencil test requires the `Pass` to have a depth texture with the `d24s8` or `d32fs8` format (the `s` means "stencil").  The `t.graphics.stencil` and `t.headset.stencil` flags in `lovr.conf` can be used to request a stencil format for the default window and headset passes, respectively.
   */
  setStencilTest(test: CompareMode, value: number, mask?: number): void

  /**
   * Sets the stencil test.  Any pixels that fail the stencil test won't be drawn.  For example, setting the stencil test to `('equal', 1)` will only draw pixels that have a stencil value of 1. The stencil buffer can be modified by drawing while stencil writes are enabled with `lovr.graphics.setStencilWrite`.
   * 
   * `Pass.setStencilTest()`
   * 
   * Disable the stencil test.
   * 
   * The stencil test is disabled by default.
   * 
   * Setting the stencil test requires the `Pass` to have a depth texture with the `d24s8` or `d32fs8` format (the `s` means "stencil").  The `t.graphics.stencil` and `t.headset.stencil` flags in `lovr.conf` can be used to request a stencil format for the default window and headset passes, respectively.
   */
  setStencilTest(): void

  /**
   * Sets or disables stencil writes.  When stencil writes are enabled, any pixels drawn will update the values in the stencil buffer using the `StencilAction` set.
   * 
   * `Pass.setStencilWrite(action, value, mask)`
   * 
   * @param action - How pixels should update the stencil buffer when they are drawn.  Can also be a list of 3 stencil actions, used when a pixel fails the stencil test, fails the depth test, or passes the stencil test, respectively.
   * @param value - When using the 'replace' action, this is the value to replace with.
   * @param mask - An optional mask to apply to stencil values before writing.
   * 
   * By default, stencil writes are disabled.
   * 
   * Setting the stencil test requires the `Pass` to have a depth texture with the `d24s8` or `d32fs8` format (the `s` means "stencil").  The `t.graphics.stencil` and `t.headset.stencil` flags in `lovr.conf` can be used to request a stencil format for the default window and headset passes, respectively.
   */
  setStencilWrite(action: StencilAction | StencilAction[], value?: number, mask?: number): void

  /**
   * Sets or disables stencil writes.  When stencil writes are enabled, any pixels drawn will update the values in the stencil buffer using the `StencilAction` set.
   * 
   * `Pass.setStencilWrite()`
   * 
   * Disables stencil writing.
   * 
   * By default, stencil writes are disabled.
   * 
   * Setting the stencil test requires the `Pass` to have a depth texture with the `d24s8` or `d32fs8` format (the `s` means "stencil").  The `t.graphics.stencil` and `t.headset.stencil` flags in `lovr.conf` can be used to request a stencil format for the default window and headset passes, respectively.
   */
  setStencilWrite(): void

  /**
   * Sets the Buffer where tally results will be written to.  Each time the render pass finishes, the results of all the tallies will be copied to the Buffer at the specified offset.  The buffer can be used in a later pass in a compute shader, or the data in the buffer can be read back using e.g. `Buffer:newReadback`.
   * 
   * `Pass.setTallyBuffer(buffer, offset)`
   * 
   * @param buffer - The buffer.
   * @param offset - A byte offset where results will be written.  Must be a multiple of 4.
   * 
   * Each tally result is a 4-byte unsigned integer with the number of samples that passed the depth and stencil tests.
   * 
   * If the buffer doesn't have enough room to store all the tallies, the number of tallies copied will be clamped to the minimum number that will fit.
   */
  setTallyBuffer(buffer: Buffer, offset: number): void

  /**
   * Sets the Buffer where tally results will be written to.  Each time the render pass finishes, the results of all the tallies will be copied to the Buffer at the specified offset.  The buffer can be used in a later pass in a compute shader, or the data in the buffer can be read back using e.g. `Buffer:newReadback`.
   * 
   * `Pass.setTallyBuffer()`
   * 
   * Unset the tally buffer.
   * 
   * Each tally result is a 4-byte unsigned integer with the number of samples that passed the depth and stencil tests.
   * 
   * If the buffer doesn't have enough room to store all the tallies, the number of tallies copied will be clamped to the minimum number that will fit.
   */
  setTallyBuffer(): void

  /**
   * Enables or disables view frustum culling.  When enabled, if an object is drawn outside of the camera view, the draw will be skipped.  This can improve performance.
   * 
   * `Pass.setViewCull(enable)`
   * 
   * @param enable - Whether frustum culling should be enabled.
   * 
   * View frustum culling is disabled by default.
   * 
   * Objects will be culled against all views in the Pass.  The pose and projection for these views is controlled using `Pass:setViewPose` and `Pass:setProjection`.
   * 
   * View frustum culling will increase CPU usage, but will reduce GPU usage depending on how many objects get culled and how many vertices they have.
   * 
   * For most scenes that draw objects all around the camera, frustum culling will usually result in large speedups.  However, it's always good to measure to be sure.  For example, if every object drawn is in view, then frustum culling will only make things slower, because LÖVR will spend time checking if objects are in view without actually culling any of them.
   * 
   * `Pass:getStats` will return `draws` and `drawsCulled` fields.  The `submitTime` and `gpuTime` fields (with `lovr.graphics.setTimingEnabled`) are a good way to measure the impact of culling.
   * 
   * To cull an object against a view frustum, LÖVR needs to know the object's bounding box.  The following types of draws have bounding boxes:
   * 
   * - `Pass:plane`
   * - `Pass:roundrect`
   * - `Pass:cube`
   * - `Pass:box`
   * - `Pass:circle`
   * - `Pass:sphere`
   * - `Pass:cylinder`
   * - `Pass:cone`
   * - `Pass:capsule`
   * - `Pass:torus`
   * - `Pass:draw` (see notes below for `Model` and `Mesh` objects)
   * 
   * The following draws do **not** currently have bounding boxes, and will not be culled:
   * 
   * - `Pass:points`
   * - `Pass:line`
   * - `Pass:text`
   * - `Pass:skybox`
   * - `Pass:fill`
   * - `Pass:mesh`
   * 
   * `Model` objects only compute their bounding box when they're loaded, using the initial node transforms.  If a model is animated, then the bounding box will become out of sync and culling will not work properly.  View culling should be disabled when rendering animated models.
   * 
   * `Mesh` objects will not have a bounding box by default.  Meshes with a storage type of `cpu` can compute their bounding boxes using `Mesh:computeBoundingBox`, which should be called after creating the Mesh or whenever its vertices change.  Any type of Mesh can have its bounding box set manually using `Mesh:setBoundingBox`.  This can be faster than `Mesh:computeBoundingBox` if the bounding box is already known, and is the only way to give a `gpu` Mesh a bounding box.
   */
  setViewCull(enable: boolean): void

  /**
   * Sets the pose for a single view.  Objects rendered in this view will appear as though the camera is positioned using the given pose.
   * 
   * Up to 6 views are supported.  When rendering to the headset, views are changed to match the eye positions.  These view poses are also available using `lovr.headset.getViewPose`.
   * 
   * `Pass.setViewPose(view, x, y, z, angle, ax, ay, az)`
   * 
   * Set the pose of the view using numbers.
   * 
   * @param view - The index of the view to update.
   * @param x - The x position of the viewer, in meters.
   * @param y - The y position of the viewer, in meters.
   * @param z - The z position of the viewer, in meters.
   * @param angle - The number of radians the viewer is rotated around its axis of rotation.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   */
  setViewPose(view: number, x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number): void

  /**
   * Sets the pose for a single view.  Objects rendered in this view will appear as though the camera is positioned using the given pose.
   * 
   * Up to 6 views are supported.  When rendering to the headset, views are changed to match the eye positions.  These view poses are also available using `lovr.headset.getViewPose`.
   * 
   * `Pass.setViewPose(view, position, orientation)`
   * 
   * Set the pose of the view using vectors.
   * 
   * @param view - The index of the view to update.
   * @param position - The position of the viewer, in meters.
   * @param orientation - The orientation of the viewer.
   */
  setViewPose(view: number, position: vector, orientation: quaternion): void

  /**
   * Sets the pose for a single view.  Objects rendered in this view will appear as though the camera is positioned using the given pose.
   * 
   * Up to 6 views are supported.  When rendering to the headset, views are changed to match the eye positions.  These view poses are also available using `lovr.headset.getViewPose`.
   * 
   * `Pass.setViewPose(view, matrix, inverted)`
   * 
   * Set the pose of the view using a matrix.
   * 
   * @param view - The index of the view to update.
   * @param matrix - A matrix containing the viewer pose.
   * @param inverted - Whether the matrix is an inverted pose (a view matrix).
   */
  setViewPose(view: number, matrix: Mat4, inverted: boolean): void

  /**
   * Sets the viewport.  Everything rendered will get mapped to the rectangle defined by the viewport.  More specifically, this defines the transformation from normalized device coordinates to pixel coordinates.
   * 
   * `Pass.setViewport(x, y, w, h, dmin, dmax)`
   * 
   * @param x - The x coordinate of the upper-left corner of the viewport.
   * @param y - The y coordinate of the upper-left corner of the viewport.
   * @param w - The width of the viewport.  Must be positive.
   * @param h - The height of the viewport.  May be negative.
   * @param dmin - The min component of the depth range, between 0 and 1.
   * @param dmax - The max component of the depth range, between 0 and 1.
   * 
   * The viewport rectangle can use floating point numbers.
   * 
   * A negative viewport height (with a y coordinate equal to the bottom of the viewport) can be used to flip the rendering vertically.
   * 
   * The default viewport extends from `(0, 0)` to the dimensions of the canvas, with min depth and max depth respectively set to 0 and 1.
   */
  setViewport(x: number, y: number, w: number, h: number, dmin?: number, dmax?: number): void

  /**
   * Sets the viewport.  Everything rendered will get mapped to the rectangle defined by the viewport.  More specifically, this defines the transformation from normalized device coordinates to pixel coordinates.
   * 
   * `Pass.setViewport()`
   * 
   * Disable the viewport.
   * 
   * The viewport rectangle can use floating point numbers.
   * 
   * A negative viewport height (with a y coordinate equal to the bottom of the viewport) can be used to flip the rendering vertically.
   * 
   * The default viewport extends from `(0, 0)` to the dimensions of the canvas, with min depth and max depth respectively set to 0 and 1.
   */
  setViewport(): void

  /**
   * Sets whether vertices in the clockwise or counterclockwise order vertices are considered the "front" face of a triangle.  This is used for culling with `Pass:setCullMode`.
   * 
   * `Pass.setWinding(winding)`
   * 
   * @param winding - Whether triangle vertices are ordered `clockwise` or `counterclockwise`.
   * 
   * The default winding is counterclockwise.  LÖVR's builtin shapes are wound counterclockwise.
   */
  setWinding(winding: Winding): void

  /**
   * Enables or disables wireframe rendering.  This will draw all triangles as lines while active. It's intended to be used for debugging, since it usually has a performance cost.
   * 
   * `Pass.setWireframe(enable)`
   * 
   * @param enable - Whether wireframe rendering should be enabled.
   * 
   * Wireframe rendering is disabled by default.
   * 
   * There is currently no way to change the thickness of the lines.
   */
  setWireframe(enable: boolean): void

  /**
   * Draws a skybox.
   * 
   * `Pass.skybox(skybox)`
   * 
   * @param skybox - The skybox to render.  Its `TextureType` can be `cube` to render as a cubemap, or `2d` to render as an equirectangular (spherical) 2D image.
   * 
   * The skybox will be rotated based on the camera rotation.
   * 
   * The skybox is drawn using a fullscreen triangle.
   * 
   * The skybox uses a custom shader, so set the shader to `nil` before calling this function (unless explicitly using a custom shader).
   */
  skybox(skybox: Texture): void

  /**
   * Draws a skybox.
   * 
   * `Pass.skybox()`
   * 
   * The skybox will be rotated based on the camera rotation.
   * 
   * The skybox is drawn using a fullscreen triangle.
   * 
   * The skybox uses a custom shader, so set the shader to `nil` before calling this function (unless explicitly using a custom shader).
   */
  skybox(): void

  /**
   * Draws a sphere
   * 
   * `Pass.sphere(x, y, z, radius, angle, ax, ay, az, longitudes, latitudes)`
   * 
   * @param x - The x coordinate of the center of the sphere.
   * @param y - The y coordinate of the center of the sphere.
   * @param z - The z coordinate of the center of the sphere.
   * @param radius - The radius of the sphere.
   * @param angle - The rotation of the sphere around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param longitudes - The number of "horizontal" segments.
   * @param latitudes - The number of "vertical" segments.
   * 
   * The local origin of the sphere is in its center.
   */
  sphere(x?: number, y?: number, z?: number, radius?: number, angle?: number, ax?: number, ay?: number, az?: number, longitudes?: number, latitudes?: number): void

  /**
   * Draws a sphere
   * 
   * `Pass.sphere(position, radius, orientation, longitudes, latitudes)`
   * 
   * @param position - The position of the sphere.
   * @param radius - The radius of the sphere.
   * @param orientation - The orientation of the sphere.
   * @param longitudes - The number of "horizontal" segments.
   * @param latitudes - The number of "vertical" segments.
   * 
   * The local origin of the sphere is in its center.
   */
  sphere(position: vector, radius: number, orientation: quaternion, longitudes?: number, latitudes?: number): void

  /**
   * Draws a sphere
   * 
   * `Pass.sphere(transform, longitudes, latitudes)`
   * 
   * @param transform - The transform of the sphere.
   * @param longitudes - The number of "horizontal" segments.
   * @param latitudes - The number of "vertical" segments.
   * 
   * The local origin of the sphere is in its center.
   */
  sphere(transform: Mat4, longitudes?: number, latitudes?: number): void

  /**
   * Draws text.  The font can be changed using `Pass:setFont`.
   * 
   * `Pass.text(text, x, y, z, scale, angle, ax, ay, az, wrap, halign, valign)`
   * 
   * @param text - The text to render.
   * @param x - The x coordinate of the text origin.
   * @param y - The y coordinate of the text origin.
   * @param z - The z coordinate of the text origin.
   * @param scale - The scale of the text (with the default pixel density, units are meters).
   * @param angle - The rotation of the text around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param wrap - The maximum width of each line in meters (before scale is applied).  When zero, the text will not wrap.
   * @param halign - The horizontal alignment relative to the text origin.
   * @param valign - The vertical alignment relative to the text origin.
   * 
   * UTF-8 encoded strings are supported.
   * 
   * Newlines will start a new line of text.  Tabs will be rendered as four spaces.  Carriage returns are ignored.
   * 
   * With the default font pixel density, a scale of 1.0 makes the text height 1 meter.
   * 
   * The wrap value does not take into account the text's scale.
   * 
   * Text rendering requires a special shader, which will only be automatically used when the active shader is set to `nil`.
   * 
   * Blending should be enabled when rendering text (it's on by default).
   * 
   * This function can draw up to 16384 visible characters at a time, and will currently throw an error if the string is too long.
   */
  text(text: string, x?: number, y?: number, z?: number, scale?: number, angle?: number, ax?: number, ay?: number, az?: number, wrap?: number, halign?: HorizontalAlign, valign?: VerticalAlign): void

  /**
   * Draws text.  The font can be changed using `Pass:setFont`.
   * 
   * `Pass.text(text, position, scale, orientation, wrap, halign, valign)`
   * 
   * @param text - The text to render.
   * @param position - The position of the text.
   * @param scale - The scale of the text (with the default pixel density, units are meters).
   * @param orientation - The orientation of the text.
   * @param wrap - The maximum width of each line in meters (before scale is applied).  When zero, the text will not wrap.
   * @param halign - The horizontal alignment relative to the text origin.
   * @param valign - The vertical alignment relative to the text origin.
   * 
   * UTF-8 encoded strings are supported.
   * 
   * Newlines will start a new line of text.  Tabs will be rendered as four spaces.  Carriage returns are ignored.
   * 
   * With the default font pixel density, a scale of 1.0 makes the text height 1 meter.
   * 
   * The wrap value does not take into account the text's scale.
   * 
   * Text rendering requires a special shader, which will only be automatically used when the active shader is set to `nil`.
   * 
   * Blending should be enabled when rendering text (it's on by default).
   * 
   * This function can draw up to 16384 visible characters at a time, and will currently throw an error if the string is too long.
   */
  text(text: string, position: vector, scale: number, orientation: quaternion, wrap?: number, halign?: HorizontalAlign, valign?: VerticalAlign): void

  /**
   * Draws text.  The font can be changed using `Pass:setFont`.
   * 
   * `Pass.text(text, transform, wrap, halign, valign)`
   * 
   * @param text - The text to render.
   * @param transform - The transform of the text.
   * @param wrap - The maximum width of each line in meters (before scale is applied).  When zero, the text will not wrap.
   * @param halign - The horizontal alignment relative to the text origin.
   * @param valign - The vertical alignment relative to the text origin.
   * 
   * UTF-8 encoded strings are supported.
   * 
   * Newlines will start a new line of text.  Tabs will be rendered as four spaces.  Carriage returns are ignored.
   * 
   * With the default font pixel density, a scale of 1.0 makes the text height 1 meter.
   * 
   * The wrap value does not take into account the text's scale.
   * 
   * Text rendering requires a special shader, which will only be automatically used when the active shader is set to `nil`.
   * 
   * Blending should be enabled when rendering text (it's on by default).
   * 
   * This function can draw up to 16384 visible characters at a time, and will currently throw an error if the string is too long.
   */
  text(text: string, transform: Mat4, wrap?: number, halign?: HorizontalAlign, valign?: VerticalAlign): void

  /**
   * Draws text.  The font can be changed using `Pass:setFont`.
   * 
   * `Pass.text(colortext, x, y, z, scale, angle, ax, ay, az, wrap, halign, valign)`
   * 
   * Renders multicolor text.
   * 
   * @param colortext - A table of strings with colors to render, in the form `{ color1, string1, color2, string2 }`, where color is a `Vec3`, `Vec4`, hexcode, or table of numbers.
   * @param x - The x coordinate of the text origin.
   * @param y - The y coordinate of the text origin.
   * @param z - The z coordinate of the text origin.
   * @param scale - The scale of the text (with the default pixel density, units are meters).
   * @param angle - The rotation of the text around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param wrap - The maximum width of each line in meters (before scale is applied).  When zero, the text will not wrap.
   * @param halign - The horizontal alignment relative to the text origin.
   * @param valign - The vertical alignment relative to the text origin.
   * 
   * UTF-8 encoded strings are supported.
   * 
   * Newlines will start a new line of text.  Tabs will be rendered as four spaces.  Carriage returns are ignored.
   * 
   * With the default font pixel density, a scale of 1.0 makes the text height 1 meter.
   * 
   * The wrap value does not take into account the text's scale.
   * 
   * Text rendering requires a special shader, which will only be automatically used when the active shader is set to `nil`.
   * 
   * Blending should be enabled when rendering text (it's on by default).
   * 
   * This function can draw up to 16384 visible characters at a time, and will currently throw an error if the string is too long.
   */
  text(colortext: LuaTable, x?: number, y?: number, z?: number, scale?: number, angle?: number, ax?: number, ay?: number, az?: number, wrap?: number, halign?: HorizontalAlign, valign?: VerticalAlign): void

  /**
   * Draws text.  The font can be changed using `Pass:setFont`.
   * 
   * `Pass.text(colortext, position, scale, orientation, wrap, halign, valign)`
   * 
   * Renders multicolor text.
   * 
   * @param colortext - A table of strings with colors to render, in the form `{ color1, string1, color2, string2 }`, where color is a `Vec3`, `Vec4`, hexcode, or table of numbers.
   * @param position - The position of the text.
   * @param scale - The scale of the text (with the default pixel density, units are meters).
   * @param orientation - The orientation of the text.
   * @param wrap - The maximum width of each line in meters (before scale is applied).  When zero, the text will not wrap.
   * @param halign - The horizontal alignment relative to the text origin.
   * @param valign - The vertical alignment relative to the text origin.
   * 
   * UTF-8 encoded strings are supported.
   * 
   * Newlines will start a new line of text.  Tabs will be rendered as four spaces.  Carriage returns are ignored.
   * 
   * With the default font pixel density, a scale of 1.0 makes the text height 1 meter.
   * 
   * The wrap value does not take into account the text's scale.
   * 
   * Text rendering requires a special shader, which will only be automatically used when the active shader is set to `nil`.
   * 
   * Blending should be enabled when rendering text (it's on by default).
   * 
   * This function can draw up to 16384 visible characters at a time, and will currently throw an error if the string is too long.
   */
  text(colortext: LuaTable, position: vector, scale: number, orientation: quaternion, wrap?: number, halign?: HorizontalAlign, valign?: VerticalAlign): void

  /**
   * Draws text.  The font can be changed using `Pass:setFont`.
   * 
   * `Pass.text(colortext, transform, wrap, halign, valign)`
   * 
   * Renders multicolor text.
   * 
   * @param colortext - A table of strings with colors to render, in the form `{ color1, string1, color2, string2 }`, where color is a `Vec3`, `Vec4`, hexcode, or table of numbers.
   * @param transform - The transform of the text.
   * @param wrap - The maximum width of each line in meters (before scale is applied).  When zero, the text will not wrap.
   * @param halign - The horizontal alignment relative to the text origin.
   * @param valign - The vertical alignment relative to the text origin.
   * 
   * UTF-8 encoded strings are supported.
   * 
   * Newlines will start a new line of text.  Tabs will be rendered as four spaces.  Carriage returns are ignored.
   * 
   * With the default font pixel density, a scale of 1.0 makes the text height 1 meter.
   * 
   * The wrap value does not take into account the text's scale.
   * 
   * Text rendering requires a special shader, which will only be automatically used when the active shader is set to `nil`.
   * 
   * Blending should be enabled when rendering text (it's on by default).
   * 
   * This function can draw up to 16384 visible characters at a time, and will currently throw an error if the string is too long.
   */
  text(colortext: LuaTable, transform: Mat4, wrap?: number, halign?: HorizontalAlign, valign?: VerticalAlign): void

  /**
   * Draws a torus.
   * 
   * `Pass.torus(x, y, z, radius, thickness, angle, ax, ay, az, tsegments, psegments)`
   * 
   * @param x - The x coordinate of the center of the torus.
   * @param y - The y coordinate of the center of the torus.
   * @param z - The z coordinate of the center of the torus.
   * @param radius - The radius of the torus.
   * @param thickness - The thickness of the torus.
   * @param angle - The rotation of the torus around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param tsegments - The number of toroidal (circular) segments to render.
   * @param psegments - The number of poloidal (tubular) segments to render.
   * 
   * The local origin is in the center of the torus, and the torus forms a circle around the local Z axis.
   */
  torus(x?: number, y?: number, z?: number, radius?: number, thickness?: number, angle?: number, ax?: number, ay?: number, az?: number, tsegments?: number, psegments?: number): void

  /**
   * Draws a torus.
   * 
   * `Pass.torus(position, scale, orientation, tsegments, psegments)`
   * 
   * @param position - The position of the center of the torus.
   * @param scale - The size of the torus (x and y scale the radius, z is the thickness).
   * @param orientation - The orientation of the torus.
   * @param tsegments - The number of toroidal (circular) segments to render.
   * @param psegments - The number of poloidal (tubular) segments to render.
   * 
   * The local origin is in the center of the torus, and the torus forms a circle around the local Z axis.
   */
  torus(position: vector, scale: vector, orientation: quaternion, tsegments?: number, psegments?: number): void

  /**
   * Draws a torus.
   * 
   * `Pass.torus(transform, tsegments, psegments)`
   * 
   * @param transform - The transform of the torus.
   * @param tsegments - The number of toroidal (circular) segments to render.
   * @param psegments - The number of poloidal (tubular) segments to render.
   * 
   * The local origin is in the center of the torus, and the torus forms a circle around the local Z axis.
   */
  torus(transform: Mat4, tsegments?: number, psegments?: number): void

  /**
   * Transforms the coordinate system.
   * 
   * `Pass.transform(x, y, z, sx, sy, sz, angle, ax, ay, az)`
   * 
   * Transform the coordinate system using numbers.
   * 
   * @param x - The x component of the translation.
   * @param y - The y component of the translation.
   * @param z - The z component of the translation.
   * @param sx - The x component of the scale.
   * @param sy - The y component of the scale.
   * @param sz - The z component of the scale.
   * @param angle - The amount to rotate the coordinate system by, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   */
  transform(x: number, y: number, z: number, sx: number, sy: number, sz: number, angle: number, ax: number, ay: number, az: number): void

  /**
   * Transforms the coordinate system.
   * 
   * `Pass.transform(translation, scale, rotation)`
   * 
   * Transform the coordinate system using vector types.
   * 
   * @param translation - The translation to apply.
   * @param scale - The scale to apply.
   * @param rotation - A quaternion containing the rotation to apply.
   */
  transform(translation: vector, scale: vector, rotation: quaternion): void

  /**
   * Transforms the coordinate system.
   * 
   * `Pass.transform(transform)`
   * 
   * Transform the coordinate system using a matrix.
   * 
   * @param transform - A matrix containing the transformation to apply.
   */
  transform(transform: Mat4): void

  /**
   * Translates the coordinate system.
   * 
   * `Pass.translate(x, y, z)`
   * 
   * Translate the coordinate system using numbers.
   * 
   * @param x - The x component of the translation.
   * @param y - The y component of the translation.
   * @param z - The z component of the translation.
   * 
   * Order matters when scaling, translating, and rotating the coordinate system.
   */
  translate(x: number, y: number, z: number): void

  /**
   * Translates the coordinate system.
   * 
   * `Pass.translate(translation)`
   * 
   * Translate the coordinate system using a vector.
   * 
   * @param translation - The translation.
   * 
   * Order matters when scaling, translating, and rotating the coordinate system.
   */
  translate(translation: vector): void

}

/** Readbacks track the progress of an asynchronous read of a `Buffer` or `Texture`.  The Readback can be polled for completion or the CPU with `Readback:isComplete`, or you can wait for it to finish using `Readback:wait`. */
declare interface Readback extends LovrObject {
  /**
   * Returns the Readback's data as a Blob.
   * 
   * `blob = Readback.getBlob()`
   * 
   * @returns The Blob.
   * 
   * If the Readback is reading back a Texture, returns `nil`.
   */
  getBlob(): Blob

  /**
   * Returns the data from the Readback, as a table.  See `Buffer:getData` for the way the table is structured.
   * 
   * `data = Readback.getData()`
   * 
   * @returns A table containing the data that was read back.
   * 
   * This returns `nil` for readbacks of `Texture` objects.
   */
  getData(): LuaTable

  /**
   * Returns the Readback's data as an Image.
   * 
   * `image = Readback.getImage()`
   * 
   * @returns The Image.
   * 
   * If the Readback is not reading back a Texture, returns `nil`.
   */
  getImage(): Image

  /**
   * Returns whether the Readback has completed on the GPU and its data is available.
   * 
   * `complete = Readback.isComplete()`
   * 
   * @returns Whether the readback is complete.
   */
  isComplete(): boolean

  /**
   * Blocks the CPU until the Readback is finished on the GPU.
   * 
   * `waited = Readback.wait()`
   * 
   * @returns Whether the CPU had to be blocked for waiting.
   * 
   * If `lovr.graphics.submit` or `lovr.graphics.wait` has not been called since the readback was created, the readback has not been submitted yet, so no wait will occur and this function will return `false`.
   */
  wait(): boolean

}

/**
 * Samplers are objects that control how pixels are read from a texture.  They can control whether the pixels are smoothed, whether the texture wraps at the edge of its UVs, and more.
 * 
 * Each `Pass` has a default sampler that will be used by default, which can be changed using `Pass:setSampler`.  Also, samplers can be declared in shaders using the following syntax:
 * 
 *     uniform sampler mySampler;
 * 
 * A Sampler can be sent to the variable using `Pass:send('mySampler', sampler)`.
 * 
 * The properties of a Sampler are immutable, and can't be changed after it's created.
 */
declare interface Sampler extends LovrObject {
  /**
   * Returns the anisotropy level of the Sampler.  Anisotropy smooths out a texture's appearance when viewed at grazing angles.
   * 
   * `anisotropy = Sampler.getAnisotropy()`
   * 
   * @returns The anisotropy level of the sampler.
   * 
   * Not all GPUs support anisotropy.  The maximum anisotropy level is given by the `anisotropy` limit of `lovr.graphics.getLimits`, which may be zero.  It's very common for the maximum to be 16, however.
   */
  getAnisotropy(): number

  /**
   * Returns the compare mode of the Sampler.  This is a feature typically only used for shadow mapping.  Using a sampler with a compare mode requires it to be declared in a shader as a `samplerShadow` instead of a `sampler` variable, and used with a texture that has a depth format.  The result of sampling a depth texture with a shadow sampler is a number between 0 and 1, indicating the percentage of sampled pixels that passed the comparison.
   * 
   * `compare = Sampler.getCompareMode()`
   * 
   * @returns The compare mode of the sampler.
   */
  getCompareMode(): CompareMode

  /**
   * Returns the filter mode of the Sampler.
   * 
   * `[min, mag, mip] = Sampler.getFilter()`
   * 
   * @returns 
   * min - The filter mode used when the texture is minified.
   * mag - The filter mode used when the texture is magnified.
   * mip - The filter mode used to select a mipmap level.
   */
  getFilter(): LuaMultiReturn<[min: FilterMode, mag: FilterMode, mip: FilterMode]>

  /**
   * Returns the mipmap range of the Sampler.  This is used to clamp the range of mipmap levels that can be accessed from a texture.
   * 
   * `[min, max] = Sampler.getMipmapRange()`
   * 
   * @returns 
   * min - The minimum mipmap level that will be sampled (0 is the largest image).
   * max - The maximum mipmap level that will be sampled.
   */
  getMipmapRange(): LuaMultiReturn<[min: number, max: number]>

  /**
   * Returns the wrap mode of the sampler, used to wrap or clamp texture coordinates when the extend outside of the 0-1 range.
   * 
   * `[x, y, z] = Sampler.getWrap()`
   * 
   * @returns 
   * x - The wrap mode used in the horizontal direction.
   * y - The wrap mode used in the vertical direction.
   * z - The wrap mode used in the "z" direction, for 3D textures only.
   */
  getWrap(): LuaMultiReturn<[x: WrapMode, y: WrapMode, z: WrapMode]>

}

/** Shaders are small GPU programs.  See the `Shaders` guide for a full introduction to Shaders. */
declare interface Shader extends LovrObject {
  /**
   * Clones a shader.  This creates an inexpensive copy of it with different flags.  It can be used to create several variants of a shader with different behavior.
   * 
   * `shader = Shader.clone(source, flags)`
   * 
   * @param source - The Shader to clone.
   * @param flags - The flags used by the clone.
   * @returns The new Shader.
   */
  clone(source: Shader, flags: LuaTable): Shader

  /**
   * Returns the format of a buffer declared in shader code.  The return type matches the same syntax used by `lovr.graphics.newBuffer` and `Buffer:getFormat`, so it can be used to quickly create a Buffer that matches a variable from a Shader.
   * 
   * `[format, length] = Shader.getBufferFormat(name)`
   * 
   * @param name - The name of the buffer variable to return the format of.
   * @returns 
   * format - A list of fields that match the type declaration of the buffer in the shader code.  Each field has `name`, `type`, and `offset` keys.  If the field is an array, it will have `length` and `stride` keys as well.  The top-level table also has a `stride` key.  Offsets and strides are in bytes.
   * length - The number of items in the buffer (or 1 if the buffer is not an array).
   * 
   * If the buffer only has a single array field, the format will be "unwrapped" to an array instead of a single-field struct with an array in it.  Example:
   * 
   *     shader = lovr.graphics.newShader([[
   *       buffer Numbers {
   *         uint numbers[64];
   *       };
   * 
   *       void lovrmain(){}
   *     ]])
   * 
   *     shader:getBufferFormat('Numbers')
   *     -- returns {{ name = 'numbers', type = 'u32' }}, 64
   *     -- not     {{ name = 'numbers', type = 'u32', length = 64 }}, 1
   * 
   * Similarly, if the buffer only has a single struct field, the format will be "unwrapped" to the inner struct.  This lets you use a struct for a Buffer's data without having to wrap everything in an extra namespace.  Example:
   * 
   *     shader = lovr.graphics.newShader([[
   *       struct HandParams {
   *         vec3 pos;
   *         float grip;
   *       };
   * 
   *       buffer Hand {
   *         HandParams params;
   *       };
   * 
   *       void lovrmain(){}
   *     ]])
   * 
   *     shader:getBufferFormat('Hand')
   *     -- returns {{ name = 'pos', type = 'vec3' }, { name = 'grip', type = 'float' }}, 1
   *     -- not     {{ name = 'params', type = {...}}}, 1
   */
  getBufferFormat(name: string): LuaMultiReturn<[format: LuaTable, length: number]>

  /**
   * Returns the debug label of the Shader, which will show up when the Shader is printed and in some graphics debugging tools.  This is set when the Shader is created, and can't be changed afterwards.
   * 
   * `label = Shader.getLabel()`
   * 
   * @returns The label, or nil if none was set.
   */
  getLabel(): string

  /**
   * Returns whether the shader is a graphics or compute shader.
   * 
   * `type = Shader.getType()`
   * 
   * @returns The type of the Shader.
   */
  getType(): ShaderType

  /**
   * Returns the workgroup size of a compute shader.  The workgroup size defines how many times a compute shader is invoked for each workgroup dispatched by `Pass:compute`.
   * 
   * `[x, y, z] = Shader.getWorkgroupSize()`
   * 
   * @returns 
   * x - The x size of a workgroup.
   * y - The y size of a workgroup.
   * z - The z size of a workgroup.
   * 
   * For example, if the workgroup size is `8x8x1` and `16x16x16` workgroups are dispatched, then the compute shader will run `16 * 16 * 16 * (8 * 8 * 1) = 262144` times.
   * 
   * The maximum workgroup size is hardware-specific, and is given by the `workgroupSize` and `totalWorkgroupSize` limit in `lovr.graphics.getLimits`.
   */
  getWorkgroupSize(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns whether the Shader has a vertex attribute, by name or location.
   * 
   * `exists = Shader.hasAttribute(name)`
   * 
   * @param name - The name of an attribute.
   * @returns Whether the Shader has the attribute.
   */
  hasAttribute(name: string): boolean

  /**
   * Returns whether the Shader has a vertex attribute, by name or location.
   * 
   * `exists = Shader.hasAttribute(location)`
   * 
   * @param location - The location of an attribute.
   * @returns Whether the Shader has the attribute.
   */
  hasAttribute(location: number): boolean

  /**
   * Returns whether the Shader has a given stage.
   * 
   * `exists = Shader.hasStage(stage)`
   * 
   * @param stage - The stage.
   * @returns Whether the Shader has the stage.
   */
  hasStage(stage: ShaderStage): boolean

  /**
   * Returns whether the Shader has a variable.
   * 
   * `exists = Shader.hasVariable(name)`
   * 
   * @param name - The name of the variable to check.
   * @returns Whether the Shader has the variable.
   * 
   * This will return true if the variable is a buffer, texture, sampler, or other uniform variable (anything that can be sent with `Pass:send`).
   */
  hasVariable(name: string): boolean

}

/** Textures are multidimensional blocks of memory on the GPU, contrasted with `Buffer` objects which are one-dimensional.  Textures are used as the destination for rendering operations, and textures loaded from images provide surface data to `Material` objects. */
declare interface Texture extends LovrObject {
  /**
   * Clears layers and mipmaps in a texture to a given color.
   * 
   * When a Texture is being used as a canvas for a `Pass`, the clear color can be set with `Pass:setClear`, which a more efficient way to clear the texture before rendering.
   * 
   * `Texture.clear()`
   * 
   * Clear the whole texture to zero (transparent black).
   * 
   * The texture must have been created with the `transfer` usage to clear it.
   * 
   * The clear color will be interpreted as a linear color for sRGB formats.
   */
  clear(): void

  /**
   * Clears layers and mipmaps in a texture to a given color.
   * 
   * When a Texture is being used as a canvas for a `Pass`, the clear color can be set with `Pass:setClear`, which a more efficient way to clear the texture before rendering.
   * 
   * `Texture.clear(hex, layer, layerCount, mipmap, mipmapCount)`
   * 
   * @param hex - The hexcode color to clear to.
   * @param layer - The index of the first layer to clear.
   * @param layerCount - The number of layers to clear.  If nil, clears the rest of the layers.
   * @param mipmap - The index of the first mipmap to clear.
   * @param mipmapCount - The number of mipmaps to clear.  If nil, clears the rest of the mipmaps.
   * 
   * The texture must have been created with the `transfer` usage to clear it.
   * 
   * The clear color will be interpreted as a linear color for sRGB formats.
   */
  clear(hex: number, layer?: number, layerCount?: number, mipmap?: number, mipmapCount?: number): void

  /**
   * Clears layers and mipmaps in a texture to a given color.
   * 
   * When a Texture is being used as a canvas for a `Pass`, the clear color can be set with `Pass:setClear`, which a more efficient way to clear the texture before rendering.
   * 
   * `Texture.clear(r, g, b, a, layer, layerCount, mipmap, mipmapCount)`
   * 
   * @param r - The red component of the clear color.
   * @param g - The green component of the clear color.
   * @param b - The blue component of the clear color.
   * @param a - The alpha component of the clear color.
   * @param layer - The index of the first layer to clear.
   * @param layerCount - The number of layers to clear.  If nil, clears the rest of the layers.
   * @param mipmap - The index of the first mipmap to clear.
   * @param mipmapCount - The number of mipmaps to clear.  If nil, clears the rest of the mipmaps.
   * 
   * The texture must have been created with the `transfer` usage to clear it.
   * 
   * The clear color will be interpreted as a linear color for sRGB formats.
   */
  clear(r: number, g: number, b: number, a: number, layer?: number, layerCount?: number, mipmap?: number, mipmapCount?: number): void

  /**
   * Clears layers and mipmaps in a texture to a given color.
   * 
   * When a Texture is being used as a canvas for a `Pass`, the clear color can be set with `Pass:setClear`, which a more efficient way to clear the texture before rendering.
   * 
   * `Texture.clear(t, layer, layerCount, mipmap, mipmapCount)`
   * 
   * @param t - A table with color components.
   * @param layer - The index of the first layer to clear.
   * @param layerCount - The number of layers to clear.  If nil, clears the rest of the layers.
   * @param mipmap - The index of the first mipmap to clear.
   * @param mipmapCount - The number of mipmaps to clear.  If nil, clears the rest of the mipmaps.
   * 
   * The texture must have been created with the `transfer` usage to clear it.
   * 
   * The clear color will be interpreted as a linear color for sRGB formats.
   */
  clear(t: number[], layer?: number, layerCount?: number, mipmap?: number, mipmapCount?: number): void

  /**
   * Clears layers and mipmaps in a texture to a given color.
   * 
   * When a Texture is being used as a canvas for a `Pass`, the clear color can be set with `Pass:setClear`, which a more efficient way to clear the texture before rendering.
   * 
   * `Texture.clear(v3, layer, layerCount, mipmap, mipmapCount)`
   * 
   * @param v3 - A vec3 with the clear color.
   * @param layer - The index of the first layer to clear.
   * @param layerCount - The number of layers to clear.  If nil, clears the rest of the layers.
   * @param mipmap - The index of the first mipmap to clear.
   * @param mipmapCount - The number of mipmaps to clear.  If nil, clears the rest of the mipmaps.
   * 
   * The texture must have been created with the `transfer` usage to clear it.
   * 
   * The clear color will be interpreted as a linear color for sRGB formats.
   */
  clear(v3: vector, layer?: number, layerCount?: number, mipmap?: number, mipmapCount?: number): void

  /**
   * Clears layers and mipmaps in a texture to a given color.
   * 
   * When a Texture is being used as a canvas for a `Pass`, the clear color can be set with `Pass:setClear`, which a more efficient way to clear the texture before rendering.
   * 
   * `Texture.clear(v4, layer, layerCount, mipmap, mipmapCount)`
   * 
   * @param v4 - A vec4 with the clear color.
   * @param layer - The index of the first layer to clear.
   * @param layerCount - The number of layers to clear.  If nil, clears the rest of the layers.
   * @param mipmap - The index of the first mipmap to clear.
   * @param mipmapCount - The number of mipmaps to clear.  If nil, clears the rest of the mipmaps.
   * 
   * The texture must have been created with the `transfer` usage to clear it.
   * 
   * The clear color will be interpreted as a linear color for sRGB formats.
   */
  clear(v4: vector, layer?: number, layerCount?: number, mipmap?: number, mipmapCount?: number): void

  /**
   * Regenerates mipmap levels of a texture.  This downscales pixels from the texture to progressively smaller sizes and saves them.  If the texture is drawn at a smaller scale later, the mipmaps are used, which smooths out the appearance and improves performance.
   * 
   * `Texture.generateMipmaps(base, count)`
   * 
   * @param base - The base mipmap level which will be used to generate subsequent mipmaps.
   * @param count - The number of mipmap levels to generate.  If nil, the rest of the mipmaps will be generated.
   * 
   * Mipmaps will automatically be regenerated for textures after rendering to them in a `Pass`. This can be disabled by rendering to a single-level texture view instead.
   * 
   * The texture must have been created with the `transfer` usage to mipmap it.
   * 
   * The texture can not be multisampled.
   * 
   * Texture views can not currently be mipmapped.
   */
  generateMipmaps(base?: number, count?: number): void

  /**
   * Returns the width, height, and depth of the Texture.
   * 
   * `[width, height, layers] = Texture.getDimensions()`
   * 
   * @returns 
   * width - The width of the Texture.
   * height - The height of the Texture.
   * layers - The number of layers in the Texture.
   */
  getDimensions(): LuaMultiReturn<[width: number, height: number, layers: number]>

  /**
   * Returns the format of the texture.
   * 
   * `[format, linear] = Texture.getFormat()`
   * 
   * @returns 
   * format - The format of the Texture.
   * linear - Whether the format is linear or srgb.
   */
  getFormat(): LuaMultiReturn<[format: TextureFormat, linear: boolean]>

  /**
   * Returns the height of the Texture, in pixels.
   * 
   * `height = Texture.getHeight()`
   * 
   * @returns The height of the Texture, in pixels.
   */
  getHeight(): number

  /**
   * Returns the debug label of the Texture, which will show up when the Texture is printed and in some graphics debugging tools.  This is set when the Texture is created, and can't be changed afterwards.
   * 
   * `label = Texture.getLabel()`
   * 
   * @returns The label, or nil if none was set.
   */
  getLabel(): string

  /**
   * Returns the layer count of the Texture.  2D textures always have 1 layer and cubemaps always have a layer count divisible by 6.  3D and array textures have a variable number of layers.
   * 
   * `layers = Texture.getLayerCount()`
   * 
   * @returns The layer count of the Texture.
   */
  getLayerCount(): number

  /**
   * Returns the number of mipmap levels in the Texture.
   * 
   * `mipmaps = Texture.getMipmapCount()`
   * 
   * @returns The number of mipmap levels in the Texture.
   */
  getMipmapCount(): number

  /**
   * Creates and returns a new `Image` object with the current pixels of the Texture.  This function is very very slow because it stalls the CPU until the download is complete.  It should only be used for debugging, non-interactive scripts, etc.  For an asynchronous version that doesn't stall the CPU, see `Texture:newReadback`.
   * 
   * `image = Texture.getPixels(x, y, layer, mipmap, width, height)`
   * 
   * @param x - The x offset of the region to download.
   * @param y - The y offset of the region to download.
   * @param layer - The index of the layer to download.
   * @param mipmap - The index of the mipmap level to download.
   * @param width - The width of the pixel rectangle to download.  If nil, the "rest" of the width will be used, based on the texture width and x offset.
   * @param height - The height of the pixel rectangle to download.  If nil, the "rest" of the height will be used, based on the texture height and y offset.
   * @returns The new image with the pixels.
   * 
   * The texture must have been created with the `transfer` usage.
   * 
   * Multisampled textures can not be read back.
   * 
   * It is not currently possible to read back a texture view.
   */
  getPixels(x?: number, y?: number, layer?: number, mipmap?: number, width?: number, height?: number): Image

  /**
   * Returns the number of samples in the texture.  Multiple samples are used for multisample antialiasing when rendering to the texture.  Currently, the sample count is either 1 (not antialiased) or 4 (antialiased).
   * 
   * `samples = Texture.getSampleCount()`
   * 
   * @returns The number of samples in the Texture.
   */
  getSampleCount(): number

  /**
   * Returns the Sampler object previously assigned with `Texture:setSampler`.
   * 
   * This API is experimental, and subject to change in the future!
   * 
   * `sampler = Texture.getSampler()`
   * 
   * @returns The Sampler object.
   */
  getSampler(): Sampler

  /**
   * Returns the type of the texture.
   * 
   * `type = Texture.getType()`
   * 
   * @returns The type of the Texture.
   */
  getType(): TextureType

  /**
   * Returns the width of the Texture, in pixels.
   * 
   * `width = Texture.getWidth()`
   * 
   * @returns The width of the Texture, in pixels.
   */
  getWidth(): number

  /**
   * Returns whether a Texture was created with a set of `TextureUsage` flags.  Usage flags are specified when the Texture is created, and restrict what you can do with a Texture object.  By default, only the `sample` usage is enabled.  Applying a smaller set of usage flags helps LÖVR optimize things better.
   * 
   * `supported = Texture.hasUsage(...)`
   * 
   * @param ... - One or more usage flags.
   * @returns Whether the Texture has all the provided usage flags.
   */
  hasUsage(...rest: TextureUsage[]): boolean

  /**
   * Creates and returns a new `Readback` that will download the pixels in the Texture from VRAM. Once the readback is complete, `Readback:getImage` returns an `Image` with a CPU copy of the data.
   * 
   * `readback = Texture.newReadback(x, y, layer, mipmap, width, height)`
   * 
   * @param x - The x offset of the region to download.
   * @param y - The y offset of the region to download.
   * @param layer - The index of the layer to download.
   * @param mipmap - The index of the mipmap level to download.
   * @param width - The width of the pixel rectangle to download.  If nil, the "rest" of the width will be used, based on the texture width and x offset.
   * @param height - The height of the pixel rectangle to download.  If nil, the "rest" of the height will be used, based on the texture height and y offset.
   * @returns A new Readback object.
   * 
   * The texture must have been created with the `transfer` usage.
   * 
   * Multisampled textures can not be read back.
   * 
   * It is not currently possible to read back a texture view.
   */
  newReadback(x?: number, y?: number, layer?: number, mipmap?: number, width?: number, height?: number): Readback

  /**
   * Sets pixels in the texture.  The source data can be an `Image` with the pixels to upload, or another `Texture` object to copy from.
   * 
   * `Texture.setPixels(source, dstx, dsty, dstlayer, dstmipmap, srcx, srcy, srclayer, srcmipmap, width, height, layers)`
   * 
   * @param source - The source texture or image to copy to this texture.
   * @param dstx - The x offset to copy to.
   * @param dsty - The y offset to copy to.
   * @param dstlayer - The index of the layer to copy to.
   * @param dstmipmap - The index of the mipmap level to copy to.
   * @param srcx - The x offset to copy from.
   * @param srcy - The y offset to copy from.
   * @param srclayer - The index of the layer to copy from.
   * @param srcmipmap - The index of the mipmap level to copy from.
   * @param width - The width of the region of pixels to copy.  If nil, the maximum possible width will be used, based on the widths of the source/destination and the offset parameters.
   * @param height - The height of the region of pixels to copy.  If nil, the maximum possible height will be used, based on the heights of the source/destination and the offset parameters.
   * @param layers - The number of layers to copy.  If nil, copies as many layers as possible.
   * 
   * Note that calling `Texture:setPixels(Image)` will only update the first mipmap of the texture, leaving the other mipmaps as-is.  You may want to regenerate the texture's mipmaps afterwards by calling `Texture:generateMipmaps`, or disable mipmaps entirely by setting `mipmaps` to false in `lovr.graphics.newTexture`.
   * 
   * The destination and source textures must have been created with the `transfer` usage.
   * 
   * Images can't be copied to multisample textures.  Multisample textures can be copied between each other as long as there isn't any scaling.
   * 
   * Copying between textures requires them to have the same format.
   * 
   * When using different region sizes in a texture-to-texture copy:
   * 
   * - It is not possible to mix 3D with non-3D textures.
   * - Not every texture format is supported, use `lovr.graphics.isFormatSupported` to check.
   * - The formats do not need to match, unless they're depth formats.
   */
  setPixels(source: Texture | Image, dstx?: number, dsty?: number, dstlayer?: number, dstmipmap?: number, srcx?: number, srcy?: number, srclayer?: number, srcmipmap?: number, width?: number, height?: number, layers?: number): void

  /**
   * Sets sampler settings for the texture.  This can either be a `FilterMode` like `nearest`, or a `Sampler` object, which allows configuring all of the filtering and wrapping settings.
   * 
   * There are other ways of using custom samplers for a texture, but they have disadvantages:
   * 
   * - `Sampler` objects can be sent to shaders and used to sample from the texture, but this
   *   requires writing custom shader code and sending sampler objects with `Pass:send`, which is
   *   inconvenient.
   * - `Pass:setSampler` exists, but it applies to all textures in all draws in the Pass.  It doesn't
   *   allow for changing filtering settings on a per-texture basis.
   * 
   * This API is experimental, and subject to change in the future!
   * 
   * `Texture.setSampler(mode)`
   * 
   * @param mode - The FilterMode shaders will use when reading pixels from the texture.
   */
  setSampler(mode: FilterMode): void

  /**
   * Sets sampler settings for the texture.  This can either be a `FilterMode` like `nearest`, or a `Sampler` object, which allows configuring all of the filtering and wrapping settings.
   * 
   * There are other ways of using custom samplers for a texture, but they have disadvantages:
   * 
   * - `Sampler` objects can be sent to shaders and used to sample from the texture, but this
   *   requires writing custom shader code and sending sampler objects with `Pass:send`, which is
   *   inconvenient.
   * - `Pass:setSampler` exists, but it applies to all textures in all draws in the Pass.  It doesn't
   *   allow for changing filtering settings on a per-texture basis.
   * 
   * This API is experimental, and subject to change in the future!
   * 
   * `Texture.setSampler(sampler)`
   * 
   * @param sampler - The Sampler object shaders will use when reading pixels from the texture.
   */
  setSampler(sampler: Sampler): void

  /**
   * Sets sampler settings for the texture.  This can either be a `FilterMode` like `nearest`, or a `Sampler` object, which allows configuring all of the filtering and wrapping settings.
   * 
   * There are other ways of using custom samplers for a texture, but they have disadvantages:
   * 
   * - `Sampler` objects can be sent to shaders and used to sample from the texture, but this
   *   requires writing custom shader code and sending sampler objects with `Pass:send`, which is
   *   inconvenient.
   * - `Pass:setSampler` exists, but it applies to all textures in all draws in the Pass.  It doesn't
   *   allow for changing filtering settings on a per-texture basis.
   * 
   * This API is experimental, and subject to change in the future!
   * 
   * `Texture.setSampler()`
   * 
   * Remove the texture's sampler, instead using the one set by `Pass:setSampler`.
   */
  setSampler(): void

}

/**
 * Different types of input devices supported by the `lovr.headset` module.
 * 
 * The `grip` pose is used to render an object held in the user's hand.  It's positioned at the surface of the palm.  The X axis of the grip orientation is perpendicular to the palm, pointing away from the left palm or into the right palm.  If you imagine the hand holding a stick, the Z axis will be parallel to the stick.
 * 
 * <img src="/img/grip.svg" width="600" alt="Hand Grip Pose" class="flat"/>
 * 
 * *Image from the [OpenXR Specification](https://registry.khronos.org/OpenXR/specs/1.0/html/xrspec.html#_grip_pose)*
 * 
 * ---
 * 
 * The `point` pose is used to aim or point at objects.  It's usually positioned slightly in front of the hand or controller, and is oriented so the -Z axis points in a natural forward direction.
 * 
 * <img src="/img/aim.svg" width="600" alt="Hand Point Pose" class="flat"/>
 * 
 * *Image from the [OpenXR Specification](https://registry.khronos.org/OpenXR/specs/1.0/html/xrspec.html#_aim_pose)*
 * 
 * ---
 * 
 * The `pinch` pose is a stable point between the thumb and index finger on a hand, or a point slightly in front of a controller.  The -Z axis will point forward, away from the hand.  It's good for precise, close-range interaction.
 * 
 * <img src="/img/pinch.svg" width="600" alt="Hand Pinch Pose" class="flat"/>
 * 
 * *Image from the [OpenXR Specification](https://registry.khronos.org/OpenXR/specs/1.0/html/xrspec.html#_pinch_pose)*
 * 
 * ---
 * 
 * The `poke` pose is a position located at the tip of the index finger, or a point slightly in front of a controller.  The -Z axis will point forward out of the tip of the finger, the +Y axis will be perpendicular to the fingernail.
 * 
 * <img src="/img/poke.svg" width="600" alt="Hand Poke Pose" class="flat"/>
 * 
 * *Image from the [OpenXR Specification](https://registry.khronos.org/OpenXR/specs/1.0/html/xrspec.html#_poke_pose)*
 * 
 * ---
 * 
 * These "hand pose devices" do not report any button input with e.g. `lovr.headset.isDown`.  The main `hand/left` and `hand/right` devices should be used for buttons and haptics.
 */
declare type Device = 'head' | 'floor' | 'left' | 'right' | 'hand/left' | 'hand/right' | 'hand/left/grip' | 'hand/right/grip' | 'hand/left/point' | 'hand/right/point' | 'hand/left/pinch' | 'hand/right/pinch' | 'hand/left/poke' | 'hand/right/poke' | 'elbow/left' | 'elbow/right' | 'shoulder/left' | 'shoulder/right' | 'chest' | 'waist' | 'knee/left' | 'knee/right' | 'foot/left' | 'foot/right' | 'camera' | 'keyboard' | 'stylus' | 'eye/left' | 'eye/right' | 'eye/gaze'

/** Axes on an input device. */
declare type DeviceAxis = 'trigger' | 'thumbstick' | 'thumbrest' | 'touchpad' | 'grip' | 'nib'

/** Buttons on an input device. */
declare type DeviceButton = 'trigger' | 'thumbstick' | 'thumbrest' | 'touchpad' | 'grip' | 'menu' | 'a' | 'b' | 'x' | 'y' | 'nib'

/** The different levels of foveation supported by `lovr.headset.setFoveation`. */
declare type FoveationLevel = 'low' | 'medium' | 'high'

/**
 * These are all of the supported VR APIs that LÖVR can use to power the lovr.headset module.  You can change the order of headset drivers using `lovr.conf` to prefer or exclude specific VR APIs.
 * 
 * At startup, LÖVR searches through the list of drivers in order.
 */
declare type HeadsetDriver = 'simulator' | 'openxr'

/** Represents the different types of origins for coordinate spaces.  An origin of "floor" means that the origin is on the floor in the middle of a room-scale play area.  An origin of "head" means that no positional tracking is available, and consequently the origin is always at the position of the headset. */
declare type HeadsetOrigin = 'head' | 'floor'

/**
 * Different passthrough modes, set using `lovr.headset.setPassthrough`.
 * 
 * For best results, the `blend` and `add` modes should use a transparent background color, which can be changed with `lovr.graphics.setBackgroundColor`.
 */
declare type PassthroughMode = 'opaque' | 'blend' | 'add'

/**
 * A Layer is a textured plane placed in 3D space.  Layers are sent directly to the VR runtime and composited along with the rest of the 3D content.  This has several advantages compared to rendering the texture into the 3D scene with `Pass:draw`:
 * 
 * - Better tracking.  The VR runtime composites the texture later in the rendering process, using a more accurate head pose.
 * - Better resolution, less shimmery.  Regular 3D content must have lens distortion correction
 *   applied to it, whereas layers are composited after distortion correction, meaning they have a
 *   higher pixel density.  The layer can also use a higher resolution than the main headset
 *   texture, allowing for extra resolution on the 2D content without having to supersample all of
 *   the 3D rendering.
 * - Supersampling and sharpening effects.  Some headset runtimes (currently just Quest) can also
 *   supersample and sharpen layers.
 * 
 * Combined, all of this makes a massive difference in quality when rendering 2D content on a Layer, especially improving text readability.
 * 
 * Note that currently the VR simulator does not support layers.
 */
declare interface Layer extends LovrObject {
  /**
   * Returns the color of the layer.  This will tint the contents of its texture.  It can be used to fade the layer without re-rendering its texture, which is especially useful for layers created with the `static` option.
   * 
   * `[r, g, b, a] = Layer.getColor()`
   * 
   * @returns 
   * r - The red component of the color.
   * g - The green component of the color.
   * b - The blue component of the color.
   * a - The alpha component of the color.
   * 
   * The default color is white (all 1s).
   * 
   * Not every headset system supports layer colors.  See the `layerColor` property of `lovr.headset.getFeatures` to check for support.
   */
  getColor(): LuaMultiReturn<[r: number, g: number, b: number, a: number]>

  /**
   * Returns the curve of the layer.  Curving a layer renders it on a piece of a cylinder instead of a plane. The radius of the cylinder is `1 / curve` meters, so increasing the curve decreases the radius of the cylinder.
   * 
   * `curve = Layer.getCurve()`
   * 
   * @returns The curve of the layer.
   * 
   * When a layer is created, its curve is zero.
   * 
   * Not every headset system supports curved layers.  See the `layerCurve` property of `lovr.headset.getFeatures` to check for support.
   * 
   * No matter what the curve is, the center of the layer texture will always get rendered at the layer's pose.
   * 
   * The largest possible curve is `2 * math.pi / width`, where `width` is the width of the layer in meters.  This would cause the cylinder to fully wrap around.
   */
  getCurve(): number

  /**
   * Returns the width and height of the layer.  This is the size of the Layer's plane in meters, not the resolution of the layer's texture in pixels.
   * 
   * `[width, height] = Layer.getDimensions()`
   * 
   * @returns 
   * width - The width of the layer, in meters.
   * height - The height of the layer, in meters.
   * 
   * When a layer is created, its width and height are 1 meter.
   */
  getDimensions(): LuaMultiReturn<[width: number, height: number]>

  /**
   * Returns the orientation of the layer.
   * 
   * `[angle, ax, ay, az] = Layer.getOrientation()`
   * 
   * @returns 
   * angle - The amount of rotation around the axis of rotation, in radians.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getOrientation(): LuaMultiReturn<[angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the render pass for the layer.  This can be used to render to the layer.
   * 
   * `pass = Layer.getPass()`
   * 
   * @returns The layer's render pass.
   * 
   * This function will reset the Layer's render pass when it is called, as though `Pass:reset` was called.
   * 
   * The Pass will have its background color cleared to the background color, set using `lovr.graphics.setBackgroundColor`.
   * 
   * The Pass will have its view matrix set to the origin, and its projection will be set to an orthographic matrix where the top left of the texture is at the origin and the bottom right of the texture will be at `(width, height)` in pixels.
   */
  getPass(): Pass

  /**
   * Returns the position and orientation of the layer.
   * 
   * `[x, y, z, angle, ax, ay, az] = Layer.getPose()`
   * 
   * @returns 
   * x - The x position.
   * y - The y position.
   * z - The z position.
   * angle - The amount of rotation around the axis of rotation, in radians.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   * 
   * Units are in meters.
   */
  getPose(): LuaMultiReturn<[x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the position of the layer, in meters.
   * 
   * `[x, y, z] = Layer.getPosition()`
   * 
   * @returns 
   * x - The x position of the layer.
   * y - The y position of the layer.
   * z - The z position of the layer.
   */
  getPosition(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the texture for the layer.  This is the texture that will be pasted onto the layer.
   * 
   * `texture = Layer.getTexture()`
   * 
   * @returns The layer's texture.
   * 
   * This function may return a different `Texture` object each frame.  The return value should not be cached.
   * 
   * The texture will have the `rgba8` format, with `sample` and `render` usage flags.
   */
  getTexture(): Texture

  /**
   * Returns the viewport of the layer.  The viewport is a 2D region of pixels that the layer will display within its plane.
   * 
   * `[x, y, w, h] = Layer.getViewport()`
   * 
   * @returns 
   * x - The x coordinate of the upper-left corner of the viewport.
   * y - The y coordinate of the upper-left corner of the viewport.
   * w - The width of the viewport, in pixels.
   * h - The height of the viewport, in pixels.
   */
  getViewport(): LuaMultiReturn<[x: number, y: number, w: number, h: number]>

  /**
   * Sets the color of the layer.  This will tint the contents of its texture.  It can be used to fade the layer without re-rendering its texture, which is especially useful for layers created with the `static` option.
   * 
   * `Layer.setColor(r, g, b, a)`
   * 
   * @param r - The red component of the color.
   * @param g - The green component of the color.
   * @param b - The blue component of the color.
   * @param a - The alpha component of the color.
   * 
   * The default color is white (all 1s).
   * 
   * Not every headset system supports layer colors.  See the `layerColor` property of `lovr.headset.getFeatures` to check for support.
   */
  setColor(r: number, g: number, b: number, a?: number): void

  /**
   * Sets the color of the layer.  This will tint the contents of its texture.  It can be used to fade the layer without re-rendering its texture, which is especially useful for layers created with the `static` option.
   * 
   * `Layer.setColor(t)`
   * 
   * @param t - A table of 3 or 4 color components.
   * 
   * The default color is white (all 1s).
   * 
   * Not every headset system supports layer colors.  See the `layerColor` property of `lovr.headset.getFeatures` to check for support.
   */
  setColor(t: number[]): void

  /**
   * Sets the color of the layer.  This will tint the contents of its texture.  It can be used to fade the layer without re-rendering its texture, which is especially useful for layers created with the `static` option.
   * 
   * `Layer.setColor(hex, a)`
   * 
   * @param hex - A hexcode.
   * @param a - The alpha component of the color.
   * 
   * The default color is white (all 1s).
   * 
   * Not every headset system supports layer colors.  See the `layerColor` property of `lovr.headset.getFeatures` to check for support.
   */
  setColor(hex: number, a?: number): void

  /**
   * Sets the curve of the layer.  Curving a layer renders it on a piece of a cylinder instead of a plane. The radius of the cylinder is `1 / curve` meters, so increasing the curve decreases the radius of the cylinder.
   * 
   * `Layer.setCurve(curve)`
   * 
   * @param curve - The curve of the layer.  Negative values or zero means no curve.
   * 
   * When a layer is created, its curve is zero.
   * 
   * Not every headset system supports curved layers.  See the `layerCurve` property of `lovr.headset.getFeatures` to check for support.  If curved layers are not supported, this function will do nothing.
   * 
   * No matter what the curve is, the center of the layer texture will always get rendered at the layer's pose.
   * 
   * The largest possible curve is `2 * math.pi / width`, where `width` is the width of the layer in meters.  This would cause the cylinder to fully wrap around.
   */
  setCurve(curve?: number): void

  /**
   * Sets the width and height of the layer.  This is the size of the Layer's plane in meters, not not the resolution of the layer's texture in pixels.
   * 
   * `Layer.setDimensions(width, height)`
   * 
   * @param width - The width of the layer, in meters.
   * @param height - The height of the layer, in meters.
   * 
   * When a layer is created, its width and height are 1 meter.
   */
  setDimensions(width: number, height: number): void

  /**
   * Sets the orientation of the layer.
   * 
   * `Layer.setOrientation(angle, ax, ay, az)`
   * 
   * @param angle - The amount of rotation around the axis of rotation, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   */
  setOrientation(angle: number, ax: number, ay: number, az: number): void

  /**
   * Sets the orientation of the layer.
   * 
   * `Layer.setOrientation(orientation)`
   * 
   * @param orientation - The orientation of the layer.
   */
  setOrientation(orientation: quaternion): void

  /**
   * Sets the position and orientation of the layer.
   * 
   * `Layer.setPose(x, y, z, angle, ax, ay, az)`
   * 
   * @param x - The x position.
   * @param y - The y position.
   * @param z - The z position.
   * @param angle - The amount of rotation around the axis of rotation, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * 
   * Units are in meters.
   */
  setPose(x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number): void

  /**
   * Sets the position and orientation of the layer.
   * 
   * `Layer.setPose(position, orientation)`
   * 
   * @param position - The position of the layer.
   * @param orientation - The orientation of the layer.
   * 
   * Units are in meters.
   */
  setPose(position: vector, orientation: quaternion): void

  /**
   * Sets the position of the layer, in meters.
   * 
   * `Layer.setPosition(x, y, z)`
   * 
   * @param x - The x position of the layer.
   * @param y - The y position of the layer.
   * @param z - The z position of the layer.
   */
  setPosition(x: number, y: number, z: number): void

  /**
   * Sets the viewport of the layer.  The viewport is a 2D region of pixels that the layer will display within its plane.
   * 
   * `Layer.setViewport(x, y, w, h)`
   * 
   * @param x - The x coordinate of the upper-left corner of the viewport.
   * @param y - The y coordinate of the upper-left corner of the viewport.
   * @param w - The width of the viewport, in pixels.
   * @param h - The height of the viewport, in pixels.
   */
  setViewport(x: number, y: number, w: number, h: number): void

}

/**
 * A Curve is an object that represents a Bézier curve in three dimensions.  Curves are defined by an arbitrary number of control points (note that the curve only passes through the first and last control point).
 * 
 * Once a Curve is created with `lovr.math.newCurve`, you can use `Curve:evaluate` to get a point on the curve or `Curve:render` to get a list of all of the points on the curve.  These points can be passed directly to `Pass:points` or `Pass:line` to render the curve.
 * 
 * Note that for longer or more complicated curves (like in a drawing application) it can be easier to store the path as several Curve objects.
 */
declare interface Curve extends LovrObject {
  /**
   * Inserts a new control point into the Curve at the specified index.
   * 
   * `Curve.addPoint(x, y, z, index)`
   * 
   * @param x - The x coordinate of the control point.
   * @param y - The y coordinate of the control point.
   * @param z - The z coordinate of the control point.
   * @param index - The index to insert the control point at.  If nil, the control point is added to the end of the list of control points.
   * 
   * An error will be thrown if the index is less than one or more than the number of control points.
   */
  addPoint(x: number, y: number, z: number, index?: number): void

  /**
   * Returns a point on the Curve given a parameter `t` from 0 to 1.  0 will return the first control point, 1 will return the last point, .5 will return a point in the "middle" of the Curve, etc.
   * 
   * `[x, y, z] = Curve.evaluate(t)`
   * 
   * @param t - The parameter to evaluate the Curve at.
   * @returns 
   * x - The x position of the point.
   * y - The y position of the point.
   * z - The z position of the point.
   * 
   * An error will be thrown if `t` is not between 0 and 1, or if the Curve has less than two points.
   */
  evaluate(t: number): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns a control point of the Curve.
   * 
   * `[x, y, z] = Curve.getPoint(index)`
   * 
   * @param index - The index to retrieve.
   * @returns 
   * x - The x coordinate of the control point.
   * y - The y coordinate of the control point.
   * z - The z coordinate of the control point.
   * 
   * An error will be thrown if the index is less than one or more than the number of control points.
   */
  getPoint(index: number): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the number of control points in the Curve.
   * 
   * `count = Curve.getPointCount()`
   * 
   * @returns The number of control points.
   */
  getPointCount(): number

  /**
   * Returns a direction vector for the Curve given a parameter `t` from 0 to 1.  0 will return the direction at the first control point, 1 will return the direction at the last point, .5 will return the direction at the "middle" of the Curve, etc.
   * 
   * `[x, y, z] = Curve.getTangent(t)`
   * 
   * @param t - Where on the Curve to compute the direction.
   * @returns 
   * x - The x position of the point.
   * y - The y position of the point.
   * z - The z position of the point.
   * 
   * The direction vector returned by this function will have a length of one.
   */
  getTangent(t: number): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Removes a control point from the Curve.
   * 
   * `Curve.removePoint(index)`
   * 
   * @param index - The index of the control point to remove.
   * 
   * An error will be thrown if the index is less than one or more than the number of control points.
   */
  removePoint(index: number): void

  /**
   * Returns a list of points on the Curve.  The number of points can be specified to get a more or less detailed representation, and it is also possible to render a subsection of the Curve.
   * 
   * `t = Curve.render(n, t1, t2)`
   * 
   * @param n - The number of points to use.
   * @param t1 - How far along the curve to start rendering.
   * @param t2 - How far along the curve to stop rendering.
   * @returns A (flat) table of 3D points along the curve.
   */
  render(n?: number, t1?: number, t2?: number): number[]

  /**
   * Changes the position of a control point on the Curve.
   * 
   * `Curve.setPoint(index, x, y, z)`
   * 
   * @param index - The index to modify.
   * @param x - The new x coordinate.
   * @param y - The new y coordinate.
   * @param z - The new z coordinate.
   * 
   * An error will be thrown if the index is less than one or more than the number of control points.
   */
  setPoint(index: number, x: number, y: number, z: number): void

  /**
   * Returns a new Curve created by slicing the Curve at the specified start and end points.
   * 
   * `curve = Curve.slice(t1, t2)`
   * 
   * @param t1 - The starting point to slice at.
   * @param t2 - The ending point to slice at.
   * @returns A new Curve.
   * 
   * The new Curve will have the same number of control points as the existing curve.
   * 
   * An error will be thrown if t1 or t2 are not between 0 and 1, or if the Curve has less than two points.
   */
  slice(t1: number, t2: number): Curve

}

/** A `mat4` is a math type that holds 16 values in a 4x4 grid. */
declare interface Mat4 {
  /**
   * Returns whether a matrix is approximately equal to another matrix.
   * 
   * `equal = Mat4.equals(n)`
   * 
   * @param n - The other matrix.
   * @returns Whether the 2 matrices approximately equal each other.
   */
  equals(n: Mat4): boolean

  /**
   * Sets a projection matrix using raw projection angles and clipping planes.
   * 
   * This can be used for asymmetric or oblique projections.
   * 
   * `self = Mat4.fov(left, right, up, down, near, far)`
   * 
   * @param left - The left half-angle of the projection, in radians.
   * @param right - The right half-angle of the projection, in radians.
   * @param up - The top half-angle of the projection, in radians.
   * @param down - The bottom half-angle of the projection, in radians.
   * @param near - The near plane of the projection.
   * @param far - The far plane.  Zero is a special value that will set an infinite far plane with a reversed Z range, which improves depth buffer precision and is the default.
   * @returns The modified matrix.
   */
  fov(left: number, right: number, up: number, down: number, near: number, far?: number): Mat4

  /**
   * Returns the angle/axis rotation of the matrix.
   * 
   * `[angle, ax, ay, az] = Mat4.getOrientation()`
   * 
   * @returns 
   * angle - The number of radians the matrix rotates around its rotation axis.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getOrientation(): LuaMultiReturn<[angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the position and rotation of the matrix.
   * 
   * `[x, y, z, angle, ax, ay, az] = Mat4.getPose()`
   * 
   * @returns 
   * x - The x translation.
   * y - The y translation.
   * z - The z translation.
   * angle - The number of radians the matrix rotates around its rotation axis.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getPose(): LuaMultiReturn<[x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the translation of the matrix.  This is the last column of the matrix.
   * 
   * `[x, y, z] = Mat4.getPosition()`
   * 
   * @returns 
   * x - The x translation.
   * y - The y translation.
   * z - The z translation.
   */
  getPosition(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the scale factor of the matrix.
   * 
   * `[sx, sy, sz] = Mat4.getScale()`
   * 
   * @returns 
   * sx - The x scale.
   * sy - The y scale.
   * sz - The z scale.
   */
  getScale(): LuaMultiReturn<[sx: number, sy: number, sz: number]>

  /**
   * Resets the matrix to the identity, effectively setting its translation to zero, its scale to 1, and clearing any rotation.
   * 
   * `self = Mat4.identity()`
   * 
   * @returns The modified matrix.
   */
  identity(): Mat4

  /**
   * Inverts the matrix, causing it to represent the opposite of its old transform.
   * 
   * `self = Mat4.invert()`
   * 
   * @returns The inverted matrix.
   */
  invert(): Mat4

  /**
   * Sets a view transform matrix that moves and orients camera to look at a target point.
   * 
   * This is useful for changing camera position and orientation.
   * 
   * The lookAt() function produces same result as target() after matrix inversion.
   * 
   * `self = Mat4.lookAt(from, to, up)`
   * 
   * @param from - The position of the viewer.
   * @param to - The position of the target.
   * @param up - The up vector of the viewer.
   * @returns The modified matrix.
   */
  lookAt(from: vector, to: vector, up?: vector): Mat4

  /**
   * Multiplies this matrix by another value.  Multiplying by a matrix combines their two transforms together.  Multiplying by a vector applies the transformation from the matrix to the vector and returns the vector.
   * 
   * `self = Mat4.mul(n)`
   * 
   * @param n - The matrix.
   * @returns The modified matrix.
   * 
   * When multiplying by a vec4, the vector is treated as either a point if its w component is 1, or a direction vector if the w is 0 (the matrix translation won't be applied).
   */
  mul(n: Mat4): Mat4

  /**
   * Multiplies this matrix by another value.  Multiplying by a matrix combines their two transforms together.  Multiplying by a vector applies the transformation from the matrix to the vector and returns the vector.
   * 
   * `v3 = Mat4.mul(v3)`
   * 
   * @param v3 - A 3D vector, treated as a point.
   * @returns The transformed vector.
   * 
   * When multiplying by a vec4, the vector is treated as either a point if its w component is 1, or a direction vector if the w is 0 (the matrix translation won't be applied).
   */
  mul(v3: vector): vector

  /**
   * Multiplies this matrix by another value.  Multiplying by a matrix combines their two transforms together.  Multiplying by a vector applies the transformation from the matrix to the vector and returns the vector.
   * 
   * `v4 = Mat4.mul(v4)`
   * 
   * @param v4 - A 4D vector.
   * @returns The transformed vector.
   * 
   * When multiplying by a vec4, the vector is treated as either a point if its w component is 1, or a direction vector if the w is 0 (the matrix translation won't be applied).
   */
  mul(v4: vector): vector

  /**
   * Sets this matrix to represent an orthographic projection, useful for 2D/isometric rendering.
   * 
   * This can be used with `Pass:setProjection`, or it can be sent to a `Shader` for use in GLSL.
   * 
   * `self = Mat4.orthographic(left, right, bottom, top, near, far)`
   * 
   * @param left - The left edge of the projection.
   * @param right - The right edge of the projection.
   * @param bottom - The bottom edge of the projection.
   * @param top - The top edge of the projection.
   * @param near - The position of the near clipping plane.
   * @param far - The position of the far clipping plane.
   * @returns The modified matrix.
   */
  orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4

  /**
   * Sets this matrix to represent an orthographic projection, useful for 2D/isometric rendering.
   * 
   * This can be used with `Pass:setProjection`, or it can be sent to a `Shader` for use in GLSL.
   * 
   * `self = Mat4.orthographic(width, height, near, far)`
   * 
   * @param width - The width of the projection.
   * @param height - The height of the projection.
   * @param near - The position of the near clipping plane.
   * @param far - The position of the far clipping plane.
   * @returns The modified matrix.
   */
  orthographic(width: number, height: number, near: number, far: number): Mat4

  /**
   * Sets this matrix to represent a perspective projection.
   * 
   * This can be used with `Pass:setProjection`, or it can be sent to a `Shader` for use in GLSL.
   * 
   * `self = Mat4.perspective(fov, aspect, near, far)`
   * 
   * @param fov - The vertical field of view (in radians).
   * @param aspect - The horizontal aspect ratio of the projection (width / height).
   * @param near - The near plane.
   * @param far - The far plane.  Zero is a special value that will set an infinite far plane with a reversed Z range, which improves depth buffer precision and is the default.
   * @returns The modified matrix.
   */
  perspective(fov: number, aspect: number, near: number, far?: number): Mat4

  /**
   * Turns the matrix into a reflection matrix that transforms values as though they were reflected across a plane.
   * 
   * `self = Mat4.reflect(position, normal)`
   * 
   * @param position - The position of the plane.
   * @param normal - The normal vector of the plane.
   * @returns The reflected matrix.
   */
  reflect(position: vector, normal: vector): Mat4

  /**
   * Rotates the matrix using a quaternion or an angle/axis rotation.
   * 
   * `self = Mat4.rotate(q)`
   * 
   * @param q - The rotation to apply to the matrix.
   * @returns The rotated matrix.
   */
  rotate(q: quaternion): Mat4

  /**
   * Rotates the matrix using a quaternion or an angle/axis rotation.
   * 
   * `self = Mat4.rotate(angle, ax, ay, az)`
   * 
   * @param angle - The angle component of the angle/axis rotation (radians).
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @returns The rotated matrix.
   */
  rotate(angle: number, ax?: number, ay?: number, az?: number): Mat4

  /**
   * Scales the matrix.
   * 
   * `self = Mat4.scale(scale)`
   * 
   * @param scale - The 3D scale to apply.
   * @returns The modified matrix.
   */
  scale(scale: vector): Mat4

  /**
   * Scales the matrix.
   * 
   * `self = Mat4.scale(sx, sy, sz)`
   * 
   * @param sx - The x component of the scale to apply.
   * @param sy - The y component of the scale to apply.
   * @param sz - The z component of the scale to apply.
   * @returns The modified matrix.
   */
  scale(sx: number, sy?: number, sz?: number): Mat4

  /**
   * Sets the components of the matrix from separate position, rotation, and scale arguments or an existing matrix.
   * 
   * `m = Mat4.set()`
   * 
   * Resets the matrix to the identity matrix, without any translation, rotation, or scale.
   * 
   * @returns The input matrix.
   */
  set(): Mat4

  /**
   * Sets the components of the matrix from separate position, rotation, and scale arguments or an existing matrix.
   * 
   * `m = Mat4.set(n)`
   * 
   * Copies the values from an existing matrix.
   * 
   * @param n - An existing matrix to copy the values from.
   * @returns The input matrix.
   */
  set(n: Mat4): Mat4

  /**
   * Sets the components of the matrix from separate position, rotation, and scale arguments or an existing matrix.
   * 
   * `m = Mat4.set(x, y, z, sx, sy, sz, angle, ax, ay, az)`
   * 
   * Sets the position, scale, and rotation of the matrix using numbers.
   * 
   * @param x - The x component of the translation.
   * @param y - The y component of the translation.
   * @param z - The z component of the translation.
   * @param sx - The x component of the scale.
   * @param sy - The y component of the scale.
   * @param sz - The z component of the scale.
   * @param angle - The angle of the rotation, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @returns The input matrix.
   */
  set(x: number, y: number, z: number, sx: number, sy: number, sz: number, angle: number, ax: number, ay: number, az: number): Mat4

  /**
   * Sets the components of the matrix from separate position, rotation, and scale arguments or an existing matrix.
   * 
   * `m = Mat4.set(x, y, z, angle, ax, ay, az)`
   * 
   * Sets the pose (position and orientation) of the matrix using numbers.  The scale is set to 1 on all axes.
   * 
   * @param x - The x component of the translation.
   * @param y - The y component of the translation.
   * @param z - The z component of the translation.
   * @param angle - The angle of the rotation, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @returns The input matrix.
   */
  set(x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number): Mat4

  /**
   * Sets the components of the matrix from separate position, rotation, and scale arguments or an existing matrix.
   * 
   * `m = Mat4.set(position, scale, rotation)`
   * 
   * @param position - The translation of the matrix.
   * @param scale - The scale of the matrix.
   * @param rotation - The rotation of the matrix.
   * @returns The input matrix.
   */
  set(position: vector, scale: vector, rotation: quaternion): Mat4

  /**
   * Sets the components of the matrix from separate position, rotation, and scale arguments or an existing matrix.
   * 
   * `m = Mat4.set(position, rotation)`
   * 
   * @param position - The translation of the matrix.
   * @param rotation - The rotation of the matrix.
   * @returns The input matrix.
   */
  set(position: vector, rotation: quaternion): Mat4

  /**
   * Sets the components of the matrix from separate position, rotation, and scale arguments or an existing matrix.
   * 
   * `m = Mat4.set(...)`
   * 
   * Sets the raw components of the matrix using 16 numbers in column-major order.
   * 
   * @param ... - The raw values of the matrix, in column-major order.
   * @returns The input matrix.
   */
  set(...rest: number[]): Mat4

  /**
   * Sets the components of the matrix from separate position, rotation, and scale arguments or an existing matrix.
   * 
   * `m = Mat4.set(d)`
   * 
   * Sets the diagonal values to a number and everything else to 0.
   * 
   * @param d - A number to use for the diagonal elements.
   * @returns The input matrix.
   */
  set(d: number): Mat4

  /**
   * Sets a model transform matrix that moves to `from` and orients model towards `to` point.
   * 
   * This is used when rendered model should always point towards a point of interest. The resulting Mat4 object can be used as model pose.
   * 
   * The target() function produces same result as lookAt() after matrix inversion.
   * 
   * `self = Mat4.target(from, to, up)`
   * 
   * @param from - The position of the viewer.
   * @param to - The position of the target.
   * @param up - The up vector of the viewer.
   * @returns The modified matrix.
   */
  target(from: vector, to: vector, up?: vector): Mat4

  /**
   * Translates the matrix.
   * 
   * `self = Mat4.translate(v)`
   * 
   * @param v - The translation vector.
   * @returns The translated matrix.
   */
  translate(v: vector): Mat4

  /**
   * Translates the matrix.
   * 
   * `self = Mat4.translate(x, y, z)`
   * 
   * @param x - The x component of the translation.
   * @param y - The y component of the translation.
   * @param z - The z component of the translation.
   * @returns The translated matrix.
   */
  translate(x: number, y: number, z: number): Mat4

  /**
   * Transposes the matrix, mirroring its values along the diagonal.
   * 
   * `self = Mat4.transpose()`
   * 
   * @returns The transposed matrix.
   */
  transpose(): Mat4

  /**
   * Returns the components of matrix, either as 10 separated numbers representing the position, scale, and rotation, or as 16 raw numbers representing the individual components of the matrix in column-major order.
   * 
   * `... = Mat4.unpack(raw)`
   * 
   * @param raw - Whether to return the 16 raw components.
   * @returns The requested components of the matrix.
   */
  unpack(raw?: boolean): LuaMultiReturn<[...rest: number[]]>

}

///** A `quat` is a math type that represents a 3D rotation, stored as four numbers. */
//declare interface quaternion {
//  /**
//   * Conjugates the input quaternion in place, returning the input.  If the quaternion is normalized, this is the same as inverting it.  It negates the (x, y, z) components of the quaternion.
//   * 
//   * `self = Quat.conjugate()`
//   * 
//   * @returns The inverted quaternion.
//   */
//  conjugate(): quaternion
//
//  /**
//   * Creates a new temporary vec3 facing the forward direction, rotates it by this quaternion, and returns the vector.
//   * 
//   * `v = Quat.direction()`
//   * 
//   * @returns The direction vector.
//   */
//  direction(): vector
//
//  /**
//   * Returns whether a quaternion is approximately equal to another quaternion.
//   * 
//   * `equal = Quat.equals(r)`
//   * 
//   * @param r - The other quaternion.
//   * @returns Whether the 2 quaternions approximately equal each other.
//   */
//  equals(r: quaternion): boolean
//
//  /**
//   * Returns the euler angles of the quaternion, in YXZ order.
//   * 
//   * `[pitch, yaw, roll] = Quat.getEuler()`
//   * 
//   * @returns 
//   * pitch - The pitch (x axis rotation).
//   * yaw - The yaw (y axis rotation).
//   * roll - The roll (z axis rotation).
//   */
//  getEuler(): LuaMultiReturn<[pitch: number, yaw: number, roll: number]>
//
//  /**
//   * Returns the length of the quaternion.
//   * 
//   * `length = Quat.length()`
//   * 
//   * @returns The length of the quaternion.
//   */
//  length(): number
//
//  /**
//   * Multiplies this quaternion by another value.  If the value is a quaternion, the rotations in the two quaternions are applied sequentially and the result is stored in the first quaternion.  If the value is a vector, then the input vector is rotated by the quaternion and returned.
//   * 
//   * `self = Quat.mul(r)`
//   * 
//   * @param r - A quaternion to combine with the original.
//   * @returns The modified quaternion.
//   */
//  mul(r: quaternion): quaternion
//
//  /**
//   * Multiplies this quaternion by another value.  If the value is a quaternion, the rotations in the two quaternions are applied sequentially and the result is stored in the first quaternion.  If the value is a vector, then the input vector is rotated by the quaternion and returned.
//   * 
//   * `v3 = Quat.mul(v3)`
//   * 
//   * @param v3 - A vector to rotate.
//   * @returns The rotated vector.
//   */
//  mul(v3: vector): vector
//
//  /**
//   * Adjusts the values in the quaternion so that its length becomes 1.
//   * 
//   * `self = Quat.normalize()`
//   * 
//   * @returns The normalized quaternion.
//   * 
//   * A common source of bugs with quaternions is to forget to normalize them after performing a series of operations on them.  Try normalizing a quaternion if some of the calculations aren't working quite right!
//   */
//  normalize(): quaternion
//
//  ///**
//  // * Sets the components of the quaternion.  There are lots of different ways to specify the new components, the summary is:
//  // * 
//  // * - Four numbers can be used to specify an angle/axis rotation, similar to other LÖVR functions.
//  // * - Four numbers plus the fifth `raw` flag can be used to set the raw values of the quaternion.
//  // * - An existing quaternion can be passed in to copy its values.
//  // * - A single direction vector can be specified to turn its direction (relative to the default
//  // *   forward direction of "negative z") into a rotation.
//  // * - Two direction vectors can be specified to set the quaternion equal to the rotation between the
//  // *   two vectors.
//  // * - A matrix can be passed in to extract the rotation of the matrix into a quaternion.
//  // * 
//  // * `self = Quat.set(angle, ax, ay, az, raw)`
//  // * 
//  // * @param angle - The angle to use for the rotation, in radians.
//  // * @param ax - The x component of the axis of rotation.
//  // * @param ay - The y component of the axis of rotation.
//  // * @param az - The z component of the axis of rotation.
//  // * @param raw - Whether the components should be interpreted as raw `(x, y, z, w)` components.
//  // * @returns The modified quaternion.
//  // */
//  //set(angle?: number, ax?: number, ay?: number, az?: number, raw?: boolean): Quat
//
//  ///**
//  // * Sets the components of the quaternion.  There are lots of different ways to specify the new components, the summary is:
//  // * 
//  // * - Four numbers can be used to specify an angle/axis rotation, similar to other LÖVR functions.
//  // * - Four numbers plus the fifth `raw` flag can be used to set the raw values of the quaternion.
//  // * - An existing quaternion can be passed in to copy its values.
//  // * - A single direction vector can be specified to turn its direction (relative to the default
//  // *   forward direction of "negative z") into a rotation.
//  // * - Two direction vectors can be specified to set the quaternion equal to the rotation between the
//  // *   two vectors.
//  // * - A matrix can be passed in to extract the rotation of the matrix into a quaternion.
//  // * 
//  // * `self = Quat.set(r)`
//  // * 
//  // * @param r - An existing quaternion to copy the values from.
//  // * @returns The modified quaternion.
//  // */
//  //set(r: Quat): Quat
//
//  ///**
//  // * Sets the components of the quaternion.  There are lots of different ways to specify the new components, the summary is:
//  // * 
//  // * - Four numbers can be used to specify an angle/axis rotation, similar to other LÖVR functions.
//  // * - Four numbers plus the fifth `raw` flag can be used to set the raw values of the quaternion.
//  // * - An existing quaternion can be passed in to copy its values.
//  // * - A single direction vector can be specified to turn its direction (relative to the default
//  // *   forward direction of "negative z") into a rotation.
//  // * - Two direction vectors can be specified to set the quaternion equal to the rotation between the
//  // *   two vectors.
//  // * - A matrix can be passed in to extract the rotation of the matrix into a quaternion.
//  // * 
//  // * `self = Quat.set(v)`
//  // * 
//  // * Sets the values from a direction vector.
//  // * 
//  // * @param v - A normalized direction vector.
//  // * @returns The modified quaternion.
//  // */
//  //set(v: Vec3): Quat
//
//  ///**
//  // * Sets the components of the quaternion.  There are lots of different ways to specify the new components, the summary is:
//  // * 
//  // * - Four numbers can be used to specify an angle/axis rotation, similar to other LÖVR functions.
//  // * - Four numbers plus the fifth `raw` flag can be used to set the raw values of the quaternion.
//  // * - An existing quaternion can be passed in to copy its values.
//  // * - A single direction vector can be specified to turn its direction (relative to the default
//  // *   forward direction of "negative z") into a rotation.
//  // * - Two direction vectors can be specified to set the quaternion equal to the rotation between the
//  // *   two vectors.
//  // * - A matrix can be passed in to extract the rotation of the matrix into a quaternion.
//  // * 
//  // * `self = Quat.set(v, u)`
//  // * 
//  // * Sets the values to represent the rotation between two vectors.
//  // * 
//  // * @param v - A normalized direction vector.
//  // * @param u - Another normalized direction vector.
//  // * @returns The modified quaternion.
//  // */
//  //set(v: Vec3, u: Vec3): Quat
//
//  ///**
//  // * Sets the components of the quaternion.  There are lots of different ways to specify the new components, the summary is:
//  // * 
//  // * - Four numbers can be used to specify an angle/axis rotation, similar to other LÖVR functions.
//  // * - Four numbers plus the fifth `raw` flag can be used to set the raw values of the quaternion.
//  // * - An existing quaternion can be passed in to copy its values.
//  // * - A single direction vector can be specified to turn its direction (relative to the default
//  // *   forward direction of "negative z") into a rotation.
//  // * - Two direction vectors can be specified to set the quaternion equal to the rotation between the
//  // *   two vectors.
//  // * - A matrix can be passed in to extract the rotation of the matrix into a quaternion.
//  // * 
//  // * `self = Quat.set(m)`
//  // * 
//  // * @param m - A matrix to use the rotation from.
//  // * @returns The modified quaternion.
//  // */
//  //set(m: Mat4): Quat
//
//  ///**
//  // * Sets the components of the quaternion.  There are lots of different ways to specify the new components, the summary is:
//  // * 
//  // * - Four numbers can be used to specify an angle/axis rotation, similar to other LÖVR functions.
//  // * - Four numbers plus the fifth `raw` flag can be used to set the raw values of the quaternion.
//  // * - An existing quaternion can be passed in to copy its values.
//  // * - A single direction vector can be specified to turn its direction (relative to the default
//  // *   forward direction of "negative z") into a rotation.
//  // * - Two direction vectors can be specified to set the quaternion equal to the rotation between the
//  // *   two vectors.
//  // * - A matrix can be passed in to extract the rotation of the matrix into a quaternion.
//  // * 
//  // * `self = Quat.set()`
//  // * 
//  // * Reset the quaternion to the identity (0, 0, 0, 1).
//  // * 
//  // * @returns The modified quaternion.
//  // */
//  //set(): Quat
//
//  ///**
//  // * Sets the value of the quaternion using euler angles.  The rotation order is YXZ.
//  // * 
//  // * `self = Quat.setEuler(pitch, yaw, roll)`
//  // * 
//  // * @param pitch - The pitch (x axis rotation).
//  // * @param yaw - The yaw (y axis rotation).
//  // * @param roll - The roll (z axis rotation).
//  // * @returns The modified quaternion.
//  // */
//  //setEuler(pitch: number, yaw: number, roll: number): Quat
//
//  /**
//   * Performs a spherical linear interpolation between this quaternion and another one, which can be used for smoothly animating between two rotations.
//   * 
//   * The amount of interpolation is controlled by a parameter `t`.  A `t` value of zero leaves the original quaternion unchanged, whereas a `t` of one sets the original quaternion exactly equal to the target.  A value between `0` and `1` returns a rotation between the two based on the value.
//   * 
//   * `self = Quat.slerp(r, t)`
//   * 
//   * @param r - The quaternion to slerp towards.
//   * @param t - The lerping parameter.
//   * @returns The modified quaternion, containing the new lerped values.
//   */
//  slerp(r: quaternion, t: number): quaternion
//
//  /**
//   * Returns the components of the quaternion as numbers, either in an angle/axis representation or as raw quaternion values.
//   * 
//   * `[a, b, c, d] = Quat.unpack(raw)`
//   * 
//   * @param raw - Whether the values should be returned as raw values instead of angle/axis.
//   * @returns 
//   * a - The angle in radians, or the x value.
//   * b - The x component of the rotation axis or the y value.
//   * c - The y component of the rotation axis or the z value.
//   * d - The z component of the rotation axis or the w value.
//   */
//  unpack(raw?: boolean): LuaMultiReturn<[a: number, b: number, c: number, d: number]>
//
//}

/** A RandomGenerator is a standalone object that can be used to independently generate pseudo-random numbers. If you just need basic randomness, you can use `lovr.math.random` without needing to create a random generator. */
declare interface RandomGenerator extends LovrObject {
  /**
   * Returns the seed used to initialize the RandomGenerator.
   * 
   * `[low, high] = RandomGenerator.getSeed()`
   * 
   * @returns 
   * low - The lower 32 bits of the seed.
   * high - The upper 32 bits of the seed.
   * 
   * Since the seed is a 64 bit integer, each 32 bits of the seed are returned separately to avoid precision issues.
   */
  getSeed(): LuaMultiReturn<[low: number, high: number]>

  /**
   * Returns the current state of the RandomGenerator.  This can be used with `RandomGenerator:setState` to reliably restore a previous state of the generator.
   * 
   * `state = RandomGenerator.getState()`
   * 
   * @returns The serialized state.
   * 
   * The seed represents the starting state of the RandomGenerator, whereas the state represents the current state of the generator.
   */
  getState(): string

  /**
   * Returns the next uniformly distributed pseudo-random number from the RandomGenerator's sequence.
   * 
   * `x = RandomGenerator.random()`
   * 
   * Generate a pseudo-random floating point number in the range `[0,1)`
   * 
   * @returns A pseudo-random number.
   */
  random(): number

  /**
   * Returns the next uniformly distributed pseudo-random number from the RandomGenerator's sequence.
   * 
   * `x = RandomGenerator.random(high)`
   * 
   * Generate a pseudo-random integer in the range `[1,high]`
   * 
   * @param high - The maximum number to generate.
   * @returns A pseudo-random number.
   */
  random(high: number): number

  /**
   * Returns the next uniformly distributed pseudo-random number from the RandomGenerator's sequence.
   * 
   * `x = RandomGenerator.random(low, high)`
   * 
   * Generate a pseudo-random integer in the range `[low,high]`
   * 
   * @param low - The minimum number to generate.
   * @param high - The maximum number to generate.
   * @returns A pseudo-random number.
   */
  random(low: number, high: number): number

  /**
   * Returns a pseudo-random number from a normal distribution (a bell curve).  You can control the center of the bell curve (the mean value) and the overall width (sigma, or standard deviation).
   * 
   * `x = RandomGenerator.randomNormal(sigma, mu)`
   * 
   * @param sigma - The standard deviation of the distribution.  This can be thought of how "wide" the range of numbers is or how much variability there is.
   * @param mu - The average value returned.
   * @returns A normally distributed pseudo-random number.
   */
  randomNormal(sigma?: number, mu?: number): number

  /**
   * Seed the RandomGenerator with a new seed.  Each seed will cause the RandomGenerator to produce a unique sequence of random numbers.
   * 
   * `RandomGenerator.setSeed(seed)`
   * 
   * @param seed - The random seed.
   * 
   * For precise 64 bit seeds, you should specify the lower and upper 32 bits of the seed separately. Otherwise, seeds larger than 2^53 will start to lose precision.
   */
  setSeed(seed: number): void

  /**
   * Seed the RandomGenerator with a new seed.  Each seed will cause the RandomGenerator to produce a unique sequence of random numbers.
   * 
   * `RandomGenerator.setSeed(low, high)`
   * 
   * @param low - The lower 32 bits of the seed.
   * @param high - The upper 32 bits of the seed.
   * 
   * For precise 64 bit seeds, you should specify the lower and upper 32 bits of the seed separately. Otherwise, seeds larger than 2^53 will start to lose precision.
   */
  setSeed(low: number, high: number): void

  /**
   * Sets the state of the RandomGenerator, as previously obtained using `RandomGenerator:getState`. This can be used to reliably restore a previous state of the generator.
   * 
   * `RandomGenerator.setState(state)`
   * 
   * @param state - The serialized state.
   * 
   * The seed represents the starting state of the RandomGenerator, whereas the state represents the current state of the generator.
   */
  setState(state: string): void

}

/** A vector object that holds two numbers. */
//declare interface Vec2 {
//  /**
//   * Adds a vector or a number to the vector.
//   * 
//   * `self = Vec2.add(u)`
//   * 
//   * @param u - The other vector.
//   * @returns The modified vector.
//   */
//  add(u: Vec2): Vec2
//
//  /**
//   * Adds a vector or a number to the vector.
//   * 
//   * `self = Vec2.add(x, y)`
//   * 
//   * @param x - A value to add to x component.
//   * @param y - A value to add to y component.
//   * @returns The modified vector.
//   */
//  add(x: number, y?: number): Vec2
//
//  /**
//   * Returns the angle between vectors.
//   * 
//   * `angle = Vec2.angle(u)`
//   * 
//   * @param u - The other vector.
//   * @returns The angle to the other vector, in radians.
//   * 
//   * If any of the two vectors have a length of zero, the angle between them is not well defined.  In this case the function returns `math.pi / 2`.
//   */
//  angle(u: Vec2): number
//
//  /**
//   * Returns the angle between vectors.
//   * 
//   * `angle = Vec2.angle(x, y)`
//   * 
//   * @param x - The x component of the other vector.
//   * @param y - The y component of the other vector.
//   * @returns The angle to the other vector, in radians.
//   * 
//   * If any of the two vectors have a length of zero, the angle between them is not well defined.  In this case the function returns `math.pi / 2`.
//   */
//  angle(x: number, y: number): number
//
//  /**
//   * Returns the distance to another vector.
//   * 
//   * `distance = Vec2.distance(u)`
//   * 
//   * @param u - The vector to measure the distance to.
//   * @returns The distance to `u`.
//   */
//  distance(u: Vec2): number
//
//  /**
//   * Returns the distance to another vector.
//   * 
//   * `distance = Vec2.distance(x, y)`
//   * 
//   * @param x - A value of x component to measure distance to.
//   * @param y - A value of y component to measure distance to.
//   * @returns The distance to `u`.
//   */
//  distance(x: number, y: number): number
//
//  /**
//   * Divides the vector by a vector or a number.
//   * 
//   * `self = Vec2.div(u)`
//   * 
//   * @param u - The other vector to divide the components by.
//   * @returns The modified vector.
//   */
//  div(u: Vec2): Vec2
//
//  /**
//   * Divides the vector by a vector or a number.
//   * 
//   * `self = Vec2.div(x, y)`
//   * 
//   * @param x - A value to divide x component by.
//   * @param y - A value to divide y component by.
//   * @returns The modified vector.
//   */
//  div(x: number, y?: number): Vec2
//
//  /**
//   * Returns the dot product between this vector and another one.
//   * 
//   * `dot = Vec2.dot(u)`
//   * 
//   * @param u - The vector to compute the dot product with.
//   * @returns The dot product between `v` and `u`.
//   * 
//   * This is computed as:
//   * 
//   *     dot = v.x * u.x + v.y * u.y
//   * 
//   * The vectors are not normalized before computing the dot product.
//   */
//  dot(u: Vec2): number
//
//  /**
//   * Returns the dot product between this vector and another one.
//   * 
//   * `dot = Vec2.dot(x, y)`
//   * 
//   * @param x - A value of x component to compute the dot product with.
//   * @param y - A value of y component to compute the dot product with.
//   * @returns The dot product between `v` and `u`.
//   * 
//   * This is computed as:
//   * 
//   *     dot = v.x * u.x + v.y * u.y
//   * 
//   * The vectors are not normalized before computing the dot product.
//   */
//  dot(x: number, y: number): number
//
//  /**
//   * Returns whether a vector is approximately equal to another vector.
//   * 
//   * `equal = Vec2.equals(u)`
//   * 
//   * @param u - The other vector.
//   * @returns Whether the 2 vectors approximately equal each other.
//   * 
//   * To handle floating point precision issues, this function returns true as long as the squared distance between the vectors is below `1e-10`.
//   */
//  equals(u: Vec2): boolean
//
//  /**
//   * Returns whether a vector is approximately equal to another vector.
//   * 
//   * `equal = Vec2.equals(x, y)`
//   * 
//   * @param x - The x component of the other vector.
//   * @param y - The y component of the other vector.
//   * @returns Whether the 2 vectors approximately equal each other.
//   * 
//   * To handle floating point precision issues, this function returns true as long as the squared distance between the vectors is below `1e-10`.
//   */
//  equals(x: number, y: number): boolean
//
//  /**
//   * Returns the length of the vector.
//   * 
//   * `length = Vec2.length()`
//   * 
//   * @returns The length of the vector.
//   * 
//   * The length is equivalent to this:
//   * 
//   *     math.sqrt(v.x * v.x + v.y * v.y)
//   */
//  length(): number
//
//  /**
//   * Performs a linear interpolation between this vector and another one, which can be used to smoothly animate between two vectors, based on a parameter value.  A parameter value of `0` will leave the vector unchanged, a parameter value of `1` will set the vector to be equal to the input vector, and a value of `.5` will set the components to be halfway between the two vectors.
//   * 
//   * `self = Vec2.lerp(u, t)`
//   * 
//   * @param u - The vector to lerp towards.
//   * @param t - The lerping parameter.
//   * @returns The interpolated vector.
//   */
//  lerp(u: Vec2, t: number): Vec2
//
//  /**
//   * Performs a linear interpolation between this vector and another one, which can be used to smoothly animate between two vectors, based on a parameter value.  A parameter value of `0` will leave the vector unchanged, a parameter value of `1` will set the vector to be equal to the input vector, and a value of `.5` will set the components to be halfway between the two vectors.
//   * 
//   * `self = Vec2.lerp(x, y, t)`
//   * 
//   * @param x - A value of x component to lerp towards.
//   * @param y - A value of y component to lerp towards.
//   * @param t - The lerping parameter.
//   * @returns The interpolated vector.
//   */
//  lerp(x: number, y: number, t: number): Vec2
//
//  /**
//   * Multiplies the vector by a vector or a number.
//   * 
//   * `self = Vec2.mul(u)`
//   * 
//   * @param u - The other vector to multiply the components by.
//   * @returns The modified vector.
//   */
//  mul(u: Vec2): Vec2
//
//  /**
//   * Multiplies the vector by a vector or a number.
//   * 
//   * `self = Vec2.mul(x, y)`
//   * 
//   * @param x - A value to multiply x component by.
//   * @param y - A value to multiply y component by.
//   * @returns The modified vector.
//   */
//  mul(x: number, y?: number): Vec2
//
//  /**
//   * Adjusts the values in the vector so that its direction stays the same but its length becomes 1.
//   * 
//   * `self = Vec2.normalize()`
//   * 
//   * @returns The normalized vector.
//   */
//  normalize(): Vec2
//
//  /**
//   * Sets the components of the vector, either from numbers or an existing vector.
//   * 
//   * `v = Vec2.set(x, y)`
//   * 
//   * @param x - The new x value of the vector.
//   * @param y - The new y value of the vector.
//   * @returns The input vector.
//   */
//  set(x?: number, y?: number): Vec2
//
//  /**
//   * Sets the components of the vector, either from numbers or an existing vector.
//   * 
//   * `v = Vec2.set(u)`
//   * 
//   * @param u - The vector to copy the values from.
//   * @returns The input vector.
//   */
//  set(u: Vec2): Vec2
//
//  /**
//   * Subtracts a vector or a number from the vector.
//   * 
//   * `self = Vec2.sub(u)`
//   * 
//   * @param u - The other vector.
//   * @returns The modified vector.
//   */
//  sub(u: Vec2): Vec2
//
//  /**
//   * Subtracts a vector or a number from the vector.
//   * 
//   * `self = Vec2.sub(x, y)`
//   * 
//   * @param x - A value to subtract from x component.
//   * @param y - A value to subtract from y component.
//   * @returns The modified vector.
//   */
//  sub(x: number, y?: number): Vec2
//
//  /**
//   * Returns the 2 components of the vector as numbers.
//   * 
//   * `[x, y] = Vec2.unpack()`
//   * 
//   * @returns 
//   * x - The x value.
//   * y - The y value.
//   */
//  unpack(): LuaMultiReturn<[x: number, y: number]>
//
//}

///** A vector object that holds three numbers. */
//declare interface vector {
//  ///**
//  // * Adds a vector or a number to the vector.
//  // * 
//  // * `self = Vec3.add(u)`
//  // * 
//  // * @param u - The other vector.
//  // * @returns The modified vector.
//  // */
//  //add(u: Vec3): Vec3
//
//  ///**
//  // * Adds a vector or a number to the vector.
//  // * 
//  // * `self = Vec3.add(x, y, z)`
//  // * 
//  // * @param x - A value to add to x component.
//  // * @param y - A value to add to y component.
//  // * @param z - A value to add to z component.
//  // * @returns The modified vector.
//  // */
//  //add(x: number, y?: number, z?: number): Vec3
//
//  /**
//   * Returns the angle between vectors.
//   * 
//   * `angle = Vec3.angle(u)`
//   * 
//   * @param u - The other vector.
//   * @returns The angle to the other vector, in radians.
//   * 
//   * If any of the two vectors have a length of zero, the angle between them is not well defined.  In this case the function returns `math.pi / 2`.
//   */
//  angle(u: vector): number
//
//  /**
//   * Returns the angle between vectors.
//   * 
//   * `angle = Vec3.angle(x, y, z)`
//   * 
//   * @param x - The x component of the other vector.
//   * @param y - The y component of the other vector.
//   * @param z - The z component of the other vector.
//   * @returns The angle to the other vector, in radians.
//   * 
//   * If any of the two vectors have a length of zero, the angle between them is not well defined.  In this case the function returns `math.pi / 2`.
//   */
//  angle(x: number, y: number, z: number): number
//
//  /**
//   * Sets this vector to be equal to the cross product between this vector and another one.  The new `v` will be perpendicular to both the old `v` and `u`.
//   * 
//   * `self = Vec3.cross(u)`
//   * 
//   * @param u - The vector to compute the cross product with.
//   * @returns The modified vector.
//   * 
//   * The vectors are not normalized before or after computing the cross product.
//   */
//  cross(u: vector): vector
//
//  /**
//   * Sets this vector to be equal to the cross product between this vector and another one.  The new `v` will be perpendicular to both the old `v` and `u`.
//   * 
//   * `self = Vec3.cross(x, y, z)`
//   * 
//   * @param x - A value of x component to compute cross product with.
//   * @param y - A value of y component to compute cross product with.
//   * @param z - A value of z component to compute cross product with.
//   * @returns The modified vector.
//   * 
//   * The vectors are not normalized before or after computing the cross product.
//   */
//  cross(x: number, y: number, z: number): vector
//
//  /**
//   * Returns the distance to another vector.
//   * 
//   * `distance = Vec3.distance(u)`
//   * 
//   * @param u - The vector to measure the distance to.
//   * @returns The distance to `u`.
//   */
//  distance(u: vector): number
//
//  /**
//   * Returns the distance to another vector.
//   * 
//   * `distance = Vec3.distance(x, y, z)`
//   * 
//   * @param x - A value of x component to measure distance to.
//   * @param y - A value of y component to measure distance to.
//   * @param z - A value of z component to measure distance to.
//   * @returns The distance to `u`.
//   */
//  distance(x: number, y: number, z: number): number
//
//  ///**
//  // * Divides the vector by a vector or a number.
//  // * 
//  // * `self = Vec3.div(u)`
//  // * 
//  // * @param u - The other vector to divide the components by.
//  // * @returns The modified vector.
//  // */
//  //div(u: Vec3): Vec3
//
//  ///**
//  // * Divides the vector by a vector or a number.
//  // * 
//  // * `self = Vec3.div(x, y, z)`
//  // * 
//  // * @param x - A value to divide x component by.
//  // * @param y - A value to divide y component by.
//  // * @param z - A value to divide z component by.
//  // * @returns The modified vector.
//  // */
//  //div(x: number, y?: number, z?: number): Vec3
//
//  /**
//   * Returns the dot product between this vector and another one.
//   * 
//   * `dot = Vec3.dot(u)`
//   * 
//   * @param u - The vector to compute the dot product with.
//   * @returns The dot product between `v` and `u`.
//   * 
//   * This is computed as:
//   * 
//   *     dot = v.x * u.x + v.y * u.y + v.z * u.z
//   * 
//   * The vectors are not normalized before computing the dot product.
//   */
//  dot(u: vector): number
//
//  /**
//   * Returns the dot product between this vector and another one.
//   * 
//   * `dot = Vec3.dot(x, y, z)`
//   * 
//   * @param x - A value of x component to compute the dot product with.
//   * @param y - A value of y component to compute the dot product with.
//   * @param z - A value of z component to compute the dot product with.
//   * @returns The dot product between `v` and `u`.
//   * 
//   * This is computed as:
//   * 
//   *     dot = v.x * u.x + v.y * u.y + v.z * u.z
//   * 
//   * The vectors are not normalized before computing the dot product.
//   */
//  dot(x: number, y: number, z: number): number
//
//  /**
//   * Returns whether a vector is approximately equal to another vector.
//   * 
//   * `equal = Vec3.equals(u)`
//   * 
//   * @param u - The other vector.
//   * @returns Whether the 2 vectors approximately equal each other.
//   * 
//   * To handle floating point precision issues, this function returns true as long as the squared distance between the vectors is below `1e-10`.
//   */
//  equals(u: vector): boolean
//
//  /**
//   * Returns whether a vector is approximately equal to another vector.
//   * 
//   * `equal = Vec3.equals(x, y, z)`
//   * 
//   * @param x - The x component of the other vector.
//   * @param y - The y component of the other vector.
//   * @param z - The z component of the other vector.
//   * @returns Whether the 2 vectors approximately equal each other.
//   * 
//   * To handle floating point precision issues, this function returns true as long as the squared distance between the vectors is below `1e-10`.
//   */
//  equals(x: number, y: number, z: number): boolean
//
//  /**
//   * Returns the length of the vector.
//   * 
//   * `length = Vec3.length()`
//   * 
//   * @returns The length of the vector.
//   * 
//   * The length is equivalent to this:
//   * 
//   *     math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
//   */
//  length(): number
//
//  /**
//   * Performs a linear interpolation between this vector and another one, which can be used to smoothly animate between two vectors, based on a parameter value.  A parameter value of `0` will leave the vector unchanged, a parameter value of `1` will set the vector to be equal to the input vector, and a value of `.5` will set the components to be halfway between the two vectors.
//   * 
//   * `self = Vec3.lerp(u, t)`
//   * 
//   * @param u - The vector to lerp towards.
//   * @param t - The lerping parameter.
//   * @returns The interpolated vector.
//   */
//  lerp(u: vector, t: number): vector
//
//  /**
//   * Performs a linear interpolation between this vector and another one, which can be used to smoothly animate between two vectors, based on a parameter value.  A parameter value of `0` will leave the vector unchanged, a parameter value of `1` will set the vector to be equal to the input vector, and a value of `.5` will set the components to be halfway between the two vectors.
//   * 
//   * `self = Vec3.lerp(x, y, z, t)`
//   * 
//   * @param x - A value of x component to lerp towards.
//   * @param y - A value of y component to lerp towards.
//   * @param z - A value of z component to lerp towards.
//   * @param t - The lerping parameter.
//   * @returns The interpolated vector.
//   */
//  lerp(x: number, y: number, z: number, t: number): vector
//
//  ///**
//  // * Multiplies the vector by a vector or a number.
//  // * 
//  // * `self = Vec3.mul(u)`
//  // * 
//  // * @param u - The other vector to multiply the components by.
//  // * @returns The modified vector.
//  // */
//  //mul(u: Vec3): Vec3
//
//  ///**
//  // * Multiplies the vector by a vector or a number.
//  // * 
//  // * `self = Vec3.mul(x, y, z)`
//  // * 
//  // * @param x - A value to multiply x component by.
//  // * @param y - A value to multiply y component by.
//  // * @param z - A value to multiply z component by.
//  // * @returns The modified vector.
//  // */
//  //mul(x: number, y?: number, z?: number): Vec3
//
//  /**
//   * Adjusts the values in the vector so that its direction stays the same but its length becomes 1.
//   * 
//   * `self = Vec3.normalize()`
//   * 
//   * @returns The normalized vector.
//   */
//  normalize(): vector
//
//  /**
//   * Applies a rotation to the vector, using a `Quat` or an angle/axis rotation.
//   * 
//   * `self = Vec3.rotate(q)`
//   * 
//   * @param q - The quaternion to apply.
//   * @returns The modified vector.
//   */
//  rotate(q: quaternion): vector
//
//  /**
//   * Applies a rotation to the vector, using a `Quat` or an angle/axis rotation.
//   * 
//   * `self = Vec3.rotate(angle, ax, ay, az)`
//   * 
//   * @param angle - The number of radians to rotate.
//   * @param ax - The x component of the axis to rotate around.
//   * @param ay - The y component of the axis to rotate around.
//   * @param az - The z component of the axis to rotate around.
//   * @returns The modified vector.
//   */
//  rotate(angle: number, ax: number, ay: number, az: number): vector
//
//  ///**
//  // * Sets the components of the vector, either from numbers or an existing vector.
//  // * 
//  // * `v = Vec3.set(x, y, z)`
//  // * 
//  // * @param x - The new x value of the vector.
//  // * @param y - The new y value of the vector.
//  // * @param z - The new z value of the vector.
//  // * @returns The input vector.
//  // */
//  //set(x?: number, y?: number, z?: number): Vec3
//
//  ///**
//  // * Sets the components of the vector, either from numbers or an existing vector.
//  // * 
//  // * `v = Vec3.set(u)`
//  // * 
//  // * @param u - The vector to copy the values from.
//  // * @returns The input vector.
//  // */
//  //set(u: Vec3): Vec3
//
//  ///**
//  // * Sets the components of the vector, either from numbers or an existing vector.
//  // * 
//  // * `v = Vec3.set(q)`
//  // * 
//  // * @param q - A quat to use the direction of.
//  // * @returns The input vector.
//  // */
//  //set(q: Quat): Vec3
//
//  ///**
//  // * Sets the components of the vector, either from numbers or an existing vector.
//  // * 
//  // * `v = Vec3.set(m)`
//  // * 
//  // * @param m - The matrix to use the position of.
//  // * @returns The input vector.
//  // */
//  //set(m: Mat4): Vec3
//
//  ///**
//  // * Subtracts a vector or a number from the vector.
//  // * 
//  // * `self = Vec3.sub(u)`
//  // * 
//  // * @param u - The other vector.
//  // * @returns The modified vector.
//  // */
//  //sub(u: Vec3): Vec3
//
//  ///**
//  // * Subtracts a vector or a number from the vector.
//  // * 
//  // * `self = Vec3.sub(x, y, z)`
//  // * 
//  // * @param x - A value to subtract from x component.
//  // * @param y - A value to subtract from y component.
//  // * @param z - A value to subtract from z component.
//  // * @returns The modified vector.
//  // */
//  //sub(x: number, y?: number, z?: number): Vec3
//
//  /**
//   * Applies a transform (translation, rotation, scale) to the vector using a `Mat4` or numbers. This is the same as multiplying the vector by a matrix.  This treats the vector as a point.
//   * 
//   * `self = Vec3.transform(m)`
//   * 
//   * @param m - The matrix to apply.
//   * @returns The original vector, with transformed components.
//   */
//  transform(m: Mat4): vector
//
//  /**
//   * Applies a transform (translation, rotation, scale) to the vector using a `Mat4` or numbers. This is the same as multiplying the vector by a matrix.  This treats the vector as a point.
//   * 
//   * `self = Vec3.transform(x, y, z, scale, angle, ax, ay, az)`
//   * 
//   * @param x - The x component of the translation.
//   * @param y - The y component of the translation.
//   * @param z - The z component of the translation.
//   * @param scale - The scale factor.
//   * @param angle - The number of radians to rotate around the rotation axis.
//   * @param ax - The x component of the axis of rotation.
//   * @param ay - The y component of the axis of rotation.
//   * @param az - The z component of the axis of rotation.
//   * @returns The original vector, with transformed components.
//   */
//  transform(x?: number, y?: number, z?: number, scale?: number, angle?: number, ax?: number, ay?: number, az?: number): vector
//
//  /**
//   * Applies a transform (translation, rotation, scale) to the vector using a `Mat4` or numbers. This is the same as multiplying the vector by a matrix.  This treats the vector as a point.
//   * 
//   * `self = Vec3.transform(translation, scale, rotation)`
//   * 
//   * @param translation - The translation to apply.
//   * @param scale - The scale factor.
//   * @param rotation - The rotation to apply.
//   * @returns The original vector, with transformed components.
//   */
//  transform(translation: vector, scale: number, rotation: quaternion): vector
//
//  /**
//   * Returns the 3 components of the vector as numbers.
//   * 
//   * `[x, y, z] = Vec3.unpack()`
//   * 
//   * @returns 
//   * x - The x value.
//   * y - The y value.
//   * z - The z value.
//   */
//  unpack(): LuaMultiReturn<[x: number, y: number, z: number]>
//
//}

///** A vector object that holds four numbers. */
//declare interface Vec4 {
//  /**
//   * Adds a vector or a number to the vector.
//   * 
//   * `self = Vec4.add(u)`
//   * 
//   * @param u - The other vector.
//   * @returns The modified vector.
//   */
//  add(u: Vec4): Vec4
//
//  /**
//   * Adds a vector or a number to the vector.
//   * 
//   * `self = Vec4.add(x, y, z, w)`
//   * 
//   * @param x - A value to add to x component.
//   * @param y - A value to add to y component.
//   * @param z - A value to add to z component.
//   * @param w - A value to add to w component.
//   * @returns The modified vector.
//   */
//  add(x: number, y?: number, z?: number, w?: number): Vec4
//
//  /**
//   * Returns the angle between vectors.
//   * 
//   * `angle = Vec4.angle(u)`
//   * 
//   * @param u - The other vector.
//   * @returns The angle to other vector, in radians.
//   * 
//   * If any of the two vectors have a length of zero, the angle between them is not well defined.  In this case the function returns `math.pi / 2`.
//   */
//  angle(u: Vec4): number
//
//  /**
//   * Returns the angle between vectors.
//   * 
//   * `angle = Vec4.angle(x, y, z, w)`
//   * 
//   * @param x - The x component of the other vector.
//   * @param y - The y component of the other vector.
//   * @param z - The z component of the other vector.
//   * @param w - The w component of the other vector.
//   * @returns The angle to other vector, in radians.
//   * 
//   * If any of the two vectors have a length of zero, the angle between them is not well defined.  In this case the function returns `math.pi / 2`.
//   */
//  angle(x: number, y: number, z: number, w: number): number
//
//  /**
//   * Returns the distance to another vector.
//   * 
//   * `distance = Vec4.distance(u)`
//   * 
//   * @param u - The vector to measure the distance to.
//   * @returns The distance to `u`.
//   */
//  distance(u: Vec4): number
//
//  /**
//   * Returns the distance to another vector.
//   * 
//   * `distance = Vec4.distance(x, y, z, w)`
//   * 
//   * @param x - A value of x component to measure distance to.
//   * @param y - A value of y component to measure distance to.
//   * @param z - A value of z component to measure distance to.
//   * @param w - A value of w component to measure distance to.
//   * @returns The distance to `u`.
//   */
//  distance(x: number, y: number, z: number, w: number): number
//
//  /**
//   * Divides the vector by a vector or a number.
//   * 
//   * `self = Vec4.div(u)`
//   * 
//   * @param u - The other vector to divide the components by.
//   * @returns The modified vector.
//   */
//  div(u: Vec4): Vec4
//
//  /**
//   * Divides the vector by a vector or a number.
//   * 
//   * `self = Vec4.div(x, y, z, w)`
//   * 
//   * @param x - A value to divide x component by.
//   * @param y - A value to divide y component by.
//   * @param z - A value to divide z component by.
//   * @param w - A value to divide w component by.
//   * @returns The modified vector.
//   */
//  div(x: number, y?: number, z?: number, w?: number): Vec4
//
//  /**
//   * Returns the dot product between this vector and another one.
//   * 
//   * `dot = Vec4.dot(u)`
//   * 
//   * @param u - The vector to compute the dot product with.
//   * @returns The dot product between `v` and `u`.
//   * 
//   * This is computed as:
//   * 
//   *     dot = v.x * u.x + v.y * u.y + v.z * u.z + v.w * u.w
//   * 
//   * The vectors are not normalized before computing the dot product.
//   */
//  dot(u: Vec4): number
//
//  /**
//   * Returns the dot product between this vector and another one.
//   * 
//   * `dot = Vec4.dot(x, y, z, w)`
//   * 
//   * @param x - A value of x component to compute the dot product with.
//   * @param y - A value of y component to compute the dot product with.
//   * @param z - A value of z component to compute the dot product with.
//   * @param w - A value of w component to compute the dot product with.
//   * @returns The dot product between `v` and `u`.
//   * 
//   * This is computed as:
//   * 
//   *     dot = v.x * u.x + v.y * u.y + v.z * u.z + v.w * u.w
//   * 
//   * The vectors are not normalized before computing the dot product.
//   */
//  dot(x: number, y: number, z: number, w: number): number
//
//  /**
//   * Returns whether a vector is approximately equal to another vector.
//   * 
//   * `equal = Vec4.equals(u)`
//   * 
//   * @param u - The other vector.
//   * @returns Whether the 2 vectors approximately equal each other.
//   * 
//   * To handle floating point precision issues, this function returns true as long as the squared distance between the vectors is below `1e-10`.
//   */
//  equals(u: Vec4): boolean
//
//  /**
//   * Returns whether a vector is approximately equal to another vector.
//   * 
//   * `equal = Vec4.equals(x, y, z, w)`
//   * 
//   * @param x - The x component of the other vector.
//   * @param y - The y component of the other vector.
//   * @param z - The z component of the other vector.
//   * @param w - The w component of the other vector.
//   * @returns Whether the 2 vectors approximately equal each other.
//   * 
//   * To handle floating point precision issues, this function returns true as long as the squared distance between the vectors is below `1e-10`.
//   */
//  equals(x: number, y: number, z: number, w: number): boolean
//
//  /**
//   * Returns the length of the vector.
//   * 
//   * `length = Vec4.length()`
//   * 
//   * @returns The length of the vector.
//   * 
//   * The length is equivalent to this:
//   * 
//   *     math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z + v.w * v.w)
//   */
//  length(): number
//
//  /**
//   * Performs a linear interpolation between this vector and another one, which can be used to smoothly animate between two vectors, based on a parameter value.  A parameter value of `0` will leave the vector unchanged, a parameter value of `1` will set the vector to be equal to the input vector, and a value of `.5` will set the components to be halfway between the two vectors.
//   * 
//   * `self = Vec4.lerp(u, t)`
//   * 
//   * @param u - The vector to lerp towards.
//   * @param t - The lerping parameter.
//   * @returns The interpolated vector.
//   */
//  lerp(u: Vec4, t: number): Vec4
//
//  /**
//   * Performs a linear interpolation between this vector and another one, which can be used to smoothly animate between two vectors, based on a parameter value.  A parameter value of `0` will leave the vector unchanged, a parameter value of `1` will set the vector to be equal to the input vector, and a value of `.5` will set the components to be halfway between the two vectors.
//   * 
//   * `self = Vec4.lerp(x, y, z, w, t)`
//   * 
//   * @param x - A value of x component to lerp towards.
//   * @param y - A value of y component to lerp towards.
//   * @param z - A value of z component to lerp towards.
//   * @param w - A value of w component to lerp towards.
//   * @param t - The lerping parameter.
//   * @returns The interpolated vector.
//   */
//  lerp(x: number, y: number, z: number, w: number, t: number): Vec4
//
//  /**
//   * Multiplies the vector by a vector or a number.
//   * 
//   * `self = Vec4.mul(u)`
//   * 
//   * @param u - The other vector to multiply the components by.
//   * @returns The modified vector.
//   */
//  mul(u: Vec4): Vec4
//
//  /**
//   * Multiplies the vector by a vector or a number.
//   * 
//   * `self = Vec4.mul(x, y, z, w)`
//   * 
//   * @param x - A value to multiply x component by.
//   * @param y - A value to multiply y component by.
//   * @param z - A value to multiply z component by.
//   * @param w - A value to multiply w component by.
//   * @returns The modified vector.
//   */
//  mul(x: number, y?: number, z?: number, w?: number): Vec4
//
//  /**
//   * Adjusts the values in the vector so that its direction stays the same but its length becomes 1.
//   * 
//   * `self = Vec4.normalize()`
//   * 
//   * @returns The normalized vector.
//   */
//  normalize(): Vec4
//
//  /**
//   * Sets the components of the vector, either from numbers or an existing vector.
//   * 
//   * `v = Vec4.set(x, y, z, w)`
//   * 
//   * @param x - The new x value of the vector.
//   * @param y - The new y value of the vector.
//   * @param z - The new z value of the vector.
//   * @param w - The new w value of the vector.
//   * @returns The input vector.
//   */
//  set(x?: number, y?: number, z?: number, w?: number): Vec4
//
//  /**
//   * Sets the components of the vector, either from numbers or an existing vector.
//   * 
//   * `v = Vec4.set(u)`
//   * 
//   * @param u - The vector to copy the values from.
//   * @returns The input vector.
//   */
//  set(u: Vec4): Vec4
//
//  /**
//   * Subtracts a vector or a number from the vector.
//   * 
//   * `self = Vec4.sub(u)`
//   * 
//   * @param u - The other vector.
//   * @returns The modified vector.
//   */
//  sub(u: Vec4): Vec4
//
//  /**
//   * Subtracts a vector or a number from the vector.
//   * 
//   * `self = Vec4.sub(x, y, z, w)`
//   * 
//   * @param x - A value to subtract from x component.
//   * @param y - A value to subtract from y component.
//   * @param z - A value to subtract from z component.
//   * @param w - A value to subtract from w component.
//   * @returns The modified vector.
//   */
//  sub(x: number, y?: number, z?: number, w?: number): Vec4
//
//  /**
//   * Applies a transform (translation, rotation, scale) to the vector using a `Mat4` or numbers. This is the same as multiplying the vector by a matrix.
//   * 
//   * `self = Vec4.transform(m)`
//   * 
//   * @param m - The matrix to apply.
//   * @returns The original vector, with transformed components.
//   */
//  transform(m: Mat4): Vec4
//
//  /**
//   * Applies a transform (translation, rotation, scale) to the vector using a `Mat4` or numbers. This is the same as multiplying the vector by a matrix.
//   * 
//   * `self = Vec4.transform(x, y, z, scale, angle, ax, ay, az)`
//   * 
//   * @param x - The x component of the translation.
//   * @param y - The y component of the translation.
//   * @param z - The z component of the translation.
//   * @param scale - The scale factor.
//   * @param angle - The number of radians to rotate around the rotation axis.
//   * @param ax - The x component of the axis of rotation.
//   * @param ay - The y component of the axis of rotation.
//   * @param az - The z component of the axis of rotation.
//   * @returns The original vector, with transformed components.
//   */
//  transform(x?: number, y?: number, z?: number, scale?: number, angle?: number, ax?: number, ay?: number, az?: number): Vec4
//
//  /**
//   * Applies a transform (translation, rotation, scale) to the vector using a `Mat4` or numbers. This is the same as multiplying the vector by a matrix.
//   * 
//   * `self = Vec4.transform(translation, scale, rotation)`
//   * 
//   * @param translation - The translation to apply.
//   * @param scale - The scale factor.
//   * @param rotation - The rotation to apply.
//   * @returns The original vector, with transformed components.
//   */
//  transform(translation: Vec3, scale: number, rotation: Quat): Vec4
//
//  /**
//   * Returns the 4 components of the vector as numbers.
//   * 
//   * `[x, y, z, w] = Vec4.unpack()`
//   * 
//   * @returns 
//   * x - The x value.
//   * y - The y value.
//   * z - The z value.
//   * w - The w value.
//   */
//  unpack(): LuaMultiReturn<[x: number, y: number, z: number, w: number]>
//
//}

/**
 * LÖVR has math objects for vectors, matrices, and quaternions, collectively called "vector objects".  Vectors are useful because they can represent a multidimensional quantity (like a 3D position) using just a single value.
 * 
 * Most LÖVR functions that accept positions, orientations, transforms, velocities, etc. also accept vector objects, so they can be used interchangeably with numbers:
 * 
 *     function lovr.draw(pass)
 *       -- position and size are vec3's, rotation is a quat
 *       pass:box(position, size, rotation)
 *     end
 * 
 * ### Temporary vs. Permanent
 * 
 * Vectors can be created in two different ways: **permanent** and **temporary**.
 * 
 * **Permanent** vectors behave like normal Lua values.  They are individual objects that are garbage collected when no longer needed.  They're created using the usual `lovr.math.new<Type>` syntax:
 * 
 *     self.position = lovr.math.newVec3(x, y, z)
 * 
 * **Temporary** vectors are created from a shared pool of vector objects.  This makes them faster because they use temporary memory and do not need to be garbage collected.  To make a temporary vector, leave off the `new` prefix:
 * 
 *     local position = lovr.math.vec3(x, y, z)
 * 
 * As a shortcut, vector constructors are placed on the global scope.  The uppercase name of the vector is a function that will create a permanent vector, and the lowercase name will create a temporary vector.  This can be disabled using the `t.math.globals` option in `lovr.conf`.
 * 
 *     local position = vec3(x1, y1, z1) + vec3(x2, y2, z2)
 *     local transform = Mat4()
 * 
 * Temporary vectors, with all their speed, come with an important restriction: they can only be used during the frame in which they were created.  Saving them into variables and using them later on will throw an error:
 * 
 *     local position = vec3(1, 2, 3)
 * 
 *     function lovr.update(dt)
 *       -- Reusing the temporary 'position' vector across frames will error:
 *       position:add(vec3(dt))
 *     end
 * 
 * It's possible to overflow the temporary vector pool.  If that happens, `lovr.math.drain` can be used to periodically drain the pool, invalidating any existing temporary vectors.
 * 
 * ### Metamethods
 * 
 * Vectors have metamethods, allowing them to be used using the normal math operators like `+`, `-`, `*`, `/`, etc.
 * 
 *     print(vec3(2, 4, 6) * .5 + vec3(10, 20, 30))
 * 
 * These metamethods will create new temporary vectors.
 * 
 * ### Components and Swizzles
 * 
 * The raw components of a vector can be accessed like normal fields:
 * 
 *     print(vec3(1, 2, 3).z) --> 3
 *     print(mat4()[16]) --> 1
 * 
 * Also, multiple fields can be accessed and combined into a new (temporary) vector, called swizzling:
 * 
 *     local position = vec3(10, 5, 1)
 *     print(position.xy) --> vec2(10, 5)
 *     print(position.xyy) --> vec3(10, 5, 5)
 *     print(position.zyxz) --> vec4(1, 5, 10, 1)
 * 
 * The following fields are supported for vectors:
 * 
 * - `x`, `y`, `z`, `w`
 * - `r`, `g`, `b`, `a`
 * - `s`, `t`, `p`, `q`
 * 
 * Quaternions support `x`, `y`, `z`, and `w`.
 * 
 * Matrices use numbers for accessing individual components in "column-major" order.
 * 
 * All fields can also be assigned to.
 * 
 *     -- Swap the components of a 2D vector
 *     v.xy = v.yx
 * 
 * The `unpack` function can be used (on any vector type) to access all of the individual components of a vector object.  For quaternions you can choose whether you want to unpack the angle/axis representation or the raw quaternion components.  Similarly, matrices support raw unpacking as well as decomposition into translation/scale/rotation values.
 * 
 * ### Vector Constants
 * 
 * The following vector constants are available.  They return new temporary vectors each time they are used:
 * 
 * - `vec2.zero` (0, 0)
 * - `vec2.one` (1, 1)
 * - `vec3.zero` (0, 0, 0)
 * - `vec3.one` (1, 1, 1)
 * - `vec3.left` (-1, 0, 0)
 * - `vec3.right` (1, 0, 0)
 * - `vec3.up` (0, 1, 0)
 * - `vec3.down` (0, -1, 0)
 * - `vec3.back` (0, 0, 1)
 * - `vec3.forward` (0, 0, -1)
 * - `vec4.zero` (0, 0, 0, 0)
 * - `vec4.one` (1, 1, 1, 1)
 * - `quat.identity` (0, 0, 0, 1)
 */
declare interface Vectors {
}

/** Represents the different types of physics Joints available. */
declare type JointType = 'ball' | 'distance' | 'hinge' | 'slider'

/** The different ways the motor on a joint can be used. */
declare type MotorMode = 'position' | 'velocity'

/** Represents the different types of physics Shapes available. */
declare type ShapeType = 'box' | 'sphere' | 'capsule' | 'cylinder' | 'convex' | 'mesh' | 'terrain'

/** A BallJoint is a type of `Joint` that acts like a ball and socket between two colliders.  It allows the colliders to rotate freely around an anchor point, but does not allow the colliders' distance from the anchor point to change. */
declare interface BallJoint extends Joint {
}

/** A type of `Shape` that can be used for cubes or boxes. */
declare interface BoxShape extends Shape {
  /**
   * Returns the width, height, and depth of the BoxShape.
   * 
   * `[width, height, depth] = BoxShape.getDimensions()`
   * 
   * @returns 
   * width - The width of the box, in meters.
   * height - The height of the box, in meters.
   * depth - The depth of the box, in meters.
   */
  getDimensions(): LuaMultiReturn<[width: number, height: number, depth: number]>

  /**
   * Sets the width, height, and depth of the BoxShape.
   * 
   * `BoxShape.setDimensions(width, height, depth)`
   * 
   * @param width - The width of the box, in meters.
   * @param height - The height of the box, in meters.
   * @param depth - The depth of the box, in meters.
   * 
   * This changes the mass of the shape.  If the shape is attached to a collider with automatic mass enabled, the mass properties of the collider will update as well.
   * 
   * Changing shapes can make the physics engine explode since it can cause objects to overlap in unnatural ways.
   */
  setDimensions(width: number, height: number, depth: number): void

}

/** A type of `Shape` that can be used for capsule-shaped things. */
declare interface CapsuleShape extends Shape {
  /**
   * Returns the length of the CapsuleShape, not including the caps.
   * 
   * `length = CapsuleShape.getLength()`
   * 
   * @returns The length of the capsule, in meters.
   */
  getLength(): number

  /**
   * Returns the radius of the CapsuleShape.
   * 
   * `radius = CapsuleShape.getRadius()`
   * 
   * @returns The radius of the capsule, in meters.
   */
  getRadius(): number

  /**
   * Sets the length of the CapsuleShape.
   * 
   * `CapsuleShape.setLength(length)`
   * 
   * @param length - The new length, in meters, not including the caps.
   * 
   * This changes the mass of the shape.  If the shape is attached to a collider with automatic mass enabled, the mass properties of the collider will update as well.
   * 
   * Changing shapes can make the physics engine explode since it can cause objects to overlap in unnatural ways.
   */
  setLength(length: number): void

  /**
   * Sets the radius of the CapsuleShape.
   * 
   * `CapsuleShape.setRadius(radius)`
   * 
   * @param radius - The new radius, in meters.
   * 
   * This changes the mass of the shape.  If the shape is attached to a collider with automatic mass enabled, the mass properties of the collider will update as well.
   * 
   * Changing shapes can make the physics engine explode since it can cause objects to overlap in unnatural ways.
   */
  setRadius(radius: number): void

}

/** Colliders represent a single rigid body in the physics simulation. */
declare interface Collider extends LovrObject {
  /**
   * Attaches a Shape to the collider.
   * 
   * `Collider.addShape(shape)`
   * 
   * @param shape - The Shape to attach.
   * 
   * By default, LÖVR will recompute mass properties for the Collider as shapes are added and removed.  Use `Collider:setAutomaticMass` to enable or disable this behavior.
   * 
   * Shapes can only be attached to a single Collider.  Attempting to attach a shape to multiple colliders (or to a single collider multiple times) will error.  Use `Collider:removeShape` to remove shapes from their original collider before reattaching them.
   * 
   * Adding a `MeshShape` or a `TerrainShape` will force the Collider to be immobile.  It will immediately become kinematic, and will not move via velocity or forces.  However, it can still be repositioned with methods like `Collider:setPosition`.
   */
  addShape(shape: Shape): void

  /**
   * Applies an angular impulse to the Collider.
   * 
   * An impulse is a single instantaneous push.  Impulses are independent of time, and are meant to only be applied once.  Use `Collider:applyTorque` for a time-dependent push that happens over multiple frames.
   * 
   * `Collider.applyAngularImpulse(x, y, z)`
   * 
   * @param x - The x component of the world-space impulse vector, in newton meter seconds.
   * @param y - The y component of the world-space impulse vector, in newton meter seconds.
   * @param z - The z component of the world-space impulse vector, in newton meter seconds.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Impulses are accumulated and processed during `World:update`.
   */
  applyAngularImpulse(x: number, y: number, z: number): void

  /**
   * Applies an angular impulse to the Collider.
   * 
   * An impulse is a single instantaneous push.  Impulses are independent of time, and are meant to only be applied once.  Use `Collider:applyTorque` for a time-dependent push that happens over multiple frames.
   * 
   * `Collider.applyAngularImpulse(impulse)`
   * 
   * @param impulse - The world-space impulse vector, in newton meter seconds.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Impulses are accumulated and processed during `World:update`.
   */
  applyAngularImpulse(impulse: vector): void

  /**
   * Applies a force to the Collider.
   * 
   * `Collider.applyForce(x, y, z)`
   * 
   * Apply a force at the center of mass.
   * 
   * @param x - The x component of the world-space force vector, in newtons.
   * @param y - The y component of the world-space force vector, in newtons.
   * @param z - The z component of the world-space force vector, in newtons.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Forces are accumulated and processed during `World:update`.
   */
  applyForce(x: number, y: number, z: number): void

  /**
   * Applies a force to the Collider.
   * 
   * `Collider.applyForce(x, y, z, px, py, pz)`
   * 
   * Apply a force at a custom position.
   * 
   * @param x - The x component of the world-space force vector, in newtons.
   * @param y - The y component of the world-space force vector, in newtons.
   * @param z - The z component of the world-space force vector, in newtons.
   * @param px - The x position to apply the force at, in world space.
   * @param py - The y position to apply the force at, in world space.
   * @param pz - The z position to apply the force at, in world space.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Forces are accumulated and processed during `World:update`.
   */
  applyForce(x: number, y: number, z: number, px: number, py: number, pz: number): void

  /**
   * Applies a force to the Collider.
   * 
   * `Collider.applyForce(force)`
   * 
   * Apply a force at the center of mass, using vector types.
   * 
   * @param force - The world-space force vector, in newtons.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Forces are accumulated and processed during `World:update`.
   */
  applyForce(force: vector): void

  /**
   * Applies a force to the Collider.
   * 
   * `Collider.applyForce(force, position)`
   * 
   * Apply a force at a custom position, using vector types.
   * 
   * @param force - The world-space force vector, in newtons.
   * @param position - The position to apply the force at, in world space.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Forces are accumulated and processed during `World:update`.
   */
  applyForce(force: vector, position: vector): void

  /**
   * Applies a linear impulse to the Collider.
   * 
   * An impulse is a single instantaneous push.  Impulses are independent of time, and are meant to only be applied once.  Use `Collider:applyForce` for a time-dependent push that happens over multiple frames.
   * 
   * `Collider.applyLinearImpulse(x, y, z)`
   * 
   * Apply an impulse at the center of mass.
   * 
   * @param x - The x component of the world-space impulse vector, in newton seconds.
   * @param y - The y component of the world-space impulse vector, in newton seconds.
   * @param z - The z component of the world-space impulse vector, in newton seconds.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Impulses are accumulated and processed during `World:update`.
   */
  applyLinearImpulse(x: number, y: number, z: number): void

  /**
   * Applies a linear impulse to the Collider.
   * 
   * An impulse is a single instantaneous push.  Impulses are independent of time, and are meant to only be applied once.  Use `Collider:applyForce` for a time-dependent push that happens over multiple frames.
   * 
   * `Collider.applyLinearImpulse(x, y, z, px, py, pz)`
   * 
   * Apply an impulse at a custom position.
   * 
   * @param x - The x component of the world-space impulse vector, in newton seconds.
   * @param y - The y component of the world-space impulse vector, in newton seconds.
   * @param z - The z component of the world-space impulse vector, in newton seconds.
   * @param px - The x position to apply the impulse at, in world space.
   * @param py - The y position to apply the impulse at, in world space.
   * @param pz - The z position to apply the impulse at, in world space.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Impulses are accumulated and processed during `World:update`.
   */
  applyLinearImpulse(x: number, y: number, z: number, px: number, py: number, pz: number): void

  /**
   * Applies a linear impulse to the Collider.
   * 
   * An impulse is a single instantaneous push.  Impulses are independent of time, and are meant to only be applied once.  Use `Collider:applyForce` for a time-dependent push that happens over multiple frames.
   * 
   * `Collider.applyLinearImpulse(impulse)`
   * 
   * Apply an impulse at the center of mass, using vector types.
   * 
   * @param impulse - The world-space impulse vector, in newton seconds.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Impulses are accumulated and processed during `World:update`.
   */
  applyLinearImpulse(impulse: vector): void

  /**
   * Applies a linear impulse to the Collider.
   * 
   * An impulse is a single instantaneous push.  Impulses are independent of time, and are meant to only be applied once.  Use `Collider:applyForce` for a time-dependent push that happens over multiple frames.
   * 
   * `Collider.applyLinearImpulse(impulse, position)`
   * 
   * Apply an impulse at a custom position, using vector types.
   * 
   * @param impulse - The world-space impulse vector, in newton seconds.
   * @param position - The position to apply the impulse at, in world space.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Impulses are accumulated and processed during `World:update`.
   */
  applyLinearImpulse(impulse: vector, position: vector): void

  /**
   * Applies torque to the Collider.
   * 
   * `Collider.applyTorque(x, y, z)`
   * 
   * @param x - The x component of the world-space torque vector, in newton meters.
   * @param y - The y component of the world-space torque vector, in newton meters.
   * @param z - The z component of the world-space torque vector, in newton meters.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Forces are accumulated and processed during `World:update`.
   */
  applyTorque(x: number, y: number, z: number): void

  /**
   * Applies torque to the Collider.
   * 
   * `Collider.applyTorque(torque)`
   * 
   * @param torque - The world-space torque vector, in newton meters.
   * 
   * Kinematic colliders ignore forces.
   * 
   * If the Collider is asleep, this will wake it up.
   * 
   * Forces are accumulated and processed during `World:update`.
   */
  applyTorque(torque: vector): void

  /**
   * Destroys the Collider, removing it from the World and destroying all Shapes and Joints attached to it.
   * 
   * `Collider.destroy()`
   * 
   * After a Collider is destroyed, calling methods on it or passing it to a function will throw an error.
   */
  destroy(): void

  /**
   * Returns the world-space axis-aligned bounding box of the Collider, computed from attached shapes.
   * 
   * `[minx, maxx, miny, maxy, minz, maxz] = Collider.getAABB()`
   * 
   * @returns 
   * minx - The minimum x coordinate of the box.
   * maxx - The maximum x coordinate of the box.
   * miny - The minimum y coordinate of the box.
   * maxy - The maximum y coordinate of the box.
   * minz - The minimum z coordinate of the box.
   * maxz - The maximum z coordinate of the box.
   */
  getAABB(): LuaMultiReturn<[minx: number, maxx: number, miny: number, maxy: number, minz: number, maxz: number]>

  /**
   * Returns the angular damping of the Collider.  Angular damping is similar to drag or air resistance, reducing the Collider's angular velocity over time.
   * 
   * `damping = Collider.getAngularDamping()`
   * 
   * @returns The angular damping.
   * 
   * The default damping is .05, meaning the collider will lose approximately 5% of its angular velocity each second.  A damping value of zero means the Collider will not lose velocity over time.
   */
  getAngularDamping(): number

  /**
   * Returns the angular velocity of the Collider.
   * 
   * `[vx, vy, vz] = Collider.getAngularVelocity()`
   * 
   * @returns 
   * vx - The x component of the angular velocity.
   * vy - The y component of the angular velocity.
   * vz - The z component of the angular velocity.
   */
  getAngularVelocity(): LuaMultiReturn<[vx: number, vy: number, vz: number]>

  /**
   * Returns whether automatic mass is enabled for the Collider.
   * 
   * When enabled, the Collider's mass, inertia, and center of mass will be recomputed when:
   * 
   * - A shape is added to or removed from the Collider.
   * - A shape attached to the Collider changes shape (e.g. `SphereShape:setRadius`).
   * - A shape attached to the Collider is moved using `Shape:setOffset`.
   * - A shape attached to the Collider changes its density using `Shape:setDensity`.
   * 
   * Additionally, changing the center of mass of a Collider will automatically update its inertia when automatic mass is enabled.
   * 
   * Disable this to manage the mass properties manually.  When automatic mass is disabled, `Collider:resetMassData` can still be used to reset the mass from attached shapes if needed.
   * 
   * `enabled = Collider.getAutomaticMass()`
   * 
   * @returns Whether automatic mass is enabled.
   */
  getAutomaticMass(): boolean

  /**
   * Returns the Collider's center of mass, in the Collider's local coordinate space.
   * 
   * `[x, y, z] = Collider.getCenterOfMass()`
   * 
   * @returns 
   * x - The x component of the center of mass.
   * y - The y component of the center of mass.
   * z - The z component of the center of mass.
   * 
   * By default, the center of mass of the Collider is kept up to date automatically as the Collider's shapes change.  To disable this, use `Collider:setAutomaticMass`.
   * 
   * Use `Collider:resetMassData` to reset the center of mass and other mass properties based on the Collider's shapes.
   */
  getCenterOfMass(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Get the degrees of freedom of the Collider.
   * 
   * `[translation, rotation] = Collider.getDegreesOfFreedom()`
   * 
   * @returns 
   * translation - A string containing the world-space axes the Collider is allowed to move on.  The string will have 'x', 'y', and 'z' letters representing which axes are enabled.  If no axes are enabled then it will be an empty string.
   * rotation - A string containing the world-space axes the Collider is allowed to rotate around.  The string will have 'x', 'y', and 'z' letters representing which axes are enabled.  If no axes are enabled then it will be an empty string.
   * 
   * The default state is `xyz` for both translation and rotation.
   * 
   * The physics engine does not support disabling all degrees of freedom.  At least one translation or rotation axis needs to be enabled.  To disable all movement for a collider, make it kinematic.
   */
  getDegreesOfFreedom(): LuaMultiReturn<[translation: string, rotation: string]>

  /**
   * Returns the friction of the Collider.  Friction determines how easy it is for two colliders to slide against each other.  Low friction makes it easier for a collider to slide, simulating a smooth surface.
   * 
   * `friction = Collider.getFriction()`
   * 
   * @returns The friction of the Collider.
   * 
   * The default friction is .2.
   * 
   * When two colliders collide, their friction is combined using the geometric mean:
   * 
   *     friction = (frictionA * frictionB) ^ .5
   */
  getFriction(): number

  /**
   * Returns the gravity scale of the Collider.  This is multiplied with the global gravity from the World, so 1.0 is regular gravity, 0.0 will ignore gravity, etc.
   * 
   * `scale = Collider.getGravityScale()`
   * 
   * @returns The gravity scale.
   */
  getGravityScale(): number

  /**
   * Returns the inertia of the Collider.
   * 
   * Inertia is kind of like "angular mass".  Regular mass determines how resistant the Collider is to linear forces (movement), whereas inertia determines how resistant the Collider is to torque (rotation).  Colliders with less inertia are more spinny.
   * 
   * In 3D, inertia is represented by a 3x3 matrix, called a tensor.  To make calculations easier, the physics engine stores the inertia using eigenvalue decomposition, splitting the matrix into a diagonal matrix and a rotation.  It's complicated!
   * 
   * In a realistic simulation, mass and inertia follow a linear relationship.  If the mass of an object increases, the diagonal part of its inertia should increase proportionally.
   * 
   * `[dx, dy, dz, angle, ax, ay, az] = Collider.getInertia()`
   * 
   * @returns 
   * dx - The x component of the diagonal matrix.
   * dy - The y component of the diagonal matrix.
   * dz - The z component of the diagonal matrix.
   * angle - The angle of the inertia rotation.
   * ax - The x component of the inertia rotation axis.
   * ay - The y component of the inertia rotation axis.
   * az - The z component of the inertia rotation axis.
   * 
   * By default, the inertia of the Collider is kept up to date automatically as the Collider's shapes change.  To disable this, use `Collider:setAutomaticMass`.
   * 
   * Use `Collider:resetMassData` to reset the inertia and other mass properties based on the Collider's shapes.
   * 
   * If the Collider is kinematic or all rotation axes are disabled, this returns zeroes.
   */
  getInertia(): LuaMultiReturn<[dx: number, dy: number, dz: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns a list of Joints attached to the Collider.
   * 
   * `joints = Collider.getJoints()`
   * 
   * @returns A list of `Joint` objects attached to the Collider.
   */
  getJoints(): LuaTable

  /**
   * Returns the linear damping of the Collider.  Linear damping is similar to drag or air resistance, slowing the Collider down over time.
   * 
   * `damping = Collider.getLinearDamping()`
   * 
   * @returns The linear damping.
   * 
   * The default damping is .05, meaning the collider will lose approximately 5% of its velocity each second.  A damping value of zero means the Collider will not lose velocity over time.
   */
  getLinearDamping(): number

  /**
   * Returns the world-space linear velocity of the center of mass of the Collider, in meters per second.
   * 
   * `[vx, vy, vz] = Collider.getLinearVelocity()`
   * 
   * @returns 
   * vx - The x component of the velocity.
   * vy - The y component of the velocity.
   * vz - The z component of the velocity.
   * 
   * Currently, velocity is clamped to 500 meters per second to improve stability of the simulation.
   */
  getLinearVelocity(): LuaMultiReturn<[vx: number, vy: number, vz: number]>

  /**
   * Returns the linear velocity of a point on the Collider.  This includes the velocity of the center of mass plus the angular velocity at that point.
   * 
   * `[vx, vy, vz] = Collider.getLinearVelocityFromLocalPoint(x, y, z)`
   * 
   * @param x - The x position in local space.
   * @param y - The y position in local space.
   * @param z - The z position in local space.
   * @returns 
   * vx - The x velocity of the point.
   * vy - The y velocity of the point.
   * vz - The z velocity of the point.
   */
  getLinearVelocityFromLocalPoint(x: number, y: number, z: number): LuaMultiReturn<[vx: number, vy: number, vz: number]>

  /**
   * Returns the linear velocity of a point on the Collider.  This includes the velocity of the center of mass plus the angular velocity at that point.
   * 
   * `[vx, vy, vz] = Collider.getLinearVelocityFromLocalPoint(point)`
   * 
   * @param point - The local-space point.
   * @returns 
   * vx - The x velocity of the point.
   * vy - The y velocity of the point.
   * vz - The z velocity of the point.
   */
  getLinearVelocityFromLocalPoint(point: vector): LuaMultiReturn<[vx: number, vy: number, vz: number]>

  /**
   * Returns the linear velocity of a point on the Collider.  This includes the velocity of the center of mass plus the angular velocity at that point.
   * 
   * `[vx, vy, vz] = Collider.getLinearVelocityFromWorldPoint(x, y, z)`
   * 
   * @param x - The x position in world space.
   * @param y - The y position in world space.
   * @param z - The z position in world space.
   * @returns 
   * vx - The x velocity of the point.
   * vy - The y velocity of the point.
   * vz - The z velocity of the point.
   */
  getLinearVelocityFromWorldPoint(x: number, y: number, z: number): LuaMultiReturn<[vx: number, vy: number, vz: number]>

  /**
   * Returns the linear velocity of a point on the Collider.  This includes the velocity of the center of mass plus the angular velocity at that point.
   * 
   * `[vx, vy, vz] = Collider.getLinearVelocityFromWorldPoint(point)`
   * 
   * @param point - The world-space point.
   * @returns 
   * vx - The x velocity of the point.
   * vy - The y velocity of the point.
   * vz - The z velocity of the point.
   */
  getLinearVelocityFromWorldPoint(point: vector): LuaMultiReturn<[vx: number, vy: number, vz: number]>

  /**
   * Transforms a point from world coordinates into local coordinates relative to the Collider.
   * 
   * `[x, y, z] = Collider.getLocalPoint(wx, wy, wz)`
   * 
   * @param wx - The x component of the world point.
   * @param wy - The y component of the world point.
   * @param wz - The z component of the world point.
   * @returns 
   * x - The x component of the local point.
   * y - The y component of the local point.
   * z - The z component of the local point.
   */
  getLocalPoint(wx: number, wy: number, wz: number): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Transforms a point from world coordinates into local coordinates relative to the Collider.
   * 
   * `[x, y, z] = Collider.getLocalPoint(point)`
   * 
   * @param point - The world point.
   * @returns 
   * x - The x component of the local point.
   * y - The y component of the local point.
   * z - The z component of the local point.
   */
  getLocalPoint(point: vector): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Transforms a direction vector from world space to local space.
   * 
   * `[x, y, z] = Collider.getLocalVector(wx, wy, wz)`
   * 
   * @param wx - The x component of the world vector.
   * @param wy - The y component of the world vector.
   * @param wz - The z component of the world vector.
   * @returns 
   * x - The x component of the local vector.
   * y - The y component of the local vector.
   * z - The z component of the local vector.
   */
  getLocalVector(wx: number, wy: number, wz: number): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Transforms a direction vector from world space to local space.
   * 
   * `[x, y, z] = Collider.getLocalVector(vector)`
   * 
   * @param vector - The world vector.
   * @returns 
   * x - The x component of the local vector.
   * y - The y component of the local vector.
   * z - The z component of the local vector.
   */
  getLocalVector(vector: vector): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the mass of the Collider.
   * 
   * The relative mass of colliders determines how they react when they collide.  A heavier collider has more momentum than a lighter collider moving the same speed, and will impart more force on the lighter collider.
   * 
   * More generally, heavier colliders react less to forces they receive, including forces applied with functions like `Collider:applyForce`.
   * 
   * Colliders with higher mass do not fall faster.  Use `Collider:setLinearDamping` to give a collider drag to make it fall slower or `Collider:setGravityScale` to change the way it reacts to gravity.
   * 
   * `mass = Collider.getMass()`
   * 
   * @returns The mass of the Collider, in kilograms.
   * 
   * By default, the mass of the Collider will be kept up to date automatically as shapes are added and removed from the Collider (or if the shapes change size or density).  Use `Collider:setAutomaticMass` to customize this.
   * 
   * Mass can be overridden with `Collider:setMass`, or recomputed from the attached shapes with `Collider:resetMassData`.
   * 
   * If the Collider is kinematic or all translation axes are disabled, this returns 0.
   */
  getMass(): number

  /**
   * Returns the orientation of the Collider in angle/axis representation.
   * 
   * `[angle, ax, ay, az] = Collider.getOrientation()`
   * 
   * @returns 
   * angle - The number of radians the Collider is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   * 
   * If `World:interpolate` has been called, this returns an interpolated orientation between the last two physics updates.
   */
  getOrientation(): LuaMultiReturn<[angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the position and orientation of the Collider.
   * 
   * `[x, y, z, angle, ax, ay, az] = Collider.getPose()`
   * 
   * @returns 
   * x - The x position of the Collider, in meters.
   * y - The y position of the Collider, in meters.
   * z - The z position of the Collider, in meters.
   * angle - The number of radians the Collider is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   * 
   * If `World:interpolate` has been called, this returns an interpolated pose between the last two physics updates.
   */
  getPose(): LuaMultiReturn<[x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the position of the Collider.
   * 
   * `[x, y, z] = Collider.getPosition()`
   * 
   * @returns 
   * x - The x position of the Collider, in meters.
   * y - The y position of the Collider, in meters.
   * z - The z position of the Collider, in meters.
   * 
   * If `World:interpolate` has been called, this returns an interpolated position between the last two physics updates.
   */
  getPosition(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the restitution of the Collider.  Restitution makes a Collider bounce when it collides with other objects.  A restitution value of zero would result in an inelastic collision response, whereas 1.0 would result in an elastic collision that preserves all of the velocity. The restitution can be bigger than 1.0 to make the collision even more bouncy.
   * 
   * `restitution = Collider.getRestitution()`
   * 
   * @returns The restitution of the Collider.
   * 
   * To improve stability of the simulation and allow colliders to come to rest, restitution is only applied if the collider is moving above a certain speed.  This can be configured using the `restitutionThreshold` option in `lovr.physics.newWorld`.
   */
  getRestitution(): number

  /**
   * Returns a Shape attached to the Collider.
   * 
   * For the common case where a Collider only has a single shape, this is more convenient and efficient than extracting it from the table returned by `Collider:getShapes`.  It is always equivalent to `Collider:getShapes()[1]`.
   * 
   * `shape = Collider.getShape()`
   * 
   * @returns One of the `Shape` objects attached to the Collider, or `nil` if the Collider doesn't have any shapes attached to it.
   */
  getShape(): Shape | undefined

  /**
   * Returns a list of Shapes attached to the Collider.
   * 
   * `shapes = Collider.getShapes()`
   * 
   * @returns A list of `Shape` objects attached to the Collider.
   */
  getShapes(): LuaTable

  /**
   * Returns the Collider's tag.
   * 
   * Tags are strings that represent the category of a collider.  Use `World:enableCollisionBetween` and `World:disableCollisionBetween` to control which pairs of tags should collide with each other.  Physics queries like `World:raycast` also use tags to filter their results.
   * 
   * The list of available tags is set in `lovr.physics.newWorld`.
   * 
   * `tag = Collider.getTag()`
   * 
   * @returns The Collider's tag.
   */
  getTag(): string | undefined

  /**
   * Returns the Lua value associated with the Collider.
   * 
   * `data = Collider.getUserData()`
   * 
   * @returns The custom value associated with the Collider.
   * 
   * The userdata is useful for linking a Collider with custom data:
   * 
   *     local collider = world:raycast(origin, direction, 'enemy')
   * 
   *     if collider then
   *       -- Get the enemy object from its Collider
   *       local enemy = collider:getUserData()
   *       enemy.health = 0
   *     end
   * 
   * The user data is not shared between threads.  Each thread has its own user data for the Collider.
   */
  getUserData(): any

  /**
   * Returns the World the Collider is in.
   * 
   * `world = Collider.getWorld()`
   * 
   * @returns The World the Collider is in.
   * 
   * Colliders can only ever be in the World that created them.
   */
  getWorld(): World

  /**
   * Transforms a local point relative to the collider to a point in world coordinates.
   * 
   * `[wx, wy, wz] = Collider.getWorldPoint(x, y, z)`
   * 
   * @param x - The x component of the local point.
   * @param y - The y component of the local point.
   * @param z - The z component of the local point.
   * @returns 
   * wx - The x component of the world point.
   * wy - The y component of the world point.
   * wz - The z component of the world point.
   */
  getWorldPoint(x: number, y: number, z: number): LuaMultiReturn<[wx: number, wy: number, wz: number]>

  /**
   * Transforms a local point relative to the collider to a point in world coordinates.
   * 
   * `[wx, wy, wz] = Collider.getWorldPoint(point)`
   * 
   * @param point - The local point.
   * @returns 
   * wx - The x component of the world point.
   * wy - The y component of the world point.
   * wz - The z component of the world point.
   */
  getWorldPoint(point: vector): LuaMultiReturn<[wx: number, wy: number, wz: number]>

  /**
   * Transforms a direction vector from local space to world space.
   * 
   * `[wx, wy, wz] = Collider.getWorldVector(x, y, z)`
   * 
   * @param x - The x component of the local vector.
   * @param y - The y component of the local vector.
   * @param z - The z component of the local vector.
   * @returns 
   * wx - The x component of the world vector.
   * wy - The y component of the world vector.
   * wz - The z component of the world vector.
   */
  getWorldVector(x: number, y: number, z: number): LuaMultiReturn<[wx: number, wy: number, wz: number]>

  /**
   * Transforms a direction vector from local space to world space.
   * 
   * `[wx, wy, wz] = Collider.getWorldVector(vector)`
   * 
   * @param vector - The local vector.
   * @returns 
   * wx - The x component of the world vector.
   * wy - The y component of the world vector.
   * wz - The z component of the world vector.
   */
  getWorldVector(vector: vector): LuaMultiReturn<[wx: number, wy: number, wz: number]>

  /**
   * Returns whether the Collider is awake.
   * 
   * `awake = Collider.isAwake()`
   * 
   * @returns Whether the Collider is finally awake.
   * 
   * See `Collider:setSleepingAllowed` for notes about sleeping.
   */
  isAwake(): boolean

  /**
   * Returns whether the Collider uses continuous collision detection.
   * 
   * Normally on each timestep a Collider will "teleport" to its new position based on its velocity. Usually this works fine, but if a Collider is going really fast relative to its size, then it might miss collisions with objects or pass through walls.  Enabling continuous collision detection means the Collider will check for obstacles along its path before moving to the new location.  This prevents the Collider from going through walls, but reduces performance.  It's usually used for projectiles, which tend to be small and really fast.
   * 
   * `continuous = Collider.isContinuous()`
   * 
   * @returns Whether the Collider uses continuous collision detection.
   * 
   * The physics engine performs an optimization where continuous collision detection is only used if the Collider is moving faster than 75% of its size.  So it is not necessary to enable and disable continuous collision detection based on how fast the Collider is moving.
   * 
   * Colliders that are sensors are not able to use continuous collision detection.
   */
  isContinuous(): boolean

  /**
   * Returns whether the collider has been destroyed.
   * 
   * `destroyed = Collider.isDestroyed()`
   * 
   * @returns Whether the collider has been destroyed.
   * 
   * After a Collider is destroyed, calling methods on it or passing it to a function will throw an error.
   */
  isDestroyed(): boolean

  /**
   * Returns whether the Collider is enabled.  When a Collider is disabled, it is removed from the World and does not impact the physics simulation in any way.  The Collider keeps all of its state and can be re-enabled to add it back to the World.
   * 
   * `enabled = Collider.isEnabled()`
   * 
   * @returns Whether the Collider is enabled.
   * 
   * Colliders are enabled when they are created.
   */
  isEnabled(): boolean

  /**
   * Returns whether the Collider is currently ignoring gravity.
   * 
   * `ignored = Collider.isGravityIgnored()`
   * 
   * @returns Whether gravity is ignored for this Collider.
   */
  isGravityIgnored(): boolean

  /**
   * Returns whether the Collider is kinematic.
   * 
   * Kinematic colliders behave like they have infinite mass.  They ignore forces applied to them from gravity, joints, and collisions, but they can still move if given a velocity.  Kinematic colliders don't collide with other kinematic colliders.  They're useful for static environment objects in a level, or for objects that have their position managed outside of the physics system like tracked hands.
   * 
   * `kinematic = Collider.isKinematic()`
   * 
   * @returns Whether the Collider is kinematic.
   * 
   * If a Collider has a `MeshShape` or a `TerrainShape`, it will always be kinematic.
   */
  isKinematic(): boolean

  /**
   * Returns whether the Collider is a sensor.  Sensors do not collide with other objects, but they can still sense collisions with the collision callbacks set by `World:setCallbacks`.  Use them to trigger gameplay behavior when an object is inside a region of space.
   * 
   * `sensor = Collider.isSensor()`
   * 
   * @returns Whether the Collider is a sensor.
   * 
   * Sensors are still reported as hits when doing raycasts and other queries.  Use tags to ignore sensors if needed.
   * 
   * When a World is created, a set of collision tags can be marked as "static", for performance. Sensors do not detect collision with colliders that have a static tag.  Also, if a sensor itself has a static tag, it will not be able to detect collisions with sleeping colliders.  If a Collider enters a static sensor and goes to sleep, the `exit` callback is called and the sensor is no longer able to detect that collider.
   * 
   * Sensors can not use continuous collision detection.
   * 
   * Sensors will never go to sleep.
   */
  isSensor(): boolean

  /**
   * Returns whether the Collider is allowed to automatically go to sleep.
   * 
   * When enabled, the Collider will go to sleep if it hasn't moved in a while.  The physics engine does not simulate movement for colliders that are asleep, which saves a lot of CPU for a typical physics world where most objects are at rest at any given time.
   * 
   * `sleepy = Collider.isSleepingAllowed()`
   * 
   * @returns Whether the Collider can go to sleep.
   * 
   * Sleeping is enabled by default.  Sleeping can be disabled globally using the `allowSleep` option in `lovr.physics.newWorld`.
   * 
   * Colliders can still be put to sleep manually with `Collider:setAwake`, even if automatic sleeping is disabled.
   * 
   * Sleeping colliders will wake up when:
   * 
   * - Colliding with a moving collider
   * - Awakened explicitly with `Collider:setAwake`
   * - Changing position `Collider:setPosition` or `Collider:setOrientation`
   * - Changing velocity (to something non-zero)
   * - Applying force, torque, or an impulse
   * - Enabling a joint connected to the sleeping collider
   * 
   * Notably, the following will not wake up the collider:
   * 
   * - Changing its kinematic state with `Collider:setKinematic`
   * - Changing its shape with `Collider:addShape` or `Collider:removeShape`
   * - Disabling or destroying a sleeping collider it is resting on
   * 
   * Sensors will never go to sleep.
   */
  isSleepingAllowed(): boolean

  /**
   * TODO
   * 
   * `Collider.moveKinematic()`
   * 
   * 
   */
  moveKinematic(): void

  /**
   * Removes a Shape from the Collider.
   * 
   * `Collider.removeShape(shape)`
   * 
   * @param shape - The Shape to remove.
   * 
   * By default, LÖVR will recompute mass properties for the Collider as shapes are added and removed.  Use `Collider:setAutomaticMass` to enable or disable this behavior.
   * 
   * It is valid for a Collider to have zero shapes, but due to a limitation of the physics engine LÖVR substitutes in a 1mm sphere so that the Collider still has mass.  It isn't advisable to keep these tiny spheres around.  Instead, prefer to quickly attach other shapes, or disable the Collider with `Collider:setEnabled`.
   */
  removeShape(shape: Shape): void

  /**
   * Resets the mass, inertia, and center of mass of the Collider based on its attached shapes.
   * 
   * If automatic mass is enabled, these properties will be kept up to date automatically.  Use this function when automatic mass is disabled or if mass needs to be reset after being overridden.
   * 
   * `Collider.resetMassData()`
   */
  resetMassData(): void

  /**
   * Sets the angular damping of the Collider.  Angular damping is similar to drag or air resistance, reducing the Collider's angular velocity over time.
   * 
   * `Collider.setAngularDamping(damping)`
   * 
   * @param damping - The angular damping.
   * 
   * The default damping is .05, meaning the collider will lose approximately 5% of its velocity each second.  A damping value of zero means the Collider will not lose velocity over time.
   * 
   * Negative damping is not meaningful and will be clamped to zero.
   */
  setAngularDamping(damping: number): void

  /**
   * Sets the angular velocity of the Collider.
   * 
   * `Collider.setAngularVelocity(vx, vy, vz)`
   * 
   * Sets the angular velocity of the Collider using numbers.
   * 
   * @param vx - The x component of the angular velocity.
   * @param vy - The y component of the angular velocity.
   * @param vz - The z component of the angular velocity.
   * 
   * Although setting the velocity directly is useful sometimes, it can cause problems:
   * 
   * - Velocity ignores mass, so it can lead to unnaturally sharp changes in motion.
   * - If the velocity of a Collider is changed multiple times during a frame, only the last one is
   *   going to have an effect, nullifying the other velocities that were set.
   * - Setting the velocity of a Collider every frame can mess up collisions, since the forces used
   *   to resolve a collision will get ignored by changing the velocity.
   * 
   * Using forces and impulses to move Colliders will avoid all of these issues.
   * 
   * If the Collider is asleep, setting the angular velocity to a non-zero value will wake it up.
   * 
   * If the Collider has a tag that was marked as static when the World was created, then the Collider can not move and this function will do nothing.
   */
  setAngularVelocity(vx: number, vy: number, vz: number): void

  /**
   * Sets the angular velocity of the Collider.
   * 
   * `Collider.setAngularVelocity(velocity)`
   * 
   * Sets the angular velocity of the Collider using a vector.
   * 
   * @param velocity - The angular velocity of the Collider.
   * 
   * Although setting the velocity directly is useful sometimes, it can cause problems:
   * 
   * - Velocity ignores mass, so it can lead to unnaturally sharp changes in motion.
   * - If the velocity of a Collider is changed multiple times during a frame, only the last one is
   *   going to have an effect, nullifying the other velocities that were set.
   * - Setting the velocity of a Collider every frame can mess up collisions, since the forces used
   *   to resolve a collision will get ignored by changing the velocity.
   * 
   * Using forces and impulses to move Colliders will avoid all of these issues.
   * 
   * If the Collider is asleep, setting the angular velocity to a non-zero value will wake it up.
   * 
   * If the Collider has a tag that was marked as static when the World was created, then the Collider can not move and this function will do nothing.
   */
  setAngularVelocity(velocity: vector): void

  /**
   * Enables or disables automatic mass for the Collider.
   * 
   * When enabled, the Collider's mass, inertia, and center of mass will be recomputed when:
   * 
   * - A shape is added to or removed from the Collider.
   * - A shape attached to the Collider changes shape (e.g. `SphereShape:setRadius`).
   * - A shape attached to the Collider is moved using `Shape:setOffset`.
   * - A shape attached to the Collider changes its density using `Shape:setDensity`.
   * 
   * Additionally, changing the center of mass of a Collider will automatically update its inertia when automatic mass is enabled.
   * 
   * Disable this to manage the mass properties manually.  When automatic mass is disabled, `Collider:resetMassData` can still be used to reset the mass from attached shapes if needed.
   * 
   * `Collider.setAutomaticMass(enable)`
   * 
   * @param enable - Whether automatic mass should be enabled.
   */
  setAutomaticMass(enable: boolean): void

  /**
   * Puts the Collider to sleep or wakes it up manually.
   * 
   * `Collider.setAwake(awake)`
   * 
   * @param awake - Whether the Collider should be awake.
   * 
   * This function can still be used to put a Collider to sleep even if automatic sleeping has been disabled with `Collider:setSleepingAllowed`.
   */
  setAwake(awake: boolean): void

  /**
   * Sets the Collider's center of mass, in the Collider's local coordinate space.
   * 
   * This does not change the Collider's position.
   * 
   * `Collider.setCenterOfMass(x, y, z)`
   * 
   * @param x - The x component of the center of mass.
   * @param y - The y component of the center of mass.
   * @param z - The z component of the center of mass.
   * 
   * By default, the center of mass of the Collider is kept up to date automatically as the Collider's shapes change.  To disable this, use `Collider:setAutomaticMass`.
   * 
   * Use `Collider:resetMassData` to reset the center and other mass properties based on the Collider's shapes.
   */
  setCenterOfMass(x: number, y: number, z: number): void

  /**
   * Sets the Collider's center of mass, in the Collider's local coordinate space.
   * 
   * This does not change the Collider's position.
   * 
   * `Collider.setCenterOfMass(center)`
   * 
   * @param center - The center of mass.
   * 
   * By default, the center of mass of the Collider is kept up to date automatically as the Collider's shapes change.  To disable this, use `Collider:setAutomaticMass`.
   * 
   * Use `Collider:resetMassData` to reset the center and other mass properties based on the Collider's shapes.
   */
  setCenterOfMass(center: vector): void

  /**
   * Sets whether the Collider uses continuous collision detection.
   * 
   * Normally on each timestep a Collider will "teleport" to its new position based on its velocity. Usually this works fine, but if a Collider is going really fast relative to its size, then it might miss collisions with objects or pass through walls.  Enabling continuous collision detection means the Collider will check for obstacles along its path before moving to the new location.  This prevents the Collider from going through walls, but reduces performance.  It's usually used for projectiles, which tend to be small and really fast.
   * 
   * `Collider.setContinuous(continuous)`
   * 
   * @param continuous - Whether the Collider uses continuous collision detection.
   * 
   * The physics engine performs an optimization where continuous collision detection is only used if the Collider is moving faster than 75% of its size.  So it is not necessary to enable and disable continuous collision detection based on how fast the Collider is moving.
   * 
   * Colliders that are sensors are not able to use continuous collision detection.
   */
  setContinuous(continuous: boolean): void

  /**
   * Set the degrees of freedom of the Collider.
   * 
   * `Collider.setDegreesOfFreedom(translation, rotation)`
   * 
   * @param translation - A string containing the world-space axes the Collider is allowed to move on.  The string should have 'x', 'y', and 'z' letters representing the axes to enable.  Use nil or an empty string to disable all translation.
   * @param rotation - A string containing the world-space axes the Collider is allowed to rotate on.  The string should have 'x', 'y', and 'z' letters representing the axes to enable.  Use nil or an empty string to disable all rotation.
   * 
   * The default state is `xyz` for both translation and rotation.
   * 
   * The physics engine does not support disabling all degrees of freedom.  At least one translation or rotation axis needs to be enabled.  To disable all movement for a collider, make it kinematic.
   * 
   * When all translation axes are disabled, `Collider:getMass` will return 0.
   * 
   * When all rotation axes are disabled, `Collider:getInertia` will return zero/identity.
   * 
   * This function does nothing if the Collider is kinematic.
   */
  setDegreesOfFreedom(translation?: string, rotation?: string): void

  /**
   * Enables or disables the Collider.  When a Collider is disabled, it is removed from the World and does not impact the physics simulation in any way.  The Collider keeps all of its state and can be re-enabled to add it back to the World.
   * 
   * `Collider.setEnabled(enable)`
   * 
   * @param enable - Whether the Collider should be enabled.
   */
  setEnabled(enable: boolean): void

  /**
   * Sets the friction of the Collider.  Friction determines how easy it is for two colliders to slide against each other.  Low friction makes it easier for a collider to slide, simulating a smooth surface.
   * 
   * `Collider.setFriction(friction)`
   * 
   * @param friction - The friction of the Collider.
   * 
   * The default friction is .2.
   * 
   * When two colliders collide, their friction is combined using the geometric mean:
   * 
   *     friction = (frictionA * frictionB) ^ .5
   */
  setFriction(friction: number): void

  /**
   * Sets whether the Collider should ignore gravity.
   * 
   * `Collider.setGravityIgnored(ignored)`
   * 
   * @param ignored - Whether gravity should be ignored.
   */
  setGravityIgnored(ignored: boolean): void

  /**
   * Sets the gravity scale of the Collider.  This is multiplied with the global gravity from the World, so 1.0 is regular gravity, 0.0 will ignore gravity, etc.
   * 
   * `Collider.setGravityScale(scale)`
   * 
   * @param scale - The gravity scale.
   */
  setGravityScale(scale: number): void

  /**
   * Sets the inertia of the Collider.
   * 
   * Inertia is kind of like "angular mass".  Regular mass determines how resistant the Collider is to linear forces (movement), whereas inertia determines how resistant the Collider is to torque (rotation).  Colliders with less inertia are more spinny.
   * 
   * In 3D, inertia is represented by a 3x3 matrix, called a tensor.  To make calculations easier, the physics engine stores the inertia using eigenvalue decomposition, splitting the matrix into a diagonal matrix and a rotation.  It's complicated!
   * 
   * In a realistic simulation, mass and inertia follow a linear relationship.  If the mass of an object increases, the diagonal part of its inertia should increase proportionally.
   * 
   * `Collider.setInertia(dx, dy, dz, angle, ax, ay, az)`
   * 
   * @param dx - The x component of the diagonal matrix.
   * @param dy - The y component of the diagonal matrix.
   * @param dz - The z component of the diagonal matrix.
   * @param angle - The angle of the inertia rotation, in radians.
   * @param ax - The x component of the rotation axis.
   * @param ay - The y component of the rotation axis.
   * @param az - The z component of the rotation axis.
   * 
   * By default, the inertia of the Collider is kept up to date automatically as the Collider's shapes change.  To disable this, use `Collider:setAutomaticMass`.
   * 
   * Use `Collider:resetMassData` to reset the inertia and other mass properties based on the Collider's shapes.
   * 
   * If the Collider is kinematic or all rotation axes are disabled, the collider behaves as though it has infinite inertia, and this function will do nothing.
   */
  setInertia(dx: number, dy: number, dz: number, angle: number, ax: number, ay: number, az: number): void

  /**
   * Sets the inertia of the Collider.
   * 
   * Inertia is kind of like "angular mass".  Regular mass determines how resistant the Collider is to linear forces (movement), whereas inertia determines how resistant the Collider is to torque (rotation).  Colliders with less inertia are more spinny.
   * 
   * In 3D, inertia is represented by a 3x3 matrix, called a tensor.  To make calculations easier, the physics engine stores the inertia using eigenvalue decomposition, splitting the matrix into a diagonal matrix and a rotation.  It's complicated!
   * 
   * In a realistic simulation, mass and inertia follow a linear relationship.  If the mass of an object increases, the diagonal part of its inertia should increase proportionally.
   * 
   * `Collider.setInertia(diagonal, rotation)`
   * 
   * @param diagonal - A vector containing the 3 elements of a diagonal matrix.
   * @param rotation - The inertia rotation.
   * 
   * By default, the inertia of the Collider is kept up to date automatically as the Collider's shapes change.  To disable this, use `Collider:setAutomaticMass`.
   * 
   * Use `Collider:resetMassData` to reset the inertia and other mass properties based on the Collider's shapes.
   * 
   * If the Collider is kinematic or all rotation axes are disabled, the collider behaves as though it has infinite inertia, and this function will do nothing.
   */
  setInertia(diagonal: vector, rotation: quaternion): void

  /**
   * Sets whether the Collider is kinematic.
   * 
   * Kinematic colliders behave like they have infinite mass.  They ignore forces applied to them from gravity, joints, and collisions, but they can still move if given a velocity.  Kinematic colliders don't collide with other kinematic colliders.  They're useful for static environment objects in a level, or for objects that have their position managed outside of the physics system like tracked hands.
   * 
   * `Collider.setKinematic(kinematic)`
   * 
   * @param kinematic - Whether the Collider should be kinematic.
   * 
   * If a Collider has a `MeshShape` or a `TerrainShape`, the collider will always be kinematic and this function will do nothing.
   */
  setKinematic(kinematic: boolean): void

  /**
   * Sets the linear damping of the Collider.  Linear damping is similar to drag or air resistance, slowing the Collider down over time.
   * 
   * `Collider.setLinearDamping(damping)`
   * 
   * @param damping - The linear damping.
   * 
   * The default damping is .05, meaning the collider will lose approximately 5% of its velocity each second.  A damping value of zero means the Collider will not lose velocity over time.
   * 
   * Negative damping is not meaningful and will be clamped to zero.
   */
  setLinearDamping(damping: number): void

  /**
   * Sets the world-space linear velocity of the center of mass of the Collider.
   * 
   * `Collider.setLinearVelocity(vx, vy, vz)`
   * 
   * Set the linear velocity of the collider using numbers.
   * 
   * @param vx - The x component of the new velocity, in meters per second.
   * @param vy - The y component of the new velocity, in meters per second.
   * @param vz - The z component of the new velocity, in meters per second.
   * 
   * Although setting the velocity directly is useful sometimes, it can cause problems:
   * 
   * - Velocity ignores mass, so it can lead to unnaturally sharp changes in motion.
   * - If the velocity of a Collider is changed multiple times during a frame, only the last one is
   *   going to have an effect, nullifying the other velocities that were set.
   * - Setting the velocity of a Collider every frame can mess up collisions, since the forces used
   *   to resolve a collision will get ignored by changing the velocity.
   * 
   * Using forces and impulses to move Colliders will avoid all of these issues.
   * 
   * If the Collider is asleep, setting the velocity to a non-zero value will wake it up.
   * 
   * If the Collider has a tag that was marked as static when the World was created, then the Collider can not move and this function will do nothing.
   * 
   * Currently, velocity is clamped to 500 meters per second to improve stability of the simulation.
   */
  setLinearVelocity(vx: number, vy: number, vz: number): void

  /**
   * Sets the world-space linear velocity of the center of mass of the Collider.
   * 
   * `Collider.setLinearVelocity(velocity)`
   * 
   * Set the linear velocity of the collider using a vector.
   * 
   * @param velocity - The new velocity, in meters per second.
   * 
   * Although setting the velocity directly is useful sometimes, it can cause problems:
   * 
   * - Velocity ignores mass, so it can lead to unnaturally sharp changes in motion.
   * - If the velocity of a Collider is changed multiple times during a frame, only the last one is
   *   going to have an effect, nullifying the other velocities that were set.
   * - Setting the velocity of a Collider every frame can mess up collisions, since the forces used
   *   to resolve a collision will get ignored by changing the velocity.
   * 
   * Using forces and impulses to move Colliders will avoid all of these issues.
   * 
   * If the Collider is asleep, setting the velocity to a non-zero value will wake it up.
   * 
   * If the Collider has a tag that was marked as static when the World was created, then the Collider can not move and this function will do nothing.
   * 
   * Currently, velocity is clamped to 500 meters per second to improve stability of the simulation.
   */
  setLinearVelocity(velocity: vector): void

  /**
   * Sets the mass of the Collider.
   * 
   * The relative mass of colliders determines how they react when they collide.  A heavier collider has more momentum than a lighter collider moving the same speed, and will impart more force on the lighter collider.
   * 
   * More generally, heavier colliders react less to forces they receive, including forces applied with functions like `Collider:applyForce`.
   * 
   * Colliders with higher mass do not fall faster.  Use `Collider:setLinearDamping` to give a collider drag to make it fall slower or `Collider:setGravityScale` to change the way it reacts to gravity.
   * 
   * `Collider.setMass(mass)`
   * 
   * @param mass - The new mass for the Collider, in kilograms.
   * 
   * The mass must be positive.  Attempting to set a zero or negative mass will error.
   * 
   * By default, the mass of the Collider is kept up to date automatically as the Collider's shapes change.  Use `Collider:setAutomaticMass` to disable this.
   * 
   * Use `Collider:resetMassData` to reset the mass based on the Collider's shapes.
   * 
   * If the Collider is kinematic or all translation axes are disabled, this function will do nothing.
   */
  setMass(mass: number): void

  /**
   * Sets the orientation of the Collider in angle/axis representation.
   * 
   * `Collider.setOrientation(angle, ax, ay, az)`
   * 
   * Set the orientation of the Collider using numbers.
   * 
   * @param angle - The number of radians the Collider is rotated around its axis of rotation.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   */
  setOrientation(angle: number, ax: number, ay: number, az: number): void

  /**
   * Sets the orientation of the Collider in angle/axis representation.
   * 
   * `Collider.setOrientation(orientation)`
   * 
   * Set the orientation of the Collider using a quaternion.
   * 
   * @param orientation - The orientation of the Collider.
   */
  setOrientation(orientation: quaternion): void

  /**
   * Sets the position and orientation of the Collider.
   * 
   * `Collider.setPose(x, y, z, angle, ax, ay, az)`
   * 
   * Set the pose of the Collider using numbers.
   * 
   * @param x - The x position of the Collider, in meters.
   * @param y - The y position of the Collider, in meters.
   * @param z - The z position of the Collider, in meters.
   * @param angle - The number of radians the Collider is rotated around its axis of rotation.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   */
  setPose(x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number): void

  /**
   * Sets the position and orientation of the Collider.
   * 
   * `Collider.setPose(position, orientation)`
   * 
   * Set the pose of the Collider using vector types.
   * 
   * @param position - The position of the Collider, in meters.
   * @param orientation - The orientation of the Collider.
   */
  setPose(position: vector, orientation: quaternion): void

  /**
   * Sets the position of the Collider.
   * 
   * `Collider.setPosition(x, y, z)`
   * 
   * Set the position of the Collider using numbers.
   * 
   * @param x - The x position of the Collider, in meters.
   * @param y - The y position of the Collider, in meters.
   * @param z - The z position of the Collider, in meters.
   */
  setPosition(x: number, y: number, z: number): void

  /**
   * Sets the position of the Collider.
   * 
   * `Collider.setPosition(position)`
   * 
   * Set the position of the Collider using a vector.
   * 
   * @param position - The position of the Collider, in meters.
   */
  setPosition(position: vector): void

  /**
   * Sets the restitution of the Collider.  Restitution makes a Collider bounce when it collides with other objects.  A restitution value of zero would result in an inelastic collision response, whereas 1.0 would result in an elastic collision that preserves all of the velocity.
   * 
   * `Collider.setRestitution(restitution)`
   * 
   * @param restitution - The restitution of the Collider.
   * 
   * To improve stability of the simulation and allow colliders to come to rest, restitution is only applied if the collider is moving above a certain speed.  This can be configured using the `restitutionThreshold` option in `lovr.physics.newWorld`.
   * 
   * Negative restitution is not meaningful and is clamped to zero.
   */
  setRestitution(restitution: number): void

  /**
   * Sets whether the Collider should be a sensor.  Sensors do not collide with other objects, but they can still sense collisions with the collision callbacks set by `World:setCallbacks`.  Use them to trigger gameplay behavior when an object is inside a region of space.
   * 
   * `Collider.setSensor(sensor)`
   * 
   * @param sensor - Whether the Collider should be a sensor.
   * 
   * Sensors are still reported as hits when doing raycasts and other queries.  Use tags to ignore sensors if needed.
   * 
   * When a World is created, a set of collision tags can be marked as "static", for performance. Sensors do not detect collision with colliders that have a static tag.  Also, if a sensor itself has a static tag, it will not be able to detect collisions with sleeping colliders.  If a Collider enters a static sensor and goes to sleep, the `exit` callback is called and the sensor is no longer able to detect that collider.
   * 
   * Sensors can not use continuous collision detection.
   * 
   * Sensors will never go to sleep.
   */
  setSensor(sensor: boolean): void

  /**
   * Sets whether the Collider is allowed to automatically go to sleep.
   * 
   * When enabled, the Collider will go to sleep if it hasn't moved in a while.  The physics engine does not simulate movement for colliders that are asleep, which saves a lot of CPU for a typical physics world where most objects are at rest at any given time.
   * 
   * `Collider.setSleepingAllowed(sleepy)`
   * 
   * @param sleepy - Whether the Collider can go to sleep.
   * 
   * Sleeping is enabled by default.  Sleeping can be disabled globally using the `allowSleep` option in `lovr.physics.newWorld`.
   * 
   * Colliders can still be put to sleep manually with `Collider:setAwake`, even if automatic sleeping is disabled.
   * 
   * Sleeping colliders will wake up when:
   * 
   * - Colliding with a moving collider
   * - Awakened explicitly with `Collider:setAwake`
   * - Changing position `Collider:setPosition` or `Collider:setOrientation`
   * - Changing velocity (to something non-zero)
   * - Applying force, torque, or an impulse
   * - Enabling a joint connected to the sleeping collider
   * 
   * Notably, the following will not wake up the collider:
   * 
   * - Changing its kinematic state with `Collider:setKinematic`
   * - Changing its shape with `Collider:addShape` or `Collider:removeShape`
   * - Disabling or destroying a sleeping collider it is resting on
   * 
   * Sensors will never go to sleep.
   */
  setSleepingAllowed(sleepy: boolean): void

  /**
   * Sets the Collider's tag.
   * 
   * Tags are strings that represent the category of a collider.  Use `World:enableCollisionBetween` and `World:disableCollisionBetween` to control which pairs of tags should collide with each other.  Physics queries like `World:raycast` also use tags to filter their results.
   * 
   * The list of available tags is set in `lovr.physics.newWorld`.
   * 
   * `Collider.setTag(tag)`
   * 
   * @param tag - The Collider's tag.
   */
  setTag(tag: string): void

  /**
   * Sets the Collider's tag.
   * 
   * Tags are strings that represent the category of a collider.  Use `World:enableCollisionBetween` and `World:disableCollisionBetween` to control which pairs of tags should collide with each other.  Physics queries like `World:raycast` also use tags to filter their results.
   * 
   * The list of available tags is set in `lovr.physics.newWorld`.
   * 
   * `Collider.setTag()`
   * 
   * Clear the Collider's tag.
   */
  setTag(): void

  /**
   * Associates a Lua value with the Collider.
   * 
   * `Collider.setUserData(data)`
   * 
   * @param data - The custom value to associate with the Collider.
   * 
   * Set the user data to `nil` to clear any existing reference.
   * 
   * The userdata is useful for linking a Collider with custom data:
   * 
   *     local collider = world:raycast(origin, direction, 'enemy')
   * 
   *     if collider then
   *       -- Get the enemy object from its Collider
   *       local enemy = collider:getUserData()
   *       enemy.health = 0
   *     end
   * 
   * The user data is not shared between threads.  Each thread has its own user data for the Collider.
   */
  setUserData(data: any): void

}

/** TODO */
declare interface ConeJoint extends Joint {
  /**
   * Returns the axis of the ConeJoint, in world space.  The axis is relative to the first Collider connected to the Joint, so it will rotate as the collider does.  The relative angle between the axis and the second collider will be constrained based on the ConeJoint's angle limit.
   * 
   * `[ax, ay, az] = ConeJoint.getAxis()`
   * 
   * @returns 
   * ax - The x component of the axis.
   * ay - The y component of the axis.
   * az - The z component of the axis.
   */
  getAxis(): LuaMultiReturn<[ax: number, ay: number, az: number]>

  /**
   * Returns the angle limit of the ConeJoint.  The relative angle between the ConeJoint's axis and the second Collider will be constrained to this limit.
   * 
   * `limit = ConeJoint.getLimit()`
   * 
   * @returns The angle limit, in radians.
   * 
   * The default limit is zero, preventing any rotation away from the axis.
   */
  getLimit(): number

  /**
   * Sets the angle limit of the ConeJoint.  The relative angle between the ConeJoint's axis and the second Collider will be constrained to this limit.
   * 
   * `ConeJoint.setLimit(limit)`
   * 
   * @param limit - The new limit in radians, between 0 and pi.
   * 
   * The default limit is zero, preventing any rotation away from the axis.
   */
  setLimit(limit: number): void

}

/** TODO */
declare interface Contact {
  /**
   * Returns the two Colliders that are in contact.
   * 
   * `[first, second] = Contact.getColliders()`
   * 
   * @returns 
   * first - The first collider.
   * second - The second collider.
   */
  getColliders(): LuaMultiReturn<[first: Collider, second: Collider]>

  /**
   * Returns the friction of the Contact.  Lower friction makes it easier for the colliders to slide against each other.
   * 
   * `friction = Contact.getFriction()`
   * 
   * @returns The contact friction.
   */
  getFriction(): number

  /**
   * Returns the normal vector of the Contact.  This is a direction vector that represents which direction the second collider should move to resolve the collision.
   * 
   * `[x, y, z] = Contact.getNormal()`
   * 
   * @returns 
   * x - The x component of the normal vector.
   * y - The y component of the normal vector.
   * z - The z component of the normal vector.
   */
  getNormal(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the amount of overlap between the colliders.
   * 
   * `overlap = Contact.getOverlap()`
   * 
   * @returns The amount of overlap, in meters.
   */
  getOverlap(): number

  /**
   * Returns the contact points of the Contact.  These are the points where the colliders are intersecting.
   * 
   * `...points = Contact.getPoints()`
   * 
   * @returns Triplets of x/y/z numbers, one for each contact point.
   */
  getPoints(): LuaMultiReturn<[...points: number[]]>

  /**
   * Returns the restitution of the Contact.  Restitution makes the Colliders bounce off of each other.  A restitution value of zero results in an inelastic collision response, whereas 1.0 results in an elastic collision that preserves all of the velocity.  Restitution can be bigger than 1.0 to make the collision even more bouncy.
   * 
   * `restitution = Contact.getRestitution()`
   * 
   * @returns The contact restitution.
   * 
   * The default restitution is the maximum restitution of either of the colliders.
   */
  getRestitution(): number

  /**
   * Returns the two Shapes that are in contact.
   * 
   * `[first, second] = Contact.getShapes()`
   * 
   * @returns 
   * first - The first shape.
   * second - The second shape.
   */
  getShapes(): LuaMultiReturn<[first: Shape, second: Shape]>

  /**
   * Returns the world space surface velocity of the Contact.  This can be used to achieve a conveyor belt effect.
   * 
   * `[x, y, z] = Contact.getSurfaceVelocity()`
   * 
   * @returns 
   * x - The x component of the surface velocity.
   * y - The y component of the surface velocity.
   * z - The z component of the surface velocity.
   */
  getSurfaceVelocity(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns whether the Contact is enabled.  Disabled contacts do not generate any collision response.  Use `Contact:setEnabled` to disable a contact to selectively ignore certain collisions.
   * 
   * `enabled = Contact.isEnabled()`
   * 
   * @returns Whether the Contact is enabled.
   */
  isEnabled(): boolean

  /**
   * Enables or disables the Contact.  Disabled contacts do not generate any collision response.
   * 
   * `Contact.setEnabled(enable)`
   * 
   * @param enable - Whether the Contact should be enabled.
   * 
   * Note that this is the slowest way to ignore a collision.  Faster ways to disable collisions (in increasing order of speed) are:
   * 
   * - The `filter` callback in `World:setCallbacks`
   * - Disabling collision between tags with `World:disableCollisionBetween`
   * - Removing the collider from the World completely with `Collider:setEnabled`
   */
  setEnabled(enable: boolean): void

  /**
   * Sets the friction of the Contact.  Lower friction makes it easier for the colliders to slide against each other.  This overrides the default friction computed by the friction of the two Colliders.
   * 
   * `Contact.setFriction(friction)`
   * 
   * @param friction - The contact friction.
   * 
   * The default friction is computed from the geometric mean of the Colliders' friction:
   * 
   *     friction = (frictionA * frictionB) ^ .5
   * 
   * Negative frictions will be clamped to zero.
   */
  setFriction(friction: number): void

  /**
   * Sets the restitution of the Contact.  Restitution makes the Colliders bounce off of each other. A restitution value of zero results in an inelastic collision response, whereas 1.0 results in an elastic collision that preserves all of the velocity.  Restitution can be bigger than 1.0 to make the collision even more bouncy.
   * 
   * `Contact.setRestitution(restitution)`
   * 
   * @param restitution - The contact restitution.
   * 
   * The default restitution is the maximum restitution of either of the colliders.
   * 
   * Negative restitution values will be clamped to zero.
   */
  setRestitution(restitution: number): void

  /**
   * Sets the world space surface velocity of the Contact.  This can be used to achieve a conveyor belt effect.
   * 
   * `Contact.setSurfaceVelocity(x, y, z)`
   * 
   * @param x - The x component of the surface velocity.
   * @param y - The y component of the surface velocity.
   * @param z - The z component of the surface velocity.
   */
  setSurfaceVelocity(x: number, y: number, z: number): void

  /**
   * Sets the world space surface velocity of the Contact.  This can be used to achieve a conveyor belt effect.
   * 
   * `Contact.setSurfaceVelocity(velocity)`
   * 
   * @param velocity - The surface velocity.
   */
  setSurfaceVelocity(velocity: vector): void

}

/**
 * A type of `Shape` that is a convex hull of a collection of points, allowing for custom collision shapes.  It is similar to a `MeshShape`, but it is not required to be kinematic, and it will use the convex hull of the mesh instead of using the exact triangles of the object.
 * 
 * Convex shapes can be created from a `Model`, `ModelData`, `Mesh`, or a table of point positions, similar to `MeshShape`.
 * 
 * Convex shapes can be cloned by passing in an existing ConvexShape to clone:
 * 
 *     model = lovr.data.newModelData('rock.glb')
 *     parent = lovr.physics.newConvexShape(model)
 *     clone = lovr.physics.newConvexShape(parent, scale)
 * 
 * The clone will reuse all of the data from the parent, which speeds things up a lot.
 * 
 * Convex shapes can have a custom scale applied to their points, and clones can have their own scale.
 */
declare interface ConvexShape extends Shape {
  /**
   * Returns the indices of points that make up one of the faces of the convex hull.
   * 
   * `points = ConvexShape.getFace(index)`
   * 
   * @param index - The index of the face.
   * @returns A table with point indices.  Use `ConvexShape:getPoint` to get the coordinates.  The points are given in counterclockwise order.
   */
  getFace(index: number): LuaTable

  /**
   * Returns the number of faces in the convex hull.
   * 
   * `count = ConvexShape.getFaceCount()`
   * 
   * @returns The number of faces.
   */
  getFaceCount(): number

  /**
   * Returns one of the points in the convex hull, in local space.
   * 
   * `[x, y, z] = ConvexShape.getPoint(index)`
   * 
   * @param index - The index of the point.
   * @returns 
   * x - The x coordinate.
   * y - The y coordinate.
   * z - The z coordinate.
   * 
   * The point positions will be scaled by the ConvexShape's scale, see `ConvexShape:getScale`.
   */
  getPoint(index: number): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the number of points in the convex hull.
   * 
   * `count = ConvexShape.getPointCount()`
   * 
   * @returns The number of points.
   * 
   * This isn't necessarily the same as the number of points or vertices that were used to create the shape, since points inside the hull will be discarded.
   */
  getPointCount(): number

  /**
   * Returns the scale the ConvexShape was created with.
   * 
   * `scale = ConvexShape.getScale()`
   * 
   * @returns The scale.
   */
  getScale(): number

}

/** A type of `Shape` that can be used for cylinder-shaped things. */
declare interface CylinderShape extends Shape {
  /**
   * Returns the length of the CylinderShape.
   * 
   * `length = CylinderShape.getLength()`
   * 
   * @returns The length of the cylinder, in meters.
   */
  getLength(): number

  /**
   * Returns the radius of the CylinderShape.
   * 
   * `radius = CylinderShape.getRadius()`
   * 
   * @returns The radius of the cylinder, in meters.
   */
  getRadius(): number

  /**
   * Sets the length of the CylinderShape.
   * 
   * `CylinderShape.setLength(length)`
   * 
   * @param length - The new length, in meters.
   * 
   * This changes the mass of the shape.  If the shape is attached to a collider with automatic mass enabled, the mass properties of the collider will update as well.
   * 
   * Changing shapes can make the physics engine explode since it can cause objects to overlap in unnatural ways.
   */
  setLength(length: number): void

  /**
   * Sets the radius of the CylinderShape.
   * 
   * `CylinderShape.setRadius(radius)`
   * 
   * @param radius - The new radius, in meters.
   * 
   * This changes the mass of the shape.  If the shape is attached to a collider with automatic mass enabled, the mass properties of the collider will update as well.
   * 
   * Changing shapes can make the physics engine explode since it can cause objects to overlap in unnatural ways.
   */
  setRadius(radius: number): void

}

/** A DistanceJoint is a type of `Joint` that tries to keep two colliders within a certain distance. The distance is determined by the initial distance between the anchor points.  The joint allows for rotation on the anchor points. */
declare interface DistanceJoint extends Joint {
  /**
   * Returns the minimum and maximum distance allowed between the Colliders.
   * 
   * `[min, max] = DistanceJoint.getLimits()`
   * 
   * @returns 
   * min - The minimum distance, in meters.  The Colliders won't be able to get closer than this.
   * max - The maximum distance, in meters.  The Colliders won't be able to get further than this.
   * 
   * The limits default to the distance between the Colliders when the Joint was created.
   */
  getLimits(): LuaMultiReturn<[min: number, max: number]>

  /**
   * Returns the DistanceJoint's spring parameters.  Use this to control how fast the joint pulls the colliders back together at the distance limits.
   * 
   * `[frequency, damping] = DistanceJoint.getSpring()`
   * 
   * @returns 
   * frequency - The frequency of the spring, in hertz.  Higher frequencies make the spring more stiff.  When zero, the spring is disabled.
   * damping - The damping ratio of the spring.
   * 
   * Higher frequencies make the spring more stiff.  When zero (the default), the spring is disabled and the limits will be as stiff as possible.
   * 
   * The damping ratio controls how quickly the oscillation slows down:
   * 
   * - Undamped: Zero damping will cause the spring to oscillate forever.  (Note that the spring may
   *   still lose a small amount of energy over time).
   * - Underdamped: Damping less than one results in a system that is underdamped.  The spring will
   *   oscillate around the target, but the oscillations will decay over time, eventually stabilizing
   *   at the target.
   * - Overdamped: Damping greater than one will not have any oscillation, and the spring will take
   *   extra time to reach the target.
   * - Critical Damping: When the damping is exactly 1.0, there is no oscillation and the spring
   *   takes the minimum amount of time to reach the target (based on the frequency).
   * 
   * The default damping ratio is 1.
   */
  getSpring(): LuaMultiReturn<[frequency: number, damping: number]>

  /**
   * Sets the minimum and maximum distance allowed between the Colliders.
   * 
   * `DistanceJoint.setLimits(min, max)`
   * 
   * @param min - The minimum distance, in meters.  The Colliders won't be able to get closer than this.
   * @param max - The maximum distance, in meters.  The Colliders won't be able to get further than this.
   * 
   * The limits default to the distance between the Colliders when the Joint was created.
   */
  setLimits(min?: number, max?: number): void

  /**
   * Sets the minimum and maximum distance allowed between the Colliders.
   * 
   * `DistanceJoint.setLimits()`
   * 
   * Remove the limits, setting the minimum distance to zero and the maximum distance to infinity.
   * 
   * The limits default to the distance between the Colliders when the Joint was created.
   */
  setLimits(): void

  /**
   * Sets the DistanceJoint's spring parameters.  Use this to control how fast the joint pulls the colliders back together at the distance limits.
   * 
   * `DistanceJoint.setSpring(frequency, damping)`
   * 
   * @param frequency - The frequency of the spring, in hertz.  Higher frequencies make the spring more stiff.  When zero, the spring is disabled.
   * @param damping - The damping ratio of the spring.
   * 
   * Higher frequencies make the spring more stiff.  When zero (the default), the spring is disabled and the limits will be as stiff as possible.
   * 
   * The damping ratio controls how quickly the oscillation slows down:
   * 
   * - Undamped: Zero damping will cause the spring to oscillate forever.  (Note that the spring may
   *   still lose a small amount of energy over time).
   * - Underdamped: Damping less than one results in a system that is underdamped.  The spring will
   *   oscillate around the target, but the oscillations will decay over time, eventually stabilizing
   *   at the target.
   * - Overdamped: Damping greater than one will not have any oscillation, and the spring will take
   *   extra time to reach the target.
   * - Critical Damping: When the damping is exactly 1.0, there is no oscillation and the spring
   *   takes the minimum amount of time to reach the target (based on the frequency).
   */
  setSpring(frequency?: number, damping?: number): void

}

/** A HingeJoint is a type of `Joint` that only allows colliders to rotate on a single axis. */
declare interface HingeJoint extends Joint {
  /**
   * Returns the current angle of the HingeJoint, relative to the rest position.
   * 
   * `angle = HingeJoint.getAngle()`
   * 
   * @returns The hinge angle, in radians.
   */
  getAngle(): number

  /**
   * Returns the axis of the hinge, in world space.
   * 
   * `[x, y, z] = HingeJoint.getAxis()`
   * 
   * @returns 
   * x - The x component of the axis.
   * y - The y component of the axis.
   * z - The z component of the axis.
   */
  getAxis(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the friction of the HingeJoint.  This is a maximum torque force that will be applied, in newton meters.
   * 
   * `friction = HingeJoint.getFriction()`
   * 
   * @returns The friction, in newton meters.
   * 
   * Friction is only applied when the motor is disabled.
   */
  getFriction(): number

  /**
   * Returns the angle limits of the HingeJoint.  The "zero" angle is determined by the relative position of the colliders at the time the joint was created.
   * 
   * `[min, max] = HingeJoint.getLimits()`
   * 
   * @returns 
   * min - The minimum angle, in radians.  Always between -π and 0.
   * max - The maximum angle, in radians.  Always between 0 and π.
   * 
   * The default limits are -π and π.
   */
  getLimits(): LuaMultiReturn<[min: number, max: number]>

  /**
   * Returns the maximum amount of torque the motor can use to reach its target, in newton meters.
   * 
   * There are separate limits for each direction the hinge can move.  They're usually kept the same, but one of them can be set to zero to make a motor that can only push in one direction.  Note that both limits are positive.
   * 
   * `[positive, negative] = HingeJoint.getMaxMotorTorque()`
   * 
   * @returns 
   * positive - The maximum amount of torque the motor can use to push the hinge in the "positive" direction, in newton meters.
   * negative - The maximum amount of torque the motor can use to push the hinge in the "negative" direction, in newton meters.
   */
  getMaxMotorTorque(): LuaMultiReturn<[positive: number, negative: number]>

  /**
   * Returns the motor mode of the HingeJoint.  When enabled, the motor will drive the hinge to a target angle (for the `position` mode) or a target speed (for the `velocity` mode), set by `HingeJoint:setMotorTarget`.
   * 
   * `mode = HingeJoint.getMotorMode()`
   * 
   * @returns The mode of the motor, or `nil` if the motor is disabled.
   */
  getMotorMode(): MotorMode

  /**
   * Returns the spring parameters of the motor target.  These are similar to the spring parameters set by `HingeJoint:setSpring`, but they apply to the motor when it reaches its target instead of the angle limits of the hinge joint.  Note that these only take effect when the motor mode is `position`.
   * 
   * `[frequency, damping] = HingeJoint.getMotorSpring()`
   * 
   * @returns 
   * frequency - The frequency of the spring, in hertz.  Higher frequencies make the spring more stiff.  When zero, the spring is disabled.
   * damping - The damping ratio of the spring.
   * 
   * See `HingeJoint:setSpring` for more detailed info on how the spring parameters work.
   */
  getMotorSpring(): LuaMultiReturn<[frequency: number, damping: number]>

  /**
   * Returns the target value for the HingeJoint's motor.  This is either a target angle or a target velocity, based on the mode set by `HingeJoint:setMotorMode`.
   * 
   * `target = HingeJoint.getMotorTarget()`
   * 
   * @returns The target value, in radians or radians per second, depending on the mode.
   */
  getMotorTarget(): number

  /**
   * Returns the current torque the motor is using to reach its target, in newton meters.
   * 
   * `torque = HingeJoint.getMotorTorque()`
   * 
   * @returns The current torque, in newton meters.
   */
  getMotorTorque(): number

  /**
   * Returns the spring parameters of the HingeJoint.  Use this to make the angle limits of the hinge "soft".  When the motor is active, a separate set of spring parameters can be set on the motor, see `HingeJoint:setMotorSpring`.
   * 
   * `[frequency, damping] = HingeJoint.getSpring()`
   * 
   * @returns 
   * frequency - The frequency of the spring, in hertz.  Higher frequencies make the spring more stiff.  When zero, the spring is disabled.
   * damping - The damping ratio of the spring.
   * 
   * Higher frequencies make the spring more stiff.  When zero (the default), the spring is disabled and the limits will be as stiff as possible.
   * 
   * The damping ratio controls how quickly the oscillation slows down:
   * 
   * - Undamped: Zero damping will cause the spring to oscillate forever.  (Note that the spring may
   *   still lose a small amount of energy over time).
   * - Underdamped: Damping less than one results in a system that is underdamped.  The spring will
   *   oscillate around the target, but the oscillations will decay over time, eventually stabilizing
   *   at the target.
   * - Overdamped: Damping greater than one will not have any oscillation, and the spring will take
   *   extra time to reach the target.
   * - Critical Damping: When the damping is exactly 1.0, there is no oscillation and the spring
   *   takes the minimum amount of time to reach the target (based on the frequency).
   * 
   * The default damping ratio is 1.
   */
  getSpring(): LuaMultiReturn<[frequency: number, damping: number]>

  /**
   * Sets the friction of the HingeJoint.  This is a maximum torque force that will be applied, in newton meters.
   * 
   * `HingeJoint.setFriction(friction)`
   * 
   * @param friction - The friction, in newton meters.
   * 
   * Friction is only applied when the motor is disabled.
   */
  setFriction(friction: number): void

  /**
   * Sets the angle limits of the HingeJoint.  The "zero" angle is determined by the relative position of the colliders at the time the joint was created.
   * 
   * `HingeJoint.setLimits(min, max)`
   * 
   * @param min - The minimum angle, in radians.  Should be between -π and 0.
   * @param max - The maximum angle, in radians.  Should be between 0 and π.
   * 
   * The default limits are -π and π.
   */
  setLimits(min: number, max: number): void

  /**
   * Sets the angle limits of the HingeJoint.  The "zero" angle is determined by the relative position of the colliders at the time the joint was created.
   * 
   * `HingeJoint.setLimits()`
   * 
   * Disable the limits, setting them to -π and π.
   * 
   * The default limits are -π and π.
   */
  setLimits(): void

  /**
   * Sets the maximum amount of torque the motor can use to reach its target, in newton meters.
   * 
   * There are separate limits for each direction the hinge can move.  They're usually kept the same, but one of them can be set to zero to make a motor that can only push in one direction.  Note that both limits are positive.
   * 
   * `HingeJoint.setMaxMotorTorque(positive, negative)`
   * 
   * @param positive - The maximum amount of torque the motor can use to push the hinge in the "positive" direction, in newton meters.
   * @param negative - The maximum amount of torque the motor can use to push the hinge in the "negative" direction, in newton meters.
   */
  setMaxMotorTorque(positive?: number, negative?: number): void

  /**
   * Sets the motor mode of the HingeJoint.  When enabled, the motor will drive the hinge to a target angle (for the `position` mode) or a target speed (for the `velocity` mode), set by `HingeJoint:setMotorTarget`.
   * 
   * `HingeJoint.setMotorMode(mode)`
   * 
   * @param mode - The mode of the motor.
   */
  setMotorMode(mode: MotorMode): void

  /**
   * Sets the motor mode of the HingeJoint.  When enabled, the motor will drive the hinge to a target angle (for the `position` mode) or a target speed (for the `velocity` mode), set by `HingeJoint:setMotorTarget`.
   * 
   * `HingeJoint.setMotorMode()`
   * 
   * Disables the motor.
   */
  setMotorMode(): void

  /**
   * Sets the spring parameters of the motor target.  These are similar to the spring parameters set by `HingeJoint:setSpring`, but they apply to the motor when it reaches its target instead of the angle limits of the hinge joint.  Note that these only take effect when the motor mode is `position`.
   * 
   * `HingeJoint.setMotorSpring(frequency, damping)`
   * 
   * @param frequency - The frequency of the spring, in hertz.  Higher frequencies make the spring more stiff.  When zero, the spring is disabled.
   * @param damping - The damping ratio of the spring.
   * 
   * See `HingeJoint:setSpring` for more detailed info on how the spring parameters work.
   */
  setMotorSpring(frequency?: number, damping?: number): void

  /**
   * Sets the target value for the HingeJoint's motor.  This is either a target angle or a target velocity, based on the mode set by `HingeJoint:setMotorMode`.
   * 
   * `HingeJoint.setMotorTarget(target)`
   * 
   * @param target - The target value, in radians or radians per second, depending on the mode.
   */
  setMotorTarget(target: number): void

  /**
   * Sets the spring parameters of the HingeJoint.  Use this to make the angle limits of the hinge "soft".  When the motor is active, a separate set of spring parameters can be set on the motor, see `HingeJoint:setMotorSpring`.
   * 
   * `HingeJoint.setSpring(frequency, damping)`
   * 
   * @param frequency - The frequency of the spring, in hertz.  Higher frequencies make the spring more stiff.  When zero, the spring is disabled.
   * @param damping - The damping ratio of the spring.
   * 
   * Higher frequencies make the spring more stiff.  When zero (the default), the spring is disabled and the limits will be as stiff as possible.
   * 
   * The damping ratio controls how quickly the oscillation slows down:
   * 
   * - Undamped: Zero damping will cause the spring to oscillate forever.  (Note that the spring may
   *   still lose a small amount of energy over time).
   * - Underdamped: Damping less than one results in a system that is underdamped.  The spring will
   *   oscillate around the target, but the oscillations will decay over time, eventually stabilizing
   *   at the target.
   * - Overdamped: Damping greater than one will not have any oscillation, and the spring will take
   *   extra time to reach the target.
   * - Critical Damping: When the damping is exactly 1.0, there is no oscillation and the spring
   *   takes the minimum amount of time to reach the target (based on the frequency).
   */
  setSpring(frequency?: number, damping?: number): void

}

/** A Joint is a physics object that constrains the movement of two Colliders. */
declare interface Joint extends LovrObject {
  /**
   * Destroys the Joint, removing it from the World and breaking the connection between its Colliders.  There is no way to get the Joint back after destroying it, and attempting to use it will throw an error.  To temporarily disable a Joint, use `Joint:setEnabled`.
   * 
   * `Joint.destroy()`
   * 
   * Joints are automatically destroyed if either of their Colliders are destroyed or if the World is destroyed or garbage collected.
   */
  destroy(): void

  /**
   * Returns the world space anchor points of the Joint.  Joints are attached to each collider at a single point, which is defined when the Joint is created.
   * 
   * `[x1, y1, z1, x2, y2, z2] = Joint.getAnchors()`
   * 
   * @returns 
   * x1 - The x coordinate of the anchor point on the first Collider, in world space.
   * y1 - The y coordinate of the anchor point on the first Collider, in world space.
   * z1 - The z coordinate of the anchor point on the first Collider, in world space.
   * x2 - The x coordinate of the anchor point on the second Collider, in world space.
   * y2 - The y coordinate of the anchor point on the second Collider, in world space.
   * z2 - The z coordinate of the anchor point on the second Collider, in world space.
   */
  getAnchors(): LuaMultiReturn<[x1: number, y1: number, z1: number, x2: number, y2: number, z2: number]>

  /**
   * Returns the Colliders the Joint is attached to.
   * 
   * `[colliderA, colliderB] = Joint.getColliders()`
   * 
   * @returns 
   * colliderA - The first Collider.
   * colliderB - The second Collider.
   */
  getColliders(): LuaMultiReturn<[colliderA: Collider, colliderB: Collider]>

  /**
   * Returns the magnitude of the force used to satisfy the Joint's constraint during the last physics update, in newtons.
   * 
   * This is useful for breakable joints.  Use `Joint:destroy` to break the joint if its force goes above a threshold.
   * 
   * `force = Joint.getForce()`
   * 
   * @returns The magnitude of the force used to satisfy the Joint's constraint.
   * 
   * This does not include the motor force of a `SliderJoint`, see `SliderJoint:getMotorForce`. that.
   */
  getForce(): number

  /**
   * Returns the priority of the Joint.  Joints with a higher priority are more likely to be solved correctly.  Priority values are non-negative integers.
   * 
   * `priority = Joint.getPriority()`
   * 
   * @returns The integer priority value.
   * 
   * The default priority is zero.
   */
  getPriority(): number

  /**
   * Returns the magnitude of the torque used to satisfy the Joint's constraint during the last physics update, in newton meters.
   * 
   * This is useful for breakable joints.  Use `Joint:destroy` to break the joint if its torque goes above a threshold.
   * 
   * `torque = Joint.getTorque()`
   * 
   * @returns The magnitude of the torque used to satisfy the Joint's constraint.
   * 
   * This does not include the motor force of a `HingeJoint`, see `HingeJoint:getMotorForce`.
   */
  getTorque(): number

  /**
   * Returns the type of the Joint.
   * 
   * `type = Joint.getType()`
   * 
   * @returns The type of the Joint.
   */
  getType(): JointType

  /**
   * Returns the Lua value associated with the Joint.
   * 
   * `data = Joint.getUserData()`
   * 
   * @returns The custom value associated with the Joint.
   * 
   * The user data is not shared between threads.  Each thread has its own user data for the Joint.
   */
  getUserData(): any

  /**
   * Returns whether a Joint has been destroyed.  This the only method that can be called on a destroyed Joint, using the Joint in any other way will error.
   * 
   * `destroyed = Joint.isDestroyed()`
   * 
   * @returns Whether the Joint has been destroyed.
   */
  isDestroyed(): boolean

  /**
   * Returns whether the Joint is enabled.  Disabled joints do not affect the simulation in any way. Use `Joint:setEnabled` to reactivate the Joint later.  If the Joint is no longer needed, `Joint:destroy` is a better option that completely removes the Joint from the simulation.
   * 
   * `enabled = Joint.isEnabled()`
   * 
   * @returns Whether the Joint is enabled.
   */
  isEnabled(): boolean

  /**
   * Enable or disable the Joint.  Disabled joints do not affect the simulation in any way.  If the Joint is no longer needed, `Joint:destroy` is a better option that completely removes the Joint from the simulation.
   * 
   * `Joint.setEnabled(enabled)`
   * 
   * @param enabled - Whether the Joint should be enabled.
   */
  setEnabled(enabled: boolean): void

  /**
   * Sets the priority of the Joint.  Joints with a higher priority are more likely to be solved correctly.  Priority values are non-negative integers.
   * 
   * `Joint.setPriority(priority)`
   * 
   * @param priority - The integer priority value.
   * 
   * The default priority is zero.
   */
  setPriority(priority: number): void

  /**
   * Associates a Lua value with the Joint.
   * 
   * `Joint.setUserData(data)`
   * 
   * @param data - The custom value to associate with the Joint.
   * 
   * Set the user data to `nil` to clear any existing reference.
   * 
   * The user data is not shared between threads.  Each thread has its own user data for the Joint.
   */
  setUserData(data: any): void

}

/**
 * A type of `Shape` that can be used for triangle meshes.
 * 
 * If a `Collider` contains a MeshShape, it will be forced to become kinematic.  `ConvexShape` can be used instead for dynamic mesh colliders.
 */
declare interface MeshShape extends Shape {
  /**
   * Returns the scale the MeshShape was created with.
   * 
   * `scale = MeshShape.getScale()`
   * 
   * @returns The scale.
   */
  getScale(): number

}

/** A Shape is a physics object that can be attached to colliders to define their shape. */
declare interface Shape extends LovrObject {
  /**
   * Returns whether a point is inside the Shape.
   * 
   * This takes into account the pose of the Shape's collider (if any), as well as its local offset set with `Shape:setOffset`.
   * 
   * `hit = Shape.containsPoint(x, y, z)`
   * 
   * @param x - The x coordinate of the point.
   * @param y - The y coordinate of the point.
   * @param z - The z coordinate of the point.
   * @returns Whether the point is inside the Shape.
   */
  containsPoint(x: number, y: number, z: number): boolean

  /**
   * Returns whether a point is inside the Shape.
   * 
   * This takes into account the pose of the Shape's collider (if any), as well as its local offset set with `Shape:setOffset`.
   * 
   * `hit = Shape.containsPoint(point)`
   * 
   * @param point - The point, as a vector.
   * @returns Whether the point is inside the Shape.
   */
  containsPoint(point: vector): boolean

  /**
   * Destroys the Shape, removing it from the Collider it's attached to.
   * 
   * `Shape.destroy()`
   * 
   * Calling methods on the Shape after destroying it will error (except for `Shape:isDestroyed`).
   * 
   * If the Shape is attached to a Collider with automatic mass enabled, the collider's mass properties will update.
   */
  destroy(): void

  /**
   * Returns the axis aligned bounding box of the Shape.
   * 
   * `[minx, maxx, miny, maxy, minz, maxz] = Shape.getAABB()`
   * 
   * @returns 
   * minx - The minimum x coordinate of the box.
   * maxx - The maximum x coordinate of the box.
   * miny - The minimum y coordinate of the box.
   * maxy - The maximum y coordinate of the box.
   * minz - The minimum z coordinate of the box.
   * maxz - The maximum z coordinate of the box.
   */
  getAABB(): LuaMultiReturn<[minx: number, maxx: number, miny: number, maxy: number, minz: number, maxz: number]>

  /**
   * Returns the center of mass of the Shape.  Currently the only shape that can have a non-zero center of mass is `ConvexShape`.
   * 
   * `[x, y, z] = Shape.getCenterOfMass()`
   * 
   * @returns 
   * x - The x position of the center of mass.
   * y - The y position of the center of mass.
   * z - The z position of the center of mass.
   * 
   * `MeshShape` and `TerrainShape` do not have a well-defined mass, this function returns zero for those shapes.
   */
  getCenterOfMass(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the Collider the Shape is attached to.
   * 
   * This function will return `nil` if the Shape is not attached to a Collider.  When a Shape isn't attached to a Collider, the Shape can still be used for queries with `World:overlapShape` and `World:shapecast`.
   * 
   * `collider = Shape.getCollider()`
   * 
   * @returns The Collider the Shape is attached to, or nil if the Shape isn't attached to a Collider.
   * 
   * A Shape can only be attached to one Collider at a time.
   */
  getCollider(): Collider

  /**
   * Returns the density of the Shape, in kilograms per cubic meter.  The density, combined with the volume of the Shape, determines the Shape's overall mass.
   * 
   * `density = Shape.getDensity()`
   * 
   * @returns The density of the Shape, in kilograms per cubic meter.
   * 
   * The default density is 1,000, which is the density of water.
   * 
   * `MeshShape` and `TerrainShape` do not have volume, and return 0.
   */
  getDensity(): number

  /**
   * Returns the inertia of the Shape.
   * 
   * Inertia is kind of like "angular mass".  Regular mass determines how resistant a Collider is to linear forces (movement), whereas inertia determines how resistant the Collider is to torque (rotation).  Colliders with less inertia are more spinny.
   * 
   * In 3D, inertia is represented by a 3x3 matrix, called a tensor.  To make calculations easier, the physics engine stores the inertia using eigenvalue decomposition, splitting the matrix into a diagonal matrix and a rotation.  It's complicated!
   * 
   * In a realistic simulation, mass and inertia follow a linear relationship.  If the mass of an object increases, the diagonal part of its inertia should increase proportionally.
   * 
   * `[dx, dy, dz, angle, ax, ay, az] = Shape.getInertia()`
   * 
   * @returns 
   * dx - The x component of the diagonal matrix.
   * dy - The y component of the diagonal matrix.
   * dz - The z component of the diagonal matrix.
   * angle - The angle of the inertia rotation.
   * ax - The x component of the inertia rotation axis.
   * ay - The y component of the inertia rotation axis.
   * az - The z component of the inertia rotation axis.
   * 
   * `MeshShape` and `TerrainShape` do not have mass or volue, and for those shapes this function returns zeroes.
   */
  getInertia(): LuaMultiReturn<[dx: number, dy: number, dz: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the mass of the Shape, in kilograms.  The mass is the volume multiplied by the density.
   * 
   * `mass = Shape.getMass()`
   * 
   * @returns The mass of the Shape, in kilograms.
   * 
   * The mass of a Collider is the sum of the mass of all of its Shapes.  The center of a mass of a Collider is the average of all of its Shapes, weighted by their mass.
   * 
   * `MeshShape` and `TerrainShape` do not have mass, and will return 0.
   */
  getMass(): number

  /**
   * Returns the local offset of the Shape.  When the Shape is attached to a Collider, it will have this offset relative to the Collider.
   * 
   * `[x, y, z, angle, ax, ay, az] = Shape.getOffset()`
   * 
   * @returns 
   * x - The local x offset of the Shape, in meters.
   * y - The local y offset of the Shape, in meters.
   * z - The local z offset of the Shape, in meters.
   * angle - The number of radians the Shape is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getOffset(): LuaMultiReturn<[x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Get the orientation of the Shape in world space, taking into account the position and orientation of the Collider it's attached to, if any.  Shapes that aren't attached to a Collider will return their local offset.
   * 
   * `[angle, ax, ay, az] = Shape.getOrientation()`
   * 
   * @returns 
   * angle - The number of radians the Shape is rotated.
   * ax - The x component of the rotation axis.
   * ay - The y component of the rotation axis.
   * az - The z component of the rotation axis.
   */
  getOrientation(): LuaMultiReturn<[angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the position and orientation of the Shape in world space, taking into the account the position and orientation of the Collider it's attached to, if any.  Shapes that aren't attached to a Collider will return their local offset.
   * 
   * `[x, y, z, angle, ax, ay, az] = Shape.getPose()`
   * 
   * @returns 
   * x - The x position of the Shape, in meters.
   * y - The y position of the Shape, in meters.
   * z - The z position of the Shape, in meters.
   * angle - The number of radians the Shape is rotated around its axis of rotation.
   * ax - The x component of the axis of rotation.
   * ay - The y component of the axis of rotation.
   * az - The z component of the axis of rotation.
   */
  getPose(): LuaMultiReturn<[x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number]>

  /**
   * Returns the position of the Shape in world space, taking into the account the position and orientation of the Collider it's attached to, if any.  Shapes that aren't attached to a Collider will return their local offset.
   * 
   * `[x, y, z] = Shape.getPosition()`
   * 
   * @returns 
   * x - The x position, in world space.
   * y - The y position, in world space.
   * z - The z position, in world space.
   */
  getPosition(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the type of the Shape.
   * 
   * `type = Shape.getType()`
   * 
   * @returns The type of the Shape.
   */
  getType(): ShapeType

  /**
   * Returns the Lua value associated with the Shape.
   * 
   * `data = Shape.getUserData()`
   * 
   * @returns The custom value associated with the Shape.
   * 
   * The user data is not shared between threads.  Each thread has its own user data for the Shape.
   */
  getUserData(): any

  /**
   * Returns the volume of the Shape, in cubic meters.
   * 
   * `volume = Shape.getVolume()`
   * 
   * @returns The volume of the shape, in cubic meters.
   * 
   * `MeshShape` and `TerrainShape` do not have volume, and will return 0.
   */
  getVolume(): number

  /**
   * Returns whether the Shape has been destroyed.  Destroyed shapes can not be used for anything.
   * 
   * `destroyed = Shape.isDestroyed()`
   * 
   * @returns Whether the Shape has been destroyed.
   */
  isDestroyed(): boolean

  /**
   * Casts a ray against the Shape and returns the first intersection.
   * 
   * This takes into account the pose of the Shape's collider (if any), as well as its local offset set with `Shape:setOffset`.
   * 
   * `[x, y, z, nx, ny, nz, triangle] = Shape.raycast(x1, y1, z1, x2, y2, z2)`
   * 
   * @param x1 - The x coordinate of the origin of the ray.
   * @param y1 - The y coordinate of the origin of the ray.
   * @param z1 - The z coordinate of the origin of the ray.
   * @param x2 - The x coordinate of the endpoint of the ray.
   * @param y2 - The y coordinate of the endpoint of the ray.
   * @param z2 - The z coordinate of the endpoint of the ray.
   * @returns 
   * x - The x coordinate of the impact point.
   * y - The y coordinate of the impact point.
   * z - The z coordinate of the impact point.
   * nx - The x component of the normal vector.
   * ny - The y component of the normal vector.
   * nz - The z component of the normal vector.
   * triangle - The index of the triangle that was hit, or `nil` if this is not a MeshShape.
   */
  raycast(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): LuaMultiReturn<[x: number, y: number, z: number, nx: number, ny: number, nz: number, triangle: number | undefined]>

  /**
   * Casts a ray against the Shape and returns the first intersection.
   * 
   * This takes into account the pose of the Shape's collider (if any), as well as its local offset set with `Shape:setOffset`.
   * 
   * `[x, y, z, nx, ny, nz, triangle] = Shape.raycast(origin, endpoint)`
   * 
   * @param origin - The origin of the ray.
   * @param endpoint - The endpoint of the ray.
   * @returns 
   * x - The x coordinate of the impact point.
   * y - The y coordinate of the impact point.
   * z - The z coordinate of the impact point.
   * nx - The x component of the normal vector.
   * ny - The y component of the normal vector.
   * nz - The z component of the normal vector.
   * triangle - The index of the triangle that was hit, or `nil` if this is not a MeshShape.
   */
  raycast(origin: vector, endpoint: vector): LuaMultiReturn<[x: number, y: number, z: number, nx: number, ny: number, nz: number, triangle: number | undefined]>

  /**
   * Sets the density of the Shape, in kilograms per cubic meter.  The density, combined with the volume of the Shape, determines the Shape's overall mass.
   * 
   * `Shape.setDensity(density)`
   * 
   * @param density - The density of the Shape, in kilograms per cubic meter.
   * 
   * This changes the mass of the Shape.  If the Shape is attached to a Collider with automatic mass enabled, the Collider's mass properties will change as well.
   * 
   * The default density is 1,000, which is the density of water.
   * 
   * `MeshShape` and `TerrainShape` do not have mass.
   */
  setDensity(density: number): void

  /**
   * Sets the local offset of the Shape.  When the Shape is attached to a Collider, it will have this offset relative to the Collider.
   * 
   * `Shape.setOffset(x, y, z, angle, ax, ay, az)`
   * 
   * @param x - The local x offset of the Shape, in meters.
   * @param y - The local y offset of the Shape, in meters.
   * @param z - The local z offset of the Shape, in meters.
   * @param angle - The number of radians the Shape is rotated around its axis of rotation.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   */
  setOffset(x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number): void

  /**
   * Sets the local offset of the Shape.  When the Shape is attached to a Collider, it will have this offset relative to the Collider.
   * 
   * `Shape.setOffset(position, rotation)`
   * 
   * @param position - The local offset of the Shape, in meters.
   * @param rotation - The local rotation of the Shape, in meters.
   */
  setOffset(position: vector, rotation: quaternion): void

  /**
   * Associates a Lua value with the Shape.
   * 
   * `Shape.setUserData(data)`
   * 
   * @param data - The custom value to associate with the Shape.
   * 
   * Set the user data to `nil` to clear any existing reference.
   * 
   * The user data is not shared between threads.  Each thread has its own user data for the Shape.
   */
  setUserData(data: any): void

}

/** A SliderJoint is a type of `Joint` that only allows colliders to move on a single axis. */
declare interface SliderJoint extends Joint {
  /**
   * Returns the axis of the slider, in world space.
   * 
   * `[x, y, z] = SliderJoint.getAxis()`
   * 
   * @returns 
   * x - The x component of the axis.
   * y - The y component of the axis.
   * z - The z component of the axis.
   */
  getAxis(): LuaMultiReturn<[x: number, y: number, z: number]>

  /**
   * Returns the friction of the SliderJoint.  This is a maximum friction force that will be applied, in newtons, opposing movement along the slider axis.
   * 
   * `friction = SliderJoint.getFriction()`
   * 
   * @returns The maximum friction force, in newtons.
   * 
   * Friction is only applied when the motor is disabled.
   */
  getFriction(): number

  /**
   * Returns the position limits of the SliderJoint.  The "zero" position is determined by the relative position of the colliders at the time the joint was created, and positive positions are further apart along the slider axis.
   * 
   * `[min, max] = SliderJoint.getLimits()`
   * 
   * @returns 
   * min - The minimum position, in meters.  Must be less than or equal to zero.
   * max - The maximum position, in meters.  Must be greater than or equal to zero.
   * 
   * The default limits are -math.huge and math.huge (no limits).
   */
  getLimits(): LuaMultiReturn<[min: number, max: number]>

  /**
   * Returns the maximum amount of force the motor can use to reach its target, in newtons.
   * 
   * There are separate limits for each direction the slider can move.  They're usually kept the same, but one of them can be set to zero to make a motor that can only push in one direction. Note that both limits are positive.
   * 
   * `[positive, negative] = SliderJoint.getMaxMotorForce()`
   * 
   * @returns 
   * positive - The maximum amount of force the motor can use to push the slider in the "positive" direction, in newtons.
   * negative - The maximum amount of force the motor can use to push the slider in the "negative" direction, in newtons.
   */
  getMaxMotorForce(): LuaMultiReturn<[positive: number, negative: number]>

  /**
   * Returns the current force the motor is using to reach its target, in newtons.
   * 
   * `force = SliderJoint.getMotorForce()`
   * 
   * @returns The current force, in newtons.
   */
  getMotorForce(): number

  /**
   * Returns the motor mode of the SliderJoint.  When enabled, the motor will drive the slider to a target position (for the `position` mode) or a target speed (for the `velocity` mode), set by `SliderJoint:setMotorTarget`.
   * 
   * `mode = SliderJoint.getMotorMode()`
   * 
   * @returns The mode of the motor, or `nil` if the motor is disabled.
   */
  getMotorMode(): MotorMode

  /**
   * Returns the spring parameters of the motor target.  These are similar to the spring parameters set by `SliderJoint:setSpring`, but they apply to the motor when it reaches its target instead of the position limits of the slider joint.  Note that these only take effect when the motor mode is `position`.
   * 
   * `[frequency, damping] = SliderJoint.getMotorSpring()`
   * 
   * @returns 
   * frequency - The frequency of the spring, in hertz.  Higher frequencies make the spring more stiff.  When zero, the spring is disabled.
   * damping - The damping ratio of the spring.
   * 
   * See `SliderJoint:setSpring` for more detailed info on how the spring parameters work.
   */
  getMotorSpring(): LuaMultiReturn<[frequency: number, damping: number]>

  /**
   * Returns the target value for the SliderJoint's motor.  This is either a target position or a target velocity, based on the mode set by `SliderJoint:setMotorMode`.
   * 
   * `target = SliderJoint.getMotorTarget()`
   * 
   * @returns The target value, in meters or meters per second, depending on the mode.
   */
  getMotorTarget(): number

  /**
   * Returns the position of the slider joint.  The "zero" position is the relative distance the colliders were at when the joint is created, and positive positions are further apart along the slider's axis.
   * 
   * `position = SliderJoint.getPosition()`
   * 
   * @returns The position of the slider joint, in meters.
   */
  getPosition(): number

  /**
   * Returns the spring parameters of the SliderJoint.  Use this to make the position limits of the slider "soft".  When the motor is active, a separate set of spring parameters can be set on the motor, see `SliderJoint:setMotorSpring`.
   * 
   * `[frequency, damping] = SliderJoint.getSpring()`
   * 
   * @returns 
   * frequency - The frequency of the spring, in hertz.  Higher frequencies make the spring more stiff.  When zero, the spring is disabled.
   * damping - The damping ratio of the spring.
   * 
   * Higher frequencies make the spring more stiff.  When zero (the default), the spring is disabled and the limits will be as stiff as possible.
   * 
   * The damping ratio controls how quickly the oscillation slows down:
   * 
   * - Undamped: Zero damping will cause the spring to oscillate forever.  (Note that the spring may
   *   still lose a small amount of energy over time).
   * - Underdamped: Damping less than one results in a system that is underdamped.  The spring will
   *   oscillate around the target, but the oscillations will decay over time, eventually stabilizing
   *   at the target.
   * - Overdamped: Damping greater than one will not have any oscillation, and the spring will take
   *   extra time to reach the target.
   * - Critical Damping: When the damping is exactly 1.0, there is no oscillation and the spring
   *   takes the minimum amount of time to reach the target (based on the frequency).
   * 
   * The default damping ratio is 1.
   */
  getSpring(): LuaMultiReturn<[frequency: number, damping: number]>

  /**
   * Sets the friction of the SliderJoint.  This is a maximum friction force that will be applied, in newtons, opposing movement along the slider axis.
   * 
   * `SliderJoint.setFriction(friction)`
   * 
   * @param friction - The maximum friction force, in newtons.
   * 
   * Friction is only applied when the motor is disabled.
   */
  setFriction(friction: number): void

  /**
   * Sets the position limits of the SliderJoint.  The "zero" position is determined by the relative position of the colliders at the time the joint was created, and positive distances are further apart on the slider axis.
   * 
   * `SliderJoint.setLimits(min, max)`
   * 
   * @param min - The minimum position, in meters.  Must be less than or equal to zero.
   * @param max - The maximum position, in meters.  Must be greater than or equal to zero.
   * 
   * The default limits are -math.huge and math.huge.
   */
  setLimits(min: number, max: number): void

  /**
   * Sets the position limits of the SliderJoint.  The "zero" position is determined by the relative position of the colliders at the time the joint was created, and positive distances are further apart on the slider axis.
   * 
   * `SliderJoint.setLimits()`
   * 
   * Disable the limits, setting them to -math.huge and math.huge.
   * 
   * The default limits are -math.huge and math.huge.
   */
  setLimits(): void

  /**
   * Sets the maximum amount of force the motor can use to reach its target, in newtons.
   * 
   * There are separate limits for each direction the slider can move.  They're usually kept the same, but one of them can be set to zero to make a motor that can only push in one direction. Note that both limits are positive.
   * 
   * `SliderJoint.setMaxMotorForce(positive, negative)`
   * 
   * @param positive - The maximum amount of force the motor can use to push the slider in the "positive" direction, in newtons.
   * @param negative - The maximum amount of force the motor can use to push the slider in the "negative" direction, in newtons.
   */
  setMaxMotorForce(positive?: number, negative?: number): void

  /**
   * Sets the motor mode of the SliderJoint.  When enabled, the motor will drive the slider to a target position (for the `position` mode) or a target speed (for the `velocity` mode), set by `SliderJoint:setMotorTarget`.
   * 
   * `SliderJoint.setMotorMode(mode)`
   * 
   * @param mode - The mode of the motor.
   */
  setMotorMode(mode: MotorMode): void

  /**
   * Sets the motor mode of the SliderJoint.  When enabled, the motor will drive the slider to a target position (for the `position` mode) or a target speed (for the `velocity` mode), set by `SliderJoint:setMotorTarget`.
   * 
   * `SliderJoint.setMotorMode()`
   * 
   * Disables the motor.
   */
  setMotorMode(): void

  /**
   * Sets the spring parameters of the motor target.  These are similar to the spring parameters set by `SldierJoint:setSpring`, but they apply to the motor when it reaches its target instead of the position limits of the slider joint.  Note that these only take effect when the motor mode is `position`.
   * 
   * `SliderJoint.setMotorSpring(frequency, damping)`
   * 
   * @param frequency - The frequency of the spring, in hertz.  Higher frequencies make the spring more stiff.  When zero, the spring is disabled.
   * @param damping - The damping ratio of the spring.
   * 
   * See `SldierJoint:setSpring` for more detailed info on how the spring parameters work.
   */
  setMotorSpring(frequency?: number, damping?: number): void

  /**
   * Sets the target value for the SliderJoint's motor.  This is either a target position or a target velocity, based on the mode set by `SliderJoint:setMotorMode`.
   * 
   * `SliderJoint.setMotorTarget(target)`
   * 
   * @param target - The target value, in meters or meters per second, depending on the mode.
   */
  setMotorTarget(target: number): void

  /**
   * Sets the spring parameters of the SliderJoint.  Use this to make the position limits of the slider "soft".  When the motor is active, a separate set of spring parameters can be set on the motor, see `SliderJoint:setMotorSpring`.
   * 
   * `SliderJoint.setSpring(frequency, damping)`
   * 
   * @param frequency - The frequency of the spring, in hertz.  Higher frequencies make the spring more stiff.  When zero, the spring is disabled.
   * @param damping - The damping ratio of the spring.
   * 
   * Higher frequencies make the spring more stiff.  When zero (the default), the spring is disabled and the limits will be as stiff as possible.
   * 
   * The damping ratio controls how quickly the oscillation slows down:
   * 
   * - Undamped: Zero damping will cause the spring to oscillate forever.  (Note that the spring may
   *   still lose a small amount of energy over time).
   * - Underdamped: Damping less than one results in a system that is underdamped.  The spring will
   *   oscillate around the target, but the oscillations will decay over time, eventually stabilizing
   *   at the target.
   * - Overdamped: Damping greater than one will not have any oscillation, and the spring will take
   *   extra time to reach the target.
   * - Critical Damping: When the damping is exactly 1.0, there is no oscillation and the spring
   *   takes the minimum amount of time to reach the target (based on the frequency).
   */
  setSpring(frequency?: number, damping?: number): void

}

/** A type of `Shape` that can be used for spheres. */
declare interface SphereShape extends Shape {
  /**
   * Returns the radius of the SphereShape.
   * 
   * `radius = SphereShape.getRadius()`
   * 
   * @returns The radius of the sphere, in meters.
   */
  getRadius(): number

  /**
   * Sets the radius of the SphereShape.
   * 
   * `SphereShape.setRadius(radius)`
   * 
   * @param radius - The radius of the sphere, in meters.
   * 
   * This changes the mass of the shape.  If the shape is attached to a collider with automatic mass enabled, the mass properties of the collider will update as well.
   * 
   * Changing shapes can make the physics engine explode since it can cause objects to overlap in unnatural ways.
   */
  setRadius(radius: number): void

}

/** A type of `Shape` that can be used for terrains and irregular surfaces. */
declare interface TerrainShape extends Shape {
}

/**
 * A WeldJoint is a `Joint` that restricts all relative motion between two colliders, as though they were welded together into a single object.  All six degrees of freedom are constrained.
 * 
 * WeldJoints are useful for making breakable objects.  Several colliders can be welded together with joints, and if `Joint:getForce` reports a large enough value, the joints can be disabled or destroyed, allowing the pieces to move freely.
 */
declare interface WeldJoint extends Joint {
}

/**
 * A World is an object that holds all of the colliders and joints in a physics simulation.
 * 
 * Be sure to call `World:update` on the World every frame to advance the simulation.
 */
declare interface World extends LovrObject {
  /**
   * Destroys the World.  This will destroy all colliders, shapes, and joints in the world.  After calling this function, the world can no longer be used.  Attempting to call a method on the World after destroying it will error, with the exception of `World:isDestroyed`.
   * 
   * `World.destroy()`
   * 
   * If a World gets garbage collected, it will be destroyed and, consequently, all of the colliders, shapes, and joints in the World will be destroyed as well, even if they can still be reached by Lua.  This is an exception to the way objects in LÖVR normally work, and is done to avoid issues with cycles in reference counting.
   */
  destroy(): void

  /**
   * Disables collision between two tags.  Use `Collider:setTag` to set a Collider's tag.
   * 
   * `World.disableCollisionBetween(tag1, tag2)`
   * 
   * @param tag1 - The first tag.
   * @param tag2 - The second tag.
   * 
   * By default, collision is enabled between all tags.
   * 
   * Another way of disabling collisions is by using the `filter` callback in `World:setCallbacks`. However, using tags is much faster than using the callback, because the physics engine calls the callback later in the collision detection process.  With tags, the colliders are ignored much earlier and precise collision detection is never performed.
   * 
   * Tags can be marked as "static" when the world is created, as an optimization hint.  Static tags will never collide with other static tags, regardless of whether collision is enabled between them.
   */
  disableCollisionBetween(tag1: string, tag2: string): void

  /**
   * Enables collision between two tags.  Use `Collider:setTag` to set a Collider's tag.
   * 
   * `World.enableCollisionBetween(tag1, tag2)`
   * 
   * @param tag1 - The first tag.
   * @param tag2 - The second tag.
   * 
   * By default, collision is enabled between all tags.
   * 
   * Tags can be marked as "static" when the world is created, as an optimization hint.  Static tags will never collide with other static tags, regardless of whether collision is enabled between them.
   */
  enableCollisionBetween(tag1: string, tag2: string): void

  /**
   * Returns the angular damping parameters of the World.  Angular damping makes things less "spinny", making them slow down their angular velocity over time.
   * 
   * `[damping, threshold] = World.getAngularDamping()`
   * 
   * @returns 
   * damping - The angular damping.
   * threshold - Velocity limit below which the damping is not applied.
   * 
   * This sets the default damping for newly-created colliders.  Damping can also be set on a per-collider basis using `Collider:setAngularDamping`.
   */
  getAngularDamping(): LuaMultiReturn<[damping: number, threshold: number]>

  /**
   * - Returns the callbacks assigned to the World.
   * - The callbacks are described in more detail on `World:setCallbacks`.
   * 
   * `callbacks = World.getCallbacks()`
   * 
   * @returns The World collision callbacks.
   */
  getCallbacks(): LuaTable

  /**
   * Returns the number of colliders in the world.  This includes sleeping and disabled colliders.
   * 
   * `count = World.getColliderCount()`
   * 
   * @returns The number of colliders in the World.
   * 
   * The world has a maximum number of colliders, configured when creating the world.  The default is 8192.  Trying to create more than this will error.
   */
  getColliderCount(): number

  /**
   * Returns a list of colliders in the world.  This includes sleeping and disabled colliders.
   * 
   * `colliders = World.getColliders()`
   * 
   * @returns The list of `Collider` objects in the World.
   */
  getColliders(): Collider[]

  /**
   * Returns the World's gravity.  Gravity is a constant acceleration applied to all colliders.  The default is `(0, -9.81, 0)` meters per second squared, causing colliders to fall downward.
   * 
   * Use `Collider:setGravityScale` to change gravity strength for a single collider.
   * 
   * `[gx, gy, gz] = World.getGravity()`
   * 
   * @returns 
   * gx - The x component of the gravity force, in meters per second squared.
   * gy - The y component of the gravity force, in meters per second squared.
   * gz - The z component of the gravity force, in meters per second squared.
   * 
   * Kinematic colliders ignore gravity, since they are not moved by forces.  Colliders with higher mass do not fall faster.
   */
  getGravity(): LuaMultiReturn<[gx: number, gy: number, gz: number]>

  /**
   * Returns the number of joints in the world.  This includes disabled joints.
   * 
   * `count = World.getJointCount()`
   * 
   * @returns The number of joints in the World.
   */
  getJointCount(): number

  /**
   * Returns a table with all the joints in the World.  This includes disabled joints.
   * 
   * `joints = World.getJoints()`
   * 
   * @returns The list of `Joint` objects in the World.
   */
  getJoints(): Joint[]

  /**
   * Returns the linear damping parameters of the World.  Linear damping is similar to drag or air resistance, slowing down colliders over time as they move.
   * 
   * `[damping, threshold] = World.getLinearDamping()`
   * 
   * @returns 
   * damping - The linear damping.
   * threshold - Velocity limit below which the damping is not applied.
   * 
   * A linear damping of 0 means colliders won't slow down over time.  This is the default.
   * 
   * This sets the default damping for newly-created colliders.  Damping can also be set on a per-collider basis using `Collider:setLinearDamping`.
   */
  getLinearDamping(): LuaMultiReturn<[damping: number, threshold: number]>

  /**
   * Returns the response time factor of the World.
   * 
   * The response time controls how relaxed collisions and joints are in the physics simulation, and functions similar to inertia.  A low response time means collisions are resolved quickly, and higher values make objects more spongy and soft.
   * 
   * The value can be any positive number.  It can be changed on a per-joint basis for `DistanceJoint` and `BallJoint` objects.
   * 
   * `responseTime = World.getResponseTime()`
   * 
   * @returns The response time setting for the World.
   */
  getResponseTime(): number

  /**
   * Returns the step count of the World.  The step count influences how many steps are taken during a call to `World:update`.  A higher number of steps will be slower, but more accurate.  The default step count is 20.
   * 
   * `steps = World.getStepCount()`
   * 
   * @returns The step count.
   */
  getStepCount(): number

  /**
   * Returns the list of collision tags that were specified when the World was created.  Tags are assigned to colliders using `Collider:setTag`, and collision can be enabled/disabled for pairs of tags with `World:enableCollisionBetween` and `World:disableCollisionBetween`.
   * 
   * `tags = World.getTags()`
   * 
   * @returns A table of collision tags (strings).
   */
  getTags(): string[]

  /**
   * Returns the tightness of joints in the World.
   * 
   * The tightness controls how much force is applied to colliders connected by joints.  With a value of 0, no force will be applied and joints won't have any effect.  With a tightness of 1, a strong force will be used to try to keep the Colliders constrained.  A tightness larger than 1 will overcorrect the joints, which can sometimes be desirable.  Negative tightness values are not supported.
   * 
   * `tightness = World.getTightness()`
   * 
   * @returns The tightness of the World.
   */
  getTightness(): number

  /**
   * Interpolates collider poses between their previous pose and their current pose.  Methods like `Collider:getPosition` and `Collider:getOrientation` will return the smoothed values.
   * 
   * After `World:update` is called, any interpolation is reset and `World:interpolate` will need to be called again to recompute the interpolated poses.
   * 
   * This can be used to decouple the physics tick rate from the rendering rate.  For example, the physics simulation can be run at a fixed rate of 30Hz, and collider poses can be interpolated before rendering.  This leads to a more stable simulation, and allows the physics rate to be increased or decreased as desired, independent of the current display refresh rate.
   * 
   * `World.interpolate(alpha)`
   * 
   * @param alpha - The interpolation parameter.  An alpha of zero will use the previous collider pose, an alpha of 1.0 will use the latest collider pose, etc.  Can be less than zero or greater than one.
   */
  interpolate(alpha: number): void

  /**
   * Returns whether collisions are enabled between a pair of tags.
   * 
   * `enabled = World.isCollisionEnabledBetween(tag1, tag2)`
   * 
   * @param tag1 - The first tag.
   * @param tag2 - The second tag.
   * @returns Whether or not two colliders with the specified tags will collide.
   * 
   * If either tag is nil, this function returns true, for convenience.  For example, the following function will still work if either of the colliders don't have a tag:
   * 
   *     function willCollide(c1, c2)
   *       return world:isCollisionEnabledBetween(c1:getTag(), c2:getTag())
   *     end
   * 
   * By default, collision is enabled between all tags.
   * 
   * Tags can be marked as "static" when the world is created, as an optimization hint.  Static tags will never collide with other static tags, regardless of whether collision is enabled between them.
   */
  isCollisionEnabledBetween(tag1: string, tag2: string): boolean

  /**
   * Returns whether the World has been destroyed.  Destroyed worlds can not be used for anything.
   * 
   * `destroyed = World.isDestroyed()`
   * 
   * @returns Whether the World has been destroyed.
   */
  isDestroyed(): boolean

  /**
   * Returns whether colliders can go to sleep in the World.
   * 
   * `allowed = World.isSleepingAllowed()`
   * 
   * @returns Whether colliders can sleep.
   * 
   * If sleeping is enabled, the World will try to detect colliders that haven't moved for a while and put them to sleep.  Sleeping colliders don't impact the physics simulation, which makes updates more efficient and improves physics performance.  However, the physics engine isn't perfect at waking up sleeping colliders and this can lead to bugs where colliders don't react to forces or collisions properly.
   * 
   * This can be set on individual colliders.
   * 
   * Colliders can be manually put to sleep or woken up using `Collider:setAwake`.
   */
  isSleepingAllowed(): boolean

  /**
   * Adds a Collider to the world and attaches a `BoxShape`.
   * 
   * `collider = World.newBoxCollider(x, y, z, width, height, depth)`
   * 
   * @param x - The x coordinate of the center of the box, in meters.
   * @param y - The y coordinate of the center of the box, in meters.
   * @param z - The z coordinate of the center of the box, in meters.
   * @param width - The width of the box, in meters.
   * @param height - The height of the box, in meters.
   * @param depth - The depth of the box, in meters.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newBoxCollider(x?: number, y?: number, z?: number, width?: number, height?: number, depth?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `BoxShape`.
   * 
   * `collider = World.newBoxCollider(position, size)`
   * 
   * @param position - The position of the center of the box, in meters.
   * @param size - The size of the box, in meters.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newBoxCollider(position: vector, size: vector): Collider

  /**
   * Adds a Collider to the world and attaches a `CapsuleShape`.
   * 
   * `collider = World.newCapsuleCollider(x, y, z, radius, length)`
   * 
   * @param x - The x coordinate of the center of the capsule, in meters.
   * @param y - The y coordinate of the center of the capsule, in meters.
   * @param z - The z coordinate of the center of the capsule, in meters.
   * @param radius - The radius of the capsule, in meters.
   * @param length - The length of the capsule, not including the caps, in meters.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   * 
   * The length of the capsule goes along its local Z axis.
   */
  newCapsuleCollider(x?: number, y?: number, z?: number, radius?: number, length?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `CapsuleShape`.
   * 
   * `collider = World.newCapsuleCollider(position, radius, length)`
   * 
   * @param position - The position of the center of the capsule, in meters.
   * @param radius - The radius of the capsule, in meters.
   * @param length - The length of the capsule, not including the caps, in meters.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   * 
   * The length of the capsule goes along its local Z axis.
   */
  newCapsuleCollider(position: vector, radius?: number, length?: number): Collider

  /**
   * Adds a new Collider to the World, without attaching any Shapes to it.  Use `Collider:addShape` to add shapes.
   * 
   * `collider = World.newCollider(x, y, z)`
   * 
   * @param x - The x position of the Collider.
   * @param y - The y position of the Collider.
   * @param z - The z position of the Collider.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newCollider(x: number, y: number, z: number): Collider

  /**
   * Adds a new Collider to the World, without attaching any Shapes to it.  Use `Collider:addShape` to add shapes.
   * 
   * `collider = World.newCollider(position)`
   * 
   * @param position - The position of the Collider.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newCollider(position: vector): Collider

  /**
   * Adds a Collider to the world and attaches a `ConvexShape`.  A `ConvexShape` is a convex hull of a set of points, kinda like if you wrapped them in wrapping paper.
   * 
   * `collider = World.newConvexCollider(x, y, z, points, scale)`
   * 
   * @param x - The x coordinate of the collider, in meters.
   * @param y - The y coordinate of the collider, in meters.
   * @param z - The z coordinate of the collider, in meters.
   * @param points - A list of vertices to compute a convex hull from.  Can be a table of tables (each with 3 numbers) or a table of numbers (every 3 numbers form a 3D point).
   * @param scale - A scale to apply to the points.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newConvexCollider(x: number, y: number, z: number, points: LuaTable, scale?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `ConvexShape`.  A `ConvexShape` is a convex hull of a set of points, kinda like if you wrapped them in wrapping paper.
   * 
   * `collider = World.newConvexCollider(position, points, scale)`
   * 
   * @param position - The position of the center of the capsule, in meters.
   * @param points - A list of vertices to compute a convex hull from.  Can be a table of tables (each with 3 numbers) or a table of numbers (every 3 numbers form a 3D point).
   * @param scale - A scale to apply to the points.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newConvexCollider(position: vector, points: LuaTable, scale?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `ConvexShape`.  A `ConvexShape` is a convex hull of a set of points, kinda like if you wrapped them in wrapping paper.
   * 
   * `collider = World.newConvexCollider(x, y, z, modelData, scale)`
   * 
   * @param x - The x coordinate of the collider, in meters.
   * @param y - The y coordinate of the collider, in meters.
   * @param z - The z coordinate of the collider, in meters.
   * @param modelData - The ModelData to compute a convex hull from.
   * @param scale - A scale to apply to the points.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newConvexCollider(x: number, y: number, z: number, modelData: ModelData, scale?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `ConvexShape`.  A `ConvexShape` is a convex hull of a set of points, kinda like if you wrapped them in wrapping paper.
   * 
   * `collider = World.newConvexCollider(position, modelData, scale)`
   * 
   * @param position - The position of the center of the capsule, in meters.
   * @param modelData - The ModelData to compute a convex hull from.
   * @param scale - A scale to apply to the points.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newConvexCollider(position: vector, modelData: ModelData, scale?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `ConvexShape`.  A `ConvexShape` is a convex hull of a set of points, kinda like if you wrapped them in wrapping paper.
   * 
   * `collider = World.newConvexCollider(x, y, z, model, scale)`
   * 
   * @param x - The x coordinate of the collider, in meters.
   * @param y - The y coordinate of the collider, in meters.
   * @param z - The z coordinate of the collider, in meters.
   * @param model - The Model to compute a convex hull from.
   * @param scale - A scale to apply to the points.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newConvexCollider(x: number, y: number, z: number, model: Model, scale?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `ConvexShape`.  A `ConvexShape` is a convex hull of a set of points, kinda like if you wrapped them in wrapping paper.
   * 
   * `collider = World.newConvexCollider(position, model, scale)`
   * 
   * @param position - The position of the center of the capsule, in meters.
   * @param model - The Model to compute a convex hull from.
   * @param scale - A scale to apply to the points.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newConvexCollider(position: vector, model: Model, scale?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `ConvexShape`.  A `ConvexShape` is a convex hull of a set of points, kinda like if you wrapped them in wrapping paper.
   * 
   * `collider = World.newConvexCollider(x, y, z, mesh, scale)`
   * 
   * @param x - The x coordinate of the collider, in meters.
   * @param y - The y coordinate of the collider, in meters.
   * @param z - The z coordinate of the collider, in meters.
   * @param mesh - The Mesh to compute a convex hull from.  It must use the `cpu` storage mode.
   * @param scale - A scale to apply to the points.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newConvexCollider(x: number, y: number, z: number, mesh: Mesh, scale?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `ConvexShape`.  A `ConvexShape` is a convex hull of a set of points, kinda like if you wrapped them in wrapping paper.
   * 
   * `collider = World.newConvexCollider(position, mesh, scale)`
   * 
   * @param position - The position of the center of the capsule, in meters.
   * @param mesh - The Mesh to compute a convex hull from.  It must use the `cpu` storage mode.
   * @param scale - A scale to apply to the points.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newConvexCollider(position: vector, mesh: Mesh, scale?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `ConvexShape`.  A `ConvexShape` is a convex hull of a set of points, kinda like if you wrapped them in wrapping paper.
   * 
   * `collider = World.newConvexCollider(x, y, z, template, scale)`
   * 
   * Clones an existing ConvexShape, which is faster than passing the same points multiple times. Clones can have their own scale.  The clone's scale doesn't get multiplied with the scale of the template.
   * 
   * @param x - The x coordinate of the collider, in meters.
   * @param y - The y coordinate of the collider, in meters.
   * @param z - The z coordinate of the collider, in meters.
   * @param template - An existing ConvexShape to clone.
   * @param scale - A scale to apply to the points.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newConvexCollider(x: number, y: number, z: number, template: ConvexShape, scale?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `ConvexShape`.  A `ConvexShape` is a convex hull of a set of points, kinda like if you wrapped them in wrapping paper.
   * 
   * `collider = World.newConvexCollider(position, template, scale)`
   * 
   * Clones an existing ConvexShape, which is faster than passing the same points multiple times. Clones can have their own scale.  The clone's scale doesn't get multiplied with the scale of the template.
   * 
   * @param position - The position of the center of the capsule, in meters.
   * @param template - An existing ConvexShape to clone.
   * @param scale - A scale to apply to the points.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newConvexCollider(position: vector, template: ConvexShape, scale?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `CylinderShape`.
   * 
   * `collider = World.newCylinderCollider(x, y, z, radius, length)`
   * 
   * @param x - The x coordinate of the center of the cylinder, in meters.
   * @param y - The y coordinate of the center of the cylinder, in meters.
   * @param z - The z coordinate of the center of the cylinder, in meters.
   * @param radius - The radius of the cylinder, in meters.
   * @param length - The length of the cylinder, in meters.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   * 
   * The length of the cylinder goes along its local Z axis.
   */
  newCylinderCollider(x?: number, y?: number, z?: number, radius?: number, length?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `CylinderShape`.
   * 
   * `collider = World.newCylinderCollider(position, radius, length)`
   * 
   * @param position - The position of the center of the cylinder, in meters.
   * @param radius - The radius of the cylinder, in meters.
   * @param length - The length of the cylinder, in meters.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   * 
   * The length of the cylinder goes along its local Z axis.
   */
  newCylinderCollider(position: vector, radius?: number, length?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `MeshShape`.
   * 
   * Colliders with mesh shapes are immobile and can only be used for static environment objects. The collider will be kinematic and forces/velocities will not move it.  Also, these colliders will not detect collisions with other kinematic objects.
   * 
   * MeshShapes are not treated as solid objects, but instead a collection of triangles.  They do not have mass or volume, and there is no concept of being "inside" a mesh.  `ConvexShape` is a good alternative for solid objects with an arbitrary shape.
   * 
   * `collider = World.newMeshCollider(vertices, indices)`
   * 
   * @param vertices - A table of vertices in the mesh.  Can be a table of tables (each with 3 numbers) or a table of numbers (every 3 numbers form a 3D vertex).
   * @param indices - A table of triangle indices representing how the vertices are connected together into triangles.
   * @returns The new Collider.
   * 
   * The triangles in a MeshShape should use counterclockwise winding.
   */
  newMeshCollider(vertices: LuaTable, indices: LuaTable): Collider

  /**
   * Adds a Collider to the world and attaches a `MeshShape`.
   * 
   * Colliders with mesh shapes are immobile and can only be used for static environment objects. The collider will be kinematic and forces/velocities will not move it.  Also, these colliders will not detect collisions with other kinematic objects.
   * 
   * MeshShapes are not treated as solid objects, but instead a collection of triangles.  They do not have mass or volume, and there is no concept of being "inside" a mesh.  `ConvexShape` is a good alternative for solid objects with an arbitrary shape.
   * 
   * `collider = World.newMeshCollider(modelData)`
   * 
   * @param modelData - A ModelData to use for the mesh data.
   * @returns The new Collider.
   * 
   * The triangles in a MeshShape should use counterclockwise winding.
   */
  newMeshCollider(modelData: ModelData): Collider

  /**
   * Adds a Collider to the world and attaches a `MeshShape`.
   * 
   * Colliders with mesh shapes are immobile and can only be used for static environment objects. The collider will be kinematic and forces/velocities will not move it.  Also, these colliders will not detect collisions with other kinematic objects.
   * 
   * MeshShapes are not treated as solid objects, but instead a collection of triangles.  They do not have mass or volume, and there is no concept of being "inside" a mesh.  `ConvexShape` is a good alternative for solid objects with an arbitrary shape.
   * 
   * `collider = World.newMeshCollider(model)`
   * 
   * @param model - A Model to use for the mesh data.  Similar to calling `Model:getTriangles` and passing it to this function, but has better performance.
   * @returns The new Collider.
   * 
   * The triangles in a MeshShape should use counterclockwise winding.
   */
  newMeshCollider(model: Model): Collider

  /**
   * Adds a Collider to the world and attaches a `MeshShape`.
   * 
   * Colliders with mesh shapes are immobile and can only be used for static environment objects. The collider will be kinematic and forces/velocities will not move it.  Also, these colliders will not detect collisions with other kinematic objects.
   * 
   * MeshShapes are not treated as solid objects, but instead a collection of triangles.  They do not have mass or volume, and there is no concept of being "inside" a mesh.  `ConvexShape` is a good alternative for solid objects with an arbitrary shape.
   * 
   * `collider = World.newMeshCollider(mesh)`
   * 
   * @param mesh - A Mesh to use for the mesh data.  It must use the `cpu` storage mode.
   * @returns The new Collider.
   * 
   * The triangles in a MeshShape should use counterclockwise winding.
   */
  newMeshCollider(mesh: Mesh): Collider

  /**
   * Adds a Collider to the world and attaches a `MeshShape`.
   * 
   * Colliders with mesh shapes are immobile and can only be used for static environment objects. The collider will be kinematic and forces/velocities will not move it.  Also, these colliders will not detect collisions with other kinematic objects.
   * 
   * MeshShapes are not treated as solid objects, but instead a collection of triangles.  They do not have mass or volume, and there is no concept of being "inside" a mesh.  `ConvexShape` is a good alternative for solid objects with an arbitrary shape.
   * 
   * `collider = World.newMeshCollider(template)`
   * 
   * Clones an existing MeshShape, which is faster than passing the same mesh multiple times. Clones can have their own scale.  The clone's scale doesn't get multiplied with the scale of the template.
   * 
   * @param template - An existing MeshShape to reuse.
   * @returns The new Collider.
   * 
   * The triangles in a MeshShape should use counterclockwise winding.
   */
  newMeshCollider(template: MeshShape): Collider

  /**
   * Adds a Collider to the world and attaches a `SphereShape`.
   * 
   * `collider = World.newSphereCollider(x, y, z, radius)`
   * 
   * @param x - The x coordinate of the center of the sphere, in meters.
   * @param y - The y coordinate of the center of the sphere, in meters.
   * @param z - The z coordinate of the center of the sphere, in meters.
   * @param radius - The radius of the sphere, in meters.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newSphereCollider(x?: number, y?: number, z?: number, radius?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `SphereShape`.
   * 
   * `collider = World.newSphereCollider(position, radius)`
   * 
   * @param position - The position of the center of the sphere, in meters.
   * @param radius - The radius of the sphere, in meters.
   * @returns The new Collider.
   * 
   * This will throw an error if there are too many colliders in the world.  The limit defaults to 16384 and can be changed in `lovr.physics.newWorld`.
   */
  newSphereCollider(position: vector, radius?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `TerrainShape`.
   * 
   * Colliders with terrain shapes are immobile and can only be used for static environment objects. The collider will be kinematic and forces/velocities will not move it.  Also, these colliders will not detect collisions with other kinematic objects.
   * 
   * TerrainShapes are not treated as solid objects, but instead a collection of triangles.  They do not have mass or volume, and there is no concept of being "inside" the terrain.
   * 
   * `collider = World.newTerrainCollider(scale)`
   * 
   * Create a flat floor collider.
   * 
   * @param scale - The width and depth of the terrain, in meters.
   * @returns The new Collider.
   */
  newTerrainCollider(scale: number): Collider

  /**
   * Adds a Collider to the world and attaches a `TerrainShape`.
   * 
   * Colliders with terrain shapes are immobile and can only be used for static environment objects. The collider will be kinematic and forces/velocities will not move it.  Also, these colliders will not detect collisions with other kinematic objects.
   * 
   * TerrainShapes are not treated as solid objects, but instead a collection of triangles.  They do not have mass or volume, and there is no concept of being "inside" the terrain.
   * 
   * `collider = World.newTerrainCollider(scale, heightmap, stretch)`
   * 
   * Create terrain from a heightmap image.
   * 
   * @param scale - The width and depth of the terrain, in meters.
   * @param heightmap - A heightmap image describing the terrain elevation at different points.  The red channel brightness of each pixel determines the elevation at corresponding coordinates.  The image must be square and must have one of the formats supported by `Image:getPixel`.
   * @param stretch - A vertical multiplier for height values to obtain terrain height.  When the image format has pixel values only in the 0 to 1 range, this can be used to scale the height to meters.
   * @returns The new Collider.
   */
  newTerrainCollider(scale: number, heightmap: Image, stretch?: number): Collider

  /**
   * Adds a Collider to the world and attaches a `TerrainShape`.
   * 
   * Colliders with terrain shapes are immobile and can only be used for static environment objects. The collider will be kinematic and forces/velocities will not move it.  Also, these colliders will not detect collisions with other kinematic objects.
   * 
   * TerrainShapes are not treated as solid objects, but instead a collection of triangles.  They do not have mass or volume, and there is no concept of being "inside" the terrain.
   * 
   * `collider = World.newTerrainCollider(scale, callback, samples)`
   * 
   * Create terrain defined with a callback function.
   * 
   * @param scale - The width and depth of the terrain, in meters.
   * @param callback - A function that returns terrain height from x and z coordinates.  The x and z inputs will range from `-scale / 2` to `scale / 2`.
   * @param samples - The number of samples taken across the x and z dimensions.  More samples will result in higher terrain fidelity, but use more CPU and memory.
   * @returns The new Collider.
   */
  newTerrainCollider(scale: number, callback: (this: void, ...args: any[]) => any, samples?: number): Collider

  /**
   * Places a shape in the World, returning any shapes it intersects.
   * 
   * A tag filter can be given to filter out shapes by their collider's tag:
   * 
   * - Use nil to skip filtering.
   * - Pass a tag name to only return shapes whose collider has that tag.
   * - Pass a tag name with a ~ in front of it to exclude colliders with that tag.
   * - Pass multiple tags separated by spaces to include multiple tags (works with ~ too).
   * 
   * Provide an optional callback to call for each shape detected.  If the callbacks nil, this function returns the first shape detected.  In either case this function returns the shape, the hit position, and a penetration vector.  The penetration vector represents the direction and distance the shape would need to move so that it is no longer colliding with the input shape.
   * 
   * `World.overlapShape(shape, x, y, z, angle, ax, ay, az, maxDistance, filter, callback)`
   * 
   * @param shape - The Shape to test.
   * @param x - The x position to place the shape at, in meters.
   * @param y - The y position to place the shape at, in meters.
   * @param z - The z position to place the shape at, in meters.
   * @param angle - The angle the shape is rotated around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param maxDistance - The maximum distance at which a shape can be detected, in meters.  Zero will detect shapes touching the input shape, 1.0 will detect shapes within 1 meter of the input shape, etc.
   * @param filter - Tags to filter by, or nil for no filter.
   * @param callback - The callback to call for each intersection detected.
   */
  overlapShape(shape: Shape, x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number, maxDistance?: number, filter?: string, callback?: (this: void, ...args: any[]) => any): void

  /**
   * Places a shape in the World, returning any shapes it intersects.
   * 
   * A tag filter can be given to filter out shapes by their collider's tag:
   * 
   * - Use nil to skip filtering.
   * - Pass a tag name to only return shapes whose collider has that tag.
   * - Pass a tag name with a ~ in front of it to exclude colliders with that tag.
   * - Pass multiple tags separated by spaces to include multiple tags (works with ~ too).
   * 
   * Provide an optional callback to call for each shape detected.  If the callbacks nil, this function returns the first shape detected.  In either case this function returns the shape, the hit position, and a penetration vector.  The penetration vector represents the direction and distance the shape would need to move so that it is no longer colliding with the input shape.
   * 
   * `World.overlapShape(shape, position, orientation, maxDistance, filter, callback)`
   * 
   * @param shape - The Shape to test.
   * @param position - The position to place the shape at, in meters.
   * @param orientation - The orientation of the shape.
   * @param maxDistance - The maximum distance at which a shape can be detected, in meters.  Zero will detect shapes touching the input shape, 1.0 will detect shapes within 1 meter of the input shape, etc.
   * @param filter - Tags to filter by, or nil for no filter.
   * @param callback - The callback to call for each intersection detected.
   */
  overlapShape(shape: Shape, position: vector, orientation: quaternion, maxDistance?: number, filter?: string, callback?: (this: void, ...args: any[]) => any): void

  /**
   * Places a shape in the World, returning any shapes it intersects.
   * 
   * A tag filter can be given to filter out shapes by their collider's tag:
   * 
   * - Use nil to skip filtering.
   * - Pass a tag name to only return shapes whose collider has that tag.
   * - Pass a tag name with a ~ in front of it to exclude colliders with that tag.
   * - Pass multiple tags separated by spaces to include multiple tags (works with ~ too).
   * 
   * Provide an optional callback to call for each shape detected.  If the callbacks nil, this function returns the first shape detected.  In either case this function returns the shape, the hit position, and a penetration vector.  The penetration vector represents the direction and distance the shape would need to move so that it is no longer colliding with the input shape.
   * 
   * `[collider, shape, x, y, z, nx, ny, nz] = World.overlapShape(shape, x, y, z, angle, ax, ay, az, maxDistance, filter)`
   * 
   * @param shape - The Shape to test.
   * @param x - The x position to place the shape at, in meters.
   * @param y - The y position to place the shape at, in meters.
   * @param z - The z position to place the shape at, in meters.
   * @param angle - The angle the shape is rotated around its rotation axis, in radians.
   * @param ax - The x component of the axis of rotation.
   * @param ay - The y component of the axis of rotation.
   * @param az - The z component of the axis of rotation.
   * @param maxDistance - The maximum distance at which a shape can be detected, in meters.  Zero will detect shapes touching the input shape, 1.0 will detect shapes within 1 meter of the input shape, etc.
   * @param filter - Tags to filter by, or nil for no filter.
   * @returns 
   * collider - The collider that was hit.
   * shape - The shape that was hit.
   * x - The x position of a world space contact point on the surface of the shape.
   * y - The y position of a world space contact point on the surface of the shape.
   * z - The z position of a world space contact point on the surface of the shape.
   * nx - The x component of the penetration vector.
   * ny - The y component of the penetration vector.
   * nz - The z component of the penetration vector.
   */
  overlapShape(shape: Shape, x: number, y: number, z: number, angle: number, ax: number, ay: number, az: number, maxDistance?: number, filter?: string): LuaMultiReturn<[collider: Collider, shape: Shape, x: number, y: number, z: number, nx: number, ny: number, nz: number]>

  /**
   * Places a shape in the World, returning any shapes it intersects.
   * 
   * A tag filter can be given to filter out shapes by their collider's tag:
   * 
   * - Use nil to skip filtering.
   * - Pass a tag name to only return shapes whose collider has that tag.
   * - Pass a tag name with a ~ in front of it to exclude colliders with that tag.
   * - Pass multiple tags separated by spaces to include multiple tags (works with ~ too).
   * 
   * Provide an optional callback to call for each shape detected.  If the callbacks nil, this function returns the first shape detected.  In either case this function returns the shape, the hit position, and a penetration vector.  The penetration vector represents the direction and distance the shape would need to move so that it is no longer colliding with the input shape.
   * 
   * `[collider, shape, x, y, z, nx, ny, nz] = World.overlapShape(shape, position, orientation, maxDistance, filter)`
   * 
   * @param shape - The Shape to test.
   * @param position - The position to place the shape at, in meters.
   * @param orientation - The orientation of the shape.
   * @param maxDistance - The maximum distance at which a shape can be detected, in meters.  Zero will detect shapes touching the input shape, 1.0 will detect shapes within 1 meter of the input shape, etc.
   * @param filter - Tags to filter by, or nil for no filter.
   * @returns 
   * collider - The collider that was hit.
   * shape - The shape that was hit.
   * x - The x position of a world space contact point on the surface of the shape.
   * y - The y position of a world space contact point on the surface of the shape.
   * z - The z position of a world space contact point on the surface of the shape.
   * nx - The x component of the penetration vector.
   * ny - The y component of the penetration vector.
   * nz - The z component of the penetration vector.
   */
  overlapShape(shape: Shape, position: vector, orientation: quaternion, maxDistance?: number, filter?: string): LuaMultiReturn<[collider: Collider, shape: Shape, x: number, y: number, z: number, nx: number, ny: number, nz: number]>

  /**
   * Find colliders within an axis-aligned bounding box.  This is a fast but imprecise query that only checks a rough box around colliders.  Use `World:overlapShape` for an exact collision test.
   * 
   * Rough queries like this are useful for doing a quick check before doing lots of more expensive collision testing.
   * 
   * Pass a callback function to call for each collider detected, or leave the callback off and this function will return the first collider found.
   * 
   * `World.queryBox(x, y, z, width, height, depth, filter, callback)`
   * 
   * @param x - The x coordinate of the center of the box, in meters.
   * @param y - The y coordinate of the center of the box, in meters.
   * @param z - The z coordinate of the center of the box, in meters.
   * @param width - The width of the box, in meters
   * @param height - The height of the box, in meters
   * @param depth - The depth of the box, in meters.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front of the tags to exclude colliders with those tags.
   * @param callback - A function to call when a collider is detected.  The function will be called with a single `Collider` argument.
   * 
   * This will return sleeping colliders and sensors, but it will ignore disabled colliders.
   */
  queryBox(x: number, y: number, z: number, width: number, height: number, depth: number, filter?: string, callback?: (this: void, ...args: any[]) => any): void

  /**
   * Find colliders within an axis-aligned bounding box.  This is a fast but imprecise query that only checks a rough box around colliders.  Use `World:overlapShape` for an exact collision test.
   * 
   * Rough queries like this are useful for doing a quick check before doing lots of more expensive collision testing.
   * 
   * Pass a callback function to call for each collider detected, or leave the callback off and this function will return the first collider found.
   * 
   * `World.queryBox(position, size, filter, callback)`
   * 
   * @param position - The position of the center of the box, in meters.
   * @param size - The size of the box, in meters.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front of the tags to exclude colliders with those tags.
   * @param callback - A function to call when a collider is detected.  The function will be called with a single `Collider` argument.
   * 
   * This will return sleeping colliders and sensors, but it will ignore disabled colliders.
   */
  queryBox(position: vector, size: vector, filter?: string, callback?: (this: void, ...args: any[]) => any): void

  /**
   * Find colliders within an axis-aligned bounding box.  This is a fast but imprecise query that only checks a rough box around colliders.  Use `World:overlapShape` for an exact collision test.
   * 
   * Rough queries like this are useful for doing a quick check before doing lots of more expensive collision testing.
   * 
   * Pass a callback function to call for each collider detected, or leave the callback off and this function will return the first collider found.
   * 
   * `collider = World.queryBox(x, y, z, width, height, depth, filter)`
   * 
   * @param x - The x coordinate of the center of the box, in meters.
   * @param y - The y coordinate of the center of the box, in meters.
   * @param z - The z coordinate of the center of the box, in meters.
   * @param width - The width of the box, in meters
   * @param height - The height of the box, in meters
   * @param depth - The depth of the box, in meters.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front of the tags to exclude colliders with those tags.
   * @returns A Collider that intersected the box.
   * 
   * This will return sleeping colliders and sensors, but it will ignore disabled colliders.
   */
  queryBox(x: number, y: number, z: number, width: number, height: number, depth: number, filter?: string): Collider

  /**
   * Find colliders within an axis-aligned bounding box.  This is a fast but imprecise query that only checks a rough box around colliders.  Use `World:overlapShape` for an exact collision test.
   * 
   * Rough queries like this are useful for doing a quick check before doing lots of more expensive collision testing.
   * 
   * Pass a callback function to call for each collider detected, or leave the callback off and this function will return the first collider found.
   * 
   * `collider = World.queryBox(position, size, filter)`
   * 
   * @param position - The position of the center of the box, in meters.
   * @param size - The size of the box, in meters.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front of the tags to exclude colliders with those tags.
   * @returns A Collider that intersected the box.
   * 
   * This will return sleeping colliders and sensors, but it will ignore disabled colliders.
   */
  queryBox(position: vector, size: vector, filter?: string): Collider

  /**
   * Find colliders within a sphere.  This is a fast but imprecise query that only checks a rough box around colliders.  Use `World:overlapShape` for an exact collision test.
   * 
   * Rough queries like this are useful for doing a quick check before doing lots of more expensive collision testing.
   * 
   * Pass a callback function to call for each collider detected, or leave the callback off and this function will return the first collider found.
   * 
   * `World.querySphere(x, y, z, radius, filter, callback)`
   * 
   * @param x - The x coordinate of the center of the sphere.
   * @param y - The y coordinate of the center of the sphere.
   * @param z - The z coordinate of the center of the sphere.
   * @param radius - The radius of the sphere, in meters
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front of the tags to exclude colliders with those tags.
   * @param callback - A function to call when an intersection is detected.  The function will be called with a single `Collider` argument.
   */
  querySphere(x: number, y: number, z: number, radius: number, filter?: string, callback?: (this: void, ...args: any[]) => any): void

  /**
   * Find colliders within a sphere.  This is a fast but imprecise query that only checks a rough box around colliders.  Use `World:overlapShape` for an exact collision test.
   * 
   * Rough queries like this are useful for doing a quick check before doing lots of more expensive collision testing.
   * 
   * Pass a callback function to call for each collider detected, or leave the callback off and this function will return the first collider found.
   * 
   * `World.querySphere(position, radius, filter, callback)`
   * 
   * @param position - The position of the center of the sphere.
   * @param radius - The radius of the sphere, in meters
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front of the tags to exclude colliders with those tags.
   * @param callback - A function to call when an intersection is detected.  The function will be called with a single `Collider` argument.
   */
  querySphere(position: vector, radius: number, filter?: string, callback?: (this: void, ...args: any[]) => any): void

  /**
   * Find colliders within a sphere.  This is a fast but imprecise query that only checks a rough box around colliders.  Use `World:overlapShape` for an exact collision test.
   * 
   * Rough queries like this are useful for doing a quick check before doing lots of more expensive collision testing.
   * 
   * Pass a callback function to call for each collider detected, or leave the callback off and this function will return the first collider found.
   * 
   * `collider = World.querySphere(x, y, z, radius, filter)`
   * 
   * @param x - The x coordinate of the center of the sphere.
   * @param y - The y coordinate of the center of the sphere.
   * @param z - The z coordinate of the center of the sphere.
   * @param radius - The radius of the sphere, in meters
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front of the tags to exclude colliders with those tags.
   * @returns A Collider that intersected the sphere.
   */
  querySphere(x: number, y: number, z: number, radius: number, filter?: string): Collider

  /**
   * Find colliders within a sphere.  This is a fast but imprecise query that only checks a rough box around colliders.  Use `World:overlapShape` for an exact collision test.
   * 
   * Rough queries like this are useful for doing a quick check before doing lots of more expensive collision testing.
   * 
   * Pass a callback function to call for each collider detected, or leave the callback off and this function will return the first collider found.
   * 
   * `collider = World.querySphere(position, radius, filter)`
   * 
   * @param position - The position of the center of the sphere.
   * @param radius - The radius of the sphere, in meters
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front of the tags to exclude colliders with those tags.
   * @returns A Collider that intersected the sphere.
   */
  querySphere(position: vector, radius: number, filter?: string): Collider

  /**
   * Traces a ray through the world and calls a function for each collider that was hit.
   * 
   * The callback can be left off, in which case the closest hit will be returned.
   * 
   * `World.raycast(x1, y1, z1, x2, y2, z2, filter, callback)`
   * 
   * @param x1 - The x coordinate of the origin of the ray.
   * @param y1 - The y coordinate of the origin of the ray.
   * @param z1 - The z coordinate of the origin of the ray.
   * @param x2 - The x coordinate of the endpoint of the ray.
   * @param y2 - The y coordinate of the endpoint of the ray.
   * @param z2 - The z coordinate of the endpoint of the ray.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front the tags to exclude colliders with those tags.
   * @param callback - The function to call when an intersection is detected (see notes).
   * 
   * The callback function is passed a collider, a shape, a world-space point, a world-space normal, a triangle index, and a fraction:
   * 
   *     function(collider, shape, x, y, z, nx, ny, nz, tri, fraction)
   *       return fraction
   *     end
   * 
   * The callback can return a fraction value used to limit the range of further hits.  For example:
   * 
   * - Returning 0.0 will abort the raycast and ignore all other hits.
   * - Returning 1.0 will call the callback for all hits.
   * - Returning `fraction` will return successively closer hits.
   * 
   * Raycasts will hit sensors and sleeping colliders, but will not hit disabled colliders.
   */
  raycast(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, filter?: string, callback?: (this: void, ...args: any[]) => any): void

  /**
   * Traces a ray through the world and calls a function for each collider that was hit.
   * 
   * The callback can be left off, in which case the closest hit will be returned.
   * 
   * `World.raycast(origin, endpoint, filter, callback)`
   * 
   * @param origin - The origin of the ray.
   * @param endpoint - The endpoint of the ray.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front the tags to exclude colliders with those tags.
   * @param callback - The function to call when an intersection is detected (see notes).
   * 
   * The callback function is passed a collider, a shape, a world-space point, a world-space normal, a triangle index, and a fraction:
   * 
   *     function(collider, shape, x, y, z, nx, ny, nz, tri, fraction)
   *       return fraction
   *     end
   * 
   * The callback can return a fraction value used to limit the range of further hits.  For example:
   * 
   * - Returning 0.0 will abort the raycast and ignore all other hits.
   * - Returning 1.0 will call the callback for all hits.
   * - Returning `fraction` will return successively closer hits.
   * 
   * Raycasts will hit sensors and sleeping colliders, but will not hit disabled colliders.
   */
  raycast(origin: vector, endpoint: vector, filter?: string, callback?: (this: void, ...args: any[]) => any): void

  /**
   * Traces a ray through the world and calls a function for each collider that was hit.
   * 
   * The callback can be left off, in which case the closest hit will be returned.
   * 
   * `[collider, shape, x, y, z, nx, ny, nz, triangle] = World.raycast(x1, y1, z1, x2, y2, z2, filter)`
   * 
   * @param x1 - The x coordinate of the origin of the ray.
   * @param y1 - The y coordinate of the origin of the ray.
   * @param z1 - The z coordinate of the origin of the ray.
   * @param x2 - The x coordinate of the endpoint of the ray.
   * @param y2 - The y coordinate of the endpoint of the ray.
   * @param z2 - The z coordinate of the endpoint of the ray.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front the tags to exclude colliders with those tags.
   * @returns 
   * collider - The Collider that was hit.
   * shape - The Shape that was hit.
   * x - The x coordinate of the impact point, in world space.
   * y - The y coordinate of the impact point, in world space.
   * z - The z coordinate of the impact point, in world space.
   * nx - The x component of the normal vector.
   * ny - The y component of the normal vector.
   * nz - The z component of the normal vector.
   * triangle - The index of the triangle that was hit, or nil if a MeshShape was not hit.
   * 
   * The callback function is passed a collider, a shape, a world-space point, a world-space normal, a triangle index, and a fraction:
   * 
   *     function(collider, shape, x, y, z, nx, ny, nz, tri, fraction)
   *       return fraction
   *     end
   * 
   * The callback can return a fraction value used to limit the range of further hits.  For example:
   * 
   * - Returning 0.0 will abort the raycast and ignore all other hits.
   * - Returning 1.0 will call the callback for all hits.
   * - Returning `fraction` will return successively closer hits.
   * 
   * Raycasts will hit sensors and sleeping colliders, but will not hit disabled colliders.
   */
  raycast(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, filter?: string): LuaMultiReturn<[collider: Collider, shape: Shape, x: number, y: number, z: number, nx: number, ny: number, nz: number, triangle: number | undefined]>

  /**
   * Traces a ray through the world and calls a function for each collider that was hit.
   * 
   * The callback can be left off, in which case the closest hit will be returned.
   * 
   * `[collider, shape, x, y, z, nx, ny, nz, triangle] = World.raycast(origin, endpoint, filter)`
   * 
   * @param origin - The origin of the ray.
   * @param endpoint - The endpoint of the ray.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front the tags to exclude colliders with those tags.
   * @returns 
   * collider - The Collider that was hit.
   * shape - The Shape that was hit.
   * x - The x coordinate of the impact point, in world space.
   * y - The y coordinate of the impact point, in world space.
   * z - The z coordinate of the impact point, in world space.
   * nx - The x component of the normal vector.
   * ny - The y component of the normal vector.
   * nz - The z component of the normal vector.
   * triangle - The index of the triangle that was hit, or nil if a MeshShape was not hit.
   * 
   * The callback function is passed a collider, a shape, a world-space point, a world-space normal, a triangle index, and a fraction:
   * 
   *     function(collider, shape, x, y, z, nx, ny, nz, tri, fraction)
   *       return fraction
   *     end
   * 
   * The callback can return a fraction value used to limit the range of further hits.  For example:
   * 
   * - Returning 0.0 will abort the raycast and ignore all other hits.
   * - Returning 1.0 will call the callback for all hits.
   * - Returning `fraction` will return successively closer hits.
   * 
   * Raycasts will hit sensors and sleeping colliders, but will not hit disabled colliders.
   */
  raycast(origin: vector, endpoint: vector, filter?: string): LuaMultiReturn<[collider: Collider, shape: Shape, x: number, y: number, z: number, nx: number, ny: number, nz: number, triangle: number | undefined]>

  /**
   * Sets the angular damping of the World.  Angular damping makes things less "spinny", making them slow down their angular velocity over time. Damping is only applied when angular velocity is over the threshold value.
   * 
   * `World.setAngularDamping(damping, threshold)`
   * 
   * @param damping - The angular damping.
   * @param threshold - Velocity limit below which the damping is not applied.
   * 
   * This sets the default damping for newly-created colliders.  Damping can also be set on a per-collider basis using `Collider:setAngularDamping`.
   */
  setAngularDamping(damping: number, threshold?: number): void

  /**
   * Assigns collision callbacks to the world.  These callbacks are used to filter collisions or get notifications when colliders start or stop touching.  Callbacks are called during `World:update`.
   * 
   * ### Filter
   * 
   * Filters collisions.  Receives two colliders and returns a boolean indicating if they should collide.  Note that it is much faster to use tags and `World:enableCollisionBetween` to control collision.  This should only be used when the logic for filtering the collision is highly dynamic.
   * 
   * ### Enter
   * 
   * Called when two colliders begin touching.  Receives two colliders and a `Contact` object with more information about the collision.  The `contact` callback will also be called for this collision.
   * 
   * ### Exit
   * 
   * Called when two colliders stop touching.  Receives two colliders.
   * 
   * ### Contact
   * 
   * Called continuously while two colliders are touching.  Receives two colliders and a `Contact` object with more information about the collision.  The contact can also be disabled to disable the collision response, and its friction/resitution/velocity can be changed.  There can be multiple active contact areas (called "manifolds") between a pair of colliders; this callback will be called for each one.
   * 
   * `World.setCallbacks(callbacks)`
   * 
   * @param callbacks - The World collision callbacks.  All of them are optional.
   * 
   * The `Thread` that last set these callbacks must also be the thread to call `World:update`.
   * 
   * Note that when a collider goes to sleep, its active contacts will be removed and the `exit` callback will be called.
   */
  setCallbacks(callbacks: { filter: (this: void, ...args: any[]) => any, enter: (this: void, ...args: any[]) => any, exit: (this: void, ...args: any[]) => any, contact: (this: void, ...args: any[]) => any, }): void

  /**
   * Sets the World's gravity.  Gravity is a constant acceleration applied to all colliders.  The default is `(0, -9.81, 0)` meters per second squared, causing colliders to fall downward.
   * 
   * Use `Collider:setGravityScale` to change gravity strength for a single collider.
   * 
   * `World.setGravity(xg, yg, zg)`
   * 
   * @param xg - The x component of the gravity force.
   * @param yg - The y component of the gravity force.
   * @param zg - The z component of the gravity force.
   * 
   * Kinematic colliders ignore gravity, since they are not moved by forces.  Colliders with higher mass do not fall faster.
   */
  setGravity(xg: number, yg: number, zg: number): void

  /**
   * Sets the World's gravity.  Gravity is a constant acceleration applied to all colliders.  The default is `(0, -9.81, 0)` meters per second squared, causing colliders to fall downward.
   * 
   * Use `Collider:setGravityScale` to change gravity strength for a single collider.
   * 
   * `World.setGravity(gravity)`
   * 
   * @param gravity - The gravity force.
   * 
   * Kinematic colliders ignore gravity, since they are not moved by forces.  Colliders with higher mass do not fall faster.
   */
  setGravity(gravity: vector): void

  /**
   * Sets the linear damping of the World.  Linear damping is similar to drag or air resistance, slowing down colliders over time as they move. Damping is only applied when linear velocity is over the threshold value.
   * 
   * `World.setLinearDamping(damping, threshold)`
   * 
   * @param damping - The linear damping.
   * @param threshold - Velocity limit below which the damping is not applied.
   * 
   * A linear damping of 0 means colliders won't slow down over time.  This is the default.
   * 
   * This sets the default damping for newly-created colliders.  Damping can also be set on a per-collider basis using `Collider:setLinearDamping`.
   */
  setLinearDamping(damping: number, threshold?: number): void

  /**
   * Sets the response time factor of the World.
   * 
   * The response time controls how relaxed collisions and joints are in the physics simulation, and functions similar to inertia.  A low response time means collisions are resolved quickly, and higher values make objects more spongy and soft.
   * 
   * The value can be any positive number.  It can be changed on a per-joint basis for `DistanceJoint` and `BallJoint` objects.
   * 
   * `World.setResponseTime(responseTime)`
   * 
   * @param responseTime - The new response time setting for the World.
   */
  setResponseTime(responseTime: number): void

  /**
   * Sets whether colliders can go to sleep in the World.
   * 
   * `World.setSleepingAllowed(allowed)`
   * 
   * @param allowed - Whether colliders can sleep.
   * 
   * If sleeping is enabled, the World will try to detect colliders that haven't moved for a while and put them to sleep.  Sleeping colliders don't impact the physics simulation, which makes updates more efficient and improves physics performance.  However, the physics engine isn't perfect at waking up sleeping colliders and this can lead to bugs where colliders don't react to forces or collisions properly.
   * 
   * This can be set on individual colliders.
   * 
   * Colliders can be manually put to sleep or woken up using `Collider:setAwake`.
   */
  setSleepingAllowed(allowed: boolean): void

  /**
   * Sets the step count of the World.  The step count influences how many steps are taken during a call to `World:update`.  A higher number of steps will be slower, but more accurate.  The default step count is 20.
   * 
   * `World.setStepCount(steps)`
   * 
   * @param steps - The new step count.
   */
  setStepCount(steps: number): void

  /**
   * Sets the tightness of joints in the World.
   * 
   * The tightness controls how much force is applied to colliders connected by joints.  With a value of 0, no force will be applied and joints won't have any effect.  With a tightness of 1, a strong force will be used to try to keep the Colliders constrained.  A tightness larger than 1 will overcorrect the joints, which can sometimes be desirable.  Negative tightness values are not supported.
   * 
   * `World.setTightness(tightness)`
   * 
   * @param tightness - The new tightness for the World.
   */
  setTightness(tightness: number): void

  /**
   * Moves a shape from a starting point to an endpoint and returns any colliders it touches along its path.
   * 
   * This is similar to a raycast, but with a `Shape` instead of a point.
   * 
   * `World.shapecast(shape, x1, y1, z1, x2, y2, z2, angle, ax, ay, az, filter, callback)`
   * 
   * @param shape - The Shape to cast.
   * @param x1 - The x position to start at.
   * @param y1 - The y position to start at.
   * @param z1 - The z position to start at.
   * @param x2 - The x position to move the shape to.
   * @param y2 - The y position to move the shape to.
   * @param z2 - The z position to move the shape to.
   * @param angle - The rotation of the shape around its rotation axis, in radians.
   * @param ax - The x component of the rotation axis.
   * @param ay - The y component of the rotation axis.
   * @param az - The z component of the rotation axis.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front the tags to exclude colliders with those tags.
   * @param callback - The function to call when an intersection is detected (see notes).
   * 
   * The callback function is passed a collider, a shape, a world-space point, a world-space normal, a triangle index (for mesh shapes), and a fraction:
   * 
   *     function(collider, shape, x, y, z, nx, ny, nz, tri, fraction)
   *       return fraction
   *     end
   * 
   * The callback can return a fraction value used to limit the range of further hits.  For example:
   * 
   * - Returning 0.0 will abort the shapecast and ignore all other hits.
   * - Returning 1.0 will call the callback for all hits.
   * - Returning `fraction` will return successively closer hits.
   * 
   * Shapecasts will hit sensors and sleeping colliders, but will not hit disabled colliders.
   */
  shapecast(shape: Shape, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, angle: number, ax: number, ay: number, az: number, filter: string, callback: (this: void, ...args: any[]) => any): void

  /**
   * Moves a shape from a starting point to an endpoint and returns any colliders it touches along its path.
   * 
   * This is similar to a raycast, but with a `Shape` instead of a point.
   * 
   * `World.shapecast(shape, position, destination, orientation, filter, callback)`
   * 
   * @param shape - The Shape to cast.
   * @param position - The position to start at.
   * @param destination - The position to move the shape to.
   * @param orientation - The orientation of the shape.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front the tags to exclude colliders with those tags.
   * @param callback - The function to call when an intersection is detected (see notes).
   * 
   * The callback function is passed a collider, a shape, a world-space point, a world-space normal, a triangle index (for mesh shapes), and a fraction:
   * 
   *     function(collider, shape, x, y, z, nx, ny, nz, tri, fraction)
   *       return fraction
   *     end
   * 
   * The callback can return a fraction value used to limit the range of further hits.  For example:
   * 
   * - Returning 0.0 will abort the shapecast and ignore all other hits.
   * - Returning 1.0 will call the callback for all hits.
   * - Returning `fraction` will return successively closer hits.
   * 
   * Shapecasts will hit sensors and sleeping colliders, but will not hit disabled colliders.
   */
  shapecast(shape: Shape, position: vector, destination: vector, orientation: quaternion, filter: string, callback: (this: void, ...args: any[]) => any): void

  /**
   * Moves a shape from a starting point to an endpoint and returns any colliders it touches along its path.
   * 
   * This is similar to a raycast, but with a `Shape` instead of a point.
   * 
   * `[collider, shape, x, y, z, nx, ny, nz, triangle, fraction] = World.shapecast(shape, x1, y1, z1, x2, y2, z2, angle, ax, ay, az, filter)`
   * 
   * @param shape - The Shape to cast.
   * @param x1 - The x position to start at.
   * @param y1 - The y position to start at.
   * @param z1 - The z position to start at.
   * @param x2 - The x position to move the shape to.
   * @param y2 - The y position to move the shape to.
   * @param z2 - The z position to move the shape to.
   * @param angle - The rotation of the shape around its rotation axis, in radians.
   * @param ax - The x component of the rotation axis.
   * @param ay - The y component of the rotation axis.
   * @param az - The z component of the rotation axis.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front the tags to exclude colliders with those tags.
   * @returns 
   * collider - The Collider that was hit.
   * shape - The Shape that was hit.
   * x - The x coordinate of the impact point.
   * y - The y coordinate of the impact point.
   * z - The z coordinate of the impact point.
   * nx - The x component of the normal vector.
   * ny - The y component of the normal vector.
   * nz - The z component of the normal vector.
   * triangle - The triangle that was hit, or `nil` if a MeshShape was not hit.
   * fraction - The fraction along the ray where the impact occurred.
   * 
   * The callback function is passed a collider, a shape, a world-space point, a world-space normal, a triangle index (for mesh shapes), and a fraction:
   * 
   *     function(collider, shape, x, y, z, nx, ny, nz, tri, fraction)
   *       return fraction
   *     end
   * 
   * The callback can return a fraction value used to limit the range of further hits.  For example:
   * 
   * - Returning 0.0 will abort the shapecast and ignore all other hits.
   * - Returning 1.0 will call the callback for all hits.
   * - Returning `fraction` will return successively closer hits.
   * 
   * Shapecasts will hit sensors and sleeping colliders, but will not hit disabled colliders.
   */
  shapecast(shape: Shape, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, angle: number, ax: number, ay: number, az: number, filter?: string): LuaMultiReturn<[collider: Collider, shape: Shape, x: number, y: number, z: number, nx: number, ny: number, nz: number, triangle: number, fraction: number]>

  /**
   * Moves a shape from a starting point to an endpoint and returns any colliders it touches along its path.
   * 
   * This is similar to a raycast, but with a `Shape` instead of a point.
   * 
   * `[collider, shape, x, y, z, nx, ny, nz, triangle, fraction] = World.shapecast(shape, position, destination, orientation, filter)`
   * 
   * @param shape - The Shape to cast.
   * @param position - The position to start at.
   * @param destination - The position to move the shape to.
   * @param orientation - The orientation of the shape.
   * @param filter - An optional tag filter.  Pass one or more tags separated by spaces to only return colliders with those tags.  Or, put `~` in front the tags to exclude colliders with those tags.
   * @returns 
   * collider - The Collider that was hit.
   * shape - The Shape that was hit.
   * x - The x coordinate of the impact point.
   * y - The y coordinate of the impact point.
   * z - The z coordinate of the impact point.
   * nx - The x component of the normal vector.
   * ny - The y component of the normal vector.
   * nz - The z component of the normal vector.
   * triangle - The triangle that was hit, or `nil` if a MeshShape was not hit.
   * fraction - The fraction along the ray where the impact occurred.
   * 
   * The callback function is passed a collider, a shape, a world-space point, a world-space normal, a triangle index (for mesh shapes), and a fraction:
   * 
   *     function(collider, shape, x, y, z, nx, ny, nz, tri, fraction)
   *       return fraction
   *     end
   * 
   * The callback can return a fraction value used to limit the range of further hits.  For example:
   * 
   * - Returning 0.0 will abort the shapecast and ignore all other hits.
   * - Returning 1.0 will call the callback for all hits.
   * - Returning `fraction` will return successively closer hits.
   * 
   * Shapecasts will hit sensors and sleeping colliders, but will not hit disabled colliders.
   */
  shapecast(shape: Shape, position: vector, destination: vector, orientation: quaternion, filter?: string): LuaMultiReturn<[collider: Collider, shape: Shape, x: number, y: number, z: number, nx: number, ny: number, nz: number, triangle: number, fraction: number]>

  /**
   * Updates the World, advancing the physics simulation forward in time and moving all the colliders.
   * 
   * `World.update(dt)`
   * 
   * @param dt - The amount of time to advance the simulation forward.
   * 
   * By default, the World updates at a fixed timestep.  This means that the physics simulation will always update with a constant rate, for example 60 "ticks" per second.  This improves stability of the simulation and decouples physics from rendering.  Collider poses are automatically interpolated between the two most recent ticks, ensuring smooth movement even if the tick rate is lower than the rendering rate.
   * 
   * Fixed timestep can be disabled by setting the `tickRate` option to 0 in `lovr.physics.newWorld`. This will use a variable timestep where the `dt` value passed to this function will be applied directly to the physics simulation.
   * 
   * This function must be called from the last thread that called `World:setCallbacks`.  If no callbacks are set, then this can be called from any thread.
   */
  update(dt: number): void

}

/** These are the different permissions that need to be requested using `lovr.system.requestPermission` on some platforms. */
declare type Permission = 'audiocapture'

/** A Channel is an object used to communicate between `Thread` objects.  Different threads can send messages on the same Channel to communicate with each other.  Messages can be sent and received on a Channel using `Channel:push` and `Channel:pop`, and are received in a first-in-first-out fashion. The following types of data can be passed through Channels: nil, boolean, number, string, lightuserdata, table, vector, and any LÖVR object. */
declare interface Channel extends LovrObject {
  /**
   * Removes all pending messages from the Channel.
   * 
   * `Channel.clear()`
   */
  clear(): void

  /**
   * Returns the number of messages in the Channel.
   * 
   * `count = Channel.getCount()`
   * 
   * @returns The number of messages in the Channel.
   */
  getCount(): number

  /**
   * Returns whether or not the message with the given ID has been read.  Every call to `Channel:push` returns a message ID.
   * 
   * `read = Channel.hasRead(id)`
   * 
   * @param id - The ID of the message to check.
   * @returns Whether the message has been read.
   */
  hasRead(id: number): boolean

  /**
   * Returns a message from the Channel without popping it from the queue.  If the Channel is empty, `nil` is returned.  This can be useful to determine if the Channel is empty.
   * 
   * `[message, present] = Channel.peek()`
   * 
   * @returns 
   * message - The message, or `nil` if there is no message.
   * present - Whether a message was returned (use to detect nil).
   * 
   * The second return value can be used to detect if a `nil` message is in the queue.
   */
  peek(): LuaMultiReturn<[message: any, present: boolean]>

  /**
   * Pops a message from the Channel.  If the Channel is empty, an optional timeout argument can be used to wait for a message, otherwise `nil` is returned.
   * 
   * `message = Channel.pop(wait)`
   * 
   * @param wait - How long to wait for a message to be popped, in seconds.  `true` can be used to wait forever and `false` can be used to avoid waiting.
   * @returns The received message, or `nil` if nothing was received.
   * 
   * Threads can get stuck forever waiting on Channel messages, so be careful.
   */
  pop(wait?: number | boolean): any

  /**
   * Pushes a message onto the Channel.  The following types of data can be pushed: nil, boolean, number, string, table, lightuserdata, vectors, and userdata (LÖVR objects).
   * 
   * `[id, read] = Channel.push(message, wait)`
   * 
   * @param message - The message to push.
   * @param wait - How long to wait for the message to be popped, in seconds.  `true` can be used to wait forever and `false` can be used to avoid waiting.
   * @returns 
   * id - The ID of the pushed message.
   * read - Whether the message was read by another thread before the wait timeout.
   * 
   * Threads can get stuck forever waiting on Channel messages, so be careful.
   */
  push(message: any, wait?: number | boolean): LuaMultiReturn<[id: number, read: boolean]>

}

/**
 * A Thread is an object that runs a chunk of Lua code in the background.  Threads are completely isolated from other threads, meaning they have their own Lua context and can't access the variables and functions of other threads.  Communication between threads is limited and is accomplished by using `Channel` objects.
 * 
 * To get `require` to work properly, add `require 'lovr.filesystem'` to the thread code.
 */
declare interface Thread extends LovrObject {
  /**
   * Returns the message for the error that occurred on the Thread, or nil if no error has occurred.
   * 
   * `error = Thread.getError()`
   * 
   * @returns The error message, or `nil` if no error has occurred on the Thread.
   */
  getError(): string | undefined

  /**
   * Returns whether or not the Thread is currently running.
   * 
   * `running = Thread.isRunning()`
   * 
   * @returns Whether or not the Thread is running.
   */
  isRunning(): boolean

  /**
   * Starts the Thread.
   * 
   * `Thread.start(...arguments)`
   * 
   * @param ...arguments - Up to 4 arguments to pass to the Thread's function.
   * 
   * The arguments can be nil, booleans, numbers, strings, lightuserdata, tables, vectors, or LÖVR objects.
   */
  start(...arguments: any[]): void

  /**
   * Waits for the Thread to complete, then returns.
   * 
   * `Thread.wait()`
   */
  wait(): void

}

///** @noSelf **/ declare function vector(x?: number, y?: number): Vec2
///** @noSelf **/ declare function vector(u: Vec2): Vec2
///** @noSelf **/ declare function vector(x?: number, y?: number): Vec2
///** @noSelf **/ declare function vector(u: Vec2): Vec2
//
//declare namespace vector {
//  const zero: Vec2
//  const one: Vec2
//}

///** @noSelf **/ declare function vector(x: number, y?: number, z?: number): vector
///** @noSelf **/ declare function vector(u: vector): vector
///** @noSelf **/ declare function vector(m: Mat4): vector
///** @noSelf **/ declare function vector(q: quaternion): vector

//declare namespace vector {
//  const zero: vector
//  const one: vector
//  const left: vector
//  const right: vector
//  const up: vector
//  const down: vector
//  const back: vector
//  const forward: vector
//}

///** @noSelf **/ declare function vec4(x?: number, y?: number, z?: number, w?: number): Vec4
///** @noSelf **/ declare function vec4(u: Vec4): Vec4
///** @noSelf **/ declare function Vec4(x?: number, y?: number, z?: number, w?: number): Vec4
///** @noSelf **/ declare function Vec4(u: Vec4): Vec4
//
//declare namespace vec4 {
//  const zero: Vec4
//  const one: Vec4
//}

///** @noSelf **/ declare function quaternion(angle: number, ax: number, ay: number, az: number): quaternion
///** @noSelf **/ declare function quatenion(r: quaternion): quaternion
///** @noSelf **/ declare function quatenion(v: vector): quaternion
///** @noSelf **/ declare function quatenion(v: vector, u: vector): quaternion
///** @noSelf **/ declare function quatenion(m: Mat4): quaternion
///** @noSelf **/ declare function quatenion(): quaternion

//declare namespace quaternion {
//  const identity: quaternion
//}

/** @noSelf **/ declare function vector(x: number, y?: number, z?: number): vector
/** @noSelf **/ declare function quaternion(angle: number, ax: number, ay: number, az: number): quaternion

/** @noSelf **/
declare namespace vector {
  function pack(x: number, y?: number, z?: number): vector
  function unpack(v: vector): LuaMultiReturn<[x: number, y: number, z: number]>
  function length(v: vector): number
  function normalize(v: vector): vector
  function distance(v: vector): number
  function cross(v: vector, u: vector): vector
  function dot(v: vector, u: vector): number
  function angle(v: vector, u: vector, axis: vector): number
  function lerp(v: vector, u: vector, t: number): vector

  const add: LuaAddition<vector, vector, vector>
  const sub: LuaSubtraction<vector, vector, vector>
  const mul: LuaMultiplication<vector, number, vector> & LuaMultiplication<number, vector, vector>
  const div: LuaDivision<vector, number, vector>
  const negative: LuaNegation<vector, vector>

  const zero: vector
  const one: vector
  const up: vector
  const right: vector
  const forward: vector
}

declare interface vector {
  readonly x: number
  readonly y: number
  readonly z: number

  unpack(): LuaMultiReturn<[x: number, y: number, z: number]>
  length(): number
  normalize(): vector
  distance(u: vector): number
  cross(u: vector): vector
  dot(u: vector): number
  angle(u: vector, axis?: vector): number
  lerp(u: vector, t: number): vector

  add: LuaAdditionMethod<vector, vector>
  sub: LuaSubtractionMethod<vector, vector>
  mul: LuaMultiplicationMethod<number, vector>
  div: LuaDivisionMethod<number, vector>
  negative: LuaNegationMethod<vector>
}

/** @noSelf **/
declare namespace quaternion {
  function pack(x: number, y: number, z: number, w: number): quaternion
  function unpack(q: quaternion): LuaMultiReturn<[x: number, y: number, z: number, w: number]>
  function conjucate(q: quaternion): quaternion
  function angleaxis(angle: number, ax: number, ay: number, az: number): quaternion
  function toangleaxis(q: quaternion): LuaMultiReturn<[angle: number, ax: number, ay: number, az: number]>
  function euler(x: number, y: number, z: number): quaternion
  function toeuler(q: quaternion): LuaMultiReturn<[x: number, y: number, z: number]>
  function between(a: vector, b: vector): quaternion
  function lookdir(dir: vector, up?: vector): quaternion
  function direction(q: quaternion): vector
  function slerp(q: quaternion, r: quaternion, t: number): quaternion
  
  const mul: LuaMultiplication<quaternion, quaternion, quaternion> & LuaMultiplication<quaternion, vector, vector>

  const identity: quaternion
}

declare interface quaternion {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly w: number

  unpack(): LuaMultiReturn<[x: number, y: number, z: number, w: number]>
  conjucate(): quaternion
  toangleaxis(): LuaMultiReturn<[angle: number, ax: number, ay: number, az: number]>
  toeuler(): LuaMultiReturn<[x: number, y: number, z: number]>
  lookdir(up?: vector): quaternion
  direction(): vector
  slerp(r: quaternion, t: number): quaternion

  mul: LuaMultiplicationMethod<quaternion, quaternion> & LuaMultiplicationMethod<vector, vector>
}

/** @noSelf **/ declare function mat4(): Mat4
/** @noSelf **/ declare function mat4(n: Mat4): Mat4
/** @noSelf **/ declare function mat4(position?: vector, scale?: vector, rotation?: quaternion): Mat4
/** @noSelf **/ declare function mat4(position?: vector, rotation?: quaternion): Mat4
/** @noSelf **/ declare function mat4(...rest: number[]): Mat4
/** @noSelf **/ declare function mat4(d: number): Mat4
/** @noSelf **/ declare function Mat4(): Mat4
/** @noSelf **/ declare function Mat4(n: Mat4): Mat4
/** @noSelf **/ declare function Mat4(position?: vector, scale?: vector, rotation?: quaternion): Mat4
/** @noSelf **/ declare function Mat4(position?: vector, rotation?: quaternion): Mat4
/** @noSelf **/ declare function Mat4(...rest: number[]): Mat4
/** @noSelf **/ declare function Mat4(d: number): Mat4

//declare interface vector {
//  add_temp: LuaAdditionMethod<vector, vector>
//  sub_temp: LuaSubtractionMethod<vector, vector>
//  mul_temp: LuaMultiplicationMethod<vector | number, vector>
//  div_temp: LuaDivisionMethod<vector | number, vector>
//
//  1: number
//  2: number
//
//  x: number
//  y: number
//
//  r: number
//  g: number
//
//  s: number
//  t: number
//}

//declare interface vector {
//  add: LuaAdditionMethod<vector, vector>
//  sub: LuaSubtractionMethod<vector, vector>
//  mul: LuaMultiplicationMethod<vector | number, vector>
//  div: LuaDivisionMethod<vector | number, vector>
//
//  //1: number
//  //2: number
//  //3: number
//
//  readonly x: number
//  readonly y: number
//  readonly z: number
//
//  //r: number
//  //g: number
//  //b: number
//
//  //s: number
//  //t: number
//  //p: number
//}

//declare interface vector {
//  add_temp: LuaAdditionMethod<vector, vector>
//  sub_temp: LuaSubtractionMethod<vector, vector>
//  mul_temp: LuaMultiplicationMethod<vector | number, vector>
//  div_temp: LuaDivisionMethod<vector | number, vector>
//
//  1: number
//  2: number
//  3: number
//  4: number
//
//  x: number
//  y: number
//  z: number
//  w: number
//
//  r: number
//  g: number
//  b: number
//  a: number
//
//  s: number
//  t: number
//  p: number
//  q: number
//}

//declare interface quaternion {
//  add: LuaAdditionMethod<quaternion, quaternion>
//  sub: LuaSubtractionMethod<quaternion, quaternion>
//  mul: LuaMultiplicationMethod<quaternion, quaternion> & LuaMultiplicationMethod<vector, vector>
//  div: LuaDivisionMethod<quaternion, quaternion>
//
//  //1: number
//  //2: number
//  //3: number
//  //4: number
//
//  readonly x: number
//  readonly y: number
//  readonly z: number
//  readonly w: number
//}

declare interface Mat4 {
  add_temp: LuaAdditionMethod<Mat4, Mat4>
  sub_temp: LuaSubtractionMethod<Mat4, Mat4>
  mul_temp: LuaMultiplicationMethod<Mat4 | number, Mat4> & LuaMultiplicationMethod<vector, vector> & LuaMultiplicationMethod<vector, vector>
  div_temp: LuaDivisionMethod<Mat4 | number, Mat4>

  1: number
  2: number
  3: number
  4: number
  5: number
  6: number
  7: number
  8: number
  9: number
  10: number
  11: number
  12: number
  13: number
  14: number
  15: number
  16: number
}
