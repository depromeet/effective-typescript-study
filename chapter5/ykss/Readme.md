## 아이템 33 : string 타입보다 더 구체적인 타입 사용하기

```typescript
interface Album {
  artist: string;
  title: string;
  releaseDate: string;  // YYYY-MM-DD
  recordingType: string;  // E.g., "live" or "studio"
}
```

위와 같이 무작정 `string` 으로 쓰는 건 피해야 한다. 

```typescript
/** 어느 장소에서 녹음되었는지? */
type RecordingType = 'studio' | 'live';

interface Album {
  artist: string;
  title: string;
  releaseDate: Date;
  recordingType: RecordingType;
}
```

위와 같이 유니온 타입을 정의해서 사용하고, 날짜 같은 경우 Date 객체로 사용해서 날짜 형식만 입력할 수 있도록하는 것이 낫다. 이렇게 하면 세가지 장점이 있다.

1. 타입을 명시적으로 정의하여 다른 곳으로 값이 전달되어도 타입 정보가 유지된다.

2. 타입을 명시적으로 정의하고 해당 타입의 의미를 설명하는 주석을 붙여넣을 수 있다. 

   -> 몰랐는데 유용한 방식이라고 생각된다.

3. keyof 연산자로 더욱 세밀하게 객체의 속성 체크가 가능하다. 

```typescript
function pluck<T, K extends keyof T>(record: T[], key: K): T[K][] {
  return record.map(r => r[key]);
}
```

### 요약

- 문자열을 남발하여 선언된 코드를 피하자. 모든 문자열을 할당할 수 있는 string 타입보다는 더 구체적인 타입을 사용하자.
- 변수의 범위를 보다 정확하게 표현하고 싶으면 string 타입보다 문자열 리터럴 타입의 유니온을 사용하면 된다. 타입 체크를 더 엄격히 할 수 있고 생산성이 향상된다.
- 객체의 속성 이름을 함수 매개변수로 받을 때는 string보다 keyof T를 사용하는 것이 좋다.



## 아이템 34 : 부정확한 타입보다는 미완성 타입을 사용하기

코드를 더 정밀하게 만들려던 시도가 과하면 그로 인해 코드가 오히려 더 부정확해질 수 있다. 타입에 의존하면 부정확함으로 인해 발생하는 문제가 더 커질 수 있다.

```typescript
type Expression1 = any;
type Expression2 = number | string | any[];
type Expression4 = number | string | CallExpression;

type CallExpression = MathCall | CaseCall | RGBCall;

interface MathCall {
  0: '+' | '-' | '/' | '*' | '>' | '<';
  1: Expression4;
  2: Expression4;
  length: 3;
}

interface CaseCall {
  0: 'case';
  1: Expression4;
  2: Expression4;
  3: Expression4;
  length: 4 | 6 | 8 | 10 | 12 | 14 | 16 // etc.
}

interface RGBCall {
  0: 'rgb';
  1: Expression4;
  2: Expression4;
  3: Expression4;
  length: 4;
}

const tests: Expression4[] = [
  10,
  "red",
  true,
// ~~~ Type 'true' is not assignable to type 'Expression4'
  ["+", 10, 5],
  ["case", [">", 20, 10], "red", "blue", "green"],
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  Type '["case", [">", ...], ...]' is not assignable to type 'string'
  ["**", 2, 31],
// ~~~~~~~~~~~~ Type '["**", number, number]' is not assignable to type 'string
  ["rgb", 255, 128, 64],
  ["rgb", 255, 128, 64, 73]
// ~~~~~~~~~~~~~~~~~~~~~~~~ Type '["rgb", number, number, number, number]'
//                          is not assignable to type 'string'
];
 const okExpressions: Expression4[] = [
   ['-', 12],
// ~~~~~~~~~ Type '["-", number]' is not assignable to type 'string'
   ['+', 1, 2, 3],
// ~~~~~~~~~~~~~~ Type '["+", number, ...]' is not assignable to type 'string'
   ['*', 2, 3, 4],
// ~~~~~~~~~~~~~~ Type '["*", number, ...]' is not assignable to type 'string'
 ];
```

타입을 정교하게 하려다가 발생하는 오류들이 이전보다 더 부정확해질 수 있다. 그리고 타입선언이 자동 완성을 방해해서 생산성을 떨어뜨릴 수도 있다.

### 요약

- 타입 안정성에서 불쾌한 골짜기는 피해야 한다. 타입이 없는 것보다 잘못된 것이 더 나쁘다.

  > 불쾌한 골짜기 : 어설프게 완벽을 추구하다가 오히려 역효과가 발생하는 것.

