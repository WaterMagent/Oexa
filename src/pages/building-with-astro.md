---
title: 用 Astro 搭建博客
date: 2026-06-24
description: 为什么 Astro 是我做内容网站的首选框架。
layout: ../layouts/BlogPost.astro
banner: https://picsum.photos/seed/astro/720/240
---

[Astro](https://astro.build) 已经迅速成为我构建内容型网站最得心应手的工具之一。下面聊聊原因。

## 岛屿架构

Astro 最大的创新是 **Islands（岛屿）** —— 交互式组件在静态页面中独立加载。这意味着：

- 页面默认不发送任何 JavaScript
- 只有可交互的元素才会在客户端水合
- 性能从一开始就被刻进了架构里

## 内容集合

Astro 原生支持 Markdown、MDX 和 JSON，内容管理变得非常自然。

## 开发者体验

- 基于文件的路由（简单且可预测）
- 组件框架无关（可以使用 React、Vue、Svelte，或者都不使用）
- 构建速度快（基于 Vite 驱动）

## 写在最后

如果你正在搭建博客、文档站点或任何以内容为核心的网站，不妨试试 Astro。它是前端领域的一股清流。
