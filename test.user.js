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
      document.writeln(responseText);
    },
  };
  HtmlManager.changeHtml();
  // ui 추가
  GM_registerMenuCommand("ghghghghghg호호호", () => {});
})();
