const hitomiApi = {
  getGgjs: () => fetch("https://ltn.gold-usergeneratedcontent.net/gg.js"),
  getGalleryInfo: (g_id) =>
    fetch(`https://ltn.gold-usergeneratedcontent.net/galleries/${g_id}.js`),
};
export default hitomiApi;
