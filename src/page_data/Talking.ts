export default {
  // API 接口请求优先，数据格式保持和 data 一致
  api: '',
  // api 为空则使用 data 静态数据 
  // 注意：图片请用 vh-img-flex 类包裹
  data: [
      {
        date: "2025-10-18 17:41",
        tags: ["日常"],
        content :"今天开始搭建个人博客网站，记录一些生活和学习的点滴，希望能坚持下去！"
      },
      {
        date: "2025-10-18 22:50",
        tags: ["更新"],
        content : '增添了评论功能，大家可以在文章下方留言交流了！<p class="vh-img-flex"><img src="https://zycs-img-2lg.pages.dev/v2/rhddNSq.png"></p>'
      }
  ]
}