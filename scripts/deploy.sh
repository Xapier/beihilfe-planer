#!/bin/bash

# ========================================================================
# DEPLOYMENT SCRIPT MIT SICHERHEIT
# ========================================================================
# Verwendet validate-env.sh um zu verhindern, dass PROD-Daten gelöscht werden
#
# Verwendung:
#   ./scripts/deploy-dev.sh   # Sicheres DEV Deploy
#   ./scripts/deploy-prod.sh  # Sicheres PROD Deploy mit Bestätigung
# ========================================================================

set -e

# Farbcodes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Bestimme die Zielumgebung
TARGET_ENV="${1:-production}"  # Default: production

case "$TARGET_ENV" in
    dev|development)
        export NODE_ENV=development
        export COMPOSE_PROJECT_NAME=beihilfe-dev
        PORT="DEV auf 192.168.188.71"
        ;;
    prod|production)
        export NODE_ENV=production
        export COMPOSE_PROJECT_NAME=beihilfe
        PORT="PROD auf 192.168.188.61"
        ;;
    *)
        echo "Unbekannte Umgebung: $TARGET_ENV"
        echo "Verwende: dev oder prod"
        exit 1
        ;;
esac

# ========================================================================
# STEP 1: Validiere Umgebung
# ========================================================================
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Validiere Umgebungskonfiguration...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"

# Sourcde validation script
if [ -f "scripts/validate-env.sh" ]; then
    source scripts/validate-env.sh || {
        echo -e "${RED}❌ Umgebungsvalidierung fehlgeschlagen!${NC}"
        exit 1
    }
else
    echo -e "${RED}❌ validate-env.sh nicht gefunden!${NC}"
    exit 1
fi

# ========================================================================
# STEP 2: Vor dem Deploy prüfen
# ========================================================================
echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Deployment-Details:${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "Ziel: ${YELLOW}$PORT${NC}"
echo -e "Projekt: ${YELLOW}$COMPOSE_PROJECT_NAME${NC}"
echo -e "Umgebung: ${YELLOW}$NODE_ENV${NC}"

# ========================================================================
# STEP 3: Git Check
# ========================================================================
if git status --porcelain | grep -q .; then
    echo ""
    echo -e "${YELLOW}⚠️  Warnung: Es gibt unversicherte Änderungen!${NC}"
    git status --short
    echo ""
    read -p "Möchtest du fortfahren? (ja/nein): " -r response
    if [ "$response" != "ja" ]; then
        echo "Abgebrochen."
        exit 1
    fi
fi

# ========================================================================
# STEP 4: Container Management
# ========================================================================
echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Stoppe alte Container...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"

docker compose down 2>/dev/null || true

echo -e "${BLUE}Baue neue Images...${NC}"
docker compose up -d --build

# ========================================================================
# STEP 5: Verifizierung
# ========================================================================
echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Verifiziere Container Status...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"

docker compose ps

echo ""
echo -e "${GREEN}✅ Deploy erfolgreich abgeschlossen!${NC}"
echo -e "Zugang: ${YELLOW}http://$PORT${NC}"
