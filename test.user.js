// ==UserScript==
// @name         sand_hamster
// @version      0.0.1
// @author       crossSiteKikyo
// @icon         https://github.com/crossSiteKikyo/sand_hamster/blob/main/public/sand_hamster_logo.jpg?raw=true
// @grant        GM_registerMenuCommand
// @match        https://hitomi.la
// @updateURL    https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/test.user.js
// @downloadURL  https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/test.user.js
// @require      https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js
// @require      https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";
  // raw.githubusercontent.com를 사용하면 content-type이 text/plain이 되어 js나 css로 인식 거부한다. 그래서 raw.githack.com을 사용.
  const GitHack_base =
    "https://raw.githack.com/crossSiteKikyo/sand_hamster/main/dist/";

  function Sleep(ms) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve();
      }, ms);
    });
  }

  const HtmlManager = {
    changeHtml: async function () {
      const response = await fetch(
        "https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/dist/index.html",
      );
      const responseText = await response.text();
      console.log(responseText);
      document.documentElement.innerHTML = responseText;
      // DOM이 생성 된 후 동적으로 삽입된 link와 script는 보안 및 실행 순서 문제로 실행되지 않는다.
      // 그러므로 따로 주입
      // CSS 주입
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.crossOrigin = "anonymous";
      link.href = `${GitHack_base}assets/index.css`;
      document.head.appendChild(link);
      // JS 주입 (type="module" 설정 필수)
      const script = document.createElement("script");
      script.type = "module";
      script.crossOrigin = "anonymous";
      script.src = `${GitHack_base}assets/index.js`;
      document.head.appendChild(script);
    },
  };
  // HtmlManager.changeHtml();
  // ui 추가
  GM_registerMenuCommand("sand_hamster 로딩", HtmlManager.changeHtml);
})();
