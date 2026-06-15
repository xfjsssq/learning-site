import {
  exportProgressJson,
  importProgressJson,
} from '../progress.js';
import { link, navigate } from '../router.js';

export function renderSettings(app) {
  app.innerHTML = `
    <header class="site-header">
      <div>
        <h1>设置与同步</h1>
        <p class="muted"><a href="${link('/')}" data-nav="/">← 返回首页</a></p>
      </div>
    </header>

    <section class="card">
      <h2>进度存储</h2>
      <p class="muted">当前使用本地存储，进度保存在浏览器中。</p>
      <p class="warn small">清除浏览器数据会丢失进度，请先导出备份。</p>
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

  app.querySelector('#export-json').addEventListener('click', () => {
    const json = exportProgressJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('backup-message', '已导出备份文件');
  });

  app.querySelector('#import-json').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importProgressJson(text);
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
