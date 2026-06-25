/**
 * CardiovasHora — app.js
 * Single-page navigation, dark mode, form steps,
 * mock chart rendering, chatbot UI
 *
 * Architecture: Module pattern — each feature in its own namespace.
 * To connect real backend / ML model:
 *   - Replace mock data in `Dashboard.mockData`
 *   - Call API in `Form.submitAssessment()`
 *   - Replace chatbot handler in `Chatbot.send()`
 */

'use strict';

/* ── UTILITY HELPERS ──────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────────────────────────────────────────── */
/* 1. ROUTER — lightweight hash-based SPA routing             */
/* ─────────────────────────────────────────────────────────── */
const Router = (() => {
  const routes = {
    login:      'page-login',
    intro:      'page-intro',
    assessment: 'page-assessment',
    dashboard:  'page-dashboard',
    chatbot:    'page-chatbot',
  };

  let currentPage = null;

  // On each navigation, hide all pages, show target
  function navigate(page, pushState = true) {
    if (!routes[page]) return;
    if (page !== 'login' && !Auth.isLoggedIn()) page = 'login';

    $$('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(routes[page]);
    if (target) {
      target.classList.add('active');
      target.classList.add('fade-up');
      setTimeout(() => target.classList.remove('fade-up'), 400);
    }

    // Toggle navbar and sidebar visibility
    const navbar = document.getElementById('navbar');
    const sidebar = document.getElementById('sidebar-nav');
    if (page === 'login') {
      navbar.style.display = 'none';
      if (sidebar) sidebar.style.display = 'none';
      document.body.classList.remove('sidebar-visible');
    } else {
      navbar.style.display = '';
      if (sidebar) sidebar.style.display = '';
      document.body.classList.add('sidebar-visible');
      // Update active nav link
      $$('.nav-links a, .sidebar-links a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === page);
      });
    }

    currentPage = page;
    if (pushState) history.pushState({ page }, '', `#${page}`);

    // Trigger page-specific initialisation
    if (page === 'dashboard') Dashboard.init();
    if (page === 'chatbot')   Chatbot.init();
    if (page === 'assessment') Form.init();
  }

  function init() {
    // Click handlers on nav links
    document.addEventListener('click', e => {
      const link = e.target.closest('[data-page]');
      if (link) {
        e.preventDefault();
        const page = link.dataset.page;
        // Guard: require login for protected pages
        if (page !== 'login' && !Auth.isLoggedIn()) {
          navigate('login');
          return;
        }
        navigate(page);
        // Close mobile menu if open
        $('#mobile-nav')?.classList.remove('open');
      }
    });

    window.addEventListener('popstate', e => {
      if (e.state?.page) navigate(e.state.page, false);
    });

    // Start on login page
    const hash = location.hash.replace('#', '') || 'login';
    navigate(hash, false);
  }

  return { init, navigate, current: () => currentPage };
})();


