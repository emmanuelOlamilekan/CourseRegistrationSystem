import amqp, { ChannelModel, Channel } from "amqplib";
import { logger } from "../utils/logger";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  connection = await amqp.connect(process.env.RABBITMQ_URL!);
  channel = await connection.createChannel();

  (connection as ChannelModel).on("error", (err: Error) => {
    logger.error("RabbitMQ connection error", err);
    connection = null;
    channel = null;
  });

  (connection as ChannelModel).on("close", () => {
    logger.warn("RabbitMQ connection closed");
    connection = null;
    channel = null;
  });

  return channel;
}

export class EventPublisher {
  static async publish(queue: string, message: unknown): Promise<void> {
    try {
      const ch = await getChannel();
      await ch.assertQueue(queue, { durable: true });
      ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
    } catch (err) {
      logger.error(`Failed to publish to queue ${queue}`, err);
      throw err;
    }
  }
}
