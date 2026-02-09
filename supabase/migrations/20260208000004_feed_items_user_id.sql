-- ============================================
-- Flum: feed_items に user_id を追加（非正規化）
-- Supabase Realtime + RLS の互換性のため。
-- JOIN ベースの RLS ポリシーは Realtime（WALRUS）の
-- 再帰的 RLS 評価で失敗するため、直接比較に変更する。
-- ============================================

-- 1. RLS を有効化（デバッグ中に無効化していた場合の安全策）
alter table feed_items enable row level security;

-- 2. user_id カラムを追加（nullable で追加 → backfill → NOT NULL）
alter table feed_items
  add column user_id uuid references profiles(id);

-- 3. 既存データを backfill（feed_sources → channels → user_id）
update feed_items fi
set user_id = c.user_id
from feed_sources fs
join channels c on c.id = fs.channel_id
where fi.feed_source_id = fs.id;

-- 4. NOT NULL 制約を追加
alter table feed_items
  alter column user_id set not null;

-- 5. インデックス追加（RLS パフォーマンス用）
create index idx_feed_items_user_id on feed_items(user_id);

-- 6. 既存の RLS ポリシーを削除して再作成（JOIN なしのシンプルなポリシー）

-- SELECT
drop policy if exists "feed_items_select_own" on feed_items;
create policy "feed_items_select_own"
  on feed_items for select
  using (user_id = (select auth.uid()));

-- INSERT
drop policy if exists "feed_items_insert_own" on feed_items;
create policy "feed_items_insert_own"
  on feed_items for insert
  with check (user_id = (select auth.uid()));

-- UPDATE
drop policy if exists "feed_items_update_own" on feed_items;
create policy "feed_items_update_own"
  on feed_items for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- DELETE
drop policy if exists "feed_items_delete_own" on feed_items;
create policy "feed_items_delete_own"
  on feed_items for delete
  using (user_id = (select auth.uid()));
