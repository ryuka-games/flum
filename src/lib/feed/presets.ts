export type FeedPreset = {
  name: string;
  url: string;
  category: string;
};

export const FEED_PRESETS: FeedPreset[] = [
  // テクノロジー
  {
    name: "はてブ IT",
    url: "https://b.hatena.ne.jp/hotentry/it.rss",
    category: "テクノロジー",
  },
  {
    name: "Zenn",
    url: "https://zenn.dev/feed",
    category: "テクノロジー",
  },
  {
    name: "Qiita",
    url: "https://qiita.com/popular-items/feed",
    category: "テクノロジー",
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
    category: "テクノロジー",
  },
  // テックブログ
  {
    name: "企業テックブログ",
    url: "https://yamadashy.github.io/tech-blog-rss-feed/feeds/atom.xml",
    category: "テックブログ",
  },
  {
    name: "Publickey",
    url: "https://www.publickey1.jp/atom.xml",
    category: "テックブログ",
  },
  {
    name: "GitHub Blog",
    url: "https://github.blog/feed/",
    category: "テックブログ",
  },
  // ニュース
  {
    name: "Gigazine",
    url: "https://gigazine.net/news/rss_2.0/",
    category: "ニュース",
  },
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    category: "ニュース",
  },
  // エンタメ・まとめ
  {
    name: "ねとらぼ",
    url: "https://rss.itmedia.co.jp/rss/2.0/netlab.xml",
    category: "エンタメ・まとめ",
  },
  {
    name: "痛いニュース",
    url: "http://blog.livedoor.jp/dqnplus/index.rdf",
    category: "エンタメ・まとめ",
  },
  {
    name: "はちま起稿",
    url: "http://blog.esuteru.com/index.rdf",
    category: "エンタメ・まとめ",
  },
];
