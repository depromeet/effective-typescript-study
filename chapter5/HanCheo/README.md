## 아이템 33. String 타입보다 더 구체적인 타입 사용하기

`stirng`타입은 굉장히 넓은 타입이다. 단순 한글자('a')나 장문의 글은 모두 string타입으로 선언할수 있다. 이번 챕터에서는 해당 스트링타입을 줄일 수 있으면 최대한 줄이는 방법을 설계한다.

```typescript
interface Album {
  artist: string;
  title: string;
  releaseDate: string; // YYYY-MM-DD
  recodingType: string; // "live" or "studio"
}
```

`Album`인터페이스의 모든 속성의 타입은 string이다. `title`이나 `artist`는 예측할수 없지만 `releaseDate`와 `recodingType`는 고정된 형태로 값을 예측이 가능하다. 다만 위 처럼 `string` 형태로 타입을 지정해버리면 고정된 값의 범위를 가지는 속성이 범위를 넘어가는 형태로 가질 수 있게된다.

```typescript
//좋지 않은 값의 형태
const newAlbum: Album = {
  artist: 'hanch',
  title: 'typescript song',
  releaseDate: 'not today', //날짜가 아님 but Pass
  recodingType: 'Studio', //오타 (대문자 S)
}; //pass
```

좀더 타입 에러를 잡을 수 있도록 타입을 변경해보자.

```typescript
type RecodingType = 'studio' | 'live';

interface Album = {
  artist: string;
  title:string;
  releaseDate: Date;
  recodingType: RecodingType;
}

const newAlbum: Album = {
  artist: 'hanch',
  title: 'typescript song',
  releaseDate: 'not today', // error not Date
  recodingType: 'Studio', //errir not RecodingType
}; //error
```

### keyof T 제네릭 사용하기

객체 배열의 하나의 속성을 가져오는 함수를 작성해보자

```typescript
function pluck<T, K exteds keyof T>(record: T[], key:K) {
	return records.map(r => r[key])
}

pluck(albums, 'releaseDate') // type Date[];
pluck(albums, 'rr') // error 'rr'이 albums에 없음
```

keyof는 T타입의 모든 속성명을 타입으로 가지게 하며 위처럼 작성했을 때 별도의 제네릭을 추가하여 사용하지 않더라도 타입추론이 굉장히 쉽게 된다.

## 아이템 34. 부정확한 타입보다는 미완성 타입을 사용하기

타입은 구체적일 수록 버그를 더 많이 잡을 수 있고 타입스크립트 도구를 더 잘 활용할 수 있다.
하지만 이러한 타입 오류는 쉽게 잡기 어려운 감이 있다

다음 타입을 보자

```typescript
interface Point {
  type: 'Point';
  coordinates: number[];
}
```

여기서 `coordinates`는 단순 위도 경도만 가지고 있기 때문에 튜플 형태의 타입으로 바꾸는 것이 좋을 것 같다.

`coordinates: [number, number]`

타입을 더 구체적으로 제시를 했지만 간과한것은 `coordinates` 위도 경도 뿐만아니라 고도가 들어갈수도 있고 추가적인 정보가 들어갈수 있다는 점에서 추가적인 오류를 발생 시킬 수 있다. 따라서 타입이 오히려 더 부정확해졌다고 할 수 있다. 이런 경우를 해결하기위해서는 `as any`나 타입 단언을 사용하여 타입체커를 무시해야한다.

추가적인 예시를 한번 더 보자

```typescript
type FnName = '+' | '-' | '*' | '/' | '<' | '>' | 'case' | 'rgb';
type CallExpression = [FnName, ...any[]];
type Expression3 = number | string | CallExpression;

const tests: Expressions3[] = [
  10,
  'red',
  true, //error true is not in Expression3
  ['+', 10, 5],
  ['case', ['>', 20, 10], 'red', 'blue', 'green'],
  ['**', 2, 31], //error "**" is not in FnName
  ['rgb', 255, 123, 64],
];
```

