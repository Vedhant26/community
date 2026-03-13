from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class ThreatReport(Base):
    __tablename__ = "threat_reports"

    threat_id = Column(String(12), primary_key=True, index=True)
    original_url = Column(Text, nullable=False)
    normalized_url = Column(Text, nullable=False, unique=True, index=True)
    domain = Column(String(255), nullable=False, index=True)
    category = Column(String(50), nullable=False, default="unknown")
    description = Column(Text, nullable=True)
    reporter_id = Column(String(100), nullable=True, default="anonymous")
    report_count = Column(Integer, default=1)
    confirmations = Column(Integer, default=0)
    false_positives = Column(Integer, default=0)
    status = Column(String(20), default="pending")  # pending, confirmed, false_positive
    first_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ip_address = Column(String(50), nullable=True)
    country = Column(String(50), nullable=True)
    risk_score = Column(Integer, default=0)
    url_features_json = Column(Text, nullable=True)

    logs = relationship("ReportLog", back_populates="threat", cascade="all, delete-orphan")


class ReportLog(Base):
    __tablename__ = "report_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    threat_id = Column(String(12), ForeignKey("threat_reports.threat_id"), nullable=False)
    reporter_id = Column(String(100), nullable=True, default="anonymous")
    action = Column(String(20), nullable=False)  # report, confirm, mark_safe
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    threat = relationship("ThreatReport", back_populates="logs")
