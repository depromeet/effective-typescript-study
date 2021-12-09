## 아이템 9 : 타입 단언보다는 타입 선언을 사용하기

타입스크립트에서 변수에 값을 할당하고 타입을 부여하는 방법은 아래와 같이 두 가지이다.

```typescript
interface Person { name: string };

const alice: Person = { name: 'Alice' };  // Type is Person
const bob = { name: 'Bob' } as Person;  // Type is Person
```

`as Person`은 타입 단언으로 타입스크립트가 추론한 타입이 있더라도 `Person` 타입으로 간주한다. 하지만 타입 단언보다 타입 선언이 낫다.

```typescript
interface Person { name: string };
const alice: Person = {};
   // ~~~~~ Property 'name' is missing in type '{}'
   //       but required in type 'Person'
const bob = {} as Person;  // No error
```

위 예시와 같이 타입 단언의 경우는 강제로 타입을 지정해서 타입 체커가 오류를 무시하기 때문이다. 이 부분은 속성 추가시에도 동일하다.

```typescript
interface Person { name: string };
const alice: Person = {
  name: 'Alice',
  occupation: 'TypeScript developer'
// ~~~~~~~~~ Object literal may only specify known properties
//           and 'occupation' does not exist in type 'Person'
};
const bob = {
  name: 'Bob',
  occupation: 'JavaScript developer'
} as Person;  // No error
```

위에 타입 선언 방식에서는 잉여 속성에 대한 체크가 동작하지만, 타입 단언에서는 에러가 뜨지 않는다. 타입 선언이 안전성 체크 면에서 바람직하다.

> `const bob = <Person>{}` 도 형태가 다르지만 `as Person`과 같은 타입 단언이다.

반대로 타입 단언이 꼭 필요한 경우가 있다. 그 경우는 타입 체커가 추론한 타입보다 직접 판단하는 타입이 더 정확할 때이다. 

```typescript
// tsConfig: {"strictNullChecks":false}

document.querySelector('#myButton').addEventListener('click', e => {
  e.currentTarget // Type is EventTarget
  const button = e.currentTarget as HTMLButtonElement;
  button // Type is HTMLButtonElement
});
```

타입스크립트는 DOM에 접근할 수 없기 때문에 `#myButton`이 버튼 엘리멘트인지 알 수 없다. 타입스크립트가 알지 못하는 정보를 우리가 가지고 있기 때문에 이러한 경우에 타입 단언문을 쓰는 것이 적합하다.

```typescript
const elNull = document.getElementById('foo');  // Type is HTMLElement | null
const el = document.getElementById('foo')!; // Type is HTMLElement
```

접두사로 쓰이는 `!`은 부정문이지만, 접미사로 쓰이는 `!`은 그 값이 `null`이 아니라는 단언문을 뜻한다.  타입체커는 알지 못하나 그 값이 `null`이라고 확신할 수 있을 때만 사용해야 한다.

타입 단언은 타입간 부분 집합인 경우에만 타입 단언문을 통해 변환이 가능하다. 

```typescript
interface Person { name: string; }
const body = document.body;
const el = body as Person;
        // ~~~~~~~~~~~~~~ Conversion of type 'HTMLElement' to type 'Person'
        //                may be a mistake because neither type sufficiently
        //                overlaps with the other. If this was intentional,
        //                convert the expression to 'unknown' first
```

위 같은 경우 서로 서브 타입이 아니기 때문에 변환 불가하다. 위 같은 상황에서 변환을 해야한다면, `unknown`을 사용하면 되는데 해당 단언문은 항상 동작하지만 `unknown`을 사용한다는 것 자체가 뭔가 위험성을 내포하고 있다고 할 수 있다.

```typescript
interface Person { name: string; }
const el = document.body as unknown as Person;  // OK
```

### 요약

- 타입 단언보다 타입 선언을 사용하자
- 화살표 함수의 반환 타입을 명시하는 방법을 터득하자
- 타입스크립트보다 타입 정보를 더 잘 알고 있다면 타입 단언문과 `null`아님 단언문을 활용하자



