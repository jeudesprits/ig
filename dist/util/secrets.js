"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dotenvSafe = require("dotenv-safe");

const {
  parsed
} = (0, _dotenvSafe.config)();
var _default = parsed;
exports.default = _default;