`true`와 `**`에 대해 오류가발생했다. 사실 위 타입은 정밀하진 않다 rgb에서도 인자를 더 많이 받을 수 있고 수학 연산자또한 3개 이상을 받으면 동작을 이해하는데 혼란이 올수 있다. 따라서 좀더 정확한 타입을 만들어서 사용해보자

```typescript
type Expression4 = number | string | CallExpression;
type CallExpression = MathCall | caseCall | RGBCall;

interface MathCall {
  0: '+' | '-' | '*' |'/' |'<'| '>';
  1: Expression4;
  2: Expression4;
  length:3
}

interface CaseCall {
  0: 'case';
  1: Expression4;
 	2: Expression4;
  3: Expression4;
  length: 4 | 6 | 8 | 10 | 12....
}

interface RGBCall {
  0: 'RGB';
  1: Expression4;
  2: Expression4;
  3: Expression4;
  length: 4;
}

const tests: Expression4[] = [
    10,
  "red",
  true, //error true is not in Expression3
  ["+", 10, 5],
  ["case", [">", 20, 10], "red", "blue", "green"],
  //["case", [">", ...],...] is not in 'string'
  ["**", 2, 31], //error 'number' is not in 'string'
 	["rgb",255,123,64],
  ["rgb",255,123,64, 74], //error 'number' is not in 'string'
]
```

타입을 좀더 정밀하게 작성하여 진행했으나 돌아오는것은 string에 적용할수 없다는 에러만이 출력된다. 오히려 이전에 했던 타입보다 저 부정확해져 오류를 파악하는데 오랜 시간이 걸릴 수 있다. 더 구체적이지만 타입 자동완성을 해칠 수 있으므로 좋은 타입이 아니다.

> 불쾌한 골짜기는 피해야 한다. 정확하지 않고 애매하게 타입을 작성된 것은 더 나쁘다.
>
> 정확하게 타입을 모델링 할 수 없다면, 부정확하게 모델링을 하지말아야 한다. `any`나 `unknown`을 사용하고 이를 제대로 구별하자
>
> 타입 정보가 구체적일 수록 오류메세지와 자동완성 기능에 주의를 기울이자

## 아이템 35. 데이터가 아닌, API와 명세를 보고 타입 만들기

잘못된 타입설계가아닌 API, 명세, 파일 형식 등으로 외부에서 사용되는 타입을 만드는 경우를 말하고 있다. 이런 경우는 대체적으로 타입을 자동완성 시킬수가 있는데 완성을 시킬때 예시 데이터가아닌 명세를 보고 타입을 작성해야하는 것이다. 예시데이터에는 예시 데이터 상황만 고려가 된 상태이므로 전체적인 상황을 고라할 수 없기 때문이다.

> GrahpQL 에서의 string 타입은 String이다. String은 null이 가능하므로 String! 를 해주어야 타입스크리브로 전환시 타입이 string으로 된다.

## 아이템 36. 해당 분야의 용어로 타입 이름 짓기

이는 해당분야의 지식이 늘기도 하며 다른사람과의 커뮤니케이션을 하는 과정에서도 효력을 발생시킨다

```typescript
interface Animal {
  name: string; // 동물 이름
  endangered: boolean; // 멸종위기 인지
  habitat: string; //서식지
}

const leopard: Animal = {
  name: 'Snow Leopard',
  endangered: false,
  habitat: 'tundra',
};
```

문제점.

1. name은 동물의 학명인지 일반적인 용어인지 알수 없음.
2. 멸종 위기를 표현하기위해 boolean은 맞지않음. 이미 멸종된 동물은 판단할 수 없음. 속성의도를 '멸종위기 또는 멸종'으로 생각한 것일 수도 있음.
3. 서식지는 string으로 범위가 굉장히 넒음. 서식지라는 뜻 또한 불분명함.
4. 변수명은 leopard이지만 name의 명칭과 다름 name의 의도는 다른것이 있어보임. but 파악하기 어려움.

개선