## 아이템 10 : 객체 래퍼 타입 피하기

JS에는 객체 이외에 Primitive 타입 일곱가지(string, number, boolean, null, undefined, symbol, bigint)가 있다. 기본형들의 경우 불변(immutable)이고, 메서드를 가지지 않는 점에서 객체와 구분된다. 하지만 `string`의 경우 메서드가 있는 것 처럼 보이지만 사실 JS에서 `string`을 `String` 객체로 자유롭게 변환하여 래핑하고 메서드를 호출한 것이다. `String.prototype`을 몽키패치 해보면 이를 알 수 있다. 

> 몽키 패치는 어떤 기능을 수정해서 사용하는 것이다. JS에서는 주로 프로토타입을 변경하는 것이 이에 해당된다.

객체 래퍼 타입의 자동 변환은 종종 당황스러운 동작을 보일 때가 있다. 예를 들어 어떤 속성을 기본형에 할당하면 그 속성이 사라진다.

```bash
> x = "hello"
> x.language = 'English'
> x.language 
// undefined
```

실제로는 x가 `String`객체로 변환된 뒤에 `language` 속성이 추가되고, 추가된 객체가 버려진 것이다.`string`말고도 다른 기본형에도 객체 래퍼 타입이 존재하기 때문에 기본형 값에 메서드를 사용할 수 있다.(`null`과 `undefined` 제외) `string`은 특히 주의 해야하는데, `string`은 `String`에 할당 가능하지만, `String`은 `string`에 할당 불가능하다.

### 요약

- 기본형 값에 메서드를 제공하기 위해 객체 래퍼 타입이 어떻게 쓰이는지 이해해야 한다. 직접 사용하거나 인스턴스를 생성하는 것은 피해야 한다.
- 타입스크립트의 객체 래퍼 타입은 지양하고, 기본형 타입을 대신 사용해야 한다. `String` 대신 `string`을 사용하는 것과 같이 다른 타입도 기본형 타입을 사용하면 된다.



## 아이템 11 : 잉여 속성 체크의 한계 인지하기

타입스크립트는 타입이 명시된 변수에 객체 리터럴을 할당 할 때 해당 타입의 속성이 있는지, 그리고 그 외의 속성은 없는지 확인 한다.

```typescript
interface Room {
  numDoors: number;
  ceilingHeightFt: number;
}
const r: Room = {
  numDoors: 1,
  ceilingHeightFt: 10,
  elephant: 'present',
// ~~~~~~~~~~~~~~~~~~ Object literal may only specify known properties,
//                    and 'elephant' does not exist in type 'Room'
};
```

구조적 타이핑의 관점에서는 오류가 발생하지 않아야 맞다. 

```typescript
interface Room {
  numDoors: number;
  ceilingHeightFt: number;
}
const obj = {
  numDoors: 1,
  ceilingHeightFt: 10,
  elephant: 'present',
};
const r: Room = obj;  // OK
```

위 방식으로 하면 타입 체커에 문제 없이 통과한다. 위 두 예제의 차이는 첫 번째 예제에서는 잉여 속성 체크라는 과정이 수행되었다. 하지만 잉여 속성 체크라는 것은 두 번째 예제처럼 조건에 따라 동작하지 않을 수도 있다. 잉여 속성 체크가 할당 가능 검사와는 별도의 과정이라는 것을 알아야 한다. 

잉여 속성 체크를 원하지 않으면, 인덱스 시그니처를 사용해서 타입스크립트가 추가적인 속성을 예상하도록 할 수 있다.

```typescript
interface Options {
  darkMode?: boolean;
  [otherOptions: string]: unknown;
}
const o: Options = { darkmode: true };  // OK
```

### 요약

