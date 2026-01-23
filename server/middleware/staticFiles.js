/**
 * 정적 파일 서빙 미들웨어
 */
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { NODE_ENV } from '../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 프로덕션 환경에서 정적 파일 서빙 설정
 * @param {Express} app - Express 앱 인스턴스
 */
export const setupStaticFiles = (app) => {
  if (NODE_ENV === 'production') {
    // dist 폴더 경로 (server 폴더의 상위 디렉토리의 dist)
    const distPath = join(__dirname, '../..', 'dist');
    
    // 정적 파일 서빙 (assets, vite.svg 등)
    app.use(express.static(distPath, {
      maxAge: '1y', // 캐시 설정
      etag: true,
    }));
    
    // SPA 라우팅을 위한 fallback: API가 아닌 모든 GET 요청은 index.html로
    app.get('*', (req, res, next) => {
      // API 경로는 제외
      if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        return next();
      }
      // 그 외 모든 요청은 index.html로
      res.sendFile(join(distPath, 'index.html'));
    });
  }
};
