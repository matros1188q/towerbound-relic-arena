# Towerbound cloud accounts and saves

This is phase 1 of online support. It adds Supabase email/password and Google authentication plus versioned cloud storage for the existing browser save keys. It does not add live multiplayer or claim to make client-side combat/economy authoritative.

## 1. Create a dedicated Supabase project

Create a free Supabase project for **Towerbound: Relic Arena**. Do not reuse a different product's production database. In Project Settings / API, copy:
- Project URL
- Publishable key (or legacy anon key)

Never copy a `service_role` or secret key into the game or GitHub Pages.

Put the URL and publishable key into `supabase-config.js`.

## 2. Create the database objects

Open the project's SQL Editor and run the complete file:
`supabase/migrations/202611090001_cloud_saves.sql`

The table is protected by RLS. Authenticated users can read only their own row. Browser clients cannot directly insert, update or delete rows; saves go through a version-checked RPC. The RPC rejects stale revisions to prevent an old device from silently overwriting a newer save.

## 3. Enable authentication

In Authentication / Providers:
- Enable Email.
- For Google, enable the Google provider and enter the OAuth Client ID and Client Secret from Google Cloud Console.
- In Supabase Auth / URL Configuration, set the Site URL to `https://matros1188q.github.io/towerbound-relic-arena/` and add that exact game URL to the allowed redirect URLs.
- In Google Cloud Console, set the Authorized redirect URI to the Supabase callback URL displayed in the Google provider settings (format: `https://<your-project-ref>.supabase.co/auth/v1/callback`). Do not use the GitHub Pages URL as Google's callback URI.

Email confirmation may be enabled. In that case a new user must confirm the email before a session is created.

## 4. First login and migration

The game keeps LocalStorage intact. On first login:
- If the account has no cloud save, the current local save is uploaded.
- If the account already has a cloud save and this device has local progress, the player must explicitly choose which copy to keep.
- Choosing cloud restores the stored keys and reloads the game.
- Choosing this device uploads its local copy using optimistic revision checking.

The cloud payload includes the current RPG engine save (`tb-rpg-v2` and legacy `tb-rpg-v1`), plus the legacy profile saves and profile selection keys. Local data is not deleted after upload.

## 5. Security boundary

RLS prevents one player from reading another player's save. The versioned RPC prevents stale writes. This first phase still stores a client-generated game snapshot: a modified browser can attempt to alter its own level, items or diamonds before upload. Therefore do not use this snapshot as trusted input for PvP matchmaking, leaderboards, trading or premium-currency grants. Before those features ship, move rewards, currency changes, item grants and PvP results to server-validated RPCs / Edge Functions and treat the client save as a presentation cache.

## 6. Free-plan notes

Supabase Free is suitable for an early test, not a guaranteed always-on production MMO backend. Free projects can pause after inactivity and do not include downloadable automatic database backups. Keep periodic exports once players have valuable progress.
