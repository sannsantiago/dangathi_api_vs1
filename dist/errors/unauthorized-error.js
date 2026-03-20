"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
class UnauthorizedError extends Error {
    constructor(message) {
        super(message !== null && message !== void 0 ? message : 'Unauthorized.');
    }
}
exports.UnauthorizedError = UnauthorizedError;
