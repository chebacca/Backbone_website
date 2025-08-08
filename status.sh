#!/bin/bash

# Status script for Dashboard v14 Licensing Website

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Dashboard v14 Licensing Website Status ===${NC}"
echo

# Check backend
echo -e "${BLUE}Backend (Port 3003):${NC}"
if curl -s http://localhost:3003/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
    echo "Health: $(curl -s http://localhost:3003/health | jq -r '.status' 2>/dev/null || echo 'OK')"
else
    echo -e "${RED}❌ Not running${NC}"
fi

echo

# Check frontend
echo -e "${BLUE}Frontend (Port 3002):${NC}"
if curl -s -I http://localhost:3002 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
fi

echo
echo -e "${BLUE}=== Access URLs ===${NC}"
echo "Frontend: http://localhost:3002"
echo "Backend API: http://localhost:3003"
echo "Health Check: http://localhost:3003/health"
