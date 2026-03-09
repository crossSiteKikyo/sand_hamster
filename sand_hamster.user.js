// ==UserScript==
// @name         sand_hamster
// @version      0.0.8
// @author       crossSiteKikyo
// @description  히토미 웹 뷰어 sand_hamster
// @icon         https://github.com/crossSiteKikyo/sand_hamster/blob/main/public/sand_hamster_logo.jpg?raw=true
// @grant        GM_registerMenuCommand
// @match        https://hitomi.la
// @match        https://hitomi.la/*
// @updateURL    https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/sand_hamster.user.js
// @downloadURL  https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/sand_hamster.user.js
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

  async function autoLoad() {
    await Sleep(1000);
    HtmlManager.changeHtml();
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
      // index.css 주입
      // const link2 = document.createElement("link");
      // link2.rel = "stylesheet";
      // link2.crossOrigin = "anonymous";
      // link2.href = `${GitHack_base}assets/index.css`;
      // document.head.appendChild(link2);
      // --- CSS 주입 (Blob 방식) ---
      try {
        const cssResponse = await fetch(
          `https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/dist/assets/index.css`,
        );
        const cssCode = await cssResponse.text();

        // CSS 코드를 Blob으로 변환 (타입을 text/css로 지정)
        const cssBlob = new Blob([cssCode], { type: "text/css" });
        const cssBlobUrl = URL.createObjectURL(cssBlob);

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssBlobUrl;
        document.head.appendChild(link);

        console.log("CSS를 Blob을 통해 주입 성공");
      } catch (err) {
        console.error("CSS 주입 실패:", err);
      }
      // // index.js 주입 (type="module" 설정 필수). firefox에서는 cors 정책에 막힌다.
      // const script1 = document.createElement("script");
      // script1.type = "module";
      // script1.crossOrigin = "anonymous";
      // script1.src = `${GitHack_base}assets/index.js`;
      // document.head.appendChild(script1);
      // 3. JS 주입 (Firefox CORS 우회를 위한 Blob 방식)
      try {
        // const jsResponse = await fetch(`${GitHack_base}assets/index.js`);
        const jsResponse = await fetch(
          `https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/dist/assets/index.js`,
        );
        const jsCode = await jsResponse.text();
        // 코드를 Blob으로 변환하여 로컬 URL 생성
        const blob = new Blob([jsCode], { type: "application/javascript" });
        const blobUrl = URL.createObjectURL(blob);

        const script = document.createElement("script");
        script.type = "module";
        script.src = blobUrl; // 외부 URL이 아닌 생성된 로컬 Blob URL 사용
        document.head.appendChild(script);

        console.log("Firefox에서 Blob을 통해 스크립트 주입 성공");
      } catch (err) {
        console.error("스크립트 주입 실패:", err);
        alert("스크립트 주입 실패");
      }
    },
  };
  // 1초뒤 자동으로 로딩
  autoLoad();
  // ui 추가
  GM_registerMenuCommand("모래 햄스터 로딩", HtmlManager.changeHtml);
})();
