import json
import logging
from aiokafka import AIOKafkaProducer
from config import settings

log = logging.getLogger("kafka")

_producer: AIOKafkaProducer | None = None


async def start_producer():
    global _producer
    try:
        _producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v, default=str).encode("utf-8"),
        )
        await _producer.start()
        log.info("Kafka producer connected to %s", settings.KAFKA_BOOTSTRAP_SERVERS)
    except Exception as exc:
        _producer = None
        log.warning("Kafka unavailable, events will be dropped: %s", exc)


async def stop_producer():
    global _producer
    if _producer is not None:
        await _producer.stop()
        _producer = None


async def publish(topic: str, event: dict):
    if _producer is None:
        # Kafka nije bila dostupna pri startu servisa — pokušaj ponovo
        await start_producer()
    if _producer is None:
        log.warning("Kafka producer not running, dropping event on '%s'", topic)
        return
    try:
        await _producer.send_and_wait(topic, event)
        log.info("Published event to '%s': %s", topic, event)
    except Exception as exc:
        log.error("Failed to publish event to '%s': %s", topic, exc)
