/**
 * 환경 변수 관리
 */

/**
 * 서버 포트
 * @type {number}
 */
export const PORT = process.env.PORT || 3001;

/**
 * Node 환경 (development | production)
 * @type {string}
 */
export const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * 데이터베이스 리셋 여부
 * @type {boolean}
 */
export const RESET_DB_ON_START = process.env.RESET_DB_ON_START !== 'false';

/**
 * CORS Origin 설정
 * @type {string|string[]}
 */
export const CORS_ORIGIN = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : '*';