/* ─────────────────────────────────────────────────────────── */
/* 2. AUTH — minimal mock auth (replace with real JWT/session) */
/* ─────────────────────────────────────────────────────────── */
const Auth = (() => {
  let _loggedIn = false;

  // Demo credentials (replace with API call)
  const DEMO_USER  = 'doctor@cardiovashora.com';
  const DEMO_PASS  = 'demo1234';

  function login(email, password) {
    if (email === DEMO_USER && password === DEMO_PASS) {
      _loggedIn = true;
      return { ok: true };
    }
    // For demo: accept any non-empty credentials
    if (email && password.length >= 6) {
      _loggedIn = true;
      return { ok: true };
    }
    return { ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
  }

  function logout() {
    _loggedIn = false;
    Router.navigate('login');
  }

  function isLoggedIn() { return _loggedIn; }

  return { login, logout, isLoggedIn };
})();


/* ─────────────────────────────────────────────────────────── */
/* 3. THEME — dark / light mode toggle                        */
/* ─────────────────────────────────────────────────────────── */
const Theme = (() => {
  const KEY = 'cardiovashora_theme';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    // Update toggle icon
    $$('.btn-darkmode').forEach(btn => {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    apply(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    const saved = localStorage.getItem(KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    apply(saved);

    document.addEventListener('click', e => {
      if (e.target.closest('.btn-darkmode')) toggle();
    });
  }

  return { init, toggle, apply };
})();


/* ─────────────────────────────────────────────────────────── */
/* 4. LOGIN PAGE                                              */
/* ─────────────────────────────────────────────────────────── */
const LoginPage = (() => {
  function init() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      clearErrors();

      const email    = $('#login-email').value.trim();
      const password = $('#login-password').value;
      let valid = true;

      // Validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('email-error', 'กรุณากรอกอีเมลที่ถูกต้อง');
        $('#login-email').classList.add('input-invalid');
        valid = false;
      }
      if (!password || password.length < 6) {
        showError('password-error', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        $('#login-password').classList.add('input-invalid');
        valid = false;
      }

      if (!valid) return;

      // Show loading state
      const btn = $('#login-submit');
      btn.textContent = 'กำลังเข้าสู่ระบบ...';
      btn.disabled = true;

      // Simulate async (replace with fetch to /api/auth/login)
      setTimeout(() => {
        const result = Auth.login(email, password);
        if (result.ok) {
          Router.navigate('intro');
        } else {
          showError('email-error', result.error);
          btn.textContent = 'เข้าสู่ระบบ';
          btn.disabled = false;
        }
      }, 900);
    });

    // Tab switching (Login / Register)
    $$('.login-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.login-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });

    // Clear error on input
    $$('#login-form input').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('input-invalid');
        clearErrors();
      });
    });

    // Social login (mock)
    $$('.social-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Auth.login('social@demo.com', 'demo1234');
        Router.navigate('intro');
      });
    });

    // Logout in navbar
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      Auth.logout();
    });
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add('visible'); }
  }

  function clearErrors() {
    $$('.form-error').forEach(el => el.classList.remove('visible'));
    $$('.input-invalid').forEach(el => el.classList.remove('input-invalid'));
  }

  return { init };
})();


