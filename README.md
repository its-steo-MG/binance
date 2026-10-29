# Binance Clone — Next.js PWA

Separate frontend for the TradeRiser Django backend (`binance` app).

```
npm install
cp .env.example .env.local   # optional, defaults to the live backend
npm run dev
```

Backend endpoints used (JWT, `Authorization: Bearer`):
- `POST /accounts/login/`, `POST /accounts/token/refresh/`
- `GET /binance/home/`, `/binance/wallets/`, `/binance/transactions/?wallet_id=`
- `GET /binance/notifications/`, `POST /binance/notifications/<id>/read/`

If your Django project mounts the binance urls under a different prefix, set
`NEXT_PUBLIC_BINANCE_PREFIX` (default `/binance`).

Live coin prices come from Binance's public market API; KES conversion uses a
public USD→KES rate. Install: open in Chrome/Safari → "Add to Home Screen".
