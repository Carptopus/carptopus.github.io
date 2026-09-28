---
title: MyPodsync播客RSS同步软件
tags:
  - 我的软件
  - 工具
categories: 2.软件
date: 2026-02-23 19:20:00
---

## 说明

还是个给自己写的软件，目前试用感觉还行分享下吧。

最近播客又有点火，但是都在抄国外搞什么视频播客莫名其妙还不往播客平台发，有点离谱。
为了能听到这些 YouTube 还有 Bilibili 上的视频播客，先是搜了下类似能力的软件。查到已经有 [Podsync](https://github.com/mxpv/podsync) 可以同步 YouTube 的视频为播客 RSS，也有国内开发 fork 支持了 Bilibili 的（[yangtfu/podsync](https://github.com/yangtfu/podsync)，不过实测已经用不了了），还有个在知乎推广的在线的需要付费的只支持 Bilibili 的（[bilipod](https://bilipod.itpanda.net/)），还有个 [Podcast2](https://github.com/yajuhua/podcast2) 这个貌似还可以不过功能好像有 bug 啊。
大概看了下原理都类似，通过 yt-dlp 下载视频或者音频然后生成符合 Podcast 格式的 RSS 的 XML，直接用 Trae 周年活动送的额度自己 Vibe Coding 实现了一个，顺便还做了个支持直接访问不通的 RSS 的中转支持功能。
通过这个软件生成 RSS XML 地址就可以给 Podcast 或者 [AntennaPod](https://antennapod.org/) 用来订阅收听了。

技术栈也想说说，用的 Golang 实现，数据库用的 SQLite，完全不会 Golang ，写完也还是不懂的，哈哈！但是 Golang 好啊，内存占用小，最关键直接支持跨平台，不用搞什么 Docker 配置，自部署本机或者 VPS 都很方便。

实测抓取 YouTube 不太行，不过原因是 [yt-dlp](https://github.com/yt-dlp/yt-dlp/wiki/FAQ) 被 YouTube 针对了，配置了 Cookies 也有很多频道没法下载，期待 yt-dlp 后续能道高一丈吧。

软件下载连接：[百度网盘](https://pan.baidu.com/s/1cD1hZEh7KQNzsk6ROxm79w?pwd=h1hq)

下面是 AI 根据代码和配置生成的介绍

## 软件介绍

MyPodsync 做的事情很简单：把「视频/播客」统一变成「可订阅的本地播客 RSS」。

它主要包含三步：

1. 拉列表：从不同来源获取最新条目（订阅列表）
2. 下音频：使用 `yt-dlp` 下载到本地目录（需要时会用 `ffmpeg` 提取为音频）
3. 出 RSS：启动本机 HTTP 服务，对外输出 RSS 与媒体文件（RSS 的 enclosure 指向本机 `/media/...`）


### 必须的依赖

- `yt-dlp` 可执行文件
  - 默认从系统 `PATH` 查找
  - 也可以在配置里通过 `downloader.binar_path` 指定路径
  - 如果配置了路径但文件不存在，会自动回退到 `PATH` 查找（并兜底尝试 `youtube-dl`）
- `ffmpeg` / `ffprobe`（可选）
  - 用途 1：配合 `yt-dlp -x` 把视频提取成音频（m4a）
  - 用途 2：当订阅开启 `probe_duration = true` 时，用于探测本地音频真实时长（让 `min_duration` 过滤更准确）
  - 默认从系统 `PATH` 查找；也可以用 `downloader.ffmpeg_dir` 指定 `ffmpeg/bin` 目录（路径不存在会自动回退到 `PATH`）

### 支持的来源

- YouTube
  - 推荐使用 `channel_id`（走 YouTube RSS）
  - 也支持配置 `url`（走 `yt-dlp --flat-playlist` 列表）
- Bilibili
  - 使用 `mid` 或 `https://space.bilibili.com/{mid}` 拉取投稿列表
- RSS 中转（`rss_relay`）
  - 配置一个上游 RSS 地址，程序解析条目 enclosure 下载音频并生成本地 RSS

### 主要配置项（TOML）

配置文件默认同目录下 `config.toml`，核心字段基本就这些：

- `[app]`
  - `db_path`：SQLite 数据库文件路径
  - `download_dir`：音频保存目录
  - `max_items`：全局每个订阅的保留数量上限（也作为单次处理上限；可被订阅的 `subscriptions.max_items` 覆盖）
  - `http_proxy`：全局 HTTP 代理（可被订阅的 `http_proxy` 覆盖）
  - `update_at`：全局定时更新的整点小时列表（逗号分隔，如 `0,6,12,18`）
  - `bind_address`：HTTP 服务监听地址（默认 `*`，即监听所有网卡）
  - `port`：HTTP 服务端口（默认 `8080`）
  - `base_url`：生成 RSS 内链接时使用的基准 URL（可选；不填时会按本机地址推断）
- `[downloader]`
  - `binar_path`：`yt-dlp` 可执行文件名/路径（为空默认 `yt-dlp`）
  - `ffmpeg_dir`：`ffmpeg` 所在目录（用于 `yt-dlp -x` 提取音频；可填 `...\ffmpeg`）
- `[[subscriptions]]`
  - `id`：订阅唯一 ID（用于目录名与 RSS 路径）
  - `provider`：`youtube` / `bilibili` / `rss_relay`
  - `name`：订阅显示名
  - `max_items`：该订阅保留/处理上限（0 表示使用 `app.max_items`）
  - `probe_duration`：是否用 ffprobe/ffmpeg 探测本地音频真实时长（默认关闭；开启后会覆盖条目时长，`min_duration_minutes` 过滤更准确）
  - `http_proxy`：该订阅使用的 HTTP 代理（为空表示使用 `app.http_proxy`）
  - `cookies_file`：cookies 文件路径（用于 YouTube 等需要登录/人机验证场景）
  - `update_at`：覆盖 `app.update_at`（填 `off` 表示禁用该订阅定时更新）
  - provider 额外字段：
    - YouTube：配置 `channel_id` 或 `url` 二选一
    - Bilibili：配置 `mid` 或 `url`（space 链接）二选一
    - RSS Relay：配置 `url` 为上游 RSS 地址
  - `filter.*`：过滤规则（见下文）
  - `rss.*`：可选，覆盖 RSS 标题/链接/作者/语言等元信息

### 本机输出（RSS 订阅 URL）

默认地址：`http://127.0.0.1:8080/`（可通过 `app.bind_address` / `app.port` 修改）

- 如果要在局域网设备订阅，建议设置 `app.bind_address = "*"`，并把 `app.base_url` 写成你的 IPv4（例如 `http://192.168.101.7:8080`），这样 RSS 里的链接会指向正确的地址。
- 首页（列出所有订阅 RSS 地址）：`{base_url}/`（例：`http://127.0.0.1:8080/`）
- 单个订阅 RSS：`{base_url}/rss/{subscription_id}.xml`
- 媒体文件：`{base_url}/media/...`

下载文件默认保存到：`{download_dir}/{provider}/{subscription_id}/`（默认 `downloads/{provider}/{subscription_id}/`）

### 数量限制与自动清理

每个订阅会保留最新的 N 条（N 由 `max_items` 决定）：

- 全局 `app.max_items`
- 单订阅 `subscriptions[].max_items` 可覆盖

超过保留数量时，会自动清理更旧的数据库记录与本地音频文件，保证目录不会无限膨胀。

### RSS 过滤

每个订阅都可以配置过滤规则 `filter.*`（取交集：都满足才会保留）：

- `filter.min_duration_minutes`：最小时长（分钟）
- `filter.include_text`：必须包含的关键词（支持用 `|` 分隔多个；忽略大小写；命中任意一个就算匹配）
- `filter.exclude_text`：必须不包含的关键词（支持用 `|` 分隔多个；忽略大小写；命中任意一个就会被过滤）

### 定时更新 + 配置热更新

- 启动时先同步一次
- 定时更新由 `app.update_at` 控制（整点小时列表）
- 单订阅可用 `subscriptions[].update_at` 覆盖（填 `off` 表示禁用）
- `config.toml` 支持热更新：新增/修改订阅会自动重启定时器并触发一次同步

### 代理与 cookies（用于人机验证/特殊网络）

- 全局代理：`app.http_proxy`
- 单订阅代理：`subscriptions[].http_proxy`（覆盖全局）
- cookies：`subscriptions[].cookies_file`（Netscape cookies.txt）

## 其他（可不看）

### Windows 路径写法

- Windows TOML 路径建议用单引号，例如：`cookies_file = 'C:\Tools\youtube_cookies.txt'`
- 如果写成双引号并使用单个反斜杠（如 `"C:\Tools\..."`），可能触发转义问题