/* ─────────────────────────────────────────────────────────── */
/* 5. FORM — single-page patient assessment form             */
/* ─────────────────────────────────────────────────────────── */
const Form = (() => {
  let formData = {};
  let _bound = false;

  function init() {
    $$('.form-step').forEach(s => s.classList.remove('hidden'));
    bindEvents();
  }

  function validateForm() {
    const age = +$('#p-age')?.value;
    const sex = $('#p-sex')?.value;
    const wt  = +$('#p-weight')?.value;
    const ht  = +$('#p-height')?.value;
    if (!age || age < 18 || age > 120) { alert('กรุณากรอกอายุที่ถูกต้อง (18–120 ปี)'); return false; }
    if (!sex) { alert('กรุณาเลือกเพศ'); return false; }
    if (!wt || wt < 20 || wt > 300) { alert('กรุณากรอกน้ำหนักที่ถูกต้อง'); return false; }
    if (!ht || ht < 100 || ht > 250) { alert('กรุณากรอกส่วนสูงที่ถูกต้อง'); return false; }

    const sbp = +$('#v-sbp')?.value;
    const dbp = +$('#v-dbp')?.value;
    if (!sbp || sbp < 60 || sbp > 300) { alert('กรุณากรอกค่าความดันโลหิต Systolic ที่ถูกต้อง'); return false; }
    if (!dbp || dbp < 40 || dbp > 200) { alert('กรุณากรอกค่าความดันโลหิต Diastolic ที่ถูกต้อง'); return false; }

    const tmao = +$('#l-tmao')?.value;
    if (Number.isNaN(tmao) || tmao < 0 || tmao > 100) { alert('กรุณากรอกค่า TMAO (μmol/L)'); return false; }

    formData = {
      age,
      sex,
      weight: wt,
      height: ht,
      bmi: +(wt / ((ht / 100) ** 2)).toFixed(1),
      sbp,
      dbp,
      hr: +($('#v-hr')?.value || 72),
      spo2: +($('#v-spo2')?.value || 98),
      tmao,
      ldl: +($('#l-ldl')?.value || 0),
      hdl: +($('#l-hdl')?.value || 0),
      tg: +($('#l-tg')?.value || 0),
      hba1c: +($('#l-hba1c')?.value || 0),
      creat: +($('#l-creat')?.value || 0),
      hscrp: +($('#l-hscrp')?.value || 0),
      diabetes: document.querySelector('input[name="h-dm"]:checked')?.value === 'yes',
      hypertension: document.querySelector('input[name="h-ht"]:checked')?.value === 'yes',
      smoking: document.querySelector('input[name="h-smoke"]:checked')?.value === 'yes',
      alcohol: document.querySelector('input[name="h-alc"]:checked')?.value === 'yes',
      kidneyDz: document.querySelector('input[name="h-ckd"]:checked')?.value === 'yes',
    };

    return true;
  }

  function calcBMI() {
    const wt = +$('#p-weight')?.value;
    const ht = +$('#p-height')?.value;
    const display = document.getElementById('bmi-display');
    if (display) {
      display.textContent = wt && ht ? `BMI = ${(wt / ((ht / 100) ** 2)).toFixed(1)} kg/m²` : '';
    }
  }

  function bindEvents() {
    if (_bound) return;
    _bound = true;

    document.getElementById('assessment-submit')?.addEventListener('click', () => {
      if (!validateForm()) return;
      submitAssessment();
    });

    ['#p-weight', '#p-height'].forEach(sel => {
      document.querySelector(sel)?.addEventListener('input', calcBMI);
    });
  }

  function submitAssessment() {
    const btn = document.getElementById('assessment-submit');
    if (btn) {
      btn.textContent = '⏳ กำลังประเมิน...';
      btn.disabled = true;
    }

    setTimeout(() => {
      if (btn) {
        btn.textContent = 'ประเมินผลความเสี่ยง';
        btn.disabled = false;
      }
      Router.navigate('dashboard');
    }, 1500);
  }

  return { init };
})();


