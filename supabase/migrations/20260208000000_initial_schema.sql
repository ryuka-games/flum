-- ============================================
-- Flum MVP: Initial Schema
-- ============================================

-- 1. profiles: ユーザープロフィール（auth.users と連携）
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. channels: チャンネル（Discord のチャンネルに相当）
create table channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. feed_sources: RSS フィードソース（チャンネルに紐づく）
create table feed_sources (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  name text not null,
  url text not null,
  last_fetched_at timestamptz,
  created_at timestamptz not null default now()
);

-- 4. feed_items: フィードアイテム（RSS から取得した個別記事）
create table feed_items (
  id uuid primary key default gen_random_uuid(),
  feed_source_id uuid not null references feed_sources(id) on delete cascade,
  title text not null,
  url text not null,
  content text,
  thumbnail_url text,
  published_at timestamptz,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  -- 同じソースから同じ URL の記事は重複登録しない
  unique (feed_source_id, url)
);

-- ============================================
-- インデックス
-- ============================================

create index idx_channels_user_id on channels(user_id);
create index idx_feed_sources_channel_id on feed_sources(channel_id);
create index idx_feed_items_source_published on feed_items(feed_source_id, published_at desc);

-- ============================================
-- トリガー: Auth ユーザー作成時に profiles を自動作成
-- ============================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- トリガー: updated_at を自動更新
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_profiles
  before update on profiles
  for each row execute function update_updated_at();

create trigger set_updated_at_channels
  before update on channels
  for each row execute function update_updated_at();
