-- 水門（Sluice Gate）: チャンネル単位のキーワードフィルタ
-- 空配列 = フィルタなし（後方互換）
ALTER TABLE channels
  ADD COLUMN keyword_filters text[] NOT NULL DEFAULT '{}';
