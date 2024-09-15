import{_ as s,c as n,a0 as e,o as p}from"./chunks/framework.IipQj3V9.js";const u=JSON.parse('{"title":"如何在本地(windows机器)使用","description":"","frontmatter":{},"headers":[],"relativePath":"start.md","filePath":"start.md"}'),l={name:"start.md"};function t(i,a,o,c,r,d){return p(),n("div",null,a[0]||(a[0]=[e(`<h1 id="如何在本地-windows机器-使用" tabindex="-1">如何在本地(windows机器)使用 <a class="header-anchor" href="#如何在本地-windows机器-使用" aria-label="Permalink to &quot;如何在本地(windows机器)使用&quot;">​</a></h1><blockquote><p>后端服务默认端口8341</p><p><a href="https://github.com/limoxi/teamdo/releases/download/backend/iteamdo.exe" target="_blank" rel="noreferrer">后端服务下载地址</a></p></blockquote><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>0. 从release中将iteamdo.exe下载到本地</span></span>
<span class="line"><span>1. 确保本地已安装mysql</span></span>
<span class="line"><span>2. 创建database：</span></span>
<span class="line"><span>    CREATE DATABASE tapster DEFAULT CHARSET UTF8MB4;</span></span>
<span class="line"><span>3. 授权用户：</span></span>
<span class="line"><span>    grant all on teamdo.* to teamdo@&#39;127.0.0.1&#39; identified by &#39;test&#39;</span></span>
<span class="line"><span>4. 初始化表</span></span>
<span class="line"><span>    下载目录/iteamdo.exe sync</span></span>
<span class="line"><span>5. 启动后端服务</span></span>
<span class="line"><span>    下载目录/iteamdo.exe</span></span>
<span class="line"><span>6. 准备前端开发环境</span></span>
<span class="line"><span>    yarn install</span></span>
<span class="line"><span>7. 启动前端服务</span></span>
<span class="line"><span>    yarn run dev</span></span>
<span class="line"><span>8. 浏览器中访问 http://127.0.0.1:3000</span></span></code></pre></div><h1 id="开启服务端消息推送" tabindex="-1">开启服务端消息推送 <a class="header-anchor" href="#开启服务端消息推送" aria-label="Permalink to &quot;开启服务端消息推送&quot;">​</a></h1><blockquote><p>该功能通过SSE实现,要求及配置如下</p></blockquote><ul><li>现代浏览器对于keep-alive的连接都有时间限制，比如Chrome在1min后会断开连接，此时会触发SourceEvent重连</li><li>必须使用https，以便使用现代浏览器的桌面通知功能</li><li>nginx配置如下：</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>server {</span></span>
<span class="line"><span>    ---</span></span>
<span class="line"><span>    proxy_read_timeout 24h;  # 读取后端服务器响应超时时间，设置长一点</span></span>
<span class="line"><span>    ---</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>location /iteamdo/message/ {</span></span>
<span class="line"><span>  proxy_http_version 1.1;  # 必须在1.1以上</span></span>
<span class="line"><span>  proxy_buffering off;  # 关闭缓冲</span></span>
<span class="line"><span>  proxy_set_header Connection &#39;&#39;;  # 保持连接，避免close</span></span>
<span class="line"><span>  proxy_set_header X-Accel-Buffering no;  # 设置代理的响应头部，保持传输编码为 chunked</span></span>
<span class="line"><span>  proxy_pass http://backendapi.xxx.com;  # 后端服务地址</span></span>
<span class="line"><span>}</span></span></code></pre></div><h1 id="本地开发依赖" tabindex="-1">本地开发依赖 <a class="header-anchor" href="#本地开发依赖" aria-label="Permalink to &quot;本地开发依赖&quot;">​</a></h1><ul><li>Node v20.12.1 LTS</li></ul>`,9)]))}const m=s(l,[["render",t]]);export{u as __pageData,m as default};
