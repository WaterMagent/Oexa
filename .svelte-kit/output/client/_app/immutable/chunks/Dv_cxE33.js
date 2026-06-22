var e=`---
title: 关于我
date: 2026-06-21
type: page
slug: about
---

# Hi, I'm Baumkuchen

## 技术栈
- SvelteKit + TypeScript
- MDUI 组件库
- 剩下的请自行查看源码

## 联系我
- GitHub: [KagurazakaShion](https://github.com/WaterMagent)
- Email: <3846359425@qq.com>
`,t=`---
title: 测试文章3
date: 2026-06-22
category: 笔记
---

## 这是第三篇测试文章

### 特性列表

- SvelteKit 文件路由
- MDUI 暗色主题
- Markdown 博客内容

### 引用

> 路漫漫其修远兮，吾将上下而求索。
`,n=`---
title: 测试文章4
date: 2026-06-22
category: 技术
---

## 系统信息组件

以下是一些 MDUI 组件的示例代码：

\`\`\`html
<mdui-chip variant="flat" icon="computer">Linux</mdui-chip>
<mdui-chip variant="flat" icon="language">zh-CN</mdui-chip>
<mdui-chip variant="flat" icon="tune">1920x1080</mdui-chip>
\`\`\`

## 进度条示例

\`\`\`
<mdui-linear-progress indeterminate></mdui-linear-progress>
\`\`\`
`,r=`---
title: 测试文章
date: 2026-06-20
updated: 2026-06-22
category: 技术
banner: https://picsum.photos/seed/test/800/240
---

# 这是我的第一篇博客

## 为什么选 SvelteKit？
因为它快

## 为什么选 MDUI？
因为好看
`,i=`---
title: 测试文章2
date: 2026-06-21
category: 随笔
banner: https://cdn.luogu.com.cn/upload/image_hosting/ffn1aqvo.png
---

![image](https://cdn.luogu.com.cn/upload/image_hosting/kqf11z2g.png)
[![image](https://cdn.luogu.com.cn/upload/image_hosting/ffn1aqvo.png)](https://www.luogu.com.cn)

## 代码示例

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`
`;function a(e){let t={},n=e,r=e.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);if(r){let i=r[1];n=e.slice(r[0].length);for(let e of i.split(`
`)){let n=e.indexOf(`:`);if(n!==-1){let r=e.slice(0,n).trim(),i=e.slice(n+1).trim();r&&(t[r]=i)}}}return{attrs:t,body:n}}var o=Object.assign({"/src/posts/about.md":e,"/src/posts/ai.md":t,"/src/posts/ai2.md":n,"/src/posts/test.md":r,"/src/posts/test2.md":i});function s(){let e=[];for(let[t,n]of Object.entries(o)){if(!n||typeof n!=`string`)continue;let{attrs:r,body:i}=a(n),o=t.split(`/`).pop()?.replace(`.md`,``)||`unknown`,s={title:r.title||o.replace(/-/g,` `),date:r.date||``,updated:r.updated||void 0,category:r.category||void 0,slug:r.slug||o,content:i,type:r.type||`post`,banner:r.banner||void 0};e.push(s)}return e}var c=s(),l=c.filter(e=>e.type===`post`).sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime()),u=c.filter(e=>e.type===`page`);export{u as n,l as t};