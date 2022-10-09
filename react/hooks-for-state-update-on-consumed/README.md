---
title: "소비되는 상태의 변경에 대해서만 컴포넌트를 업데이트 하는 Hook"
description:
date: 2022-01-21
category: react
tags: [react, hooks]
---

![React](./img/React.jpeg)

useState를 이용한 상태 관리 코드는 직관적이고, 재사용 가능하며, 관리하기 쉽습니다. 특정 기능별로 커스텀훅을 작성하면 일반적인 함수를 작성하는 것처럼 코드를 목적에 따라 분리할 수 있습니다. 하지만 하나의 커스텀훅을 사용하는 모든 컴포넌트가 같은 목적을 가진 것은 아닙니다. 만약 어떤 기능을 위해 커스텀훅을 호출했지만, 그중 필요하지 않은 상태를 컴포넌트가 추적한다면 이는 비효율적입니다.

> 이 글은 [SWR - Dependency Collection](https://swr.vercel.app/docs/advanced/performance#dependency-collection)에서 영감을 받아 작성하였습니다.

## 1. 여러 상태를 가진 커스텀훅

먼저 코드를 보며 문제를 알아보겠습니다. 아래의 커스텀훅은 API로부터 데이터를 가져와 상태로 저장하는 커스텀훅입니다. 데이터를 저장하기 위한 `post`와 비동기 작업이 진행 중임을 나타내는 `loading` 2개의 상태를 제공합니다.

```ts
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface Store<T> {
  loading: boolean;
  data: T | undefined;
}

export const usePost = (postId: number): Store<Post> => {
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Post | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    getPost(postId).then((post) => {
      setPost(post);
      setLoading(false);
    });
  }, [postId]);

  console.log({ loading, data: post });
  return { loading, data: post };
};
```

`usePost` 훅을 사용하는 `App`컴포넌트를 아래와 같이 작성합니다.

```tsx
function App() {
  const { loading, data: post } = usePost(1);

  return (
    <div className="App">
      {!loading && post ? (
        <>
          <h1>{post.title}</h1>
          <p>{post.body}</p>
        </>
      ) : (
        <>loading</>
      )}
    </div>
  );
}
```

컴포넌트가 렌더링될 때, `usePost`가 호출되면서 콘솔에는 다음과 같이 출력될 것입니다.

```js
{loading: false, data: undefined} // 1. 최초 컴포넌트 렌더링
{loading: true, data: undefined} // 2. Mount 후 API 호출 직전 loading의 변경으로 인한 리렌더링
{loading: true, data: {…}} // 3. API 호출 후 post의 변경으로 인한 리렌더링
{loading: false, data: {…}} // 4. API 호출 후 loading의 변경으로 인한 리렌더링
```

`loading`과 `post` 두 개의 각각의 상태가 변경될 때 마다 컴포넌트는 리렌더링됩니다.

> 일반적으로 여러 `useState`의 상태 변경 액션은 배치로 실행되지만, 비동기 로직 이후에는 적용되지 않습니다.([참조](https://stackoverflow.com/questions/53574614/multiple-calls-to-state-updater-from-usestate-in-component-causes-multiple-re-re?rq=1))

## 2. 필요하지 않은 상태에 대한 추적

이번에는 `usePost`를 호출하는 다른 컴포넌트를 작성해보겠습니다. `App2`컴포넌트는 `App`컴포넌트와는 달리 `post` 상태만 사용합니다.

```tsx
function App2() {
  const { data: post } = usePost(1);

  return (
    <div className="App">
      {post && (
        <>
          <h1>{post.title}</h1>
          <p>{post.body}</p>
        </>
      }
    </div>
  );
}
```

`App2`컴포넌트가 렌더링될 때, 콘솔에는 다음과 같이 출력됩니다.

```js
{loading: false, data: undefined}
{loading: true, data: undefined}
{loading: true, data: {…}}
{loading: false, data: {…}}
```

`App2`컴포넌트는 `loading` 상태를 사용하지 않아도, 여전히 커스텀훅 내에서 선언된 모든 상태의 변경을 추적합니다. `usePost`훅을 수정하여 조금 더 효율적으로 만들어 봅시다.

```ts
export const usePost = (postId: number): Store<Post> => {
  const [state, setState] = useState<Store<Post>>({
    loading: false,
    data: undefined,
  });

  useEffect(() => {
    setState((p) => ({ ...p, loading: true }));
    getPost(postId).then((post) => setState({ loading: false, data: post }));
  }, [postId]);

  console.log(state);
  return state;
};
```

`loading`과 `post`를 하나의 상태로 관리하도록 코드를 수정했습니다. 이제 두 상태를 동시에 변경할 때, 한번의 리렌더링만 발생합니다. 콘솔의 출력을 봅시다.

```js
{loading: false, data: undefined} // 1. 최초 컴포넌트 렌더링
{loading: true, data: undefined} // 2. Mount 후 API 호출 직전 loading의 변경으로 인한 리렌더링
{loading: false, data: {…}} // 3. API 호출 후 post와 loading의 변경으로 인한 리렌더링
```

컴포넌트의 리렌더링 횟수는 줄었지만, 여전히 사용하지 않는 상태인 `loading`에 대해 추적하는 것이 못마땅합니다. 이 비효율을 해결하기 위해서는 `post`를 관리하는 로직과 `loading`을 관리하는 로직을 분리하여 각각의 커스텀훅으로 만들어 사용해야 합니다. 하지만 그것 또한 상태의 개수가 늘어나거나 로직이 복잡해지면 각각의 상태를 조합하는 것이 쉽지 않을 것입니다.

## 3. 사용하는 상태만 추적하는 Hook (본론)

SWR을 사용하며 위와 같은 상황에서도 리렌더링이 되지 않는 것을 보고, SWR 코드[[1](https://github.com/vercel/swr/blob/7dfd89081d818cba940b7d6bc786e9cdcba24c8e/src/use-swr.ts#L516), [2](https://github.com/vercel/swr/blob/7dfd89081d818cba940b7d6bc786e9cdcba24c8e/src/utils/state.ts#L12)]를 살펴보다가 아래와 같은 커스텀훅을 발견하였습니다.

```ts
const useStateWithDeps = <Data, Error, S = State<Data, Error>>(
  state: S,
  unmountedRef: MutableRefObject<boolean>
): [MutableRefObject<S>, Record<StateKeys, boolean>, (payload: S) => void] => {
  const rerender = useState<Record<string, unknown>>({})[1];
  const stateRef = useRef(state);

  const stateDependenciesRef = useRef<StateDeps>({
    data: false,
    error: false,
    isValidating: false,
  });

  const setState = useCallback((payload: S) => {
    let shouldRerender = false;

    const currentState = stateRef.current;
    for (const _ in payload) {
      const k = _ as keyof S & StateKeys;

      if (currentState[k] !== payload[k]) {
        currentState[k] = payload[k];

        if (stateDependenciesRef.current[k]) {
          shouldRerender = true;
        }
      }
    }

    if (shouldRerender && !unmountedRef.current) {
      rerender({});
    }
  }, []);

  // Always update the state reference.
  useIsomorphicLayoutEffect(() => {
    stateRef.current = state;
  });

  return [stateRef, stateDependenciesRef.current, setState];
};
```

```ts
export const useSWRHandler = <Data = any, Error = any>(
  _key: Key,
  fetcher: Fetcher<Data> | null,
  config: typeof defaultConfig & SWRConfiguration<Data, Error>
) => {
  const [stateRef, stateDependencies, setState] = useStateWithDeps<Data, Error>(
    {
      data,
      error,
      isValidating,
    },
    unmountedRef
  );

  return {
    get data() {
      stateDependencies.data = true;
      return data;
    },
    get error() {
      stateDependencies.error = true;
      return error;
    },
    get isValidating() {
      stateDependencies.isValidating = true;
      return isValidating;
    },
  } as SWRResponse<Data, Error>;
};
```

실제 코드에서 오늘의 핵심 주제인 컴포넌트 업데이트 관점에서 코드를 살펴봅시다. 먼저 실제 사용자 컴포넌트에서 사용하는 커스텀훅(`useSWRHandler`)은 `data`, `error`, `isValidating`이라는 3개의 상태를 제공합니다.

```ts
const rerender = useState<Record<string, unknown>>({})[1];
```

`renderer`함수는 `useState`를 활용한 상태 업데이트용 함수입니다. 호출부에서 용도를 설명하겠습니다.

```ts
const stateRef = useRef(state);
```

`stateRef`는 실제 상태로 사용할 데이터가 저장되는 객체입니다. `ref`객체를 이용하여 데이터가 변경되더라도 컴포넌트는 업데이트되지 않도록 합니다.

```ts
const stateDependenciesRef = useRef<StateDeps>({
  data: false,
  error: false,
  isValidating: false,
});
```

`stateDependenciesRef`는 각 상태가 사용되었는지를 저장하는 값입니다. 사용하지 않는 상태를 추적할 필요가 없도록 어떤 상태를 사용하는지 이 객체에 저장해둡니다.

```ts
const setState = useCallback((payload: S) => {
  // ...
  if (stateDependenciesRef.current[k]) {
    shouldRerender = true;
  }
  // ...
  if (shouldRerender && !unmountedRef.current) {
    rerender({});
  }
}, []);
```

상태를 업데이트하는 함수인 `setState`입니다. `payload`로 전달되는 값을 상태에 덮어쓰는 로직이 있습니다. 여기서 중요한 부분이 나옵니다. `stateDependenciesRef`에서 각 key에 대한 상태를 사용하는지 체크합니다. 이후 사용하는 상태에 대한 변경이 있을 때만 컴포넌트를 업데이트하도록 `renderer({})`구문을 실행합니다.

```ts
return {
  get data() {
    stateDependencies.data = true;
    return data;
  },
  get error() {
    stateDependencies.error = true;
    return error;
  },
  get isValidating() {
    stateDependencies.isValidating = true;
    return isValidating;
  },
} as SWRResponse<Data, Error>;
```

그리고 훅의 마지막 부분에서 각각의 상태를 [Getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)로 제공합니다. 만약 `data`라는 상태 값을 읽는다면 `stateDependencies.data = true`구문이 실행되어 해당 상태가 사용되고 있는 지 체크해둡니다.

정리하면, 1) 사용하는 상태를 따로 체크해두고 2) 체크된 상태가 변경될 때만 컴포넌트를 업데이트하는 방식으로 이루어져 있습니다. `useSWR`을 사용할 때, 훅의 리턴값을 사용하지 않으면, 데이터가 로드되더라도 컴포넌트가 업데이트되지 않는 것을 볼 수 있습니다.

## 마치며

오늘은 이렇게 SWR 코드를 살펴보다가 흥미로운 부분이 있어 장황하게 글을 작성해봤습니다. 무엇보다도 Getter를 이용하여 **상태의 사용을 체크**하는 것이 인상적이었습니다. 다른 방법으로는 [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)를 이용하면 비슷한 기능을 구현할 수 있을 것 같기도 합니다.

리액트 사용자가 많아진 만큼 다양한 코드 패턴이 생겨납니다. 많은 개발자들과 조직들이 코드를 공개하는 오픈소스 패키지 덕분에 좋은 패턴과 코드에 대한 고민을 엿볼 수 있는 것 같습니다. 참 감사한 일입니다. 혹시 내용에 대한 오류나 오늘 문제에 대한 더 좋은 방법이 있다면 댓글로 알려주시면 감사하겠습니다.
