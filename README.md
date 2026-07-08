# MedBook

Platforma za upravljanje medicinskim terminima koja povezuje pacijente i doktore. Sistem omogućava zakazivanje pregleda, vođenje zdravstvenog kartona i pregled medicinske historije.

## Arhitektura sistema
Sistem je izgrađen kao skup mikroservisa koji komuniciraju putem centralnog API Gateway-a.

Frontend 3000 React aplikacija (nginx) 
API Gateway 8000 Centralna ulazna tačka 
user-service 8001 Autentifikacija, profili, rasporedi 
appointment-service 8002 Termini i slobodni slotovi 
medical-records-service 8003 Zdravstveni kartoni i pregledi 



## Preduslovi

Prije pokretanja sistema potrebno je imati instalirano:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/) (uključen u Docker Desktop)
- Git

Provjera instalacije:

```bash
docker --version
docker compose version
```

---

## Pokretanje sistema

### 1. Kloniranje repozitorijuma

```bash
git clone <url-repozitorijuma>
cd rnaep-oas-projekat-medbook_2022_0569
```

### 2. Kreiranje `.env` fajla

U korijenskom direktorijumu kreirati fajl `.env` sa sljedećim sadržajem:

```env
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password

POSTGRES_DB=user_db
POSTGRES1_DB=appointment_db

MONGO_USER=your_mongo_user
MONGO_PASSWORD=your_mongo_password
MONGO_DB=medical_records_db

JWT_SECRET=your_jwt_secret
```

### 3. Pokretanje svih servisa

```bash
docker compose up --build -d
```

Prva izgradnja može potrajati nekoliko minuta. Docker će preuzeti slike, instalirati zavisnosti i pokrenuti sve servise.

### 4. Provjera statusa

```bash
docker compose ps
```

Svi kontejneri trebaju imati status `running`. Ukoliko neki servis ne starta, provjeriti logove:

```bash
docker compose logs <naziv-servisa>
# primjer:
docker compose logs user-service
```

### 5. Pristup aplikaciji

Otvoriti browser i navigirati na:

```
http://localhost:3000
```

---

## Inicijalni podaci

### Registracija korisnika

Nova korisnička računa (pacijent, doktor) mogu se kreirati putem stranice `/register`.  
Admin naloge može kreirati isključivo administrator kroz Admin Dashboard.

---

## Zaustavljanje sistema

```bash
# Zaustaviti kontejnere (bez brisanja podataka)
docker compose down

# Zaustaviti i obrisati sve podatke (baze, volumeni)
docker compose down -v
```

---

## Distribuirani mikroservisni patern: Circuit Breaker

### Opis paterna

Circuit Breaker je mehanizam zaštite sistema od kaskadnih otkazivanja. Kada jedan mikroservis postane nedostupan ili previše spor, circuit breaker se "otvara" i odmah odbija zahtjeve prema tom servisu — bez čekanja na timeout — dok servisu daje vremena da se oporavi. Klijentu se vraća podrazumijevani (fallback) odgovor umjesto beskonačnog čekanja.

### Implementacija

Circuit breaker je implementiran u **API Gateway** (`api-gateway/main.py`) kao vlastita klasa `CircuitBreaker` koja prati stanje svakog mikroservisa nezavisno.

#### Stanja circuit breakera

| Stanje | Opis |
|--------|------|
| **CLOSED** | Normalan rad — zahtjevi prolaze do mikroservisa |
| **OPEN** | Servis je nedostupan — zahtjevi se odmah odbijaju s fallback odgovorom |
| **HALF-OPEN** | Nakon 30s recovery perioda — pušta jedan probni zahtjev da provjeri dostupnost |

#### Konfiguracija

```python
CircuitBreaker(fail_max=3, reset_timeout=30)
```

- `fail_max=3` — otvara se nakon 3 uzastopna neuspjeha
- `reset_timeout=30` — ostaje otvoren 30 sekundi, zatim prelazi u HALF-OPEN

#### Primjer fallback odgovora (HTTP 503)

Kada je circuit otvoren, gateway vraća:

```json
{
  "error": "Service temporarily unavailable",
  "service": "users",
  "message": "Circuit breaker is open for 'users'. Try again later."
}
```

### Zašto Circuit Breaker

U distribuiranim sistemima, otkazivanje jednog mikroservisa može uzrokovati kaskadne greške — zahtjevi se gomilaju, threadovi se blokiraju, sistem se ruši u cjelini. Circuit Breaker sprječava ovaj scenarij tako što:

- **Štiti klijenta** od dugih čekanja na timeout (10s → 0ms kad je breaker otvoren)
- **Daje servisu prostor** za oporavak bez stalnog opterećenja novim zahtjevima
- **Izoluje kvar** — otkazivanje `user-service` ne utiče na `appointment-service` ni `medical-records-service`

---

## Eksterni API servisi

Aplikacija koristi dva besplatna eksterna API servisa bez potrebe za API ključem:

