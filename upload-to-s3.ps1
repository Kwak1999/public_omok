# S3 업로드 및 CloudFront 캐시 무효화 스크립트

# S3 버킷 이름 (실제 버킷 이름으로 변경하세요)
$BUCKET_NAME = "strategia-mok.store"  # 또는 실제 S3 버킷 이름

# CloudFront 배포 ID
$DISTRIBUTION_ID = "E4ZE7GJRSKNBS"

Write-Host "=== S3에 업로드 중... ===" -ForegroundColor Green
aws s3 sync dist/ s3://$BUCKET_NAME --delete

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ S3 업로드 완료!" -ForegroundColor Green
    
    Write-Host "`n=== CloudFront 캐시 무효화 중... ===" -ForegroundColor Green
    aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 캐시 무효화 요청 완료!" -ForegroundColor Green
        Write-Host "`n2-5분 후 https://strategia-mok.store 에서 확인하세요." -ForegroundColor Yellow
    } else {
        Write-Host "✗ 캐시 무효화 실패" -ForegroundColor Red
    }
} else {
    Write-Host "✗ S3 업로드 실패" -ForegroundColor Red
}
