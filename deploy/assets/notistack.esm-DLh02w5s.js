import { r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
function r(e2) {
  var t2, f, n2 = "";
  if ("string" == typeof e2 || "number" == typeof e2) n2 += e2;
  else if ("object" == typeof e2) if (Array.isArray(e2)) for (t2 = 0; t2 < e2.length; t2++) e2[t2] && (f = r(e2[t2])) && (n2 && (n2 += " "), n2 += f);
  else for (t2 in e2) e2[t2] && (n2 && (n2 += " "), n2 += t2);
  return n2;
}
function clsx() {
  for (var e2, t2, f = 0, n2 = ""; f < arguments.length; ) (e2 = arguments[f++]) && (t2 = r(e2)) && (n2 && (n2 += " "), n2 += t2);
  return n2;
}
let e = { data: "" }, t = (t2) => "object" == typeof window ? ((t2 ? t2.querySelector("#_goober") : window._goober) || Object.assign((t2 || document.head).appendChild(document.createElement("style")), { innerHTML: " ", id: "_goober" })).firstChild : t2 || e, l = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g, a = /\/\*[^]*?\*\/|  +/g, n = /\n+/g, o = (e2, t2) => {
  let r2 = "", l2 = "", a2 = "";
  for (let n2 in e2) {
    let c2 = e2[n2];
    "@" == n2[0] ? "i" == n2[1] ? r2 = n2 + " " + c2 + ";" : l2 += "f" == n2[1] ? o(c2, n2) : n2 + "{" + o(c2, "k" == n2[1] ? "" : t2) + "}" : "object" == typeof c2 ? l2 += o(c2, t2 ? t2.replace(/([^,])+/g, (e3) => n2.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g, (t3) => /&/.test(t3) ? t3.replace(/&/g, e3) : e3 ? e3 + " " + t3 : t3)) : n2) : null != c2 && (n2 = /^--/.test(n2) ? n2 : n2.replace(/[A-Z]/g, "-$&").toLowerCase(), a2 += o.p ? o.p(n2, c2) : n2 + ":" + c2 + ";");
  }
  return r2 + (t2 && a2 ? t2 + "{" + a2 + "}" : a2) + l2;
}, c = {}, s = (e2) => {
  if ("object" == typeof e2) {
    let t2 = "";
    for (let r2 in e2) t2 += r2 + s(e2[r2]);
    return t2;
  }
  return e2;
}, i = (e2, t2, r2, i2, p2) => {
  let u2 = s(e2), d = c[u2] || (c[u2] = ((e3) => {
    let t3 = 0, r3 = 11;
    for (; t3 < e3.length; ) r3 = 101 * r3 + e3.charCodeAt(t3++) >>> 0;
    return "go" + r3;
  })(u2));
  if (!c[d]) {
    let t3 = u2 !== e2 ? e2 : ((e3) => {
      let t4, r3, o2 = [{}];
      for (; t4 = l.exec(e3.replace(a, "")); ) t4[4] ? o2.shift() : t4[3] ? (r3 = t4[3].replace(n, " ").trim(), o2.unshift(o2[0][r3] = o2[0][r3] || {})) : o2[0][t4[1]] = t4[2].replace(n, " ").trim();
      return o2[0];
    })(e2);
    c[d] = o(p2 ? { ["@keyframes " + d]: t3 } : t3, r2 ? "" : "." + d);
  }
  let f = r2 && c.g ? c.g : null;
  return r2 && (c.g = c[d]), ((e3, t3, r3, l2) => {
    l2 ? t3.data = t3.data.replace(l2, e3) : -1 === t3.data.indexOf(e3) && (t3.data = r3 ? e3 + t3.data : t3.data + e3);
  })(c[d], t2, i2, f), d;
}, p = (e2, t2, r2) => e2.reduce((e3, l2, a2) => {
  let n2 = t2[a2];
  if (n2 && n2.call) {
    let e4 = n2(r2), t3 = e4 && e4.props && e4.props.className || /^go/.test(e4) && e4;
    n2 = t3 ? "." + t3 : e4 && "object" == typeof e4 ? e4.props ? "" : o(e4, "") : false === e4 ? "" : e4;
  }
  return e3 + l2 + (null == n2 ? "" : n2);
}, "");
function u(e2) {
  let r2 = this || {}, l2 = e2.call ? e2(r2.p) : e2;
  return i(l2.unshift ? l2.raw ? p(l2, [].slice.call(arguments, 1), r2.p) : l2.reduce((e3, t2) => Object.assign(e3, t2 && t2.call ? t2(r2.p) : t2), {}) : l2, t(r2.target), r2.g, r2.o, r2.k);
}
u.bind({ g: 1 });
u.bind({ k: 1 });
function _defineProperties(target, props) {
  for (var i2 = 0; i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  return Constructor;
}
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = arguments[i2];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i2;
  for (i2 = 0; i2 < sourceKeys.length; i2++) {
    key = sourceKeys[i2];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
var noOp = function noOp2() {
  return "";
};
var SnackbarContext = /* @__PURE__ */ React.createContext({
  enqueueSnackbar: noOp,
  closeSnackbar: noOp
});
var breakpoints = {
  downXs: "@media (max-width:599.95px)",
  upSm: "@media (min-width:600px)"
};
var UNMOUNTED = "unmounted";
var EXITED = "exited";
var ENTERING = "entering";
var ENTERED = "entered";
var EXITING = "exiting";
var Transition = /* @__PURE__ */ function(_React$Component) {
  _inheritsLoose(Transition2, _React$Component);
  function Transition2(props) {
    var _this;
    _this = _React$Component.call(this, props) || this;
    var appear = props.appear;
    var initialStatus;
    _this.appearStatus = null;
    if (props["in"]) {
      if (appear) {
        initialStatus = EXITED;
        _this.appearStatus = ENTERING;
      } else {
        initialStatus = ENTERED;
      }
    } else if (props.unmountOnExit || props.mountOnEnter) {
      initialStatus = UNMOUNTED;
    } else {
      initialStatus = EXITED;
    }
    _this.state = {
      status: initialStatus
    };
    _this.nextCallback = null;
    return _this;
  }
  Transition2.getDerivedStateFromProps = function getDerivedStateFromProps(_ref, prevState) {
    var nextIn = _ref["in"];
    if (nextIn && prevState.status === UNMOUNTED) {
      return {
        status: EXITED
      };
    }
    return null;
  };
  var _proto = Transition2.prototype;
  _proto.componentDidMount = function componentDidMount() {
    this.updateStatus(true, this.appearStatus);
  };
  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
    var nextStatus = null;
    if (prevProps !== this.props) {
      var status = this.state.status;
      if (this.props["in"]) {
        if (status !== ENTERING && status !== ENTERED) {
          nextStatus = ENTERING;
        }
      } else if (status === ENTERING || status === ENTERED) {
        nextStatus = EXITING;
      }
    }
    this.updateStatus(false, nextStatus);
  };
  _proto.componentWillUnmount = function componentWillUnmount() {
    this.cancelNextCallback();
  };
  _proto.getTimeouts = function getTimeouts() {
    var timeout2 = this.props.timeout;
    var enter = timeout2;
    var exit = timeout2;
    if (timeout2 != null && typeof timeout2 !== "number" && typeof timeout2 !== "string") {
      exit = timeout2.exit;
      enter = timeout2.enter;
    }
    return {
      exit,
      enter
    };
  };
  _proto.updateStatus = function updateStatus(mounting, nextStatus) {
    if (mounting === void 0) {
      mounting = false;
    }
    if (nextStatus !== null) {
      this.cancelNextCallback();
      if (nextStatus === ENTERING) {
        this.performEnter(mounting);
      } else {
        this.performExit();
      }
    } else if (this.props.unmountOnExit && this.state.status === EXITED) {
      this.setState({
        status: UNMOUNTED
      });
    }
  };
  _proto.performEnter = function performEnter(mounting) {
    var _this2 = this;
    var enter = this.props.enter;
    var isAppearing = mounting;
    var timeouts = this.getTimeouts();
    if (!mounting && !enter) {
      this.safeSetState({
        status: ENTERED
      }, function() {
        if (_this2.props.onEntered) {
          _this2.props.onEntered(_this2.node, isAppearing);
        }
      });
      return;
    }
    if (this.props.onEnter) {
      this.props.onEnter(this.node, isAppearing);
    }
    this.safeSetState({
      status: ENTERING
    }, function() {
      if (_this2.props.onEntering) {
        _this2.props.onEntering(_this2.node, isAppearing);
      }
      _this2.onTransitionEnd(timeouts.enter, function() {
        _this2.safeSetState({
          status: ENTERED
        }, function() {
          if (_this2.props.onEntered) {
            _this2.props.onEntered(_this2.node, isAppearing);
          }
        });
      });
    });
  };
  _proto.performExit = function performExit() {
    var _this3 = this;
    var exit = this.props.exit;
    var timeouts = this.getTimeouts();
    if (!exit) {
      this.safeSetState({
        status: EXITED
      }, function() {
        if (_this3.props.onExited) {
          _this3.props.onExited(_this3.node);
        }
      });
      return;
    }
    if (this.props.onExit) {
      this.props.onExit(this.node);
    }
    this.safeSetState({
      status: EXITING
    }, function() {
      if (_this3.props.onExiting) {
        _this3.props.onExiting(_this3.node);
      }
      _this3.onTransitionEnd(timeouts.exit, function() {
        _this3.safeSetState({
          status: EXITED
        }, function() {
          if (_this3.props.onExited) {
            _this3.props.onExited(_this3.node);
          }
        });
      });
    });
  };
  _proto.cancelNextCallback = function cancelNextCallback() {
    if (this.nextCallback !== null && this.nextCallback.cancel) {
      this.nextCallback.cancel();
      this.nextCallback = null;
    }
  };
  _proto.safeSetState = function safeSetState(nextState, callback) {
    callback = this.setNextCallback(callback);
    this.setState(nextState, callback);
  };
  _proto.setNextCallback = function setNextCallback(callback) {
    var _this4 = this;
    var active = true;
    this.nextCallback = function() {
      if (active) {
        active = false;
        _this4.nextCallback = null;
        callback();
      }
    };
    this.nextCallback.cancel = function() {
      active = false;
    };
    return this.nextCallback;
  };
  _proto.onTransitionEnd = function onTransitionEnd(timeout2, handler) {
    this.setNextCallback(handler);
    var doesNotHaveTimeoutOrListener = timeout2 == null && !this.props.addEndListener;
    if (!this.node || doesNotHaveTimeoutOrListener) {
      setTimeout(this.nextCallback, 0);
      return;
    }
    if (this.props.addEndListener) {
      this.props.addEndListener(this.node, this.nextCallback);
    }
    if (timeout2 != null) {
      setTimeout(this.nextCallback, timeout2);
    }
  };
  _proto.render = function render() {
    var status = this.state.status;
    if (status === UNMOUNTED) {
      return null;
    }
    var _this$props = this.props, children = _this$props.children, childProps = _objectWithoutPropertiesLoose(_this$props, ["children", "in", "mountOnEnter", "unmountOnExit", "appear", "enter", "exit", "timeout", "addEndListener", "onEnter", "onEntering", "onEntered", "onExit", "onExiting", "onExited", "nodeRef"]);
    return children(status, childProps);
  };
  _createClass(Transition2, [{
    key: "node",
    get: function get() {
      var _this$props$nodeRef;
      var node = (_this$props$nodeRef = this.props.nodeRef) === null || _this$props$nodeRef === void 0 ? void 0 : _this$props$nodeRef.current;
      if (!node) {
        throw new Error("notistack - Custom snackbar is not refForwarding");
      }
      return node;
    }
  }]);
  return Transition2;
}(React.Component);
function noop() {
}
Transition.defaultProps = {
  "in": false,
  mountOnEnter: false,
  unmountOnExit: false,
  appear: false,
  enter: true,
  exit: true,
  onEnter: noop,
  onEntering: noop,
  onEntered: noop,
  onExit: noop,
  onExiting: noop,
  onExited: noop
};
function setRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
function useForkRef(refA, refB) {
  return reactExports.useMemo(function() {
    if (refA == null && refB == null) {
      return null;
    }
    return function(refValue) {
      setRef(refA, refValue);
      setRef(refB, refValue);
    };
  }, [refA, refB]);
}
function getTransitionProps(props) {
  var timeout2 = props.timeout, _props$style = props.style, style = _props$style === void 0 ? {} : _props$style, mode = props.mode;
  return {
    duration: typeof timeout2 === "object" ? timeout2[mode] || 0 : timeout2,
    easing: style.transitionTimingFunction,
    delay: style.transitionDelay
  };
}
var defaultEasing = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
};
var reflow = function reflow2(node) {
  node.scrollTop = node.scrollTop;
};
var formatMs = function formatMs2(milliseconds) {
  return Math.round(milliseconds) + "ms";
};
function createTransition(props, options) {
  if (props === void 0) {
    props = ["all"];
  }
  var _ref = options || {}, _ref$duration = _ref.duration, duration = _ref$duration === void 0 ? 300 : _ref$duration, _ref$easing = _ref.easing, easing = _ref$easing === void 0 ? defaultEasing.easeInOut : _ref$easing, _ref$delay = _ref.delay, delay = _ref$delay === void 0 ? 0 : _ref$delay;
  var properties = Array.isArray(props) ? props : [props];
  return properties.map(function(animatedProp) {
    var formattedDuration = typeof duration === "string" ? duration : formatMs(duration);
    var formattedDelay = typeof delay === "string" ? delay : formatMs(delay);
    return animatedProp + " " + formattedDuration + " " + easing + " " + formattedDelay;
  }).join(",");
}
function ownerDocument(node) {
  return node && node.ownerDocument || document;
}
function ownerWindow(node) {
  var doc = ownerDocument(node);
  return doc.defaultView || window;
}
function debounce(func, wait) {
  if (wait === void 0) {
    wait = 166;
  }
  var timeout2;
  function debounced() {
    var _this = this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var later = function later2() {
      func.apply(_this, args);
    };
    clearTimeout(timeout2);
    timeout2 = setTimeout(later, wait);
  }
  debounced.clear = function() {
    clearTimeout(timeout2);
  };
  return debounced;
}
function getTranslateValue(direction2, node) {
  var rect = node.getBoundingClientRect();
  var containerWindow = ownerWindow(node);
  var transform;
  if (node.fakeTransform) {
    transform = node.fakeTransform;
  } else {
    var computedStyle = containerWindow.getComputedStyle(node);
    transform = computedStyle.getPropertyValue("-webkit-transform") || computedStyle.getPropertyValue("transform");
  }
  var offsetX = 0;
  var offsetY = 0;
  if (transform && transform !== "none" && typeof transform === "string") {
    var transformValues = transform.split("(")[1].split(")")[0].split(",");
    offsetX = parseInt(transformValues[4], 10);
    offsetY = parseInt(transformValues[5], 10);
  }
  switch (direction2) {
    case "left":
      return "translateX(" + (containerWindow.innerWidth + offsetX - rect.left) + "px)";
    case "right":
      return "translateX(-" + (rect.left + rect.width - offsetX) + "px)";
    case "up":
      return "translateY(" + (containerWindow.innerHeight + offsetY - rect.top) + "px)";
    default:
      return "translateY(-" + (rect.top + rect.height - offsetY) + "px)";
  }
}
function setTranslateValue(direction2, node) {
  if (!node) return;
  var transform = getTranslateValue(direction2, node);
  if (transform) {
    node.style.webkitTransform = transform;
    node.style.transform = transform;
  }
}
var Slide = /* @__PURE__ */ reactExports.forwardRef(function(props, ref) {
  var children = props.children, _props$direction = props.direction, direction2 = _props$direction === void 0 ? "down" : _props$direction, inProp = props["in"], style = props.style, _props$timeout = props.timeout, timeout2 = _props$timeout === void 0 ? 0 : _props$timeout, onEnter = props.onEnter, onEntered = props.onEntered, onExit = props.onExit, onExited = props.onExited, other = _objectWithoutPropertiesLoose(props, ["children", "direction", "in", "style", "timeout", "onEnter", "onEntered", "onExit", "onExited"]);
  var nodeRef = reactExports.useRef(null);
  var handleRefIntermediary = useForkRef(children.ref, nodeRef);
  var handleRef = useForkRef(handleRefIntermediary, ref);
  var handleEnter = function handleEnter2(node, isAppearing) {
    setTranslateValue(direction2, node);
    reflow(node);
    if (onEnter) {
      onEnter(node, isAppearing);
    }
  };
  var handleEntering = function handleEntering2(node) {
    var easing = (style === null || style === void 0 ? void 0 : style.transitionTimingFunction) || defaultEasing.easeOut;
    var transitionProps = getTransitionProps({
      timeout: timeout2,
      mode: "enter",
      style: _extends({}, style, {
        transitionTimingFunction: easing
      })
    });
    node.style.webkitTransition = createTransition("-webkit-transform", transitionProps);
    node.style.transition = createTransition("transform", transitionProps);
    node.style.webkitTransform = "none";
    node.style.transform = "none";
  };
  var handleExit = function handleExit2(node) {
    var easing = (style === null || style === void 0 ? void 0 : style.transitionTimingFunction) || defaultEasing.sharp;
    var transitionProps = getTransitionProps({
      timeout: timeout2,
      mode: "exit",
      style: _extends({}, style, {
        transitionTimingFunction: easing
      })
    });
    node.style.webkitTransition = createTransition("-webkit-transform", transitionProps);
    node.style.transition = createTransition("transform", transitionProps);
    setTranslateValue(direction2, node);
    if (onExit) {
      onExit(node);
    }
  };
  var handleExited = function handleExited2(node) {
    node.style.webkitTransition = "";
    node.style.transition = "";
    if (onExited) {
      onExited(node);
    }
  };
  var updatePosition = reactExports.useCallback(function() {
    if (nodeRef.current) {
      setTranslateValue(direction2, nodeRef.current);
    }
  }, [direction2]);
  reactExports.useEffect(function() {
    if (inProp || direction2 === "down" || direction2 === "right") {
      return void 0;
    }
    var handleResize = debounce(function() {
      if (nodeRef.current) {
        setTranslateValue(direction2, nodeRef.current);
      }
    });
    var containerWindow = ownerWindow(nodeRef.current);
    containerWindow.addEventListener("resize", handleResize);
    return function() {
      handleResize.clear();
      containerWindow.removeEventListener("resize", handleResize);
    };
  }, [direction2, inProp]);
  reactExports.useEffect(function() {
    if (!inProp) {
      updatePosition();
    }
  }, [inProp, updatePosition]);
  return reactExports.createElement(Transition, Object.assign({
    appear: true,
    nodeRef,
    onEnter: handleEnter,
    onEntered,
    onEntering: handleEntering,
    onExit: handleExit,
    onExited: handleExited,
    "in": inProp,
    timeout: timeout2
  }, other), function(state, childProps) {
    return reactExports.cloneElement(children, _extends({
      ref: handleRef,
      style: _extends({
        visibility: state === "exited" && !inProp ? "hidden" : void 0
      }, style, {}, children.props.style)
    }, childProps));
  });
});
Slide.displayName = "Slide";
function makeStyles(styles2) {
  return Object.entries(styles2).reduce(function(acc, _ref) {
    var _extends2;
    var key = _ref[0], value = _ref[1];
    return _extends({}, acc, (_extends2 = {}, _extends2[key] = u(value), _extends2));
  }, {});
}
var ComponentClasses = {
  SnackbarContainer: "notistack-SnackbarContainer",
  Snackbar: "notistack-Snackbar",
  CollapseWrapper: "notistack-CollapseWrapper",
  MuiContent: "notistack-MuiContent",
  MuiContentVariant: function MuiContentVariant(variant) {
    return "notistack-MuiContent-" + variant;
  }
};
var classes = /* @__PURE__ */ makeStyles({
  root: {
    height: 0
  },
  entered: {
    height: "auto"
  }
});
var collapsedSize = "0px";
var timeout = 175;
var Collapse = /* @__PURE__ */ reactExports.forwardRef(function(props, ref) {
  var children = props.children, inProp = props["in"], onExited = props.onExited;
  var wrapperRef = reactExports.useRef(null);
  var nodeRef = reactExports.useRef(null);
  var handleRef = useForkRef(ref, nodeRef);
  var getWrapperSize = function getWrapperSize2() {
    return wrapperRef.current ? wrapperRef.current.clientHeight : 0;
  };
  var handleEnter = function handleEnter2(node) {
    node.style.height = collapsedSize;
  };
  var handleEntering = function handleEntering2(node) {
    var wrapperSize = getWrapperSize();
    var _getTransitionProps = getTransitionProps({
      timeout,
      mode: "enter"
    }), transitionDuration = _getTransitionProps.duration, easing = _getTransitionProps.easing;
    node.style.transitionDuration = typeof transitionDuration === "string" ? transitionDuration : transitionDuration + "ms";
    node.style.height = wrapperSize + "px";
    node.style.transitionTimingFunction = easing || "";
  };
  var handleEntered = function handleEntered2(node) {
    node.style.height = "auto";
  };
  var handleExit = function handleExit2(node) {
    node.style.height = getWrapperSize() + "px";
  };
  var handleExiting = function handleExiting2(node) {
    reflow(node);
    var _getTransitionProps2 = getTransitionProps({
      timeout,
      mode: "exit"
    }), transitionDuration = _getTransitionProps2.duration, easing = _getTransitionProps2.easing;
    node.style.transitionDuration = typeof transitionDuration === "string" ? transitionDuration : transitionDuration + "ms";
    node.style.height = collapsedSize;
    node.style.transitionTimingFunction = easing || "";
  };
  return reactExports.createElement(Transition, {
    "in": inProp,
    unmountOnExit: true,
    onEnter: handleEnter,
    onEntered: handleEntered,
    onEntering: handleEntering,
    onExit: handleExit,
    onExited,
    onExiting: handleExiting,
    nodeRef,
    timeout
  }, function(state, childProps) {
    return reactExports.createElement("div", Object.assign({
      ref: handleRef,
      className: clsx(classes.root, state === "entered" && classes.entered),
      style: _extends({
        pointerEvents: "all",
        overflow: "hidden",
        minHeight: collapsedSize,
        transition: createTransition("height")
      }, state === "entered" && {
        overflow: "visible"
      }, {}, state === "exited" && !inProp && {
        visibility: "hidden"
      })
    }, childProps), reactExports.createElement("div", {
      ref: wrapperRef,
      className: ComponentClasses.CollapseWrapper,
      // Hack to get children with a negative margin to not falsify the height computation.
      style: {
        display: "flex",
        width: "100%"
      }
    }, children));
  });
});
Collapse.displayName = "Collapse";
var useEnhancedEffect = typeof window !== "undefined" ? reactExports.useLayoutEffect : reactExports.useEffect;
function useEventCallback(fn) {
  var ref = reactExports.useRef(fn);
  useEnhancedEffect(function() {
    ref.current = fn;
  });
  return reactExports.useCallback(function() {
    return (
      // @ts-expect-error hide `this`
      ref.current.apply(void 0, arguments)
    );
  }, []);
}
var Snackbar = /* @__PURE__ */ reactExports.forwardRef(function(props, ref) {
  var children = props.children, className = props.className, autoHideDuration = props.autoHideDuration, _props$disableWindowB = props.disableWindowBlurListener, disableWindowBlurListener = _props$disableWindowB === void 0 ? false : _props$disableWindowB, onClose = props.onClose, id = props.id, open = props.open, _props$SnackbarProps = props.SnackbarProps, SnackbarProps = _props$SnackbarProps === void 0 ? {} : _props$SnackbarProps;
  var timerAutoHide = reactExports.useRef();
  var handleClose = useEventCallback(function() {
    if (onClose) {
      onClose.apply(void 0, arguments);
    }
  });
  var setAutoHideTimer = useEventCallback(function(autoHideDurationParam) {
    if (!onClose || autoHideDurationParam == null) {
      return;
    }
    if (timerAutoHide.current) {
      clearTimeout(timerAutoHide.current);
    }
    timerAutoHide.current = setTimeout(function() {
      handleClose(null, "timeout", id);
    }, autoHideDurationParam);
  });
  reactExports.useEffect(function() {
    if (open) {
      setAutoHideTimer(autoHideDuration);
    }
    return function() {
      if (timerAutoHide.current) {
        clearTimeout(timerAutoHide.current);
      }
    };
  }, [open, autoHideDuration, setAutoHideTimer]);
  var handlePause = function handlePause2() {
    if (timerAutoHide.current) {
      clearTimeout(timerAutoHide.current);
    }
  };
  var handleResume = reactExports.useCallback(function() {
    if (autoHideDuration != null) {
      setAutoHideTimer(autoHideDuration * 0.5);
    }
  }, [autoHideDuration, setAutoHideTimer]);
  var handleMouseEnter = function handleMouseEnter2(event) {
    if (SnackbarProps.onMouseEnter) {
      SnackbarProps.onMouseEnter(event);
    }
    handlePause();
  };
  var handleMouseLeave = function handleMouseLeave2(event) {
    if (SnackbarProps.onMouseLeave) {
      SnackbarProps.onMouseLeave(event);
    }
    handleResume();
  };
  reactExports.useEffect(function() {
    if (!disableWindowBlurListener && open) {
      window.addEventListener("focus", handleResume);
      window.addEventListener("blur", handlePause);
      return function() {
        window.removeEventListener("focus", handleResume);
        window.removeEventListener("blur", handlePause);
      };
    }
    return void 0;
  }, [disableWindowBlurListener, handleResume, open]);
  return reactExports.createElement("div", Object.assign({
    ref
  }, SnackbarProps, {
    className: clsx(ComponentClasses.Snackbar, className),
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  }), children);
});
Snackbar.displayName = "Snackbar";
var _root;
var classes$1 = /* @__PURE__ */ makeStyles({
  root: (_root = {
    display: "flex",
    flexWrap: "wrap",
    flexGrow: 1
  }, _root[breakpoints.upSm] = {
    flexGrow: "initial",
    minWidth: "288px"
  }, _root)
});
var SnackbarContent = /* @__PURE__ */ reactExports.forwardRef(function(_ref, ref) {
  var className = _ref.className, props = _objectWithoutPropertiesLoose(_ref, ["className"]);
  return React.createElement("div", Object.assign({
    ref,
    className: clsx(classes$1.root, className)
  }, props));
});
SnackbarContent.displayName = "SnackbarContent";
var classes$2 = /* @__PURE__ */ makeStyles({
  root: {
    backgroundColor: "#313131",
    fontSize: "0.875rem",
    lineHeight: 1.43,
    letterSpacing: "0.01071em",
    color: "#fff",
    alignItems: "center",
    padding: "6px 16px",
    borderRadius: "4px",
    boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)"
  },
  lessPadding: {
    paddingLeft: 8 * 2.5 + "px"
  },
  "default": {
    backgroundColor: "#313131"
  },
  success: {
    backgroundColor: "#43a047"
  },
  error: {
    backgroundColor: "#d32f2f"
  },
  warning: {
    backgroundColor: "#ff9800"
  },
  info: {
    backgroundColor: "#2196f3"
  },
  message: {
    display: "flex",
    alignItems: "center",
    padding: "8px 0"
  },
  action: {
    display: "flex",
    alignItems: "center",
    marginLeft: "auto",
    paddingLeft: "16px",
    marginRight: "-8px"
  }
});
var ariaDescribedby = "notistack-snackbar";
var MaterialDesignContent = /* @__PURE__ */ reactExports.forwardRef(function(props, forwardedRef) {
  var id = props.id, message = props.message, componentOrFunctionAction = props.action, iconVariant = props.iconVariant, variant = props.variant, hideIconVariant = props.hideIconVariant, style = props.style, className = props.className;
  var icon = iconVariant[variant];
  var action = componentOrFunctionAction;
  if (typeof action === "function") {
    action = action(id);
  }
  return React.createElement(SnackbarContent, {
    ref: forwardedRef,
    role: "alert",
    "aria-describedby": ariaDescribedby,
    style,
    className: clsx(ComponentClasses.MuiContent, ComponentClasses.MuiContentVariant(variant), classes$2.root, classes$2[variant], className, !hideIconVariant && icon && classes$2.lessPadding)
  }, React.createElement("div", {
    id: ariaDescribedby,
    className: classes$2.message
  }, !hideIconVariant ? icon : null, message), action && React.createElement("div", {
    className: classes$2.action
  }, action));
});
MaterialDesignContent.displayName = "MaterialDesignContent";
var _root$1, _rootDense, _left, _right, _center;
var indents = {
  view: {
    "default": 20
  },
  snackbar: {
    "default": 6,
    dense: 2
  }
};
var collapseWrapper = "." + ComponentClasses.CollapseWrapper;
var xsWidthMargin = 16;
/* @__PURE__ */ makeStyles({
  root: (_root$1 = {
    boxSizing: "border-box",
    display: "flex",
    maxHeight: "100%",
    position: "fixed",
    zIndex: 1400,
    height: "auto",
    width: "auto",
    transition: /* @__PURE__ */ createTransition(["top", "right", "bottom", "left", "max-width"], {
      duration: 300,
      easing: "ease"
    }),
    // container itself is invisible and should not block clicks, clicks should be passed to its children
    // a pointerEvents: all is applied in the collapse component
    pointerEvents: "none"
  }, _root$1[collapseWrapper] = {
    padding: indents.snackbar["default"] + "px 0px",
    transition: "padding 300ms ease 0ms"
  }, _root$1.maxWidth = "calc(100% - " + indents.view["default"] * 2 + "px)", _root$1[breakpoints.downXs] = {
    width: "100%",
    maxWidth: "calc(100% - " + xsWidthMargin * 2 + "px)"
  }, _root$1),
  rootDense: (_rootDense = {}, _rootDense[collapseWrapper] = {
    padding: indents.snackbar.dense + "px 0px"
  }, _rootDense),
  top: {
    top: indents.view["default"] - indents.snackbar["default"] + "px",
    flexDirection: "column"
  },
  bottom: {
    bottom: indents.view["default"] - indents.snackbar["default"] + "px",
    flexDirection: "column-reverse"
  },
  left: (_left = {
    left: indents.view["default"] + "px"
  }, _left[breakpoints.upSm] = {
    alignItems: "flex-start"
  }, _left[breakpoints.downXs] = {
    left: xsWidthMargin + "px"
  }, _left),
  right: (_right = {
    right: indents.view["default"] + "px"
  }, _right[breakpoints.upSm] = {
    alignItems: "flex-end"
  }, _right[breakpoints.downXs] = {
    right: xsWidthMargin + "px"
  }, _right),
  center: (_center = {
    left: "50%",
    transform: "translateX(-50%)"
  }, _center[breakpoints.upSm] = {
    alignItems: "center"
  }, _center)
});
var useSnackbar = function() {
  return reactExports.useContext(SnackbarContext);
};
export {
  useSnackbar as u
};