[Open Meteo](https://open-meteo.com/) - Prikaz trenutnog vremena i zdravstvenih savjeta na dashboardu 
[Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) - Prikaz medicinskih informacija o dijagnozi iz istorije pregleda

---

## Distribuirani mikroservisni patern: Circuit Breaker

### Opis paterna

Circuit Breaker je mehanizam zaštite sistema od kaskadnih otkazivanja. Kada jedan mikroservis postane nedostupan ili previše spor, circuit breaker se "otvara" i odmah odbija zahtjeve prema tom servisu — bez čekanja na timeout — dok servisu daje vremena da se oporavi. Klijentu se vraća podrazumijevani (fallback) odgovor umjesto beskonačnog čekanja.

### Implementacija

Circuit breaker je implementiran u *API Gateway* (api-gateway/main.py) kao vlastita klasa CircuitBreaker koja prati stanje svakog mikroservisa nezavisno.

#### Stanja circuit breakera

| Stanje | Opis |
|--------|------|
| *CLOSED* | Normalan rad — zahtjevi prolaze do mikroservisa |
| *OPEN* | Servis je nedostupan — zahtjevi se odmah odbijaju s fallback odgovorom |
| *HALF-OPEN* | Nakon 30s recovery perioda — pušta jedan probni zahtjev da provjeri dostupnost |

#### Konfiguracija

python
CircuitBreaker(fail_max=3, reset_timeout=30)


- fail_max=3 — otvara se nakon 3 uzastopna neuspjeha
- reset_timeout=30 — ostaje otvoren 30 sekundi, zatim prelazi u HALF-OPEN

#### Primjer fallback odgovora (HTTP 503)

Kada je circuit otvoren, gateway vraća:

json
{
  "error": "Service temporarily unavailable",
  "service": "users",
  "message": "Circuit breaker is open for 'users'. Try again later."
}


### Zašto Circuit Breaker

U distribuiranim sistemima, otkazivanje jednog mikroservisa može uzrokovati kaskadne greške — zahtjevi se gomilaju, threadovi se blokiraju, sistem se ruši u cjelini. Circuit Breaker sprječava ovaj scenarij tako što:

- *Štiti klijenta* od dugih čekanja na timeout (10s → 0ms kad je breaker otvoren)
- *Daje servisu prostor* za oporavak bez stalnog opterećenja novim zahtjevima
- *Izoluje kvar* — otkazivanje user-service ne utiče na appointment-service ni medical-records-service

---

## Arhitektura vođena događajima (Event-Driven Architecture)

Komunikacija između mikroservisa je transformisana iz sinhrone (HTTP/REST) u asinhronu korišćenjem **Apache Kafka** platforme kao Message Broker-a (servis `kafka` u docker-compose, KRaft mod — bez ZooKeeper-a).

### Kafka topics (5)

| Topic | Producer | Consumer | Opis |
|-------|----------|----------|------|
| `user-registered` | user-service | medical-records-service | Novi pacijent/doktor registrovan |
| `appointment-created` | appointment-service | notification-service | Termin zakazan |
| `appointment-cancelled` | appointment-service | notification-service | Termin otkazan |
| `appointment-completed` | appointment-service | notification-service | Termin završen |
| `medical-record-created` | medical-records-service | notification-service | Karton automatski kreiran |

### Producer-i i Consumer-i

- **user-service** — *Producer*: publikuje `user-registered` nakon uspješne registracije (`events/kafka_producer.py`, poziv u `service/auth_service.py`)
- **appointment-service** — *Producer*: publikuje `appointment-created` / `appointment-cancelled` / `appointment-completed` (`service/appointment_service.py`)
- **notification-service** (port 8004) — *Consumer*: sluša 4 topic-a i pretvara događaje u notifikacije, dostupne na `GET http://localhost:8004/notifications`

### Hibridni modul (Processor): medical-records-service

`medical-records-service` funkcioniše **i kao Consumer i kao Producer** (`events/kafka_consumer.py`):

1. **Konzumira** događaj `user-registered` sa Kafka topic-a
2. **Izvršava poslovnu logiku** — ako je registrovan pacijent, automatski kreira prazan zdravstveni karton u MongoDB (ranije se karton kreirao sinhronim HTTP pozivom)
3. **Publikuje** novi događaj `medical-record-created` na drugi topic

```
user-service ──(user-registered)──▶ medical-records-service ──(medical-record-created)──▶ notification-service
                                       [Processor: kreira karton]
appointment-service ──(appointment-created/cancelled/completed)──────────────────────────▶ notification-service
```

### Zašto asinhrona komunikacija

- **Otpornost** — registracija pacijenta uspijeva i kad je medical-records-service trenutno nedostupan; događaj čeka u Kafka logu i biće obrađen kad se servis oporavi
- **Labava spregnutost** — user-service ne zna ko konzumira njegove događaje; novi consumer se dodaje bez izmjene producer-a
- **Skalabilnost** — consumer grupe omogućavaju paralelnu obradu događaja