"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UnauthorizedError_1 = require("../errors/UnauthorizedError");
const ForbiddenError_1 = require("../errors/ForbiddenError");
const authMiddleware = (roles = []) => {
    return (req, _res, next) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token)
            return next(new UnauthorizedError_1.UnauthorizedError("No token provided"));
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (roles.length && !roles.includes(decoded.role)) {
                return next(new ForbiddenError_1.ForbiddenError("Access denied"));
            }
            req.user = decoded;
            next();
        }
        catch {
            return next(new UnauthorizedError_1.UnauthorizedError("Invalid token"));
        }
    };
};
exports.authMiddleware = authMiddleware;