- 객체 리터럴을 변수에 할당하거나 함수에 매개변수로 전달할 때 잉여 속성 체크가 수행된다.
- 잉여 속성 체크는 오류를 찾는 효과적인 방법이지만, 타입스크립트 타입 체커가 수행하는 일반적인 구조적 할당 가능성 체크와 역할이 다르다. 할당의 개념을 정확히 알아야 잉여 속성 체크와 일반적인 구조적 할당 가능성 체크를 구분할 수 있다.
- 잉여 속성 체크에는 한계가 있다. 임시 변수를 도입하면 잉여 속성 체크를 건너 뛸 수 있다.



## 아이템 12 : 함수 표현식에 타입 적용하기

JS에서는 함수 문장과 표현식을 다르게 인식한다.

```typescript
function rollDice1(sides: number): number { /* COMPRESS */ return 0; /* END */ }  // Statement
const rollDice2 = function(sides: number): number { /* COMPRESS */ return 0; /* END */ };  // Expression
const rollDice3 = (sides: number): number => { /* COMPRESS */ return 0; /* END */ };  // Also expression
```

타입스크립트에서는 함수의 매개변수부터 반환값까지 전체를 함수 타입으로 선언하여 함수 표현식에 재사용 할 수 있기 때문에 함수 표현식을 사용하는 것이 좋다.

```typescript
type DiceRollFn = (sides: number) => number;
const rollDice: DiceRollFn = sides => { /* COMPRESS */ return 0; /* END */ };
```

함수 타입의 선언은 불필요한 코드의 반복을 줄이고, 반복되는 함수 시그니처를 하나의 함수 타입으로 통합할 수도 있다.

```typescript
type BinaryFn = (a: number, b: number) => number;
const add: BinaryFn = (a, b) => a + b;
const sub: BinaryFn = (a, b) => a - b;
const mul: BinaryFn = (a, b) => a * b;
const div: BinaryFn = (a, b) => a / b;
```

라이브러리의 경우에는 공통 콜백 함수를 위한 공통 함수 시그니처를 타입으로 제공하는 것이 좋다. 아래 `fetch`의 예시처럼 시그니처가 일치하는 다른 함수가 있을 때도 함수 표현식에 타입을 적용해 볼 만하다. 

```typescript
const checkedFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error('Request failed: ' + response.status);
  }
  return response;
}
```

### 요약

- 매개변수나 반환 값에 타입을 명시하기보다 함수 표현식 전체에 타입 구문을 적용하는 것이 좋다.
- 만약 같은 타입 시그니처를 반복적으로 작성한 코드가 있다면 함수 타입을 분리해 내거나 이미 존재하는 타입을 찾아야 한다. 라이브러리를 직접 만들면 공통 콜백에 타입을 제공해야 한다.
- 다른 함수의 시그니처를 참조하려면 `typeof fn`을 사용하면 된다.



## 아이템 13 : 타입과 인터페이스의 차이점 알기

```typescript
type TState = {
  name: string;
  capital: string;
}
interface IState {
  name: string;
  capital: string;
}
```

TS에서 명명된 타입(named type)을 정의하는 두 가지 방법이 있고 대부분의 경우 둘 다 사용해도 무방하다. 하지만 타입과 인터페이스 사이에 존재하는 차이를 분명히 알고, 같은 상황에서는 동일한 방법으로 명명된 타입을 정의해 일관성을 유지해야 한다. 그러기 위해 하나의 타입에 대해 두 가지 방법으로 모두 정의할 줄 알아야 한다.

먼저 공통점에 대해서 살펴보면, 인덱스 시그니처는 두 방식 모두에서 사용 가능하다.

```typescript
type TDict = { [key: string]: string };
interface IDict {
  [key: string]: string;
}
```

함수 타입도 또한 인터페이스나 타입 모두 정의할 수 있다.

```typescript
type TFn = (x: number) => string;
interface IFn {
  (x: number): string;
}

const toStrT: TFn = x => '' + x;  // OK
const toStrI: IFn = x => '' + x;  // OK
```

타입 별칭과 인터페이스 모두 제너릭이 가능하다.

```typescript
type TPair<T> = {
  first: T;
  second: T;
}
interface IPair<T> {
  first: T;
  second: T;
}
```

