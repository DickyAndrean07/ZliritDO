/**
 * ZliritDo — Supabase Cloud Integration Module
 * Handles Authentication (Username + Password) & Cloud Data Sync
 */

(() => {
  'use strict';

  // --- Supabase Credentials ---
  const SUPABASE_URL = 'https://mcydvcliamjujjofddee.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jeWR2Y2xpYW1qdWpqb2ZkZGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NzMzOTYsImV4cCI6MjEwNzQ0OTM5Nn0.wy7KrkuRjNTJyxJXBwm5c1IyFojFxJgqi6rpI55KPw8';

  // Helper to map simple username to Supabase internal email
  const usernameToEmail = (username) => {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    return `${clean}@zliritdo.internal`;
  };

  // Check if Supabase JS SDK is loaded
  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    console.warn('Supabase JS SDK belum dimuat. Fitur cloud berjalan dalam mode offline.');
    window.ZliritAuth = { isAvailable: false };
    window.ZliritDB = { isAvailable: false };
    return;
  }

  // Initialize client
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });

  // --- Auth Service ---
  const ZliritAuth = {
    isAvailable: true,
    client: supabase,

    // Register with username and password
    async register(username, password) {
      username = username.trim();
      if (!username || username.length < 3) {
        throw new Error('Username minimal 3 karakter.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password minimal 6 karakter.');
      }

      const email = usernameToEmail(username);

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) {
        // Helpful error translation
        if (error.message.includes('User already registered')) {
          throw new Error('Username ini sudah terdaftar. Silakan pilih "Masuk".');
        }
        if (error.message.includes('Email signups are disabled') || error.code === 'email_provider_disabled') {
          throw new Error('Provider Email belum aktif di Supabase. Buka Auth > Providers > Email, lalu aktifkan "Enable Email provider" & "Allow new users to sign up".');
        }
        throw new Error(error.message);
      }

      // If confirm email is still required by project settings
      if (data?.user && !data?.session) {
        return {
          user: data.user,
          username: username,
          needsEmailConfirm: true
        };
      }

      return {
        user: data.user,
        username: username,
        session: data.session
      };
    },

    // Login with username and password
    async login(username, password) {
      username = username.trim();
      if (!username || !password) {
        throw new Error('Harap masukkan username dan password.');
      }

      const email = usernameToEmail(username);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Username atau password salah.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Akun memerlukan konfirmasi email. Harap matikan "Confirm email" di dashboard Supabase.');
        }
        throw new Error(error.message);
      }

      const displayUsername = data.user?.user_metadata?.username || username;
      return {
        user: data.user,
        username: displayUsername,
        session: data.session
      };
    },

    // Sign out
    async logout() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    },

    // Get current session user
    async getCurrentUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return null;
      return {
        id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username || session.user.email.split('@')[0]
      };
    },

    // Listener for auth state changes
    onAuthStateChange(callback) {
      return supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          callback({
            event,
            user: {
              id: session.user.id,
              email: session.user.email,
              username: session.user.user_metadata?.username || session.user.email.split('@')[0]
            }
          });
        } else {
          callback({ event, user: null });
        }
      });
    }
  };

  // --- Database Synchronization Service ---
  const ZliritDB = {
    isAvailable: true,
    client: supabase,

    // Fetch user data from Cloud
    async loadUserData(userId) {
      try {
        const [goalsRes, logsRes, statsRes] = await Promise.all([
          supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
          supabase.from('focus_logs').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(100),
          supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle()
        ]);

        if (goalsRes.error) {
          console.warn('Gagal membaca tabel goals:', goalsRes.error.message);
          return null;
        }

        const goals = (goalsRes.data || []).map(g => ({
          id: g.id,
          name: g.name,
          targetSeconds: g.target_seconds,
          progressSeconds: g.progress_seconds,
          icon: g.icon || '🎯',
          sub: g.sub || ''
        }));

        const logs = (logsRes.data || []).map(l => ({
          id: l.id,
          goalId: l.goal_id,
          name: l.goal_name,
          duration: l.seconds,
          note: l.seconds >= 3600 ? 'Deep focus flow' : 'Focused effort',
          date: l.date,
          timestamp: Number(l.timestamp)
        }));

        const stats = statsRes.data ? {
          streak: statsRes.data.streak ?? 1,
          lastActiveDate: statsRes.data.last_active_date,
          soundEnabled: statsRes.data.sound_enabled ?? true
        } : null;

        return {
          hasData: goals.length > 0 || logs.length > 0 || stats !== null,
          goals,
          logs,
          stats
        };
      } catch (err) {
        console.error('Error saat load data dari Supabase:', err);
        return null;
      }
    },

    // Sync all local goals to Cloud
    async saveGoals(userId, goals) {
      if (!userId || !goals || !goals.length) return;
      try {
        const rows = goals.map(g => ({
          id: g.id,
          user_id: userId,
          name: g.name,
          target_seconds: g.targetSeconds,
          progress_seconds: g.progressSeconds,
          icon: g.icon,
          sub: g.sub
        }));

        const { error } = await supabase.from('goals').upsert(rows, { onConflict: 'id,user_id' });
        if (error) console.warn('Supabase upsert goals:', error.message);
      } catch (err) {
        console.error('Error simpan goals ke Supabase:', err);
      }
    },

    // Record a completed focus session
    async addFocusLog(userId, logItem) {
      if (!userId || !logItem) return;
      try {
        const row = {
          user_id: userId,
          goal_id: logItem.goalId,
          goal_name: logItem.name,
          seconds: logItem.duration,
          date: logItem.date || new Date(logItem.timestamp).toISOString().split('T')[0],
          timestamp: logItem.timestamp
        };

        const { error } = await supabase.from('focus_logs').insert(row);
        if (error) console.warn('Supabase insert focus_log:', error.message);
      } catch (err) {
        console.error('Error simpan log ke Supabase:', err);
      }
    },

    // Save user stats (streak, sound)
    async saveUserStats(userId, username, stats) {
      if (!userId) return;
      try {
        const row = {
          user_id: userId,
          username: username,
          streak: stats.streak || 1,
          last_active_date: stats.lastActiveDate,
          sound_enabled: stats.soundEnabled,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('user_stats').upsert(row, { onConflict: 'user_id' });
        if (error) console.warn('Supabase upsert user_stats:', error.message);
      } catch (err) {
        console.error('Error simpan stats ke Supabase:', err);
      }
    }
  };

  window.ZliritAuth = ZliritAuth;
  window.ZliritDB = ZliritDB;
})();
