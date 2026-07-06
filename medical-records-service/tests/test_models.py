from model.medical_record import BloodType


def test_blood_type_unknown_value():
    assert BloodType.UNKNOWN.value == "Unknown"


def test_all_standard_blood_types_present():
    values = {bt.value for bt in BloodType}
    for expected in ("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"):
        assert expected in values


def test_blood_type_is_string_subclass():
    assert isinstance(BloodType.A_POSITIVE, str)
    assert BloodType.A_POSITIVE == "A+"


def test_blood_type_total_count():
    assert len(BloodType) == 9


def test_blood_type_negative_variants():
    values = {bt.value for bt in BloodType}
    assert "A-" in values
    assert "B-" in values
    assert "AB-" in values
    assert "O-" in values
