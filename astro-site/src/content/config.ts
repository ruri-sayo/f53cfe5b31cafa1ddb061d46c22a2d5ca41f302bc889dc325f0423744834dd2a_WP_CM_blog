/**
 * Astro Content Collections スキーマ定義
 * Jekyll からの移行用
 */
import { defineCollection, z } from 'astro:content';

// ブログ記事コレクション
const postsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        categories: z.union([z.array(z.string()), z.string()]).optional(),
        tags: z.union([z.array(z.string()), z.string()]).optional(),
        description: z.string().optional(),
        date: z.coerce.date().optional(),
    }),
});

// 小説コレクション（シリーズ・エピソード両方に対応）
const novelCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        series_id: z.string(),
        // シリーズインデックスの場合
        is_series_index: z.boolean().optional(),
        short_description: z.string().optional(),
        status: z.string().optional(),
        order: z.number().optional(),
        // エピソードの場合
        episode: z.number().optional(),
    }),
});

export const collections = {
    posts: postsCollection,
    novel: novelCollection,
};


