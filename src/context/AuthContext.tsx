import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured, BACKEND_API_URL } from '../lib/supabase';

export type UserRole = 'mine_manager' | 'safety_officer' | 'shift_incharge' | 'mine_worker';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedZone: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d' | null;
  assignedShift?: string | null;
  workerId: string | null;
}

export interface DemoAccount {
  email: string;
  name: string;
  role: UserRole;
  assignedZone: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d' | null;
  assignedShift?: string | null;
  workerId: string | null;
  description: string;
  badgeColor: string;
}

export const DEMO_ACCOUNTS: Record<UserRole, DemoAccount> = {
  mine_manager: {
    email: 'manager@msafe.mine',
    name: 'Operations Director Rao',
    role: 'mine_manager',
    assignedZone: null,
    assignedShift: null,
    workerId: null,
    description: 'Org-wide full oversight. Manages all zones, safety officers, and creates worker profiles.',
    badgeColor: 'bg-slate-900 text-slate-200 border-slate-700',
  },
  safety_officer: {
    email: 'safety@msafe.mine',
    name: 'Chief Safety Inspector Roy',
    role: 'safety_officer',
    assignedZone: null,
    assignedShift: null,
    workerId: null,
    description: 'Cross-shift safety oversight. Audits PPE, reviews incident trends, creates/edits workers.',
    badgeColor: 'bg-slate-900 text-cyan-300 border-cyan-800',
  },
  shift_incharge: {
    email: 'incharge@msafe.mine',
    name: 'Shift In-Charge Meena',
    role: 'shift_incharge',
    assignedZone: null, // Zone is NOT fixed for Shift In-Charge!
    assignedShift: 'Shift A', // Shift IS fixed!
    workerId: null,
    description: 'Statutory operational command for Shift A across all subterranean zones (A, B, C, D).',
    badgeColor: 'bg-slate-900 text-amber-300 border-amber-800',
  },
  mine_worker: {
    email: 'worker@msafe.mine',
    name: 'Deepika',
    role: 'mine_worker',
    assignedZone: 'zone-c',
    assignedShift: 'Shift A',
    workerId: 'W001',
    description: 'Underground miner (W001). Accesses personal vitals, PPE status, and SOS distress beacon.',
    badgeColor: 'bg-slate-900 text-emerald-300 border-emerald-800',
  },
};

interface RegisterParams {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  assignedZone?: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d' | null;
  workerId?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  assignedZone: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d' | null;
  assignedShift: string | null;
  workerId: string | null;
  isAuthenticated: boolean;
  canCreateWorker: boolean;
  canManageOfficers: boolean;
  canDispatchRescue: boolean;
  isScopedToShift: boolean;
  isScopedToZone: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (params: RegisterParams) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRoleDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'msafe_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Mine Manager for initial convenience, or load from localStorage
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse saved auth session:', e);
    }
    // Default initial user for development
    return {
      id: 'demo-manager-001',
      email: DEMO_ACCOUNTS.mine_manager.email,
      name: DEMO_ACCOUNTS.mine_manager.name,
      role: 'mine_manager',
      assignedZone: null,
      workerId: null,
    };
  });

  // Keep state synced with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Listen to Supabase Auth state if configured
  useEffect(() => {
    const client = supabase;
    if (!client || !isSupabaseConfigured) return;

    const { data: authListener } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userEmail = session.user.email || '';
        // Look up role in user_roles table
        const { data: roleData } = await client
          .from('user_roles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (roleData) {
          setUser({
            id: session.user.id,
            email: userEmail,
            name: roleData.name || userEmail.split('@')[0],
            role: roleData.role,
            assignedZone: roleData.assigned_zone,
            workerId: roleData.worker_id,
          });
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    // 1. Try Backend API Auth Verification (connected to Supabase)
    if (password) {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const result = await res.json();
          if (result.user) {
            setUser({
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
              role: result.user.role,
              assignedZone: result.user.assignedZone,
              workerId: result.user.workerId,
            });
            return { success: true };
          }
        } else {
          const errData = await res.json();
          return {
            success: false,
            error:
              'Invalid credentials — contact your Safety Officer/Mine Manager for account access',
          };
        }
      } catch (err: any) {
        console.warn('Backend login endpoint unavailable, trying direct Supabase client:', err);
      }
    }

    // 2. Direct Supabase Client fallback
    if (supabase && isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return {
            success: false,
            error:
              'Invalid credentials — contact your Safety Officer/Mine Manager for account access',
          };
        } else if (data.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('*')
            .eq('email', email)
            .single();

          setUser({
            id: data.user.id,
            email: data.user.email || email,
            name: roleData?.name || email.split('@')[0],
            role: roleData?.role || 'mine_manager',
            assignedZone: roleData?.assigned_zone || null,
            workerId: roleData?.worker_id || null,
          });
          return { success: true };
        }
      } catch (err: any) {
        return {
          success: false,
          error:
            'Invalid credentials — contact your Safety Officer/Mine Manager for account access',
        };
      }
    }

    // 3. Fallback / Demo Account Matcher (for testing without backend)
    const matchedAccount = Object.values(DEMO_ACCOUNTS).find(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );

    if (matchedAccount) {
      setUser({
        id: `demo-${matchedAccount.role}`,
        email: matchedAccount.email,
        name: matchedAccount.name,
        role: matchedAccount.role,
        assignedZone: matchedAccount.assignedZone,
        workerId: matchedAccount.workerId,
      });
      return { success: true };
    }

    return {
      success: false,
      error:
        'Invalid credentials — contact your Safety Officer/Mine Manager for account access',
    };
  };

  const register = async (params: RegisterParams): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Registration failed' };
      }

      const result = await res.json();
      if (result.user) {
        setUser({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          assignedZone: result.user.assigned_zone,
          workerId: result.user.worker_id,
        });
        return { success: true };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  };

  const logout = () => {
    if (supabase && isSupabaseConfigured) {
      supabase.auth.signOut();
    }
    setUser(null);
  };

  const switchRoleDemo = (targetRole: UserRole) => {
    const account = DEMO_ACCOUNTS[targetRole];
    setUser({
      id: `demo-${targetRole}`,
      email: account.email,
      name: account.name,
      role: account.role,
      assignedZone: account.assignedZone,
      assignedShift: account.assignedShift || null,
      workerId: account.workerId,
    });
    console.log(`🔑 [RBAC] Switched active role to: ${targetRole.toUpperCase()}`);
  };

  const role = user?.role || 'mine_worker';
  const assignedZone = user?.assignedZone || null;
  const assignedShift = user?.assignedShift || (role === 'shift_incharge' ? 'Shift A' : null);
  const workerId = user?.workerId || null;
  const isAuthenticated = Boolean(user);

  // RBAC Permission Gates based on User Specification
  const canCreateWorker = role === 'mine_manager' || role === 'safety_officer';
  const canManageOfficers = role === 'mine_manager';
  const canDispatchRescue = role !== 'mine_worker';
  // FOR SHIFT IN CHARGE: Zone is NOT fixed (can access all zones). Shift IS fixed (Shift A).
  const isScopedToShift = role === 'shift_incharge';
  const isScopedToZone = false;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        assignedZone,
        assignedShift,
        workerId,
        isAuthenticated,
        canCreateWorker,
        canManageOfficers,
        canDispatchRescue,
        isScopedToShift,
        isScopedToZone,
        login,
        register,
        logout,
        switchRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
