#!/bin/bash
# Nginx 설정 파일 진단 스크립트

echo "=== Nginx 설정 파일 확인 ==="
echo ""
echo "1. 활성화된 사이트 설정 파일:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "2. 사용 가능한 사이트 설정 파일:"
ls -la /etc/nginx/sites-available/

echo ""
echo "3. Nginx 메인 설정 파일:"
cat /etc/nginx/nginx.conf | grep -E "include|sites-enabled"

echo ""
echo "4. 활성화된 설정 파일 내용 (443 포트):"
for file in /etc/nginx/sites-enabled/*; do
    if [ -f "$file" ]; then
        echo "--- $file ---"
        grep -A 10 "listen 443" "$file" || echo "포트 443 설정 없음"
        echo ""
    fi
done

echo ""
echo "5. Nginx 설정 테스트:"
sudo nginx -t

echo ""
echo "6. Nginx 에러 로그 (최근 20줄):"
sudo tail -20 /var/log/nginx/error.log
