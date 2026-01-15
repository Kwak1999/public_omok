/**
 * 게스트 인증 유틸리티
 * 게스트 ID는 24시간 동안 유지되며, 페이지 종료 시 삭제됩니다.
 */

const GUEST_ID_KEY = 'omok_guest_id';
const GUEST_ID_EXPIRY_HOURS = 24;

/**
 * 게스트 ID 생성
 * @returns {string} 게스트 ID
 */
export function generateGuestId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `guest_${timestamp}_${random}`;
}

/**
 * 게스트 ID 저장
 * @param {string} guestId - 저장할 게스트 ID
 */
export function saveGuestId(guestId) {
  const now = Date.now();
  const expiresAt = now + (GUEST_ID_EXPIRY_HOURS * 60 * 60 * 1000);
  
  const guestData = {
    id: guestId,
    createdAt: now,
    expiresAt: expiresAt,
  };
  
  localStorage.setItem(GUEST_ID_KEY, JSON.stringify(guestData));
}

/**
 * 게스트 ID 조회
 * @returns {string|null} 유효한 게스트 ID 또는 null
 */
export function getGuestId() {
  try {
    const stored = localStorage.getItem(GUEST_ID_KEY);
    if (!stored) return null;
    
    const guestData = JSON.parse(stored);
    const now = Date.now();
    
    // 만료 시간 확인
    if (now > guestData.expiresAt) {
      // 만료된 ID 삭제
      localStorage.removeItem(GUEST_ID_KEY);
      return null;
    }
    
    return guestData.id;
  } catch (error) {
    console.error('게스트 ID 조회 오류:', error);
    return null;
  }
}

/**
 * 게스트 ID 삭제
 */
export function removeGuestId() {
  localStorage.removeItem(GUEST_ID_KEY);
}

/**
 * 게스트 로그인 (게스트 ID 생성 및 저장)
 * @returns {string} 생성된 게스트 ID
 */
export function loginAsGuest() {
  const existingId = getGuestId();
  if (existingId) {
    return existingId;
  }
  
  const guestId = generateGuestId();
  saveGuestId(guestId);
  return guestId;
}

/**
 * 게스트 로그인 상태 확인
 * @returns {boolean} 게스트 로그인 여부
 */
export function isGuestLoggedIn() {
  return getGuestId() !== null;
}

/**
 * 게스트 정보 조회
 * @returns {Object|null} { id, createdAt, expiresAt } 또는 null
 */
export function getGuestInfo() {
  try {
    const stored = localStorage.getItem(GUEST_ID_KEY);
    if (!stored) return null;
    
    const guestData = JSON.parse(stored);
    const now = Date.now();
    
    // 만료 시간 확인
    if (now > guestData.expiresAt) {
      localStorage.removeItem(GUEST_ID_KEY);
      return null;
    }
    
    return guestData;
  } catch (error) {
    console.error('게스트 정보 조회 오류:', error);
    return null;
  }
}
