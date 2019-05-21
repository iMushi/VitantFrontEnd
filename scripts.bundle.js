/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////             /////    /////
/////             /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
         /////    /////
         /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////
/////    /////    /////    /////

/**
 * ScrollReveal
 * ------------
 * Version : 3.4.0
 * Website : scrollrevealjs.org
 * Repo    : github.com/jlmakes/scrollreveal.js
 * Author  : Julian Lloyd (@jlmakes)
 */

;(function () {
  'use strict'

  var sr
  var _requestAnimationFrame

  function ScrollReveal (config) {
    // Support instantiation without the `new` keyword.
    if (typeof this === 'undefined' || Object.getPrototypeOf(this) !== ScrollReveal.prototype) {
      return new ScrollReveal(config)
    }

    sr = this // Save reference to instance.
    sr.version = '3.4.0'
    sr.tools = new Tools() // *required utilities

    if (sr.isSupported()) {
      sr.tools.extend(sr.defaults, config || {})

      sr.defaults.container = _resolveContainer(sr.defaults)

      sr.store = {
        elements: {},
        containers: []
      }

      sr.sequences = {}
      sr.history = []
      sr.uid = 0
      sr.initialized = false
    } else if (typeof console !== 'undefined' && console !== null) {
      // Note: IE9 only supports console if devtools are open.
      console.log('ScrollReveal is not supported in this browser.')
    }

    return sr
  }

  /**
   * Configuration
   * -------------
   * This object signature can be passed directly to the ScrollReveal constructor,
   * or as the second argument of the `reveal()` method.
   */

  ScrollReveal.prototype.defaults = {
    // 'bottom', 'left', 'top', 'right'
    origin: 'bottom',

    // Can be any valid CSS distance, e.g. '5rem', '10%', '20vw', etc.
    distance: '20px',

    // Time in milliseconds.
    duration: 500,
    delay: 0,

    // Starting angles in degrees, will transition from these values to 0 in all axes.
    rotate: { x: 0, y: 0, z: 0 },

    // Starting opacity value, before transitioning to the computed opacity.
    opacity: 0,

    // Starting scale value, will transition from this value to 1
    scale: 0.9,

    // Accepts any valid CSS easing, e.g. 'ease', 'ease-in-out', 'linear', etc.
    easing: 'cubic-bezier(0.6, 0.2, 0.1, 1)',

    // `<html>` is the default reveal container. You can pass either:
    // DOM Node, e.g. document.querySelector('.fooContainer')
    // Selector, e.g. '.fooContainer'
    container: window.document.documentElement,

    // true/false to control reveal animations on mobile.
    mobile: true,

    // true:  reveals occur every time elements become visible
    // false: reveals occur once as elements become visible
    reset: false,

    // 'always' — delay for all reveal animations
    // 'once'   — delay only the first time reveals occur
    // 'onload' - delay only for animations triggered by first load
    useDelay: 'always',

    // Change when an element is considered in the viewport. The default value
    // of 0.20 means 20% of an element must be visible for its reveal to occur.
    viewFactor: 0.2,

    // Pixel values that alter the container boundaries.
    // e.g. Set `{ top: 48 }`, if you have a 48px tall fixed toolbar.
    // --
    // Visual Aid: https://scrollrevealjs.org/assets/viewoffset.png
    viewOffset: { top: 0, right: 0, bottom: 0, left: 0 },

    // Callbacks that fire for each triggered element reveal, and reset.
    beforeReveal: function (domEl) {},
    beforeReset: function (domEl) {},

    // Callbacks that fire for each completed element reveal, and reset.
    afterReveal: function (domEl) {},
    afterReset: function (domEl) {}
  }

  /**
   * Check if client supports CSS Transform and CSS Transition.
   * @return {boolean}
   */
  ScrollReveal.prototype.isSupported = function () {
    var style = document.documentElement.style
    return 'WebkitTransition' in style && 'WebkitTransform' in style ||
      'transition' in style && 'transform' in style
  }

  /**
   * Creates a reveal set, a group of elements that will animate when they
   * become visible. If [interval] is provided, a new sequence is created
   * that will ensure elements reveal in the order they appear in the DOM.
   *
   * @param {Node|NodeList|string} [target]   The node, node list or selector to use for animation.
   * @param {Object}               [config]   Override the defaults for this reveal set.
   * @param {number}               [interval] Time between sequenced element animations (milliseconds).
   * @param {boolean}              [sync]     Used internally when updating reveals for async content.
   *
   * @return {Object} The current ScrollReveal instance.
   */
  ScrollReveal.prototype.reveal = function (target, config, interval, sync) {
    var container
    var elements
    var elem
    var elemId
    var sequence
    var sequenceId

    // No custom configuration was passed, but a sequence interval instead.
    // let’s shuffle things around to make sure everything works.
    if (config !== undefined && typeof config === 'number') {
      interval = config
      config = {}
    } else if (config === undefined || config === null) {
      config = {}
    }

    container = _resolveContainer(config)
    elements = _getRevealElements(target, container)

    if (!elements.length) {
      console.log('ScrollReveal: reveal on "' + target + '" failed, no elements found.')
      return sr
    }

    // Prepare a new sequence if an interval is passed.
    if (interval && typeof interval === 'number') {
      sequenceId = _nextUid()

      sequence = sr.sequences[sequenceId] = {
        id: sequenceId,
        interval: interval,
        elemIds: [],
        active: false
      }
    }

    // Begin main loop to configure ScrollReveal elements.
    for (var i = 0; i < elements.length; i++) {
      // Check if the element has already been configured and grab it from the store.
      elemId = elements[i].getAttribute('data-sr-id')
      if (elemId) {
        elem = sr.store.elements[elemId]
      } else {
        // Otherwise, let’s do some basic setup.
        elem = {
          id: _nextUid(),
          domEl: elements[i],
          seen: false,
          revealing: false
        }
        elem.domEl.setAttribute('data-sr-id', elem.id)
      }

      // Sequence only setup
      if (sequence) {
        elem.sequence = {
          id: sequence.id,
          index: sequence.elemIds.length
        }

        sequence.elemIds.push(elem.id)
      }

      // New or existing element, it’s time to update its configuration, styles,
      // and send the updates to our store.
      _configure(elem, config, container)
      _style(elem)
      _updateStore(elem)

      // We need to make sure elements are set to visibility: visible, even when
      // on mobile and `config.mobile === false`, or if unsupported.
      if (sr.tools.isMobile() && !elem.config.mobile || !sr.isSupported()) {
        elem.domEl.setAttribute('style', elem.styles.inline)
        elem.disabled = true
      } else if (!elem.revealing) {
        // Otherwise, proceed normally.
        elem.domEl.setAttribute('style',
          elem.styles.inline +
          elem.styles.transform.initial
        )
      }
    }

    // Each `reveal()` is recorded so that when calling `sync()` while working
    // with asynchronously loaded content, it can re-trace your steps but with
    // all your new elements now in the DOM.

    // Since `reveal()` is called internally by `sync()`, we don’t want to
    // record or intiialize each reveal during syncing.
    if (!sync && sr.isSupported()) {
      _record(target, config, interval)

      // We push initialization to the event queue using setTimeout, so that we can
      // give ScrollReveal room to process all reveal calls before putting things into motion.
      // --
      // Philip Roberts - What the heck is the event loop anyway? (JSConf EU 2014)
      // https://www.youtube.com/watch?v=8aGhZQkoFbQ
      if (sr.initTimeout) {
        window.clearTimeout(sr.initTimeout)
      }
      sr.initTimeout = window.setTimeout(_init, 0)
    }

    return sr
  }

  /**
   * Re-runs `reveal()` for each record stored in history, effectively capturing
   * any content loaded asynchronously that matches existing reveal set targets.
   * @return {Object} The current ScrollReveal instance.
   */
  ScrollReveal.prototype.sync = function () {
    if (sr.history.length && sr.isSupported()) {
      for (var i = 0; i < sr.history.length; i++) {
        var record = sr.history[i]
        sr.reveal(record.target, record.config, record.interval, true)
      }
      _init()
    } else {
      console.log('ScrollReveal: sync failed, no reveals found.')
    }
    return sr
  }

  /**
   * Private Methods
   * ---------------
   */

  function _resolveContainer (config) {
    if (config && config.container) {
      if (typeof config.container === 'string') {
        return window.document.documentElement.querySelector(config.container)
      } else if (sr.tools.isNode(config.container)) {
        return config.container
      } else {
        console.log('ScrollReveal: invalid container "' + config.container + '" provided.')
        console.log('ScrollReveal: falling back to default container.')
      }
    }
    return sr.defaults.container
  }

  /**
   * check to see if a node or node list was passed in as the target,
   * otherwise query the container using target as a selector.
   *
   * @param {Node|NodeList|string} [target]    client input for reveal target.
   * @param {Node}                 [container] parent element for selector queries.
   *
   * @return {array} elements to be revealed.
   */
  function _getRevealElements (target, container) {
    if (typeof target === 'string') {
      return Array.prototype.slice.call(container.querySelectorAll(target))
    } else if (sr.tools.isNode(target)) {
      return [target]
    } else if (sr.tools.isNodeList(target)) {
      return Array.prototype.slice.call(target)
    } else if (Array.isArray(target)) {
      return target.filter(sr.tools.isNode)
    }
    return []
  }

  /**
   * A consistent way of creating unique IDs.
   * @returns {number}
   */
  function _nextUid () {
    return ++sr.uid
  }

  function _configure (elem, config, container) {
    // If a container was passed as a part of the config object,
    // let’s overwrite it with the resolved container passed in.
    if (config.container) config.container = container
    // If the element hasn’t already been configured, let’s use a clone of the
    // defaults extended by the configuration passed as the second argument.
    if (!elem.config) {
      elem.config = sr.tools.extendClone(sr.defaults, config)
    } else {
      // Otherwise, let’s use a clone of the existing element configuration extended
      // by the configuration passed as the second argument.
      elem.config = sr.tools.extendClone(elem.config, config)
    }

    // Infer CSS Transform axis from origin string.
    if (elem.config.origin === 'top' || elem.config.origin === 'bottom') {
      elem.config.axis = 'Y'
    } else {
      elem.config.axis = 'X'
    }
  }

  function _style (elem) {
    var computed = window.getComputedStyle(elem.domEl)

    if (!elem.styles) {
      elem.styles = {
        transition: {},
        transform: {},
        computed: {}
      }

      // Capture any existing inline styles, and add our visibility override.
      // --
      // See section 4.2. in the Documentation:
      // https://github.com/jlmakes/scrollreveal.js#42-improve-user-experience
      elem.styles.inline = elem.domEl.getAttribute('style') || ''
      elem.styles.inline += '; visibility: visible; '

      // grab the elements existing opacity.
      elem.styles.computed.opacity = computed.opacity

      // grab the elements existing transitions.
      if (!computed.transition || computed.transition === 'all 0s ease 0s') {
        elem.styles.computed.transition = ''
      } else {
        elem.styles.computed.transition = computed.transition + ', '
      }
    }

    // Create transition styles
    elem.styles.transition.instant = _generateTransition(elem, 0)
    elem.styles.transition.delayed = _generateTransition(elem, elem.config.delay)

    // Generate transform styles, first with the webkit prefix.
    elem.styles.transform.initial = ' -webkit-transform:'
    elem.styles.transform.target = ' -webkit-transform:'
    _generateTransform(elem)

    // And again without any prefix.
    elem.styles.transform.initial += 'transform:'
    elem.styles.transform.target += 'transform:'
    _generateTransform(elem)
  }

  function _generateTransition (elem, delay) {
    var config = elem.config

    return '-webkit-transition: ' + elem.styles.computed.transition +
      '-webkit-transform ' + config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's, opacity ' +
      config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's; ' +

      'transition: ' + elem.styles.computed.transition +
      'transform ' + config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's, opacity ' +
      config.duration / 1000 + 's ' +
      config.easing + ' ' +
      delay / 1000 + 's; '
  }

  function _generateTransform (elem) {
    var config = elem.config
    var cssDistance
    var transform = elem.styles.transform

    // Let’s make sure our our pixel distances are negative for top and left.
    // e.g. origin = 'top' and distance = '25px' starts at `top: -25px` in CSS.
    if (config.origin === 'top' || config.origin === 'left') {
      cssDistance = /^-/.test(config.distance)
        ? config.distance.substr(1)
        : '-' + config.distance
    } else {
      cssDistance = config.distance
    }

    if (parseInt(config.distance)) {
      transform.initial += ' translate' + config.axis + '(' + cssDistance + ')'
      transform.target += ' translate' + config.axis + '(0)'
    }
    if (config.scale) {
      transform.initial += ' scale(' + config.scale + ')'
      transform.target += ' scale(1)'
    }
    if (config.rotate.x) {
      transform.initial += ' rotateX(' + config.rotate.x + 'deg)'
      transform.target += ' rotateX(0)'
    }
    if (config.rotate.y) {
      transform.initial += ' rotateY(' + config.rotate.y + 'deg)'
      transform.target += ' rotateY(0)'
    }
    if (config.rotate.z) {
      transform.initial += ' rotateZ(' + config.rotate.z + 'deg)'
      transform.target += ' rotateZ(0)'
    }
    transform.initial += '; opacity: ' + config.opacity + ';'
    transform.target += '; opacity: ' + elem.styles.computed.opacity + ';'
  }

  function _updateStore (elem) {
    var container = elem.config.container

    // If this element’s container isn’t already in the store, let’s add it.
    if (container && sr.store.containers.indexOf(container) === -1) {
      sr.store.containers.push(elem.config.container)
    }

    // Update the element stored with our new element.
    sr.store.elements[elem.id] = elem
  }

  function _record (target, config, interval) {
    // Save the `reveal()` arguments that triggered this `_record()` call, so we
    // can re-trace our steps when calling the `sync()` method.
    var record = {
      target: target,
      config: config,
      interval: interval
    }
    sr.history.push(record)
  }

  function _init () {
    if (sr.isSupported()) {
      // Initial animate call triggers valid reveal animations on first load.
      // Subsequent animate calls are made inside the event handler.
      _animate()

      // Then we loop through all container nodes in the store and bind event
      // listeners to each.
      for (var i = 0; i < sr.store.containers.length; i++) {
        sr.store.containers[i].addEventListener('scroll', _handler)
        sr.store.containers[i].addEventListener('resize', _handler)
      }

      // Let’s also do a one-time binding of window event listeners.
      if (!sr.initialized) {
        window.addEventListener('scroll', _handler)
        window.addEventListener('resize', _handler)
        sr.initialized = true
      }
    }
    return sr
  }

  function _handler () {
    _requestAnimationFrame(_animate)
  }

  function _setActiveSequences () {
    var active
    var elem
    var elemId
    var sequence

    // Loop through all sequences
    sr.tools.forOwn(sr.sequences, function (sequenceId) {
      sequence = sr.sequences[sequenceId]
      active = false

      // For each sequenced elemenet, let’s check visibility and if
      // any are visible, set it’s sequence to active.
      for (var i = 0; i < sequence.elemIds.length; i++) {
        elemId = sequence.elemIds[i]
        elem = sr.store.elements[elemId]
        if (_isElemVisible(elem) && !active) {
          active = true
        }
      }

      sequence.active = active
    })
  }

  function _animate () {
    var delayed
    var elem

    _setActiveSequences()

    // Loop through all elements in the store
    sr.tools.forOwn(sr.store.elements, function (elemId) {
      elem = sr.store.elements[elemId]
      delayed = _shouldUseDelay(elem)

      // Let’s see if we should revealand if so,
      // trigger the `beforeReveal` callback and
      // determine whether or not to use delay.
      if (_shouldReveal(elem)) {
        elem.config.beforeReveal(elem.domEl)
        if (delayed) {
          elem.domEl.setAttribute('style',
            elem.styles.inline +
            elem.styles.transform.target +
            elem.styles.transition.delayed
          )
        } else {
          elem.domEl.setAttribute('style',
            elem.styles.inline +
            elem.styles.transform.target +
            elem.styles.transition.instant
          )
        }

        // Let’s queue the `afterReveal` callback
        // and mark the element as seen and revealing.
        _queueCallback('reveal', elem, delayed)
        elem.revealing = true
        elem.seen = true

        if (elem.sequence) {
          _queueNextInSequence(elem, delayed)
        }
      } else if (_shouldReset(elem)) {
        //Otherwise reset our element and
        // trigger the `beforeReset` callback.
        elem.config.beforeReset(elem.domEl)
        elem.domEl.setAttribute('style',
          elem.styles.inline +
          elem.styles.transform.initial +
          elem.styles.transition.instant
        )
        // And queue the `afterReset` callback.
        _queueCallback('reset', elem)
        elem.revealing = false
      }
    })
  }

  function _queueNextInSequence (elem, delayed) {
    var elapsed = 0
    var delay = 0
    var sequence = sr.sequences[elem.sequence.id]

    // We’re processing a sequenced element, so let's block other elements in this sequence.
    sequence.blocked = true

    // Since we’re triggering animations a part of a sequence after animations on first load,
    // we need to check for that condition and explicitly add the delay to our timer.
    if (delayed && elem.config.useDelay === 'onload') {
      delay = elem.config.delay
    }

    // If a sequence timer is already running, capture the elapsed time and clear it.
    if (elem.sequence.timer) {
      elapsed = Math.abs(elem.sequence.timer.started - new Date())
      window.clearTimeout(elem.sequence.timer)
    }

    // Start a new timer.
    elem.sequence.timer = { started: new Date() }
    elem.sequence.timer.clock = window.setTimeout(function () {
      // Sequence interval has passed, so unblock the sequence and re-run the handler.
      sequence.blocked = false
      elem.sequence.timer = null
      _handler()
    }, Math.abs(sequence.interval) + delay - elapsed)
  }

  function _queueCallback (type, elem, delayed) {
    var elapsed = 0
    var duration = 0
    var callback = 'after'

    // Check which callback we’re working with.
    switch (type) {
      case 'reveal':
        duration = elem.config.duration
        if (delayed) {
          duration += elem.config.delay
        }
        callback += 'Reveal'
        break

      case 'reset':
        duration = elem.config.duration
        callback += 'Reset'
        break
    }

    // If a timer is already running, capture the elapsed time and clear it.
    if (elem.timer) {
      elapsed = Math.abs(elem.timer.started - new Date())
      window.clearTimeout(elem.timer.clock)
    }

    // Start a new timer.
    elem.timer = { started: new Date() }
    elem.timer.clock = window.setTimeout(function () {
      // The timer completed, so let’s fire the callback and null the timer.
      elem.config[callback](elem.domEl)
      elem.timer = null
    }, duration - elapsed)
  }

  function _shouldReveal (elem) {
    if (elem.sequence) {
      var sequence = sr.sequences[elem.sequence.id]
      return sequence.active &&
        !sequence.blocked &&
        !elem.revealing &&
        !elem.disabled
    }
    return _isElemVisible(elem) &&
      !elem.revealing &&
      !elem.disabled
  }

  function _shouldUseDelay (elem) {
    var config = elem.config.useDelay
    return config === 'always' ||
      (config === 'onload' && !sr.initialized) ||
      (config === 'once' && !elem.seen)
  }

  function _shouldReset (elem) {
    if (elem.sequence) {
      var sequence = sr.sequences[elem.sequence.id]
      return !sequence.active &&
        elem.config.reset &&
        elem.revealing &&
        !elem.disabled
    }
    return !_isElemVisible(elem) &&
      elem.config.reset &&
      elem.revealing &&
      !elem.disabled
  }

  function _getContainer (container) {
    return {
      width: container.clientWidth,
      height: container.clientHeight
    }
  }

  function _getScrolled (container) {
    // Return the container scroll values, plus the its offset.
    if (container && container !== window.document.documentElement) {
      var offset = _getOffset(container)
      return {
        x: container.scrollLeft + offset.left,
        y: container.scrollTop + offset.top
      }
    } else {
      // Otherwise, default to the window object’s scroll values.
      return {
        x: window.pageXOffset,
        y: window.pageYOffset
      }
    }
  }

  function _getOffset (domEl) {
    var offsetTop = 0
    var offsetLeft = 0

      // Grab the element’s dimensions.
    var offsetHeight = domEl.offsetHeight
    var offsetWidth = domEl.offsetWidth

    // Now calculate the distance between the element and its parent, then
    // again for the parent to its parent, and again etc... until we have the
    // total distance of the element to the document’s top and left origin.
    do {
      if (!isNaN(domEl.offsetTop)) {
        offsetTop += domEl.offsetTop
      }
      if (!isNaN(domEl.offsetLeft)) {
        offsetLeft += domEl.offsetLeft
      }
      domEl = domEl.offsetParent
    } while (domEl)

    return {
      top: offsetTop,
      left: offsetLeft,
      height: offsetHeight,
      width: offsetWidth
    }
  }

  function _isElemVisible (elem) {
    var offset = _getOffset(elem.domEl)
    var container = _getContainer(elem.config.container)
    var scrolled = _getScrolled(elem.config.container)
    var vF = elem.config.viewFactor

      // Define the element geometry.
    var elemHeight = offset.height
    var elemWidth = offset.width
    var elemTop = offset.top
    var elemLeft = offset.left
    var elemBottom = elemTop + elemHeight
    var elemRight = elemLeft + elemWidth

    return confirmBounds() || isPositionFixed()

    function confirmBounds () {
      // Define the element’s functional boundaries using its view factor.
      var top = elemTop + elemHeight * vF
      var left = elemLeft + elemWidth * vF
      var bottom = elemBottom - elemHeight * vF
      var right = elemRight - elemWidth * vF

      // Define the container functional boundaries using its view offset.
      var viewTop = scrolled.y + elem.config.viewOffset.top
      var viewLeft = scrolled.x + elem.config.viewOffset.left
      var viewBottom = scrolled.y - elem.config.viewOffset.bottom + container.height
      var viewRight = scrolled.x - elem.config.viewOffset.right + container.width

      return top < viewBottom &&
        bottom > viewTop &&
        left < viewRight &&
        right > viewLeft
    }

    function isPositionFixed () {
      return (window.getComputedStyle(elem.domEl).position === 'fixed')
    }
  }

  /**
   * Utilities
   * ---------
   */

  function Tools () {}

  Tools.prototype.isObject = function (object) {
    return object !== null && typeof object === 'object' && object.constructor === Object
  }

  Tools.prototype.isNode = function (object) {
    return typeof window.Node === 'object'
      ? object instanceof window.Node
      : object && typeof object === 'object' &&
        typeof object.nodeType === 'number' &&
        typeof object.nodeName === 'string'
  }

  Tools.prototype.isNodeList = function (object) {
    var prototypeToString = Object.prototype.toString.call(object)
    var regex = /^\[object (HTMLCollection|NodeList|Object)\]$/

    return typeof window.NodeList === 'object'
      ? object instanceof window.NodeList
      : object && typeof object === 'object' &&
        regex.test(prototypeToString) &&
        typeof object.length === 'number' &&
        (object.length === 0 || this.isNode(object[0]))
  }

  Tools.prototype.forOwn = function (object, callback) {
    if (!this.isObject(object)) {
      throw new TypeError('Expected "object", but received "' + typeof object + '".')
    } else {
      for (var property in object) {
        if (object.hasOwnProperty(property)) {
          callback(property)
        }
      }
    }
  }

  Tools.prototype.extend = function (target, source) {
    this.forOwn(source, function (property) {
      if (this.isObject(source[property])) {
        if (!target[property] || !this.isObject(target[property])) {
          target[property] = {}
        }
        this.extend(target[property], source[property])
      } else {
        target[property] = source[property]
      }
    }.bind(this))
    return target
  }

  Tools.prototype.extendClone = function (target, source) {
    return this.extend(this.extend({}, target), source)
  }

  Tools.prototype.isMobile = function () {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  /**
   * Polyfills
   * --------
   */

  _requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60)
    }

  /**
   * Module Wrapper
   * --------------
   */
  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    define(function () {
      return ScrollReveal
    })
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollReveal
  } else {
    window.ScrollReveal = ScrollReveal
  }
})();

