"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannel = getChannel;
exports.closeConnection = closeConnection;
const amqplib_1 = __importDefault(require("amqplib"));
let connection = null;
let channel = null;
async function getChannel() {
    if (channel)
        return channel;
    connection = await amqplib_1.default.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    connection.on("error", () => {
        connection = null;
        channel = null;
    });
    connection.on("close", () => {
        connection = null;
        channel = null;
    });
    return channel;
}
async function closeConnection() {
    if (channel)
        await channel.close();
    if (connection)
        await connection.close();
    channel = null;
    connection = null;
}
