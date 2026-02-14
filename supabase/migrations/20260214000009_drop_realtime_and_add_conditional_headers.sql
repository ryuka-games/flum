-- ============================================
-- Flum: Realtime 停止 + 条件付きリクエスト対応
-- ============================================

-- Realtime 削除: feed_items を publication から外す
-- フロント側の Realtime 購読を削除したため、不要な WAL 処理を停止
ALTER PUBLICATION supabase_realtime DROP TABLE feed_items;

-- 条件付きリクエスト用カラム追加（ETag / Last-Modified）
-- RSS フェッチ時に If-None-Match / If-Modified-Since を送り、
-- 304 Not Modified なら再パース・upsert をスキップする
ALTER TABLE feed_sources
  ADD COLUMN etag text,
  ADD COLUMN last_modified_header text;
