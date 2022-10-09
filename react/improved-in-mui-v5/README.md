---
title: "MUI v5, 무엇이 바뀌었을까? (feat. why)"
description:
date: 2021-10-22
category: react
tags: [react, frontend, mui]
---

![mui-v5](./img/mui-v5.png)

> 원문: [Introducing MUI Core v5.0](https://mui.com/blog/mui-core-v5/) \
> \
> 이 글은 **원문**의 개선점에 대한 내용의 일부를 리뷰한 글이며, 오역이 있을 수도 있습니다.

[MUIv5](https://mui.com)가 릴리즈([2021.09.16](https://github.com/mui-org/material-ui/releases/tag/v5.0.0)) 되었습니다. MUI는 구글의 디자인 철학인 [Material Design](https://material.io)을 구현한 자바스크립트 라이브러리이고, [리액트 UI 라이브러리](https://www.npmtrends.com/@material-ui/core-vs-antd-vs-react-bootstrap-vs-reactstrap-vs-semantic-ui-react) 중에서 가장 점유율이 높은 패키지입니다. 여전히 활발하게 업데이트가 진행 중인 MUI팀의 고민들을 살펴보면서 그들이 프로덕트 품질 향상과 팀 성장을 이루어가는 경험을 살펴보겠습니다.

## 1. 브랜딩 관점에서 본 MUI

> We hope you are going to enjoy the DX improvement of only having to type 3 letters to type to find us on the internet: mui.com and to import us from npm @mui!

이전에는 **Material-UI**였으나 이제 단 **3글자**로 줄였습니다. 이는 **개발자 경험**(**DX**)의 개선을 위해서라고 하는데, 얼마나 DX에 관심이 많은지 알 수 있는 부분입니다. 이번 업데이트에서 패키지 이름이 변경되는 것은 단순히 다른 이름을 `import`하는 [Breaking Changes](https://stackoverflow.com/questions/21703216/what-is-a-breaking-change-in-software)이면서도 브랜딩 관점에서 네이밍을 명확히 하는 변경입니다.

1. Material-UI 조직을 `MUI`라 칭함.
2. Material-UI MIT 컴포넌트 셋을 `MUI Core`라 칭함.
3. Material-UI X 고급 컴포넌트 셋을 `MUI X`라 칭함. _(유료 플랜)_

**MUI**와 **MUI Core**로 이름을 구분하는 것은 라이브러리 자체와 개발 그룹을 구분하는 것이 의미있다는 것을 말합니다. UI 라이브러리인 MUI의 관심사는 **사용자의 경험**(**UX**)과 그것을 만들어내는 **개발자의 경험**(**DX**)이라는 것을 알 수 있습니다. 이 두가지는 이렇게 바꾸어 표현할 수도 있을 것 같습니다. 하나는 MUI를 사용하는 개발자들의 경험(UX)이고, 또 하나는 MUI를 커스텀하며 생산하는 개발자들의 Contribute 경험(DX)입니다._(직접 라이브러리에 컨트리뷰터로 참여하지 않더라도 각자의 프로젝트에서 커스텀하여 사용하는 것을 말함)_

> 네이밍을 포함한 MUI의 브랜딩 포인트는 [이 포스트](https://mui.com/blog/material-ui-is-now-mui/)에서 자세히 보실 수 있습니다.

## 2. Improved customizability

### 2.1. JSS에서 Emotion으로

MUI는 지난 7년 동안 여러 스타일링 솔루션을 거치며 변경을 반복했습니다. 지난 버전에서 사용된 [JSS](https://cssinjs.org/)를 이용한 스타일링 방식은 React Hooks와 조합해 사용하기 편했고, 재사용과 오버라이딩하기 좋은 방식입니다. 그리고 이번 업데이트에서 [emotion](https://emotion.sh/)을 이용한 스타일링 방식으로 변경되었습니다. 이에 대해 다음 세 가지의 문제를 고려했습니다.

1. 리액트 커뮤니티에서 `styled()`가 가장 인기 있는 CSS-in-JS API로 자리 잡았습니다.

   styled-components, emotion, goober, stitches, linaria에서 이 방식을 사용합니다. MUI는 여러 스타일 라이브러리와 조합하여 사용할 수 있지만, 개발자들은 여전히 `makeStyles` API와 같은 새로운 것을 알아야 할 필요를 느낍니다. _(v4에서는 대부분의 컴포넌트 [예제](https://v4.mui.com/components/buttons/)가 `makeStyles` API로 작성되어 있습니다.)_

2. React와 JSS의 통합은 우리가 목표하는 커스터마이징 DX의 그 다음 단계를 해결하기엔 너무 느립니다. MUI v4에서의 정적 CSS 생성은 빨랐습니다. 심지어 emotion보다 빨랐습니다. 하지만 동적 스타일 생성은 너무 느려서 재구현할 필요가 있었습니다.

3. 많은 개발자가 styled-components로 마이그레이션할 것을 지지했고, 이는 우리가 유지 보수하는 custom React JSS Wrapper(_`makeStyles`_)를 삭제할 수 있게 해주었습니다. 경험상, 커스텀 스타일링 솔루션을 유지 보수하는 데에는 상당한 시간이 소요됩니다.

`makeStyles` API(createUseStyles의 확장)를 사용해본 경험으로는 크게 불편하다고 느끼지도 못했고, 재사용과 확장성이 좋은 방식이었습니다. 하지만 `2`에서 말하는 동적 스타일을 생성하는 부분은 다른 스타일링 API와 비교히면 성능적인 아쉬움이 있었습니다. 그러한 점에서 많은 개발자가 선호하는 `styled()` API를 고려하는 것은 반가운 소식입니다.

또한 MUI를 사용하는 저도 역시 프로젝트에 맞는 커스텀 설정을 구성하여 사용합니다. MUI팀 역시 React JSS를 래핑하는 커스텀 설정을 유지 보수하는 것이 비용과 경험적인 면에서 얼마나 비효율적인지를 말해주고 있습니다.

MUI팀은 여러 옵션을 조사한 후, 위의 이슈를 해결하는 가장 좋은 해결책이라고 생각하는 것을 결정했습니다.

1. 스타일을 추가하는 가장 저수준의 기본적인 요소인 `styled()`를 만들었습니다. 이 API는 이미 잘 알려져 있습니다.

2. 공통 인터페이스와 구체적인 구현을 정의했습니다.

   - `@mui/styled-engine`: emotion으로 구현 (default)
   - `@mui/styled-engine-sc`: styled-components로 구현
   - 다른 스타일 라이브러리를 사용하신다면, 자유롭게 래퍼를 제공하세요.

   개발자는 다른 스타일 엔진 사이에서 변경할 수 있습니다. styled-components를 사용하면 더 이상 emotion과 styled-components를 모두 번들링할 필요가 없습니다. 또한, 각각에 대한 서버 사이드 렌더링 설정을 구성할 필요도 없습니다.

   공통 인터페이스를 정의함으로 인해 MUI 컴포넌트 스타일링에서도 관심사의 분리가 이루어졌습니다. 실제 스타일링 하는 구현부에서는 어떤 엔진을 사용하는지 구현에 대해 직접 의존할 필요가 없고, 스타일 엔진에 대한 추상화가 이루어졌습니다.

3. MUI팀은 emotion에 지난 몇 달 동안 월 $100을 후원했습니다. 이것을 지금은 $1000으로 인상했습니다. emotion 라이브러리가 기술적 수준을 이끌어가면서 한계를 초월하도록 돕는 것이 가장 큰 관심사이기 때문입니다.

emotion으로 변경에 대한 첫 번째 즉각적인 이점은 **성능**입니다. `<Box>` 컴포넌트는 v4와 비교했을 때 v5에서 [5배~10배](https://codesandbox.io/s/zlh5w?file=/src/App.js) 정도 성능이 좋습니다.

### 2.2. `sx` 속성

기존에 있었던 `MUI System`인 `<Box>` 컴포넌트를 통해 해결하려고 했던 문제들이 있습니다.

1. **컨텍스트 스위칭**으로 시간을 낭비합니다. styled API를 사용하면 컴포넌트를 스타링일(선언)하는 부분과 사용하는 부분 사이를 왔다 갔다 해야합니다. 스타일에 대한 코드를 필요한 곳에 바로 작성할 수는 없을까요?

2. **네이밍**(이름짓기)은 어렵습니다. 컴포넌트의 좋은 이름을 짓기 위해 혼자서 분투해본 적이 있을겁니다. 이름을 새로 지을 필요를 제거할 수는 없을까요?

3. UI에 대해 **일관성을 지키기**는 어렵습니다. 팀에서 여러 사람이 함께 개발할 때, 팀 구성원들 간 협의해야할 사항이 있기 때문입니다.

v5에서 새롭게 추가된 `sx` 속성은 기존 `MUI System`을 한 단계 더 발전시켰습니다. 이 속성은 모든 컴포넌트에서 사용할 수 있고, CSS API의 수퍼셋인 일반 CSS 속성, [단축속성](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties), 미디어 쿼리 헬퍼를 사용할 수 있습니다.

```jsx
// add margin: 8px 0px;
// by Box
<Box m={1}>
  <Slider />
</Box>

// by sx prop
<Slider sx={{ my: 1 }} />
```

`<Box>` 컴포넌트는 꽤 훌륭한 솔루션이었습니다. 하지만 여전히 아쉬운 점이 있습니다. 위의 문제들을 해결하긴 해도 그것 때문에 `<Box>` 컴포넌트를 추가해야 하는 경우도 있기 때문입니다. `sx` 속성이 더 편리한 솔루션으로 자리잡을지, 작성해야할 하나의 방식만 늘어나는 것은 아닌지 우려되기도 합니다. 어쨌든 새로운 시도는 늘 환영입니다.

> `sx` prop과 함께 개선된 MUI System에 대한 내용은 [이 포스트](https://mui.com/system/basics/#why-use-the-system)에서 자세히 보실 수 있습니다.

### 2.3. 동적 속성(Dynamic props)

리액트 컴포넌트는 조합으로 사용합니다. 개발자가 코어 컴포넌트를 확장하는 방법은 컴포넌트를 임포트하고, 확장(기능 추가)하고, 래핑한 컴포넌트를 다시 익스포트하는 식으로 작성합니다. `label`과 `input`의 조합으로 이루어져 있는 `<TextField>` 컴포넌트가 대표적인 조합 예시라고 할 수 있습니다. v4까지 이런 방법으로 컴포넌트를 작성했지만 다음과 같은 문제가 있습니다.

1. 새 컴포넌트를 만들 때마다, 이것은 팀에게 추가되는 새로운 임포트 옵션입니다. 제대로 사용하고자 하는 컴포넌트를 임포트 했는지 확인해야 합니다.

2. 새로운 `color="success"` 속성을 Button 컴포넌트에 추가하려면 사소하지 않은 CSS 커스텀이 필요합니다.

3. 보일러플레이트가 추가됩니다.

이러한 문제를 해결하기 위해, v5에서는 컴포넌트의 고유한 동작을 확장하기 위한 기능이 제공됩니다. 이것은 Github에서 많은 투표를 받은 이슈 중 하나입니다([#13875](https://github.com/mui-org/material-ui/issues/13875)). 실제로 이 변경은 MUI Core 컴포넌트를 확장 가능한 플레이스홀더로 만듭니다.

이 기능의 첫번째로, 컴포넌트의 기존 스타일 매핑을 사용할 수 있습니다. 예를 들어, 새로운 `neutral` 색상을 컬러 팔레트에 추가하고, 버튼 컴포넌트는 그에 맞는 파생된 색상들을 계산합니다.

```tsx
import { createTheme, Button } from "@mui/material";

// 1. theme 객체 확장
const theme = createTheme({
  palette: {
    neutral: {
      main: "#d79b4a",
    },
  },
});

// 2. 팔레트에 새로운 색상에 대한 타입 정의
declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"];
  }
  interface PaletteOptions {
    neutral: PaletteOptions["primary"];
  }
}

// 3. Button 컴포넌트에 props로서 추가
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    neutral: true;
  }
}

// 4. 사용 이점
<Button color="neutral" />;
```

두번째로, 컴포넌트의 특정 `prop` 조합에 대한 CSS를 오버라이딩하는 커스텀 variant를 theme 객체에 추가할 수 있습니다. 아래 코드에서는 variants로 `dashed`가 추가되었고, `dashed`와 `color="error"`의 조합에 대한 CSS를 커스텀으로 정의합니다.

```tsx
import { createTheme, Button } from "@mui/material";

// 1. theme 객체 확장
const theme = createTheme({
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: "dashed", color: "error" },
          style: {
            border: "1px dashed red",
            color: "red",
          },
        },
      ],
    },
  },
});

// 2. Button 컴포넌트에 props로서 추가
declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    dashed: true;
  }
}

// 3. 사용 이점
<Button variant="dashed" color="error">
  dashed
</Button>;
```

v4에서도 `theme` 객체를 확장하여 커스텀 색상이나 Mixins 등을 추가할 수 있었습니다. 하지만 MUI Core의 기본 컴포넌트에는 적용할 수 없었습니다(_Button에 새로운 variant를 추가하는 것_). theme 객체에 추가 선언하는 것만으로도 컴포넌트 props로 자동 적용되는 것은 정말 MUI 사용자로서 반가운 업데이트입니다.

### 2.4. Global class names

v4에서 MUI Core 컴포넌트는 글로벌 클래스([Button](https://v4.mui.com/api/button/#css))를 가지고 있습니다. 또 사용자가 생성하는 스타일에도 원하는 규칙에 따라 실제 CSS 클래스를 커스텀할 수 있습니다. v3에서부터 `classes` API를 바르게 사용하는 것에 대한 불만이 있었습니다. 저 역시도 `.MuiButton-root`와 같은 클래스를 직접 접근해서 사용하는 것이 `하드코딩`처럼 느껴져서 지양하는 방식이었습니다.

v5에서는 호스트의 DOM 노드에 항상 글로벌 클래스를 추가하여 이 방법을 확장했습니다. 글로벌 클래스는 복잡한 컴포넌트의 커스텀을 단순하게 할 수 있도록, 자식 컴포넌트의 커스텀을 가능하게 합니다.

예제를 통해 input의 바깥쪽 border 색상을 지정하는 세 가지 방법을 비교해보세요.

```tsx
import TextField from "@mui/material/TextField";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";

// Option 1: 글로벌 클래스(string)
const CustomizedTextField1 = styled(TextField)({
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "red",
  },
});

// Option 2: 글로벌 클래스(constant variables)
const CustomizedTextField2 = styled(TextField)({
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    borderColor: "red",
  },
});

// Option 3: classes 속성 (예전 방식)
const CustomizedTextField3 = styled((props) => (
  <TextField
    {...props}
    variant="outlined"
    InputProps={{ classes: { notchedOutline: "foo" } }}
  />
))({
  "& .foo": {
    borderColor: "red",
  },
}) as typeof TextField;
```

### 2.5. Unstyled components (alpha)

개발자가 MUI를 선택하는 주된 이유는 더 빠르게 UI를 만들 수 있기 때문입니다. 많은 컴포넌트가 이미 충분히 완성되어 있고, 쉽게 커스텀할 수 있게 스타일링 시스템이 적용되어 있습니다. 개발자에게는 MUI에 의존하면서 생기는 **tradeoff**가 있습니다. 그들은 **Material Design 컴포넌트 위에 새로운 스타일을 적용하는 것**이 **새 컴포넌트를 처음부터 만들**거나 **다른 라이브러리를 선택하는 것**보다 빠를 것이라고 판단합니다. 또한 충분한 성능을 발휘하고 자유도를 잃지 않을 것이라고 생각합니다.

이 **tradeoff**는 제한된 작은 팀이나 내부적인 툴을 만드는 큰 팀에서는 효과적입니다. 하지만 대규모의 프로젝트를 진행하는 팀은 자유도도 높고 Material Design이 포함되지 않은, 그렇지만 처음부터 만드는 것보다는 더 나은 옵션이 있어야 합니다.

이 문제에 대하여 Material Design 컴포넌트를 **hooks**와 **Unstyled components**로 분리하는 작업을 시작했습니다. 아직 alpha 단계이지만, 첫 번째 빌딩 블럭을 new unstyled 패키지에서 찾아볼 수 있습니다.

```tsx
const CustomButton = React.forwardRef(function CustomButton(
  props: ButtonUnstyledProps,
  ref: React.ForwardedRef<any>
) {
  const { children } = props;
  const { active, disabled, focusVisible, getRootProps } = useButton({
    ...props,
    ref,
    component: CustomButtonRoot,
  });

  const classes = {
    active,
    disabled,
    focusVisible,
  };

  return (
    <CustomButtonRoot {...getRootProps()} className={clsx(classes)}>
      {children}
    </CustomButtonRoot>
  );
});
```

이러한 문제와 해결 방식을 통해, 이미 오래전부터 사용해오며 코드가 굳어진 컴포넌트의 스타일과 로직을 분리하는 것으로 더 세분화된 **관심사의 분리**([SOC](https://ko.wikipedia.org/wiki/관심사_분리))가 이루어졌습니다. 이 코드 분리 예시는 리액트 개발자로서도 좋은 컴포넌트 작성을 위한 팁이 되는 것 같습니다.

## 3. Improved DX

### 3.1. 더 작아진 데모

대부분의 데모는 처음에 컴포넌트를 유지보수하는 작업에 도움이 되도록 고려하여 추가되었습니다. 이제 그 대신, 우선순위를 반대로 하여 개발자들이 사용하는 것을 우선했습니다. ([Inline previews](https://github.com/mui-org/material-ui/issues/22484))

사실 이것은 복잡한 데모를 더 작게 쪼개는 것을 의미하고, 가능한 많은 "Inline previews" 가지는 것을 목표로 합니다. 이것은 데모를 확장하고 코드의 어떤 부분이 화면에서 내가 관심 있는 부분인지 찾는 오버헤드를 줄여줍니다.

![inline-preview](./img/inline-preview.png)

### 3.2. IntelliSense에서의 Props 명세

![inline-preview](./img/prop-descriptions.png)

모든 Props 명세가 Typescript로 작성되었고, 에디터의 IntelliSense에서 더 많은 컨텍스트를 볼 수 있습니다. 또한 [API pages](https://mui.com/api/autocomplete/#props)를 생성하는 데에도 역시 Typescript Props 명세를 사용했습니다. 그래서 모든 문서는 하나의 원본 소스로 이루어져 있습니다.

### 3.3. Enzyme에서 Testing Library로

**class components**에서 **hooks**로의 마이그레이션([v4 is out](https://medium.com/material-ui/material-ui-v4-is-out-4b7587d1e701))에서 [Enzyme](https://github.com/enzymejs/enzyme/)으로 작성된 많은 테스트가 깨졌습니다. 테스트가 너무 React 내부와 결합되어 있었습니다. 그래서 [Testing Library](https://testing-library.com/)로의 전환을 결정했습니다.

새로운 테스트를 작성할 때, MUI팀의 테스트 코드가 영감이 될 수 있을 것입니다. 마이그레이션을 통해 구현 일부를 다시 생각해보고, 라이브러리와 함께 더 쉽게 테스트할 수 있게 되었습니다.

### 3.4. Typescript migration

MUI Core의 코드 베이스는 아직 완전히 Typescript로 작성되지 않았지만, 먼 길을 왔습니다. v4에서는 모든 데모를 Typescript로 먼저 작성했습니다. v5에서는 Typescript의 적용을 향한 새로운 단계를 만들었습니다.

- Typescript 명세를 이용해 API pages의 원본을 만들었습니다. 이것은 새 릴리즈에 오래된 정의를 포함하는 가능성을 줄여줍니다.
- Typescript로 작성될 첫 번째 컴포넌트를 마이그레이션했습니다.
- 대부분의 새로운 코드를 Typescript로 작성하고 있습니다.

### 3.5. Strict Mode 지원

이번 릴리즈에서 `StrictMode`에 대한 호환성을 지원합니다. 이제 테스트와 문서화를 strict mode에서 실행합니다. 이것은 아주 오래되었고, 자주 요청되었던 문제입니다. 이전 버전에서는 대표적인 예시로, `Tooltip`이나 `Modal`과 같이 내부적으로 `findDomNode`를 사용하는 컴포넌트가 있다면 strict mode에서 에러를 발견할 수 있었습니다.

하지만 레거시 방식을 사용하는 `@mui/styles` 패키지는 아직 strict mode와 동시성 기능이 호환되지 않습니다.

## 마치며

사실 이 포스트를 작성하는 시점에도 v5를 실제로 사용해보지는 않았습니다. 진행하는 프로젝트에서 바로 적용하기에는 Breaking Changes가 너무 많고 마이그레이션도 부담스럽기 때문입니다. 또 emotion을 이용한 스타일링 방식에 아직 익숙지 않아서 약간의 러닝커브가 생겨서 약간의 시간이 필요할 것 같습니다.

실습 없이 v5를 분석한 것이 부족한 정보일지도 모르겠습니다. 하지만 이 포스트를 통하여 v5로의 변경에서 MUI팀이 어떤 가치 경험을 추구하는지 살펴보고, UI 라이브러리와 CSS 스타일링에 대한 이해가 넓어지는 데에 도움이 되었기를 바랍니다. 더 자세하고 올바른 정보를 얻기를 원하신다면 [원문](https://mui.com/blog/mui-core-v5/)을 참고하시기 바랍니다.
