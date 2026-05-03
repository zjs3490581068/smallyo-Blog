import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

const stripFrontmatter = (text: string) => text.replace(/^---\n[\s\S]*?\n---/, "");

const estimateWords = (body: string) => {
  const clean = stripFrontmatter(body)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[[^\]]*]\([^)]*\)/g, "")
    .replace(/[#>*_`$|\-]/g, " ");

  const chineseWords = clean.match(/[\u4e00-\u9fff]/g)?.length || 0;
  const latinWords = clean.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9]+/g)?.length || 0;

  return chineseWords + latinWords;
};

const getPostTime = (post: BlogPost) => post.data.updated ?? post.data.date;

const formatCompactNumber = (num: number) => {
  if (num >= 10000) return `${(num / 10000).toFixed(1).replace(/\.0$/, "")}w`;
  return String(num);
};

const getHomeStats = (posts: BlogPost[]) => {
  const visiblePosts = posts.filter((post) => !post.data.hide);
  const sortedPosts = [...visiblePosts].sort((a, b) => getPostTime(b).valueOf() - getPostTime(a).valueOf());

  const categories = visiblePosts.reduce<Record<string, number>>((acc, post) => {
    acc[post.data.categories] = (acc[post.data.categories] || 0) + 1;
    return acc;
  }, {});

  const tags = new Set<string | number>();
  visiblePosts.forEach((post) => {
    (post.data.tags || []).forEach((tag) => tags.add(tag));
  });

  const totalWords = visiblePosts.reduce((sum, post) => sum + estimateWords(post.body || ""), 0);
  const latestPost = sortedPosts[0] || null;

  return {
    articleCount: visiblePosts.length,
    categoryCount: Object.keys(categories).length,
    tagCount: tags.size,
    totalWords,
    totalWordsText: formatCompactNumber(totalWords),
    latestUpdatedAt: latestPost ? getPostTime(latestPost) : null,
    latestPost,
    recentPosts: sortedPosts.slice(0, 3),
    topCategories: Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
  };
};

export { estimateWords, getHomeStats };