```typescript
interface Animal {
  commonName: string;
  genus: string;
  species: string;
  satus: ConservationStatus;
  climates: KoppenClimate[];
}

type CnservationStatus = 'EX'|'EW' |'CR' ...;
type KoppenClimate = 'Af' | 'Am' | 'As' | 'Aw' ...;

const snowLeopard: Animal = {
  commonName: 'Snow Leopard',
  genus: 'Panthera',
  species: 'Uncia',
  status: 'VU',			// 취약종(vulnerable)
  climates: ['ET', 'EF', 'Dfd'] // 고산대 또는 아고산대
}
```

1. name은 commonName, genus, species 등 구체적인 용어로 대체함
2. endangered는 동물 보호 등급에 대한 IUCN의 표준 분류 체계인 ConservationStatus 타입의 status로 변경됨. -> 전문용어
3. habitat는 기후를 뜻하는 climates로 변경되고, 쾨펜 기후 분류를 사용한다고 명시함.

결과적으로 데이터를 좀더 명확하게 표현할 수 있게되었고 자체적인용어를 만들어 내는 것이 아닌 이미 있는 용어를 사용함으로써 다른 사용자와의 소통에서 굉장히 유리한 점을 가져올 수 있다.

다만 전문 분야의 용어는 정확하게 사용해야한다. 특정 용어르르 다른 의미로 쓰게 된다면, 직접 만들어 낸 용어보다 더 혼란을 줄 수 있게 된다.

### 타입, 속성, 변수에 이름을 붙일 때 명심해야 할 세 가지 규칙

1. 동일한 의미를 나타낼 때에는 같은 용어를 사용해야 합니다. 글을 읽는 것이 아닌 코드를 읽는 것에서는 의미적으로 구분이 되어야 하는 경우에만 다른 용어를 사용한다.
2. data, info, thing, item, object, entity와 같은 모호하고 의미 없는 이름은피해야한다. 만약 entity라는 용어가 해당 분야에서 특별한 의미를 가진다면 괜찮다.
3. 이름을 지을 때는 포함된 내용이나 계산 방식이 아니라 데이터 자체가 무엇인지를 고려해야한다. 예를 들어, INodeList보다는 Directory가 더 의미있는 이름이다. Directory는 구현의 측면이 아니라 개념적인 측면에서 디렉터리를 생각하게 한다. 좋은 이름은 추상화의 수준을 높이고 의도치 않은 충돌의 위험성을 줄여 준다.

## 아이템 37. 공식 명칭에는 상표를 붙이기

구조적 타이핑의 특성 때문에 가끔 코드가 이상한 결과를 낼 수있다.

```typescript
interface Vector2D {
  x: number;
  y: number;
}

function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

calculateNorm({ x: 3, y: 4 }); // 5
const vec3D = { x: 3, y: 4, z: 1 };
calculateNorm(vec3D); // 5
```

구조적 타이핑의 관점으로는 문제가 없으나 수학적으로 따지면 2차원 벡터를 사용해야 함수의 사용이 올바르다.
이를 해결하기 위해서는 공식 명칭을 사용하면된다. 공식명칭을 사용하는 것은 타입이 아닌 값의 관점에서 Vector2D라고 말하는 것이다.

```typescript
interface Vector2D {
  _brand: '2d';
  x: number;
  y: number;
}
```

위와 같이 표현함으로

```typescript
function vec2D(x: number, y: number): Vector2D {
  return { x, y, _brand: '2d' };
}

function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

calculateNorm(vec2D(3, 4)); // 5
const vec3D = { x: 3, y: 4, z: 1 };
calculateNorm(vec3D); // error _brand is not in vec3D;
```

이제 3D 타입이 calculateNorm의 함수에 들어가는 것을 막았다. vec3D에 의도적으로 `_brand: '2D'`를 넣게되면 막을수는 없지만 단순한 실수를 방지하기에는 충분하다. 위와같은 상표기법은 **검증은 타입시스템에서 검증하나 런타임에서도 검증하는 동일한 효과를 얻을 수 있다**. 타입시스템이기 때문에 런타임 오버해드를 없앨 수 있고 추가 속성을 붙일 수 없는 string이나 number같은 타입도 상표화 할 수 있다.

