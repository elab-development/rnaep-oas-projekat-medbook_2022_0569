"""Hibridni Kafka modul (Processor): konzumira 'user-registered' događaje,
automatski kreira zdravstveni karton za novog pacijenta (poslovna logika),
a zatim publikuje 'medical-record-created' događaj na drugi topic."""
import asyncio
import json
import logging
from datetime import datetime, timezone

from aiokafka import AIOKafkaConsumer

from config import settings
from model.medical_record import MedicalRecord
from repository.medical_record_repository import get_record_by_patient, create_record
from events.kafka_producer import publish

log = logging.getLogger("kafka")

CONSUME_TOPIC = "user-registered"
RETRY_SECONDS = 10

_task: asyncio.Task | None = None


async def _handle_user_registered(event: dict):
    if event.get("role") != "patient":
        return

    patient_id = event["user_id"]
    existing = await get_record_by_patient(patient_id)
    if existing is not None:
        log.info("Medical record for patient %s already exists, skipping", patient_id)
        return

    record = MedicalRecord(
        patient_id=patient_id,
        created_at=datetime.now(timezone.utc),
    )
    record = await create_record(record)
    log.info("Auto-created medical record %s for patient %s", record.id, patient_id)

    await publish("medical-record-created", {
        "record_id": str(record.id),
        "patient_id": patient_id,
        "patient_name": f"{event.get('name', '')} {event.get('surname', '')}".strip(),
        "created_at": record.created_at,
    })


async def _consume_loop():
    while True:
        consumer = AIOKafkaConsumer(
            CONSUME_TOPIC,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id="medical-records-service",
            value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            auto_offset_reset="earliest",
        )
        try:
            await consumer.start()
            log.info("Kafka consumer subscribed to '%s'", CONSUME_TOPIC)
            async for message in consumer:
                try:
                    await _handle_user_registered(message.value)
                except Exception as exc:
                    log.error("Failed to process event %s: %s", message.value, exc)
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