;// Native Javascript for Pages 4.0
(function (root, factory) {
if (typeof define === 'function' && define.amd) {
    // AMD support:
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like:
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    var pg = factory();

  }
}(this, function () {

/* ============================================================
 * Pages Core : v4.0.0
 * ============================================================
 * Author - Ace
 * Copright 2018
 */
  "use strict";
  var globalObject = typeof global !== 'undefined' ? global : this||window,
  doc = document.documentElement, body = document.body,
 // function toggle attributes
  dataToggle    = 'data-toggle',
  dataInit = 'data-pages',

  // components
  stringSideBar = 'SideBar',
  stringParallax = 'Parallax',
  stringMobileView = 'MobileView',
  stringQuickView = 'Quickview',
  stringProgress = 'Progress',
  stringListView = 'ListView',
  stringCard = 'Card',
  stringNotification = 'Notification',

  // event names
  clickEvent    = 'click',
  hoverEvent    = 'hover',
  keydownEvent  = 'keydown',
  resizeEvent   = 'resize',
  scrollEvent   = 'scroll',
  // originalEvents
  showEvent     = 'show',
  shownEvent    = 'shown',
  hideEvent     = 'hide',
  hiddenEvent   = 'hidden',
  closeEvent    = 'close',
  closedEvent   = 'closed',
  slidEvent     = 'slid',
  slideEvent    = 'slide',
  changeEvent   = 'change',

  // other
  getAttribute            = 'getAttribute',
  setAttribute            = 'setAttribute',
  hasAttribute            = 'hasAttribute',
  getElementsByTagName    = 'getElementsByTagName',
  getBoundingClientRect   = 'getBoundingClientRect',
  querySelectorAll        = 'querySelectorAll',
  getElementsByCLASSNAME  = 'getElementsByClassName',

  indexOf      = 'indexOf',
  parentNode   = 'parentNode',
  length       = 'length',
  toLowerCase  = 'toLowerCase',
  Transition   = 'Transition',
  Webkit       = 'Webkit',
  style        = 'style',

  active     = 'active',
  showClass  = 'show',

  // modal
  modalOverlay = 0;
  var Pages = function(){
      this.pageScrollElement = 'html, body';
      this.$body = document.getElementsByTagName('body');
      this._innerWidth = window.innerWidth;
      /** @function setUserOS
      * @description SET User Operating System eg: mac,windows,etc
      * @returns {string} - Appends OSName to Pages.$body
      */
      this.setUserOS = function() {
          var OSName = "";
          if (navigator.appVersion.indexOf("Win") != -1) OSName = "windows";
          if (navigator.appVersion.indexOf("Mac") != -1) OSName = "mac";
          if (navigator.appVersion.indexOf("X11") != -1) OSName = "unix";
          if (navigator.appVersion.indexOf("Linux") != -1) OSName = "linux";

          addClass(this.$body,OSName);
      };

      /** @function setUserAgent
      * @description SET User Device Name to mobile | desktop
      * @returns {string} - Appends Device to Pages.$body
      */
      this.setUserAgent = function() {
          if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
              addClass(this.$body,'mobile');
          } else {
              this.addClass(this.$body,'desktop');
              if (navigator.userAgent.match(/MSIE 9.0/)) {
              addClass(this.$body,'ie9');
              }
          }
      };

      /** @function isVisibleXs
      * @description Checks if the screen size is XS - Extra Small i.e below W480px
      * @returns {$Element} - Appends $('#pg-visible-xs') to Body
      */
      this.isVisibleXs = function() {
          var $pg_el = document.getElementById('pg-visible-xs');

          if(!$pg_el){
            var $util_el = document.createElement('div');
            $util_el.className = "visible-xs";
            $util_el.setAttribute("id","pg-visible-xs");
            this.$body[0].appendChild($util_el)
            $pg_el = document.getElementById('pg-visible-xs');
          }
          return ($pg_el.offsetWidth === 0 && $pg_el.offsetHeight === 0) ? false : true;
      };

      /** @function isVisibleSm
      * @description Checks if the screen size is SM - Small Screen i.e Above W480px
      * @returns {$Element} - Appends $('#pg-visible-sm') to Body
      */
      this.isVisibleSm = function() {
          var $pg_el = document.getElementById('pg-visible-sm');

          if(!$pg_el){
            var $util_el = document.createElement('div');
            $util_el.className = "visible-sm";
            $util_el.setAttribute("id","pg-visible-sm");
            this.$body[0].appendChild($util_el)
            $pg_el = document.getElementById('pg-visible-sm');
          }
          return ($pg_el.offsetWidth === 0 && $pg_el.offsetHeight === 0) ? false : true;
      };

      /** @function isVisibleMd
      * @description Checks if the screen size is MD - Medium Screen i.e Above W1024px
      * @returns {$Element} - Appends $('#pg-visible-md') to Body
      */
      this.isVisibleMd = function() {
          var $pg_el = document.getElementById('pg-visible-md')

          if(!$pg_el){
            var $util_el = document.createElement('div');
            $util_el.className = "visible-md";
            $util_el.setAttribute("id","pg-visible-sm");
            this.$body[0].appendChild($util_el)
            $pg_el = document.getElementById('pg-visible-md');
          }
          return ($pg_el.offsetWidth === 0 && $pg_el.offsetHeight === 0) ? false : true;
      };

      /** @function isVisibleLg
      * @description Checks if the screen size is LG - Large Screen i.e Above W1200px
      * @returns {$Element} - Appends $('#pg-visible-lg') to Body
      */
      this.isVisibleLg = function() {
          var $pg_el = document.getElementById('pg-visible-lg');
          var $util_el = document.createElement('div');
          $util_el.className = "visible-lg";
          $util_el.setAttribute("id","pg-visible-lg");

          if(!$pg_el){
              this.$body[0].appendChild($util_el)
              $pg_el = document.getElementById('pg-visible-lg');
          }
          return ($pg_el.offsetWidth === 0 && $pg_el.offsetHeight === 0) ? false : true;
      };

      /** @function getUserAgent
      * @description Get Current User Agent.
      * @returns {string} - mobile | desktop
      */
      this.getUserAgent = function() {
          return this.hasClass(document.getElementsByTagName("body"),"mobile") ? "mobile" : "desktop";
      };

      /** @function setFullScreen
      * @description Make Browser fullscreen.
      */
      this.setFullScreen = function(element) {
          // Supports most browsers and their versions.
          var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullscreen;

          if (requestMethod) { // Native full screen.
              requestMethod.call(element);
          } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
              var wscript = new ActiveXObject("WScript.Shell");
              if (wscript !== null) {
                  wscript.SendKeys("{F11}");
              }
          }
      };

      /** @function getColor
      * @description Get Color from CSS
      * @param {string} color - pages color class eg: primary,master,master-light etc.
      * @param {int} opacity
      * @returns {rgba}
      */
      this.getColor = function(color, opacity) {
          opacity = parseFloat(opacity) || 1;
          var elem = "";
          var colorElem = "";
          if(document.querySelectorAll(".pg-colors").length ){
             elem = document.querySelector(".pg-colors");
          }
          else{
                elem = document.createElement('div');
                elem.className = "pg-colors";
                document.getElementsByTagName('body')[0].appendChild(elem);

          }
          if(elem.querySelectorAll('[data-color="' + color + '"]').length ){
             colorElem = document.querySelector('[data-color="' + color + '"]');
          }
          else{
                colorElem = document.createElement('div');
                colorElem.className = 'bg-' + color;
                colorElem.dataset.color = color;
                elem.appendChild(colorElem);
          }
          var style = window.getComputedStyle ? window.getComputedStyle(colorElem) : colorElem.currentStyle;
          var color = style.backgroundColor;
          var rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                    if(rgb == null){
            return;
          }
          var rgba = "rgba(" + rgb[1] + ", " + rgb[2] + ", " + rgb[3] + ', ' + opacity + ')';
          return rgba;
      };


      // Init DATA API
      this.initializeDataAPI = function( component, constructor, collection ){
        for (var i=0; i < collection[length]; i++) {
          new constructor(collection[i]);
        }
      };
      // class manipulation, since 2.0.0 requires polyfill.js
      this.hasClass = function(el, className) {
          return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
      };
      this.addClass = function(el, className) {
          if (el.classList) el.classList.add(className);
          else if (!this.hasClass(el, className)) el.className += ' ' + className;
      };
      this.removeClass = function(el, className) {
          if (el.classList) el.classList.remove(className);
          else el.className = el.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
      };
      this.toggleClass = function(el,className){
          if(this.hasClass(el,className)){
              this.removeClass(el,className)
          }else{
              this.addClass(el,className)
          }
      };
      this.wrap = function(el, wrapper) {
          el.parentNode.insertBefore(wrapper, el);
          wrapper.appendChild(el);
      };
      this.wrapAll = function(elms,wrapper) {
          var parent = elms[0].parentNode;
          var previousSibling = elms[0].previousSibling;

          for (var i = 0; elms.length - i; wrapper.firstChild === elms[0] && i++) {
              wrapper.appendChild(elms[i]);
          }
          var nextSibling = previousSibling ? previousSibling.nextSibling : parent.firstChild;
          parent.insertBefore(wrapper, nextSibling);

          return wrapper;
      };
      this.addEvent = function(el, type, handler) {
          if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
      };
      this.removeEvent = function(el, type, handler) {
          if (el.detachEvent) el.detachEvent('on'+type, handler); else el.removeEventListener(type, handler);
      };
      // selection methods
      this.getElementsByClassName = function(element,classNAME) { // returns Array
        return [].slice.call(element[getElementsByCLASSNAME]( classNAME ));
      };
      this.queryElement = function (selector, parent) {
        var lookUp = parent ? parent : document;
        return typeof selector === 'object' ? selector : lookUp.querySelector(selector);
      };
      this.getClosest = function (element, selector) { //element is the element and selector is for the closest parent element to find

        var firstChar = selector.charAt(0);
        for ( ; element && element !== document; element = element[parentNode] ) {// Get closest match
          if ( firstChar === '.' ) {// If selector is a class
            if ( queryElement(selector,element[parentNode]) !== null && hasClass(element,selector.replace('.','')) ) { return element; }
          } else if ( firstChar === '#' ) { // If selector is an ID
            if ( element.id === selector.substr(1) ) { return element; }
          }
        }
        return false;
      };
      this.extend = function(a, b) {
          for (var key in b) {
              if (b.hasOwnProperty(key)) {
                  a[key] = b[key];
              }
          }
          return a;
      };
      this.isTouchDevice = function(){
          return 'ontouchstart' in document.documentElement;
      }
      // event attach jQuery style / trigger  since 1.2.0
      this.on = function (element, event, handler) {
        element.addEventListener(event, handler, false);
      };
      this.off = function(element, event, handler) {
        element.removeEventListener(event, handler, false);
      };
      this.one = function (element, event, handler) { // one since 2.0.4
        on(element, event, function handlerWrapper(e){
          handler(e);
          off(element, event, handlerWrapper);
        });
      };
      this.live = function(selector, event, callback, context) {
        this.addEvent(context || document, event, function(e) {
            var found, el = e.target || e.srcElement;
            while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
            if (found) callback.call(el, e);
        });
      };
      this.isVisible = function(element){
        return (element.offsetWidth > 0 || element.offsetHeight > 0)
      }

  }
 var pg = new Pages();
 window.pg = pg;

}));

