from datetime import datetime, timedelta, date, time

SLOT_DURATION = 30


def generate_slots(start_time: time, end_time: time, target_date: date):
    slots = []
    current = datetime.combine(target_date, start_time)
    end_dt = datetime.combine(target_date, end_time)
    while current + timedelta(minutes=SLOT_DURATION) <= end_dt:
        slots.append(current)
        current += timedelta(minutes=SLOT_DURATION)
    return slots


def test_generates_correct_slot_count():
    slots = generate_slots(time(8, 0), time(10, 0), date.today())
    assert len(slots) == 4


def test_full_workday_slots():
    slots = generate_slots(time(8, 0), time(16, 0), date.today())
    assert len(slots) == 16


def test_no_slots_when_same_start_end():
    slots = generate_slots(time(9, 0), time(9, 0), date.today())
    assert len(slots) == 0


def test_single_slot():
    slots = generate_slots(time(9, 0), time(9, 30), date.today())
    assert len(slots) == 1
    assert slots[0].hour == 9
    assert slots[0].minute == 0


def test_slot_interval_is_30_minutes():
    slots = generate_slots(time(8, 0), time(10, 0), date.today())
    for i in range(len(slots) - 1):
        diff = (slots[i + 1] - slots[i]).seconds // 60
        assert diff == 30


def test_no_partial_slot_at_end():
    # 8:00 - 9:45 = 3 full slots (8:00, 8:30, 9:00) — 9:30 fits, 9:45 doesn't complete a slot
    slots = generate_slots(time(8, 0), time(9, 45), date.today())
    assert len(slots) == 3
