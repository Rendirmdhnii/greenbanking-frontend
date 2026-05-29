import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { supabase } from '@/utils/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const UserContext = createContext<any>(null);

export function useUserContext() {
  return useContext(UserContext);
}

export function useUserData() {
  const [userData, setUserData] = useState<any>(null);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const hasSynced = useRef(false);

  // ═══════════════════════════════════════════════
  //  Sync Google user ke MySQL via POST /api/sync-google
  // ═══════════════════════════════════════════════
  const syncGoogleToLaravel = async (user: any) => {
    if (hasSynced.current) return;
    hasSynced.current = true;
    try {
      setSyncStatus('syncing');
      const res = await fetch(`${API_URL}/sync-google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          google_id: user.id,
          avatar: user.user_metadata?.avatar_url,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUserData(data);
      setSyncStatus('success');
      if (data.token) localStorage.setItem('token', data.token);
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus('error');
    }
  };

  // ═══════════════════════════════════════════════
  //  Fetch profil dari MySQL via GET /api/user/profile
  //  Digunakan untuk login manual (token ada di localStorage)
  // ═══════════════════════════════════════════════
  const fetchProfileWithToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      setSyncStatus('syncing');
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        // Token expired/invalid — hapus
        if (res.status === 401) localStorage.removeItem('token');
        return false;
      }

      const data = await res.json();
      setUserData(data);
      setSyncStatus('success');
      hasSynced.current = true;
      return true;
    } catch (e) {
      console.error("Profile fetch error:", e);
      return false;
    }
  };

  // ═══════════════════════════════════════════════
  //  INIT: Cek login manual dulu → lalu cek Supabase
  // ═══════════════════════════════════════════════
  const init = async () => {
    // 1. Coba login via token (manual login)
    const hasProfile = await fetchProfileWithToken();

    if (!hasProfile) {
      // 2. Cek Supabase session (Google login)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setSupabaseUser(user);
          await syncGoogleToLaravel(user);
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setSupabaseUser(session.user);
            await syncGoogleToLaravel(session.user);
          }
        }
      } catch (e) {
        console.error("Supabase check error:", e);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        setSupabaseUser(session.user);
        setIsLoading(false);
        syncGoogleToLaravel(session.user);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('token');
        window.location.href = "/login";
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ═══════════════════════════════════════════════
  //  Derived state — SEMUA dari MySQL
  // ═══════════════════════════════════════════════
  const isAdmin      = userData?.is_admin || userData?.user?.is_admin || false;
  const userName     = userData?.user?.name || userData?.name || supabaseUser?.user_metadata?.full_name || 'Nasabah GreenBanking';
  const userEmail    = userData?.user?.email || userData?.email || supabaseUser?.email || '';
  const userBalance  = userData?.user?.balance ?? userData?.balance ?? 0;
  const userEcoPoints = userData?.user?.eco_points ?? userData?.eco_points ?? 0;
  const userLifetimeEcoPoints = userData?.user?.lifetime_eco_points ?? userData?.lifetime_eco_points ?? 0;
  const impactScore  = userData?.user?.impact_score ?? userData?.impact_score ?? 0;
  const accountNumber = userData?.user?.account_number || userData?.account_number || '';
  const totalDonation = userData?.total_donation || 0;

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const initials   = getInitials(userName);
  
  // FIX: prioritaskan foto profil database lokalan tinimbang google/supabase
  let avatarUrl  = userData?.user?.avatar || userData?.avatar || supabaseUser?.user_metadata?.avatar_url || "";
  
  // Lek path foto profile lokal (misal dimulai karo /uploads), tambahi host url backend e rek ben gak pecah fotone
  if (avatarUrl && !avatarUrl.startsWith('http')) {
    avatarUrl = `${API_URL.replace('/api', '')}${avatarUrl}`;
  }

  // FIX: Cek Level Tier Poin Dinamis rek ben sinkron visual global secara real-time
  let tier = 'BASIC';
  if (userLifetimeEcoPoints > 5000) {
    tier = 'PRIORITAS';
  } else if (userLifetimeEcoPoints >= 2001) {
    tier = 'PLATINUM';
  }

  const phoneNumber = userData?.user?.phone || userData?.phone || "";
  const address    = userData?.user?.address || userData?.address || "";
  const isOwner    = userEmail === 'muhammadrendiaf06@gmail.com';

  return {
    userData, supabaseUser, isLoading, syncStatus,
    isAdmin, userName, userEmail, userBalance, userEcoPoints, userLifetimeEcoPoints, avatarUrl, initials,
    tier, impactScore, phoneNumber, address, accountNumber, totalDonation, isOwner,
    refreshUserData: (newUserData?: any) => {
      if (newUserData) {
        setUserData((prev: any) => {
          if (!prev) return prev;
          
          // Jika backend mengirimkan objek user penuh, langsung override state
          const updated = { ...prev };
          if (updated.user && newUserData.user) {
            updated.user = { ...updated.user, ...newUserData.user };
          } else if (newUserData.user) {
             updated.user = newUserData.user;
          } else {
            updated.user = { ...updated.user, ...newUserData };
          }
          
          return updated;
        });
      } else {
        hasSynced.current = false;
        init();
      }
    }
  };
}
