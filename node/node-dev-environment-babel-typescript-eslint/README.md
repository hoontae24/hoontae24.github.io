---
title: Node와 Babel + Typesciprt + Eslint 개발 환경 구성하기
description:
date: 2020-02-07
category: node
tags: [node, babel, typescript, eslint]
---

![babel, typescript, eslint](./img/babel_typescript_eslint.png)

애플리케이션을 개발할 때, 애플리케이션 자체에 대한 것이 아닌 개발자가 개발을 편하게 할 수 있도록 돕는 여러 가지 도구들이 있습니다. 개발에 앞서 그러한 개발 도구들로 개발 환경을 구성한 후, 개발을 하게 되는데요. 이 글에서는 Node.js를 기반으로 하고, `Babel` `Typescript` `Eslint`를 이용하여 개발환경을 구성해 보겠습니다.

- Node.js: 자바스크립트 런타임
- Babel: 자바스크립트 컴파일러, 최신 버전의 자바스크립트를 이전 버전으로 변환
- Typescript: Type을 명시한 자바스크립트 슈퍼셋, 컴파일하여 자바스크립트로 변환
- Eslint: 자바스크립트 문법 및 코딩 스타일 검사 툴

_(이 글에서는 babel, typescript, eslint에 대한 소개나 개념은 깊이 다루지 않습니다.)_

추가적으로 저는 VSCode를 이용하고, extensions으로 Eslint와 Prettier를 사용하는데요. 이 부분에 대해서도 함께 다루어 보겠습니다.

[참조] 이 글을 작성하면서 아래의 글에 도움을 받았습니다.

