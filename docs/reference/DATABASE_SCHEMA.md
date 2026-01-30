# Database Schema

Complete reference for Flor.io database schema in Supabase PostgreSQL.

## Overview

The Flor.io database consists of several core tables:

- `users` - User accounts (managed by Supabase Auth)
- `plants` - User plant collection
- `rooms` - Plant locations/groupings
- `watering_history` - Watering records
- `usage_limits` - Usage tracking for features

## Tables

### users

Managed by Supabase Auth. Extended user profile stored in `auth.users`.

```sql
-- Supabase managed table: auth.users
CREATE TABLE auth.users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  email_confirmed_at timestamp,
  phone text,
  last_sign_in_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**Application access:**

- Get current user: `auth.currentUser()` in client
- Get user ID: `const { data: { user } } = await supabase.auth.getUser()`

---

### plants

User's plant collection.

```sql
CREATE TABLE plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  photo_url text,
  watering_frequency_days integer NOT NULL DEFAULT 7,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  light_requirements text,
  fertilizing_tips text,
  pruning_tips text,
  troubleshooting text,
  created_with_ai boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX plants_user_id_idx ON plants(user_id);
CREATE INDEX plants_room_id_idx ON plants(room_id);
CREATE INDEX plants_created_at_idx ON plants(created_at DESC);
```

**Constraints:**

- `watering_frequency_days`: 1-365
- `name`: Required, non-empty
- Cascade delete: Deleting user deletes all plants

**Relationships:**

- `user_id` → `auth.users.id` (many plants per user)
- `room_id` → `rooms.id` (optional, many plants per room)

**Row Level Security (RLS):**

```sql
-- Users can only see their own plants
CREATE POLICY "Plants visible to own user" ON plants
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only modify their own plants
CREATE POLICY "Plants modifiable by own user" ON plants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Plants deletable by own user" ON plants
  FOR DELETE USING (auth.uid() = user_id);
```

**Columns:**

| Column                    | Type      | Required | Description                  |
| ------------------------- | --------- | -------- | ---------------------------- |
| `id`                      | uuid      | Yes      | Primary key                  |
| `user_id`                 | uuid      | Yes      | Plant owner                  |
| `name`                    | text      | Yes      | Display name                 |
| `photo_url`               | text      | No       | Photo URL in storage         |
| `watering_frequency_days` | integer   | Yes      | Days between watering        |
| `room_id`                 | uuid      | No       | Location grouping            |
| `light_requirements`      | text      | No       | Light care instructions      |
| `fertilizing_tips`        | text      | No       | Fertilizer care instructions |
| `pruning_tips`            | text      | No       | Pruning care instructions    |
| `troubleshooting`         | text      | No       | Common issues & solutions    |
| `created_with_ai`         | boolean   | No       | Created via AI wizard        |
| `created_at`              | timestamp | Auto     | Created time                 |
| `updated_at`              | timestamp | Auto     | Last modified                |

---

### rooms

Plant locations/groupings.

```sql
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE INDEX rooms_user_id_idx ON rooms(user_id);
```

**Constraints:**

- `name`: Required, non-empty, 1-100 chars
- Cascade delete: Deleting user deletes all rooms

**Row Level Security:**

```sql
CREATE POLICY "Rooms visible to own user" ON rooms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Rooms modifiable by own user" ON rooms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Rooms deletable by own user" ON rooms
  FOR DELETE USING (auth.uid() = user_id);
```

**Columns:**

| Column       | Type      | Required | Description  |
| ------------ | --------- | -------- | ------------ |
| `id`         | uuid      | Yes      | Primary key  |
| `user_id`    | uuid      | Yes      | Room owner   |
| `name`       | text      | Yes      | Display name |
| `created_at` | timestamp | Auto     | Created time |

---

### watering_history

Records of when plants were watered.

```sql
CREATE TABLE watering_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  watered_at timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

CREATE INDEX watering_history_plant_id_idx ON watering_history(plant_id);
CREATE INDEX watering_history_created_at_idx ON watering_history(created_at DESC);
```

**Relationships:**

- `plant_id` → `plants.id` (cascade delete)

**Row Level Security:**

```sql
-- Watering records are visible via plants (user owns plant)
CREATE POLICY "Watering visible to plant owner" ON watering_history
  FOR SELECT USING (
    plant_id IN (SELECT id FROM plants WHERE user_id = auth.uid())
  );

