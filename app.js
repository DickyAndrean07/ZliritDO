/**
 * ZliritDo — Production Web Application Engine
 * Daily Discipline & Time-Targeted Focus Tracker
 */

(() => {
  'use strict';

  // --- Utility Selector ---
  const $ = (id) => document.getElementById(id);

  // --- Sound Effects (Synthesized Web Audio API) ---
  const playChime = (type = 'start') => {
    if (!state.soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'start') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'finish') {
        [659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5 + i * 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + 0.55 + i * 0.08);
        });
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // --- Initial Default Data ---
  const defaultGoals = [
    {
      id: 'coding',
      name: 'Belajar Coding',
      targetSeconds: 7200, // 2 jam
      progressSeconds: 0,
      icon: '⌨️',
      sub: 'Build your future, one line at a time'
    },
    {
      id: 'sport',
      name: 'Olahraga',
      targetSeconds: 3600, // 1 jam
      progressSeconds: 0,
      icon: '🏃',
      sub: 'Move a little, feel a lot better'
    }
  ];

  // --- App State ---
  let state = {
    goals: [...defaultGoals],
    activeGoalId: 'coding',
    running: false,
    startedAt: 0,
    sessionElapsed: 0,
    logs: [],
    streak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    soundEnabled: true,
    currentUser: null
  };

  let tickerInterval = null;
  let selectedModalIcon = '⌨️';
  let activeTab = 'today';
  let authCurrentTab = 'login'; // 'login' | 'register'

  // --- Persistence Handlers ---
  const STORAGE_KEY = 'zliritdo_prod_v1';

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.goals && Array.isArray(parsed.goals)) {
          state.goals = parsed.goals;
        }
        if (parsed.activeGoalId) {
          state.activeGoalId = parsed.activeGoalId;
        }
        if (parsed.logs && Array.isArray(parsed.logs)) {
          state.logs = parsed.logs;
        }
        if (typeof parsed.streak === 'number') {
          state.streak = parsed.streak;
        }
        if (parsed.lastActiveDate) {
          state.lastActiveDate = parsed.lastActiveDate;
        }
        if (typeof parsed.soundEnabled === 'boolean') {
          state.soundEnabled = parsed.soundEnabled;
        }
      }
    } catch (err) {
      console.warn('Gagal memuat LocalStorage:', err);
    }
  };

  const saveState = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          goals: state.goals,
          activeGoalId: state.activeGoalId,
          logs: state.logs,
          streak: state.streak,
          lastActiveDate: state.lastActiveDate,
          soundEnabled: state.soundEnabled
        })
      );
    } catch (err) {
      console.warn('Gagal menyimpan ke LocalStorage:', err);
    }
  };

  // --- Time Helpers ---
  const formatHMS = (seconds) => {
    seconds = Math.max(0, Math.floor(seconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
  };

  const formatShort = (seconds) => {
    seconds = Math.floor(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const formatRelativeTime = (timestamp) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return new Date(timestamp).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // --- Toast Notification ---
  let toastTimer = null;
  const showToast = (message) => {
    const toast = $('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  // --- Active Goal Helper ---
  const getActiveGoal = () => {
    return state.goals.find((g) => g.id === state.activeGoalId) || state.goals[0] || null;
  };

  // --- Indonesian Clock & Date ---
  const updateSystemClock = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clockStr = `${hours}:${minutes}`;

    if ($('headerClock')) $('headerClock').textContent = clockStr;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
    if ($('headerDate')) $('headerDate').textContent = dateStr;
  };

  // --- Tab Navigation Engine ---
  const switchTab = (tabName) => {
    activeTab = tabName;
    document.querySelectorAll('.app-view').forEach((el) => el.classList.remove('active'));
    document.querySelectorAll('.nav-pill').forEach((el) => el.classList.toggle('active', el.dataset.tab === tabName));
    document.querySelectorAll('.bottom-nav-btn').forEach((el) => el.classList.toggle('active', el.dataset.tab === tabName));

    if (tabName === 'today') {
      if ($('viewToday')) $('viewToday').classList.add('active');
    } else if (tabName === 'focus') {
      if ($('viewFocus')) $('viewFocus').classList.add('active');
    } else if (tabName === 'history') {
      if ($('viewHistory')) $('viewHistory').classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderUI();
  };

  // --- UI Render Engine ---
  const renderUI = () => {
    const activeGoal = getActiveGoal();
    if (!activeGoal) return;

    // 1. Progress Calculations
    const totalTarget = state.goals.reduce((acc, g) => acc + g.targetSeconds, 0);
    const totalDone = state.goals.reduce((acc, g) => acc + Math.min(g.progressSeconds, g.targetSeconds), 0);
    const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalDone / totalTarget) * 100)) : 0;
    const completedGoalsCount = state.goals.filter((g) => g.progressSeconds >= g.targetSeconds).length;

    // 2. Metrics & Ring
    if ($('statTotalFocus')) $('statTotalFocus').textContent = formatShort(totalDone);
    if ($('statGoalsDone')) $('statGoalsDone').textContent = `${completedGoalsCount} / ${state.goals.length}`;
    if ($('statOverallPct')) $('statOverallPct').textContent = `${overallPct}%`;

    if ($('overviewPercentText')) $('overviewPercentText').textContent = `${overallPct}% selesai`;
    if ($('ringPercent')) $('ringPercent').textContent = `${overallPct}%`;
    if ($('overallRing')) {
      $('overallRing').style.background = `conic-gradient(var(--mint) 0% ${overallPct}%, rgba(255, 255, 255, 0.12) ${overallPct}% 100%)`;
      $('overallRing').setAttribute('aria-valuenow', overallPct);
    }
    if ($('overallBar')) $('overallBar').style.width = `${overallPct}%`;
    if ($('totalTime')) $('totalTime').textContent = formatShort(totalDone);
    if ($('totalTargetLabel')) $('totalTargetLabel').textContent = `dari ${formatShort(totalTarget)} target terencana`;
    if ($('overviewTag')) {
      $('overviewTag').textContent = overallPct >= 100 ? 'Selesai ✓' : 'In Progress';
      $('overviewTag').style.color = overallPct >= 100 ? 'var(--mint)' : '#a6cbe7';
    }

    if ($('streakDays')) $('streakDays').textContent = state.streak;
    if ($('analyticsStreak')) $('analyticsStreak').textContent = state.streak;

    // 3. Active Focus Widget (Dashboard)
    if ($('activeIcon')) $('activeIcon').textContent = activeGoal.icon || '✦';
    if ($('activeName')) $('activeName').textContent = activeGoal.name;
    if ($('activeTarget')) $('activeTarget').textContent = `Target hari ini · ${formatShort(activeGoal.targetSeconds)}`;

    const currentGoalPct = Math.min(100, Math.round((activeGoal.progressSeconds / activeGoal.targetSeconds) * 100));
    const remainingSecs = Math.max(0, activeGoal.targetSeconds - activeGoal.progressSeconds);

    if ($('sessionTarget')) $('sessionTarget').textContent = formatHMS(activeGoal.targetSeconds);
    if ($('sessionLeft')) $('sessionLeft').textContent = formatHMS(remainingSecs);

    // 4. Immersive View Elements
    if ($('immersiveIcon')) $('immersiveIcon').textContent = activeGoal.icon || '✦';
    if ($('immersiveName')) $('immersiveName').textContent = activeGoal.name;
    if ($('immersiveTarget')) $('immersiveTarget').textContent = formatHMS(activeGoal.targetSeconds);
    if ($('immersiveLeft')) $('immersiveLeft').textContent = formatHMS(remainingSecs);
    if ($('immersiveRing')) {
      $('immersiveRing').style.background = `conic-gradient(var(--mint) 0% ${currentGoalPct}%, rgba(255, 255, 255, 0.1) ${currentGoalPct}% 100%)`;
      $('immersiveRing').classList.toggle('paused', !state.running);
    }

    // 5. Timer Displays & Running State
    const sessionSeconds = state.running
      ? Math.floor((Date.now() - state.startedAt) / 1000)
      : 0;
    const formattedTimer = formatHMS(sessionSeconds);

    if ($('mainTimer')) $('mainTimer').textContent = formattedTimer;
    if ($('focusTimer')) $('focusTimer').textContent = formattedTimer;

    if ($('mainTimer')) $('mainTimer').classList.toggle('running', state.running);
    if ($('focusTimer')) $('focusTimer').classList.toggle('running', state.running);

    if ($('liveStatusText')) $('liveStatusText').textContent = state.running ? 'FOKUS' : 'SIAP';
    if ($('liveDot')) $('liveDot').classList.toggle('ticking', state.running);

    const startBtnHtml = state.running ? '<span>Ⅱ</span> &nbsp; Sedang Berjalan…' : '<span>▶</span> &nbsp; Mulai Sesi Fokus';
    const immersiveStartBtnHtml = state.running ? '<span>Ⅱ</span> &nbsp; Berjalan…' : '<span>▶</span> &nbsp; Mulai Fokus';

    if ($('startBtn')) {
      $('startBtn').innerHTML = startBtnHtml;
      $('startBtn').disabled = state.running;
    }
    if ($('immersiveStartBtn')) {
      $('immersiveStartBtn').innerHTML = immersiveStartBtnHtml;
      $('immersiveStartBtn').disabled = state.running;
    }
    if ($('stopBtn')) $('stopBtn').style.opacity = state.running ? '1' : '0.6';
    if ($('immersiveStopBtn')) $('immersiveStopBtn').style.opacity = state.running ? '1' : '0.6';

    // 6. Goals List Rendering
    if ($('goalCountBadge')) $('goalCountBadge').textContent = `${state.goals.length} Aktivitas`;
    const container = $('goalsContainer');
    if (container) {
      container.innerHTML = '';
      state.goals.forEach((goal) => {
        const pct = Math.min(100, Math.round((goal.progressSeconds / goal.targetSeconds) * 100));
        const isDone = pct >= 100;
        const isActive = goal.id === state.activeGoalId;

        const item = document.createElement('div');
        item.className = `goal-item ${isActive ? 'is-active' : ''}`;
        item.setAttribute('role', 'listitem');

        item.innerHTML = `
          <div class="goal-item-icon">${goal.icon || '✦'}</div>
          <div class="goal-item-body">
            <div class="goal-item-top">
              <span class="goal-item-title">${goal.name}</span>
              <span class="goal-item-time ${isDone ? 'completed' : ''}">
                ${formatShort(goal.progressSeconds)} / ${formatShort(goal.targetSeconds)} ${isDone ? '✓' : ''}
              </span>
            </div>
            <div class="goal-item-desc">${isDone ? '✓ Target hari ini selesai!' : goal.sub || 'Fokus konsisten setiap hari'}</div>
            <div class="progress-track" style="margin-top: 8px;">
              <span style="width: ${pct}%"></span>
            </div>
          </div>
          <div class="goal-item-actions">
            <button class="btn-goal-focus" title="Pilih aktivitas ini" type="button">
              ${isActive ? '● Aktif' : '▶ Fokus'}
            </button>
            ${state.goals.length > 1 ? `<button class="btn-goal-delete" title="Hapus target" type="button">✕</button>` : ''}
          </div>
        `;

        // Select Goal Handler
        item.addEventListener('click', (e) => {
          if (e.target.closest('.btn-goal-delete')) return;
          if (state.running && goal.id !== state.activeGoalId) {
            showToast('Selesaikan atau stop timer sesi aktif sebelum berganti aktivitas.');
            return;
          }
          state.activeGoalId = goal.id;
          saveState();
          renderUI();
          showToast(`Fokus aktif: ${goal.name}`);
        });

        // Delete Goal Handler
        const delBtn = item.querySelector('.btn-goal-delete');
        if (delBtn) {
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.running && goal.id === state.activeGoalId) {
              showToast('Tidak bisa menghapus aktivitas yang sedang berjalan.');
              return;
            }
            if (confirm(`Hapus target "${goal.name}"?`)) {
              state.goals = state.goals.filter((g) => g.id !== goal.id);
              if (state.activeGoalId === goal.id) {
                state.activeGoalId = state.goals[0].id;
              }
              saveState();
              renderUI();
              showToast(`Target "${goal.name}" dihapus.`);
            }
          });
        }

        container.appendChild(item);
      });
    }

    // 7. Mini Focus Log (Dashboard)
    if ($('sessionCount')) $('sessionCount').textContent = `${state.logs.length} sesi`;
    const miniLogContainer = $('historyListMini');
    if (miniLogContainer) {
      miniLogContainer.innerHTML = '';
      if (state.logs.length === 0) {
        miniLogContainer.innerHTML = `
          <div style="padding: 14px 4px; color: #8eaec5; font-size: 11.5px; text-align: center;">
            Belum ada sesi fokus tercatat hari ini. Mulai sesi pertamamu!
          </div>
        `;
      } else {
        const recent = state.logs.slice(-4).reverse();
        recent.forEach((log) => {
          const row = document.createElement('div');
          row.className = 'history-row';
          row.innerHTML = `
            <div class="history-row-dot"></div>
            <div class="history-row-info">
              <b>${log.name}</b>
              <small>${log.note || 'Sesi Fokus'} · ${formatRelativeTime(log.timestamp)}</small>
            </div>
            <div class="history-row-duration">${formatShort(log.duration)}</div>
          `;
          miniLogContainer.appendChild(row);
        });
      }
    }

    // 8. Full History & Analytics View Rendering
    renderAnalyticsView();
  };

  const renderAnalyticsView = () => {
    if ($('analyticsTotalSessions')) $('analyticsTotalSessions').textContent = state.logs.length;
    if ($('fullHistoryCount')) $('fullHistoryCount').textContent = `${state.logs.length} Sesi`;

    // Breakdown bars
    const breakdown = $('breakdownContainer');
    if (breakdown) {
      breakdown.innerHTML = '';
      const totalTime = state.goals.reduce((s, g) => s + g.progressSeconds, 0);

      state.goals.forEach((goal) => {
        const pct = totalTime > 0 ? Math.round((goal.progressSeconds / totalTime) * 100) : 0;
        const row = document.createElement('div');
        row.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span>${goal.icon || '✦'} <b>${goal.name}</b></span>
            <span style="color: var(--mint);">${formatShort(goal.progressSeconds)} (${pct}%)</span>
          </div>
          <div class="progress-track" style="margin-top: 0; height: 6px;">
            <span style="width: ${pct}%"></span>
          </div>
        `;
        breakdown.appendChild(row);
      });
    }

    // Full History Table
    const tbody = $('fullHistoryTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      if (state.logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--muted); padding: 20px;">Belum ada riwayat sesi fokus yang tersimpan.</td></tr>`;
      } else {
        state.logs.slice().reverse().forEach((log) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><b>${log.name}</b></td>
            <td style="color: var(--mint); font-weight: 700;">${formatShort(log.duration)}</td>
            <td style="color: var(--muted); font-size: 11.5px;">${log.note || 'Sesi Mandiri'}</td>
            <td style="color: #9ab4c8; font-size: 11.5px;">${new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
  };

  // --- Timer Actions ---
  const startTimer = () => {
    if (state.running) return;
    state.running = true;
    state.startedAt = Date.now();
    playChime('start');

    tickerInterval = setInterval(() => {
      const secs = Math.floor((Date.now() - state.startedAt) / 1000);
      const str = formatHMS(secs);
      if ($('mainTimer')) $('mainTimer').textContent = str;
      if ($('focusTimer')) $('focusTimer').textContent = str;
    }, 250);

    renderUI();
    const activeGoal = getActiveGoal();
    showToast(`Focus dimulai: ${activeGoal ? activeGoal.name : 'Sesi Fokus'}. Satu hal pada satu waktu.`);
  };

  const stopTimer = () => {
    if (!state.running) {
      showToast('Tekan Mulai untuk menjalankan sesi terlebih dahulu.');
      return;
    }

    const elapsed = Math.max(1, Math.floor((Date.now() - state.startedAt) / 1000));
    state.running = false;
    clearInterval(tickerInterval);
    tickerInterval = null;

    const activeGoal = getActiveGoal();
    if (activeGoal) {
      activeGoal.progressSeconds += elapsed;
      state.logs.push({
        id: `log-${Date.now()}`,
        goalId: activeGoal.id,
        name: activeGoal.name,
        duration: elapsed,
        timestamp: Date.now(),
        note: elapsed >= 3600 ? 'Deep focus flow' : 'Focused effort'
      });
    }

    playChime('finish');
    saveState();
    renderUI();
    showToast(`🎉 ${formatShort(elapsed)} tercatat untuk ${activeGoal.name}. Hebat!`);

    // Sinkronkan ke Supabase Cloud jika pengguna sedang login
    if (state.currentUser && window.ZliritDB && window.ZliritDB.isAvailable) {
      window.ZliritDB.addFocusLog(state.currentUser.id, {
        goalId: activeGoal.id,
        name: activeGoal.name,
        duration: elapsed,
        timestamp: Date.now()
      });
      window.ZliritDB.saveGoals(state.currentUser.id, state.goals);
      window.ZliritDB.saveUserStats(state.currentUser.id, state.currentUser.username, {
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        soundEnabled: state.soundEnabled
      });
    }
  };

  // --- Modal: Tambah Target Baru ---
  const openModal = () => {
    if (state.running) {
      showToast('Selesaikan timer sebelum menambah aktivitas baru.');
      return;
    }
    $('modalBackdrop').classList.add('show');
    $('goalNameInput').value = '';
    $('goalHoursInput').value = '1';
    $('goalNameInput').focus();
  };

  const closeModal = () => {
    $('modalBackdrop').classList.remove('show');
  };

  const handleSaveGoal = () => {
    const name = $('goalNameInput').value.trim();
    const hours = parseFloat($('goalHoursInput').value);

    if (!name) {
      showToast('Harap masukkan nama aktivitas.');
      $('goalNameInput').focus();
      return;
    }

    if (!Number.isFinite(hours) || hours <= 0 || hours > 12) {
      showToast('Durasi target harus antara 0.25 hingga 12 jam.');
      $('goalHoursInput').focus();
      return;
    }

    const targetSeconds = Math.round(hours * 3600);
    const newId = `goal-${Date.now()}`;

    const newGoal = {
      id: newId,
      name: name,
      targetSeconds: targetSeconds,
      progressSeconds: 0,
      icon: selectedModalIcon,
      sub: `Target harian ${hours} jam disiplin`
    };

    state.goals.push(newGoal);
    state.activeGoalId = newId;

    saveState();
    closeModal();
    renderUI();
    showToast(`Target baru "${name}" berhasil ditambahkan! 🚀`);

    // Simpan target baru ke cloud Supabase
    if (state.currentUser && window.ZliritDB && window.ZliritDB.isAvailable) {
      window.ZliritDB.saveGoals(state.currentUser.id, state.goals);
    }
  };

  // --- Settings Modal ---
  const openSettings = () => {
    $('settingsModal').classList.add('show');
    $('soundToggle').checked = state.soundEnabled;
  };

  const closeSettings = () => {
    $('settingsModal').classList.remove('show');
  };

  // --- Auth & Supabase Cloud Handlers ---
  const updateAuthUI = () => {
    const user = state.currentUser;
    const authBtn = $('userAuthBtn');
    const authIcon = $('userAuthIcon');
    const authLabel = $('userAuthLabel');
    const bannerUsername = $('bannerUsername');
    const profileUsernameDisplay = $('profileUsernameDisplay');

    if (user && user.username) {
      if (authBtn) authBtn.classList.add('logged-in');
      if (authIcon) authIcon.textContent = '⚡';
      if (authLabel) authLabel.textContent = user.username;
      if (bannerUsername) bannerUsername.textContent = `${user.username}.`;
      if (profileUsernameDisplay) profileUsernameDisplay.textContent = user.username;
    } else {
      if (authBtn) authBtn.classList.remove('logged-in');
      if (authIcon) authIcon.textContent = '👤';
      if (authLabel) authLabel.textContent = 'Masuk';
      if (bannerUsername) bannerUsername.textContent = 'Zlirit.';
      if (profileUsernameDisplay) profileUsernameDisplay.textContent = 'Pengguna';
    }
  };

  const openAuthModal = (defaultTab = 'login') => {
    authCurrentTab = defaultTab;
    const modal = $('authModal');
    if (!modal) return;
    modal.classList.add('show');
    switchAuthTab(authCurrentTab);
    const msgBox = $('authMsgBox');
    if (msgBox) {
      msgBox.style.display = 'none';
      msgBox.textContent = '';
      msgBox.className = 'auth-msg-box';
    }
    const userInput = $('authUsernameInput');
    if (userInput) {
      userInput.value = '';
      userInput.focus();
    }
    if ($('authPasswordInput')) $('authPasswordInput').value = '';
  };

  const closeAuthModal = () => {
    const modal = $('authModal');
    if (modal) modal.classList.remove('show');
  };

  const switchAuthTab = (tab) => {
    authCurrentTab = tab;
    const btnLogin = $('authTabLogin');
    const btnRegister = $('authTabRegister');
    const submitBtn = $('authSubmitBtn');
    const title = $('authModalTitle');

    if (btnLogin) btnLogin.classList.toggle('active', tab === 'login');
    if (btnRegister) btnRegister.classList.toggle('active', tab === 'register');

    if (tab === 'login') {
      if (submitBtn) submitBtn.textContent = 'Masuk Sekarang';
      if (title) title.textContent = 'Masuk ke Akun';
    } else {
      if (submitBtn) submitBtn.textContent = 'Daftar Akun Baru';
      if (title) title.textContent = 'Buat Akun Baru';
    }
  };

  const showAuthMsg = (msg, isError = true) => {
    const msgBox = $('authMsgBox');
    if (!msgBox) return;
    msgBox.textContent = msg;
    msgBox.className = `auth-msg-box ${isError ? 'error' : 'success'}`;
    msgBox.style.display = 'block';
  };

  const openProfileModal = () => {
    const modal = $('profileModal');
    if (!modal) return;
    modal.classList.add('show');
    updateAuthUI();
  };

  const closeProfileModal = () => {
    const modal = $('profileModal');
    if (modal) modal.classList.remove('show');
  };

  const syncWithCloud = async () => {
    if (!state.currentUser || !window.ZliritDB || !window.ZliritDB.isAvailable) return;
    try {
      const cloudData = await window.ZliritDB.loadUserData(state.currentUser.id);
      if (cloudData && cloudData.hasData) {
        if (cloudData.goals && cloudData.goals.length > 0) {
          state.goals = cloudData.goals;
        }
        if (cloudData.logs) {
          state.logs = cloudData.logs;
        }
        if (cloudData.stats) {
          if (typeof cloudData.stats.streak === 'number') state.streak = cloudData.stats.streak;
          if (cloudData.stats.lastActiveDate) state.lastActiveDate = cloudData.stats.lastActiveDate;
          if (typeof cloudData.stats.soundEnabled === 'boolean') state.soundEnabled = cloudData.stats.soundEnabled;
        }
        saveState();
        renderUI();
      } else {
        // First-time sync: push initial local data to Supabase
        await window.ZliritDB.saveGoals(state.currentUser.id, state.goals);
        await window.ZliritDB.saveUserStats(state.currentUser.id, state.currentUser.username, {
          streak: state.streak,
          lastActiveDate: state.lastActiveDate,
          soundEnabled: state.soundEnabled
        });
      }
    } catch (err) {
      console.warn('Sync cloud warning:', err);
    }
  };

  const handleAuthSubmit = async () => {
    const username = $('authUsernameInput').value.trim();
    const password = $('authPasswordInput').value;

    if (!username) {
      showAuthMsg('Harap masukkan username Anda.');
      return;
    }
    if (!password) {
      showAuthMsg('Harap masukkan password Anda.');
      return;
    }

    const submitBtn = $('authSubmitBtn');
    const origText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses...';

    try {
      if (authCurrentTab === 'login') {
        const res = await window.ZliritAuth.login(username, password);
        state.currentUser = {
          id: res.user.id,
          username: res.username
        };
        updateAuthUI();
        closeAuthModal();
        showToast(`Selamat datang kembali, ${res.username}! 🚀`);
        await syncWithCloud();
      } else {
        const res = await window.ZliritAuth.register(username, password);
        state.currentUser = {
          id: res.user.id,
          username: res.username
        };
        updateAuthUI();
        closeAuthModal();
        showToast(`Akun ${res.username} berhasil dibuat! Data otomatis tersinkron ke cloud.`);
        await syncWithCloud();
      }
    } catch (err) {
      showAuthMsg(err.message || 'Terjadi kesalahan saat memproses akun.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = origText;
    }
  };

  const handleLogout = async () => {
    if (confirm('Yakin ingin keluar dari akun?')) {
      try {
        await window.ZliritAuth.logout();
      } catch (e) {
        console.warn('Logout error:', e);
      }
      state.currentUser = null;
      updateAuthUI();
      closeProfileModal();
      showToast('Berhasil keluar dari akun.');
    }
  };

  // --- Event Listeners Setup ---
  const initListeners = () => {
    // Tab Navigation (Desktop + Mobile)
    document.querySelectorAll('.nav-pill').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    document.querySelectorAll('.bottom-nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Start / Stop buttons
    if ($('startBtn')) $('startBtn').addEventListener('click', startTimer);
    if ($('immersiveStartBtn')) $('immersiveStartBtn').addEventListener('click', startTimer);
    if ($('stopBtn')) $('stopBtn').addEventListener('click', stopTimer);
    if ($('immersiveStopBtn')) $('immersiveStopBtn').addEventListener('click', stopTimer);

    // Modal controls
    if ($('addGoalBtn')) $('addGoalBtn').addEventListener('click', openModal);
    if ($('bannerAddGoalBtn')) $('bannerAddGoalBtn').addEventListener('click', openModal);
    if ($('cancelModal')) $('cancelModal').addEventListener('click', closeModal);
    if ($('saveGoal')) $('saveGoal').addEventListener('click', handleSaveGoal);

    // Modal Backdrop click to close
    $('modalBackdrop').addEventListener('click', (e) => {
      if (e.target === $('modalBackdrop')) closeModal();
    });
    $('settingsModal').addEventListener('click', (e) => {
      if (e.target === $('settingsModal')) closeSettings();
    });

    // Enter key submit in modal
    $('goalNameInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSaveGoal();
    });
    $('goalHoursInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSaveGoal();
    });

    // Icon Selector in Modal
    document.querySelectorAll('.icon-opt').forEach((opt) => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.icon-opt').forEach((o) => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedModalIcon = opt.dataset.icon || '✦';
      });
    });

    // User Auth & Profile Modal Controls
    if ($('userAuthBtn')) {
      $('userAuthBtn').addEventListener('click', () => {
        if (state.currentUser) {
          openProfileModal();
        } else {
          openAuthModal('login');
        }
      });
    }

    if ($('settingsAuthBtn')) {
      $('settingsAuthBtn').addEventListener('click', () => {
        closeSettings();
        if (state.currentUser) {
          openProfileModal();
        } else {
          openAuthModal('login');
        }
      });
    }

    if ($('authTabLogin')) $('authTabLogin').addEventListener('click', () => switchAuthTab('login'));
    if ($('authTabRegister')) $('authTabRegister').addEventListener('click', () => switchAuthTab('register'));
    if ($('authSubmitBtn')) $('authSubmitBtn').addEventListener('click', handleAuthSubmit);
    if ($('closeAuthModalBtn')) $('closeAuthModalBtn').addEventListener('click', closeAuthModal);
    if ($('authModal')) {
      $('authModal').addEventListener('click', (e) => {
        if (e.target === $('authModal')) closeAuthModal();
      });
    }

    if ($('authUsernameInput')) {
      $('authUsernameInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAuthSubmit();
      });
    }
    if ($('authPasswordInput')) {
      $('authPasswordInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAuthSubmit();
      });
    }

    if ($('syncNowBtn')) {
      $('syncNowBtn').addEventListener('click', async () => {
        const btn = $('syncNowBtn');
        const orig = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Menyinkronkan...';
        await syncWithCloud();
        btn.disabled = false;
        btn.textContent = orig;
        showToast('Data berhasil disinkronkan ke cloud Supabase! 🟢');
      });
    }

    if ($('logoutBtn')) $('logoutBtn').addEventListener('click', handleLogout);
    if ($('closeProfileModalBtn')) $('closeProfileModalBtn').addEventListener('click', closeProfileModal);
    if ($('profileModal')) {
      $('profileModal').addEventListener('click', (e) => {
        if (e.target === $('profileModal')) closeProfileModal();
      });
    }

    // Settings actions
    if ($('openSettingsBtn')) $('openSettingsBtn').addEventListener('click', openSettings);
    if ($('closeSettingsBtn')) $('closeSettingsBtn').addEventListener('click', closeSettings);

    if ($('soundToggle')) {
      $('soundToggle').addEventListener('change', (e) => {
        state.soundEnabled = e.target.checked;
        saveState();
        showToast(state.soundEnabled ? 'Suara audio aktif' : 'Suara dinonaktifkan');
      });
    }

    // Export Data JSON
    if ($('exportDataBtn')) {
      $('exportDataBtn').addEventListener('click', () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `zliritdo-backup-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Data berhasil diekspor!');
      });
    }

    // Reset All Data
    if ($('resetAllDataBtn')) {
      $('resetAllDataBtn').addEventListener('click', () => {
        if (confirm('Yakin ingin mereset semua data aplikasi ZliritDo? Tindakan ini tidak dapat dibatalkan.')) {
          localStorage.removeItem(STORAGE_KEY);
          state = {
            goals: [...defaultGoals],
            activeGoalId: 'coding',
            running: false,
            startedAt: 0,
            sessionElapsed: 0,
            logs: [],
            streak: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            soundEnabled: true,
            currentUser: null
          };
          saveState();
          closeSettings();
          updateAuthUI();
          renderUI();
          showToast('Semua data berhasil direset ke pengaturan awal.');
        }
      });
    }

    // Reset Day (Mulai Hari Baru)
    if ($('resetDayBtn')) {
      $('resetDayBtn').addEventListener('click', () => {
        if (confirm('Mulai hari baru? Progres harian akan diatur ulang ke 0, tetapi target dan riwayat sesi tetap tersimpan.')) {
          state.goals.forEach((g) => (g.progressSeconds = 0));
          state.streak += 1;
          saveState();
          renderUI();
          showToast('Hari baru dimulai! Selamat berjuang mencapai target harimu! 🔥');

          if (state.currentUser && window.ZliritDB && window.ZliritDB.isAvailable) {
            window.ZliritDB.saveGoals(state.currentUser.id, state.goals);
            window.ZliritDB.saveUserStats(state.currentUser.id, state.currentUser.username, {
              streak: state.streak,
              lastActiveDate: state.lastActiveDate,
              soundEnabled: state.soundEnabled
            });
          }
        }
      });
    }

    // Motivational Quotes Rotation
    const quotes = [
      '“Disiplin bukan soal menunggu motivasi. Mulai aktivitas, jaga fokus, dan lihat progresmu terkumpul.”',
      '“You don’t have to be extreme. Just consistent.”',
      '“Discipline is choosing between what you want now and what you want most.”',
      '“Satu langkah kecil hari ini jauh lebih baik dari seribu rencana tanpa aksi.”',
      '“Fokus pada proses, hasil akan mengikuti dengan sendirinya.”',
      '“Waktu akan terus berjalan. Jadikan setiap jam bermakna.”'
    ];
    let qIdx = 0;
    setInterval(() => {
      qIdx = (qIdx + 1) % quotes.length;
      if ($('dailyQuote')) {
        $('dailyQuote').style.opacity = '0';
        setTimeout(() => {
          $('dailyQuote').textContent = quotes[qIdx];
          $('dailyQuote').style.opacity = '1';
        }, 300);
      }
    }, 16000);
  };

  // --- App Initialization ---
  const initApp = async () => {
    loadState();
    updateSystemClock();
    setInterval(updateSystemClock, 10000);
    initListeners();
    renderUI();

    // Check existing Supabase session
    if (window.ZliritAuth && window.ZliritAuth.isAvailable) {
      try {
        const user = await window.ZliritAuth.getCurrentUser();
        if (user) {
          state.currentUser = user;
          updateAuthUI();
          await syncWithCloud();
        }
      } catch (err) {
        console.warn('Cek sesi pengguna:', err);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