인터페이스는 타입을 확장할 수 있고(주의사항이 몇가지 있다), 타입은 인터페이스를 확장할 수 있다. 

```typescript
type TState = {
  name: string;
  capital: string;
}
interface IState {
  name: string;
  capital: string;
}
interface IStateWithPop extends TState {
  population: number;
}
type TStateWithPop = IState & { population: number; };
```

여기서 주의할 것은 인터페이스는 유니온 타입 같은 복잡한 타입을 확장하지는 못한다는 것이다. 복잡한 타입을 확장하고 싶다면 타입과 `&`를 사용해야 한다. 

차이점을 살펴보면, 유니온 타입은 있지만, 유니온 인터페이스라는 개념은 없다. `type AorB = 'a' | 'b';`

인터페이스는 타입을 확장할 수 있지만, 유니온은 할 수 없다. 하지만 유니온 타입을 확장하는게 필요할 때가 있다. 

```typescript
type Input = { /* ... */ };
type Output = { /* ... */ };
interface VariableMap {
  [name: string]: Input | Output;
}
type NamedVariable = (Input | Output) & { name: string };
```

이 타입은 인터페이스로 표현할 수 없다. `type` 키워드는 일반적으로 `interface`보다 쓰임새가 많다. `type` 키워드는 유니온이 될 수 있고, 매핑된 타입 또는 조건부 타입 같은 고급 기능에 활용되기도 한다. 튜플과 배열도 `type`키워드로 더 간결하게 표현 가능하다.

```typescript
type Pair = [number, number];
type StringList = string[];
type NamedNums = [string, ...number[]];
```

인터페이스도 튜플과 비슷하게 구현할 수 있으나, 튜플에서 사용하는 `concat`과 같은 메서드를 사용할 수 없다. 그래서 `type`으로 구현하는 편이 낫다. 

반대로 인터페이스에는 타입에 없는 몇가지 기능이 있다. 그것은 **보강(augment)**이다. 보강의 예시는 아래와 같다.

```typescript
interface IState {
  name: string;
  capital: string;
}
interface IState {
  population: number;
}
const wyoming: IState = {
  name: 'Wyoming',
  capital: 'Cheyenne',
  population: 500_000
};  // OK
```

위와 같은 속성의 확장을 **선언 병합(declaration merging)** 이라고 한다. 병합은 선언과 마찬가지로 일반적인 코드에서 지원되므로 언제 병합이 가능한지 알아야 한다. 타입은 기존 타입에 추가적인 보강이 없는 경우에만 사용해야 한다.

### 정리

- 복잡한 타입이라면 타입 별칭을 사용하자
- 프로젝트의 일관성에 따라 인터페이스와 타입을 사용하면 된다
- API에 대한 타입 선언을 작성해야 하면 인터페이스를 사용하는 편이 API가 변경될 때 사용자가 인터페이스를 통해 새로운 필드를 병합할 수 있어 유용하다.
- 프로젝트 내부로 사용되는 타입에 선언 병합이 발생하는 것은 잘못된 설계이기 때문에 타입을 사용하자.

### 요약

- 타입과 인터페이스의 차이점과 공통점을 이해해야 한다.
- 한 타입을 `type`과 `interface` 모두로 표현할 수 있어야 한다.
- 프로젝트에서 어떤 문법을 사용할지 정할땐 일관된 스타일을 확립하고 보강이 필요한지 여부를 고려해야 한다.



## 아이템 14 : 타입 연산과 제너릭 사용으로 반복 줄이기

 ```typescript
 console.log('Cylinder 1 x 1 ',
   'Surface area:', 6.283185 * 1 * 1 + 6.283185 * 1 * 1,
   'Volume:', 3.14159 * 1 * 1 * 1);
 console.log('Cylinder 1 x 2 ',
   'Surface area:', 6.283185 * 1 * 1 + 6.283185 * 2 * 1,
   'Volume:', 3.14159 * 1 * 2 * 1);
 console.log('Cylinder 2 x 1 ',
   'Surface area:', 6.283185 * 2 * 1 + 6.283185 * 2 * 1,
   'Volume:', 3.14159 * 2 * 2 * 1);
 ```

