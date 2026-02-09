-- ============================================
-- Flum: お気に入り機能
-- feed_items は一時キャッシュ、favorites は永続ストレージ。
-- 記事データをコピーして保存（feed_items 削除後も残る）。
-- ============================================

create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  url text not null,
  source_name text,
  channel_name text,
  thumbnail_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  -- 同じユーザーが同じ URL を二重登録しない
  unique (user_id, url)
);

-- インデックス
create index idx_favorites_user_id on favorites(user_id);

-- RLS
alter table favorites enable row level security;

create policy "favorites_select_own"
  on favorites for select
  using (user_id = (select auth.uid()));

create policy "favorites_insert_own"
  on favorites for insert
  with check (user_id = (select auth.uid()));

create policy "favorites_delete_own"
  on favorites for delete
  using (user_id = (select auth.uid()));
