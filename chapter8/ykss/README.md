## 아이템 57 : 소스맵을 사용하여 타입스크립트 디버깅하기

타입스크립트 코드를 실행한다는 것은, 엄밀히 말해 타입스크립트 컴파일러가 생성한 자바스크립트 코드를 실행하는 것이다. 이러한 것은 디버깅이 필요한 시점에 깨닫게 된다. 디버깅 시점의 변환된 JS 코드는 복잡해서 디버깅이 어렵다. 그렇기 때문에 `소스맵(source)` 이라는 해결책이 나왔다. 소스맵은 변환된 코드의 위치와 심벌을 원본 코드에 매핑한다. 

타입스크립트가 소스맵을 생성하게 하려면 `tsconfig.json`에서 `sourceMap` 옵션을 설정해야 한다. 

```typescript
{
  "compileOptions":{
    "sourceMap" : true
  }
}
```

이렇게 설정 후 컴파일하면 `.ts`파일에 대해서 `.js`와 `.js.map` 두 개의 파일이 생성된다.



### 요약

- 원본 코드가 아닌 변환된 자바스크립트 코드를 디버깅하지 말자. 소스맵을 사용해서 런타임에 타입스크립트 코드를 디버깅하자.
- 소스맵이 최종적으로 변환된 코드에 완전히 매핑되었는지 확인하자.
- 소스맵에 원본 코드가 그대로 포함되도록 설정되어 있을 수 있다. 공개되지 않도록 설정을 확인하자.

# 8장. 타입스크립트로 마이그레이션하기



## 아이템 58 : 모던 자바스크립트로 작성하기

타입스크립트는 타입 체크 기능 외에 타입스크립트 코드를 특정 버전 JS로 컴파일하는 기능이 있다. 그래서 타입스크립트 컴파일러를 트랜스파일러(transpiler)로 활용하는 것도 가능하다. TS로 마이그레이션 할 때, 막막하다면 옛날 버전의 JS를 최신 버전이 JS로 바꾸는 작업부터 시작하면 된다. 타입스크립트를 도입할 때 모던 자바스크립트(ES6)의 기능을 아는 것은 도움이 된다.

#### ECMAScript 모듈 사용하기

ES2015 이전에는 코드를 개별 모듈로 분할하는 방법이 없었지만 `import`와 `export`가 표준이 되었다. 마이그레이션 대상이 비표준 모듈 시스템을 사용 중이라면 전환하는 것이 필수적이다.

#### 프로토타입 대신 클래스 사용하기

과거에는 프로토타입 기반 객체 모델을 사용했지만, ES2015에서는 프로토타입 모델보다는 클래스 기반 모델을 사용한다. 

> 하지만 최근에는 클래스 문법도 많이 사용되지 않고 함수 컴포넌트가 많이 사용되는 추세이다.

#### var 대신 let/const 사용하기

`var` 키워드의 스코프 규칙에 문제가 있기 때문에 `let` 과 `const`를 사용하면 스코프 문제를 피할 수 있다.

#### for(;;)대신 for-of 또는 배열 메서드 사용하기

과거에는 `for`루프를 많이 사용했지만, 모던 JS에는 `for-of` 루프가 존재한다. `for-of`루프는 코드가 짧고 인덱스 변수를 사용하지 않아서 실수를 줄일 수 있다. 인덱스가 필요할 땐, `forEach`를 사용하는 것이 좋다. `for-in`의 경우는 몇가지 문제가 있어서 사용하지 않는 것이 좋다.

#### 함수 표현식보다 화살표 함수 사용하기

`this`키워드는 일반적인 변수들과는 다른 스코프 규칙을 가지기 때문에, JS에서는 가장 어려운 개념 중 하나이다. 이 때 화살표 함수를 사용하면 상위 스코프의 `this`를 유지할 수 있다. 인라인에서는 일반 함수보다 화살표 함수가 더 직관적이고 코드도 간결해지기 때문에 가급적 화살표 함수를 사용하는 것이 좋다. 컴파일러 옵션에 `noImplicitThis`를 설정하면 타입스크립트가 `this` 바인딩 관련된 오류를 표시해주므로 설정하는 것이 좋다. 

#### 단축 객체 표현과 구조 분해 할당 사용하기

변수와 객체 속성의 이름이 같으면 `const pt = {x,y,z}` 와 같이 표현 가능하다. 이런 것을 **단축 객체 표현(compact object literal)**이라고 한다. 이 반대는 **객체 구조 분해(object destructuring)**이다. 

```typescript
declare let obj: {props: {a: string; b: number; }; };
const props = obj.props;
const a = props.a;
const b = props.b;

declare let obj: {props: {a: string; b: number; }; };
const {props} = obj;
const {a, b} = props;
```

구조 분해 문법은 위와 같이 사용하고 기본 값을 지정할 수도 있다.

```typescript
declare let obj: {props: {a: string; b: number; }; };
const {a = 'default'} = obj.props;
```

배열도 동일하게 구조 문해 문법을 사용할 수 있다. 매개변수도 또한 가능하다.