CREATE POLICY "Watering recordable by plant owner" ON watering_history
  FOR INSERT WITH CHECK (
    plant_id IN (SELECT id FROM plants WHERE user_id = auth.uid())
  );
```

**Columns:**

| Column       | Type      | Required | Description    |
| ------------ | --------- | -------- | -------------- |
| `id`         | uuid      | Yes      | Primary key    |
| `plant_id`   | uuid      | Yes      | Watered plant  |
| `watered_at` | timestamp | Yes      | When watered   |
| `created_at` | timestamp | Auto     | Record created |

---

### usage_limits

Tracks usage of limited features (e.g., AI generations per month).

```sql
CREATE TABLE usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_generations_this_month integer DEFAULT 0,
  month_year text NOT NULL,  -- Format: "2024-01" for month tracking
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id, month_year)
);

CREATE INDEX usage_limits_user_id_idx ON usage_limits(user_id);
CREATE INDEX usage_limits_month_year_idx ON usage_limits(month_year);
```

**Purpose:**

- Free tier: 20 AI plant creations per month (hardcoded limit)
- Premium tier: Unlimited (future)

**Note:** The limit of 20 is hardcoded in `app/lib/usage-limits/usage-limits.server.ts` and not stored in the database.

**Columns:**

| Column                      | Type      | Required | Description     |
| --------------------------- | --------- | -------- | --------------- |
| `id`                        | uuid      | Yes      | Primary key     |
| `user_id`                   | uuid      | Yes      | User            |
| `ai_generations_this_month` | integer   | No       | Used this month |
| `month_year`                | text      | Yes      | Month (YYYY-MM) |
| `created_at`                | timestamp | Auto     | Created time    |
| `updated_at`                | timestamp | Auto     | Last modified   |

---

### ai_feedback

Tracks user feedback on AI-generated plant care instructions.

```sql
CREATE TABLE ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id uuid NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  feedback_type text NOT NULL CHECK (feedback_type IN ('thumbs_up', 'thumbs_down')),
  comment text,
  ai_response_snapshot jsonb,
  created_at timestamp DEFAULT now()
);

CREATE INDEX ai_feedback_user_id_idx ON ai_feedback(user_id);
CREATE INDEX ai_feedback_plant_id_idx ON ai_feedback(plant_id);
CREATE INDEX ai_feedback_created_at_idx ON ai_feedback(created_at DESC);
```

**Purpose:**

- Track user satisfaction with AI-generated care instructions
- Improve AI model with feedback data
- Store snapshot of AI response for analysis

**Relationships:**

- `user_id` → `auth.users.id` (cascade delete)
- `plant_id` → `plants.id` (cascade delete)

**Row Level Security:**

```sql
CREATE POLICY "Users can see own feedback" ON ai_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback" ON ai_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Columns:**

| Column                 | Type      | Required | Description                          |
| ---------------------- | --------- | -------- | ------------------------------------ |
| `id`                   | uuid      | Yes      | Primary key                          |
| `user_id`              | uuid      | Yes      | Feedback author                      |
| `plant_id`             | uuid      | Yes      | Plant feedback is about              |
| `feedback_type`        | text      | Yes      | 'thumbs_up' or 'thumbs_down'         |
| `comment`              | text      | No       | Optional user comment                |
| `ai_response_snapshot` | jsonb     | No       | Snapshot of AI response for analysis |
| `created_at`           | timestamp | Auto     | When feedback was recorded           |

---

## Storage Buckets

### plant-photos

Stores user-uploaded plant images.

```sql
-- Supabase Storage Bucket
Name: plant-photos
Visibility: Private (RLS controlled)
Max file size: 50MB (validated 10MB client-side)
```

**File path structure:**

```
plant-photos/
└── {user_id}/
    └── {uuid}.jpg
```

**Example:**

```
plant-photos/550e8400-e29b-41d4-a716-446655440000/a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6.jpg
```

**RLS Policies:**

- Users can upload to their own directory
- Users can read their own images
- Users can delete their own images

---

## Key Relationships

```
auth.users (1)
    ├── plants (many)
    │   ├── watering_history (many)
    │   ├── ai_feedback (many)
    │   └── room_id → rooms
    ├── rooms (many)
    ├── usage_limits (many: one per month)
    └── ai_feedback (many)
```

---

## Indexes

Optimized for common queries:

