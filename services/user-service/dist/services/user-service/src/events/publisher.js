"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublisher = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const logger_1 = require("../utils/logger");
let connection = null;
let channel = null;
async function getChannel() {
    if (channel)
        return channel;
    connection = await amqplib_1.default.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    connection.on("error", (err) => {
        logger_1.logger.error("RabbitMQ connection error", err);
        connection = null;
        channel = null;
    });
    connection.on("close", () => {
        logger_1.logger.warn("RabbitMQ connection closed");
        connection = null;
        channel = null;
    });
    return channel;
}
class EventPublisher {
    static async publish(queue, message) {
        try {
            const ch = await getChannel();
            await ch.assertQueue(queue, { durable: true });
            ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                persistent: true,
            });
        }
        catch (err) {
            logger_1.logger.error(`Failed to publish to queue ${queue}`, err);
            throw err;
        }
    }
}
exports.EventPublisher = EventPublisher;
