"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _process = _interopRequireDefault(require("process"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NODE_ENV = _process.default.env.NODE_ENV || 'development';

var _default = NODE_ENV === 'production';

exports.default = _default;