```typescript
type AbsolutePath = string & { _brand: 'abs' };
function listAbsolutePath(path: AbsolutePath) {
  //...
}
function isAbsolutePath(path: string): path is AbsolutePath {
  return path.startsWith('/');
}
```

여기서 보면 string 타입이면서 `_brand` 속성을 가지는 객체를 만들 수 없다 원시타입에 새로운 속성을 추가시 바로 삭제 되었던것을 보면 알 수 있다. 위와 같은 방식은 온전히 타입시스템에서만 검증하는 것이며 런타임에서는 오버헤드를 발생시키지 않는 다는 의미이다.

만약 path값이 절대경로 상대경로가 모두 될수 있다면 타입가드를 사용하여 런타임에서도 오류를 방지할 수 있다.

```typescript
type AbsolutePath = '/';

function f(path: string) {
  if (isAbsolutePath(path)) {
    listAbsolutePath(path); //pass
  }
  listAbsolutePath(path); // error string not in AbsolutePath
}
```

> 타입스크립트는 구조적 타이핑을 사용하기 때문에 값을 세밀하게 구분하지 못하는 경우가 있다. 값을 구분하기위해 꼭 공식명칭이 필요하다면 상표화를 시키는 것을 고민해야한다.
>
> 상표 기법은 타입 시스템에서 동작하지만 런타임에 상표를 검사하는 것과 동일한 효과를 얻을 수 있다.

## Any타입 다루기

## 아이템 38. Any 타입은 가능한 한 좁은 범위에서 사용하기

any는 어떻게 사용해야 할까?

```typescript
function processBar(b: Bar) {
  /*...*/
}

function f() {
  const x = expressionReturningFoo(); // x : Foo;
  processBar(x);
  // ~ 'Foo' is not `Bar`
}
```

위와 같은 상황이 있다 return 받은 값을 대입해야하는데 타입이 다른경우이다. any를 사용하지 않는 것이 베스트긴 하나 any를 추가해서 해결할 수 있는 방안이 2가지가 있는데 다음과 같다.

```typescript
function f() {
  const x: any = expressionReturningFoo(); // x : any;
  prcessBar(x);

  return x; // x: any
}

function f() {
  const x = expressionReturningFoo(); // x : Foo;
  processBar(x as any);

  return x; // x: Foo
}
```

2가지 함수 모두 동일한 동작을하고 processBar가 동작을 한다. 다만 첫번째 함수처럼 `const x: any`를 하게되면 해당 함수 내부에서 x를 다른곳에서 사용하거나 x를 return 하면 any 타입으로 반환되어 이후작업이 타입체킹이 안되는 경우가 발생한다. 그나마 아래쪽으로 사용하는 방법이 낫다.

또한 다음과 같이 해결할 수도있다.

```typescript
function f() {
  const x = expressionReturningFoo(); // x : Foo;
  // @ts-ignore
  processBar(x);

  return x; // x: Foo
}
```

다음라인은 ts 검사를 안하게 해주는 코드로 any를 사용하지는 않지만 근본적인 해결은 아니다.

원인을 찾아 바로잡도록하자

함수와 동일하게 객체또한 부분 any로 검증을 피할 수 있다.

```typescript
// 타입에러가 나는 예시
const config: Config = {
  x: 1,
  y: 2,
  c: {
    key: value, // if type error is here
  },
};

// 안좋은 해결책
const config: Config = {
  x: 1,
  y: 2,
  c: {
    key: value,
  },
} as any;

// 그나마 나은 해결책
const config: Config = {
  x: 1, // 타입 체킹 됨
  y: 2, // 타입 체킹 됨
  c: {
    key: value as any,
  },
};
```

위와같이 any를 쓰게된다면 최소한으로 사용 할 수 있도록 하자. 물론 가장 좋은 것은 근본적인 원인을 찾아 any를 사용하는 것을 막는 것이 가장 좋다.

