(function () {
  'use strict';

  const analyticsScriptUrl = new URL(document.currentScript.src, location.href);
  const BLOG_ROOT = new URL('../', analyticsScriptUrl).pathname.replace(/\/$/, '');
  const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
  const queuedPages = [];
  let lastQueuedPath = '';
  let previousPageLocation = document.referrer || '';
  let startPromise;
  let trackers;

  function isProductionPage() {
    return location.protocol === 'https:' && !LOCAL_HOSTS.has(location.hostname);
  }

  function currentPage() {
    const page = {
      path: `${location.pathname}${location.search}`,
      title: document.title,
      location: location.href.split('#')[0],
      referrer: previousPageLocation,
    };
    previousPageLocation = page.location;
    return page;
  }

  function appendScript(src, id) {
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.append(script);
  }

  function createGoogleTracker(config) {
    if (!config?.enabled || !config.id) return null;

    if (config.id.startsWith('G-')) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', config.id, { send_page_view: false });
      appendScript(
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.id)}`,
        'google-analytics-script',
      );
      return (page) => {
        const parameters = {
          page_title: page.title,
          page_location: page.location,
        };
        if (page.referrer) parameters.page_referrer = page.referrer;
        window.gtag('event', 'page_view', parameters);
      };
    }

    if (config.id.startsWith('UA-')) {
      window.GoogleAnalyticsObject = 'ga';
      window.ga = window.ga || function ga() {
        (window.ga.q = window.ga.q || []).push(arguments);
      };
      window.ga.l = window.ga.l || Date.now();
      const configuredSite = String(config.site || '').toLowerCase();
      const currentHost = location.hostname.toLowerCase();
      const cookieDomain = configuredSite &&
        (currentHost === configuredSite || currentHost.endsWith(`.${configuredSite}`))
        ? configuredSite
        : 'auto';
      window.ga('create', config.id, cookieDomain);
      window.ga('set', 'anonymizeIp', true);
      appendScript('https://www.google-analytics.com/analytics.js', 'google-analytics-script');
      return (page) => {
        window.ga('set', 'page', page.path);
        window.ga('set', 'title', page.title);
        if (page.referrer) window.ga('set', 'referrer', page.referrer);
        window.ga('send', 'pageview');
      };
    }

    console.warn('未识别的 Google Analytics ID，已跳过加载。');
    return null;
  }

  function createBaiduTracker(config, automaticPath) {
    if (!config?.enabled || !config.sitecode) return null;

    window._hmt = window._hmt || [];
    appendScript(
      `https://hm.baidu.com/hm.js?${encodeURIComponent(config.sitecode)}`,
      'baidu-tongji-script',
    );
    let skipAutomaticPage = true;
    return (page) => {
      if (skipAutomaticPage && page.path === automaticPath) {
        skipAutomaticPage = false;
        return;
      }
      window._hmt.push(['_trackPageview', page.path]);
    };
  }

  async function initialize() {
    try {
      const response = await fetch(`${BLOG_ROOT}/data/analytics-config.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const config = await response.json();
      const automaticBaiduPath = `${location.pathname}${location.search}`;
      trackers = [
        createGoogleTracker(config.google),
        createBaiduTracker(config.baidu, automaticBaiduPath),
      ].filter(Boolean);
      const pages = queuedPages.splice(0);
      pages.forEach((page) => trackers.forEach((track) => track(page)));
    } catch (error) {
      console.warn('页面统计初始化失败：', error);
      trackers = [];
    }
  }

  function scheduleInitialization() {
    if (startPromise) return;
    startPromise = new Promise((resolve) => {
      const start = () => resolve(initialize());
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(start, { timeout: 2000 });
      } else {
        window.setTimeout(start, 0);
      }
    });
  }

  function trackPageView() {
    if (!isProductionPage()) return;
    const page = currentPage();
    if (page.path === lastQueuedPath) return;
    lastQueuedPath = page.path;

    if (trackers) {
      trackers.forEach((track) => track(page));
      return;
    }

    queuedPages.push(page);
    scheduleInitialization();
  }

  window.blogAnalytics = { trackPageView };
})();
