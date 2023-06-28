"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteSwitchError = void 0;
class MuteSwitchError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'MuteSwitchError';
        this.message = message;
        this.code = code;
    }
}
exports.MuteSwitchError = MuteSwitchError;
