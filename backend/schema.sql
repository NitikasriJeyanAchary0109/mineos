-- ==============================================================================
-- IRON MINDS — M-SAFE DATABASE SCHEMA (SUPABASE POSTGRES + RBAC)
-- ==============================================================================

-- 1. WORKERS TABLE (Registered miners & personnel)
CREATE TABLE IF NOT EXISTS workers (
  worker_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rfid_tag TEXT UNIQUE NOT NULL,
  shift TEXT NOT NULL,
  assigned_zone TEXT NOT NULL CHECK (assigned_zone IN ('zone-a', 'zone-b', 'zone-c', 'zone-d')),
  contact_number TEXT,
  photo_url TEXT,
  helmet_device_id TEXT,
  wearable_device_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER ROLES TABLE (RBAC Hierarchy)
-- Roles:
-- 1. mine_manager: Full org-wide access, creates workers, manages accounts
-- 2. safety_officer: Cross-shift compliance, creates workers, alert review
-- 3. shift_incharge: Scoped to assigned_zone / shift only
-- 4. mine_worker: Self-scoped to worker_id only
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('mine_manager', 'safety_officer', 'shift_incharge', 'mine_worker')) NOT NULL,
  assigned_zone TEXT CHECK (assigned_zone IN ('zone-a', 'zone-b', 'zone-c', 'zone-d')),
  worker_id TEXT REFERENCES workers(worker_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PPE ENTRY LOGS (Jetson Face + PPE Detection Camera)
CREATE TABLE IF NOT EXISTS ppe_entry_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT REFERENCES workers(worker_id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  helmet BOOLEAN NOT NULL DEFAULT false,
  vest BOOLEAN NOT NULL DEFAULT false,
  gloves BOOLEAN NOT NULL DEFAULT false,
  compliant BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ENVIRONMENT READINGS (Underground MQ Multi-gas Sensor Stations)
CREATE TABLE IF NOT EXISTS environment_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id TEXT NOT NULL CHECK (zone_id IN ('zone-a', 'zone-b', 'zone-c', 'zone-d')),
  mq2 NUMERIC NOT NULL,
  mq4 NUMERIC NOT NULL,
  mq9 NUMERIC NOT NULL,
  mq135 NUMERIC NOT NULL,
  mq7 NUMERIC NOT NULL,
  temperature NUMERIC NOT NULL,
  flame_detected BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. WEARABLE READINGS (ESP32 Health + MPU6050 Motion)
CREATE TABLE IF NOT EXISTS wearable_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT REFERENCES workers(worker_id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  heart_rate INTEGER NOT NULL,
  spo2 INTEGER NOT NULL DEFAULT 98,
  accel_x NUMERIC NOT NULL DEFAULT 0,
  accel_y NUMERIC NOT NULL DEFAULT 0,
  accel_z NUMERIC NOT NULL DEFAULT 1,
  fall_detected BOOLEAN NOT NULL DEFAULT false,
  sos_triggered BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. HELMET STATUS (Continuous In-Helmet Sensor Check)
CREATE TABLE IF NOT EXISTS helmet_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT REFERENCES workers(worker_id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  helmet_worn BOOLEAN NOT NULL DEFAULT true,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ALERTS TABLE (Realtime Safety Hazards)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT REFERENCES workers(worker_id) ON DELETE SET NULL,
  worker_name TEXT,
  zone_id TEXT CHECK (zone_id IN ('zone-a', 'zone-b', 'zone-c', 'zone-d')),
  type TEXT NOT NULL CHECK (type IN ('ppe', 'gas', 'fall', 'health', 'sos', 'system')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workers_zone ON workers(assigned_zone);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);
CREATE INDEX IF NOT EXISTS idx_wearables_worker_ts ON wearable_readings(worker_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_environment_zone_ts ON environment_readings(zone_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity_resolved ON alerts(severity, resolved);

-- ==============================================================================
-- SUPABASE REALTIME REPLICATION
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE wearable_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE environment_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE ppe_entry_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE helmet_status;
ALTER PUBLICATION supabase_realtime ADD TABLE workers;

-- ==============================================================================
-- RBAC SECURITY HELPER FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_auth_role() RETURNS text AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email' 
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_zone() RETURNS text AS $$
  SELECT assigned_zone FROM public.user_roles 
  WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email' 
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_worker_id() RETURNS text AS $$
  SELECT worker_id FROM public.user_roles 
  WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email' 
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppe_entry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE helmet_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 1. WORKERS TABLE
-- Mine Manager & Safety Officer can view, create, edit
CREATE POLICY "Manager and Officer full workers access" ON workers
  FOR ALL
  USING (
    get_auth_role() IN ('mine_manager', 'safety_officer') 
    OR auth.role() = 'service_role' 
    OR auth.uid() IS NULL -- Local dev fallback
  );

-- Shift In-Charge can read workers in their assigned zone
CREATE POLICY "Shift Incharge read zone workers" ON workers
  FOR SELECT
  USING (
    get_auth_role() = 'shift_incharge' AND assigned_zone = get_auth_zone()
  );

-- Mine Worker can read their own profile
CREATE POLICY "Mine Worker read own profile" ON workers
  FOR SELECT
  USING (
    get_auth_role() = 'mine_worker' AND worker_id = get_auth_worker_id()
  );

-- 2. USER_ROLES TABLE
-- Only Mine Manager can view and manage user roles
CREATE POLICY "Manager manage user roles" ON user_roles
  FOR ALL
  USING (
    get_auth_role() = 'mine_manager' 
    OR auth.role() = 'service_role'
    OR auth.uid() IS NULL
  );

-- Users can read their own role
CREATE POLICY "User read own role" ON user_roles
  FOR SELECT
  USING (
    user_id = auth.uid() OR email = auth.jwt() ->> 'email'
  );

-- 3. WEARABLE READINGS & HELMET STATUS
CREATE POLICY "Wearables manager officer access" ON wearable_readings
  FOR SELECT
  USING (
    get_auth_role() IN ('mine_manager', 'safety_officer')
    OR auth.role() = 'service_role'
    OR auth.uid() IS NULL
  );

CREATE POLICY "Wearables incharge zone access" ON wearable_readings
  FOR SELECT
  USING (
    get_auth_role() = 'shift_incharge' 
    AND worker_id IN (SELECT worker_id FROM workers WHERE assigned_zone = get_auth_zone())
  );

CREATE POLICY "Wearables worker self access" ON wearable_readings
  FOR SELECT
  USING (
    get_auth_role() = 'mine_worker' AND worker_id = get_auth_worker_id()
  );

-- 4. ENVIRONMENT READINGS
CREATE POLICY "Environment manager officer access" ON environment_readings
  FOR SELECT
  USING (
    get_auth_role() IN ('mine_manager', 'safety_officer')
    OR auth.role() = 'service_role'
    OR auth.uid() IS NULL
  );

CREATE POLICY "Environment incharge zone access" ON environment_readings
  FOR SELECT
  USING (
    get_auth_role() = 'shift_incharge' AND zone_id = get_auth_zone()
  );

CREATE POLICY "Environment worker zone access" ON environment_readings
  FOR SELECT
  USING (
    get_auth_role() = 'mine_worker' 
    AND zone_id IN (SELECT assigned_zone FROM workers WHERE worker_id = get_auth_worker_id())
  );

-- 5. ALERTS TABLE
CREATE POLICY "Alerts manager officer full access" ON alerts
  FOR ALL
  USING (
    get_auth_role() IN ('mine_manager', 'safety_officer')
    OR auth.role() = 'service_role'
    OR auth.uid() IS NULL
  );

CREATE POLICY "Alerts incharge zone access" ON alerts
  FOR ALL
  USING (
    get_auth_role() = 'shift_incharge' AND zone_id = get_auth_zone()
  );

CREATE POLICY "Alerts worker self access" ON alerts
  FOR SELECT
  USING (
    get_auth_role() = 'mine_worker' AND worker_id = get_auth_worker_id()
  );

-- ==============================================================================
-- STORAGE BUCKET FOR WORKER FACE ENROLLMENT PHOTOS
-- ==============================================================================
-- In Supabase dashboard: Create bucket 'worker-photos' (public read: true)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('worker-photos', 'worker-photos', true) ON CONFLICT DO NOTHING;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================
INSERT INTO workers (worker_id, name, rfid_tag, shift, assigned_zone, status) VALUES
  ('W001', 'Deepika', 'RFID-W001-D1', 'Shift A (06:00 - 14:00)', 'zone-c', 'active'),
  ('WM-8492', 'Vikram Nayak', 'RFID-9842-X1', 'Shift A (06:00 - 14:00)', 'zone-c', 'active'),
  ('WM-6288', 'Sunil Marandi', 'RFID-6288-F4', 'Shift A (06:00 - 14:00)', 'zone-c', 'active'),
  ('WM-7319', 'Rajesh Kumar', 'RFID-7319-M8', 'Shift A (06:00 - 14:00)', 'zone-b', 'active'),
  ('WM-5104', 'Amit Sengupta', 'RFID-5104-V2', 'Shift A (06:00 - 14:00)', 'zone-d', 'active'),
  ('WM-9021', 'Devendra Sharma', 'RFID-9021-H9', 'Shift A (06:00 - 14:00)', 'zone-a', 'active'),
  ('WM-3412', 'Priya Patel', 'RFID-3412-P3', 'Shift A (06:00 - 14:00)', 'zone-b', 'active')
ON CONFLICT (worker_id) DO UPDATE SET
  name = EXCLUDED.name,
  rfid_tag = EXCLUDED.rfid_tag,
  shift = EXCLUDED.shift,
  assigned_zone = EXCLUDED.assigned_zone,
  status = EXCLUDED.status;

-- Seed Demo User Roles
INSERT INTO user_roles (email, name, role, assigned_zone, worker_id) VALUES
  ('manager@msafe.mine', 'Operations Director Rao', 'mine_manager', NULL, NULL),
  ('safety@msafe.mine', 'Chief Safety Inspector Roy', 'safety_officer', NULL, NULL),
  ('incharge@msafe.mine', 'Shift In-Charge Meena', 'shift_incharge', 'zone-c', NULL),
  ('worker@msafe.mine', 'Deepika (Underground Miner)', 'mine_worker', 'zone-c', 'W001')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  assigned_zone = EXCLUDED.assigned_zone,
  worker_id = EXCLUDED.worker_id;

-- Initial Environment Baseline Readings per Zone
INSERT INTO environment_readings (zone_id, mq2, mq4, mq9, mq135, mq7, temperature, flame_detected, timestamp) VALUES
  ('zone-a', 45, 120, 35, 60, 15, 23.5, false, NOW()),
  ('zone-b', 52, 140, 42, 65, 18, 26.8, false, NOW()),
  ('zone-c', 78, 260, 58, 85, 28, 31.2, false, NOW()),
  ('zone-d', 40, 110, 30, 55, 12, 28.4, false, NOW());
