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

## Eksterni API servisi

Aplikacija koristi dva besplatna eksterna API servisa bez potrebe za API ključem:

[Open Meteo](https://open-meteo.com/) - Prikaz trenutnog vremena i zdravstvenih savjeta na dashboardu 
[Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) - Prikaz medicinskih informacija o dijagnozi iz istorije pregleda