/* ─────────────────────────────────────────────────────────── */
/* 6. DASHBOARD — mock data + chart rendering                 */
/* ─────────────────────────────────────────────────────────── */
const Dashboard = (() => {
  let _inited = false;

  const mockData = {
    stats: [
      { id: 'total-patients', value: '310', label: 'ผู้ป่วยทั้งหมด', icon: '👥', iconBg: '#EBF3FF', iconColor: '#2563EB', change: '+23 เดือนนี้' },
      { id: 'monthly-assess', value: '73',  label: 'การประเมิน (มิ.ย.)', icon: '📊', iconBg: '#E0F7F4', iconColor: '#0D9488', change: '+4.2% vs เดือนก่อน' },
      { id: 'high-risk',      value: '76',  label: 'ผู้ป่วยเสี่ยงสูง', icon: '⚠️', iconBg: '#FEF3C7', iconColor: '#D97706', change: '24.5% ของทั้งหมด' },
    ],
    riskDist: [
      { label: 'ความเสี่ยงต่ำ',         pct: 47, color: '#10B981', count: 145 },
      { label: 'ความเสี่ยงปานกลาง',   pct: 29, color: '#F59E0B', count: 89  },
      { label: 'ความเสี่ยงสูง',         pct: 17, color: '#EF4444', count: 52  },
      { label: 'ความเสี่ยงสูงมาก',   pct:  8, color: '#DC2626', count: 24  },
    ],
    patients: [
      { id: 'A-2847', name: 'สมชาย ใจดี',       age: 54, score: 32, level: 'High',     date: '2026-06-12' },
      { id: 'A-2846', name: 'สมหญิง แสงทอง',    age: 45, score: 12, level: 'Moderate', date: '2026-06-12' },
      { id: 'A-2845', name: 'ประยุทธ มีสุข',     age: 62, score: 48, level: 'Very High',date: '2026-06-11' },
      { id: 'A-2844', name: 'วรรณา สวยงาม',      age: 38, score:  7, level: 'Low',      date: '2026-06-11' },
      { id: 'A-2843', name: 'อนันต์ ชนะชัย',     age: 71, score: 56, level: 'Very High',date: '2026-06-10' },
      { id: 'A-2842', name: 'มาลี รักสุขภาพ',    age: 49, score: 19, level: 'Moderate', date: '2026-06-09' },
    ],

  };

  function init() {
    if (_inited) return;
    _inited = true;
    renderStats();
    renderDonut();
    renderTable();
    bindSearch();
    bindInteractiveCards();
  }

  function bindInteractiveCards() {
    // stat cards (injected)
    const wrap = document.getElementById('stat-cards');
    if (wrap) {
      wrap.querySelectorAll('.stat-card').forEach(el => {
        el.setAttribute('tabindex', '0');
        el.addEventListener('click', () => el.classList.toggle('active'));
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.classList.toggle('active'); }
        });
      });
    }

    // static feature cards and step blocks
    document.querySelectorAll('.feature-card, .step-how, .hero-img-card').forEach(el => {
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => el.classList.toggle('active'));
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.classList.toggle('active'); }
      });
    });
  }

  /* KPI cards */
  function renderStats() {
    const wrap = document.getElementById('stat-cards');
    if (!wrap) return;
    wrap.innerHTML = mockData.stats.map(s => `
      <div class="stat-card">
        <div class="stat-icon" style="background:${s.iconBg};color:${s.iconColor}">${s.icon}</div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
        ${s.badge ? `<span class="stat-badge" style="background:${s.iconBg};color:${s.iconColor}">${s.badge}</span>` : ''}
        ${s.change ? `<div class="stat-change">↑ ${s.change}</div>` : ''}
      </div>
    `).join('');
    
  }



  /* Donut chart (SVG) */
  function renderDonut() {
    const wrap = document.getElementById('donut-chart');
    if (!wrap) return;
    const R = 70, cx = 90, cy = 90;
    const total = mockData.riskDist.reduce((s,d)=>s+d.pct,0);
    let angle = -Math.PI/2;
    const slices = mockData.riskDist.map(d => {
      const theta = (d.pct/total)*2*Math.PI;
      const x1 = cx + R*Math.cos(angle);
      const y1 = cy + R*Math.sin(angle);
      angle += theta;
      const x2 = cx + R*Math.cos(angle);
      const y2 = cy + R*Math.sin(angle);
      const large = theta > Math.PI ? 1 : 0;
      return { ...d, d: `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R},0,${large},1,${x2.toFixed(2)},${y2.toFixed(2)} Z` };
    });

    wrap.innerHTML = `
      <div class="donut-wrap">
        <div class="donut-svg-wrap">
          <svg viewBox="0 0 180 180" width="180" height="180">
            <circle cx="${cx}" cy="${cy}" r="${R+4}" fill="none" stroke="var(--border)" stroke-width="1"/>
            ${slices.map(s=>`<path d="${s.d}" fill="${s.color}" stroke="var(--bg-surface)" stroke-width="2"/>`).join('')}
            <circle cx="${cx}" cy="${cy}" r="38" fill="var(--bg-surface)"/>
            <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" fill="var(--text-primary)">${mockData.patients.length * 52}</text>
            <text x="${cx}" y="${cy+16}" text-anchor="middle" font-size="8" fill="var(--text-muted)">ทั้งหมด</text>
          </svg>
        </div>
        <div>
          <div class="donut-legend">
            ${mockData.riskDist.map(d=>`
              <div class="legend-item">
                <div class="legend-dot" style="background:${d.color}"></div>
                <span>${d.label}: <strong>${d.pct}%</strong></span>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:1rem;display:grid;grid-template-columns:1fr 1fr;gap:0.4rem">
            ${mockData.riskDist.map(d=>`
              <div style="font-size:0.78rem;color:var(--text-muted)">
                <span style="color:${d.color};font-weight:700">●</span> 
                ${d.label.split(' ').pop()}: <strong>${d.count}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>`;
  }



  /* Patient table */
  function renderTable(filter = '') {
    const tbody = document.getElementById('patient-tbody');
    if (!tbody) return;
    const filtered = filter
      ? mockData.patients.filter(p => p.name.includes(filter) || p.id.includes(filter))
      : mockData.patients;

    const levelMap = {
      'Low':       { cls: 'badge-low',      th: 'ต่ำ' },
      'Moderate':  { cls: 'badge-moderate',  th: 'ปานกลาง' },
      'High':      { cls: 'badge-high',      th: 'สูง' },
      'Very High': { cls: 'badge-veryhigh',  th: 'สูงมาก' },
    };

    tbody.innerHTML = filtered.length ? filtered.map(p => {
      const m = levelMap[p.level] || {};
      return `<tr>
        <td>${p.id}</td>
        <td class="patient-name">${p.name}</td>
        <td>${p.age}</td>
        <td><strong>${p.score}%</strong></td>
        <td><span class="badge ${m.cls}">${m.th}</span></td>
        <td>📅 ${p.date}</td>
        <td><a href="#" style="color:var(--color-primary);font-size:0.82rem;font-weight:600">ดูรายละเอียด</a></td>
      </tr>`;
    }).join('') : `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">ไม่พบข้อมูล</td></tr>`;
  }

  function bindSearch() {
    const input = document.getElementById('patient-search');
    if (!input) return;
    input.addEventListener('input', e => renderTable(e.target.value.trim()));
  }

  return { init };
})();


