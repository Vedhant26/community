from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timezone
from typing import Optional

from database import get_db
from models import ThreatReport, ReportLog
from schemas import (
    ThreatSubmission, ThreatResponse, ThreatListItem,
    SubmissionResult, StatsResponse, VoteRequest
)
from utils import normalize_url, extract_domain, generate_threat_id, is_trusted_domain, generate_qr_code, extract_url_features, enrich_threat_intel
import json

router = APIRouter(prefix="/api", tags=["threats"])


@router.post("/threats", response_model=SubmissionResult)
def submit_threat(submission: ThreatSubmission, db: Session = Depends(get_db)):
    """Submit a suspicious URL report."""
    # Validate category
    valid_categories = ["phishing", "fake_login", "payment_scam", "malware_link", "unknown"]
    if submission.category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {valid_categories}")

    # Normalize and extract
    normalized = normalize_url(submission.url)
    domain = extract_domain(submission.url)

    # Block trusted domains
    if is_trusted_domain(domain):
        raise HTTPException(status_code=400, detail=f"Domain '{domain}' is a trusted domain and cannot be reported.")

    threat_id = generate_threat_id(normalized)

    # Check for duplicate
    existing = db.query(ThreatReport).filter(ThreatReport.normalized_url == normalized).first()

    if existing:
        # Update existing
        existing.report_count += 1
        existing.last_seen = datetime.now(timezone.utc)
        if submission.description:
            existing.description = submission.description

        # Log the report
        log = ReportLog(
            threat_id=existing.threat_id,
            reporter_id=submission.reporter_id or "anonymous",
            action="report"
        )
        db.add(log)
        db.commit()
        db.refresh(existing)

        return SubmissionResult(
            threat_id=existing.threat_id,
            domain=existing.domain,
            status=existing.status,
            is_new=False,
            report_count=existing.report_count,
            message=f"This URL has been reported before. Report count updated to {existing.report_count}."
        )

    # Enrich with URL features and geo intel
    features = extract_url_features(submission.url)
    intel = enrich_threat_intel(domain)

    # Create new threat
    threat = ThreatReport(
        threat_id=threat_id,
        original_url=submission.url,
        normalized_url=normalized,
        domain=domain,
        category=submission.category,
        description=submission.description,
        reporter_id=submission.reporter_id or "anonymous",
        ip_address=intel.get("ip_address"),
        country=intel.get("country"),
        risk_score=features.get("risk_score", 0),
        url_features_json=json.dumps(features),
    )
    db.add(threat)

    # Log the report
    log = ReportLog(
        threat_id=threat_id,
        reporter_id=submission.reporter_id or "anonymous",
        action="report"
    )
    db.add(log)
    db.commit()
    db.refresh(threat)

    return SubmissionResult(
        threat_id=threat.threat_id,
        domain=threat.domain,
        status=threat.status,
        is_new=True,
        report_count=threat.report_count,
        message="New threat report created successfully."
    )


@router.get("/threats", response_model=list[ThreatListItem])
def list_threats(
    category: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: Optional[str] = Query("latest", regex="^(latest|most_reported|oldest)$"),
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """List all threats with optional filters."""
    query = db.query(ThreatReport)

    if category:
        query = query.filter(ThreatReport.category == category)
    if status:
        query = query.filter(ThreatReport.status == status)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (ThreatReport.domain.ilike(search_term)) |
            (ThreatReport.original_url.ilike(search_term)) |
            (ThreatReport.threat_id.ilike(search_term))
        )

    if sort_by == "most_reported":
        query = query.order_by(desc(ThreatReport.report_count))
    elif sort_by == "oldest":
        query = query.order_by(ThreatReport.first_seen)
    else:  # latest
        query = query.order_by(desc(ThreatReport.first_seen))

    threats = query.offset(offset).limit(limit).all()
    return threats


