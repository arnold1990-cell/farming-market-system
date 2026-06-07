# AWS Deployment Checklist

## EC2 Host

- Provision Ubuntu EC2 instance
- Install Java 21
- Install Nginx
- Install PostgreSQL locally or provision RDS
- Create `/opt/pula-harvest/backend`
- Create `/var/www/farming-market`

## Backend

- Copy built JAR to `/opt/pula-harvest/backend`
- Copy production `.env` to `/opt/pula-harvest/backend/.env`
- Install [backend.service](./backend.service) to `/etc/systemd/system/pula-harvest-backend.service`
- Run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pula-harvest-backend
sudo systemctl restart pula-harvest-backend
sudo systemctl status pula-harvest-backend
```

## Frontend

- Set `VITE_API_BASE_URL` in production env
- Run `npm install && npm run build` in `frontend`
- Copy `frontend/dist/*` to `/var/www/farming-market`

## Nginx

- Install [nginx-pula-harvest.conf](./nginx-pula-harvest.conf) to `/etc/nginx/sites-available/pula-harvest`
- Enable the site
- Test config:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Validation

- `curl http://YOUR_DOMAIN_OR_IP/api/health`
- Open homepage and verify public products load
- Login as buyer/farmer/admin
- Verify a protected endpoint rejects anonymous access
- Verify uploaded product images load through `/uploads/...`

## Later Hardening

- Add TLS with Let's Encrypt
- Move PostgreSQL to RDS
- Replace JPA schema auto-update with Flyway migrations
- Add application metrics and centralized logs
