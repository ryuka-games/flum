-- 既読管理を DB からブラウザの :visited CSS に移行
-- is_read カラムはもう使われないので削除
alter table feed_items drop column is_read;
