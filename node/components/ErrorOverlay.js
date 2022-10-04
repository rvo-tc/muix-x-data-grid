"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ErrorOverlay = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var React = _interopRequireWildcard(require("react"));

var _useGridApiContext = require("../hooks/utils/useGridApiContext");

var _GridOverlay = require("./containers/GridOverlay");

var _useGridSelector = require("../hooks/utils/useGridSelector");

var _densitySelector = require("../hooks/features/density/densitySelector");

var _jsxRuntime = require("react/jsx-runtime");

const _excluded = ["message", "hasError", "errorInfo"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// TODO v6: rename to GridErrorOverlay
const ErrorOverlay = /*#__PURE__*/React.forwardRef(function ErrorOverlay(props, ref) {
  const {
    message
  } = props,
        other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const defaultLabel = apiRef.current.getLocaleText('errorOverlayDefaultLabel');
  const rowHeight = (0, _useGridSelector.useGridSelector)(apiRef, _densitySelector.gridDensityRowHeightSelector);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridOverlay.GridOverlay, (0, _extends2.default)({
    ref: ref,
    sx: {
      width: '100%',
      minHeight: 2 * rowHeight
    }
  }, other, {
    children: message || defaultLabel
  }));
});
exports.ErrorOverlay = ErrorOverlay;