```typescript
declare let obj: {props: {a: string; b: number; }; };
const point = [1, 2, 3];
const [x, y, z] = point;
const [, a, b] = point;  // Ignore the first one

declare let obj: {props: {a: string; b: number; }; };
const points = [
  [1, 2, 3],
  [4, 5, 6],
];
points.forEach(([x, y, z]) => console.log(x + y + z));
// Logs 6, 15
```

#### 함수 매개변수 기본값 사용하기

함수의 모든 매개변수는 선택적(생략 가능)이며, 매개변수를 지정하지 않으면 `undefined`로 간주된다. 모던 JS에서는 매개변수에 기본값을 직접 지정할 수 있다. 매개변수에 기본 값을 지정하면 코드가 간결해지고 `base`가 선택적 매개변수라는 것을 명확히 나타낼 수 있다. 

```typescript
function parseNum(str, base=10) {
  return parseInt(str, base);
}
```

#### 저수준 프로미스나 콜백 대신 async/await 사용하기

async와 await를 사용하면 코드가 간결해져서 실수를 방지할 수 있고, 비동기 코드에 타입 정보가 전달되어 타입 추론이 가능해진다. 

```typescript
function getJSON(url: string) {
  return fetch(url).then(response => response.json());
}
function getJSONCallback(url: string, cb: (result: unknown) => void) {
  // ...
}

async function getJSON(url: string) {
  const response = await fetch(url);
  return response.json();
}
```

#### 연관 배열에 객체 대신 Map과 Set 사용하기

인덱스 시그니처는 편리하지만 몇 가지 문제가 있다. 특정 문자열이 주어질 때, 원치 않는 값과 타입을 받을 수 있기 때문에,  이런 문제를 방지하기 위해 `Map`을 사용하는 것이 좋다.

```typescript
function countWordMap(text:string) {
  const counts = new Map<string,number>()
  for (const word of text.split(/[\s,.]+/)){
    counts.set(word, 1+(counts.get(word) || 0));
  }
  return counts;
}
```

#### 타입스크립트에 `use strict` 넣지 않기

ES5 에서는 버그가 될 수 있는 코드 패턴에 오류를 표시해주는 엄격 모드(strict mode)가 도입되었는데 코드의 제일 처음에 `'use strict'`와 같이 표시하면 활성화 된다. 하지만 TS에서는 훨씬 더 엄격한 체크를 하기 때문에 굳이 쓸 필요가 없다.

### 요약

- TS 개발 환경은 모던 JS도 실행할 수 있으므로 모던 JS의 최신 기능들을 적극적으로 사용해야 한다. 코드 품질 향상과 TS의 타입 추론에도 도움이 된다.
- TS 개발 환경에서 컴파일러와 언어 서비스를 통해 클래스, 구조분해, async/await 같은 기능을 쉽게 배울 수 있다.
- 'use strict'는 타입스크립트 컴파일러 수준에서 사용되어 코드에서 제거해야 한다.
- TC39의 깃험 저장소와 TS의 릴리즈 노트를 통해 최신기능 확인이 가능하다.



## 아이템 59 : 타입스크립트 도입 전에 @ts-check와 JSDoc으로 시험해 보기

`@ts-check` 지시자를 사용하면 타입스크립트 전환시에 어떤 문제가 발생하는지 미리 알 수 있다. 하지만 이 지시자는 매우 느슨한 수준으로 타입 체크를 수행하고, 심지어 `noImplicitAny` 설정을 해제한 것보다 헐거운 체크를 수행한다.

```typescript
// @ts-check
const person = {first: 'Grace', last: 'Hopper'};
2 * person.first
 // ~~~~~~~~~~~~ The right-hand side of an arithmetic operation must be of type
 //              'any', 'number', 'bigint', or an enum type
```

`@ts-check` 지시자를 통해 타입 불일치나 함수의 매개변수 개수 불일치 같은 간단한 오류 외에도 아래와 같은 오류들을 찾아낼 수 있다.

#### 선언되지 않은 전역 변수

변수를 선언할 때 보통은 `let`이나 `const`를 사용하지만 어딘가에 숨어있는 변수(HTML파일내의 <script>태그)가 존재할 수 있다. 이런 경우 별도 타입 선언 파일을 만들어야 한다. 선언 파일을 찾지 못하는 경우엔 트리플 슬래시 참조를 사용해서 명시적인 import가 가능하다.

```typescript
//@ts-check
/// <reference path="./types.d.ts" />
console.log(user.firstName); //정상
```

#### 알 수 없는 라이브러리

서드파티 라이브러리를 사용하는 경우, 해당 타입 정보를 알아야 한다. 해당 서드파티 라이브러리에 해당하는 타입선언을 설치하면 해결된다.

#### DOM 문제

아래와 같은 DOM 엘리먼트 관련 부분은 JSDoc을 사용하여 타입 단언을 대체할 수 있다.

