-- feed_items を IndexedDB に移行。サーバー側テーブルは不要。
-- コードデプロイ後に実行すること。

DROP POLICY IF EXISTS "feed_items_select_own" ON feed_items;
DROP POLICY IF EXISTS "feed_items_insert_own" ON feed_items;
DROP POLICY IF EXISTS "feed_items_update_own" ON feed_items;
DROP POLICY IF EXISTS "feed_items_delete_own" ON feed_items;
DROP INDEX IF EXISTS idx_feed_items_source_published;
DROP INDEX IF EXISTS idx_feed_items_user_id;
DROP TABLE feed_items;
