#!/bin/bash
# 403 오류 해결 스크립트

echo "=== 1. dist 폴더 존재 확인 ==="
ls -la /root/omok/public_omok/dist/

echo ""
echo "=== 2. dist/assets 폴더 확인 ==="
ls -la /root/omok/public_omok/dist/assets/ 2>/dev/null || echo "assets 폴더 없음"

echo ""
echo "=== 3. 파일 권한 확인 ==="
ls -la /root/omok/public_omok/dist/ | head -10

echo ""
echo "=== 4. Nginx 설정에서 경로 확인 ==="
sudo grep -A 3 "location /assets" /etc/nginx/sites-available/api.conf

echo ""
echo "=== 5. 실제 파일 경로 테스트 ==="
curl -I http://localhost:3001/assets/index-BKrDYAXV.js 2>&1 | head -10

echo ""
echo "=== 6. Express 서버 로그 확인 ==="
# PM2 로그 확인
pm2 logs --lines 20 --nostream | grep -i "403\|error\|permission" || echo "최근 로그에 403 없음"
