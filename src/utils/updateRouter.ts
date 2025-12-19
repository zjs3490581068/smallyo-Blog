type EventHandler = (event: Event) => void;

//  进入页面时触发 (Use astro:after-swap to run only on navigation, matching original logic)
const inRouter = (handler: EventHandler) => {
  document.addEventListener("astro:after-swap", handler);
};
// 离开当前页面时触发
const outRouter = (handler: EventHandler) => {
  document.addEventListener("astro:before-swap", handler);
};

export { inRouter, outRouter };