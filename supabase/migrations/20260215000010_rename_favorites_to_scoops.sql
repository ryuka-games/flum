-- favorites → scoops リネーム
-- 「お気に入り」から「Scoop（流れから掬い上げる）」へのブランディング変更

-- テーブル名変更
ALTER TABLE favorites RENAME TO scoops;

-- インデックス名変更
ALTER INDEX idx_favorites_user_id RENAME TO idx_scoops_user_id;

-- RLS ポリシー名変更（ポリシーの DROP + CREATE で対応）
DROP POLICY "favorites_select_own" ON scoops;
DROP POLICY "favorites_insert_own" ON scoops;
DROP POLICY "favorites_delete_own" ON scoops;

CREATE POLICY "scoops_select_own"
  ON scoops FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "scoops_insert_own"
  ON scoops FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "scoops_delete_own"
  ON scoops FOR DELETE
  USING (user_id = (SELECT auth.uid()));
