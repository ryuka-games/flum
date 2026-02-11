-- OGP カード表示用カラム追加
-- フィードアイテムの og:image, og:description を保存して一覧でカード表示する

alter table feed_items add column og_image text;
alter table feed_items add column og_description text;

alter table favorites add column og_image text;
alter table favorites add column og_description text;
