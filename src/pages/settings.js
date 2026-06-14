import {
  exportProgressJson,
  getLocalProgress,
  importProgressJson,
} from '../progress.js';
import { getCloudStatus, scheduleCloudSync, syncFromCloud } from '../sync.js';
import { link, navigate } from '../router.js';
import { signOut, getCurrentUser } from '../auth.js';

export function renderSettings(app) {
  const progress = getLocalProgress();
  const cloud = getCloudStatus();
  const user = getCurrentUser();
  const email = user?.email || '未登录';

  app.innerHTML = `
    <header class="site-header">
      <div>
        <h1>设置与同步</h1>
        <p class="muted"><a href="${link('/')}" data-nav="/">← 返回首页</a></p>
      </div>
    </header>

    <section class="card">
      <h2>当前账号</h2>
      <p class="muted">邮箱: <strong>${email}</strong></p>
      <button type="button" class="btn" id="logout-btn">退出登录</button>
    </section>

    <section class="card">
      <h2>云端状态</h2>
      <p id="cloud-status" class="muted">
        ${cloud === 'configured' ? 'Supabase 已配置，进度会自动同步。' : 'Supabase 未配置：仅本地保存进度。'}
      </p>
      <div class="row">
        <button type="button" class="btn" id="sync-now" ${cloud !== 'configured' ? 'disabled' : ''}>
          立即从云端同步
        </button>
      </div>
      <p id="sync-message" class="small muted"></p>
    </section>

    <section class="card">
      <h2>备份与恢复</h2>
      <div class="row">
        <button type="button" class="btn" id="export-json">导出 JSON 备份</button>
        <label class="btn file-label">
          导入 JSON 备份
          <input type="file" id="import-json" accept="application/json,.json" hidden />
        </label>
      </div>
      <p id="backup-message" class="small muted"></p>
    </section>
  `;

  bindNav(app);

  // 退出登录
  app.querySelector('#logout-btn').addEventListener('click', async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      showMessage('sync-message', '退出登录失败');
    }
  });

  app.querySelector('#sync-now').addEventListener('click', async () => {
    showMessage('sync-message', '同步中…');
    const result = await syncFromCloud();
    if (result.ok) {
      showMessage('sync-message', '同步成功');
      renderSettings(app);
    } else {
      showMessage('sync-message', `同步失败：${result.reason}`);
    }
  });

  app.querySelector('#export-json').addEventListener('click', () => {
    const progress = getLocalProgress();
    const json = exportProgressJson(progress);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('backup-message', '已导出备份文件');
  });

  app.querySelector('#import-json').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = importProgressJson(text);
      scheduleCloudSync(imported);
      showMessage('backup-message', '导入成功');
      renderSettings(app);
    } catch (err) {
      showMessage('backup-message', err.message || '导入失败');
    }
    e.target.value = '';
  });
}

function showMessage(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function bindNav(root) {
  root.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.getAttribute('data-nav'));
    });
  });
}