- 정확하게 타입을 모델링할 수 없다면, 부정확하게 모델링하지 말아야 한다. 그리고 `any`와 `unknown`을 구별해서 사용해야 한다.

- 타입 정보를 구체적으로 만들수록 오류 메시지와 자동 완성 기능에 주의를 기울여야 한다. 정확도뿐만 아니라 개발 경험과도 관련된다.



## 아이템 35 : 데이터가 아닌, API와 명세를 보고 타입 만들기

```typescript
export interface getLicense_repository_licenseInfo {
  __typename: "License";
  /** Short identifier specified by <https://spdx.org/licenses> */
  spdxId: string | null;
  /** The license full name specified by <https://spdx.org/licenses> */
  name: string;
}

export interface getLicense_repository {
  __typename: "Repository";
  /** The description of the repository. */
  description: string | null;
  /** The license associated with the repository */
  licenseInfo: getLicense_repository_licenseInfo | null;
}

export interface getLicense {
  /** Lookup a given repository by the owner and repository name. */
  repository: getLicense_repository | null;
}

export interface getLicenseVariables {
  owner: string;
  name: string;
}
```

GraphQL에서는 특정 쿼리에 대해 타입스크립트 타입을 생성할 수 있다. GraphQL 쿼리를 타입스크립트 타입으로 변환해주는 Apollo와 같은 도구들이 있다. 위는 Apollo를 통해 자동 생성된 결과이다. 자동으로 생성된 타입 정보는 API를 정확히 사용할 수 있도록 돕는다.

### 요약 

- 코드의 구석 구석까지 타입 안정성을 얻기 위해 API 또는 데이터 형식에 대한 타입 생성을 고려해야 한다.
- 데이터에 드러나지 않는 예외 경우들이 문제가 될 수 있기 때문에 명세로 부터 코드를 생성하는 것이 좋다.



## 아이템 36 : 해당 분야의 용어로 타입 이름 짓기

```typescript
interface Animal {
  commonName: string;
  genus: string;
  species: string;
  status: ConservationStatus;
  climates: KoppenClimate[];
}
type ConservationStatus = 'EX' | 'EW' | 'CR' | 'EN' | 'VU' | 'NT' | 'LC';
type KoppenClimate = |
  'Af' | 'Am' | 'As' | 'Aw' |
  'BSh' | 'BSk' | 'BWh' | 'BWk' |
  'Cfa' | 'Cfb' | 'Cfc' | 'Csa' | 'Csb' | 'Csc' | 'Cwa' | 'Cwb' | 'Cwc' |
  'Dfa' | 'Dfb' | 'Dfc' | 'Dfd' |
  'Dsa' | 'Dsb' | 'Dsc' | 'Dwa' | 'Dwb' | 'Dwc' | 'Dwd' |
  'EF' | 'ET';
const snowLeopard: Animal = {
  commonName: 'Snow Leopard',
  genus: 'Panthera',
  species: 'Uncia',
  status: 'VU',  // vulnerable
  climates: ['ET', 'EF', 'Dfd'],  // alpine or subalpin
```

타입, 속성, 변수에 이름을 붙일 때 명심해야할 세가지 규칙이 있다.

1. 동일한 의미를 나타낼 때는 같은 용어를 사용해야 한다. 코드에서 동의어를 사용하는 것이 좋지 않다.

2. data, info, thing, item, object, entity와 같이 모호하고 의미 없는 이름은 피해야 한다. 

   -> 이 부분에서 많이 찔린다..!

3. 이름을 지을 때는 포함된 내용이나 계산 방식이 아니라 데이터 자체가 무엇인지 고려해야 한다. 좋은 이름은 추상화의 수준을 높이고 의도치 않은 충돌의 위험성을 줄여준다.

### 요약

- 가독성을 높이고, 추상화 수준을 올리기 위해서 해당 분야의 용어를 사용해야 한다.
- 같은 의미에 다른 이름을 붙이면 안된다. 특별한 의미가 있을 때만 용어를 구분한다.



## 아이템 37 : 공식 명칭에는 상표를 붙이기

```typescript
interface Vector2D {
  x: number;
  y: number;
}
function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

calculateNorm({x: 3, y: 4});  // OK, result is 5
const vec3D = {x: 3, y: 4, z: 1};
calculateNorm(vec3D);  // OK! result is also 5
```

```typescript
interface Vector2D {
  _brand: '2d';
  x: number;
  y: number;
}
function vec2D(x: number, y: number): Vector2D {
  return {x, y, _brand: '2d'};
}
function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y);  // Same as before
}

calculateNorm(vec2D(3, 4)); // OK, returns 5
const vec3D = {x: 3, y: 4, z: 1};
calculateNorm(vec3D);
           // ~~~~~ Property '_brand' is missing in type...
```

