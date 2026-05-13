# Security Architecture

## Authentication & Authorization

LogSight uses **application-layer authorization** instead of database-level RLS (Row Level Security).

### Why?

1. **Custom JWT Authentication**: We implemented custom JWT tokens, not Supabase's built-in auth
2. **User IDs are INT**: Our schema uses integer IDs, while Supabase RLS expects UUIDs from `auth.uid()`
3. **Explicit Authorization**: Every endpoint verifies user ownership before returning data

### How It Works

Every data query includes a user ownership check:

```javascript
// Example from analysis.controller.js
const ownershipCheck = await pool.query(
  'SELECT id FROM apps WHERE id = $1 AND user_id = $2',
  [appId, req.user.userId]
);

if (!ownershipCheck.rows.length) {
  return res.status(403).json({ error: 'Access denied' });
}
```

### Security Layers

1. **Authentication**: JWT tokens (7-day expiry)
2. **Authorization**: App ownership verified before every query
3. **Rate Limiting**: 10 login attempts per 15 minutes
4. **Input Validation**: Zod schemas on all endpoints

### Trade-offs

- ✅ **Pro**: More control, flexibility with custom auth
- ✅ **Pro**: Simpler integration with existing JWT
- ⚠️ **Con**: Database doesn't enforce security (application responsible)
- ⚠️ **Con**: Requires careful code review (no DB-level protection)

This is a deliberate architectural decision suitable for custom authentication scenarios.