| Table              | Column(s)    | Purpose               |
| ------------------ | ------------ | --------------------- |
| `plants`           | `user_id`    | List user's plants    |
| `plants`           | `room_id`    | Filter plants by room |
| `plants`           | `created_at` | Sort by newest        |
| `rooms`            | `user_id`    | List user's rooms     |
| `watering_history` | `plant_id`   | Plant history         |
| `watering_history` | `user_id`    | User history          |
| `watering_history` | `created_at` | Timeline queries      |
| `usage_limits`     | `user_id`    | Unique lookup         |

---

## Data Calculated in Code

The following fields are **calculated at query time**, not stored:

| Field                    | Calculation                      | Used For       |
| ------------------------ | -------------------------------- | -------------- |
| `last_watered`           | MAX(watering_history.watered_at) | Status display |
| `days_until_watering`    | last_watered + frequency - TODAY | Notification   |
| `watering_status`        | Based on days_until_watering     | UI colors      |
| `plant_count` (per room) | COUNT(plants.id) WHERE room_id   | Room display   |

---

## Migrations

Migration files are stored in Supabase:

- Go to **SQL Editor** in Supabase dashboard
- Execute SQL to create tables
- Or use Supabase CLI: `supabase db push`

### Initial Setup (Migration 0001)

Run this SQL to set up the database:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (see above)
-- Create RLS policies (see above)
-- Create indexes (see above)

-- Enable RLS on all tables
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE watering_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
```

---

## Row Level Security (RLS)

All tables have RLS enabled to ensure data privacy:

- **Each user can only access their own data**
- **No cross-user data leakage**
- **Enforced at database level** (not just in code)

Current policies:

- Users see only their own plants, rooms, watering history
- Users can only create/update/delete their own records
- No admin override (all users equal)

---

## Backup & Recovery

Supabase handles backups automatically:

- **Daily backups** (keep 7 days)
- **Point-in-time recovery** (up to 7 days)
- **Manual exports** available via dashboard

To backup manually:

1. Go to Supabase dashboard
2. **Settings** → **Database** → **Backups**
3. Click **Start backup** or download existing backup

---

## Performance Tuning

### Query Examples

**Get plants needing water:**

```sql
SELECT
  p.*,
  r.name as room_name,
  (SELECT watered_at FROM watering_history
   WHERE plant_id = p.id ORDER BY watered_at DESC LIMIT 1) as last_watered
FROM plants p
LEFT JOIN rooms r ON p.room_id = r.id
WHERE p.user_id = $1
  AND (CURRENT_DATE - COALESCE(
    (SELECT DATE(watered_at) FROM watering_history
     WHERE plant_id = p.id ORDER BY watered_at DESC LIMIT 1),
    CURRENT_DATE - INTERVAL '1000 days'))
  >= p.watering_frequency_days;
```

**Optimization tips:**

1. Always filter by `user_id` first (RLS)
2. Use indexes: `user_id`, `created_at`
3. Limit result sets (pagination)
4. Avoid N+1 queries (join when possible)
5. Use `SELECT` specific columns (not `*`)

---

## Type Generation

TypeScript types are auto-generated from this schema:

```bash
yarn typecheck
```

Generates `app/types/database.types.ts` with full type safety.

---

## Future Schema Changes

### Planned Tables

- **notifications** - Push notification log
- **plant_templates** - Saved plant presets
- **social_follows** - User following (future)
- **plant_shares** - Shared plants (future)

### Planned Fields

- `plants.height`, `plants.spread` - Size tracking
- `plants.repotted_at` - Repotting history
- `plants.fertilized_at` - Fertilizing tracking
- `rooms.temperature`, `rooms.humidity` - Room conditions

---

## Disaster Recovery

If database is corrupted:

1. **Restore from backup**
   - Go to Supabase dashboard
   - Settings → Database → Backups
   - Click "Restore" on desired backup

2. **Point-in-time recovery**
   - Contact Supabase support for timestamp
   - Database restored to that point

3. **Start fresh**
   - Delete all data
   - Re-run migrations
   - Users re-enter data

---

## Database Maintenance

### Regular Tasks

- **Weekly**: Check for unused indexes
- **Monthly**: Review slow query logs (Supabase dashboard)
- **Quarterly**: Optimize indexes, archive old data

### Monitoring

Supabase provides:

- Query performance stats
- Disk usage monitoring
- Backup status
- SSL certificate expiry

---

## Questions?

See:

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Data flow
- [reference/API.md](./API.md) - API endpoints
- [features/](../features/) - Feature-specific details