위 코드에는 반복이 너무 많다. 위 코드에서 함수, 상수, 루프의 반복을 제거해서 코드를 아래와 같이 개선할 수 있다.

```typescript
const surfaceArea = (r,h) => 2 * Math.PI * r * (r+h);
const volume = (r,h) => Math.PI * r * r * h;
for (const [r,h] of [[1,1], [1,2], [1,3]]) {
  console.log(
  `Cylinder ${r} x ${h}`,
  `Surface area: ${surfaceArea(r,h)}`,
  `Volume: ${volume(r,h)}`);
}
```

위 같이 줄인게 같은 코드를 반복하지 말라는 `DRY(don't repeat yourself)` 원칙이다. 하지만 이렇게 반복을 줄이다가 타입을 간과할 수 있다. 타입 중복은 코드 중복만큼이나  많은 문제를 발생시킨다. 그렇기 때문에 타입 간에 매핑하는 방법을 익히면 타입 정의에서도 DRY의 장점을 적용할 수 있다. 반복을 줄이는 가장 간단한 방법은 타입에 이름을 붙히는 것이다.  

```typescript
function distance(a: {x: number, y: number}, b: {x: number, y: number}) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
// 타입에 이름 붙히기
interface Point2D {
  x: number;
  y: number;
}
function distance(a: Point2D, b: Point2D) { /* ... */ }
```

몇몇 함수가 같은 타입 시그니처를 공유하고 있다면, 해당 시그니처를 명명된 타입으로 분리해낼 수 있다.

```typescript
// HIDE
interface Options {}
// END
type HTTPFunction = (url: string, options: Options) => Promise<Response>;
const get: HTTPFunction = (url, options) => { /* COMPRESS */ return Promise.resolve(new Response()); /* END */ };
const post: HTTPFunction = (url, options) => { /* COMPRESS */ return Promise.resolve(new Response()); /* END */ };
```

그리고 인터페이스를 확장해서 쓰면 반복을 많이 제거 할 수 있다.

```typescript
interface Person {
  firstName: string;
  lastName: string;
}

interface PersonWithBirthDate extends Person {
  birth: Date;
}
```

이미 존재하는 타입을 확장하는 경우 인터섹션 연산자(`&`)를 사용할 수도 있다. 이러한 방식은 유니온 타입(확장할 수 없는)에 속성을 추가하려고 할 때, 유용하다.

```typescript
interface Person {
  firstName: string;
  lastName: string;
}
type PersonWithBirthDate = Person & { birth: Date };
```

전체 애플리케이션의 상태를 표현하는 경우를 보자.

```typescript
interface State {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
  pageContents: string;
}
interface TopNavState {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
}
```

여기서는 `TopNavState`를 확장해서 `State`를  구성하기 보다 `State`의 부분 집합으로 `TopNavState`를 정의하는 것이 낫다. 이렇게 해서 전체 앱의 상태를 하나의 인터페이스로 유지할 수 있게 해준다. `State`를 인덱싱해서 속성의 타입에서 중복을 제거할 수 있다.

```typescript
interface State {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
  pageContents: string;
}
type TopNavState = {
  userId: State['userId'];
  pageTitle: State['pageTitle'];
  recentFiles: State['recentFiles'];
};
```

하지만 여전히 코드상 중복적인 느낌이 있다. `State` 내의 `pageTitle` 속성의 타입이 바뀌면 `TopNavState`에도 반영된다. 여기서 매핑된 타입을 사용하면 중복을 더 줄일 수 있다.

```typescript
interface State {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
  pageContents: string;
}
type TopNavState = {
  [k in 'userId' | 'pageTitle' | 'recentFiles']: State[k]
};
```

매핑된 타입은 배열의 필드를 루프 도는 것과 같은 방식이고, 이 패턴은 `Pick`이라는 표준 라이브러리에서도 찾을 수 있다.

```typescript
interface State {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
  pageContents: string;
}
type TopNavState = Pick<State, 'userId' | 'pageTitle' | 'recentFiles'>;
```

