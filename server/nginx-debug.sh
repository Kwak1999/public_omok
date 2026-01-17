#!/bin/bash
# Nginx HTTPS 연결 문제 진단 스크립트

echo "=== 1. HTTPS 연결 테스트 ==="
curl -v https://api.strategia-mok.store 2>&1 | head -30

echo ""
echo "=== 2. 포트 443 리스닝 확인 ==="
sudo ss -tlnp | grep 443

echo ""
echo "=== 3. Nginx 에러 로그 (최근 30줄) ==="
sudo tail -30 /var/log/nginx/error.log

echo ""
echo "=== 4. api.conf 파일 확인 (HTTPS 부분) ==="
sudo grep -A 10 "listen 443" /etc/nginx/sites-available/api.conf

echo ""
echo "=== 5. default 파일 확인 (HTTPS 부분) ==="
sudo grep -A 10 "listen 443" /etc/nginx/sites-available/default

echo ""
echo "=== 6. 활성화된 설정 파일 확인 ==="
sudo nginx -T 2>&1 | grep -A 20 "server_name api.strategia-mok.store" | head -40

echo ""
echo "=== 7. 방화벽 상태 확인 ==="
sudo ufw status | grep 443 || echo "UFW 비활성화 또는 포트 443 규칙 없음"

echo ""
echo "=== 8. 로컬에서 HTTPS 테스트 ==="
curl -k -v https://127.0.0.1 2>&1 | head -20
