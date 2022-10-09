---
title: "Svelte가 DOM을 조작하는 과정 알아보기"
description:
date: 2022-01-15
category: svelte
tags: [javascript, svelte]
---

![Svelte](./img/svelte_2.png)

React, Vue와 같은 라이브러리를 통해 Virtual DOM의 개념은 많이 알려져 있습니다. 개발자는 DOM을 직접 조작하지 않고 선언적으로 "상태"라고 부르는 데이터만 관리합니다. DOM을 업데이트하는 것은 React와 같은 라이브러리가 Virtual DOM을 사용해 알아서 합니다.

> Instead of using techniques like virtual DOM diffing, Svelte writes code that surgically updates the DOM when the state of your app changes.

컴포넌트 기반 웹 프레임워크 중 하나인 Svelte의 메인 페이지에서는 위와 같이 소개합니다. Svelte는 상태가 변경될 때 직접 DOM을 수정하는 코드를 작성해줍니다. 그것이 Svelte를 Compiler라고 소개하는 이유입니다. Svelte는 브라우저에서 실행되는 것이 아닌 앱을 빌드할 때 실행됩니다.

이번 글에서는 Svelte를 이용하여 빌드된 자바스크립트 코드를 분석하며, 우리가 작성한 Svelte 컴포넌트가 어떻게 DOM을 수정하는 코드로 컴파일되는지 알아보겠습니다.

## 실습 프로젝트 준비

