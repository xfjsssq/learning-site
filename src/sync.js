import { isSupabaseConfigured } from './supabase.js';

export function getCloudStatus() {
  return isSupabaseConfigured() ? 'configured' : 'missing';
}

// NOTE: syncFromCloud, scheduleCloudSync 已迁移至 progress.js，
// 此处保留以兼容旧 import（重导出）
export { syncFromCloud, scheduleCloudSync } from './progress.js';