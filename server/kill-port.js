// 포트를 사용 중인 프로세스를 종료하는 유틸리티 스크립트
// 사용법: node kill-port.js [포트번호]

const port = process.argv[2] || 3001;

console.log(`포트 ${port}를 사용 중인 프로세스를 찾는 중...`);

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function killPort(port) {
  try {
    // Windows에서 포트를 사용하는 프로세스 찾기
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (!stdout.trim()) {
      console.log(`포트 ${port}를 사용 중인 프로세스가 없습니다.`);
      return;
    }

    // PID 추출
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 0) {
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && !isNaN(pid)) {
          pids.add(pid);
        }
      }
    });

    if (pids.size === 0) {
      console.log(`포트 ${port}를 사용 중인 프로세스를 찾을 수 없습니다.`);
      return;
    }

    console.log(`다음 프로세스를 종료합니다: ${Array.from(pids).join(', ')}`);
    
    // 각 PID 종료
    for (const pid of pids) {
      try {
        await execAsync(`taskkill /PID ${pid} /F`);
        console.log(`✓ 프로세스 ${pid} 종료 완료`);
      } catch (error) {
        console.error(`✗ 프로세스 ${pid} 종료 실패:`, error.message);
      }
    }
    
    console.log(`\n포트 ${port}가 이제 사용 가능합니다.`);
  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

killPort(port);