> any는 의도치 않은 타입안정성을 해치므로 최소화 해야한다.
>
> 함수의 반환타입이 any인 경우를 만들지 말자
>
> 강제로 타입 오류를 제거하려면 any 대신 @ts-ignore를 사용하는 것이 좋다.

## 아이템 39. Any를 구체적으로 변형해서 사용하기

any는 모든 값의 형태를 아우르므로 분명 좀더 나은 타입으로 변경할수 있다는 것을 명심해두고 있어야한다. 예를 든다면 다음과같다.

```typescript
// 안좋음.
function getArrayLength(a: any) {
  return a.length;
} // a는 모든값의 형태이므로 length가 있을수도 있고 없을 수도 있다.

// 그나마 나은 방식
function getArrayLength(a: any[]) {
  return a.length;
}
```

무심결에보면 타입이 더 많아진것 같지만 오히려 좀더 좁아진 형태이다.
위와 같이 함으로 얻는 점은 다음과같다.

1. Array.length 타입이 체킹이된다.
2. 반환타입이 any가아닌 number이다.
3. 함수가 호출될때 매개변수가 array인지 체킹된다.

배열로 사용할 때는 위처럼 `any[]`를 사용하면되고 객체로 사용할때는 `[key:string]: any` 형태로 사용하면 된다.

함수에서도 any를 좀더 좁은 형태로 가능하다

```typescript
type f1 = () => any; // 매개변수 없이 호출이 가능한 **함수**
type f2 = (arg: any) => any; // 한개의 매개변수를 가지는 함수
type f3 = (...arg: any[]) => any; //여러개의 매개변수를 가지는 함수배열
```

위 세가지 타입은 단순 any로 타입은 선언한것보다 좀더 구체적이다.

> any를 사용할 때 정말 모든 타입이 허용되어야 하는지 고민할 필요가 있다.
>
> any를 보다 정확하게 모델링할 수 있도록 `any[]`, `{[key: string]: any}`, `() => any` 와 같이 좀더 좁은 형태로 사용할 수 있도록 하게 하자.

## 아이템 40. 함수 안으로 타입 단언문 감추기

안전한 타입로직을 작성하는것은 가장 바람직하지만 함수 내부 로직이 복잡하여 함수 안전한 타입로직을 만드는데 어려움이 있다면 return 타입을 명확하게 하고 내부로직에서는 타입단언을 사용하는 것도 고민할 필요가 있다.

다시말하면 함수 내부에서는 타입단언으로 유연하게하고 return 타입은 명확하게 하는 방법이다.

2개의 배열을 받아서 같은지 비교하는 swallowEqual 함수를 확인해보자

```typescript
declare function swallowEqual(a: any, b: any): boolean;
function swallowEqual<T extends Object>(a: T, b: T) {
  for (const [k, aVal] of Object.entries(a)) {
    if (!(k in b) || aVal !== b[k]) {
      //error b[k] : Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Object'.
      return false;
    }
  }
  return Object.keys(a).length === Object.keys(b).length;
}
```

if 구문의 `k in b`로 한번 체킹을 했으나 b[k]에서 에러가 발생햇다. 하지만 우리는 실제 오류가 아닌 것을 알고 있기 때문에 as any로 단언 하여 사용할 수 있다.

```typescript
declare function swallowEqual(a: any, b: any): boolean;
function swallowEqual<T extends Object>(a: T, b: T) {
  for (const [k, aVal] of Object.entries(a)) {
    if (!(k in b) || aVal !== (b[k] as any)) {
      return false;
    }
  }
  return Object.keys(a).length === Object.keys(b).length;
}
```

이렇게 하면 정확한 타입으로 구현되며 제대로된 함수로 동작하게된다. 객체가 같은지 비교하기 위해 객체 순회와 단언문이 코드에 들어가는 것보다 별도로 동작을 분리하여 설계하는 것이 좋은 방법이다.

> 타입 단언문은 일반적으로 타입을 위험하게 만들지만 상황에 따라 필요하기도 하고 현실적인 해결책이 되기도한다. 불가피하게 사용해야한다면 정확한 정의를 가지는 함수 안으로 숨기자.
