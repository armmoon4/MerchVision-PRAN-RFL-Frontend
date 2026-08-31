# MerchVision — Retail Recognition Frontend

This frontend connects directly to your backend API (FastAPI) to submit store rack photos, poll task status, and display recognized SKU items, bounding boxes, and inventory analytics.

## Backend Connection

All data and recognition results are fetched directly from your backend API:
- **Default Backend URL:** `http://localhost:8000`
- Configurable in the top bar UI ("Backend API" settings button) or via `.env` (`VITE_API_BASE_URL`).

### Key Endpoints Used:
- `GET /health` — Liveness and status check
- `POST /uploads` — Uploads rack image (`multipart/form-data`) and returns `{ upload_id, status: "PENDING" }`
- `GET /uploads/:upload_id` — Polls recognition result (`detected_products`, `bbox`, `quantity_visible`)
- `GET /uploads/summary` — Analytics dashboard metrics
- `GET /uploads` — Historical scan logs (with search/filter/pagination)
- `DELETE /uploads/:upload_id` — Delete scan record

## Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite Dev Server (port 3000)
npm run dev
```

