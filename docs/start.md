# 如何在本地(windows机器)使用

> 后端服务默认端口8341
>
> [后端服务下载地址](https://github.com/limoxi/teamdo/releases/download/backend/iteamdo.exe)

```
0. 从release中将iteamdo.exe下载到本地
1. 确保本地已安装mysql
2. 创建database：
    CREATE DATABASE tapster DEFAULT CHARSET UTF8MB4;
3. 授权用户：
    grant all on teamdo.* to teamdo@'127.0.0.1' identified by 'test'
4. 初始化表
    下载目录/iteamdo.exe sync
5. 启动后端服务
    下载目录/iteamdo.exe
6. 准备前端开发环境
    yarn install
7. 启动前端服务
    yarn run dev
8. 浏览器中访问 http://127.0.0.1:3000
```

# 开启服务端消息推送

> 该功能通过SSE实现,要求及配置如下

- 现代浏览器对于keep-alive的连接都有时间限制，比如Chrome在1min后会断开连接，此时会触发SourceEvent重连
- 必须使用https，以便使用现代浏览器的桌面通知功能
- nginx配置如下：

```
server {
    ---
    proxy_read_timeout 24h;  # 读取后端服务器响应超时时间，设置长一点
    ---
}
location /iteamdo/message/ {
  proxy_http_version 1.1;  # 必须在1.1以上
  proxy_buffering off;  # 关闭缓冲
  proxy_set_header Connection '';  # 保持连接，避免close
  proxy_set_header X-Accel-Buffering no;  # 设置代理的响应头部，保持传输编码为 chunked
  proxy_pass http://backendapi.xxx.com;  # 后端服务地址
}
```

# 本地开发依赖

- Node v20.12.1 LTS