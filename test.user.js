// ==UserScript==
// @name         sand_hamster
// @version      0.0.1
// @author       crossSiteKikyo
// @icon         https://github.com/crossSiteKikyo/sand_hamster/blob/main/public/sand_hamster_logo.jpg?raw=true
// @grant        GM_registerMenuCommand
// @match        https://hitomi.la
// @require      https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js
// @require      https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";
  const supabaseUrl = "";
  const supabaseKey = "";
  // const _supabase = supabase.createClient(supabaseUrl, supabaseKey);
  const GithubHack_base =
    "https://raw.githack.com/crossSiteKikyo/sand_hamster/main/dist/";

  function Sleep(ms) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve();
      }, ms);
    });
  }

  const SupabaseManager = {};

  const HtmlManager = {
    changeHtml: async function () {
      const response = await fetch(
        "https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/dist/index.html",
      );
      const responseText = await response.text();
      console.log(responseText);
      document.documentElement.innerHTML = responseText;

      // 2. CSS 주입
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.crossOrigin = "anonymous";
      link.href = `${GithubHack_base}assets/index.css`;
      document.head.appendChild(link);

      // JS 주입 (type="module" 설정 필수)
      const script = document.createElement("script");
      script.type = "module";
      script.crossOrigin = "anonymous";
      script.src = `${GithubHack_base}assets/index.js`;
      document.head.appendChild(script);
    },
  };
  // HtmlManager.changeHtml();
  // ui 추가
  GM_registerMenuCommand("html 변경", HtmlManager.changeHtml);
})();
