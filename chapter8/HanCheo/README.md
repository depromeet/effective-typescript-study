# 8주차

> [아이템 57. 소스맵을 사용하여 타입스크립트 디버깅하기](#아이템-57-소스맵을-사용하여-타입스크립트-디버깅하기)
> [아이템 58. 모던자바스크립트로 작성하기](#아이템-58-모던자바스크립트로-작성하기)
> [아이템 59. 타입스크립트 도입전에 @ts-check와 JSDoc으로 시험해보기](#아이템-59-타입스크립트-도입전에-@ts-check와-jsdoc으로-시험해보기)
> [아이템 60. allowJs로 타입스크립트와 자바스크립트 같이 사용하기](#아이템-60-allowjs로-타입스크립트와-자바스크립트-같이-사용하기)
> [아이템 61. 의존성 관계에 따라 모듈 단위로 전환하기](#아이템-61-의존성-관계에-따라-모듈-단위로-전환하기)
> [아이템 62. 마이그레이션의 완성을 위해 noIplicitAny 설정하기](#아이템-62-마이그레이션의-완성을-위해-noiplicitany-설정하기)


## 아이템 57. 소스맵을 사용하여 타입스크립트 디버깅하기

### 소스맵?

타입스크립트를 실행한다는것은 정확하게 말하면 **타입스크립트가 컴파일한 자바스크립트**를 실행한다는 것이다. 그렇지만 마치 타입스크립트가 실행되는 것처럼 느껴질수 있게 한다면 가장 이상적일 것이다. 하지만 디버깅을 할때에는 실제 런타임 환경이므로 **전처리기, 컴파일러, 압축기를 거친 자바스크립트**을 확인하게 된다. 이러한 자바스크립트 코드는 복잡하여 디버깅 하기 매우 어렵고 이 문제를 해결하기 위해 **브라우저 제조사**는 `소스맵`이라는 해결책을 내놓았다.

소스맵은 원본 코드의 원래 위치와 심벌들로 매핑한다. 대부분의 브라우저와 IDE는 소스맵을 지원한다.

### 소스맵 사용하기

```tsx
//tsconfig.json
{
  //...
  "compilerOptions": {
    "sourceMap": true
  }
}
```

위와 같이 소스맵 설정을 추가해주면 브라우저 `개발자도구 -> Sources` 탭에서 `ts file`을 확인할 수 있다.

> 디버거 좌측의 파일 목록에서 기울임(이탤릭) 글꼴로 파일이 나타나는 것을 확인 할 수 있는데 기울임체로된 파일은 실제 웹브라우저에 포함된 파일이 아니라는 것을 말한다. 실제로는 소스맵을 통해 타입스크립트처럼 보이는 것뿐이다.

### 소스맵에 대해 알아야할 사항

1. 타입스크립트와 함께 번들러, 압축기를 사용하고있다면 번들러나 압축기가 각자의 소스맵을 생성하게 된다. 이상적인 디버깅환경이 되려면 생성된 자바스크립트가 아닌 원본 타입스크립트 소스로 매핑되도록 해야한다. 번들러가 기본적으로 타입스크립트를 지원한다면 별도 설정없이 잘 동작해야하지만 그렇지 않다면 번들러가 소스맵을 인식할 수 있도록 추가적인 설정이 필요하다.
   (예를들어 타입스크립트, 웹팩을 모두 사용한다면 별도로 추가적인 설정이 필요하다)
   [참고영상- Webpack & TypeScript Setup #6 - Source Maps](https://www.youtube.com/watch?v=Gb9_yBWql24)

2. 실제 운영환경에서 소스맵이 유출되고 있는지 확인해야한다. 물론 **디버거를 열지않는 이상 소스맵이 로드되지 않으므로** 실제 사용자에게 성는 저하는 발생하지 않지만 소스맵은 **원본 코드의 인라인 복사본이 포함**되어있으므로 공개되서는 안 될 내용이 들어있을 수 있다.

NodeJS의 프로그램에의 디버깅에도 소스맵을 사용할 수 있다. IDE 자체인식이나 NodeJS 프로세스를 브라우저 디버거와 연결하면 된다. NodeJS 문서 참조.

> - 변환된 자바스크립트 코드를 디버깅하지말자. 소스맵을 사용해서 런타임환경 코드를 디버깅하자
> - 소스맵이 최종적으로 변환된 코드에 완전히 매칭되었는지 확인하자
> - 소스맵에 원본 코드가 그대로 포함되도록 설정되어 있을 수도 있다. 공개되지 않도록 설정을 확인하자

# 8장. 타입스크립트로 마이그레이션하기

기존의 자바스크립트프로젝트에서 타입스크립트로 점진적으로 마이그레이션 하기위해서 만들어진 장이다. 당신의 프로젝트가 자바스크립트로 되어있고 타입스크립트로 마이그레이션 하기로 결정했다면 꼭 읽어보았으면 한다.

## 아이템 58. 모던자바스크립트로 작성하기

> 모던 자바스크립트의 기준은 ES2015(ES6) 이후 버전들을 의미하고 있다.

타입스크립트는 타입 체크기능 외에, 타입스크립트 코드를 특정 버전의 자바스크립트로 컴파일하는 기능도 가지고 있다. 심지어 1999년에 나온 ES3 버전의 자바스크립트 코드로 컴파일할 수도 있다. 즉, **타입스크립트 컴파일러를 자바스크립트 트랜스파일러로도 사용할 수 있다.**

옛날 버전의 자바스크립트 코드를 타입스크립트 컴퍼일러에서 동작하게 만들면 이후로는 최신 버전의 자바스크립트 기능을 코드에 추가해도 문제가 없다. 따라서 옛날 버전의 자바스크립트 코드를 최신 버전의 자바스크립트로 바꾸는 작업은 타입스크립크립트로 전환하는 작업의 일부로 볼 수 있다.

마이그레이션을 어디서부터 할지 감이 안잡힌다면 자바스크립트 코드를 최신 버전으로 바꾸는 작업부터 시작해보자

### ECMAScript 모듈 사용하기

ES2015 이전에는 코드를 개별 모듈로 분할하는 표준 방법이 없지만 지금은 방법이 많아졌다.

1.  `<script>` 태그를 사용하기
2.  직접 갖다 붙이기(manual concatenation)
3.  Makefile 기법,
4.  NodeJS의 require 구문,
5.  AMD 스타일의 define 콜백
6.  타입스크립트 자체 모듈 시스템 (아이템 53)

ES2015 부터는 `import`와 `export`로 ECMAScript 모듈이 표준이 되었다.

> 만일 자바스카립트 코드가 단일 파일이거나 비표준 모듈 시스템을 사용 중이라면 ES 모듈로 전환하는 것이 좋다.

### 프로토타입 대신 클래스 사용하기

과거에는 자바스크립트에서 프로토타입 기반의 객체 모델을 사용했다. 그러나 많은 개발자들이 클래스 기반 모델을 선호했기 때문에 결국 ES2015에 class키워드를 사용하는 클래스 기반 모델이 도입되었다.

```typescript
//Prototype
function Person(first, last) {
  this.first = first;
  this.last = last;
}

Person.prototype.getName = function () {
  return `${this.first} ${this.last}`;
};

const marie = new Person('Marie', 'Curie');
const personName = marie.getName();

//Class
class Person {
  first: string;
  last: string;

  constructor(first: string, last: string) {
    this.first = first;
    this.last = last;
  }

  getName() {
    return `${this.first} ${this.last}`;
  }
}

const marie = new Person('Marie', 'Curie');
const personName = marie.getName();
```

프로토 타입으로 구현한 Person객체보다 클래스로 구현한 Person 객체가 문법이 간결하고 직관이다. 클래스 문법이 익숙하지 않더라도 IDE에서 타입스크립트 서비스인 함수명에 마우스를 올려 함수를 클래스 형태로 변환(Convert function to an ES2015 class) 할 수 있다.

**참고** 그렇다면 왜 자바스크립트는 프로토타입 기반인지 생각해보아야한다. 많은 개발자들이 클래스기반을 선호하는데 자바스크립트는 왜 프로토타입기반을 채택해왔고 이 것을 계속해서 이어져 왔는지 알아야할 필요가 있다. 이는 다음 참고문헌을 보면 도움이 될 것이다.

[자바스크립트는 왜 프로토타입을 채택했을까?](https://medium.com/@limsungmook/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EB%8A%94-%EC%99%9C-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85%EC%9D%84-%EC%84%A0%ED%83%9D%ED%96%88%EC%9D%84%EA%B9%8C-997f985adb42)

> 나는 개인적으로 클래스를 별로 선호하는 편은아니다. 다만 클래스를 사용할 상황과 함수를 사용할 상황을 명확하게 구분짓고 적절하게 사용한다면 모두 사용해도 좋다고 생각한다.
>
> 정확하게 구분지어 사용하는 예시를 들기에는 조금 어려운데
> 만일 당신이 애매하게 클래스와 함수를 동시에 사용하고 있다면 그럴바에 하나로 통일해서 사용하는 것이 프로젝트 관리 측면에서 좋다.

### var대신 let/const 사용하기

자바스크립트 var 키워드의 스코프 규칙에 문제가 있다는 것은 널리 알려진 사실이다. (모른다면 자바스크립트 호이스팅에 대해서 찾아보도록 하자.) 스코프 문제를 자세히 알지 못하더라도 var 대신 let과 const를 사용하면 스코프 문제를 피할 수 있다. let과 const는 제대로된 블록 스코프 규칙을 가지고 있다.

### for(;;) 대신 for-of 또는 배열 메서드 사용하기

과거에서는 배열을 순회할때 C스타일의 for루프를 사용했지만 모던 자바스크립트에서는 `for-of`루프, `array.forEach` 가 있고 이들은 별도의 인덱스 변수를 선언하여 사용하지 않기 때문에 ` ex) for(let i = 0;...) 형태`

### 함수 표현식보다 화살표 함수 사용하기

This 키워드는 일반적인 변수들과는 다른 스코프 규칙을 가지기 때문에, 자바스크립트에서 가장 어려운 개념 중 하나이다. 일반적으로 this가 클래스 인스턴스를 참고하는 것을 기대하지만 다음 예제처럼 예상치 못한 결과가 나오는 경우도 있다.

```typescript
class Foo {
  method() {
    console.log(this);
    [1, 2].forEach(function (i) {
      console.log(this);
    });
  }
}

const f = new Foo();
f.method();
// strict 모드에서 Foo, undefind, undefined를 출력한다
// non-strict 모드에서 Foo, window, window 를 출력한다.

class Foo {
  method() {
    console.log(this);
    [1, 2].forEach((i) => {
      console.log(this);
    });
  }
}

// strict, non-strict 모두 Foo, Foo, Foo를 출력한다.
```

인라인에서는 일반 함수보다 화살표가 더 직관적이고 코드도 간결해지기 때문에 가급적 화살표 함수를 사용하는 것이 좋다. `tsconfig.json`설정에 `noImplicitThis or strice`를 설정하면, 타입스크립트가 `this` 바인딩 관련된 오류를 표시해주므로 설정하는 것이 좋다.(아이템 49 참조)

### 단축 객체 표현과 구조 분해 할당 사용하기

단축 객체 표현

```javascript
const x = 1,
  y = 2,
  y = 3;
const pt = {
  x: x,
  y: y,
  z: z,
};
// 단축객체 표현
const pt = { x, y, z }[
  //화살표 함수 내에서 객체 반환 하기 -> ()로 객체를 감싸준다.
  ('A', 'B', 'C')
].map((char, idx) => ({ char, idx }));
```

객체 구조분해

```javascript
// 기존 객체 할당
const props = obj.props;
const a = props.a;
const b = props.b;

// 구조 분해 할당
const { props } = obj;
const { a, b } = props;

//극단적 할당 여기서 props 는 변수 선언에 해당되지 않는다.
const {
  props: { a, b },
} = obj;
//또는 이렇게도 할 수 있다.
const { a, b } = obj.props;

//구조분해 기본값 설정하기
let { a } = obj.props;
if (a === undefined) a = 'default';
//or
const { a = 'default' } = obj.props;
```

배열 구조분해

```javascript
// React.useState를 사용해봤으면 이해하기 쉽다.
const point = [1, 2, 3];
const [x, y, z] = point;
const [, a, b] = point; // 첫번째 요소 무시

const points = [
  [1, 2, 3],
  [4, 5, 6],
];
points.forEach(([x, y, z]) => console.log(x + y + z)); // 6, 15 출력
```

### 저수준 프로미스나 콜백 대신 async/await 사용하기

아이템 25에서 콜백과 프로미스보다 async와 await가 권장되는 이유가 나타나있다. 즉 async와 await를 사용하면 코드가 간결해져서 버그나 실수를 방지할 수 있고, 비동기 코드에 타입 정보가 전달되어 타입추론을 가능하다는 것이다.

```typescript
//일반 콜백
function getJson(url: string) {
  return fetch(url).then((response) => response.json());
}
function getJSONCallback(url: string, cb: (result: unknown) => void) {
  /*....*/
}

//async await
async function getJSON(url: string) {
  const response = await fetch(url);
  return response.json();
}
```

훨씬 깔끔하고 직관적으로 변했다.

### 연관 배열에 객체 대신 Map과 Set 사용하기

꽤 중요한 내용이다. 예약어를 알고있다면 이해하기 쉽다. 문자열 내의 단어의 개수를 세는 함수를 예를 들어본다면 다음과같다.

```typescript
function countWords(text: string) {
  const counts: { [word: string]: number } = {};
  for (const word of text.split(/[\s,.]+/)) {
    counts[word] = 1 + (counts[word] || 0);
  }
  return counts;
}

console.log(countWords('Objects have a constructor'));
/*
{
  Objects: 1,
  have: 1,
  a: 1,
  constructor: "1function Object() { [native code] }"
}
*/
```

`constructor`의 초기값은 `undefined`가 아니라 Object.prototype에 있는 생성자 함수이다. 원치 않는 값일 분만 아니라, 타입도 number가 아닌 string이다. 이런 문제를 방지하려면 `Map`을 사용하는 것이 좋다.

```typescript
function countWrodsMap(text: string) {
  const counts = new Map<string, number>();
  for (const word of text.split(/[\s,.]+/)) {
    counts.set(word, 1 + (counts.get(word) || 0));
  }
  return counts;
}
console.log(countWords('Objects have a constructor'));

//Map(4) {'Objects' => 1, 'have' => 1, 'a' => 1, 'constructor' => 1}
```

### 타입스크립트에 use strict 넣지 않기

ES5에서는 버그가 될 수 있는 코드 패턴에 오류를 표시해주는 `엄격모드 (strict mode)`가 도입되었다. 다음 예제처럼 코드의 제일 처음에 'use strict'를 넣으면 엄격모드가 활성화 된다.

```javascript
'use strict';
function foo() {
  x = 10; // strict 모드에서는 오류, non-strict 모드에서는 전역선언
}
```

그렇지만 타입스크립트에서 수행되는 `안전성 검사(sanity check)`가 엄격 모드보다 훨씬 더 엄격한 체크를 하기 때문에 타입스크렙트에서는 'use strict'는 무의미하다.

실제로는 타입스크립트 컴파일러가 생성하는 자바스크립트 코드에서 'use strict'가 추가된다. `alwaysStrict` 또는 `strict` 컴파일러 옵션을 설정하면, 타입스크립트는 업격모드로 코드를 파싱하고 생성되는 자바스크립트에 'use stict'를 추가한다.

즉 타입스크립트 코드에 'use strict'를 쓰지 않고, 대신 `alwaysStrict` 설정을 사용해야 한다.

> 해당 기능 외에도 자바스크립트 표준화 4단계 중 3단계 이사으이 기능들은 타입스크립트 내에 구현하고있다. 그러므로 표준화 완성 여부에 상관없이 자바스크립트 표준화 3단계 이상의 기능들은 타입스크립트 내에서 사용할 수 있다. [TC39의 깃헙 저장소](https://github.com/tc39/proposals)에서 표준화 관련 최신 정보를 확인 할 수 있다.

> - 타입스크립트 개발 환경은 모던 자바스크립트도 실행 할 수 있으므로 모던 자바스크립트의 최신 기능들을 적극적으로 사용하길 바란다. 코드 품질, 타입추론도 더 나아진다.
> - 타입스크립트 개발 환경에서는 컴파일러와 언어 서비스를 통해 클래스, 구조 분해, async/await 같은 기능을 쉽게 배울 수 있다.
> - 'use strict'는 타입스크립트 컴파일러 수준에서 사용되므로 코드에서 제가해야한다.
> - TC39의 깃험 저장소와 타입스크립트 릴리즈 노트를 통해 최신 기능을 확인하자.

## 아이템 59. 타입스크립트 도입전에 @ts-check와 JSDoc으로 시험해보기

본격적으로 타입스크립트 전환하기에 앞서, @ts-check 지시자를 사용하면 타입스크립트 전환시에 어떤 문제가 발생하는지 미리 시험해 볼 수 있다.

```javascript
// @ts-check
const person = { first: 'Grace', last: 'Hopper' };
2 * person.first; //error

/*
const person: {
    first: string;
    last: string;
}
The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
*/
```

### 선언되지 않은 전역번수

```javascript
// @ts-check
console.log(user.firstName);
// Cannot find name 'user'.
```

```typescript
// type.d.ts 파일에 user 타입을 생성
interface UserData {
  firstName: string;
  lastName: string;
}
declare let user: UserData;

// @ts-check
/// <reference path="./types.d.ts" />
console.log(user.firstName); // pass
```

### 알 수 없는 라이브러리

서드 파티라이브러리를 사용하는경우 해당 라이브러리의 타입 정보를 사용해야한다.

```typescript
// @ts-check
$('#graph').style({ width: '100px', height: '100px' });
// Cannot find name '$'.
```

```bash
$ npm install --save-dev @types/jquery
```

```typescript
// @ts-check
$('#graph').style({ width: '100px', height: '100px' });
// ~~~ 'JQuery<HTMLElement>' 형식에 'style' 속성이 없습니다.

$('#graph').css({ width: '100px', height: '100px' }); //pass
```

### DOM 문제

`HTMLInputElement`보다 더 상위 개념인 `HTMLElemet`로 반환되었고 여기에는 `value` 속성이 없다. (아이템 55)
DOM의 경우 사용자가 좀더 정확한 정보를 알고 있으므로 확실하게 알고있다면 타입 단언문을 사용해야한다. (아이템 9)

JSDoc 형태로 타입단언을 진행할 수 있고 이처럼 활용할때에는 타입을 중괄호`{}`로 꼭 감싸야 한다.

```typescript
// @ts-check
const ageEl = document.getElementById('age');
ageEl.value = '12';
// ~~~ `HTMLElement` 유형에 'value' 속성이 없습니다

// @ts-check
const ageEl = /** @type {HTMLInputElement} */ document.getElementById('age');
ageEl.value = '12'; //pass
```

### 부정확한 JSDoc

이미 JSDoc을 사용하고 있다면 `@ts-check`를 사용했을 때 많은 오류가 발생할 수 있다. 차근차근 해결해 나가아가자

```javascript
// @ts-check
/**
 * 엘리먼트의 크기(픽셀 단위)를 가져 옵니다.
 * @param {Node} el 해당 엘리먼트
 * @return {{w: number, h: number}} 크기
 */
function getSize(el) {
  const bounds = el.getBoundingClientRect(); //에러
  //Property 'getBoundingClientRect' does not exist on type 'Node'.
  return { width: bounds.width, height: bounds.height }; //에러
  //Type '{ width: any; height: any; }' is not assignable to type '{ w: number; h: number; }'.
  //Object literal may only specify known properties, and 'width' does not exist in type '{ w: number; h: number; }'.
}
```

첫 번째 오류는 DOM 타입 불일치로 발생했다. `getBoundingClientRect`는 `Element`에 정의 되어있기 때문에 `@param {Element}`로 수정해야한다.

두 번째 오류는 리턴타입 불일치로 발생하였다. `@return {{width: number, height: number}}`로 수정하면 된다.

완성은 다음과같다.

```javascript
// @ts-check
/**
 * 엘리먼트의 크기(픽셀 단위)를 가져 옵니다.
 * @param {Element} el 해당 엘리먼트
 * @return {{width: number, height: number}} 크기
 */
function getSize(el) {
  const bounds = el.getBoundingClientRect(); //pass
  return { width: bounds.width, height: bounds.height }; // pass
}
```

### 점진적으로 JSDoc 자동생성하기

```javascript
// @ts-check
function double(val) {
  // val에 커서를 대고 cmd + . || ctrl + . 을 눌러보자.
  // infer parameter types from usage를 클릭
  return 2 * val;
}
```

자동 변환된 코드

```typescript
// @ts-check
/**
 * @param {number} val
 */
function double(val) {
  return 2 * val;
}
```

물론 정확하지 않은 반환할 수 있으므로 너무 신뢰하지 말자

```javascript
// JSDoc이 자동생성된 getSize함수
// @ts-check
/**
 * @param {{ getBoundingClientRect: () => any; }} el
 */
function getSize(el) {
  const bounds = el.getBoundingClientRect();
  return { width: bounds.width, height: bounds.height };
}
```

마이그레이션의 궁극적인 목표는 자바스크립트에 JSDoc 주석이 있는 형태가 아니라 모든 코드가 타입스크립트 기반으로 전환되는 것임을 잊지 말아야한다. 이미 JSDoc이 주석으로 있다면 `@ts-check`만 추가하여 오류를 빠르게 잡아낼 수 있다는 점은 기억해두자

> - 파일 상단에 // @ts-check를 추가하면 자바스크립트에서도 타입 체크를 할 수 있다.
> - 전역 선언과 서드파티 라이브러리 타입선언을 추가하는 방법을 알아두자
> - JSDoc 주석을 잘 활용하면 자바스크립트 상태에서도 타입 단언과 타입 추론을 할 수 있다.
> - JSDoc 주석은 중간 단계이기 때문에 너무 공들일 필요는 없다. 최종목표는 .ts로 된 타입스크립트 코드이다.

## 아이템 60. allowJs로 타입스크립트와 자바스크립트 같이 사용하기

`tsconfig.json`의 `allowJs` 옵션은 타입스크립트와 자바스크립트 파일을 서로 임포트 할 수 있게 해주는 옵션이다. 타입 체크와는 관련이 없지만, 기존 빌드 과정에 타입스크립트 컴파일러를 추가하기 위해서 `allowJs`옵션이 필요하다. 또한 모듈 단위로 타입스크립트로 전환하는 과정에서 테스크를 수행해야 하기 때문에 allowJs 옵션이 필요하다.

### allowJs 통합하기

1. 번들러나 플러그인 방식으로 통합이 가능하다면 쉽게 적용이 가능하다.

   예를 들어, `npm install --save-dev tsify`를 실행하고 browserify를 사용하여 플러그인을 추가한다면 다음과 같다.

   ```bash
   $ browserify index.ts -p [ tsify --allowJs ] > bundle.js
   ```

2. 유닛 테스트 도구에 설정하기

   `jest`를 사용할 때에는 `ts-jest`를 설치하고 jest-config.js에 전달할 타입스크립트 소스를 지정하자

   ```javascript
   module.export = {
     transform: {
       '^.+\\.tsx?$': 'ts-jest',
     },
   };
   ```

3. 프레임워크 없이 직접 구성했다면 outDir 옵션 사용하기

   이를 사용한다면 타입스크립트가 outDir에 지정된 디렉터리에 소스 디렉터리와 비슷한 구조로 자바스크립트 코드를 생성하게 되고, outDir로 지정된 디렉터리를 대상으로 기존 빌드 체인(import)를 실행하면 된다.

> - 점진적 마이그레이션을 위해 자바스크립트와 타입스크립트를 동시에 사용 할 수 있게 `allowJs` 컴파일러 옵션을 사용하자
> - 대규모 마이그레이션 작업을 시작하기 전에, 테스트와 빌드 체인에 타입스크립트를 적용하자

## 아이템 61. 의존성 관계에 따라 모듈 단위로 전환하기

이제부터는 본격적으로 자바스크립트 코드를 타입스크립트로 전환하는 단계이다. 점진적 마이그레이션을 진행할 때에는 모듈 단위로 하나하나 진행하는 것이 가장 이상적이지만 한 모듈이 의존하는 모듈에서 타입 오류가 발생하게 된다. 이러한 의존성과 관련된 오류 없이 작업하려면 다른 모듈을 참조하지 않는 최하단 모듈부터 작업을 시작해서 최상단으로 완성해야한다.

1. 서드파이 라이브러리 `@types`를 추가한다.
2. 외부 API 타입 정보를 추가해준다. API에 대한 사양을 기반으로 타입 정보 생성
3. 시작전에 모듈간의 의존성관계를 시각화해 보자. 아래에서 부터 위로 올라가며 마이그레이션을 하면된다.  
   보통 첫 번째 모듈은 보통 유틸리티 모듈이다. 의존성 관계도를 시각화하여 진행 과정을 추적하는 것이 좋다.
4. 마이그레이션 할 때는 타입 정보만 추가하고 리팩터링을 해서는 안된다. 당장의 목표는 타입스크립트 전환이다.  
   리팩토링해야될 것을 찾으면 목록화 해두자
5. 타입스크립트로 전환하며 발견하게 되는 일반적인 오류들을 놓치지 않아야 한다.  
   타입 정보를 유지하기위해 필요에 따라 JSDoc 주석을 활용해야 할 수도 있다.
6. 타입정보를 생성했다면 테스트 코드를 타입스크립트로 전환하자

## 아이템 62. 마이그레이션의 완성을 위해 noIplicitAny 설정하기

프로젝트 전체를 `.ts` 로 전환했다면 이제 마무리 작업으로 `tsconfig.json`옵션으로 `noIplicitAny` 설정하자. 우선 처음은 로컬에만 설정하고 작업하는 것이 좋다. 원격의 경우 어차피 설정에 변화가 없기 때문에 기존 빌드를 실패하지 않을 것이기 때문이다.

타입 체크의 강도는 팀 내의 모든 사람이 타입스크립트에 익숙해진 다음에 조금씩 높이는 것이 좋다.

> - noImplicitAny 설정을 활성화하여 마이그레이션의 마지막 단계를 진행하자. noIplicitAny 설정이 없다면 타입 선언과 관련된 실제 오류가 드러나지 않는다.
> - noIplicitAny를 전면 적용하기전에 로컬에서부터 타입 오류를 점진적으로 수정하자. 엄격한 타입 체크를 적용하기 전에 팀원들이 타입스크립트에 익숙해질 수 있도록 시간을 주자.
