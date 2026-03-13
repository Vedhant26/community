from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import engine, Base
from routers.threats import router as threats_router
from routers.sandbox import router as sandbox_router

# Create tables
Base.metadata.create_all(bind=engine)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="TrapEye Community Shield",
    description="Community-powered phishing threat intelligence API",
    version="1.0.0"
)

# Attach limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(threats_router)
app.include_router(sandbox_router)


@app.get("/")
def root():
    return {
        "name": "TrapEye Community Shield API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/api/local-ip")
def get_local_ip():
    """Return the machine's LAN IP so the QR modal can build a phone-scannable link."""
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
    except Exception:
        ip = "127.0.0.1"
    return {"ip": ip}
