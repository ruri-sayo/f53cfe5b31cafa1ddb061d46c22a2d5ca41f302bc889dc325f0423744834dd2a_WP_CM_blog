/**
 * Astro Content Collections スキーマ定義
 * Jekyll からの移行用
 */
import { defineCollection, z } from 'astro:content';

// ブログ記事コレクション
const postsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        // layout は Astro では使用しないため除外
        title: z.string(),
        // categoriesは文字列の配列または単一の文字列に対応
        categories: z.union([z.array(z.string()), z.string()]).optional(),
        // tagsも同様
        tags: z.union([z.array(z.string()), z.string()]).optional(),
        description: z.string().optional(),
        // 日付は様々なフォーマットに対応（Jekyllの形式を含む）
        date: z.coerce.date().optional(),
    }),
});

// 小説コレクションは後で追加（一時的に無効化）
// const novelCollection = defineCollection({ ... });

export const collections = {
    posts: postsCollection,
};