/* ─────────────────────────────────────────────────────────── */
/* 7. CHATBOT                                                 */
/* ─────────────────────────────────────────────────────────── */
const Chatbot = (() => {
  let _inited = false;

  const WELCOME = 'สวัสดีครับ ผมเป็น AI Research Assistant ด้านสุขภาพหัวใจและหลอดเลือด ผมสามารถช่วยอธิบายเกี่ยวกับ TMAO biomarker, ความเสี่ยงโรคหัวใจ และงานวิจัยล่าสุดได้ครับ จะให้ผมช่วยเรื่องใดดีครับ?';

  // Mock AI responses (replace with real Anthropic API call)
  const RESPONSES = {
    'tmao': 'TMAO (Trimethylamine N-oxide) เป็น metabolite ที่ผลิตจากแบคทีเรียในลำไส้ เมื่อย่อยสลายสารอาหารจำพวก choline และ L-carnitine ที่พบในเนื้อแดงและผลิตภัณฑ์จากสัตว์\n\nงานวิจัยพบว่าระดับ TMAO สูง (>6 μmol/L) สัมพันธ์กับความเสี่ยงโรคหัวใจและหลอดเลือดเพิ่มขึ้น 2-3 เท่า โดย TMAO ส่งเสริมการสะสมของ cholesterol ใน macrophage (foam cells) และยับยั้ง reverse cholesterol transport ครับ',
    'smoking': 'การสูบบุหรี่เป็นปัจจัยเสี่ยงสำคัญอันดับ 2 ในโมเดลของเรา (Feature Importance = 23)\n\nสาร nicotine และ oxidants ในควันบุหรี่ทำให้เกิด endothelial dysfunction, เพิ่ม oxidative stress, และเร่ง atherosclerosis ครับ การเลิกสูบบุหรี่ลดความเสี่ยงโรคหัวใจลงได้ 50% ภายใน 1 ปี',
    'ldl': 'LDL Cholesterol เป็น feature ที่ 3 ในโมเดล ML ของเรา ระดับ LDL >130 mg/dL เพิ่มความเสี่ยงโรคหัวใจอย่างมีนัยสำคัญ\n\nแนวทาง ACC/AHA 2019 แนะนำ:\n• Primary prevention: LDL <116 mg/dL\n• High-risk: LDL <70 mg/dL\n• Very high-risk: LDL <55 mg/dL\n\nพิจารณา statin therapy เมื่อ 10-year risk >7.5% ครับ',
    'ml': 'โมเดล Machine Learning ของเราใช้ LightGBM (LGBM) ซึ่งเป็น gradient boosting framework ที่มีประสิทธิภาพสูง\n\n✅ ข้อดี: ประมวลผลเร็ว, จัดการ missing data ได้ดี, explainable ผ่าน SHAP values\n\nMetrics ปัจจุบัน:\n• Accuracy: 94%\n• AUC-ROC: 0.96\n• Precision: 91%\n• Recall: 89%\n\nใช้ 5-Fold Cross-Validation เพื่อป้องกัน overfitting ครับ',
    'prevention': 'กลยุทธ์ป้องกันสำหรับผู้ที่มีค่า TMAO สูง:\n\n🥗 ด้านอาหาร:\n• ลดเนื้อแดง, ไข่แดง, และอาหารทะเล (แหล่ง choline/carnitine สูง)\n• เพิ่มผัก ผลไม้ และ dietary fiber\n• Mediterranean diet ช่วยลด TMAO ได้ดี\n\n💊 ด้านการรักษา:\n• DMB (3,3-Dimethyl-1-butanol) ยับยั้งการผลิต TMA\n• Broad-spectrum antibiotics (ระยะสั้น)\n\n🏃 ออกกำลังกาย: ≥150 นาที/สัปดาห์',
    'default': 'ขอบคุณสำหรับคำถามครับ ขณะนี้ผมสามารถตอบคำถามเกี่ยวกับ TMAO, ปัจจัยเสี่ยงโรคหัวใจ, การป้องกัน, และ ML model ได้ครับ\n\nลองถามเกี่ยวกับ:\n• "TMAO คืออะไร?"\n• "แนวทางป้องกันสำหรับ TMAO สูง"\n• "LDL กับความเสี่ยงหัวใจ"\n• "โมเดล Machine Learning ทำงานอย่างไร?"',
  };

  const WEBHOOK_URL = 'https://rnd-n8n.kku.ac.th/webhook/chat';

  function getResponse(msg) {
    const m = msg.toLowerCase();
    if (m.includes('tmao') || m.includes('ทีแมโอ'))             return RESPONSES.tmao;
    if (m.includes('สูบ') || m.includes('บุหรี่') || m.includes('smok')) return RESPONSES.smoking;
    if (m.includes('ldl') || m.includes('cholesterol') || m.includes('คอเลส')) return RESPONSES.ldl;
    if (m.includes('ml') || m.includes('machine') || m.includes('โมเดล') || m.includes('ai')) return RESPONSES.ml;
    if (m.includes('ป้องกัน') || m.includes('prevention') || m.includes('รักษา')) return RESPONSES.prevention;
    return RESPONSES.default;
  }

  // function formatWebhookResult(data) {
  //   if (typeof data === 'string') return data;
  //   if (Array.isArray(data)) {
  //   const first = data[0];
  //   return first?.output || first?.answer || first?.message || first?.text || JSON.stringify(first, null, 2);
  //   }
  //   if (data == null) return 'ไม่มีข้อมูลตอบกลับจากเซิร์ฟเวอร์';
  //   if (typeof data === 'object') {
  //     return data.answer || data.message || data.text || data.output || data.result || JSON.stringify(data, null, 2);
  //   }
  //   return String(data);
  
  function formatWebhookResult(data) {
    if (data == null) {
      return 'ไม่มีข้อมูลตอบกลับจากเซิร์ฟเวอร์';
    }

    if (typeof data === 'string') {
      return data;
    }

    // เพิ่มตรงนี้ — n8n ส่งกลับเป็น Array
    if (Array.isArray(data)) {
      const first = data[0];
      return first?.output || first?.answer || first?.message || first?.text || JSON.stringify(data, null, 2);
    }

    if (typeof data === 'object') {
      return (
        data.output ||
        data.answer ||
        data.message ||
        data.text ||
        data.result ||
        JSON.stringify(data, null, 2)
      );
    }

    return String(data);
  }

  // async function requestWebhook(message) {
  //   const response = await fetch(WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ question: message })
  //   });

  //   if (!response.ok) {
  //     const bodyText = await response.text();
  //     throw new Error(`${response.status} ${response.statusText}: ${bodyText}`);
  //   }

  //   const contentType = response.headers.get('content-type') || '';
  //   if (contentType.includes('application/json')) {
  //       const text = await response.text();      // เปลี่ยนจาก response.json()
  //       console.log('RAW:', text);
  //       const data = JSON.parse(text);           // เปลี่ยนจาก response.json()
  //     return formatWebhookResult(data);
  //   }
  //   return await response.text(); 
  // }
  async function requestWebhook(message) {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: message })
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${bodyText}`);
    }
    const text = await response.text();
    console.log('GOT:', text);  // ← เพิ่มบรรทัดนี้
    return text;
  }

  function appendBubble(role, text) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;

    const isAI = role === 'ai';
    const wrap = document.createElement('div');
    wrap.className = `chat-bubble-wrap ${isAI ? '' : 'user'} fade-up`;

    wrap.innerHTML = `
      <div class="chat-avatar ${isAI ? 'ai' : 'user-av'}">${isAI ? '🤖' : '👨‍⚕️'}</div>
      <div class="chat-bubble ${isAI ? 'ai' : 'user'}">${text.replace(/\n/g,'<br>')}</div>`;

    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = 'chat-bubble-wrap';
    div.innerHTML = `
      <div class="chat-avatar ai">🤖</div>
      <div class="chat-bubble ai" style="padding:0.6rem 1rem">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;
    messages?.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('typing-indicator')?.remove();
  }

  async function send(msg) {
    if (!msg.trim()) return;
    appendBubble('user', msg);
    const input = document.getElementById('chat-input');
    if (input) input.value = '';
    showTyping();

    try {
      const result = await requestWebhook(msg);
      hideTyping();
      appendBubble('ai', result);
    } 
      catch (err) {
      hideTyping();
      appendBubble('ai', `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}\n\nกำลังตอบกลับจากระบบสำรอง (local fallback)`);
      appendBubble('ai', getResponse(msg));
    }
}

  function init() {
    if (_inited) return;
    _inited = true;

    // Welcome message
    appendBubble('ai', WELCOME);

    // Send button
    document.getElementById('chat-send')?.addEventListener('click', () => {
      const input = document.getElementById('chat-input');
      send(input?.value || '');
    });

    // Enter key
    document.getElementById('chat-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e.target.value); }
    });

    // Prompt chips
    $$('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => send(chip.textContent.trim()));
    });
  }

  return { init };
})();


