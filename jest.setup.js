/* eslint-disable sonar/class-prototype */
require('whatwg-fetch')

HTMLMediaElement.prototype.play = () => Promise.resolve()
HTMLMediaElement.prototype.pause = () => undefined
HTMLMediaElement.prototype.load = () => undefined
HTMLMediaElement.prototype.addTextTrack = () => undefined
window.open = () => undefined
