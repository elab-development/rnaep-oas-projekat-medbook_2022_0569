from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
import httpx
import time

app = FastAPI(title="MedBook - API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

SERVICES = {
    "users": "http://user-service:8000",
    "appointments": "http://appointment-service:8000",
    "medical-records": "http://medical-records-service:8000",
}


class CircuitBreaker:
    CLOSED    = "closed"
    OPEN      = "open"
    HALF_OPEN = "half_open"

    def __init__(self, fail_max: int = 3, reset_timeout: int = 30):
        self.fail_max = fail_max
        self.reset_timeout = reset_timeout
        self._failures = 0
        self._state = self.CLOSED
        self._opened_at = None

    @property
    def state(self) -> str:
        if self._state == self.OPEN:
            if time.time() - self._opened_at >= self.reset_timeout:
                self._state = self.HALF_OPEN
        return self._state

    async def call(self, coro_fn):
        if self.state == self.OPEN:
            raise CircuitBreakerError()
        try:
            result = await coro_fn()
            self._on_success()
            return result
        except Exception:
            self._on_failure()
            raise

    def _on_success(self):
        self._failures = 0
        self._state = self.CLOSED

    def _on_failure(self):
        self._failures += 1
        if self._failures >= self.fail_max:
            self._state = self.OPEN
            self._opened_at = time.time()


class CircuitBreakerError(Exception):
    pass


# Otvara se nakon 3 uzastopna neuspjeha, ostaje otvoren 30s
breakers = {service: CircuitBreaker(fail_max=3, reset_timeout=30) for service in SERVICES}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "api-gateway"}


@app.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def proxy(service: str, path: str, request: Request):
    if service not in SERVICES:
        return Response(content='{"error": "Service not found"}', status_code=404)

    url = f"{SERVICES[service]}/{path}"
    breaker = breakers[service]
    body = await request.body()
    headers = {k: v for k, v in request.headers.items() if k != "host"}

    try:
        async def make_request():
            async with httpx.AsyncClient() as client:
                return await client.request(
                    method=request.method,
                    url=url,
                    headers=headers,
                    content=body,
                    params=request.query_params,
                    timeout=10.0,
                )

        response = await breaker.call(make_request)

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
        )

    except CircuitBreakerError:
        return JSONResponse(
            status_code=503,
            content={
                "error": "Service temporarily unavailable",
                "service": service,
                "message": f"Circuit breaker is open for '{service}'. Try again later.",
            },
        )
    except (httpx.ConnectError, httpx.TimeoutException) as exc:
        return JSONResponse(
            status_code=503,
            content={
                "error": "Service unreachable",
                "service": service,
                "message": str(exc),
            },
        )


Instrumentator().instrument(app).expose(app)
