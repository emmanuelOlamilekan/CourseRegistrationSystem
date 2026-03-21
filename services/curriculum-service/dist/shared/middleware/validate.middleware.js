"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const BadRequestError_1 = require("../errors/BadRequestError");
const validate = (schema) => {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const message = err.issues.map((e) => e.message).join(", ");
                return next(new BadRequestError_1.BadRequestError(message));
            }
            next(err);
        }
    };
};
exports.validate = validate;
