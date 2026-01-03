-- Admin Users & Multi-User System
-- Allows multiple admin users with role-based access control

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  role VARCHAR(20) NOT NULL DEFAULT 'staff', -- 'super_admin', 'admin', 'manager', 'staff'
  permissions JSONB DEFAULT '{}', -- Granular permissions
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table (for tracking active sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs (audit trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete'
  entity_type VARCHAR(50), -- 'phone', 'order', 'customer', etc.
  entity_id UUID,
  description TEXT,
  ip_address VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- Function to hash password using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create password hash
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(password || 'mobilehub_salt_2026', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash_password(password) = hash;
END;
$$ LANGUAGE plpgsql;

-- Insert default super admin user (password: admin123)
INSERT INTO admin_users (username, email, password_hash, full_name, role, permissions, is_active)
VALUES (
  'admin',
  'admin@mobilehub.delhi',
  hash_password('admin123'),
  'Super Admin',
  'super_admin',
  '{
    "dashboard": {"read": true},
    "inventory": {"read": true, "write": true, "delete": true},
    "customers": {"read": true, "write": true, "delete": true},
    "orders": {"read": true, "write": true, "delete": true},
    "inquiries": {"read": true, "write": true, "delete": true},
    "leads": {"read": true, "write": true, "delete": true},
    "marketing": {"read": true, "write": true, "delete": true},
    "conversations": {"read": true, "write": true},
    "settings": {"read": true, "write": true},
    "users": {"read": true, "write": true, "delete": true}
  }'::jsonb,
  true
)
ON CONFLICT (username) DO NOTHING;

-- Insert sample manager user (password: manager123)
INSERT INTO admin_users (username, email, password_hash, full_name, role, permissions, is_active)
VALUES (
  'manager',
  'manager@mobilehub.delhi',
  hash_password('manager123'),
  'Store Manager',
  'manager',
  '{
    "dashboard": {"read": true},
    "inventory": {"read": true, "write": true, "delete": false},
    "customers": {"read": true, "write": true, "delete": false},
    "orders": {"read": true, "write": true, "delete": false},
    "inquiries": {"read": true, "write": true, "delete": false},
    "leads": {"read": true, "write": true, "delete": false},
    "marketing": {"read": true, "write": false},
    "conversations": {"read": true, "write": true},
    "settings": {"read": true, "write": false},
    "users": {"read": false, "write": false, "delete": false}
  }'::jsonb,
  true
)
ON CONFLICT (username) DO NOTHING;

-- Insert sample staff user (password: staff123)
INSERT INTO admin_users (username, email, password_hash, full_name, role, permissions, is_active)
VALUES (
  'staff',
  'staff@mobilehub.delhi',
  hash_password('staff123'),
  'Store Staff',
  'staff',
  '{
    "dashboard": {"read": true},
    "inventory": {"read": true, "write": false, "delete": false},
    "customers": {"read": true, "write": false, "delete": false},
    "orders": {"read": true, "write": false, "delete": false},
    "inquiries": {"read": true, "write": true, "delete": false},
    "leads": {"read": true, "write": false, "delete": false},
    "marketing": {"read": false, "write": false},
    "conversations": {"read": true, "write": true},
    "settings": {"read": false, "write": false},
    "users": {"read": false, "write": false, "delete": false}
  }'::jsonb,
  true
)
ON CONFLICT (username) DO NOTHING;

-- Role permission presets (for reference when creating new users)
CREATE TABLE IF NOT EXISTS role_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO role_presets (role, display_name, description, permissions) VALUES
  ('super_admin', 'Super Admin', 'Full access to all features including user management', '{
    "dashboard": {"read": true},
    "inventory": {"read": true, "write": true, "delete": true},
    "customers": {"read": true, "write": true, "delete": true},
    "orders": {"read": true, "write": true, "delete": true},
    "inquiries": {"read": true, "write": true, "delete": true},
    "leads": {"read": true, "write": true, "delete": true},
    "marketing": {"read": true, "write": true, "delete": true},
    "conversations": {"read": true, "write": true},
    "settings": {"read": true, "write": true},
    "users": {"read": true, "write": true, "delete": true}
  }'::jsonb),
  ('admin', 'Admin', 'Full access except user management', '{
    "dashboard": {"read": true},
    "inventory": {"read": true, "write": true, "delete": true},
    "customers": {"read": true, "write": true, "delete": true},
    "orders": {"read": true, "write": true, "delete": true},
    "inquiries": {"read": true, "write": true, "delete": true},
    "leads": {"read": true, "write": true, "delete": true},
    "marketing": {"read": true, "write": true, "delete": true},
    "conversations": {"read": true, "write": true},
    "settings": {"read": true, "write": true},
    "users": {"read": true, "write": false, "delete": false}
  }'::jsonb),
  ('manager', 'Manager', 'Manage inventory, orders, and customers', '{
    "dashboard": {"read": true},
    "inventory": {"read": true, "write": true, "delete": false},
    "customers": {"read": true, "write": true, "delete": false},
    "orders": {"read": true, "write": true, "delete": false},
    "inquiries": {"read": true, "write": true, "delete": false},
    "leads": {"read": true, "write": true, "delete": false},
    "marketing": {"read": true, "write": false},
    "conversations": {"read": true, "write": true},
    "settings": {"read": true, "write": false},
    "users": {"read": false, "write": false, "delete": false}
  }'::jsonb),
  ('staff', 'Staff', 'View-only access with limited actions', '{
    "dashboard": {"read": true},
    "inventory": {"read": true, "write": false, "delete": false},
    "customers": {"read": true, "write": false, "delete": false},
    "orders": {"read": true, "write": false, "delete": false},
    "inquiries": {"read": true, "write": true, "delete": false},
    "leads": {"read": true, "write": false, "delete": false},
    "marketing": {"read": false, "write": false},
    "conversations": {"read": true, "write": true},
    "settings": {"read": false, "write": false},
    "users": {"read": false, "write": false, "delete": false}
  }'::jsonb)
ON CONFLICT (role) DO NOTHING;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_admin_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_users_timestamp
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_timestamp();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
