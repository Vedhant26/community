# TrapEye Community Shield

A community-powered phishing threat intelligence platform.

## Structure

```
comm_dash/
├── backend/          # FastAPI + SQLite
├── frontend_new/     # Next.js dashboard
└── frontend/         # Legacy Vite frontend
```

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m playwright install chromium
python migrate.py           # run once to set up DB columns
python -m uvicorn main:app --port 8000
```

### Frontend
```bash
cd frontend_new
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features
- 🛡️ Community threat reporting & voting
- 🔬 Dynamic URL Sandbox (Playwright headless)
- 📊 Full Threat Intelligence Reports
- 📱 QR code sharing with LAN-aware links
- 🔍 Threat search & filtering