여기서 `Pick`은 제너릭 타입이고 함수를 호출하는 것과 마찬가지로 생각하면 된다. 함수에서 매개변수 받아서 사용하듯 `Pick`은 `T`와 `K` 두 가지 타입을 받아서 결과 타입을 반환한다.

태그된 유니온에서도 중복이 발생할 수 있다.

```typescript
interface SaveAction {
  type: 'save';
  // ...
}
interface LoadAction {
  type: 'load';
  // ...
}
type Action = SaveAction | LoadAction;
type ActionType = 'save' | 'load';  // Repeated types!
```

여기서 `Action` 유니온을 인덱싱하면 타입 반복 없이 `ActionType` 정의가 가능하다.

```typescript
type ActionType = Action['type'];  // Type is "save" | "load"
```

클래스를 정의할 때, `update` 메서드의 경우에는 생성자와 동일한 매개 변수이나, 선택적 필드가 된다. 이런 경우에 `keyof`를 사용할 수도 있고, `Partial`이라는 유틸리티 타입을 사용하면 된다.

```typescript
interface Options {
  width: number;
  height: number;
  color: string;
  label: string;
}
type OptionsKeys = keyof Options;
// Type is "width" | "height" | "color" | "label"

interface Options {
  width: number;
  height: number;
  color: string;
  label: string;
}
class UIWidget {
  constructor(init: Options) { /* ... */ }
  update(options: Partial<Options>) { /* ... */ }
}
```

값의 형태에 따라 해당 하는 타입을 정의할 떄는 `typeof`를 사용하면 된다. 값으로 부터 타입을 만들 때는 선언의 순서에 주의해서, 타입 정의를 먼저하고 값이 그 타입에 할당 가능하다고 선언하는 것이 좋다. 그래야 타입이 더 명확해지고, 예상하기 어려운 타입 변동을 방지할 수 있다.

```typescript
const INIT_OPTIONS = {
  width: 640,
  height: 480,
  color: '#00FF00',
  label: 'VGA',
};
type Options = typeof INIT_OPTIONS;
```

함수나 메서드의 반환 값에 명명된 타입을 사용할 때도 있다. 

```typescript
function getUserInfo(userId: string) {
  // COMPRESS
  const name = 'Bob';
  const age = 12;
  const height = 48;
  const weight = 70;
  const favoriteColor = 'blue';
  // END
  return {
    userId,
    name,
    age,
    height,
    weight,
    favoriteColor,
  };
}
// Return type inferred as { userId: string; name: string; age: number, ... }
```

반환 타입에 대한 부분도 표준 라이브러리에 제너릭 타입이 설정되어있다. `ReturnType` 제너릭을 사용하면 된다. 

```typescript
type UserInfo = ReturnType<typeof getUserInfo>
```

`ReturnType`은 함수의 값인 `getUserInfo`가 아니라 함수의 타입인 `typeof getUserInfo`에 적용되었다. 이런건 적용 대상이 값인지 타입인지 정확히 알아야 한다.

제너릭 타입은 타입을 위한 함수와 같다. 제너릭 타입에서 매개변수를 제한할 수 있는 방법은 `extends`를 사용하는 것이다. 

```typescript
interface Name {
  first: string;
  last: string;
}
type DancingDuo<T extends Name> = [T, T];

const couple1: DancingDuo<Name> = [
  {first: 'Fred', last: 'Astaire'},
  {first: 'Ginger', last: 'Rogers'}
];  // OK
const couple2: DancingDuo<{first: string}> = [
                       // ~~~~~~~~~~~~~~~
                       // Property 'last' is missing in type
                       // '{ first: string; }' but required in type 'Name'
  {first: 'Sonny'},
  {first: 'Cher'}
];
```

`{first: string}`은 `Name`을 확장하지 않기 때문에 오류가 발생한다. 

### 요약 

