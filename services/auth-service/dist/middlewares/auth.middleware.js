"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const token_1 = require("../utils/token");
const errors_1 = require("../utils/errors");
const authMiddleware = (roles = []) => {
    return (req, _res, next) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token)
            return next(new errors_1.UnauthorizedError("No token provided"));
        try {
            const decoded = (0, token_1.verifyAccessToken)(token);
            if (roles.length && !roles.includes(decoded.role)) {
                return next(new errors_1.ForbiddenError("Access denied"));
            }
            req.user = decoded;
            next();
        }
        catch {
            return next(new errors_1.UnauthorizedError("Invalid token"));
        }
    };
};
exports.authMiddleware = authMiddleware;
