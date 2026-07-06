from security.jwt_security import hash_password, verify_password, create_access_token, decode_access_token


def test_password_hash_and_verify():
    hashed = hash_password("TestPassword123")
    assert verify_password("TestPassword123", hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_different_passwords_produce_different_hashes():
    h1 = hash_password("pass1")
    h2 = hash_password("pass2")
    assert h1 != h2


def test_jwt_encode_decode():
    token = create_access_token({"sub": "7", "role": "doctor"})
    payload = decode_access_token(token)
    assert payload["sub"] == "7"
    assert payload["role"] == "doctor"


def test_jwt_all_roles():
    for role in ("patient", "doctor", "admin"):
        token = create_access_token({"sub": "1", "role": role})
        payload = decode_access_token(token)
        assert payload["role"] == role


def test_jwt_preserves_user_id():
    token = create_access_token({"sub": "42", "role": "patient"})
    payload = decode_access_token(token)
    assert payload["sub"] == "42"