;/*!
 * imagesLoaded PACKAGED v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

/**
 * EvEmitter v1.1.0
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */

( function( global, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, window */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'ev-emitter/ev-emitter',factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }

}( typeof window != 'undefined' ? window : this, function() {



function EvEmitter() {}

var proto = EvEmitter.prototype;

proto.on = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // set events hash
  var events = this._events = this._events || {};
  // set listeners array
  var listeners = events[ eventName ] = events[ eventName ] || [];
  // only add once
  if ( listeners.indexOf( listener ) == -1 ) {
    listeners.push( listener );
  }

  return this;
};

proto.once = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // add event
  this.on( eventName, listener );
  // set once flag
  // set onceEvents hash
  var onceEvents = this._onceEvents = this._onceEvents || {};
  // set onceListeners object
  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // set flag
  onceListeners[ listener ] = true;

  return this;
};

proto.off = function( eventName, listener ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var index = listeners.indexOf( listener );
  if ( index != -1 ) {
    listeners.splice( index, 1 );
  }

  return this;
};

proto.emitEvent = function( eventName, args ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  // copy over to avoid interference if .off() in listener
  listeners = listeners.slice(0);
  args = args || [];
  // once stuff
  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  for ( var i=0; i < listeners.length; i++ ) {
    var listener = listeners[i]
    var isOnce = onceListeners && onceListeners[ listener ];
    if ( isOnce ) {
      // remove listener
      // remove before trigger to prevent recursion
      this.off( eventName, listener );
      // unset once flag
      delete onceListeners[ listener ];
    }
    // trigger listener
    listener.apply( this, args );
  }

  return this;
};

