import hashlib
import io
import base64
import json
import math
import socket
import re
from urllib.parse import urlparse, urlunparse
import qrcode


TRUSTED_DOMAINS = {
    "google.com", "www.google.com",
    "microsoft.com", "www.microsoft.com",
    "apple.com", "www.apple.com",
    "github.com", "www.github.com",
    "stackoverflow.com", "www.stackoverflow.com",
    "wikipedia.org", "www.wikipedia.org",
    "amazon.com", "www.amazon.com",
}

SUSPICIOUS_KEYWORDS = [
    "login", "signin", "verify", "secure", "account", "update", "confirm",
    "bank", "paypal", "paytm", "wallet", "password", "credential", "free",
    "lucky", "winner", "prize", "click", "urgent", "alert", "suspended"
]

RISKY_TLDS = {".xyz", ".top", ".click", ".tk", ".ml", ".ga", ".cf", ".gq", ".pw", ".cc"}


def normalize_url(url: str) -> str:
    """Normalize a URL for consistent comparison."""
    url = url.strip().lower()
    if not url.startswith(("http://", "https://")):
        url = "http://" + url
    parsed = urlparse(url)
    path = parsed.path.rstrip("/") or "/"
    normalized = urlunparse((
        parsed.scheme,
        parsed.netloc,
        path,
        parsed.params,
        parsed.query,
        ""
    ))
    return normalized


def extract_domain(url: str) -> str:
    """Extract domain from a URL."""
    if not url.startswith(("http://", "https://")):
        url = "http://" + url
    parsed = urlparse(url)
    return parsed.netloc or parsed.path.split("/")[0]


def generate_threat_id(normalized_url: str) -> str:
    """Generate a unique threat ID using SHA256."""
    hash_hex = hashlib.sha256(normalized_url.encode()).hexdigest()
    short_hash = hash_hex[:8].upper()
    return f"TE-{short_hash}"


def is_trusted_domain(domain: str) -> bool:
    """Check if a domain is in the trusted list."""
    return domain.lower() in TRUSTED_DOMAINS


def _url_entropy(url: str) -> float:
    """Compute Shannon entropy of the URL string."""
    if not url:
        return 0.0
    freq = {}
    for c in url:
        freq[c] = freq.get(c, 0) + 1
    length = len(url)
    return round(-sum((f / length) * math.log2(f / length) for f in freq.values()), 2)


def extract_url_features(url: str) -> dict:
    """Extract ML-style heuristic features from a URL."""
    if not url.startswith(("http://", "https://")):
        url = "http://" + url
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    path = parsed.path
    full_url = url

    subdomains = domain.split(".")
    num_subdomains = max(0, len(subdomains) - 2)
    tld = "." + subdomains[-1] if subdomains else ""

    special_chars = len(re.findall(r"[@\-_~%=&?#!]", full_url))
    digits_in_domain = len(re.findall(r"\d", domain))

    found_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in full_url.lower()]

    entropy = _url_entropy(full_url)
    entropy_level = "Low" if entropy < 3.5 else "Medium" if entropy < 4.5 else "High"

    uses_https = parsed.scheme == "https"
    has_at_symbol = "@" in full_url
    has_ip_in_domain = bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain))
    tld_risky = tld in RISKY_TLDS
    path_depth = len([p for p in path.split("/") if p])

    risk_score = 0
    if has_at_symbol: risk_score += 20
    if has_ip_in_domain: risk_score += 25
    if tld_risky: risk_score += 20
    if not uses_https: risk_score += 10
    if found_keywords: risk_score += min(len(found_keywords) * 5, 20)
    if num_subdomains >= 3: risk_score += 10
    if entropy > 4.5: risk_score += 10
    if digits_in_domain > 3: risk_score += 5
    risk_score = min(risk_score, 100)

    return {
        "url_length": len(full_url),
        "num_subdomains": num_subdomains,
        "has_at_symbol": has_at_symbol,
        "has_ip_in_domain": has_ip_in_domain,
        "special_characters": special_chars,
        "digits_in_domain": digits_in_domain,
        "uses_https": uses_https,
        "tld": tld,
        "tld_risky": tld_risky,
        "path_depth": path_depth,
        "suspicious_keywords": found_keywords,
        "entropy_score": entropy,
        "entropy_level": entropy_level,
        "risk_score": risk_score,
    }


def enrich_threat_intel(domain: str) -> dict:
    """Attempt to resolve IP and do a free geo lookup. Best-effort, never raises."""
    ip_address = None
    country = None
    try:
        ip_address = socket.gethostbyname(domain)
    except Exception:
        pass
    if ip_address:
        try:
            import urllib.request
            with urllib.request.urlopen(
                f"http://ip-api.com/json/{ip_address}?fields=country,status", timeout=4
            ) as resp:
                data = json.loads(resp.read().decode())
                if data.get("status") == "success":
                    country = data.get("country")
        except Exception:
            pass
    return {"ip_address": ip_address, "country": country}


def generate_qr_code(data: str) -> str:
    """Generate a QR code and return as base64 encoded PNG."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#00d4ff", back_color="#0a0f1c")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
