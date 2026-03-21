# Event Bus (RabbitMQ)

All inter-service events are sent as durable, persistent JSON messages to named queues.

## Connection

- **Broker**: RabbitMQ `3-management`
- **URL format**: `amqp://<user>:<password>@<host>:5672`
- **Default credentials (dev)**: `guest` / `guest`
- **Management UI**: `http://localhost:15672`

Each service maintains a singleton connection using `amqplib`'s `ChannelModel`. The singleton reconnects automatically if the connection is lost (error/close events reset the cached channel to `null`, triggering reconnection on the next publish).

## Queue Configuration

All queues are declared with:
```json
{ "durable": true }
```

All messages are sent with:
```json
{ "persistent": true }
```

This ensures messages survive RabbitMQ restarts.

---

## Event Catalogue

### auth-service

| Queue | Trigger | Payload |
|---|---|---|
| `auth.user.registered` | Successful `POST /auth/register` | `{ userId, email, role }` |

**Intended consumer**: user-service (create an initial profile record linked to the auth account)

---

### registration-service

| Queue | Trigger | Payload |
|---|---|---|
| `registration.enrolled` | Student successfully enrolls | `{ studentId, courseId, programId, curriculumId, level, semester }` |
| `registration.dropped` | Student drops a course | `{ studentId, courseId, programId, curriculumId }` |
| `registration.completed` | Admin/advisor marks a course complete | `{ studentId, courseId, programId, curriculumId }` |

**Intended consumers**:
- `registration.enrolled` → notification service, analytics
- `registration.dropped` → notification service
- `registration.completed` → graduation eligibility recalculation, analytics

---

## Adding a New Event

1. Call `EventPublisher.publish(queueName, payload)` in the relevant service
2. Add the queue name and payload to this document
3. In the consuming service, call `ch.assertQueue(queueName, { durable: true })` then `ch.consume(...)` to process messages

## Current Gaps

The following events are published but have no consumer implemented yet:

| Queue | Status |
|---|---|
| `auth.user.registered` | Published by auth-service; no consumer in user-service yet |
| `registration.dropped` | Published; no consumer |
| `registration.completed` | Published; no consumer |

Implementing consumers is the next step for cross-service integration (e.g. automatic profile creation on registration, email notifications on enrollment).
