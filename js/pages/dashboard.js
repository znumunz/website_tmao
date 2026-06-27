'use strict';

const DashboardPage = (() => {
  let inited = false;

  const mockData = {
    stats: [
      { value: '310', label: 'ผู้ป่วยทั้งหมด', icon: '👥', iconBg: '#EBF3FF', iconColor: '#2563EB', change: '+23 เดือนนี้' },
      { value: '73', label: 'การประเมิน (เดือน.)', icon: '📊', iconBg: '#E0F7F4', iconColor: '#0D9488', change: '+4.2% vs เดือนก่อน' },
      { value: '76', label: 'ผู้ป่วยเสี่ยงสูง', icon: '⚠️', iconBg: '#FEF3C7', iconColor: '#D97706', change: '24.5% ของทั้งหมด' },
    ],
    riskDist: [
      { label: 'ความเสี่ยงต่ำ', pct: 47, color: '#10B981', count: 145 },
      { label: 'ความเสี่ยงปานกลาง', pct: 29, color: '#F59E0B', count: 89 },
      { label: 'ความเสี่ยงสูง', pct: 17, color: '#EF4444', count: 52 },
      { label: 'ความเสี่ยงสูงมาก', pct: 8, color: '#DC2626', count: 24 },
    ],
    patients: [
      { id: 'A-2847', name: 'สมชาย ใจดี', age: 54, score: 32, level: 'High', date: '2026-06-12' },
      { id: 'A-2846', name: 'สมหญิง แสงทอง', age: 45, score: 12, level: 'Moderate', date: '2026-06-12' },
      { id: 'A-2845', name: 'ประยุทธ มีสุข', age: 62, score: 48, level: 'Very High', date: '2026-06-11' },
      { id: 'A-2844', name: 'วรรณ์นา สวยงาม', age: 38, score: 7, level: 'Low', date: '2026-06-11' },
      { id: 'A-2843', name: 'อนันต์ ชนะชัย', age: 71, score: 56, level: 'Very High', date: '2026-06-10' },
      { id: 'A-2842', name: 'มาลี รักสุขภาพ', age: 49, score: 19, level: 'Moderate', date: '2026-06-09' },
    ],
  };

  function init() {
    if (inited) return;
    inited = true;
    renderStats();
    renderDonut();
    renderTable();
    bindSearch();
    bindInteractiveCards();
  }

  function bindInteractiveCards() {
    const statWrap = document.getElementById('stat-cards');
    statWrap?.querySelectorAll('.stat-card').forEach(card => {
      card.setAttribute('tabindex', '0');
      card.addEventListener('click', () => card.classList.toggle('active'));
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          card.classList.toggle('active');
        }
      });
    });
  }

  function renderStats() {
    const wrap = document.getElementById('stat-cards');
    if (!wrap) return;
    wrap.innerHTML = mockData.stats.map(stat => `
      <div class="stat-card">
        <div class="stat-icon" style="background:${stat.iconBg};color:${stat.iconColor}">${stat.icon}</div>
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
        <div class="stat-change">↑ ${stat.change}</div>
      </div>
    `).join('');
  }

  function renderDonut() {
    const wrap = document.getElementById('donut-chart');
    if (!wrap) return;
    const r = 70;
    const cx = 90;
    const cy = 90;
    const total = mockData.riskDist.reduce((sum, item) => sum + item.pct, 0);
    let angle = -Math.PI / 2;

    const slices = mockData.riskDist.map(item => {
      const theta = (item.pct / total) * Math.PI * 2;
      const x1 = cx + r * Math.cos(angle);
      const y1 = cy + r * Math.sin(angle);
      angle += theta;
      const x2 = cx + r * Math.cos(angle);
      const y2 = cy + r * Math.sin(angle);
      const large = theta > Math.PI ? 1 : 0;
      return { ...item, path: `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r},0,${large},1,${x2.toFixed(2)},${y2.toFixed(2)} Z` };
    });

    wrap.innerHTML = `
      <div class="donut-wrap">
        <div class="donut-svg-wrap">
          <svg viewBox="0 0 180 180" width="180" height="180">
            <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="none" stroke="var(--border)" stroke-width="1"/>
            ${slices.map(slice => `<path d="${slice.path}" fill="${slice.color}" stroke="var(--bg-surface)" stroke-width="2"/>`).join('')}
            <circle cx="${cx}" cy="${cy}" r="38" fill="var(--bg-surface)"/>
            <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" fill="var(--text-primary)">${mockData.patients.length * 52}</text>
            <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="8" fill="var(--text-muted)">ทั้งหมด</text>
          </svg>
        </div>
        <div>
          <div class="donut-legend">
            ${mockData.riskDist.map(item => `
              <div class="legend-item">
                <div class="legend-dot" style="background:${item.color}"></div>
                <span>${item.label}: <strong>${item.pct}%</strong></span>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:1rem;display:grid;grid-template-columns:1fr 1fr;gap:0.4rem">
            ${mockData.riskDist.map(item => `
              <div style="font-size:0.78rem;color:var(--text-muted)">
                <span style="color:${item.color};font-weight:700">●</span>
                ${item.label}: <strong>${item.count}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderTable(filter = '') {
    const tbody = document.getElementById('patient-tbody');
    if (!tbody) return;
    const filtered = filter
      ? mockData.patients.filter(patient => patient.name.includes(filter) || patient.id.includes(filter))
      : mockData.patients;

    const levelMap = {
      Low: { cls: 'badge-low', th: 'ต่ำ' },
      Moderate: { cls: 'badge-moderate', th: 'ปานกลาง' },
      High: { cls: 'badge-high', th: 'สูง' },
      'Very High': { cls: 'badge-veryhigh', th: 'สูงมาก' },
    };

    tbody.innerHTML = filtered.length ? filtered.map(patient => {
      const level = levelMap[patient.level] || {};
      return `
        <tr>
          <td>${patient.id}</td>
          <td class="patient-name">${patient.name}</td>
          <td>${patient.age}</td>
          <td><strong>${patient.score}%</strong></td>
          <td><span class="badge ${level.cls}">${level.th}</span></td>
          <td>${patient.date}</td>
          <td><a href="#" style="color:var(--color-primary);font-size:0.82rem;font-weight:600">ดูรายละเอียด</a></td>
        </tr>
      `;
    }).join('') : `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">ไม่พบข้อมูล</td></tr>`;
  }

  function bindSearch() {
    const input = document.getElementById('patient-search');
    input?.addEventListener('input', event => renderTable(event.target.value.trim()));
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  DashboardPage.init();
});

