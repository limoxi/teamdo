# TeamDo
简单高效的团队任务管理工具

![image](https://user-images.githubusercontent.com/7345689/192682303-7184742b-794a-4dfe-b649-5328bf5a63b9.png)

# 如何在本地(windows机器)使用
> 后端服务默认端口8341
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
- 必须使用https，以便使用现代浏览器的桌面通知功能
- nginx配置如下：
```
location /iteamdo/message/ {
  proxy_http_version 1.1;  # 不能是1.0
  proxy_buffering off;  # 关闭缓冲
  proxy_read_timeout 24h;  # 读取后端服务器响应超时时间，需要很长
  proxy_connect_timeout 1h;  # 客户端连接超时时间
  proxy_set_header Connection '';  # 保持连接，避免close
  proxy_set_header X-Accel-Buffering no;  # 设置代理的响应头部，保持传输编码为 chunked
  proxy_pass http://backendapi.xxx.com;  # 后端服务地址
}
```