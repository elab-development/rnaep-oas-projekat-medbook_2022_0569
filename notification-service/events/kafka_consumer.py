"""Consumer modul: sluša događaje sa više Kafka topic-a i pretvara ih
u notifikacije (u memoriji, dostupne kroz GET /notifications)."""
import asyncio
import json
import logging
from collections import deque
from datetime import datetime, timezone

from aiokafka import AIOKafkaConsumer

from config import settings

log = logging.getLogger("kafka")

TOPICS = [
    "appointment-created",
    "appointment-cancelled",
    "appointment-completed",
    "medical-record-created",
]
RETRY_SECONDS = 10

notifications: deque = deque(maxlen=200)

_task: asyncio.Task | None = None


def _format_message(topic: str, event: dict) -> str:
    if topic == "appointment-created":
        return (f"Appointment #{event.get('appointment_id')} booked: "
                f"patient #{event.get('patient_id')} with doctor #{event.get('doctor_id')} "
                f"on {event.get('date')}")
    if topic == "appointment-cancelled":
        return (f"Appointment #{event.get('appointment_id')} cancelled "
                f"by user #{event.get('cancelled_by')}")
    if topic == "appointment-completed":
        return (f"Appointment #{event.get('appointment_id')} completed "
                f"by doctor #{event.get('doctor_id')}")
    if topic == "medical-record-created":
        return (f"Medical record created for patient "
                f"{event.get('patient_name') or '#' + str(event.get('patient_id'))}")
    return f"Event on '{topic}': {event}"


async def _consume_loop():
    while True:
        consumer = AIOKafkaConsumer(
            *TOPICS,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id="notification-service",
            value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            auto_offset_reset="earliest",
        )
        try:
            await consumer.start()
            log.info("Kafka consumer subscribed to %s", TOPICS)
            async for message in consumer:
                notification = {
                    "topic": message.topic,
                    "message": _format_message(message.topic, message.value),
                    "event": message.value,
                    "received_at": datetime.now(timezone.utc).isoformat(),
                }
                notifications.appendleft(notification)
                log.info("Notification: %s", notification["message"])
        except asyncio.CancelledError:
            await consumer.stop()
            raise
        except Exception as exc:
            log.warning("Kafka consumer error (%s), retrying in %ss", exc, RETRY_SECONDS)
            await consumer.stop()
            await asyncio.sleep(RETRY_SECONDS)


def start_consumer():
    global _task
    _task = asyncio.create_task(_consume_loop())


async def stop_consumer():
    global _task
    if _task is not None:
        _task.cancel()
        try:
            await _task
        except (asyncio.CancelledError, Exception):
            pass
        _task = None
