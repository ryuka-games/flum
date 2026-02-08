-- ============================================
-- Flum: RLS パフォーマンス最適化
-- auth.uid() を (SELECT auth.uid()) に変更
-- PostgreSQL がサブクエリ結果をキャッシュし、行ごとの再評価を防ぐ
-- ============================================

-- profiles
drop policy "profiles_select_own" on profiles;
create policy "profiles_select_own"
  on profiles for select
  using (id = (select auth.uid()));

drop policy "profiles_update_own" on profiles;
create policy "profiles_update_own"
  on profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- channels
drop policy "channels_select_own" on channels;
create policy "channels_select_own"
  on channels for select
  using (user_id = (select auth.uid()));

drop policy "channels_insert_own" on channels;
create policy "channels_insert_own"
  on channels for insert
  with check (user_id = (select auth.uid()));

drop policy "channels_update_own" on channels;
create policy "channels_update_own"
  on channels for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy "channels_delete_own" on channels;
create policy "channels_delete_own"
  on channels for delete
  using (user_id = (select auth.uid()));

-- feed_sources
drop policy "feed_sources_select_own" on feed_sources;
create policy "feed_sources_select_own"
  on feed_sources for select
  using (
    channel_id in (
      select id from channels where user_id = (select auth.uid())
    )
  );

drop policy "feed_sources_insert_own" on feed_sources;
create policy "feed_sources_insert_own"
  on feed_sources for insert
  with check (
    channel_id in (
      select id from channels where user_id = (select auth.uid())
    )
  );

drop policy "feed_sources_update_own" on feed_sources;
create policy "feed_sources_update_own"
  on feed_sources for update
  using (
    channel_id in (
      select id from channels where user_id = (select auth.uid())
    )
  )
  with check (
    channel_id in (
      select id from channels where user_id = (select auth.uid())
    )
  );

drop policy "feed_sources_delete_own" on feed_sources;
create policy "feed_sources_delete_own"
  on feed_sources for delete
  using (
    channel_id in (
      select id from channels where user_id = (select auth.uid())
    )
  );

-- feed_items
drop policy "feed_items_select_own" on feed_items;
create policy "feed_items_select_own"
  on feed_items for select
  using (
    feed_source_id in (
      select fs.id from feed_sources fs
      join channels c on c.id = fs.channel_id
      where c.user_id = (select auth.uid())
    )
  );

drop policy "feed_items_insert_own" on feed_items;
create policy "feed_items_insert_own"
  on feed_items for insert
  with check (
    feed_source_id in (
      select fs.id from feed_sources fs
      join channels c on c.id = fs.channel_id
      where c.user_id = (select auth.uid())
    )
  );

drop policy "feed_items_update_own" on feed_items;
create policy "feed_items_update_own"
  on feed_items for update
  using (
    feed_source_id in (
      select fs.id from feed_sources fs
      join channels c on c.id = fs.channel_id
      where c.user_id = (select auth.uid())
    )
  )
  with check (
    feed_source_id in (
      select fs.id from feed_sources fs
      join channels c on c.id = fs.channel_id
      where c.user_id = (select auth.uid())
    )
  );

drop policy "feed_items_delete_own" on feed_items;
create policy "feed_items_delete_own"
  on feed_items for delete
  using (
    feed_source_id in (
      select fs.id from feed_sources fs
      join channels c on c.id = fs.channel_id
      where c.user_id = (select auth.uid())
    )
  );
