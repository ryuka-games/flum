-- ============================================
-- Flum MVP: Realtime 設定
-- ============================================

-- feed_items テーブルで Realtime を有効化
-- 新着フィードの INSERT イベントをリアルタイムで購読するために必要
alter publication supabase_realtime add table feed_items;
