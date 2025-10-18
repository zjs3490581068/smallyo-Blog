---
title: "每次使用bash时连接公钥的代码"
categories: Share
tags: ['bash']
id: "connect-bash-everytime"
date: 2025-10-18 12:37:38
cover: ""
recommend: true
top: true
---

:::note
密钥没安装在默认位置，每次打开都要重新连接……
:::

### 代码

- eval "$(ssh-agent -s)"  // 启动ssh-agent
- ssh-add /e/ssh_keys/id_rsa   // 将你的私钥添加到ssh-agent中 
- ssh -T git@github.com  // 测试连接