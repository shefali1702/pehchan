-- Pehchan schema for Supabase. Not used by the local demo yet.
-- Every table carries family_id and is protected by row level security.
-- Face embeddings are never stored here.

create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table people (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families on delete cascade,
  display_name text not null,
  relationship_to_elder text,
  calls_elder text,
  is_elder boolean not null default false,
  is_deceased boolean not null default false,
  birth_year int,
  language text,
  phone text
);

create table members (
  user_id uuid not null references auth.users on delete cascade,
  family_id uuid not null references families on delete cascade,
  person_id uuid references people on delete set null,
  role text not null check (role in ('caregiver', 'contributor', 'admin')),
  primary key (user_id, family_id)
);

create table consents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families on delete cascade,
  person_id uuid not null references people on delete cascade,
  kind text not null check (kind in ('living', 'voice', 'face', 'guardian')),
  granted boolean not null,
  recording_path text,
  document_path text,
  created_at timestamptz not null default now(),
  withdrawn_at timestamptz
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families on delete cascade,
  storage_path text not null,
  year int,
  place text,
  story_one_liner text,
  caption text,
  caption_lang text,
  uploaded_by uuid references people,
  created_at timestamptz not null default now()
);

create table photo_faces (
  photo_id uuid not null references photos on delete cascade,
  person_id uuid not null references people on delete cascade,
  family_id uuid not null references families on delete cascade,
  bbox jsonb not null,
  confirmed boolean not null default true,
  primary key (photo_id, person_id)
);

create table voice_letters (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families on delete cascade,
  speaker_person_id uuid not null references people on delete cascade,
  photo_id uuid references photos on delete set null,
  kind text not null default 'letter' check (kind in ('letter', 'hello')),
  storage_path text not null,
  duration_s numeric,
  transcript text,
  language text,
  created_at timestamptz not null default now()
);

create table songs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families on delete cascade,
  title text not null,
  artist text,
  year int,
  language text,
  source text not null,
  added_by uuid references people
);

create table avoid_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families on delete cascade,
  person_id uuid references people on delete cascade,
  text text,
  created_by uuid references people
);

create table reels (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families on delete cascade,
  elder_person_id uuid not null references people,
  date date not null,
  mode text not null default 'remember' check (mode in ('tell', 'remember', 'comfort')),
  items jsonb not null,
  song_id uuid references songs
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families on delete cascade,
  reel_id uuid not null references reels on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  ended_by_stop boolean not null default false
);

create table mood_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families on delete cascade,
  session_id uuid references sessions on delete cascade,
  moment text not null check (moment in ('before', 'after', 'during')),
  mood text not null check (mood in ('calm', 'happy', 'confused', 'upset', 'smiled')),
  note text,
  at timestamptz not null default now()
);

create table recognition_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families on delete cascade,
  session_id uuid not null references sessions on delete cascade,
  person_id uuid not null references people on delete cascade,
  hint_level int not null check (hint_level between 0 and 3),
  at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families on delete cascade,
  to_user_id uuid not null references auth.users on delete cascade,
  kind text not null check (kind in ('smiled')),
  payload jsonb not null,
  read_at timestamptz
);

-- Row level security: members see only their own families.
create function is_member(f uuid) returns boolean
language sql security definer stable as $$
  select exists (select 1 from members where family_id = f and user_id = auth.uid())
$$;

do $$
declare t text;
begin
  foreach t in array array['people','consents','photos','photo_faces','voice_letters','songs','avoid_items','reels','sessions','mood_logs','recognition_events','notifications']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "family members" on %I for all using (is_member(family_id)) with check (is_member(family_id))', t);
  end loop;
end $$;

alter table families enable row level security;
create policy "family members" on families for all using (is_member(id));
alter table members enable row level security;
create policy "own memberships" on members for select using (user_id = auth.uid() or is_member(family_id));