- DRY(don't repeat yourself) 원칙을 타입에도 적용해야 한다.
- 타입에 이름을 붙여서 반복을 피해야 한다. `extends`를 사용해서 인터페이스 필드의 반복을 피해야 한다.
- 타입들간 매핑을 위해 TS가 제공한 도구들을 공부하면 좋다. `keyof`, `typeof`, 인덱싱, 매핑된 타입이 포함된다.
- 제너릭 타입은 타입을 위한 함수와 같다. 타입을 반복하는 대신 제너릭 타입을 사용하여 타입들 간에 매핑을 하는 것이 좋다. 제너릭 타입을 제한하려면 `extends`를 사용하자.
- 표준 라이브러리에 정의된 `Pick, Partial, ReturnType` 같은 제너릭 타입에 익숙해져야 한다.



## 아이템 15 : 동적 데이터에 인덱스 시그니처 사용하기

타입스크립트에서는 타입에 **인덱스 시그니처**를 명시하여 유연하게 매핑을 표현할 수 있다.

```typescript
type Rocket = {[property: string]: string};
const rocket: Rocket = {
  name: 'Falcon 9',
  variant: 'v1.0',
  thrust: '4,940 kN',
};  // OK
```

`[property: string] : string`이 인덱스 시그니처이고, 세 가지 의미를 담고 있다.

- 키의 이름 : 키의 위치만 표시하는 용도다. 타입 체커에서는 사용하지 않는다.
- 키의 타입 : string이나 number 또는 symbol의 조합이어야 하지만, 보통 string을 사용한다.
- 값의 타입 : 어떤 것이든 가능하다.

위와 같이 타입 체크가 수행되며 네 가지 단점이 드러난다.

- 잘못된 키를 포함해 모든 키를 허용한다. `name` 대신 `Name`으로 작성해도 유효한 `Rocket`타입이 된다.
- 특정 키가 필요하지 않다. `{}`도 유효한 `Rocket` 타입이다.
- 키마다 다른 타입을 가질 수 있다.
- TS 언어 서비스는 다음과 같은 경우 도움이 되지 못한다. `name:`을 입력할 때, 키는 무엇이든 가능하기 때문에 자동 완성 기능이 동작하지 않는다.

결론적으로 인덱스 시그니처는 부정확하기 때문에더 나은 방법을 찾아야 한다. 예를 들어 인터페이스여야 더 나을 수 있다. 

```typescript
interface Rocket {
  name: string;
  variant: string;
  thrust_kN: number;
}
const falconHeavy: Rocket = {
  name: 'Falcon Heavy',
  variant: 'v1',
  thrust_kN: 15_200
};
```

인덱스 시그니처는 동적 데이터를 표현할 때 사용한다. CSV 파일처럼 행과 열에 이름이 있고 ,데이터 행을 열 이름과 값으로 매핑하는 객체로 나타내고 싶을 때 사용한다.

```typescript
function parseCSV(input: string): {[columnName: string]: string}[] {
  const lines = input.split('\n');
  const [header, ...rows] = lines;
  return rows.map(rowStr => {
    const row: {[columnName: string]: string} = {};
    rowStr.split(',').forEach((cell, i) => {
      row[header[i]] = cell;
    });
    return row;
  });
}
```

일반적인 경우 열 이름이 무엇인지 미리 알 수 없는데, 그때 인덱스 시그니처를 사용한다. 미리 알 경우에는 미리 선언해 둔 타입으로 단언문을 사용한다.

연관 배열(associative array)의 경우, 객체에 인덱스 시그니처를 사용하는 대신 `Map` 타입을 사용하는 것을 고려할 수 있다. 어떤 타입에 가능한 필드가 제한되어 있는 경우라면 인덱스 시그니처로 모델링하지 말아야 한다. 그럴 땐 선택적 필드 또는 유니온 타입으로 모델링해야 한다. 

```typescript
interface Row1 { [column: string]: number }  // Too broad
interface Row2 { a: number; b?: number; c?: number; d?: number }  // Better
type Row3 =
    | { a: number; }
    | { a: number; b: number; }
    | { a: number; b: number; c: number;  }
    | { a: number; b: number; c: number; d: number };
```

`string` 타입이 광범위해서 인덱스 시그니처가 문제가 있다면, `Record`를 사용하는 방법이 있다. `Record`는 키 타입에 유연성을 제공하는 제너릭 타입이다. 특히 `string`의 부분 집합을 사용할 수 있다.

```typescript
type Vec3D = Record<'x' | 'y' | 'z', number>;
// Type Vec3D = {
//   x: number;
//   y: number;
//   z: number;
// }
```

두 번째 방법은 매핑된 타입을 사용하는 것이다. 매핑된 타입은 키마다 별도의 타입을 사용하게 해준다.

``` typescript
type Vec3D = {[k in 'x' | 'y' | 'z']: number};
// Same as above
type ABC = {[k in 'a' | 'b' | 'c']: k extends 'b' ? string : number};
// Type ABC = {
//   a: number;
//   b: string;
//   c: number;
// }
```

### 요약

- 런타임 때까지 객체의 속성을 알 수 없을 경우에만 인덱스 시그니처를 사용한다.
- 안전한 접근을 위해 인덱스 시그니처의 값 타입에 `undefined`를 추가하는 것을 고려해야 한다.
- 가능하면 인터페이스, Record, 매핑된 타입 같은 인덱스 시그니처보다 정확한 타입을 사용하는게 좋다.



## 아이템 16 : number 인덱스 시그니처보다는 Array, 튜플, ArrayLike를 사용하기

자바스크립트의 암시적 타입 강제는 악명 높기로 유명한데 대부분 `===`과 `!==`를 사용해서 해결이 가능하다. 자바스크립트에서 객체란 키/값 쌍의 모음이다. 키는 보통 문자열이고 값은 어떤 것도 가능하다. 숫자는 키로 사용할 수 없다. 속성 이름을 숫자로 사용하려고 하면 문자열로 변환된다. 

타입스크립트에서는 숫자 키를 허용하고, 문자열 키와 다른 것으로 인식한다. `Array`의 타입 선언은 다음과 같다.

```typescript
interface Array<T> {
  //...
  [n:number] : T;
}
```

배열을 순회할 때, 인덱스에 신경 쓰지 않으면 `for of`를 사용하는 것이 좋고, 인덱스의 타입이 중요하면 `foreach()`를 사용하는 것이 좋다. 그리고 루프 중간에 멈춰야 하면 `for(;;)`루프를 사용하는 것이 좋다.

인덱스 시그니처가 `number`로 표현되어있어 입력한 값이 `number`여야 하는 것은 맞지만, 실제 런타임에 사용되는 키는 `string`타입 이다. 이 부분이 혼란스러울 수 있다. 그게 오히려 타입스크립트를 잘 이해하고 구조적인 고려를 하고 있다는 의미이기도 하다.

어떤 길이를 가지는 배열과 비슷한 형태의 튜플을 사용하고 싶으면 타입스크립트에 있는 `ArrayLike` 타입을 사용한다.

```typescript
const xs = [1, 2, 3];
function checkedAccess<T>(xs: ArrayLike<T>, i: number): T {
  if (i < xs.length) {
    return xs[i];
  }
  throw new Error(`Attempt to access ${i} which is past end of array.`)
}
```

이 예제는 길이와 숫자 인덱스 시그니처만 있다. 필요한 경우 `ArrayLike`를 사용하면되지만 키는 여전히 문자열이라는 것을 잊지 말아야 한다.

```typescript
const xs = [1, 2, 3];
const tupleLike: ArrayLike<string> = {
  '0': 'A',
  '1': 'B',
  length: 2,
};  // OK
```

### 요약

- 배열은 객체이므로 키는 숫자가 아니라 문자열이다. 인덱스 시그니처로 사용된 `number` 타입은 버그를 잡기 위한 순수 타입스크립트 코드이다.
- 인덱스 시그니처에 `number`를 사용하기 보다 `Array`나 튜플, 또는 `ArrayLike`타입을 사용하는게 좋다.