```typescript
// checkJs
// tsConfig: {"strictNullChecks":false,"allowJs":true,"noEmit":true}

// @ts-check
const ageEl = /** @type {HTMLInputElement} */(document.getElementById('age'));
ageEl.value = '12';  // OK
```

#### 부정확한 JSDoc

JSDoc 스타일 주석을 사용중이 었다면, `@ts-check` 지시자를 설정하는 순간 수 많은 오류가 뜨게 된다. 타입스크립트 언어 서비스에서는 타입을 추론해서 JSDoc을 자동으로 생성해준다. 빠른 수정을 통해 타입 정보가 JSDoc 주석으로 생성된다. 

### 요약

- 파일 상단에 // @ts-check를 추가하면 자바스크립트에서도 타입 체크 수행이 가능하다.
- 전역 선언과 서드파티 라이브러리의 타입 선언을 추가하는 방법을 익혀야 한다.
- JSDoc 주석을 잘 활용하면 JS 상태에서도 타입 단언과 타입 추론을 할 수 있다.
- JSDoc 주석은 중간 단계이기 때문에 너무 공들일 필요 없다. 최종 목표는 TS로 구성된 코드이다.



## 아이템 60 : allowJs로 타입스크립트와 자바스크립트 같이 사용하기

대규모 프로젝트의 경우 한꺼번에 전환할 수 없기 때문에 점진적으로 전환해야 한다. 그러려면 TS와 JS 모두 동작할 수 있도록 해야 한다. 그 핵심은 `allowJs` 컴파일러 옵션이다. 이 옵션은 JS 파일과 TS 파일을 서로 임포트할 수 있도록 해준다. `@ts-check` 지시자를 추가하지 않으면 문법 오류 이외에 다른 오류가 발생하지 않도록 설정된다. 

### 요약 

- 점진적 마이그레이션을 위해 자바스크립트와 타입스크립트를 동시에 사용할 수 있게 `allowJs` 컴파일러 옵션을 사용해야 한다.
- 대규모 마이그레이션 작업 시작 전 테스트와 빌드 체인에 타입스크립트를 적용해야 한다.



## 아이템 61 : 의존성 관계에 따라 모듈 단위로 전환하기

### 요약 

- 마이그레이션 첫 단계는 서드파티 모듈과 외부 API 호출에 대해 @types를 추가하는 것이다.
- 의존성 관계도의 아래에서부터 위로 올라가면서 마이그레이션을 하면 된다. 첫 번째 모듈은 보통 유틸리티 모듈이다. 의존성 관계도를 시각화하여 진행 과정을 추적하는 것이 좋다.
- 이상한 설계를 발견해도 리팩토링을 하면 안된다. 마이그레이션 작업은 타입스크립트 전환에 집중해야 하고, 나중 리팩터링을 위해 목록을 만들어 두는게 좋다.
- 타입스크립트로 전환하며 발견하는 일반적인 오류들을 놓치지 않아야 한다. 타입 정보를 유지하기 위해 필요에 따라 JSDoc 주석을 활용해야 한다.



## 아이템 62 : 마이그레이션의 완성을 위해 noImplicitAny 설정하기

`noImplicitAny`가 설정되지 않은 상태에서는 타입 선언에서 비롯되는 실제 오류가 숨어 있기 때문에 마이그레이션 완료된 것이 아니다.

```typescript
// tsConfig: {"noImplicitAny":false,"strictNullChecks":false}

// HIDE
class Chart {
  indices: number[];
// END
getRanges() {
  for (const r of this.indices) {
    const low = r[0];  // Type is any
    const high = r[1];  // Type is any
    // ...
  }
}
// HIDE
}
// END
```

`noImplicitAny` 설정을 하지 않으면 타입 체크는 매우 허술해 진다.

```typescript
// tsConfig: {"noImplicitAny":true,"strictNullChecks":false}

// HIDE
class Chart {
  indices: number[];
// END
getRanges() {
  for (const r of this.indices) {
    const low = r[0];
             // ~~~~ Element implicitly has an 'any' type because
             //      type 'Number' has no index signature
    const high = r[1];
              // ~~~~ Element implicitly has an 'any' type because
              //      type 'Number' has no index signature
    // ...
  }
}
// HIDE
}
// END
```

위와 같이 보다 엄격하게 타입 체크하여 에러를 표시한다. `noImplicitAny`는 로컬에만 설정하고 작업하는 것이 좋다. 원격에서는 설정 변화가 없기 때문에 빌드가 실패하지 않기 때문이다. 최종적으로 가장 강력한 설정은 `"strict": true` 이나 타입 체크의 강도는 팀 내의 모든 사람이 익숙해진 뒤 높히는게 좋다.

### 요약 

- `noImplicitAny` 설정을 활성화하여 마이그레이션의 마지막 단계를 진행해야 한다. 해당 설정이 없다면 타입 선언과 관련된 실제 오류가 드러나지 않는다.
- `noImplicitAny`를 전체 적용하기 전에 로컬에서부터 타입 오류를 점진적으로 수정해야 한다. 엄격한 타입 체크를 적용하기 전에 팀원들이 익숙해지도록 해야 한다.

