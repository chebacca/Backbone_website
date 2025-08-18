# Backbone Edge Hub Deployment Guide

The Edge Hub enables offline network collaboration when the cloud licensing service is unreachable. Team members can create and work on projects locally, with automatic sync when cloud connectivity returns.

## Quick Start

1. **Copy configuration:**
   ```bash
   cp edge-config.example.env .env.local
   # Edit .env.local with your secure passwords
   ```

2. **Deploy Edge Hub:**
   ```bash
   docker-compose -f docker-compose.edge.yml up -d
   ```

3. **Verify deployment:**
   ```bash
   curl http://localhost:3001/api/health
   # Should return: {"status":"ok","mode":"edge"}
   ```

4. **Access services:**
   - Edge API: http://localhost:3001/api
   - MinIO Console: http://localhost:9001 (admin/adminadmin)
   - PostgreSQL: localhost:5432 (postgres/backbone_edge)

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│   Web/Desktop   │───▶│   Edge API   │───▶│ PostgreSQL  │
│     Clients     │    │  (port 3001) │    │ (metadata)  │
└─────────────────┘    └──────────────┘    └─────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │    MinIO     │
                       │ (datasets)   │
                       └──────────────┘
```

## Network Discovery

The Edge Hub broadcasts itself via mDNS as `_backbone-edge._tcp` for automatic client discovery. Clients will:

1. Try cloud API first
2. On failure, discover Edge Hub via mDNS
3. Switch to Edge mode automatically
4. Show "Edge Mode Active" banner

## Data Sync

When cloud connectivity returns:

- **Projects:** Metadata synced to cloud (conflict resolution: last-write-wins)
- **Datasets:** Objects uploaded to cloud storage (GCS/S3/Azure)
- **Team Members:** Assignments synchronized
- **Audit Log:** Edge operations logged for compliance

## Security

- **Authentication:** JWT tokens with configurable secret
- **Network:** Internal Docker network isolation
- **Storage:** Encrypted at rest (configure volume encryption)
- **Access:** Firewall port 3001 to LAN only

## Scaling

For larger teams:

```yaml
# docker-compose.edge.yml
edge-api:
  deploy:
    replicas: 3
  environment:
    - REDIS_URL=redis://redis:6379
```

## Monitoring

Health checks available at:
- Edge API: `GET /api/health`
- Database: `pg_isready`
- MinIO: `GET /minio/health/live`
- Redis: `redis-cli ping`

## Troubleshooting

**Edge Hub not discovered:**
```bash
# Check mDNS service
docker logs backbone-edge-mdns

# Manual discovery test
nslookup _backbone-edge._tcp.local
```

**Storage issues:**
```bash
# Check MinIO logs
docker logs backbone-edge-minio

# Verify bucket creation
mc alias set edge http://localhost:9000 admin adminadmin
mc ls edge/
```

**Database connection:**
```bash
# Connect to PostgreSQL
docker exec -it backbone-edge-db psql -U postgres -d backbone_edge
```

## Production Deployment

1. **Use external volumes:**
   ```yaml
   volumes:
     db_data:
       driver: local
       driver_opts:
         type: nfs
         o: addr=your-nas,rw
         device: ":/volume1/backbone-edge"
   ```

2. **Configure SSL:**
   ```yaml
   edge-api:
     environment:
       - SSL_CERT_PATH=/certs/cert.pem
       - SSL_KEY_PATH=/certs/key.pem
     volumes:
       - ./certs:/certs:ro
   ```

3. **Set resource limits:**
   ```yaml
   edge-api:
     deploy:
       resources:
         limits:
           memory: 2G
           cpus: '1.0'
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Database password | `backbone_edge` |
| `MINIO_ROOT_USER` | MinIO admin user | `admin` |
| `MINIO_ROOT_PASSWORD` | MinIO admin password | `adminadmin` |
| `JWT_SECRET` | JWT signing secret | Required |
| `ORGANIZATION_ID` | Edge organization ID | `org_edge_001` |
| `MAX_STORAGE_GB` | Storage limit | `100` |
| `SYNC_INTERVAL_MINUTES` | Cloud sync frequency | `15` |
