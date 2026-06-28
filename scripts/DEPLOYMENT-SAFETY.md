# 🔒 Deployment-Sicherheit

## KRITISCH: DEV/PROD Trennung

Nach dem Datenverlust-Incident wurden folgende Schutzmaßnahmen implementiert:

### 1. **Volume-Trennung durch COMPOSE_PROJECT_NAME**

Die Docker-compose.yml nutzt jetzt `${COMPOSE_PROJECT_NAME}` im Volume-Namen:

```bash
# DEV: beihilfe-dev_db_data
# PROD: beihilfe_db_data
```

**Das bedeutet:** Wenn Du die falsche `COMPOSE_PROJECT_NAME` verwendest, wird eine NEUE (leere) Datenbank erstellt - nicht die PROD-Datenbank überschrieben.

### 2. **Umgebungs-Validierungs-Script**

`scripts/validate-env.sh` prüft vor jedem Deploy:
- ✅ `COMPOSE_PROJECT_NAME` ist gesetzt
- ✅ `NODE_ENV` entspricht der Umgebung
- ✅ Bei PROD wird eine Bestätigung verlangt

Immer verwenden mit:
```bash
source scripts/validate-env.sh || exit 1
```

### 3. **Sichere Deployment-Befehle**

#### ✅ Korrekt:
```bash
# DEV
export NODE_ENV=development
export COMPOSE_PROJECT_NAME=beihilfe-dev
docker compose up -d --build

# PROD
export NODE_ENV=production
export COMPOSE_PROJECT_NAME=beihilfe
docker compose up -d --build
```

#### ❌ Falsch (NIEMALS):
```bash
# Fehlerhaft - überschreibt versehentlich PROD!
docker compose up -d --build
# (ohne COMPOSE_PROJECT_NAME Kontext)

# Fehlerhaft - Mix aus DEV und PROD
NODE_ENV=development COMPOSE_PROJECT_NAME=beihilfe docker compose up
```

### 4. **Bash-Aliases für sichere Befehle** (Optional)

Erstelle in `~/.zshrc` oder `~/.bash_profile`:

```bash
# DEV Deployment
alias deploy-dev='cd /opt/beihilfe-planer && \
  source scripts/validate-env.sh && \
  NODE_ENV=development COMPOSE_PROJECT_NAME=beihilfe-dev docker compose up -d --build'

# PROD Deployment
alias deploy-prod='cd /opt/beihilfe-planer && \
  source scripts/validate-env.sh && \
  NODE_ENV=production COMPOSE_PROJECT_NAME=beihilfe docker compose up -d --build'
```

### 5. **Backup-Strategie**

Regelmäßig Backups der PROD-Datenbank erstellen:

```bash
# Auf PROD-LXC (.61):
mkdir -p /backups
docker cp beihilfe-backend:/data/beihilfe.db /backups/beihilfe_$(date +%Y%m%d_%H%M%S).db.backup

# Oder via Volume:
docker run --rm -v beihilfe_db_data:/data -v /backups:/backup \
  alpine tar czf /backup/db_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

### 6. **Im Notfall: Datenbank wiederherstellen**

```bash
# 1. Container stoppen
docker compose down

# 2. Altes Volume finden
docker volume ls | grep beihilfe

# 3. Backup-Datei kopieren
docker run --rm -v beihilfe_db_data:/data -v /backups:/backup \
  alpine cp /backup/beihilfe_backup.db /data/beihilfe.db

# 4. Container starten
docker compose up -d
```

## Checklist für Deployment

- [ ] Bin ich auf der richtigen LXC? (`ssh root@192.168.188.71` oder `.61`)
- [ ] Ist `COMPOSE_PROJECT_NAME` richtig gesetzt? (`echo $COMPOSE_PROJECT_NAME`)
- [ ] Ist `NODE_ENV` richtig gesetzt? (`echo $NODE_ENV`)
- [ ] Habe ich `validate-env.sh` ausgeführt?
- [ ] Sind alle Änderungen committiert? (`git status`)
- [ ] Bin ich mir sicher, dass ich DIESE Umgebung deployen will?

## Weitere Ressourcen

- [docker-compose.yml](../docker-compose.yml) - Volume-Konfiguration
- [.env.example](../.env.example) - Umgebungs-Template
- [scripts/validate-env.sh](./validate-env.sh) - Validierungs-Script
- [scripts/deploy.sh](./deploy.sh) - Deploy-Script mit Sicherheit
