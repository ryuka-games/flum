-- ============================================
-- Flum MVP: Row Level Security ポリシー
-- ============================================

-- 全テーブルで RLS を有効化
alter table profiles enable row level security;
alter table channels enable row level security;
alter table feed_sources enable row level security;
alter table feed_items enable row level security;

-- ============================================
-- profiles: 自分のプロフィールだけ閲覧・更新可能
-- ============================================

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================
-- channels: 自分のチャンネルだけ CRUD 可能
-- ============================================

create policy "channels_select_own"
  on channels for select
  using (user_id = auth.uid());

create policy "channels_insert_own"
  on channels for insert
  with check (user_id = auth.uid());

create policy "channels_update_own"
  on channels for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "channels_delete_own"
  on channels for delete
  using (user_id = auth.uid());

-- ============================================
-- feed_sources: 自分のチャンネル内のソースだけ CRUD 可能
-- ============================================

create policy "feed_sources_select_own"
  on feed_sources for select
  using (
    channel_id in (
      select id from channels where user_id = auth.uid()
    )
  );

create policy "feed_sources_insert_own"
  on feed_sources for insert
  with check (
    channel_id in (
      select id from channels where user_id = auth.uid()
    )
  );

create policy "feed_sources_update_own"
  on feed_sources for update
  using (
    channel_id in (
      select id from channels where user_id = auth.uid()
    )
  )
  with check (
    channel_id in (
      select id from channels where user_id = auth.uid()
    )
  );

create policy "feed_sources_delete_own"
  on feed_sources for delete
  using (
    channel_id in (
      select id from channels where user_id = auth.uid()
    )
  );

-- ============================================
-- feed_items: 自分のソース内のアイテムだけ閲覧・更新（既読）・削除可能
-- ============================================

create policy "feed_items_select_own"
  on feed_items for select
  using (
    feed_source_id in (
      select fs.id from feed_sources fs
      join channels c on c.id = fs.channel_id
      where c.user_id = auth.uid()
    )
  );

create policy "feed_items_insert_own"
  on feed_items for insert
  with check (
    feed_source_id in (
      select fs.id from feed_sources fs
      join channels c on c.id = fs.channel_id
      where c.user_id = auth.uid()
    )
  );

create policy "feed_items_update_own"
  on feed_items for update
  using (
    feed_source_id in (
      select fs.id from feed_sources fs
      join channels c on c.id = fs.channel_id
      where c.user_id = auth.uid()
    )
  )
  with check (
    feed_source_id in (
      select fs.id from feed_sources fs
      join channels c on c.id = fs.channel_id
      where c.user_id = auth.uid()
    )
  );

create policy "feed_items_delete_own"
  on feed_items for delete
  using (
    feed_source_id in (
      select fs.id from feed_sources fs
      join channels c on c.id = fs.channel_id
      where c.user_id = auth.uid()
    )
  );
