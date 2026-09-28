(function () {
  'use strict';

  const appScriptUrl = new URL(document.currentScript.src, location.href);
  const blogRootUrl = new URL('../', appScriptUrl);
  const BLOG_ROOT = blogRootUrl.pathname.replace(/\/$/, '');
  let katexPromise;
  let siteConfig = {
    site: {
      title: 'Blog',
      subtitle: '',
      description: '',
      author: '',
      language: 'zh-CN',
      url: location.origin,
      legacyHosts: [],
      postsPerPage: 7,
    },
    menu: [],
    widgets: [],
    appearance: {
      logo: 'img/logo.png',
      favicon: 'img/favicon.ico',
      authorImage: 'img/author.jpg',
      scrollTopImage: 'img/scrollup.png',
    },
    features: { tocArticle: true, tocAside: true, lightbox: true, toTop: true },
    search: { enabled: false },
    verification: {},
    author: {},
    links: [],
    footer: {},
  };
  const state = {
    posts: [],
    categories: new Map(),
    tags: new Map(),
  };
  const textRequests = new Map();

  const main = document.getElementById('main');
  const aside = document.getElementById('site-aside');
  const asidePart = document.getElementById('asidepart');
  const container = document.getElementById('container');
  const nav = document.getElementById('site-nav');
  const navToggle = document.getElementById('nav-toggle');
  const searchForm = document.getElementById('site-search');
  const searchInput = document.getElementById('search');
  const skipLink = document.querySelector('.skip-link');
  const topButton = document.getElementById('totop');
  const imageLightbox = document.getElementById('image-lightbox');

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function routeHref(route) {
    return route
      .split('/')
      .map((segment) => {
        if (!segment) return '';
        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch {
          return encodeURIComponent(segment);
        }
      })
      .join('/');
  }

  function normalizedPathname() {
    let pathname = location.pathname;
    try {
      pathname = decodeURI(pathname);
    } catch {
      // 保留原路径，稍后显示未找到页面。
    }
    if (pathname === '/index.html') return '/';
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  }

  function fetchText(source, label) {
    const url = new URL(encodeURI(blogAssetPath(source)), location.origin).href;
    if (textRequests.has(url)) return textRequests.get(url);

    let request;
    request = fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`${label}失败（HTTP ${response.status}）。`);
        return response.text();
      })
      .catch((error) => {
        if (textRequests.get(url) === request) textRequests.delete(url);
        throw error;
      });
    textRequests.set(url, request);
    return request;
  }

  function displayDate(post, withPrefix = false) {
    const value = `${post.year}年${String(post.month).padStart(2, '0')}月${String(post.day).padStart(2, '0')}日`;
    return withPrefix ? `发表于${value}` : value;
  }

  function countBy(items, key) {
    const result = new Map();
    for (const item of items) {
      for (const value of item[key] ?? []) {
        if (!result.has(value)) result.set(value, []);
        result.get(value).push(item);
      }
    }
    return result;
  }

  function orderedTaxonomyEntries(kind) {
    const values = kind === 'categories' ? state.categories : state.tags;
    const entries = [...values.entries()];
    if (kind === 'categories') {
      return entries.sort(([left], [right]) => left.localeCompare(right, 'zh-CN', { numeric: true }));
    }
    return entries.sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
  }

  function taxonomySlug(kind, value) {
    return kind === 'categories' ? value.replaceAll('.', '-') : value;
  }

  function taxonomyHref(kind, value) {
    return routeHref(`/${kind}/${taxonomySlug(kind, value)}/`);
  }

  function resolveTaxonomyValue(kind, slug) {
    const values = kind === 'categories' ? state.categories : state.tags;
    if (values.has(slug)) return slug;
    return [...values.keys()].find((value) => taxonomySlug(kind, value) === slug) ?? '';
  }

  function ensureMeta(selector, attributes) {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
      document.head.append(element);
    }
    return element;
  }

  function setDocumentTitle(title, options = {}) {
    const fullTitle = title ? `${title} | ${siteConfig.site.title}` : siteConfig.site.title;
    const description = options.description || siteConfig.site.description;
    const canonicalUrl = new URL(normalizedPathname(), siteConfig.site.url || location.origin).href;
    document.title = fullTitle;
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[name="robots"]').content = options.robots || 'index,follow';
    document.querySelector('meta[property="og:type"]').content = options.type || 'website';
    document.querySelector('meta[property="og:title"]').content = fullTitle;
    document.querySelector('meta[property="og:description"]').content = description;
    document.querySelector('meta[property="og:url"]').content = canonicalUrl;
    document.querySelector('link[rel="canonical"]').href = canonicalUrl;

    const keywords = Array.isArray(options.keywords) ? options.keywords.filter(Boolean).join(',') : '';
    const keywordsMeta = document.head.querySelector('meta[name="keywords"]');
    if (keywords) {
      (keywordsMeta || ensureMeta('meta[name="keywords"]', { name: 'keywords' })).content = keywords;
    } else {
      keywordsMeta?.remove();
    }

    const publishedMeta = document.head.querySelector('meta[property="article:published_time"]');
    if (options.publishedTime) {
      (publishedMeta || ensureMeta('meta[property="article:published_time"]', { property: 'article:published_time' })).content = options.publishedTime;
    } else {
      publishedMeta?.remove();
    }
  }

  function normalizeMenuHref(href) {
    if (href === '/') return '/';
    return href.endsWith('/') ? href : `${href}/`;
  }

  function blogAssetPath(source) {
    if (!source) return '';
    if (/^(?:https?:)?\/\//.test(source) || source.startsWith('/')) return source;
    const pathname = new URL(source.replace(/^\/+/, ''), blogRootUrl).pathname;
    try {
      return decodeURI(pathname);
    } catch {
      return pathname;
    }
  }

  function applyVerificationMeta(name, content) {
    const selector = `meta[name="${name}"]`;
    const existing = document.head.querySelector(selector);
    if (!content) {
      existing?.remove();
      return;
    }
    (existing || ensureMeta(selector, { name })).content = content;
  }

  function applySiteConfig() {
    document.documentElement.lang = siteConfig.site.language || 'zh-CN';
    document.querySelector('meta[name="author"]').content = siteConfig.site.author;
    document.querySelector('link[rel="alternate"]').title = siteConfig.site.title;
    applyVerificationMeta('baidu-site-verification', siteConfig.verification?.baidu);
    applyVerificationMeta('google-site-verification', siteConfig.verification?.google);

    const logoContainer = document.getElementById('imglogo');
    logoContainer.hidden = siteConfig.appearance.logoEnabled === false;
    const logo = logoContainer.querySelector('img');
    logo.src = blogAssetPath(siteConfig.appearance.logo || 'img/logo.png');
    logo.alt = siteConfig.site.title;
    logo.title = siteConfig.site.title;

    for (const link of document.querySelectorAll('#imglogo a, .site-name a')) link.title = siteConfig.site.title;
    document.querySelector('.site-name a').textContent = siteConfig.site.title;
    document.querySelector('.blog-motto').textContent = siteConfig.site.subtitle;

    const favicon = document.querySelector('link[rel="icon"]');
    favicon.href = blogAssetPath(siteConfig.appearance.favicon || 'img/favicon.ico');
    topButton.querySelector('img').src = blogAssetPath(siteConfig.appearance.scrollTopImage || 'img/scrollup.png');

    const searchConfig = siteConfig.search || {};
    searchForm.closest('li').hidden = searchConfig.enabled === false;
    if (searchConfig.action) searchForm.action = searchConfig.action;

    const menuList = nav.querySelector('ul');
    const searchItem = searchForm.closest('li');
    for (const item of [...menuList.children]) {
      if (item !== searchItem) item.remove();
    }
    for (const menuItem of siteConfig.menu || []) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = normalizeMenuHref(menuItem.href);
      link.dataset.blogLink = '';
      link.textContent = menuItem.label;
      item.append(link);
      menuList.insertBefore(item, searchItem);
    }

    const introduction = document.getElementById('author-introduction');
    introduction.replaceChildren(
      document.createTextNode(siteConfig.author.introLine1 || ''),
      document.createElement('br'),
      document.createTextNode(siteConfig.author.introLine2 || ''),
    );

    const authorImage = document.querySelector('#footer .author');
    const authorImageLink = document.getElementById('author-image-link');
    authorImage.hidden = siteConfig.appearance.authorImageEnabled === false;
    authorImage.style.backgroundImage = `url("${blogAssetPath(siteConfig.appearance.authorImage || 'img/author.jpg')}")`;
    if (siteConfig.author.weibo) {
      authorImageLink.href = `https://weibo.com/${encodeURIComponent(siteConfig.author.weibo)}`;
      authorImageLink.target = '_blank';
      authorImageLink.rel = 'noopener noreferrer';
      delete authorImageLink.dataset.blogLink;
    } else {
      authorImageLink.href = '/about/';
      authorImageLink.removeAttribute('target');
      authorImageLink.removeAttribute('rel');
      authorImageLink.dataset.blogLink = '';
    }

    const social = document.querySelector('#footer .social-font');
    const profiles = [
      ['weibo', '微博', siteConfig.author.weibo && `https://weibo.com/${encodeURIComponent(siteConfig.author.weibo)}`],
      ['github', 'GitHub', siteConfig.author.github && `https://github.com/${encodeURIComponent(siteConfig.author.github)}`],
      ['stackoverflow', 'Stack Overflow', siteConfig.author.stackoverflow && `https://stackoverflow.com/users/${encodeURIComponent(siteConfig.author.stackoverflow)}`],
      ['twitter', 'Twitter', siteConfig.author.twitter && `https://twitter.com/${encodeURIComponent(siteConfig.author.twitter)}`],
      ['facebook', 'Facebook', siteConfig.author.facebook && `https://www.facebook.com/${encodeURIComponent(siteConfig.author.facebook)}`],
      ['douban', '豆瓣', siteConfig.author.douban && `https://www.douban.com/people/${encodeURIComponent(siteConfig.author.douban)}`],
      ['email', 'Email Me', siteConfig.author.email && `mailto:${siteConfig.author.email}`],
    ];
    social.innerHTML = profiles.filter(([, , href]) => href).map(([name, label, href]) =>
      `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="icon-${name}" title="${label}" aria-label="${label}"></a>`).join('');

    const copyright = document.querySelector('#footer .copyright');
    copyright.replaceChildren(document.createTextNode(siteConfig.footer?.poweredBy || ''));
    if (siteConfig.footer?.themeName && siteConfig.footer?.themeUrl) {
      copyright.append(document.createTextNode(' · Theme adapted from '));
      const themeLink = document.createElement('a');
      themeLink.href = siteConfig.footer.themeUrl;
      themeLink.target = '_blank';
      themeLink.rel = 'noopener noreferrer';
      themeLink.textContent = siteConfig.footer.themeName;
      copyright.append(themeLink);
    }
    topButton.hidden = siteConfig.features.toTop === false;
  }

  function renderMessage(title, message, isError = false) {
    main.className = '';
    main.innerHTML = `
      <section class="runtime-message${isError ? ' error' : ''}">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
        ${isError ? '<p><a href="/" data-blog-link>返回博客首页</a></p>' : ''}
      </section>`;
    renderAside();
  }

  function clearSpecialLayout() {
    document.getElementById('archive-navigation')?.remove();
    asidePart.hidden = false;
  }

  function useStandaloneLayout() {
    document.getElementById('archive-navigation')?.remove();
    document.getElementById('toc-aside')?.remove();
    asidePart.hidden = true;
    document.body.classList.remove('aside-collapsed');
  }

  function postCard(post, archive = false) {
    const href = routeHref(post.route);
    return `
      <section class="post" itemscope itemprop="blogPost">
        <a href="${href}" title="${escapeHtml(post.title)}" itemprop="url" data-blog-link>
          ${archive ? `<time datetime="${escapeHtml(post.date)}">${displayDate(post)}</time>` : ''}
          <h1 class="post-list-title" itemprop="name">${escapeHtml(post.title)}</h1>
          ${archive ? '' : `<p itemprop="description">${escapeHtml(post.excerpt || '这篇文章还没有摘要。')}</p><time datetime="${escapeHtml(post.date)}" itemprop="datePublished">${displayDate(post)}</time>`}
        </a>
      </section>`;
  }

  function renderPagination(currentPage, pageCount) {
    if (pageCount <= 1) return '';
    const parts = [];
    if (currentPage > 1) {
      const previous = currentPage === 2 ? '/' : `/page/${currentPage - 1}/`;
      parts.push(`<a class="extend prev" rel="prev" href="${previous}" data-blog-link><span></span>Prev</a>`);
    }
    for (let page = 1; page <= pageCount; page += 1) {
      if (page === currentPage) {
        parts.push(`<span class="page-number current">${page}</span>`);
      } else if (page === 1 || page === pageCount || Math.abs(page - currentPage) <= 1) {
        parts.push(`<a class="page-number" href="${page === 1 ? '/' : `/page/${page}/`}" data-blog-link>${page}</a>`);
      } else if (parts.at(-1) !== '<span class="space">…</span>') {
        parts.push('<span class="space">…</span>');
      }
    }
    if (currentPage < pageCount) {
      parts.push(`<a class="extend next" rel="next" href="/page/${currentPage + 1}/" data-blog-link>Next<span></span></a>`);
    }
    return `<nav id="page-nav" class="clearfix" aria-label="文章分页">${parts.join('')}</nav>`;
  }

  function renderHome(page = 1) {
    const postsPerPage = Number(siteConfig.site.postsPerPage) || 7;
    const pageCount = Math.max(1, Math.ceil(state.posts.length / postsPerPage));
    const safePage = Math.min(Math.max(1, page), pageCount);
    const start = (safePage - 1) * postsPerPage;
    const posts = state.posts.slice(start, start + postsPerPage);
    main.className = '';
    main.innerHTML = posts.map((post) => postCard(post)).join('') + renderPagination(safePage, pageCount);
    renderAside();
    setDocumentTitle(safePage > 1 ? `第 ${safePage} 页` : '', {
      description: safePage > 1 ? `${siteConfig.site.description}，第 ${safePage} 页。` : siteConfig.site.description,
    });
  }

  function renderArchive(selectedYear = null, selectedMonth = null) {
    const byMonth = new Map();
    for (const post of state.posts) {
      const key = `${post.year}-${String(post.month).padStart(2, '0')}`;
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key).push(post);
    }

    const selectedKey = selectedYear && selectedMonth
      ? `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
      : '';
    const posts = selectedKey ? byMonth.get(selectedKey) ?? [] : state.posts;
    const monthLinks = [...byMonth.entries()].map(([key, monthPosts]) => {
      const [year, month] = key.split('-');
      const currentClass = key === selectedKey ? ' current' : '';
      return `<li class="archive-list-item"><a class="archive-list-link${currentClass}" href="/archives/${year}/${month}/" data-blog-link>${year}年${month}月</a><span class="archive-list-count">${monthPosts.length}</span></li>`;
    }).join('');

    useStandaloneLayout();
    const archiveNavigation = document.createElement('section');
    archiveNavigation.id = 'archive-navigation';
    archiveNavigation.className = 'archive-title';
    archiveNavigation.setAttribute('aria-label', '月份归档');
    archiveNavigation.innerHTML = `
      <h2 class="archive-icon">归档</h2>
      <div class="archiveslist archive-float clearfix"><ul class="archive-list">${monthLinks}</ul></div>`;
    container.insertBefore(archiveNavigation, main);

    main.className = 'archive-part clearfix';
    main.innerHTML = `<div id="archive-page">${posts.length ? posts.map((post) => postCard(post, true)).join('') : '<section class="runtime-empty"><h1>这个月份没有文章</h1></section>'}</div>`;
    const archiveTitle = selectedKey ? `${selectedYear}年${String(selectedMonth).padStart(2, '0')}月归档` : '归档';
    setDocumentTitle(archiveTitle, { description: `${siteConfig.site.title}的${archiveTitle}。` });
  }

  function renderTaxonomy(kind, selectedValue = '') {
    const isCategory = kind === 'categories';
    const label = isCategory ? '分类' : '标签';
    const entries = orderedTaxonomyEntries(kind);
    const isIndex = !selectedValue;
    const activeValue = selectedValue || entries[0]?.[0] || '';
    const values = isCategory ? state.categories : state.tags;
    const posts = values.get(activeValue) ?? [];

    useStandaloneLayout();
    const taxonomyNavigation = document.createElement('section');
    taxonomyNavigation.id = 'archive-navigation';
    taxonomyNavigation.className = 'archive-title';
    taxonomyNavigation.setAttribute('aria-label', label);
    taxonomyNavigation.innerHTML = `
      <h2 class="${isCategory ? 'category-icon' : 'tag-icon'}">${escapeHtml(isIndex ? (isCategory ? '目录' : '标签') : activeValue)}</h2>
      ${isIndex ? entries.map(([value, valuePosts]) => `<a class="${value === activeValue ? 'current' : ''}" href="${taxonomyHref(kind, value)}" title="${escapeHtml(value)}" data-blog-link>${escapeHtml(value)}<sup>${valuePosts.length}</sup></a>`).join('') : ''}`;
    container.insertBefore(taxonomyNavigation, main);

    const archivePage = `<div id="archive-page">${posts.length ? posts.map((post) => postCard(post, true)).join('') : '<section class="runtime-empty"><h1>没有找到文章</h1></section>'}</div>`;
    main.className = 'archive-part clearfix';
    main.innerHTML = isIndex ? `<div class="all-list-box">${archivePage}</div>` : archivePage;
    const taxonomyTitle = isIndex ? label : `${label}：${activeValue}`;
    setDocumentTitle(taxonomyTitle, { description: `${siteConfig.site.title}的${taxonomyTitle}文章列表。` });
  }

  function normalizedSearchTerms(query) {
    return query
      .normalize('NFKC')
      .toLocaleLowerCase('zh-CN')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function searchPosts(query) {
    const terms = normalizedSearchTerms(query);
    if (!terms.length) return [];
    const fields = siteConfig.search?.localFields || ['title', 'excerpt', 'description', 'categories', 'tags', 'keywords'];
    return state.posts.filter((post) => {
      const searchableText = fields
        .flatMap((field) => Array.isArray(post[field]) ? post[field] : [post[field]])
        .filter(Boolean)
        .join(' ')
        .normalize('NFKC')
        .toLocaleLowerCase('zh-CN');
      return terms.every((term) => searchableText.includes(term));
    });
  }

  function externalSearchUrl(query) {
    const searchConfig = siteConfig.search || {};
    if (!searchConfig.enabled || !searchConfig.action) return '';
    const searchUrl = new URL(searchConfig.action, location.href);
    const scopedQuery = searchConfig.restrictToCurrentHost ? `site:${location.hostname} ${query}` : query;
    searchUrl.searchParams.set(searchConfig.queryParameter || 'q', scopedQuery);
    return searchUrl.href;
  }

  function renderSearch(query) {
    const results = searchPosts(query);
    searchInput.value = query;
    main.className = '';
    main.innerHTML = `
      <section class="view-title">
        <h1>搜索：${escapeHtml(query || '请输入关键词')}</h1>
        <p>${query ? `${results.length} 篇匹配文章` : '可以搜索标题、摘要、描述、分类、标签和关键词。'}</p>
      </section>
      ${results.map((post) => postCard(post)).join('') || (query
        ? '<section class="runtime-empty"><h1>没有找到文章</h1><p>可以换一个关键词，或使用外部站内搜索。</p></section>'
        : '')}`;
    renderAside();
    setDocumentTitle(query ? `搜索：${query}` : '搜索', {
      description: query ? `站内搜索“${query}”的结果。` : '搜索博客文章。',
      robots: 'noindex,follow',
    });
  }

  function splitFrontMatter(markdown) {
    return parseFrontMatter(markdown).body;
  }

  function parseFrontMatter(markdown) {
    const text = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const lines = text.split('\n');
    const startsWithDelimiter = lines[0]?.trim() === '---';
    const headerStart = startsWithDelimiter ? 1 : 0;
    const headerEnd = lines.findIndex((line, index) => index >= headerStart && line.trim() === '---');
    if (headerEnd < 0) return { attributes: {}, body: text };

    const attributes = {};
    for (const line of lines.slice(headerStart, headerEnd)) {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) attributes[match[1].trim()] = match[2].trim();
    }
    return {
      attributes,
      body: lines.slice(headerEnd + 1).join('\n').trim(),
    };
  }

  function displayMetadataDate(value) {
    const match = String(value ?? '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!match) return '';
    return `发表于${match[1]}年${match[2].padStart(2, '0')}月${match[3].padStart(2, '0')}日`;
  }

  function configureMarkdownRenderer() {
    const blockMathRenderer = (token) => `<div class="math-source" data-math-display="true">${escapeHtml(token.text.trim())}</div>`;
    const inlineMathRenderer = (token) => `<span class="math-source" data-math-display="false">${escapeHtml(token.text.trim())}</span>`;
    window.marked.use({
      extensions: [
        {
          name: 'dollarBlockMath',
          level: 'block',
          start(source) {
            const index = source.indexOf('$$');
            return index >= 0 ? index : undefined;
          },
          tokenizer(source) {
            const match = source.match(/^\$\$\s*([\s\S]+?)\s*\$\$(?:\n|$)/);
            return match ? { type: 'dollarBlockMath', raw: match[0], text: match[1] } : undefined;
          },
          renderer: blockMathRenderer,
        },
        {
          name: 'bracketBlockMath',
          level: 'block',
          start(source) {
            const index = source.indexOf('\\[');
            return index >= 0 ? index : undefined;
          },
          tokenizer(source) {
            const match = source.match(/^\\\[\s*([\s\S]+?)\s*\\\](?:\n|$)/);
            return match ? { type: 'bracketBlockMath', raw: match[0], text: match[1] } : undefined;
          },
          renderer: blockMathRenderer,
        },
        {
          name: 'dollarInlineMath',
          level: 'inline',
          start(source) {
            const index = source.indexOf('$');
            return index >= 0 ? index : undefined;
          },
          tokenizer(source) {
            const match = source.match(/^\$(?!\$)([^$\n]+?)\$(?!\$)/);
            return match ? { type: 'dollarInlineMath', raw: match[0], text: match[1] } : undefined;
          },
          renderer: inlineMathRenderer,
        },
        {
          name: 'parenInlineMath',
          level: 'inline',
          start(source) {
            const index = source.indexOf('\\(');
            return index >= 0 ? index : undefined;
          },
          tokenizer(source) {
            const match = source.match(/^\\\((.+?)\\\)/);
            return match ? { type: 'parenInlineMath', raw: match[0], text: match[1] } : undefined;
          },
          renderer: inlineMathRenderer,
        },
      ],
    });
  }

  function loadKatexStylesheet() {
    const existing = document.getElementById('katex-stylesheet');
    if (existing) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const stylesheet = document.createElement('link');
      stylesheet.id = 'katex-stylesheet';
      stylesheet.rel = 'stylesheet';
      stylesheet.href = blogAssetPath('vendor/katex/katex.min.css');
      stylesheet.addEventListener('load', resolve, { once: true });
      stylesheet.addEventListener('error', () => reject(new Error('KaTeX 样式加载失败。')), { once: true });
      document.head.append(stylesheet);
    });
  }

  function loadKatexScript() {
    if (window.katex) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'katex-script';
      script.src = blogAssetPath('vendor/katex/katex.min.js');
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => reject(new Error('KaTeX 脚本加载失败。')), { once: true });
      document.head.append(script);
    });
  }

  function ensureKatex() {
    if (!katexPromise) katexPromise = Promise.all([loadKatexStylesheet(), loadKatexScript()]);
    return katexPromise;
  }

  async function renderMath(container) {
    const nodes = [...container.querySelectorAll('.math-source')];
    if (!nodes.length) return;
    try {
      await ensureKatex();
      for (const node of nodes) {
        window.katex.render(node.textContent, node, {
          displayMode: node.dataset.mathDisplay === 'true',
          throwOnError: false,
          strict: 'warn',
          output: 'htmlAndMathml',
        });
      }
    } catch (error) {
      console.warn('数学公式渲染失败，已保留原始公式文本。', error);
    }
  }

  function renderShareBar(title) {
    const url = encodeURIComponent(location.href.split('#')[0]);
    const text = encodeURIComponent(`${title} | ${siteConfig.site.title}`);
    return `
      <div class="article-share" id="share">
        <div class="share clearfix">
          <a class="article-back-to-top" href="#textlogo" title="Top" aria-label="返回页首"></a>
          <a class="article-share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="分享到 Facebook"></a>
          <a class="article-share-twitter" href="https://twitter.com/intent/tweet?url=${url}&text=${text}" target="_blank" rel="noopener noreferrer" title="Twitter" aria-label="分享到 Twitter"></a>
          <a class="article-share-weibo" href="https://service.weibo.com/share/share.php?title=${text}&url=${url}" target="_blank" rel="noopener noreferrer" title="Weibo" aria-label="分享到微博"></a>
          <span aria-hidden="true"></span>
        </div>
      </div>`;
  }

  function renderComments(id, title) {
    const host = document.getElementById('comments-container');
    if (!host) return;
    if (!window.blogComments) {
      host.innerHTML = '<p class="comments-status error">评论组件未能载入，请刷新页面后重试。</p>';
      return;
    }
    window.blogComments.mount(host, {
      id,
      title,
      url: `${String(siteConfig.site.url || location.origin).replace(/\/+$/, '')}${normalizedPathname()}`,
    });
  }

  function normalizeMarkdownImages(markdown) {
    const corrected = markdown.replace(
      /\\images\\"我无所不在" I am everywhere\.jpg/g,
      blogAssetPath('images/“我无所不在” I am everywhere.jpg'),
    );
    return corrected.replace(/!\[([^\]]*)\]\(([^)\n]+)\)/g, (match, alt, rawTarget) => {
      let target = rawTarget.trim().replaceAll('\\', '/');
      let title = '';
      const titleMatch = target.match(/^(.*?)(\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))$/);
      if (titleMatch) {
        target = titleMatch[1];
        title = titleMatch[2];
      }
      if (target.startsWith('/images/')) target = blogAssetPath(target.slice(1));
      target = target.replaceAll(' ', '%20');
      return `![${alt}](${target}${title})`;
    });
  }

  function renderFencedCodeBlocks(markdown) {
    return markdown.replace(/^```([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm, (match, rawLanguage, rawCode) => {
      const language = rawLanguage.trim().replace(/[^\w-]/g, '') || 'plain';
      const code = rawCode.replace(/\n$/, '');
      const lines = code.split('\n');
      const gutter = lines.map((line, index) => `<span class="line">${index + 1}</span><br>`).join('');
      const content = lines.map((line) => `<span class="line">${escapeHtml(line)}</span><br>`).join('');
      return `<figure class="highlight ${language}"><table><tbody><tr><td class="gutter"><pre>${gutter}</pre></td><td class="code"><pre>${content}</pre></td></tr></tbody></table></figure>`;
    });
  }

  function headingId(text, usedIds) {
    const base = text.trim().replace(/[\s/]+/g, '-').replace(/[^\p{Letter}\p{Number}_\-\u4e00-\u9fff]/gu, '').replace(/^-+|-+$/g, '') || 'section';
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    return id;
  }

  function prepareArticleContent(articleContent) {
    const headings = [...articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    const usedIds = new Set();
    for (const heading of headings) {
      const id = headingId(heading.textContent ?? '', usedIds);
      heading.id = id;
      const anchor = document.createElement('a');
      anchor.className = 'headerlink';
      anchor.href = `#${encodeURIComponent(id)}`;
      anchor.title = heading.textContent ?? '';
      anchor.setAttribute('aria-label', `链接到“${heading.textContent ?? ''}”`);
      heading.prepend(anchor);
    }

    for (const link of articleContent.querySelectorAll('a[href]')) {
      let url;
      try {
        url = new URL(link.href, location.href);
      } catch {
        continue;
      }
      const matchesPostRoute = state.posts.some((post) => normalizedRoute(post.route) === normalizedRoute(url.pathname));
      const legacyBlogHosts = new Set([
        location.hostname,
        ...(siteConfig.site.legacyHosts || []),
      ]);
      const legacyBlogHost = legacyBlogHosts.has(url.hostname);
      if (matchesPostRoute && (url.origin === location.origin || legacyBlogHost)) {
        link.href = `${routeHref(url.pathname)}${url.search}${url.hash}`;
        link.dataset.blogLink = '';
        link.removeAttribute('target');
        link.removeAttribute('rel');
      } else if (url.origin !== location.origin) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      } else if (matchesPostRoute) {
        link.dataset.blogLink = '';
      }
    }

    for (const image of articleContent.querySelectorAll('img')) {
      if (location.protocol === 'https:' && image.src.startsWith('http://')) {
        image.src = image.src.replace(/^http:\/\//, 'https://');
      }
      image.loading = 'lazy';
      image.decoding = 'async';
      const alt = (image.alt || image.title).trim();
      let imageContainer = image;
      if (siteConfig.features.lightbox !== false && image.parentElement?.tagName !== 'A') {
        const link = document.createElement('a');
        link.className = 'article-image-link';
        link.href = image.getAttribute('src');
        link.dataset.lightbox = '';
        link.setAttribute('aria-label', alt ? `查看大图：${alt}` : '查看大图');
        image.replaceWith(link);
        link.append(image);
        imageContainer = link;
      }
      if (alt && !imageContainer.nextElementSibling?.classList.contains('caption')) {
        const caption = document.createElement('span');
        caption.className = 'caption';
        caption.textContent = alt;
        imageContainer.after(caption);
      }

      const replaceBrokenImage = () => {
        if (!imageContainer.isConnected) return;
        const notice = document.createElement('span');
        notice.className = 'load-note broken-image-notice';
        notice.append(document.createTextNode('图片已失效'));
        const originalSource = image.getAttribute('src');
        if (originalSource && /^(?:https?:)?\/\//.test(originalSource)) {
          const sourceLink = document.createElement('a');
          sourceLink.href = originalSource;
          sourceLink.target = '_blank';
          sourceLink.rel = 'noopener noreferrer';
          sourceLink.textContent = '（查看原始外链）';
          notice.append(sourceLink);
        }
        imageContainer.replaceWith(notice);
      };
      image.addEventListener('error', replaceBrokenImage, { once: true });
      if (image.complete && image.naturalWidth === 0) replaceBrokenImage();
    }

    for (const media of articleContent.querySelectorAll('iframe, embed, object')) {
      if (media.parentElement?.classList.contains('video-container')) continue;
      const wrapper = document.createElement('div');
      wrapper.className = 'video-container';
      media.replaceWith(wrapper);
      wrapper.append(media);
    }
    return headings;
  }

  function buildToc(headings, listNumber = true) {
    if (!headings.length) return '';
    const minimumLevel = Math.min(...headings.map((heading) => Number(heading.tagName.slice(1))));
    const root = { level: minimumLevel - 1, children: [] };
    const stack = [root];

    for (const heading of headings) {
      const level = Number(heading.tagName.slice(1));
      while (stack.length > 1 && stack.at(-1).level >= level) stack.pop();
      const node = { heading, level, children: [] };
      stack.at(-1).children.push(node);
      stack.push(node);
    }

    const renderNodes = (nodes, prefix = []) => nodes.map((node, index) => {
      const numberParts = [...prefix, index + 1];
      const numberHtml = listNumber ? `<span class="toc-number">${numberParts.join('.')}.</span> ` : '';
      const childrenHtml = node.children.length
        ? `<ol class="toc-child">${renderNodes(node.children, numberParts)}</ol>`
        : '';
      return `<li class="toc-item toc-level-${node.level}"><a class="toc-link" href="#${encodeURIComponent(node.heading.id)}">${numberHtml}<span class="toc-text">${escapeHtml(node.heading.textContent.replace(/^#/, '').trim())}</span></a>${childrenHtml}</li>`;
    }).join('');

    return `<ol class="toc">${renderNodes(root.children)}</ol>`;
  }

  function normalizedRoute(route) {
    let value = route;
    try {
      value = decodeURI(value);
    } catch {
      // 保留原值。
    }
    return value.endsWith('/') ? value : `${value}/`;
  }

  async function renderArticle(post) {
    if (!window.marked || !window.DOMPurify) {
      throw new Error('Markdown 渲染库加载失败，请检查网络后刷新页面。');
    }

    renderMessage('正在载入文章', post.title);
    const markdown = renderFencedCodeBlocks(normalizeMarkdownImages(splitFrontMatter(await fetchText(post.source, '读取 Markdown'))));
    const unsafeHtml = window.marked.parse(markdown, { gfm: true, breaks: true });
    const safeHtml = window.DOMPurify.sanitize(unsafeHtml, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target'],
    });
    const postIndex = state.posts.indexOf(post);
    const newer = postIndex > 0 ? state.posts[postIndex - 1] : null;
    const older = postIndex < state.posts.length - 1 ? state.posts[postIndex + 1] : null;
    const categoryLinks = post.categories.map((category) => `<a class="article-category-link" href="${taxonomyHref('categories', category)}" data-blog-link>${escapeHtml(category)}</a>`).join('');
    const tagLinks = post.tags.map((tag) => `<a href="${taxonomyHref('tags', tag)}" data-blog-link>${escapeHtml(tag)}</a>`).join('');
    const author = escapeHtml(siteConfig.site.author);

    main.className = 'post';
    main.innerHTML = `
      <article itemprop="articleBody">
        <header class="article-info clearfix">
          <h1 itemprop="name"><a href="${routeHref(post.route)}" itemprop="url" data-blog-link>${escapeHtml(post.title)}</a></h1>
          <p class="article-author">By <a href="/about/" data-blog-link>${author}</a></p>
          <p class="article-time"><time datetime="${escapeHtml(post.date)}" itemprop="datePublished">${displayDate(post, true)}</time></p>
        </header>
        <div class="article-content">${safeHtml}</div>
        <footer class="article-footer clearfix">
          ${categoryLinks ? `<div class="article-categories"><span></span>${categoryLinks}</div>` : ''}
          ${tagLinks ? `<div class="article-tags"><span></span>${tagLinks}</div>` : ''}
          ${renderShareBar(post.title)}
        </footer>
      </article>
      <nav class="article-nav clearfix" aria-label="相邻文章">
        ${newer ? `<div class="prev"><a href="${routeHref(newer.route)}" data-blog-link><strong>上一篇：</strong><br><span>${escapeHtml(newer.title)}</span></a></div>` : ''}
        ${older ? `<div class="next"><a href="${routeHref(older.route)}" data-blog-link><strong>下一篇：</strong><br><span>${escapeHtml(older.title)}</span></a></div>` : ''}
      </nav>
      ${post.comments !== false ? '<div id="comments-container" class="comments-container"></div>' : ''}`;

    const articleContent = main.querySelector('.article-content');
    const headings = prepareArticleContent(articleContent);
    const toc = post.toc !== false ? buildToc(headings, post.listNumber !== false) : '';
    if (toc && siteConfig.features.tocArticle !== false) {
      articleContent.insertAdjacentHTML('afterbegin', `<div id="toc" class="toc-article"><strong class="toc-title">文章目录</strong>${toc}</div>`);
    }
    await renderMath(articleContent);
    renderAside(siteConfig.features.tocAside !== false ? toc : '');
    setDocumentTitle(post.title, {
      description: post.description || post.excerpt,
      type: 'article',
      publishedTime: post.date,
      keywords: post.keywords,
    });
    if (post.comments !== false) renderComments(post.slug, post.title);
  }

  async function renderAbout() {
    if (!window.marked || !window.DOMPurify) throw new Error('Markdown 渲染库加载失败，请检查网络后刷新页面。');
    renderMessage('正在载入页面', '关于');
    useStandaloneLayout();
    main.className = 'page';
    const documentData = parseFrontMatter(await fetchText('pages/about.md', '读取关于页面'));
    const aboutMarkdown = documentData.body.replace(/\.\.\.(?=\s|$)/g, '…');
    const safeHtml = window.DOMPurify.sanitize(window.marked.parse(aboutMarkdown, { gfm: true, breaks: true }));
    const title = documentData.attributes.title || '关于';
    const publishedAt = displayMetadataDate(documentData.attributes.date);
    useStandaloneLayout();
    main.className = 'page';
    main.innerHTML = `
      <article itemprop="articleBody">
        <header class="article-info clearfix">
          <h1 itemprop="name"><a href="/about/" itemprop="url" data-blog-link>${escapeHtml(title)}</a></h1>
          <p class="article-author">By <a href="/about/" data-blog-link>${escapeHtml(siteConfig.site.author)}</a></p>
          ${publishedAt ? `<p class="article-time"><time datetime="${escapeHtml(documentData.attributes.date)}" itemprop="datePublished">${publishedAt}</time></p>` : ''}
        </header>
        <div class="article-content">${safeHtml}</div>
      </article>
      <div id="comments-container" class="comments-container"></div>`;
    const articleContent = main.querySelector('.article-content');
    prepareArticleContent(articleContent);
    await renderMath(articleContent);
    const description = articleContent.textContent.replace(/\s+/g, ' ').trim().slice(0, 160);
    setDocumentTitle(title, { description });
    renderComments('about', title);
  }

  function renderAside(toc = '') {
    clearSpecialLayout();
    document.getElementById('toc-aside')?.remove();
    if (toc) {
      const tocAside = document.createElement('div');
      tocAside.id = 'toc-aside';
      tocAside.innerHTML = `<strong class="toc-title">文章目录</strong>${toc}`;
      container.append(tocAside);
    }

    const categoryHtml = orderedTaxonomyEntries('categories')
      .map(([category, posts]) => `<li><a href="${taxonomyHref('categories', category)}" title="${escapeHtml(category)}" data-blog-link>${escapeHtml(category)}<sup>${posts.length}</sup></a></li>`)
      .join('');
    const tagCountLevels = [...new Set([...state.tags.values()].map((posts) => posts.length))]
      .sort((left, right) => left - right);
    const lastTagCountLevel = tagCountLevels.length - 1;
    const tagHtml = orderedTaxonomyEntries('tags')
      .map(([tag, posts]) => {
        const ratio = lastTagCountLevel
          ? tagCountLevels.indexOf(posts.length) / lastTagCountLevel
          : 0;
        const size = Number((10 + (10 * ratio)).toFixed(2));
        return `<a href="${taxonomyHref('tags', tag)}" style="font-size:${size}px" data-blog-link>${escapeHtml(tag)}</a>`;
      })
      .join(' ');
    const tagListHtml = orderedTaxonomyEntries('tags').slice(0, 20)
      .map(([tag, posts]) => `<li><a href="${taxonomyHref('tags', tag)}" title="${escapeHtml(tag)}" data-blog-link>${escapeHtml(tag)}<sup>${posts.length}</sup></a></li>`)
      .join('');
    const linksHtml = (siteConfig.links || [])
      .map((link) => `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(link.title || link.name)}">${escapeHtml(link.name)}</a></li>`)
      .join('');
    const widgetHtml = {
      rss: '<div class="rsspart"><a href="/atom.xml" target="_blank" rel="noopener noreferrer" title="rss">RSS 订阅</a></div>',
      category: `<div class="categorieslist"><p class="asidetitle">目录</p><ul>${categoryHtml}</ul></div>`,
      tag: `<div class="tagslist"><p class="asidetitle"><a href="/tags/" data-blog-link>标签</a></p><ul class="clearfix">${tagListHtml}</ul></div>`,
      tagcloud: `<div class="tagcloudlist"><p class="asidetitle">标签云</p><div class="tagcloudlist clearfix">${tagHtml}</div></div>`,
      links: `<div class="linkslist"><p class="asidetitle">友情链接</p><ul>${linksHtml}</ul></div>`,
    };
    aside.innerHTML = (siteConfig.widgets || []).map((name) => widgetHtml[name] || '').join('');
    const firstTitle = aside.querySelector('.asidetitle');
    const closeButton = '<button class="sidebar-close-button" id="close-aside" type="button" aria-label="隐藏侧边栏"></button>';
    if (firstTitle) {
      firstTitle.classList.add('sidebar-title-with-control');
      firstTitle.insertAdjacentHTML('beforeend', closeButton);
    } else {
      aside.insertAdjacentHTML('afterbegin', `<div class="sidebar-control-row">${closeButton}</div>`);
    }
  }

  function closeMobileNavigation() {
    nav.classList.remove('shownav');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  async function renderRoute() {
    const pathname = normalizedPathname();
    window.blogComments?.unmount();
    closeMobileNavigation();
    document.body.classList.remove('aside-collapsed');
    window.scrollTo({ top: 0, behavior: 'auto' });

    try {
      if (pathname === '/') {
        renderHome(1);
      } else if (/^\/page\/\d+\/$/.test(pathname)) {
        renderHome(Number(pathname.split('/')[2]));
      } else if (pathname === '/archives/') {
        renderArchive();
      } else if (/^\/archives\/\d{4}\/\d{2}\/$/.test(pathname)) {
        const [, year, month] = pathname.match(/^\/archives\/(\d{4})\/(\d{2})\/$/);
        renderArchive(Number(year), Number(month));
      } else if (pathname === '/about/') {
        await renderAbout();
      } else if (pathname === '/categories/' || pathname === '/tags/') {
        renderTaxonomy(pathname.includes('categories') ? 'categories' : 'tags');
      } else if (pathname.startsWith('/categories/') || pathname.startsWith('/tags/')) {
        const parts = pathname.split('/').filter(Boolean);
        const value = resolveTaxonomyValue(parts[0], decodeURIComponent(parts.slice(1).join('/')));
        if (value) {
          renderTaxonomy(parts[0], value);
        } else {
          renderMessage('没有找到这个页面', `路径 ${pathname} 不属于博客或已有工具。`, true);
          setDocumentTitle('页面未找到', { description: '没有找到请求的博客页面。', robots: 'noindex,follow' });
        }
      } else if (pathname === '/search/') {
        renderSearch(new URLSearchParams(location.search).get('q') ?? '');
      } else {
        const post = state.posts.find((item) => normalizedRoute(item.route) === pathname);
        if (post) {
          await renderArticle(post);
        } else {
          renderMessage('没有找到这个页面', `路径 ${pathname} 不属于博客或已有工具。`, true);
          setDocumentTitle('页面未找到', { description: '没有找到请求的博客页面。', robots: 'noindex,follow' });
        }
      }
      main.classList.remove('skip-target');
      window.blogAnalytics?.trackPageView();
      main.focus({ preventScroll: true });
    } catch (error) {
      console.error(error);
      renderMessage('页面载入失败', error instanceof Error ? error.message : String(error), true);
      setDocumentTitle('载入失败', { robots: 'noindex,follow' });
    }
  }

  function navigate(href) {
    const url = new URL(href, location.href);
    history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    void renderRoute();
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-blog-link]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(link.href);
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-lightbox]');
    if (!link || event.defaultPrevented || event.button !== 0) return;
    event.preventDefault();
    const image = link.querySelector('img');
    const preview = imageLightbox.querySelector('img');
    const caption = imageLightbox.querySelector('figcaption');
    preview.src = link.href;
    preview.alt = image?.alt || '';
    caption.textContent = image?.alt || '';
    imageLightbox.showModal();
  });

  navToggle.addEventListener('click', () => {
    const shown = nav.classList.toggle('shownav');
    navToggle.setAttribute('aria-expanded', String(shown));
  });

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;
    const searchConfig = siteConfig.search || {};
    if (searchConfig.localFirst !== false && searchPosts(query).length) {
      navigate(`/search/?q=${encodeURIComponent(query)}`);
      return;
    }
    const fallbackUrl = externalSearchUrl(query);
    if (searchConfig.fallbackOnNoResults !== false && fallbackUrl) {
      location.assign(fallbackUrl);
      return;
    }
    navigate(`/search/?q=${encodeURIComponent(query)}`);
  });

  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    main.classList.add('skip-target');
    main.focus({ preventScroll: false });
  });
  main.addEventListener('blur', () => main.classList.remove('skip-target'));

  asidePart.addEventListener('click', (event) => {
    if (event.target.closest('#close-aside')) document.body.classList.add('aside-collapsed');
  });
  document.getElementById('open-aside').addEventListener('click', () => document.body.classList.remove('aside-collapsed'));
  imageLightbox.querySelector('.lightbox-close').addEventListener('click', () => imageLightbox.close());
  imageLightbox.addEventListener('click', (event) => {
    if (event.target === imageLightbox) imageLightbox.close();
  });
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
  window.addEventListener('scroll', () => {
    topButton.classList.toggle('visible', siteConfig.features.toTop !== false && window.scrollY > 1000);
    const tocAside = document.getElementById('toc-aside');
    if (tocAside) tocAside.style.top = `${Math.max(140, 320 - window.scrollY)}px`;
  }, { passive: true });
  window.addEventListener('popstate', () => void renderRoute());

  async function init() {
    try {
      if (!window.marked || !window.DOMPurify) throw new Error('Markdown 渲染库加载失败，请检查网络后刷新页面。');
      const [response, configResponse] = await Promise.all([
        fetch(`${BLOG_ROOT}/data/posts.json`),
        fetch(`${BLOG_ROOT}/data/site-config.json`),
      ]);
      if (!response.ok) throw new Error(`读取文章索引失败（HTTP ${response.status}）。`);
      if (!configResponse.ok) throw new Error(`读取站点配置失败（HTTP ${configResponse.status}）。`);
      const [data, loadedSiteConfig] = await Promise.all([response.json(), configResponse.json()]);
      if (!Array.isArray(data.posts)) throw new Error('文章索引格式无效。');
      siteConfig = loadedSiteConfig;
      applySiteConfig();
      configureMarkdownRenderer();
      state.posts = data.posts;
      state.categories = countBy(state.posts, 'categories');
      state.tags = countBy(state.posts, 'tags');
      await renderRoute();
    } catch (error) {
      console.error(error);
      renderMessage('博客初始化失败', error instanceof Error ? error.message : String(error), true);
      setDocumentTitle('初始化失败', { robots: 'noindex,follow' });
    }
  }

  void init();
})();
