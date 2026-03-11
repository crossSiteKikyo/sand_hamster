# <img src="https://raw.githubusercontent.com/crossSiteKikyo/sand_hamster/refs/heads/main/public/sand_hamster_logo.jpg" width="50" height="50"/> sand_hamster

## 설치하기

### 1. firefox 웹 브라우저 설치

pc는 브라우저에서, 안드로이드 휴대폰은 플레이스토어에서 firefox를 검색하여 다운로드하고 설치한다.

```
Q. 왜 firefox를 설치해야하는가?
A. sand_hamster의 이미지 로딩은 전적으로 hitomi에 의존합니다.
chrome, microsoft edge, vivaldi, naver whale등의 chromium기반 브라우저들은 테스트 결과 http/1.1로 통신해 이미지 동시 요청이 최대 6개로 제한되어, 굉장히 느립니다. 그러나 firefox는 http/3으로 통신해 제한이 없어 이미지 로딩이 빠릅니다.
```

아이폰은 firefox에서 Tampermonkey를 설치할 수 없기 때문에 safari를 사용합니다. 그러나 테스트 해보지 않았기 때문에 속도를 장담할 수 없습니다.

### 2. 확장프로그램 Tampermonkey 설치

pc는 오른쪽 위 "확장 기능" 클릭후 검색창에 tampermonkey를 검색하거나 [이 링크](https://addons.mozilla.org/ko/firefox/addon/tampermonkey/)를 클릭하여 설치합니다.

안드로이드 휴대폰은 오른쪽 위 점 세개 - 확장 기능 - 확장 기능 관리 - 맨 아래 "확장 기능 더 찾기"를 클릭 후 tampermonkey를 검색하거나 [이 링크](https://addons.mozilla.org/ko/android/addon/tampermonkey/)를 클릭하여 설치합니다.

### 3. sand_hamster 유저스크립트 설치

tampermonkey를 설치 후, [이 링크](https://github.com/crossSiteKikyo/sand_hamster/raw/refs/heads/main/sand_hamster.user.js)를 클릭하면 tampermonkey가 유저스크립트를 설치할 것인지 묻습니다. 설치 버튼을 클릭해 설치합니다.

이 과정을 모두 완료했다면 히토미 접속 때, sand_hamster유저스크립트가 실행됩니다.

## 이용하기

### - 로딩

히토미에 접속하면 1초뒤에 sand_hamster가 로딩됩니다.

```
Q. 히토미를 들어가고싶은데 sand_hamster가 로딩됩니다.
A. tampermonkey를 클릭 후 sand_hamster를 비활성화 하면 됩니다.

Q. 히토미가 들어가지지 않고(연결이 끊긴다거나 다른 페이지로 리다이렉트), sand_hamster도 로딩이 안돼요.
A. 히토미가 정상적으로 로딩이 되었을 때, sand_hamster도 작동합니다. 방법을 써서 로딩이 정상적으로 되게 만듭니다.
```

### - 이용 화면

pc 이용화면

![pc이용화면](https://github.com/user-attachments/assets/4ca42514-96fa-449a-948a-2f4a82752e2f)

android 휴대폰 이용화면

![android이용화면](https://github.com/user-attachments/assets/482c1def-7d90-4d18-aeb0-f04ab23b806d)

### 문의 및 버그 제보 등

[디스코드 링크](https://discord.gg/X7r2ADfAH2)
