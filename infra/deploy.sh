#!/usr/bin/env bash
# Publica o Plante Vagas na EC2 (AWS us-east-2).
#   ./infra/deploy.sh          -> build do front, envia tudo e sobe/atualiza os containers
#   ./infra/deploy.sh ssh      -> abre um terminal na maquina
set -euo pipefail

IP="${IP:-3.18.93.212}"
KEY="${KEY:-$HOME/.ssh/plante-vagas-aws.pem}"
DOMAIN="$(echo "$IP" | tr . -).sslip.io"   # padrao; o que vale e o SITE_DOMAIN do .env
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE="$ROOT/infra/.state"
SSH=(ssh -i "$KEY" -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=20 "ubuntu@$IP")

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
rand() { openssl rand -hex 24; }
retry() { for i in 1 2 3; do "$@" && return; echo "falhou, tentando de novo ($i/3)..."; sleep 5; done; return 1; }

[ "${1:-}" = ssh ] && exec "${SSH[@]}"

# .env com os segredos: gerado uma vez e reaproveitado (infra/.state esta no .gitignore)
mkdir -p "$STATE" && chmod 700 "$STATE"
if [ ! -f "$STATE/.env" ]; then
  openai="$(grep -E '^OPENAI_API_KEY=' "$ROOT/server/.env" | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')"
  cat > "$STATE/.env" <<EOF
SITE_DOMAIN=$DOMAIN
N8N_DOMAIN=n8n.$DOMAIN
EVOLUTION_DOMAIN=evo.$DOMAIN
POSTGRES_USER=plantevagas
POSTGRES_PASSWORD=$(rand)
JWT_SECRET=$(rand)
OPENAI_API_KEY=$openai
N8N_ENCRYPTION_KEY=$(rand)
EVOLUTION_API_KEY=$(rand)
EOF
  chmod 600 "$STATE/.env"
fi
DOMAIN="$(grep -E '^SITE_DOMAIN=' "$STATE/.env" | cut -d= -f2)"

log "Build do front (API em https://$DOMAIN/api)"
(cd "$ROOT/client" && VITE_API_URL="https://$DOMAIN/api" npm run build)

log "Aguardando Docker na maquina"
"${SSH[@]}" 'cloud-init status --wait >/dev/null; sudo systemctl is-active --quiet docker; mkdir -p ~/app'

log "Enviando arquivos"
RSYNC=(retry rsync -az --partial --delete -e "ssh -i $KEY -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=20")
"${RSYNC[@]}" "$ROOT/infra/docker-compose.yml" "$ROOT/infra/Caddyfile" "$ROOT/infra/init-db.sql" \
  "$STATE/.env" "ubuntu@$IP:~/app/"
"${RSYNC[@]}" --exclude node_modules --exclude dist --exclude generated --exclude .env \
  --exclude coverage --exclude 'uScmpUNS*' "$ROOT/server/" "ubuntu@$IP:~/app/server/"
"${RSYNC[@]}" "$ROOT/client/dist/" "ubuntu@$IP:~/app/site/"

log "Subindo containers (o primeiro build da API leva alguns minutos)"
"${SSH[@]}" 'cd ~/app && sudo docker compose build -q api migrate && sudo docker compose up -d --remove-orphans \
  && sudo docker compose run --rm migrate && sudo docker image prune -f >/dev/null'

echo
echo "Site:      https://$DOMAIN"
echo "n8n:       https://$(grep -E '^N8N_DOMAIN=' "$STATE/.env" | cut -d= -f2)"
echo "Evolution: https://$(grep -E '^EVOLUTION_DOMAIN=' "$STATE/.env" | cut -d= -f2)  (apikey: EVOLUTION_API_KEY em infra/.state/.env)"
