"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepClone = void 0;
/**
 * Deep clone object
 * @param object The object to clone
 */
function deepClone(object) {
    return JSON.parse(JSON.stringify(object));
}
exports.deepClone = deepClone;
