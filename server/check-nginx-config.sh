#!/bin/bash
# Nginx 설정 파일 확인 스크립트

echo "=== api.conf 설정 확인 ==="
sudo cat /etc/nginx/sites-available/api.conf

echo ""
echo "=== default 설정 확인 ==="
sudo cat /etc/nginx/sites-available/default

echo ""
echo "=== Nginx 설정 테스트 ==="
sudo nginx -t

echo ""
echo "=== 최근 에러 로그 ==="
sudo tail -20 /var/log/nginx/error.log
