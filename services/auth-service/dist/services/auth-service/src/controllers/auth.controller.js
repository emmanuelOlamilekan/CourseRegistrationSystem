"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async register(req, res) {
        const { email, password, role } = req.body;
        const user = await auth_service_1.AuthService.register(email, password, role);
        res.status(201).json({ success: true, data: user });
    }
    static async login(req, res) {
        const { email, password } = req.body;
        const tokens = await auth_service_1.AuthService.login(email, password);
        res.json({ success: true, data: tokens });
    }
}
exports.AuthController = AuthController;
