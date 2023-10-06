# TeamDo
简单高效的团队任务管理工具

![image](https://user-images.githubusercontent.com/7345689/192682303-7184742b-794a-4dfe-b649-5328bf5a63b9.png)

# 如何在本地使用
- 后端服务默认端口8341
```
1. 确保本地已安装mysql
2. 创建database：
    CREATE DATABASE tapster DEFAULT CHARSET UTF8MB4;
3. 授权用户：
    grant all on teamdo.* to teamdo@'127.0.0.1' identified by 'test'
4. 初始化表
    你的项目目录/teamdo/server/iteamdo.exe sync
5. 启动后端服务
    你的项目目录/teamdo/server/iteamdo.exe
6. 准备前端开发环境
    yarn install
7. 启动前端服务
    yarn run dev
8. 浏览器中访问 http://127.0.0.1:3000
```