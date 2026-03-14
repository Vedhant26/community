from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


class ThreatSubmission(BaseModel):
    url: str
    category: str = "unknown"  # phishing, fake_login, payment_scam, malware_link, unknown
    description: Optional[str] = None
    reporter_id: Optional[str] = "anonymous"


class ThreatResponse(BaseModel):
    threat_id: str
    original_url: str
    normalized_url: str
    domain: str
    category: str
    description: Optional[str]
    reporter_id: Optional[str]
    report_count: int
    confirmations: int
    false_positives: int
    status: str
    first_seen: datetime
    last_seen: datetime
    ip_address: Optional[str] = None
    country: Optional[str] = None
    risk_score: int = 0
    url_features_json: Optional[str] = None

    class Config:
        from_attributes = True


class ThreatListItem(BaseModel):
    threat_id: str
    domain: str
    category: str
    report_count: int
    confirmations: int
    false_positives: int
    status: str
    first_seen: datetime
    last_seen: datetime

    class Config:
        from_attributes = True


class SubmissionResult(BaseModel):
    threat_id: str
    domain: str
    status: str
    is_new: bool
    report_count: int
    message: str


class StatsResponse(BaseModel):
    total_threats: int
    confirmed: int
    pending: int
    false_positives: int
    total_reports: int
    top_domains: list


class VoteRequest(BaseModel):
    reporter_id: Optional[str] = "anonymous"
