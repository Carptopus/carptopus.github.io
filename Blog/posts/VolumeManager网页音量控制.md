title: VolumeManager网页音量控制
tags:
  - 我的软件
  - 工具
categories: 2.软件
date: 2018-12-07 13:55:20
---

这也是一个Chrome浏览器扩展应用。  
它的功能是控制网页音频视频的音量大小。  
下载链接：[百度网盘](https://pan.baidu.com/s/1tjFbtnQsCX-C9CcsJwf9nA)   
Chrome商店：[链接](https://chrome.google.com/webstore/detail/ogpbjlhpdjmcbkocjibemdmblffnfkmm)
控制界面如下：  
![](\images\VolumeManager.png)   

网上其实可以找到很多类似的音量控制的扩展，
不过我做的这个有一点微小的进步：部分实现了自动记忆音量配置的功能   
做这个扩展的初心最想要实现的功能就是这个自动设置，可惜最后只能做出这样一个将就妥协的版本。  
其中缘由在此记录，  
已有的那些音量控制扩展都是基于浏览器原生API（`chrome.tabCapture.capture`）实现的，但由于Chrome浏览器的限制扩展无法实现打开页面时自动设置页面音量，唉。  

要实现这个自动设置的功能只能通过HTML5标准中的API来实现，但这样就只能支持通过HTML5标准中的Video和Audio标签加载的音视频了，而且还有页面中Vido标签变化导致设置失效的问题（解决这个问题也挺麻烦的）。   

想到最后就出了这个方案，根据不同页面可以设置这两种不同的实现。 