- [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript)
- [바벨과 타입스크립트의 아름다운 결혼 - TOAST UI](https://ui.toast.com/weekly-pick/ko_20181220/)
- [TypeScript ESLint 적용하기 (+ Airbnb) - Be an Overachiever](https://ivvve.github.io/2019/10/09/js/ts/typescript-eslint&airbnb/)

---

### Babel

먼저 프로젝트 폴더에서 `npm init -y` 커맨드를 실행하여 `package.json` 파일이 생성합니다. 이제 Babel과 관련된 패키지를 설치해보겠습니다. 다음 커맨드를 실행해주세요.

```bash
$ npm i -D @babel/core @babel/cli @babel/node @babel/preset-env
```

- @babel/core: babel의 코어에 해당합니다.
- @babel/cli: 터미널에서 babel 관련 커맨드를 실행해줍니다.
- @babel/node: babel로 Node.js 런타임을 실행해줍니다.
- @babel/preset-env: babel의 설정이 조합된 프리셋

설치가 끝나면 루트 디렉토리에 `babel.config.json` 파일을 만들고 다음과 같이 작성합니다.

```json
{
  "presets": ["@babel/preset-env"]
}
```

**babel**을 이용하여 컴파일할 때에는 여러 가지 설정을 해서 컴파일을 할 수 있습니다. 그러한 설정들을 미리 조합해둔 프리셋을 지정해주었습니다.

babel의 동작을 한번 확인해 볼까요? `src`폴더를 만들고 `index.js` 파일을 다음과 같이 작성해주세요.

```js
// src/index.js
// module import 방식
import fs from "fs";

// arrow function 방식
fs.readFile("package.json", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```

그리고 `package.json`의 `scripts`를 다음과 같이 작성합니다.

```json
"scripts": {
  "build": "babel -d dist/ src",
  "dev": "babel-node index.js"
}
```

`build`명령어는 `src`폴더의 파일들을 `babel`로 컴파일하고, `dist`폴더에 저장하는 구문입니다. 이제 babel을 이용해 `index.js`파일을 컴파일 해봅시다.

```bash
$ npm run build
```

프로젝트 폴더에 `dist`폴더가 생겼나요? 그 안에 `index.js`파일을 열어보세요. 기존에 작성된 `index.js` 파일의 `import`문법이나, `arrow function`문법이 다르게 변경된 것을 볼 수 있을 것입니다. `@babel/preset-env`에 미리 조합된 설정들로 컴파일된 것입니다.

---

### Typescript

**typescript는** `.ts`의 확장자의 파일로 작성됩니다. typescript만의 문법으로 작성된 `.ts`파일을 **typescript** 컴파일러로 컴파일을 하면 `.js`파일로 변환됩니다. typescript만으로도 따로 사용할 수 있지만, 이번 프로젝트에서는 **babel**과 함께 사용해 보겠습니다.

먼저 `index.js`파일을 `index.ts`파일로 이름을 변경합니다. 그리고 약간의 typescript 문법을 추가해보겠습니다. 다음과 같이 수정해주세요.

```js
import fs from "fs";

// typescript 문법
let count: number = 0;
fs.readFile("package.json", "utf-8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  count = data.split("\n").length;
  console.log(count + " lines");
});
```

`.ts`파일을 babel이 읽을 수 있도록 `package.json`의 `scripts`를 변경해줍니다.

```json
"scripts": {
  "build": "babel -d dist/ --extensions \".ts\" src",
  "dev": "babel-node index.js"
}
```

typescript 문법을 추가하고 `npm run build`로 babel을 실행하여 컴파일하면 에러가 발생합니다. babel의 설정이 typescript 문법을 읽지 못하기 때문인데요. typescript를 위한 설정을 해주겠습니다. 다음을 실행해서 패키지를 설치합니다.

```bash
$ npm i -D @babel/preset-typescript
```

그리고 `babel.config.json`파일을 수정해주세요.

```json
{
  "presets": ["@babel/preset-env", "@babel/preset-typescript"]
}
```

이제 `npm run build`명령을 실행해 보세요. babel이 typescript 문법을 인식하여 에러로 처리하지 않습니다.

typescript를 컴파일할 때에도 몇가지 옵션을 설정할 수 있습니다. typescript 패키지를 설치하고, `tsconfig.json`파일을 만들어 설정해주겠습니다.

```bash
$ npm i -D npm-run-all typescript
```

```json
{
  "compilerOptions": {
    "target": "ESNEXT",
    "allowJs": true,
    "declaration": true,
    "outDir": "dist",
    "isolatedModules": true,
    "strict": true,
    "noImplicitAny": false,
    "moduleResolution": "node",
    "baseUrl": "src",
    "paths": {},
    "esModuleInterop": true,
    "experimentalDecorators": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

typescript 타입 체크 명령어를 포함하도록 `package.json`의 `scripts`를 다음과 같이 변경해줍니다.

```json
"scripts": {
  "dev": "babel-node index.js",
  "build": "npm-run-all types:check build:js",
  "build:js": "babel -d dist --extensions \".js,.ts\" src",
  "types:check": "tsc --noEmit"
}
```

`tsc --noEmit` 명령어를 실행하면, typescript의 타입체크만 이루어지고, 컴파일은 하지 않습니다. `npm run build`를 실행하여 typescript 타입 체크와 babel의 컴파일을 실행해봅시다.

```bash
$ npm run build
```

혹시 `Cannot find module 'fs'` 에러가 발생 하셨나요? 이 에러는 typescript가 모듈을 찾지 못해 생기는 오류입니다. 다음 패키지를 설치해주세요.

```bash
$ npm i -D @types/node
```

---

### Eslint

**eslint**를 이용해서 코드 문법을 검사하고, 코딩 스타일도 함께 체크해보는 기능을 추가하겠습니다.

먼저 eslint를 설치합니다. 그리고 필요한 몇가지 패키지도 함께 설치하겠습니다.

```bash
$ npm i -D eslint eslint-config-airbnb-base eslint-plugin-import

$ npm i -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

설치가 되었다면 `.eslintrc`파일을 생성해주세요.

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint-config-airbnb-base",
    "plugin:@typescript-eslint/eslint-recommended"
  ]
}
```

그리고 eslint를 실행하는 `scripts`를 `package.json`에 추가합니다.

```json
"scripts": {
  "lint:check": "eslint src/**/*.ts",
  "lint:fix": "eslint --fix src/**/*.ts"
}
```

이제 `lint:check`를 실행하면, eslint가 `.eslintrc`의 설정으로 문법 및 코딩 스타일을 체크해줍니다. `lint:fix`를 실행하면 코드를 자동으로 고쳐줍니다.

---

#### Eslint - Prettier 함께 사용하기

저는 VSCode에서 Prettier와 Eslint를 함께 사용하는데요, Prettier의 설정과 Eslint의 설정이 충돌을 일으키기 때문에 따로 설정을 해 주어야 합니다. 그렇지 않으면 같은 내용의 설정을 eslint와 prettier에서 각각 두번 해주어야 하는 불편함이 생기기 때문입니다.

eslint의 관련 패키지를 설치해줍니다.

```bash
$ npm i -D eslint-config-prettier eslint-plugin-prettier prettier
```

그리고 `.eslintrc`파일의 `extends` 부분에 다음을 추가해줍니다.

```json
"extends": [
  "plugin:prettier/recommended"
]
```

위 설정에는 두 가지가 적용되는데요. 첫번째로 `eslint-config-prettier`는 eslint와 prettier의 충돌되는 규칙들을 eslint가 무시해줍니다. prettier로 설정될 부분들은 eslint에서 담당하지 않겠다는 뜻입니다.

두번째로 `eslint-plugin-prettier`는 prettier에서 설정한 규칙들을 eslint의 에러로 표시한다는 뜻입니다. 충돌되는 규칙들을 eslint가 무시해준다면 해당 규칙들에 대해 에러를 표시할 수 있도록 prettier의 규칙들을 에러로 표시한다는 것입니다.

`.prettierrc` 파일을 만들어 prettier에 적용할 규칙을 작성해주세요.

```json
{
  "singleQuote": true
}
```

이렇게 하면 `.prettierrc`에 적용된 규칙은 eslint가 간섭하지 않습니다. 또한 그 규칙들에 대한 오류를 eslint가 'prettier'라는 이름의 규칙으로 표시해줍니다.

---

### 마무리

babel과 typescript를 적용한 컴파일 설정과 eslint를 통해 코드를 검사하고 수정하는 부분을 구성해 보았습니다. 가장 기본적인 설정 방법을 함께 적용해보았는데요, 사용자에 맞게 더 많은 기능을 추가할 수도 있습니다.

기회가 된다면 세부적인 기능들에 대한 리뷰와 적용기도 한 번 작성해보도록 하겠습니다.
