# Backend Deployment Notes

Required environment variables:

- `MONGO_URI` - MongoDB connection string
- `PORT` - Port to listen on (Render will set this)
- `JWT_SECRET` - Secret for signing JWTs
- `HF_TOKEN` - HuggingFace API token (if using AI features)
- `CLIENT_ORIGIN` - Comma-separated allowed frontend origin(s). Example: https://app.example.com, http://localhost:5173

Notes:
- Server mounts app routes at both `/api/*` and `/*` so `/auth/me` and `/api/auth/me` will both work.
- Ensure `CLIENT_ORIGIN` includes your frontend host when deploying to Render or Vercel.
- In production, the server will attempt to serve a built frontend from `../frontend/dist` if present.
