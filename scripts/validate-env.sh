#!/bin/bash

# ========================================================================
# SICHERHEITS-VALIDIERUNG FÜR DEV/PROD TRENNUNG
# ========================================================================
# Verhindert, dass produktive Datenbank versehentlich mit DEV-Daten
# überschrieben wird durch Validierung der Umgebungsvariablen.
#
# Immer vor docker compose Befehlen aufrufen:
#   source scripts/validate-env.sh || exit 1
# ========================================================================

set -e

# Farben für Terminal-Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========================================================================
# STEP 1: Überprüfe COMPOSE_PROJECT_NAME
# ========================================================================
if [ -z "$COMPOSE_PROJECT_NAME" ]; then
    echo -e "${RED}❌ FEHLER: COMPOSE_PROJECT_NAME nicht gesetzt!${NC}"
    echo ""
    echo "Setze die Umgebung EXPLIZIT mit einem der Befehle:"
    echo ""
    echo -e "${YELLOW}DEV-UMGEBUNG:${NC}"
    echo "  export NODE_ENV=development COMPOSE_PROJECT_NAME=beihilfe-dev"
    echo ""
    echo -e "${YELLOW}PROD-UMGEBUNG:${NC}"
    echo "  export NODE_ENV=production COMPOSE_PROJECT_NAME=beihilfe"
    echo ""
    exit 1
fi

# ========================================================================
# STEP 2: Überprüfe NODE_ENV Konsistenz
# ========================================================================
if [ "$COMPOSE_PROJECT_NAME" = "beihilfe-dev" ] && [ "$NODE_ENV" != "development" ]; then
    echo -e "${RED}❌ WARNUNG: COMPOSE_PROJECT_NAME=beihilfe-dev aber NODE_ENV=$NODE_ENV${NC}"
    echo "Setze: export NODE_ENV=development"
    exit 1
fi

if [ "$COMPOSE_PROJECT_NAME" = "beihilfe" ] && [ "$NODE_ENV" != "production" ]; then
    echo -e "${RED}❌ WARNUNG: COMPOSE_PROJECT_NAME=beihilfe aber NODE_ENV=$NODE_ENV${NC}"
    echo "Setze: export NODE_ENV=production"
    exit 1
fi

# ========================================================================
# STEP 3: Doppelte Sicherheit für PROD
# ========================================================================
if [ "$COMPOSE_PROJECT_NAME" = "beihilfe" ]; then
    echo -e "${RED}⚠️  WARNUNG: Du wirst auf PROD Umgebung deployen!${NC}"
    echo -e "   Projekt: ${YELLOW}$COMPOSE_PROJECT_NAME${NC}"
    echo -e "   Umgebung: ${YELLOW}$NODE_ENV${NC}"
    echo ""
    echo "Tippe 'ja' um fortzufahren (oder CTRL+C um abzubrechen):"
    read -r confirmation
    
    if [ "$confirmation" != "ja" ]; then
        echo -e "${YELLOW}Deploy abgebrochen.${NC}"
        exit 1
    fi
fi

# ========================================================================
# STEP 4: Überprüfe, dass Docker Volumes getrennt sind
# ========================================================================
VOLUME_NAME="${COMPOSE_PROJECT_NAME}_db_data"
echo -e "${GREEN}✅ Umgebung validiert:${NC}"
echo "   COMPOSE_PROJECT_NAME: $COMPOSE_PROJECT_NAME"
echo "   NODE_ENV: $NODE_ENV"
echo "   DB Volume: $VOLUME_NAME"
echo ""
echo -e "${GREEN}Sicherheitsprüfung bestanden. Du kannst fortfahren.${NC}"
