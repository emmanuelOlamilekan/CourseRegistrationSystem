import amqp, { ChannelModel, Channel } from "amqplib";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  connection = await amqp.connect(process.env.RABBITMQ_URL!);
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

export async function closeConnection(): Promise<void> {
  if (channel) await channel.close();
  if (connection) await connection.close();
  channel = null;
  connection = null;
}
