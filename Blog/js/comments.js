(function () {
  'use strict';

  const scriptUrl = new URL(document.currentScript.src, location.href);
  const BLOG_ROOT = new URL('../', scriptUrl).pathname.replace(/\/$/, '');
  const API_ROOT = 'https://api.github.com';
  const API_VERSION = '2022-11-28';
  let configPromise;
  let issueMapPromise;
  let activeState;
  let waitingState;
  let focusTimer;

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function loadJson(path) {
    return fetch(`${BLOG_ROOT}/${path}`, { cache: 'no-cache' }).then((response) => {
      if (!response.ok) throw new Error(`读取评论配置失败（HTTP ${response.status}）。`);
      return response.json();
    });
  }

  function loadConfig() {
    if (!configPromise) configPromise = loadJson('data/comments-config.json');
    return configPromise;
  }

  function loadIssueMap() {
    if (!issueMapPromise) issueMapPromise = loadJson('data/comment-issues.json');
    return issueMapPromise;
  }

  function githubUrl(config, path) {
    return `https://github.com/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}${path}`;
  }

  function apiPath(config, path) {
    return `${API_ROOT}/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}${path}`;
  }

  function rateLimitMessage(response) {
    const reset = Number(response.headers.get('x-ratelimit-reset'));
    if (!Number.isFinite(reset)) return 'GitHub API 暂时限制了匿名请求，请稍后重试或直接前往 GitHub 查看。';
    return `GitHub API 匿名请求额度已用完，可在 ${new Date(reset * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 后重试。`;
  }

  async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/vnd.github.html+json',
        'X-GitHub-Api-Version': API_VERSION,
        ...(options.headers || {}),
      },
    });
    if (response.status === 403 || response.status === 429) {
      const error = new Error(rateLimitMessage(response));
      error.rateLimited = true;
      throw error;
    }
    if (!response.ok) throw new Error(`GitHub API 请求失败（HTTP ${response.status}）。`);
    return response;
  }

  function cachedIssueKey(config, id) {
    return `blog-comment-issue:${config.owner}/${config.repo}:${id}`;
  }

  function normalizeMappedIssue(config, mapped) {
    const number = Number(typeof mapped === 'object' ? mapped.number : mapped);
    if (!Number.isInteger(number) || number <= 0) return null;
    return {
      number,
      html_url: typeof mapped === 'object' && mapped.url
        ? mapped.url
        : githubUrl(config, `/issues/${number}`),
    };
  }

  function rememberIssue(config, id, issue) {
    try {
      sessionStorage.setItem(cachedIssueKey(config, id), JSON.stringify({ number: issue.number, url: issue.html_url }));
    } catch {
      // 隐私模式禁用存储时仍可继续使用当前页面数据。
    }
  }

  function readRememberedIssue(config, id) {
    try {
      return normalizeMappedIssue(config, JSON.parse(sessionStorage.getItem(cachedIssueKey(config, id)) || 'null'));
    } catch {
      return null;
    }
  }

  async function findIssue(config, id, title, canonicalUrl, forceRefresh = false) {
    const issueMap = await loadIssueMap();
    const mapped = normalizeMappedIssue(config, issueMap.issues?.[id]);
    if (mapped) return mapped;
    if (!forceRefresh) {
      const remembered = readRememberedIssue(config, id);
      if (remembered) return remembered;
    }

    const labels = [...(config.labels || []), id].join(',');
    const labelQuery = new URLSearchParams({ state: 'all', labels, per_page: '1' });
    const labelResponse = await apiRequest(apiPath(config, `/issues?${labelQuery}`));
    const labelIssues = await labelResponse.json();
    const byLabel = labelIssues.find((issue) => !issue.pull_request);
    if (byLabel) {
      rememberIssue(config, id, byLabel);
      return byLabel;
    }

    const recentQuery = new URLSearchParams({ state: 'all', per_page: '100', sort: 'created', direction: 'desc' });
    const recentResponse = await apiRequest(apiPath(config, `/issues?${recentQuery}`));
    const recentIssues = await recentResponse.json();
    const byTitle = recentIssues.find((issue) => !issue.pull_request &&
      (issue.title === title || issue.title === `[评论] ${title}`) &&
      (!issue.body || issue.body.includes(canonicalUrl)));
    if (byTitle) rememberIssue(config, id, byTitle);
    return byTitle || null;
  }

  function createIssueUrl(config, state) {
    const parameters = new URLSearchParams({
      title: state.title,
      body: `${state.canonicalUrl}\n\n此 Issue 用于该页面的评论。`,
      labels: [...new Set([...(config.labels || []), state.id])].join(','),
    });
    return githubUrl(config, `/issues/new?${parameters}`);
  }

  function sanitizeComment(html) {
    if (!window.DOMPurify) return '';
    const safe = window.DOMPurify.sanitize(html || '', {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target'],
    });
    const template = document.createElement('template');
    template.innerHTML = safe;
    template.content.querySelectorAll('a').forEach((link) => {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
    return template.innerHTML;
  }

  function commentHtml(comment) {
    const author = comment.user?.login || 'ghost';
    const profile = comment.user?.html_url || 'https://github.com';
    const avatar = comment.user?.avatar_url || '';
    const avatarUrl = avatar ? `${avatar}${avatar.includes('?') ? '&' : '?'}s=80` : '';
    const date = new Date(comment.created_at).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' });
    return `
      <article class="github-comment" data-comment-id="${Number(comment.id)}">
        <header class="github-comment-header">
          ${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}
          <div><a href="${escapeHtml(profile)}" target="_blank" rel="noopener noreferrer">${escapeHtml(author)}</a><time datetime="${escapeHtml(comment.created_at)}">${escapeHtml(date)}</time></div>
          <a class="github-comment-source" href="${escapeHtml(comment.html_url)}" target="_blank" rel="noopener noreferrer">GitHub</a>
        </header>
        <div class="github-comment-body">${sanitizeComment(comment.body_html)}</div>
      </article>`;
  }

  function setStatus(state, message, kind = '') {
    const status = state.host.querySelector('[data-comments-status]');
    if (!status) return;
    status.className = `comments-status${kind ? ` ${kind}` : ''}`;
    status.textContent = message;
  }

  function setActions(state) {
    const actions = state.host.querySelector('[data-comments-actions]');
    if (!actions) return;
    const issueUrl = state.issue?.html_url || createIssueUrl(state.config, state);
    actions.innerHTML = `
      <a class="comments-primary-action" href="${escapeHtml(issueUrl)}" target="_blank" rel="noopener noreferrer" data-comment-compose>
        ${state.issue ? '在 GitHub 发表评论' : '在 GitHub 创建评论页'}
      </a>`;
  }

  function setLookupAction(state) {
    const actions = state.host.querySelector('[data-comments-actions]');
    if (!actions) return;
    const labels = [...new Set([...(state.config.labels || []), state.id])];
    const query = `is:issue ${labels.map((label) => `label:"${label}"`).join(' ')}`;
    const issueUrl = githubUrl(state.config, `/issues?${new URLSearchParams({ q: query })}`);
    actions.innerHTML = `
      <a class="comments-primary-action" href="${escapeHtml(issueUrl)}" target="_blank" rel="noopener noreferrer" data-comment-compose>
        在 GitHub 查找评论页
      </a>`;
  }

  function beginWaiting(state) {
    clearWaiting();
    state.waiting = true;
    state.waitStartedAt = new Date(Date.now() - 1000).toISOString();
    state.pollIndex = 0;
    waitingState = state;
    const panel = state.host.querySelector('[data-comments-waiting]');
    panel.hidden = false;
    panel.innerHTML = `
      <span>已打开 GitHub。提交评论后返回这里，将自动同步。</span>
      <button type="button" data-comment-sync>我已评论，立即同步</button>
      <button type="button" data-comment-cancel>取消等待</button>`;
  }

  function clearWaiting(message = '') {
    if (!waitingState) return;
    if (waitingState.pollTimer) clearTimeout(waitingState.pollTimer);
    waitingState.pollTimer = null;
    waitingState.waiting = false;
    const panel = waitingState.host.querySelector('[data-comments-waiting]');
    if (panel) {
      panel.hidden = !message;
      panel.textContent = message;
    }
    waitingState = null;
  }

  function appendComments(state, comments, replace = false) {
    const list = state.host.querySelector('[data-comments-list]');
    if (!list) return 0;
    const fresh = comments.filter((comment) => !state.commentIds.has(Number(comment.id)));
    if (replace) {
      list.innerHTML = '';
      state.commentIds.clear();
    }
    for (const comment of comments) {
      if (state.commentIds.has(Number(comment.id))) continue;
      state.commentIds.add(Number(comment.id));
      list.insertAdjacentHTML('beforeend', commentHtml(comment));
    }
    return fresh.length;
  }

  async function loadCommentPage(state, page = 1, append = false) {
    if (!state.issue) return;
    const query = new URLSearchParams({ per_page: String(state.config.perPage || 10), page: String(page) });
    const response = await apiRequest(apiPath(state.config, `/issues/${state.issue.number}/comments?${query}`), { signal: state.abortController.signal });
    const comments = await response.json();
    appendComments(state, comments, !append);
    state.page = page;
    const hasNext = /<[^>]+>;\s*rel="next"/.test(response.headers.get('link') || '');
    const more = state.host.querySelector('[data-comments-more]');
    more.hidden = !hasNext;
    setStatus(state, state.commentIds.size ? `${state.commentIds.size} 条评论` : '还没有评论，欢迎留下第一条。');
  }

  async function initialize(state) {
    if (state.loaded || state.loading || !state.host.isConnected) return;
    state.loading = true;
    setStatus(state, '正在读取 GitHub 评论…');
    try {
      state.config ||= await loadConfig();
      if (!state.config.enabled) {
        state.host.remove();
        return;
      }
      state.issue = await findIssue(state.config, state.id, state.title, state.canonicalUrl);
      setActions(state);
      if (state.issue) await loadCommentPage(state);
      else setStatus(state, '这篇文章还没有建立评论页。');
      state.loaded = true;
    } catch (error) {
      console.warn('评论加载失败：', error);
      setStatus(state, error instanceof Error ? error.message : String(error), 'error');
      if (state.issue) setActions(state);
      else if (state.config) setLookupAction(state);
    } finally {
      state.loading = false;
    }
  }

  async function checkForNewComment(state) {
    if (!state.waiting || state.syncing || document.visibilityState !== 'visible' || !state.host.isConnected) return;
    state.syncing = true;
    setStatus(state, '正在同步新评论…');
    try {
      if (!state.issue) {
        state.issue = await findIssue(state.config, state.id, state.title, state.canonicalUrl, true);
        setActions(state);
      }
      if (!state.issue) throw new Error('尚未发现对应的 GitHub Issue，可稍后再次同步。');
      const query = new URLSearchParams({ since: state.waitStartedAt, per_page: '100' });
      const response = await apiRequest(apiPath(state.config, `/issues/${state.issue.number}/comments?${query}`), { signal: state.abortController.signal });
      const comments = await response.json();
      const added = appendComments(state, comments);
      if (added > 0) {
        setStatus(state, `已同步 ${added} 条新评论。`, 'success');
        clearWaiting('评论已同步。');
        return;
      }
      setStatus(state, state.commentIds.size ? `${state.commentIds.size} 条评论，暂未发现新增内容。` : '暂未发现新评论。');
      const delays = state.config.returnPollDelays || [];
      if (state.pollIndex < delays.length) {
        const delay = Number(delays[state.pollIndex++]);
        state.pollTimer = setTimeout(() => checkForNewComment(state), delay);
      } else {
        const panel = state.host.querySelector('[data-comments-waiting]');
        panel.hidden = false;
        panel.innerHTML = `
          <span>暂未发现新评论。</span>
          <button type="button" data-comment-sync>立即同步</button>
          <button type="button" data-comment-cancel>结束等待</button>`;
      }
    } catch (error) {
      console.warn('评论同步失败：', error);
      setStatus(state, error instanceof Error ? error.message : String(error), 'error');
      if (error?.rateLimited) clearWaiting('GitHub API 请求额度不足，稍后可手动同步。');
    } finally {
      state.syncing = false;
    }
  }

  function triggerReturnSync() {
    if (!waitingState || document.visibilityState !== 'visible') return;
    clearTimeout(focusTimer);
    focusTimer = setTimeout(() => checkForNewComment(waitingState), 350);
  }

  function unmount() {
    if (activeState?.observer) activeState.observer.disconnect();
    if (activeState?.abortController) activeState.abortController.abort();
    if (waitingState === activeState) clearWaiting();
    activeState = null;
  }

  function mount(host, options) {
    unmount();
    if (!host) return;
    const state = {
      host,
      id: options.id,
      title: options.title,
      canonicalUrl: options.url,
      issue: null,
      config: null,
      loaded: false,
      loading: false,
      syncing: false,
      waiting: false,
      page: 1,
      pollIndex: 0,
      pollTimer: null,
      commentIds: new Set(),
      abortController: new AbortController(),
    };
    activeState = state;
    host.innerHTML = `
      <section class="github-comments" aria-labelledby="comments-title">
        <header class="comments-heading"><h2 id="comments-title">评论</h2><div data-comments-actions></div></header>
        <p class="comments-status" data-comments-status>评论将在滚动到这里时载入。</p>
        <div class="comments-waiting" data-comments-waiting hidden></div>
        <div class="comments-list" data-comments-list></div>
        <button class="comments-more" type="button" data-comments-more hidden>加载更多评论</button>
      </section>`;

    host.addEventListener('click', (event) => {
      if (event.target.closest('[data-comment-compose]')) beginWaiting(state);
      if (event.target.closest('[data-comment-sync]')) {
        if (state.pollTimer) clearTimeout(state.pollTimer);
        state.pollTimer = null;
        void checkForNewComment(state);
      }
      if (event.target.closest('[data-comment-cancel]')) clearWaiting();
      if (event.target.closest('[data-comments-more]')) void loadCommentPage(state, state.page + 1, true);
    });

    void loadConfig().then((config) => {
      if (activeState !== state || !host.isConnected) return;
      state.config = config;
      if (!config.enabled) {
        host.remove();
        return;
      }
      if ('IntersectionObserver' in window) {
        state.observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          state.observer.disconnect();
          void initialize(state);
        }, { rootMargin: options.rootMargin || config.lazyRootMargin || '400px 0px' });
        state.observer.observe(host);
      } else {
        void initialize(state);
      }
    }).catch((error) => {
      if (activeState !== state || !host.isConnected) return;
      console.warn('评论配置加载失败：', error);
      setStatus(state, error instanceof Error ? error.message : String(error), 'error');
    });
  }

  document.addEventListener('visibilitychange', triggerReturnSync);
  window.addEventListener('focus', triggerReturnSync);
  window.blogComments = { mount, unmount };
}());