@router.get("/threats/search")
def search_threats(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    """Search threats by URL, domain, or threat ID."""
    search_term = f"%{q}%"
    threats = db.query(ThreatReport).filter(
        (ThreatReport.domain.ilike(search_term)) |
        (ThreatReport.original_url.ilike(search_term)) |
        (ThreatReport.threat_id.ilike(search_term))
    ).order_by(desc(ThreatReport.report_count)).limit(50).all()

    return [ThreatListItem.model_validate(t) for t in threats]


@router.get("/threats/{threat_id}", response_model=ThreatResponse)
def get_threat(threat_id: str, db: Session = Depends(get_db)):
    """Get detailed threat information."""
    threat = db.query(ThreatReport).filter(ThreatReport.threat_id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found.")
    return threat


@router.get("/threats/{threat_id}/qr")
def get_threat_qr(
    threat_id: str,
    base_url: Optional[str] = Query("https://trapeye.app"),
    db: Session = Depends(get_db)
):
    """Generate QR code linking directly to the threat report page."""
    threat = db.query(ThreatReport).filter(ThreatReport.threat_id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found.")

    base = base_url.rstrip('/') if base_url else "https://trapeye.app"
    # Always route to the dedicated threat-report page
    qr_url = f"{base}/threat-report/{threat_id}"
    qr_base64 = generate_qr_code(qr_url)
    return {"qr_code": qr_base64, "url": qr_url}


@router.post("/threats/{threat_id}/confirm")
def confirm_threat(threat_id: str, vote: VoteRequest, db: Session = Depends(get_db)):
    """Confirm a threat as phishing."""
    threat = db.query(ThreatReport).filter(ThreatReport.threat_id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found.")

    threat.confirmations += 1

    # Auto-update status
    if threat.confirmations > threat.false_positives:
        threat.status = "confirmed"

    log = ReportLog(
        threat_id=threat_id,
        reporter_id=vote.reporter_id or "anonymous",
        action="confirm"
    )
    db.add(log)
    db.commit()
    db.refresh(threat)

    return {
        "message": "Threat confirmed.",
        "status": threat.status,
        "confirmations": threat.confirmations,
        "false_positives": threat.false_positives
    }


@router.post("/threats/{threat_id}/mark-safe")
def mark_safe(threat_id: str, vote: VoteRequest, db: Session = Depends(get_db)):
    """Mark a threat as safe (false positive)."""
    threat = db.query(ThreatReport).filter(ThreatReport.threat_id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found.")

    threat.false_positives += 1

    # Auto-update status
    if threat.false_positives > threat.confirmations:
        threat.status = "false_positive"
    elif threat.confirmations > threat.false_positives:
        threat.status = "confirmed"
    else:
        threat.status = "pending"

    log = ReportLog(
        threat_id=threat_id,
        reporter_id=vote.reporter_id or "anonymous",
        action="mark_safe"
    )
    db.add(log)
    db.commit()
    db.refresh(threat)

    return {
        "message": "Marked as safe.",
        "status": threat.status,
        "confirmations": threat.confirmations,
        "false_positives": threat.false_positives
    }


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    total = db.query(func.count(ThreatReport.threat_id)).scalar() or 0
    confirmed = db.query(func.count(ThreatReport.threat_id)).filter(ThreatReport.status == "confirmed").scalar() or 0
    pending = db.query(func.count(ThreatReport.threat_id)).filter(ThreatReport.status == "pending").scalar() or 0
    fp = db.query(func.count(ThreatReport.threat_id)).filter(ThreatReport.status == "false_positive").scalar() or 0
    total_reports = db.query(func.sum(ThreatReport.report_count)).scalar() or 0

    # Top domains
    top_domains = db.query(
        ThreatReport.domain,
        func.count(ThreatReport.threat_id).label("count")
    ).group_by(ThreatReport.domain).order_by(desc("count")).limit(5).all()

    return StatsResponse(
        total_threats=total,
        confirmed=confirmed,
        pending=pending,
        false_positives=fp,
        total_reports=total_reports,
        top_domains=[{"domain": d, "count": c} for d, c in top_domains]
    )