[Svelte 공식 문서](https://svelte.dev)에 소개하는 Quickstart template를 설치합니다.

```shell
npx degit sveltejs/template hello-svelte
cd hello-svelte
npm install
```

프로젝트가 준비되었다면 `src/App.svelte`파일의 내용을 모두 지우고, 간단한 카운터 기능의 컴포넌트를 작성합니다.

```svelte
<script>
  let count = 0;

  const increase = () => {
    count++;
  };
</script>

<div>
  <h1>Counter</h1>
  <span>count: {count}</span>
  <br />
  <button on:click={increase}>increase</button>
</div>
```

```shell
npm run dev
```

앱을 실행하여 카운터가 잘 동작하는지 확인해봅니다. 잘 동작한다면 빌드된 코드를 minify하는 옵션을 끄고 코드를 빌드해보겠습니다. `rollup.config.js`에서 `plugins` 속성에서 `terser()` 설정을 주석처리 하겠습니다.

```js
// rollup.config.js:71
// If we're building for production (npm run build
// instead of npm run dev), minify
production && terser(); // <-- 주석처리
```

```shell
npm run build
```

빌드 후 `public/build/bundle.js` 파일을 확인해봅니다. 난독화 되지 않은 코드가 보인다면 이제 준비는 끝났습니다.

## Svelte가 DOM을 생성하는 과정

> 이 섹션의 제목은 "Svelte가 컴파일한 코드가 DOM을 생성하는 과정"이 더 적합하겠지만, 너무 길지 않게 했습니다.

이제부터는 단순하게 `bundle.js`파일을 보면서 어떻게 DOM을 업데이트하는 지 코드를 읽어보겠습니다. 코드의 진입점은 `bundle.js` 파일의 마지막에 위치한 `new App()`부분입니다. 우리가 작성한 `App.svelte` 컴포넌트는 `App` 클래스로 변환됩니다.

> `bundle.js:351`과 같은 표시로 파일의 추적을 돕기 위해 라인수를 표시합니다. 설정과 버전에 따라 차이가 있을 수 있습니다. 또한 코드에서 다루지 않을 부분을 중략한다는 의미로 `// ...`로 표시하겠습니다.

```js
// bundle.js:351
class App extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
    // ...
  }
}
```

`App`클래스는 생성자 함수로 초기화할 때, `init`함수를 호출합니다. `init`함수의 파라미터로 넘겨지는 것 중 우리가 집중해서 볼 것은 `this`, `instance`, `create_fragment`입니다. 일단 세 변수를 눈으로 기억하고 `init`함수를 찾아봅시다.

```js
// bundle.js:186
function init(
  component,
  options,
  instance,
  create_fragment /** ... 그 외 인자들 */
) {
  // ...
  const $$ = (component.$$ = {
    fragment: null,
    ctx: null,
    // ...
  });
}
```

`init`함수는 컴포넌트가 생성될 때, 모든 자원을 초기화합니다. 컴포넌트의 state, props, lifecycles 등이 등록됩니다. 여기서 우리가 관심을 가질 부분은 `$$` 객체와 `$$.fragment`, `$$.ctx`입니다. 이 `$$` 객체는 `component.$$`에 저장되고, `component`객체는 우리가 작성한 `App.svelte` 컴포넌트의 인스턴스입니다.

조금 아래에서 `$$.ctx`에 할당되는 `instance`에 대한 구문을 찾을 수 있습니다.

```js
// bundle.js:212
$$.ctx = instance
  ? instance(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
        if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty(component, i);
      }
      return ret;
    })
  : [];
```

`instance`함수는 `init`의 3번째 인자로 전달받았습니다. `instance`함수를 호출할 때 1번째 매개변수로 `component` 객체를, 3번째 매개변수로 `(i, ret, ...rest) => {}`와 같은 콜백함수를 넘겨준다는 것을 눈으로 기억해주세요. 이제 `instance`함수를 찾아봅시다.

`instance`는 `init`의 인자로 선언되었으니 `init`을 호출했던 `App`컴포넌트의 `constructor` 부분에서 넘겨준 매개변수 `instance`를 추적합니다.

```js
// bundle.js:351
class App extends SvelteComponentDev {
  constructor(options) {
    super(options);
    // 3번째 매개변수인 `instance` 변수를 추적
    init(this, options, instance, create_fragment, safe_not_equal, {});
    // ...
  }
}
```

```js
// bundle.js:334
function instance($$self, $$props, $$invalidate) {
  let count = 0;

  const increase = () => {
    $$invalidate(0, count++, count);
  };

  return [count, increase];
}
```

여기서는 `instance`함수의 리턴 값인 `[count, increase]`가 `$$.ctx`에 할당된다는 것을 알 수 있습니다. 또한 카운터의 상태를 변경하는 `increase`가 호출되면 `$$invalidate`함수가 호출됩니다. `$$invalidate`함수가 궁금하지만 조금 후에 알아보겠습니다.

이제 다시 `212`라인의 `init`함수로 돌아와 계속 따라가 보겠습니다. `228`라인의 `$$.fragment`를 찾아 살펴봅시다.

```js
// bundle.js:228
$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
```

`create_fragment`함수는 `init`함수의 인자로 전달 받았습니다. 다시 `App`클래스의 `constructor`에서 넘겨준 `create_fragment`변수를 추적해보겠습니다.

```js
// bundle.js:351
class App extends SvelteComponentDev {
  constructor(options) {
    super(options);
    // 4번째 매개변수인 `create_fragment` 변수를 추적
    init(this, options, instance, create_fragment, safe_not_equal, {});
    // ...
  }
}
```

```js
// bundle.js:275
// `ctx`는 `$$.ctx`를 전달 받으므로 `[count, increase]`의 값이 할당되어 있을 것입니다.
function create_fragment(ctx) {
  // ...
  return {
    c() {
      div = element("div");
      h1 = element("h1");
      h1.textContent = "Counter";
      t1 = space();
      span = element("span");
      t2 = text("count: ");
      t3 = text(/*count*/ ctx[0]);
      t4 = space();
      br = element("br");
      t5 = space();
      button = element("button");
      button.textContent = "increase";
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, h1);
      append(div, t1);
      append(div, span);
      append(span, t2);
      append(span, t3);
      append(div, t4);
      append(div, br);
      append(div, t5);
      append(div, button);

      if (!mounted) {
        dispose = listen(button, "click", /*increase*/ ctx[1]);
        mounted = true;
      }
    },
    // ...
  };
}
```

`create_fragment`함수는 현재 컴포넌트의 상태 컨텍스트인 `$$.ctx`를 인자로 전달받아 객체를 반환합니다. 반환되는 객체에서 `c() {}`메소드와 `m() {}`메소드를 살펴봅시다.

`c() {}`메소드는 컴포넌트에서 작성된 요소를 HTML Element로 생성하는 부분입니다. `t3`변수에 `ctx[0]`인 `count`를 렌더링하는 `text`요소를 생성합니다.

`m() {}`메소드는 생성된 Element를 DOM 트리에 추가하는 부분입니다. 그리고 `317`라인에서 `button`요소의 클릭 이벤트에 `ctx[1]`인 `increase`함수를 리스너로 지정합니다. 브라우저에서 `button`요소를 클릭하면 `increase`함수가 실행되도록 연결한 것입니다.

`create_fragment`의 역할을 어느 정도 이해했으니 호출되었던 `228`라인의 `init`함수로 돌아갑니다. 이후 로직을 따라가면 `$$.fragment.c()`부분과 `mount_component(component, ...)`부분을 만나게 됩니다.

```js
// bundle.js:238
$$.fragment && $$.fragment.c();

// bundle.js:242
mount_component(component /* ... */);

// bundle.js:147
function mount_component(component, target, anchor, customElement) {
  const { fragment /* ... */ } = component.$$;
  fragment && fragment.m(target, anchor);
}
```

`init`함수를 분석해보니 **컴포넌트에서 정의한 요소를 생성**하고 **DOM 트리에 추가**하는 로직이 담겨있는 것을 알 수 있습니다. 또한 컴포넌트의 상태와 동작인 `count`, `increase`를 `$$.ctx`에 담아 관리하는 것을 알 수 있습니다. 여기까지 우리가 작성한 컴포넌트를 어떻게 DOM을 생성하는 코드로 변경했는 지 살펴보았습니다. 이제 이 글에서 핵심인 `count`가 변경될 때, DOM이 업데이트되는 과정을 살펴봅시다.

## Svelte가 DOM을 변경하는 과정

위 내용에서 살펴본 바, 우리는 `button`요소의 클릭 이벤트에 `$$.ctx[1]`인 `increase`를 리스너로 지정했다는 것을 알고 있습니다. 이번 과정은 거기에서부터 시작하겠습니다.

`$$.ctx`에 할당된 객체가 생성되었던 `instance`함수로 갑시다.

```js
// bundle.js:334
function instance($$self, $$props, $$invalidate) {
  let count = 0;

  const increase = () => {
    $$invalidate(0, count++, count);
  };

  return [count, increase];
}
```

`button`을 클릭하면 `increase`함수를 실행하고, 이어서 `$$invalidate`함수를 실행합니다. 카운터 값이 증가한 `count++`값을 전달합니다. `$$invalidate`함수는 인자로 넘어왔기 때문에 `instance`함수의 호출 부분인 `init`함수로 갑니다.

```js
// bundle.js:212
$$.ctx = instance
  ? instance(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
        if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty(component, i);
      }
      return ret;
    })
  : [];
```

이전에 `$$.ctx`를 살펴볼 때 봤던 코드입니다. 이번에 주의 깊게 볼 부분은 `instance`함수의 3번째 파라미터인 콜백함수입니다.

`not_equal($$.ctx[i], ($$.ctx[i] = value))`부분에서 `i`의 값은 `$$invalidate`를 호출할 때 넘겨준 `0`입니다. 따라서 `$$.ctx[i]`는 `count`값을 나타냅니다. 그리고 비교값인 `value`는 `$$invalidate`를 호출할 때 넘겨준 증가된 값인 `count++`입니다. `button`을 클릭할 때, `count`의 값과 `count++`값을 비교하여 이후 로직을 수행합니다.

이후 로직에서 살펴볼 부분은 바로 `make_dirty(component, i)`함수 입니다. 따라가봅시다.

```js
// bundle.js:178
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  // ...
}
```

`make_dirty`함수에서 해당 컴포넌트는 변경된 값이 있으므로 `dirty_components`에 추가하고, `schedule_update()`함수를 호출합니다.

```js
// bundle.js:65
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
```

`schedule_update`함수는 `update_scheduled`를 `true`로 지정하여 업데이트할 컴포넌트가 있다는 것을 표시합니다. 이후 `resolved_promise.then(flush)`에서 `flush`함수를 호출합니다. `flush`함수를 즉시 호출하지 않고 `resolved_promise`의 이행 후에 호출하는 이유는 다른 컴포넌트에서의 변경사항이 있다면 해당 로직들을 동기적으로 수행한 후에 모든 컴포넌트의 상태 변경 작업이 끝나면 한번에 업데이트하기 위한 것으로 보입니다. (_이 방법은 virtual DOM을 사용하는 라이브러리에서도 비슷하게 진행됩니다._)

```js
// bundle.js:94
function flush() {
  // ...
  update(component.$$); // line: 103
  // ...
}
```

`flush`함수에서 `update(component.$$)`함수를 통해 각 컴포넌트가 업데이트되도록 합니다. `update`함수를 따라가봅시다.

```js
// bundle.js:130
function update($$) {
  if ($$.fragment !== null) {
    // ...
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    // ...
  }
}
```

`update`함수에서 `$$.fragment.p($$.ctx, dirty)`를 호출합니다. `$$.fragment`를 생성했던 `create_fragment`함수의 반환 객체에서 `p() {}`메소드를 찾아봅시다.

```js
// bundle.js:289
return {
  // ...
  // bundle.js:321
  p(ctx, [dirty]) {
    if (dirty & /*count*/ 1) set_data(t3, /*count*/ ctx[0]);
  },
  // ...
};
```

`p() {}`메소드의 `set_data(t3, /*count*/ ctx[0])`를 살펴봅시다. `t3`는 컴포넌트에서 `count`가 렌더링되는 HTML Element입니다. `ctx[0]`은 클릭으로 인해 증가된 `count`값 입니다.

```js
// bundle.js:48
function set_data(text, data) {
  data = "" + data;
  if (text.wholeText !== data) text.data = data;
}
```

`set_data`함수에서는 전달받은 `count`를 렌더링하는 HTML Element인 `t3`의 텍스트 값을 직접 변경합니다. 마침내 `클릭` -> `컴포넌트 상태 변경` -> `컴포넌트 업데이트` -> `DOM 요소 직접 변경`의 과정을 끝냈습니다.

## 마치며

이번 글에서는 Svelte가 `count`라는 상태를 반영하기 위해 직접 DOM을 조작하는 과정에 대해 살펴봤습니다. Svelte가 컴파일한 `bundle.js`파일에는 많은 코드가 있었지만, 우리가 컴포넌트에 정의한 상태가 어떤 과정으로 변경되는 지에 집중하여 살펴봤습니다. 화면의 변경에는 상태로 인한 텍스트 변경뿐만 아니라, 컴포넌트의 조건부 렌더링이나, 주입된 Context의 변경, CSS의 변경 등의 다양한 변경 사항이 있기 때문에 해당 기능을 정의하는 컴포넌트를 작성하면 더욱 복잡한 과정이 될 것입니다.

사실 단순히 화면을 그리기 위해 라이브러리가 어떻게 동작하는지 모두 알 필요는 없습니다. 하지만 개발을 하면서 렌더링 관련 문제를 만나거나 다른 라이브러리와의 비교를 할 때, 각각의 기술이 어떻게 동작하는지 알아야 할 시기가 있을 것입니다. 또한 개발자로서 Svelte와 같은 기술이 어떻게 동작하길래 필요한 것인지 궁금하기도 합니다. 이 글을 통해 "No virtual DOM"인 Svelte를 이해하는데에 도움이 되었기를 바랍니다.
