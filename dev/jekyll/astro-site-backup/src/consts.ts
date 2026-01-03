// サイト共通の定数定義
export const SITE_TITLE = '城上コードメモ v2.2';
export const SITE_DESCRIPTION = '城上コードメモは、個人の感想や、主張の記事、Webツール、ブラウザゲーム、小説などを公開する個人ブログサイトです。';

export const BASE_URL = import.meta.env.BASE_URL;

// フルURLを生成するヘルパー関数
export function getFullPath(path: string) {
    // pathが/で始まっていない場合は付与
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    // BASE_URLと結合 (BASE_URLの末尾のスラッシュ有無に注意)
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    return `${base}${normalizedPath}`;
}

/**
 * Jekyll互換のURL生成 (記事用)
 * スラグ "2025-10-14-bibouroku" -> "/posts/2025/10/14/bibouroku/"
 */
export function getPostUrl(slug: string) {
    const parts = slug.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    const titleSlug = parts.slice(3).join('-');
    return getFullPath(`/posts/${year}/${month}/${day}/${titleSlug}/`);
}