위와 같이 `_brand`를 붙이는 것을 상표(brand) 기법이라고하는데, 타입 시스템에서 동작하지만 런타임에 상표를 검사하는 것과 동일한 효과를 준다. (Nominal Typing)

### 요약

- 타입스크립트는 구조적 타이핑(덕 타이핑)을 사용하기 때문에 값을 세밀하게는 구분하지 못하는 경우가 있다. 이럴 때 값을 구분하기 위해 상표를 붙이는 방법이 있다.
- 상표 기법은 타입 시스템에서 동작하나, 런타임에 상표를 검사하는 것과 동일한 효과를 얻을 수 있다.

# 5장. any 다루기



## 아이템 38 : any타입은 가능한 한 좁은 법위에서만 사용하기

```typescript
interface Foo { foo: string; }
interface Bar { bar: string; }
declare function expressionReturningFoo(): Foo;
function processBar(b: Bar) { /* ... */ }

function f() {
  const x = expressionReturningFoo();
  processBar(x);
  //         ~ Argument of type 'Foo' is not assignable to
  //           parameter of type 'Bar'
}

function f1() {
  const x: any = expressionReturningFoo();  // Don't do this
  processBar(x);
}

function f2() {
  const x = expressionReturningFoo();
  processBar(x as any);  // Prefer this
}
```

위 상황에서 두 가지 해결책 중 `x:any`보다 `x as any`가 권장된다. 그 이유는 `any` 타입이 해당 함수의 매개변수에만 사용된 표현식이어서 다른 코드에 영향을 주지 않기 때문이다. `f1()`는 변수 `x`의 타입 자체가 `any`로 바뀌어버린다. 

```typescript
interface Foo { foo: string; }
interface Bar { bar: string; }
declare function expressionReturningFoo(): Foo;
function processBar(b: Bar) { /* ... */ }
function f1() {
  const x = expressionReturningFoo();
  // @ts-ignore
  processBar(x);
  return x;
}
```

위와 같이 `@ts-ignore`를 사용하면 다음 줄의 오류가 무시된다. 하지만 근본적인 문제를 해결한 것은 아니기 때문에 해결책이라고는 할 수 없다. `any`는 최소한의 범위에만 사용해야 타입 체크가 안되거나 하는 등의 부작용이 생기지 않는다.

### 요약

- 의도치 않은 타입 안전성의 손실을 피하기 위해 `any`의 사용 범위를 최소한으로 좁혀야 한다.

- 함수의 반환 타입이 `any`인 경우 타입 안정성이 나빠진다. 따라서 `any`타입을 반환하지 않도록 하자

- 강제로 타입 오류를 제거하려면 `any`대신 `@ts-ignore`를 사용하는 것이 좋다.

  

## 아이템 39 : any를 구체적으로 변형해서 사용하기

```typescript
function getLengthBad(array: any) {  // Don't do this!
  return array.length;
}

function getLength(array: any[]) {
  return array.length;
}
```

언뜻 보면 위 코드에서 `any`나 `any[]`가 큰 차이가 있는 것 같지는 않지만, 아래 함수가 세 가지 이유에서 더 나은 함수이다.

1. 함수 내의 array.length 타입이 체크된다.
2. 함수의 반환 타입이 `any`대신 `number`로 추론된다.
3. 함수 호출될 때 매개변수가 배열인지 체크된다.

그리고 함수의 매개변수가 객체인데, 값을 알 수 없다면 `{[key:string] :any}`처럼 선언하면 된다.

### 요약

- `any`를 사용할 때는 정말로 모든 값이 허용되어야하는지 검토해야 한다.
- `any`보다 더 정확하게 모델링할 수 있도록 `any[]` 또는 `{[id:string] :any}` 또는 `() => any`처럼 구체적인 형태를 사용해야 한다.



## 아이템 40 : 함수 안으로 타입 단언문 감추기

불필요한 예외 상황까지 고려하여 타입 정보를 힘들게 구성하기보다, 함수 내부에는 타입 단언을 사용하고 함수 외부로 드러나는 타입 정의를 정확히 명시하는게 낫다.

### 요약

- 타입 선언문은 일반적으로 타입을 위험하게 만들지만 상황에 따라 필요하기도 하고 현실적인 해결책이 되기도 한다. 불가피하게 사용해야 한다면, 정확한 정의를 가지는 함수 안으로 숨기도록 한다.