/* ─────────────────────────────────────────────────────────── */
/* 8. MOBILE NAV ─────────────────────────────────────────── */
const MobileNav = (() => {
  function init() {
    document.getElementById('hamburger-btn')?.addEventListener('click', () => {
      document.getElementById('mobile-nav')?.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('#mobile-nav') && !e.target.closest('#hamburger-btn')) {
        document.getElementById('mobile-nav')?.classList.remove('open');
      }
    });
  }
  return { init };
})();

/* ─────────────────────────────────────────────────────────── */
/* 9. DESKTOP SIDEBAR ─────────────────────────────────────── */
const DesktopSidebar = (() => {
  let _collapsed = false;

  function toggle() {
    _collapsed = !_collapsed;
    document.body.classList.toggle('sidebar-collapsed', _collapsed);
    document.getElementById('sidebar-toggle')?.setAttribute('aria-expanded', String(!_collapsed));
  }

  function init() {
    const toggleButton = document.getElementById('sidebar-toggle');
    if (!toggleButton) return;
    toggleButton.addEventListener('click', toggle);

    document.addEventListener('click', e => {
      const link = e.target.closest('.sidebar-links a');
      if (link) {
        document.getElementById('sidebar-nav')?.classList.remove('open');
      }
    });
  }

  return { init };
})();


/* ─────────────────────────────────────────────────────────── */
/* 10. BOOT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  MobileNav.init();
  LoginPage.init();
  DesktopSidebar.init();
  Router.init();
});

/* Scroll reveal removed — interactions are hover/click based */