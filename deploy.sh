#!/bin/bash
# Stockly production deploy skripti
# Ishlatish: serverda loyiha papkasida ./deploy.sh
set -e
cd "$(dirname "$0")"

echo "==> 1/5 Yangi kodni olish..."
git fetch origin main
git merge --ff-only origin/main

echo "==> 2/5 Docker image build qilish..."
docker compose -f docker-compose.prod.yml build

echo "==> 3/5 Konteynerlarni yangilash..."
docker compose -f docker-compose.prod.yml up -d

echo "==> 4/5 Baked assets'ni nginx uchun host papkaga chiqarish..."
# nginx statikani host papkadan beradi, assets esa php image ichida "baked" —
# shu qadam bo'lmasa yangi JS/CSS fayllar 404 bo'ladi
sleep 3
docker cp stockly_php:/var/www/public/build/. ./public/build/

echo "==> 5/5 Tekshirish..."
sleep 2
ASSET=$(curl -s http://localhost/login | grep -o 'build/assets/app-[^"]*\.js' | head -1)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/$ASSET")
if [ "$STATUS" = "200" ]; then
    echo "✅ Deploy muvaffaqiyatli: sahifa va assets ishlayapti (migratsiyalar entrypoint'da avtomatik o'tadi)"
else
    echo "⚠️  Diqqat: asset $ASSET holati HTTP $STATUS — tekshirish kerak!"
    exit 1
fi
