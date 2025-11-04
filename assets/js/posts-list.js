(function () {
  // 1) JSONデータの読込
  const dataEl = document.getElementById('posts-data');
  if (!dataEl) return;
  /** @type {{title:string,url:string,date_iso:string,date_disp:string,description:string,categories:string[],tags:string[]}[]} */
  const POSTS = JSON.parse(dataEl.textContent || '[]');

  // 2) DOM要素
  const $grid = document.getElementById('posts-grid');
  const $search = document.getElementById('post-search');
  const $tag = document.getElementById('post-tag');

  if (!$grid || !$search || !$tag) return;

  // 3) タグ（= tags ∪ categories）を収集してセレクトに流し込む
  const tagSet = new Set();
  POSTS.forEach(p => {
    (p.tags || []).forEach(t => t && tagSet.add(t));
    (p.categories || []).forEach(c => c && tagSet.add(c));
  });

  // アルファベット→日本語混在でも一応安定する程度にソート
  const tagList = Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'ja'));
  tagList.forEach(tag => {
    const opt = document.createElement('option');
    opt.value = tag;
    opt.textContent = tag;
    $tag.appendChild(opt);
  });

  // 4) レンダリング関数
  function render(items) {
    // カードHTMLを生成（Tailwindのクラスは元と同じ）
    const html = items.map(p => {
      const catOrTag =
        (p.categories && p.categories.length > 0)
          ? p.categories.join(', ')
          : ((p.tags && p.tags.length > 0) ? p.tags.join(', ') : 'uncategorized');

      const pill = (catOrTag === 'uncategorized')
        ? `<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">uncategorized</span>`
        : `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">${escapeHtml(catOrTag)}</span>`;

      const description = p.description ? escapeHtml(p.description) : '';

      return `
      <article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">
            <a href="${p.url}" class="hover:text-blue-600">${escapeHtml(p.title)}</a>
          </h3>
          ${description ? `<p class="text-gray-600 mb-4">${description.length > 120 ? description.slice(0,118) + '…' : description}</p>` : ''}
          <div class="flex justify-between items-center text-sm text-gray-500">
            ${pill}
            <time datetime="${p.date_iso}">${escapeHtml(p.date_disp)}</time>
          </div>
        </div>
      </article>`;
    }).join('');

    $grid.innerHTML = html || `<p class="text-gray-500">該当する記事がありません。</p>`;
  }

  // 5) フィルタ関数（検索語＋タグ）
  function filterPosts() {
    const q = ($search.value || '').trim().toLowerCase();
    const t = ($tag.value || '').trim();

    const filtered = POSTS.filter(p => {
      // キーワードは title + description に含まれるか
      const hay = (p.title + ' ' + (p.description || '')).toLowerCase();
      const okQ = q === '' ? true : hay.includes(q);

      // タグは tags ∪ categories のどれか一致か
      const allTags = new Set([...(p.tags || []), ...(p.categories || [])].map(String));
      const okT = t === '' ? true : allTags.has(t);

      return okQ && okT;
    });

    render(filtered);
  }

  // 6) 入力イベント（検索は軽くデバウンス）
  let timer = null;
  $search.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(filterPosts, 120);
  });
  $tag.addEventListener('change', filterPosts);

  // 初期描画
  render(POSTS);

  // --- util: 簡易エスケープ ---
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }
})();