proto.allOff = function() {
  delete this._events;
  delete this._onceEvents;
};

return EvEmitter;

}));

/*!
 * imagesLoaded v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) { 'use strict';
  // universal module definition

  /*global define: false, module: false, require: false */

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'ev-emitter/ev-emitter'
    ], function( EvEmitter ) {
      return factory( window, EvEmitter );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('ev-emitter')
    );
  } else {
    // browser global
    window.imagesLoaded = factory(
      window,
      window.EvEmitter
    );
  }

})( typeof window !== 'undefined' ? window : this,

// --------------------------  factory -------------------------- //

function factory( window, EvEmitter ) {



var $ = window.jQuery;
var console = window.console;

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

var arraySlice = Array.prototype.slice;

// turn element or nodeList into an array
function makeArray( obj ) {
  if ( Array.isArray( obj ) ) {
    // use object if already an array
    return obj;
  }

  var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
  if ( isArrayLike ) {
    // convert nodeList to array
    return arraySlice.call( obj );
  }

  // array of single index
  return [ obj ];
}

// -------------------------- imagesLoaded -------------------------- //

/**
 * @param {Array, Element, NodeList, String} elem
 * @param {Object or Function} options - if function, use as callback
 * @param {Function} onAlways - callback function
 */
function ImagesLoaded( elem, options, onAlways ) {
  // coerce ImagesLoaded() without new, to be new ImagesLoaded()
  if ( !( this instanceof ImagesLoaded ) ) {
    return new ImagesLoaded( elem, options, onAlways );
  }
  // use elem as selector string
  var queryElem = elem;
  if ( typeof elem == 'string' ) {
    queryElem = document.querySelectorAll( elem );
  }
  // bail if bad element
  if ( !queryElem ) {
    console.error( 'Bad element for imagesLoaded ' + ( queryElem || elem ) );
    return;
  }

  this.elements = makeArray( queryElem );
  this.options = extend( {}, this.options );
  // shift arguments if no options set
  if ( typeof options == 'function' ) {
    onAlways = options;
  } else {
    extend( this.options, options );
  }

  if ( onAlways ) {
    this.on( 'always', onAlways );
  }

  this.getImages();

  if ( $ ) {
    // add jQuery Deferred object
    this.jqDeferred = new $.Deferred();
  }

  // HACK check async to allow time to bind listeners
  setTimeout( this.check.bind( this ) );
}

ImagesLoaded.prototype = Object.create( EvEmitter.prototype );

ImagesLoaded.prototype.options = {};

ImagesLoaded.prototype.getImages = function() {
  this.images = [];

  // filter & find items if we have an item selector
  this.elements.forEach( this.addElementImages, this );
};

/**
 * @param {Node} element
 */
ImagesLoaded.prototype.addElementImages = function( elem ) {
  // filter siblings
  if ( elem.nodeName == 'IMG' ) {
    this.addImage( elem );
  }
  // get background image on element
  if ( this.options.background === true ) {
    this.addElementBackgroundImages( elem );
  }

  // find children
  // no non-element nodes, #143
  var nodeType = elem.nodeType;
  if ( !nodeType || !elementNodeTypes[ nodeType ] ) {
    return;
  }
  var childImgs = elem.querySelectorAll('img');
  // concat childElems to filterFound array
  for ( var i=0; i < childImgs.length; i++ ) {
    var img = childImgs[i];
    this.addImage( img );
  }

  // get child background images
  if ( typeof this.options.background == 'string' ) {
    var children = elem.querySelectorAll( this.options.background );
    for ( i=0; i < children.length; i++ ) {
      var child = children[i];
      this.addElementBackgroundImages( child );
    }
  }
};

var elementNodeTypes = {
  1: true,
  9: true,
  11: true
};

ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
  var style = getComputedStyle( elem );
  if ( !style ) {
    // Firefox returns null if in a hidden iframe https://bugzil.la/548397
    return;
  }
  // get url inside url("...")
  var reURL = /url\((['"])?(.*?)\1\)/gi;
  var matches = reURL.exec( style.backgroundImage );
  while ( matches !== null ) {
    var url = matches && matches[2];
    if ( url ) {
      this.addBackground( url, elem );
    }
    matches = reURL.exec( style.backgroundImage );
  }
};

/**
 * @param {Image} img
 */
ImagesLoaded.prototype.addImage = function( img ) {
  var loadingImage = new LoadingImage( img );
  this.images.push( loadingImage );
};

ImagesLoaded.prototype.addBackground = function( url, elem ) {
  var background = new Background( url, elem );
  this.images.push( background );
};

ImagesLoaded.prototype.check = function() {
  var _this = this;
  this.progressedCount = 0;
  this.hasAnyBroken = false;
  // complete if no images
  if ( !this.images.length ) {
    this.complete();
    return;
  }

  function onProgress( image, elem, message ) {
    // HACK - Chrome triggers event before object properties have changed. #83
    setTimeout( function() {
      _this.progress( image, elem, message );
    });
  }

  this.images.forEach( function( loadingImage ) {
    loadingImage.once( 'progress', onProgress );
    loadingImage.check();
  });
};

ImagesLoaded.prototype.progress = function( image, elem, message ) {
  this.progressedCount++;
  this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
  // progress event
  this.emitEvent( 'progress', [ this, image, elem ] );
  if ( this.jqDeferred && this.jqDeferred.notify ) {
    this.jqDeferred.notify( this, image );
  }
  // check if completed
  if ( this.progressedCount == this.images.length ) {
    this.complete();
  }

  if ( this.options.debug && console ) {
    console.log( 'progress: ' + message, image, elem );
  }
};

ImagesLoaded.prototype.complete = function() {
  var eventName = this.hasAnyBroken ? 'fail' : 'done';
  this.isComplete = true;
  this.emitEvent( eventName, [ this ] );
  this.emitEvent( 'always', [ this ] );
  if ( this.jqDeferred ) {
    var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
    this.jqDeferred[ jqMethod ]( this );
  }
};

// --------------------------  -------------------------- //

function LoadingImage( img ) {
  this.img = img;
}

LoadingImage.prototype = Object.create( EvEmitter.prototype );

LoadingImage.prototype.check = function() {
  // If complete is true and browser supports natural sizes,
  // try to check for image status manually.
  var isComplete = this.getIsImageComplete();
  if ( isComplete ) {
    // report based on naturalWidth
    this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
    return;
  }

  // If none of the checks above matched, simulate loading on detached element.
  this.proxyImage = new Image();
  this.proxyImage.addEventListener( 'load', this );
  this.proxyImage.addEventListener( 'error', this );
  // bind to image as well for Firefox. #191
  this.img.addEventListener( 'load', this );
  this.img.addEventListener( 'error', this );
  this.proxyImage.src = this.img.src;
};

LoadingImage.prototype.getIsImageComplete = function() {
  // check for non-zero, non-undefined naturalWidth
  // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
  return this.img.complete && this.img.naturalWidth;
};

LoadingImage.prototype.confirm = function( isLoaded, message ) {
  this.isLoaded = isLoaded;
  this.emitEvent( 'progress', [ this, this.img, message ] );
};

// ----- events ----- //

// trigger specified handler for event type
LoadingImage.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

LoadingImage.prototype.onload = function() {
  this.confirm( true, 'onload' );
  this.unbindEvents();
};

LoadingImage.prototype.onerror = function() {
  this.confirm( false, 'onerror' );
  this.unbindEvents();
};

LoadingImage.prototype.unbindEvents = function() {
  this.proxyImage.removeEventListener( 'load', this );
  this.proxyImage.removeEventListener( 'error', this );
  this.img.removeEventListener( 'load', this );
  this.img.removeEventListener( 'error', this );
};

// -------------------------- Background -------------------------- //

function Background( url, element ) {
  this.url = url;
  this.element = element;
  this.img = new Image();
}

// inherit LoadingImage prototype
Background.prototype = Object.create( LoadingImage.prototype );

Background.prototype.check = function() {
  this.img.addEventListener( 'load', this );
  this.img.addEventListener( 'error', this );
  this.img.src = this.url;
  // check if image is already complete
  var isComplete = this.getIsImageComplete();
  if ( isComplete ) {
    this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
    this.unbindEvents();
  }
};

Background.prototype.unbindEvents = function() {
  this.img.removeEventListener( 'load', this );
  this.img.removeEventListener( 'error', this );
};

Background.prototype.confirm = function( isLoaded, message ) {
  this.isLoaded = isLoaded;
  this.emitEvent( 'progress', [ this, this.element, message ] );
};

// -------------------------- jQuery -------------------------- //

ImagesLoaded.makeJQueryPlugin = function( jQuery ) {
  jQuery = jQuery || window.jQuery;
  if ( !jQuery ) {
    return;
  }
  // set local variable
  $ = jQuery;
  // $().imagesLoaded()
  $.fn.imagesLoaded = function( options, callback ) {
    var instance = new ImagesLoaded( this, options, callback );
    return instance.jqDeferred.promise( $(this) );
  };
};
// try making plugin
ImagesLoaded.makeJQueryPlugin();

// --------------------------  -------------------------- //

return ImagesLoaded;

});


;/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-csstransforms3d-csstransitions-touch-shiv-cssclasses-prefixed-teststyles-testprop-testallprops-prefixes-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function z(a){j.cssText=a}function A(a,b){return z(m.join(a+";")+(b||""))}function B(a,b){return typeof a===b}function C(a,b){return!!~(""+a).indexOf(b)}function D(a,b){for(var d in a){var e=a[d];if(!C(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function E(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:B(f,"function")?f.bind(d||b):f}return!1}function F(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+o.join(d+" ")+d).split(" ");return B(b,"string")||B(b,"undefined")?D(e,b):(e=(a+" "+p.join(d+" ")+d).split(" "),E(e,b,c))}var d="2.8.3",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n="Webkit Moz O ms",o=n.split(" "),p=n.toLowerCase().split(" "),q={},r={},s={},t=[],u=t.slice,v,w=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},x={}.hasOwnProperty,y;!B(x,"undefined")&&!B(x.call,"undefined")?y=function(a,b){return x.call(a,b)}:y=function(a,b){return b in a&&B(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=u.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(u.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(u.call(arguments)))};return e}),q.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:w(["@media (",m.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c},q.csstransforms3d=function(){var a=!!F("perspective");return a&&"webkitPerspective"in g.style&&w("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},q.csstransitions=function(){return F("transition")};for(var G in q)y(q,G)&&(v=G.toLowerCase(),e[v]=q[G](),t.push((e[v]?"":"no-")+v));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)y(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},z(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._prefixes=m,e._domPrefixes=p,e._cssomPrefixes=o,e.testProp=function(a){return D([a])},e.testAllProps=F,e.testStyles=w,e.prefixed=function(a,b,c){return b?F(a,b,c):F(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+t.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};
;/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );

;/**
 * stepsForm.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {
	
	'use strict';

	var transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		support = { transitions : Modernizr.csstransitions };

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function stepsForm( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
  		extend( this.options, options );
  		this._init();
	}

	stepsForm.prototype.options = {
		onSubmit : function() { return false; }
	};

	stepsForm.prototype._init = function() {
		// current question
		this.current = 0;

		// questions
		this.questions = [].slice.call( this.el.querySelectorAll( 'ol.questions > li' ) );
		// total questions
		this.questionsCount = this.questions.length;
		// show first question
		classie.addClass( this.questions[0], 'current' );
		
		// next question control
		this.ctrlNext = this.el.querySelector( 'button.next' );

		// progress bar
		this.progress = this.el.querySelector( 'div.progress' );
		
		// question number status
		this.questionStatus = this.el.querySelector( 'span.number' );
		// current question placeholder
		this.currentNum = this.questionStatus.querySelector( 'span.number-current' );
		this.currentNum.innerHTML = Number( this.current + 1 );
		// total questions placeholder
		this.totalQuestionNum = this.questionStatus.querySelector( 'span.number-total' );
		this.totalQuestionNum.innerHTML = this.questionsCount;

		// error message
		this.error = this.el.querySelector( 'span.error-message' );
		
		// init events
		this._initEvents();
	};

	stepsForm.prototype._initEvents = function() {
		var self = this,
			// first input
			firstElInput = this.questions[ this.current ].querySelector( 'input' ),
			// focus
			onFocusStartFn = function() {
				firstElInput.removeEventListener( 'focus', onFocusStartFn );
				classie.addClass( self.ctrlNext, 'show' );
			};

		// show the next question control first time the input gets focused
		firstElInput.addEventListener( 'focus', onFocusStartFn );

		// show next question
		this.ctrlNext.addEventListener( 'click', function( ev ) { 
			ev.preventDefault();
			self._nextQuestion(); 
		} );

		// pressing enter will jump to next question
		this.el.addEventListener( 'keydown', function( ev ) {
			var keyCode = ev.keyCode || ev.which;
			// enter
			if( keyCode === 13 ) {
				ev.preventDefault();
				self._nextQuestion();
			}
		} );

		// disable tab
		this.el.addEventListener( 'keydown', function( ev ) {
			var keyCode = ev.keyCode || ev.which;
			// tab
			if( keyCode === 9 ) {
				ev.preventDefault();
			} 
		} );
	};

	stepsForm.prototype._nextQuestion = function() {
		if( !this._validade() ) {
			return false;
		}

		// check if form is filled
		if( this.current === this.questionsCount - 1 ) {
			this.isFilled = true;
		}

		// clear any previous error messages
		this._clearError();

		// current question
		var currentQuestion = this.questions[ this.current ];

		// increment current question iterator
		++this.current;

		// update progress bar
		this._progress();

		if( !this.isFilled ) {
			// change the current question number/status
			this._updateQuestionNumber();

			// add class "show-next" to form element (start animations)
			classie.addClass( this.el, 'show-next' );

			// remove class "current" from current question and add it to the next one
			// current question
			var nextQuestion = this.questions[ this.current ];
			classie.removeClass( currentQuestion, 'current' );
			classie.addClass( nextQuestion, 'current' );
		}

		// after animation ends, remove class "show-next" from form element and change current question placeholder
		var self = this,
			onEndTransitionFn = function( ev ) {
				if( support.transitions ) {
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}
				if( self.isFilled ) {
					self._submit();
				}
				else {
					classie.removeClass( self.el, 'show-next' );
					self.currentNum.innerHTML = self.nextQuestionNum.innerHTML;
					self.questionStatus.removeChild( self.nextQuestionNum );
					// force the focus on the next input
					nextQuestion.querySelector( 'input' ).focus();
				}
			};

		if( support.transitions ) {
			this.progress.addEventListener( transEndEventName, onEndTransitionFn );
		}
		else {
			onEndTransitionFn();
		}
	}

	// updates the progress bar by setting its width
	stepsForm.prototype._progress = function() {
		this.progress.style.width = this.current * ( 100 / this.questionsCount ) + '%';
	}

	// changes the current question number
	stepsForm.prototype._updateQuestionNumber = function() {
		// first, create next question number placeholder
		this.nextQuestionNum = document.createElement( 'span' );
		this.nextQuestionNum.className = 'number-next';
		this.nextQuestionNum.innerHTML = Number( this.current + 1 );
		// insert it in the DOM
		this.questionStatus.appendChild( this.nextQuestionNum );
	}

	// submits the form
	stepsForm.prototype._submit = function() {
		this.options.onSubmit( this.el );
	}

	// TODO (next version..)
	// the validation function
	stepsForm.prototype._validade = function() {
		// current question´s input
		var input = this.questions[ this.current ].querySelector( 'input' ).value;
		if( input === '' ) {
			this._showError( 'EMPTYSTR' );
			return false;
		}

		return true;
	}

	// TODO (next version..)
	stepsForm.prototype._showError = function( err ) {
		var message = '';
		switch( err ) {
			case 'EMPTYSTR' : 
				message = 'Please fill the field before continuing';
				break;
			case 'INVALIDEMAIL' : 
				message = 'Please fill a valid email address';
				break;
			// ...
		};
		this.error.innerHTML = message;
		classie.addClass( this.error, 'show' );
	}

	// clears/hides the current error message
	stepsForm.prototype._clearError = function() {
		classie.removeClass( this.error, 'show' );
	}

	// add to global namespace
	window.stepsForm = stepsForm;

})( window );
;// https://github.com/darkskyapp/skycons

(function(global) {
    "use strict";
  
    /* Set up a RequestAnimationFrame shim so we can animate efficiently FOR
     * GREAT JUSTICE. */
    var requestInterval, cancelInterval;
  
    (function() {
      var raf = global.requestAnimationFrame       ||
                global.webkitRequestAnimationFrame ||
                global.mozRequestAnimationFrame    ||
                global.oRequestAnimationFrame      ||
                global.msRequestAnimationFrame     ,
          caf = global.cancelAnimationFrame        ||
                global.webkitCancelAnimationFrame  ||
                global.mozCancelAnimationFrame     ||
                global.oCancelAnimationFrame       ||
                global.msCancelAnimationFrame      ;
  
      if(raf && caf) {
        requestInterval = function(fn) {
          var handle = {value: null};
  
          function loop() {
            handle.value = raf(loop);
            fn();
          }
  
          loop();
          return handle;
        };
  
        cancelInterval = function(handle) {
          caf(handle.value);
        };
      }
  
      else {
        requestInterval = setInterval;
        cancelInterval = clearInterval;
      }
    }());
  
    /* Catmull-rom spline stuffs. */
    /*
    function upsample(n, spline) {
      var polyline = [],
          len = spline.length,
          bx  = spline[0],
          by  = spline[1],
          cx  = spline[2],
          cy  = spline[3],
          dx  = spline[4],
          dy  = spline[5],
          i, j, ax, ay, px, qx, rx, sx, py, qy, ry, sy, t;
  
      for(i = 6; i !== spline.length; i += 2) {
        ax = bx;
        bx = cx;
        cx = dx;
        dx = spline[i    ];
        px = -0.5 * ax + 1.5 * bx - 1.5 * cx + 0.5 * dx;
        qx =        ax - 2.5 * bx + 2.0 * cx - 0.5 * dx;
        rx = -0.5 * ax            + 0.5 * cx           ;
        sx =                   bx                      ;
  
        ay = by;
        by = cy;
        cy = dy;
        dy = spline[i + 1];
        py = -0.5 * ay + 1.5 * by - 1.5 * cy + 0.5 * dy;
        qy =        ay - 2.5 * by + 2.0 * cy - 0.5 * dy;
        ry = -0.5 * ay            + 0.5 * cy           ;
        sy =                   by                      ;
  
        for(j = 0; j !== n; ++j) {
          t = j / n;
  
          polyline.push(
            ((px * t + qx) * t + rx) * t + sx,
            ((py * t + qy) * t + ry) * t + sy
          );
        }
      }
  
      polyline.push(
        px + qx + rx + sx,
        py + qy + ry + sy
      );
  
      return polyline;
    }
  
    function downsample(n, polyline) {
      var len = 0,
          i, dx, dy;
  
      for(i = 2; i !== polyline.length; i += 2) {
        dx = polyline[i    ] - polyline[i - 2];
        dy = polyline[i + 1] - polyline[i - 1];
        len += Math.sqrt(dx * dx + dy * dy);
      }
  
      len /= n;
  
      var small = [],
          target = len,
          min = 0,
          max, t;
  
      small.push(polyline[0], polyline[1]);
  
      for(i = 2; i !== polyline.length; i += 2) {
        dx = polyline[i    ] - polyline[i - 2];
        dy = polyline[i + 1] - polyline[i - 1];
        max = min + Math.sqrt(dx * dx + dy * dy);
  
        if(max > target) {
          t = (target - min) / (max - min);
  
          small.push(
            polyline[i - 2] + dx * t,
            polyline[i - 1] + dy * t
          );
  
          target += len;
        }
  
        min = max;
      }
  
      small.push(polyline[polyline.length - 2], polyline[polyline.length - 1]);
  
      return small;
    }
    */
  
    /* Define skycon things. */
    /* FIXME: I'm *really really* sorry that this code is so gross. Really, I am.
     * I'll try to clean it up eventually! Promise! */
    var KEYFRAME = 500,
        STROKE = 0.08,
        TAU = 2.0 * Math.PI,
        TWO_OVER_SQRT_2 = 2.0 / Math.sqrt(2);
  
    function circle(ctx, x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU, false);
      ctx.fill();
    }
  
    function line(ctx, ax, ay, bx, by) {
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
  
    function puff(ctx, t, cx, cy, rx, ry, rmin, rmax) {
      var c = Math.cos(t * TAU),
          s = Math.sin(t * TAU);
  
      rmax -= rmin;
  
      circle(
        ctx,
        cx - s * rx,
        cy + c * ry + rmax * 0.5,
        rmin + (1 - c * 0.5) * rmax
      );
    }
  
    function puffs(ctx, t, cx, cy, rx, ry, rmin, rmax) {
      var i;
  
      for(i = 5; i--; )
        puff(ctx, t + i / 5, cx, cy, rx, ry, rmin, rmax);
    }
  
    function cloud(ctx, t, cx, cy, cw, s, color) {
      t /= 30000;
  
      var a = cw * 0.21,
          b = cw * 0.12,
          c = cw * 0.24,
          d = cw * 0.28;
  
      ctx.fillStyle = color;
      puffs(ctx, t, cx, cy, a, b, c, d);
  
      ctx.globalCompositeOperation = 'destination-out';
      puffs(ctx, t, cx, cy, a, b, c - s, d - s);
      ctx.globalCompositeOperation = 'source-over';
    }
  
    function sun(ctx, t, cx, cy, cw, s, color) {
      t /= 120000;
  
      var a = cw * 0.25 - s * 0.5,
          b = cw * 0.32 + s * 0.5,
          c = cw * 0.50 - s * 0.5,
          i, p, cos, sin;
  
      ctx.strokeStyle = color;
      ctx.lineWidth = s;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
  
      ctx.beginPath();
      ctx.arc(cx, cy, a, 0, TAU, false);
      ctx.stroke();
  
      for(i = 8; i--; ) {
        p = (t + i / 8) * TAU;
        cos = Math.cos(p);
        sin = Math.sin(p);
        line(ctx, cx + cos * b, cy + sin * b, cx + cos * c, cy + sin * c);
      }
    }
  
    function moon(ctx, t, cx, cy, cw, s, color) {
      t /= 15000;
  
      var a = cw * 0.29 - s * 0.5,
          b = cw * 0.05,
          c = Math.cos(t * TAU),
          p = c * TAU / -16;
  
      ctx.strokeStyle = color;
      ctx.lineWidth = s;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
  
      cx += c * b;
  
      ctx.beginPath();
      ctx.arc(cx, cy, a, p + TAU / 8, p + TAU * 7 / 8, false);
      ctx.arc(cx + Math.cos(p) * a * TWO_OVER_SQRT_2, cy + Math.sin(p) * a * TWO_OVER_SQRT_2, a, p + TAU * 5 / 8, p + TAU * 3 / 8, true);
      ctx.closePath();
      ctx.stroke();
    }
  
    function rain(ctx, t, cx, cy, cw, s, color) {
      t /= 1350;
  
      var a = cw * 0.16,
          b = TAU * 11 / 12,
          c = TAU *  7 / 12,
          i, p, x, y;
  
      ctx.fillStyle = color;
  
      for(i = 4; i--; ) {
        p = (t + i / 4) % 1;
        x = cx + ((i - 1.5) / 1.5) * (i === 1 || i === 2 ? -1 : 1) * a;
        y = cy + p * p * cw;
        ctx.beginPath();
        ctx.moveTo(x, y - s * 1.5);
        ctx.arc(x, y, s * 0.75, b, c, false);
        ctx.fill();
      }
    }
  
    function sleet(ctx, t, cx, cy, cw, s, color) {
      t /= 750;
  
      var a = cw * 0.1875,
          i, p, x, y;
  
      ctx.strokeStyle = color;
      ctx.lineWidth = s * 0.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
  
      for(i = 4; i--; ) {
        p = (t + i / 4) % 1;
        x = Math.floor(cx + ((i - 1.5) / 1.5) * (i === 1 || i === 2 ? -1 : 1) * a) + 0.5;
        y = cy + p * cw;
        line(ctx, x, y - s * 1.5, x, y + s * 1.5);
      }
    }
  
    function snow(ctx, t, cx, cy, cw, s, color) {
      t /= 3000;
  
      var a  = cw * 0.16,
          b  = s * 0.75,
          u  = t * TAU * 0.7,
          ux = Math.cos(u) * b,
          uy = Math.sin(u) * b,
          v  = u + TAU / 3,
          vx = Math.cos(v) * b,
          vy = Math.sin(v) * b,
          w  = u + TAU * 2 / 3,
          wx = Math.cos(w) * b,
          wy = Math.sin(w) * b,
          i, p, x, y;
  
      ctx.strokeStyle = color;
      ctx.lineWidth = s * 0.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
  
      for(i = 4; i--; ) {
        p = (t + i / 4) % 1;
        x = cx + Math.sin((p + i / 4) * TAU) * a;
        y = cy + p * cw;
  
        line(ctx, x - ux, y - uy, x + ux, y + uy);
        line(ctx, x - vx, y - vy, x + vx, y + vy);
        line(ctx, x - wx, y - wy, x + wx, y + wy);
      }
    }
  
    function fogbank(ctx, t, cx, cy, cw, s, color) {
      t /= 30000;
  
      var a = cw * 0.21,
          b = cw * 0.06,
          c = cw * 0.21,
          d = cw * 0.28;
  
      ctx.fillStyle = color;
      puffs(ctx, t, cx, cy, a, b, c, d);
  
      ctx.globalCompositeOperation = 'destination-out';
      puffs(ctx, t, cx, cy, a, b, c - s, d - s);
      ctx.globalCompositeOperation = 'source-over';
    }
  
    /*
    var WIND_PATHS = [
          downsample(63, upsample(8, [
            -1.00, -0.28,
            -0.75, -0.18,
            -0.50,  0.12,
            -0.20,  0.12,
            -0.04, -0.04,
            -0.07, -0.18,
            -0.19, -0.18,
            -0.23, -0.05,
            -0.12,  0.11,
             0.02,  0.16,
             0.20,  0.15,
             0.50,  0.07,
             0.75,  0.18,
             1.00,  0.28
          ])),
          downsample(31, upsample(16, [
            -1.00, -0.10,
            -0.75,  0.00,
            -0.50,  0.10,
            -0.25,  0.14,
             0.00,  0.10,
             0.25,  0.00,
             0.50, -0.10,
             0.75, -0.14,
             1.00, -0.10
          ]))
        ];
    */
  
    var WIND_PATHS = [
          [
            -0.7500, -0.1800, -0.7219, -0.1527, -0.6971, -0.1225,
            -0.6739, -0.0910, -0.6516, -0.0588, -0.6298, -0.0262,
            -0.6083,  0.0065, -0.5868,  0.0396, -0.5643,  0.0731,
            -0.5372,  0.1041, -0.5033,  0.1259, -0.4662,  0.1406,
            -0.4275,  0.1493, -0.3881,  0.1530, -0.3487,  0.1526,
            -0.3095,  0.1488, -0.2708,  0.1421, -0.2319,  0.1342,
            -0.1943,  0.1217, -0.1600,  0.1025, -0.1290,  0.0785,
            -0.1012,  0.0509, -0.0764,  0.0206, -0.0547, -0.0120,
            -0.0378, -0.0472, -0.0324, -0.0857, -0.0389, -0.1241,
            -0.0546, -0.1599, -0.0814, -0.1876, -0.1193, -0.1964,
            -0.1582, -0.1935, -0.1931, -0.1769, -0.2157, -0.1453,
            -0.2290, -0.1085, -0.2327, -0.0697, -0.2240, -0.0317,
            -0.2064,  0.0033, -0.1853,  0.0362, -0.1613,  0.0672,
            -0.1350,  0.0961, -0.1051,  0.1213, -0.0706,  0.1397,
            -0.0332,  0.1512,  0.0053,  0.1580,  0.0442,  0.1624,
             0.0833,  0.1636,  0.1224,  0.1615,  0.1613,  0.1565,
             0.1999,  0.1500,  0.2378,  0.1402,  0.2749,  0.1279,
             0.3118,  0.1147,  0.3487,  0.1015,  0.3858,  0.0892,
             0.4236,  0.0787,  0.4621,  0.0715,  0.5012,  0.0702,
             0.5398,  0.0766,  0.5768,  0.0890,  0.6123,  0.1055,
             0.6466,  0.1244,  0.6805,  0.1440,  0.7147,  0.1630,
             0.7500,  0.1800
          ],
          [
            -0.7500,  0.0000, -0.7033,  0.0195, -0.6569,  0.0399,
            -0.6104,  0.0600, -0.5634,  0.0789, -0.5155,  0.0954,
            -0.4667,  0.1089, -0.4174,  0.1206, -0.3676,  0.1299,
            -0.3174,  0.1365, -0.2669,  0.1398, -0.2162,  0.1391,
            -0.1658,  0.1347, -0.1157,  0.1271, -0.0661,  0.1169,
            -0.0170,  0.1046,  0.0316,  0.0903,  0.0791,  0.0728,
             0.1259,  0.0534,  0.1723,  0.0331,  0.2188,  0.0129,
             0.2656, -0.0064,  0.3122, -0.0263,  0.3586, -0.0466,
             0.4052, -0.0665,  0.4525, -0.0847,  0.5007, -0.1002,
             0.5497, -0.1130,  0.5991, -0.1240,  0.6491, -0.1325,
             0.6994, -0.1380,  0.7500, -0.1400
          ]
        ],
        WIND_OFFSETS = [
          {start: 0.36, end: 0.11},
          {start: 0.56, end: 0.16}
        ];
  
    function leaf(ctx, t, x, y, cw, s, color) {
      var a = cw / 8,
          b = a / 3,
          c = 2 * b,
          d = (t % 1) * TAU,
          e = Math.cos(d),
          f = Math.sin(d);
  
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = s;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
  
      ctx.beginPath();
      ctx.arc(x        , y        , a, d          , d + Math.PI, false);
      ctx.arc(x - b * e, y - b * f, c, d + Math.PI, d          , false);
      ctx.arc(x + c * e, y + c * f, b, d + Math.PI, d          , true );
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.stroke();
    }
  
    function swoosh(ctx, t, cx, cy, cw, s, index, total, color) {
      t /= 2500;
  
      var path = WIND_PATHS[index],
          a = (t + index - WIND_OFFSETS[index].start) % total,
          c = (t + index - WIND_OFFSETS[index].end  ) % total,
          e = (t + index                            ) % total,
          b, d, f, i;
  
      ctx.strokeStyle = color;
      ctx.lineWidth = s;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
  
      if(a < 1) {
        ctx.beginPath();
  
        a *= path.length / 2 - 1;
        b  = Math.floor(a);
        a -= b;
        b *= 2;
        b += 2;
  
        ctx.moveTo(
          cx + (path[b - 2] * (1 - a) + path[b    ] * a) * cw,
          cy + (path[b - 1] * (1 - a) + path[b + 1] * a) * cw
        );
  
        if(c < 1) {
          c *= path.length / 2 - 1;
          d  = Math.floor(c);
          c -= d;
          d *= 2;
          d += 2;
  
          for(i = b; i !== d; i += 2)
            ctx.lineTo(cx + path[i] * cw, cy + path[i + 1] * cw);
  
          ctx.lineTo(
            cx + (path[d - 2] * (1 - c) + path[d    ] * c) * cw,
            cy + (path[d - 1] * (1 - c) + path[d + 1] * c) * cw
          );
        }
  
        else
          for(i = b; i !== path.length; i += 2)
            ctx.lineTo(cx + path[i] * cw, cy + path[i + 1] * cw);
  
        ctx.stroke();
      }
  
      else if(c < 1) {
        ctx.beginPath();
  
        c *= path.length / 2 - 1;
        d  = Math.floor(c);
        c -= d;
        d *= 2;
        d += 2;
  
        ctx.moveTo(cx + path[0] * cw, cy + path[1] * cw);
  
        for(i = 2; i !== d; i += 2)
          ctx.lineTo(cx + path[i] * cw, cy + path[i + 1] * cw);
  
        ctx.lineTo(
          cx + (path[d - 2] * (1 - c) + path[d    ] * c) * cw,
          cy + (path[d - 1] * (1 - c) + path[d + 1] * c) * cw
        );
  
        ctx.stroke();
      }
  
      if(e < 1) {
        e *= path.length / 2 - 1;
        f  = Math.floor(e);
        e -= f;
        f *= 2;
        f += 2;
  
        leaf(
          ctx,
          t,
          cx + (path[f - 2] * (1 - e) + path[f    ] * e) * cw,
          cy + (path[f - 1] * (1 - e) + path[f + 1] * e) * cw,
          cw,
          s,
          color
        );
      }
    }
  
    var Skycons = function(opts) {
          this.list        = [];
          this.interval    = null;
          this.color       = opts && opts.color ? opts.color : "black";
          this.resizeClear = !!(opts && opts.resizeClear);
        };
  
    Skycons.CLEAR_DAY = function(ctx, t, color) {
      var w = ctx.canvas.width,
          h = ctx.canvas.height,
          s = Math.min(w, h);
  
      sun(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, color);
    };
  
    Skycons.CLEAR_NIGHT = function(ctx, t, color) {
      var w = ctx.canvas.width,
          h = ctx.canvas.height,
          s = Math.min(w, h);
  
      moon(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, color);
    };
  
    Skycons.PARTLY_CLOUDY_DAY = function(ctx, t, color) {
      var w = ctx.canvas.width,
          h = ctx.canvas.height,
          s = Math.min(w, h);
  
      sun(ctx, t, w * 0.625, h * 0.375, s * 0.75, s * STROKE, color);
      cloud(ctx, t, w * 0.375, h * 0.625, s * 0.75, s * STROKE, color);
    };
  
    Skycons.PARTLY_CLOUDY_NIGHT = function(ctx, t, color) {
      var w = ctx.canvas.width,
          h = ctx.canvas.height,
          s = Math.min(w, h);
  
      moon(ctx, t, w * 0.667, h * 0.375, s * 0.75, s * STROKE, color);
      cloud(ctx, t, w * 0.375, h * 0.625, s * 0.75, s * STROKE, color);
    };
  
    Skycons.CLOUDY = function(ctx, t, color) {
      var w = ctx.canvas.width,
          h = ctx.canvas.height,
          s = Math.min(w, h);
  
      cloud(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, color);
    };
  
    Skycons.RAIN = function(ctx, t, color) {
      var w = ctx.canvas.width,
          h = ctx.canvas.height,
          s = Math.min(w, h);
  
      rain(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
      cloud(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
    };
  
    Skycons.SLEET = function(ctx, t, color) {
      var w = ctx.canvas.width,
          h = ctx.canvas.height,
          s = Math.min(w, h);
  
      sleet(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
      cloud(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
    };
  
    Skycons.SNOW = function(ctx, t, color) {
      var w = ctx.canvas.width,
          h = ctx.canvas.height,
          s = Math.min(w, h);
  
      snow(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
      cloud(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
    };
  
    Skycons.WIND = function(ctx, t, color) {
      var w = ctx.canvas.width,
          h = ctx.canvas.height,
          s = Math.min(w, h);
  
      swoosh(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, 0, 2, color);
      swoosh(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, 1, 2, color);
    };
  
    Skycons.FOG = function(ctx, t, color) {
      var w = ctx.canvas.width,
          h = ctx.canvas.height,
          s = Math.min(w, h),
          k = s * STROKE;
  
      fogbank(ctx, t, w * 0.5, h * 0.32, s * 0.75, k, color);
  
      t /= 5000;
  
      var a = Math.cos((t       ) * TAU) * s * 0.02,
          b = Math.cos((t + 0.25) * TAU) * s * 0.02,
          c = Math.cos((t + 0.50) * TAU) * s * 0.02,
          d = Math.cos((t + 0.75) * TAU) * s * 0.02,
          n = h * 0.936,
          e = Math.floor(n - k * 0.5) + 0.5,
          f = Math.floor(n - k * 2.5) + 0.5;
  
      ctx.strokeStyle = color;
      ctx.lineWidth = k;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
  
      line(ctx, a + w * 0.2 + k * 0.5, e, b + w * 0.8 - k * 0.5, e);
      line(ctx, c + w * 0.2 + k * 0.5, f, d + w * 0.8 - k * 0.5, f);
    };
  
    Skycons.prototype = {
      _determineDrawingFunction: function(draw) {
        if(typeof draw === "string")
          draw = Skycons[draw.toUpperCase().replace(/-/g, "_")] || null;
  
        return draw;
      },
      add: function(el, draw) {
        var obj;
  
        if(typeof el === "string")
          el = document.getElementById(el);
  
        // Does nothing if canvas name doesn't exists
        if(el === null)
          return;
  
        draw = this._determineDrawingFunction(draw);
  
        // Does nothing if the draw function isn't actually a function
        if(typeof draw !== "function")
          return;
  
        obj = {
          element: el,
          context: el.getContext("2d"),
          drawing: draw
        };
  
        this.list.push(obj);
        this.draw(obj, KEYFRAME);
      },
      set: function(el, draw) {
        var i;
  
        if(typeof el === "string")
          el = document.getElementById(el);
  
        for(i = this.list.length; i--; )
          if(this.list[i].element === el) {
            this.list[i].drawing = this._determineDrawingFunction(draw);
            this.draw(this.list[i], KEYFRAME);
            return;
          }
  
        this.add(el, draw);
      },
      remove: function(el) {
        var i;
  
        if(typeof el === "string")
          el = document.getElementById(el);
  
        for(i = this.list.length; i--; )
          if(this.list[i].element === el) {
            this.list.splice(i, 1);
            return;
          }
      },
      draw: function(obj, time) {
        var canvas = obj.context.canvas;
  
        if(this.resizeClear)
          canvas.width = canvas.width;
  
        else
          obj.context.clearRect(0, 0, canvas.width, canvas.height);
  
        obj.drawing(obj.context, time, this.color);
      },
      play: function() {
        var self = this;
  
        this.pause();
        this.interval = requestInterval(function() {
          var now = Date.now(),
              i;
  
          for(i = self.list.length; i--; )
            self.draw(self.list[i], now);
        }, 1000 / 60);
      },
      pause: function() {
        if(this.interval) {
          cancelInterval(this.interval);
          this.interval = null;
        }
      }
    };
  
    global.Skycons = Skycons;
  }(this));
;
//# sourceMappingURL=scripts.bundle.js.map