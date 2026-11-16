-- Vocabulary Quest leaderboard: run this once in Supabase (SQL Editor → New query → Run).
-- Safe to run again; it only creates or updates what it needs.
--
-- What is stored: a random player id, nickname, buddy, group code, progress, XP and playing time.
-- The game can't read or change the table directly. It can only call the three functions
-- below, which check every value, and each player can only change or delete their own row.

create table if not exists public.vq_players (
  id          uuid primary key,
  secret_hash bytea not null,
  group_code  text not null check (group_code ~ '^[A-Z0-9-]{3,20}$'),
  nickname    text not null check (char_length(nickname) between 1 and 16),
  avatar      text not null check (avatar in ('penguin','cat','dog','owl','lion','tiger','horse','bunny','fox')),
  step        int  not null default 0 check (step between 0 and 25),
  xp          int  not null default 0 check (xp between 0 and 250 and xp <= step * 10),
  perfect     int  not null default 0 check (perfect between 0 and step),
  seconds     int  not null default 0 check (seconds between 0 and 360000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists vq_players_group on public.vq_players (group_code);

-- Lock the table: no direct access from the game.
alter table public.vq_players enable row level security;
revoke all on public.vq_players from anon, authenticated;

-- Save (or create) your own progress. The secret only lives on your device;
-- a row can only be changed by whoever knows its secret.
create or replace function public.vq_save_progress(
  p_id uuid, p_secret text, p_group text, p_nickname text, p_avatar text,
  p_step int, p_xp int, p_perfect int, p_seconds int)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_secret is null or char_length(p_secret) < 20 then
    raise exception 'invalid secret';
  end if;
  insert into vq_players as p (id, secret_hash, group_code, nickname, avatar, step, xp, perfect, seconds)
  values (p_id, sha256(convert_to(p_secret, 'UTF8')), upper(btrim(p_group)), btrim(p_nickname),
          p_avatar, p_step, p_xp, p_perfect, p_seconds)
  on conflict (id) do update
    set group_code = excluded.group_code, nickname = excluded.nickname, avatar = excluded.avatar,
        step = excluded.step, xp = excluded.xp, perfect = excluded.perfect,
        seconds = excluded.seconds, updated_at = now()
    where p.secret_hash = excluded.secret_hash;
end $$;

-- The ranking for one group: most questions done, then most XP, then fastest.
create or replace function public.vq_leaderboard(p_group text)
returns table (id uuid, nickname text, avatar text, step int, xp int, perfect int, seconds int, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select id, nickname, avatar, step, xp, perfect, seconds, updated_at
  from vq_players
  where group_code = upper(btrim(p_group))
  order by step desc, xp desc, seconds asc, updated_at asc
  limit 50;
$$;

-- Remove yourself from the board.
create or replace function public.vq_remove_player(p_id uuid, p_secret text)
returns void
language sql security definer set search_path = public as $$
  delete from vq_players where id = p_id and secret_hash = sha256(convert_to(p_secret, 'UTF8'));
$$;

revoke all on function public.vq_save_progress(uuid, text, text, text, text, int, int, int, int) from public;
revoke all on function public.vq_leaderboard(text) from public;
revoke all on function public.vq_remove_player(uuid, text) from public;
grant execute on function public.vq_save_progress(uuid, text, text, text, text, int, int, int, int) to anon, authenticated;
grant execute on function public.vq_leaderboard(text) to anon, authenticated;
grant execute on function public.vq_remove_player(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Group names (added later; running the whole file again is safe).
-- Whoever creates a group can rename it; everyone in the group sees the name.
create table if not exists public.vq_groups (
  code       text primary key check (code ~ '^[A-Z0-9-]{3,20}$'),
  name       text not null check (char_length(name) between 1 and 30 and name !~ '[[:cntrl:]]'),
  owner_hash bytea not null,
  created_at timestamptz not null default now()
);
alter table public.vq_groups enable row level security;
revoke all on public.vq_groups from anon, authenticated;

-- Create a group with a name. Returns false if the code is already taken.
create or replace function public.vq_create_group(p_code text, p_name text, p_secret text)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if p_secret is null or char_length(p_secret) < 20 then
    raise exception 'invalid secret';
  end if;
  insert into vq_groups (code, name, owner_hash)
  values (upper(btrim(p_code)), btrim(p_name), sha256(convert_to(p_secret, 'UTF8')))
  on conflict (code) do nothing;
  return found;
end $$;

-- Rename a group (only the person who created it).
create or replace function public.vq_rename_group(p_code text, p_name text, p_secret text)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update vq_groups set name = btrim(p_name)
  where code = upper(btrim(p_code)) and owner_hash = sha256(convert_to(p_secret, 'UTF8'));
  return found;
end $$;

-- The name of a group, or null for groups made before names existed.
create or replace function public.vq_group_name(p_code text)
returns text
language sql stable security definer set search_path = public as $$
  select name from vq_groups where code = upper(btrim(p_code));
$$;

revoke all on function public.vq_create_group(text, text, text) from public;
revoke all on function public.vq_rename_group(text, text, text) from public;
revoke all on function public.vq_group_name(text) from public;
grant execute on function public.vq_create_group(text, text, text) to anon, authenticated;
grant execute on function public.vq_rename_group(text, text, text) to anon, authenticated;
grant execute on function public.vq_group_name(text) to anon, authenticated;
