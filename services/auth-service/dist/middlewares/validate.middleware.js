"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const validate = (schema) => {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const message = err.errors.map((e) => e.message).join(", ");
                return next(new errors_1.BadRequestError(message));
            }
            next(err);
        }
    };
};
exports.validate = validate;
