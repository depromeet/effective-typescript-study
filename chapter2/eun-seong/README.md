# 2장 타입스크립트의 타입 시스템

## 아이템6) 편집기 사용하여 타입 시스템 탐색하기

타입스크립트가 어떻게 타입을 추론하는지 마우스 올려서 자주 확인해보자

null은 객체!

## 아이템7) 타입이 값들의 집합이라고 생각하기

제네릭을 사용하는 이유

K extends string

→ string, string 리터럴의 유니온, string 리터럴 타입 을 모두 포함하기 위해서

## 아이템8) 타입공간과 값공간의 심벌 구별하기

심벌은 타입 공간과 값 공간 중 한 곳에 존재한다

- 자바스크립트의 타입
  - string
  - number
  - boolean
  - undefined
  - object
  - function

class는 두 가지의 타입으로 사용될 수 있다(비슷하게 enum도)

type T = typeof 클래스

→ 타입이 typeof 클래스 → 값이 될 경우 생성자로 쓰임

InstanceType<typeof 클래스>

→ 타입이 클래스 → 인스턴스 타입

모든 값은 타입을 가지지만 모든 타입은 값을 가지지 않는다. type과 interface는 타입 공간에만 존재한다.

## 아이템9) 타입 단언보다는 타입 선언 사용하기

```typescript
interface Person { name: string }

// 타입 선언
const alice: Person = { name: 'Alice' }

// 타입 단언
const alice = { name: 'Bob' } as Person
const alice = <Person>{ name : 'Bob' } // 위와 같은 코드
```

타입 단언은 타입스크립트가 추론한 타입이 있더라도 Person 타입으로 간주한다.

그렇기 때문에 속성이 없거나, 추가될 때도 오류가 표시되지 않는다.



### 화살표 함수 안에서 타입 선언하기

Person 타입이 아니라 `{ name: string }[]` 타입이 되어버림

```typescript
const people = ['alice', 'bob', 'jan'].map(name => ({name}))
```

1. 화살표 함수 안에서 타입과 함께 변수를 선언하기

   ```typescript
   const people = ['alice', 'bob', 'jan'].map(name => {
       const person: Person = {name};
       return person;
   })
   ```

2. 화살표 함수의 반환 타입을 선언

   ```typescript
   const people = ['alice', 'bob', 'jan'].map((name): Person => ({name}))
   ```

   주의할 점 : `(name: Person)` 이 아니다. 이렇게 되면 반환 타입이 없기 때문에 오류가 발생한다.

3. 최종적으로 원하는 타입 직접 명시

   ```typescript
   const people: Person[] = ['alice', 'bob', 'jan'].map((name): Person => ({name}))
   ```



### 타입 단언

#### 타입 단언문으로 타입 간에 변환은 할 수 없다.

HTMLElement는 HTMLElement | null의 서브 타입이기 때문에 동작한다. 또한 Person은 {}의 서브타입이므로 동작한다. <u>하지만 Person과 HTMLElement는 서로의 서브타입이 아니기 때문에 변환이 불가능하다.</u>

![image-20211112164207018](/Users/eun/Library/Application Support/typora-user-images/image-20211112164207018.png)

오류를 해결하기 위해서는 `unkown` 을 사용하면 된다.

```typescript
const el = document.body as unknown as Person; // 정상
```

이걸 작성하고 있는 순간 무언가 잘못되고 있다는 걸 알고 있어야 한다...



#### 타입 단언이 필요한 경우: DOMElement

타입스크립트는 DOM에 접근할 수 없기 때문에 관련 엘리턴트를 알지 못한다.
그래서 여기서는 타입 단언문을 사용하는 게 타당하다

```typescript
document.querySelector('#button')!.addEventListener('click', (e) => {
    const button = e.currentTarget as HTMLButtonElement;
})
```



#### Non-null assertion operator

접두사로 쓰인 !는 boolean의 부정문
접미사로 쓰인 !는 non-null assertion 단언문

```typescript
const elNull = document.getElementById('foo'); // HTMLElement | null
const el = document.getElementById('foo'); // HTMLElement
```

* 값이 null이 아니라고 확실할 수 있을 때 사용해야 한다.



## 아이템10) 객체 래퍼 타입 피하기

### 일곱 가지 타입과 래핑 객체

* string -> String
* number -> Number
* boolean -> Boolean
* null
* undefined
* symbol -> Symbol
* bigint -> BigInt

기본형들은 **immutable**하며 **메소드를 가지지 않는다**.

### 기본형의 객체같은 동작

하지만 아래와 같은 경우가 가능한데,

```typescript
'primitive'.charAt(3)
```

사실 `charAt` 이 string의 메소드가 아니다.

자바스크립트는 기본형과 객체 타입을 서로 자유롭게 변환한다.
string 기본형이 charAt과 같은 메소드를 사용하게 되면, 자바스크립트는

1. 기본형을 String 객체로 래핑하고
2. 메소드를 호출한 후
3. 마지막에 래핑한 객체를 버린다.

* 확인해보기

  ```typescript
  const originalCharAt = String.prototype.charAt;
  String.prototype.charAt = function(pos) {
      console.log(this, typeof this, pos)
      return originalCharAt.call(this, pos)
  }
  console.log('primitive'.charAt(3)); // [String: 'primitive'] 'object' 3
  ```



### 객체와 기본형의 차이

* 객체는 오직 자기 자신하고만 동일하다

  ```ts
  'hello' === new String('hello') // false
  new String('hello') === new String('hello') // false
  ```

* 기본형에 속성을 할당하면 속성이 사라짐

  ```ts
  x = 'hello'
  x.language = 'EN'
  x.language // undefined
  ```

  x가 객체로 래핑된 후 language 속성이 할당되었지만, 이 속성이 추가된 객체를 버려진다.



### string -> String 가능, String -> string 불가능

```ts
const s: String = 'primitive'; // 런타입 값은 기본형
```



하지만 new 없이 BigInt와 Symbol을 호출하는 경우는 기본형을 생성한다.

```ts
typeof BigInt(1234) // 'bigint'
typeof Symbol('sym') // 'symbol'
```



## 아이템11) 잉여 속성 체크의 한계 인지하기

타입이 명시된 변수에 **객체 리터럴을 할당할 때(변수 할당 or 함수 매개변수 전달)** 타입스크립트는 

1. 해당 타입의 속성이 있는지
2. **그 외의 속성은 없는지(잉여 속성 체크)**

확인한다.

### 잉여 속성 체크

```ts
interface Room {
    numDoors: number;
    ceilingHeightFt: number;
}

const r: Room = {
    numDoors: 1,
    ceilingHeightFt: 10,
    elephant: 'present' // error: 객체 리터럴은 알려진 속성만 지정할 수 있다
}
```

이 경우에 잉여 속성 체크가 수행되어, 구조적 타입 시스템에서 발생할 수 있는 오류를 잡을 수 있다.



### 구조적 할당의 문제(잉여 속성 체크 수행 X)

하지만 임시 변수를 도입하면

```ts
const obj = {
    numDoors: 1,
    ceilingHeightFt: 10,
    elephant: 'present'
}
const r: Room = obj;
```

타입 체커를 통과한다. (obj 타입은 Room 타입의 부분 집합을 포함하므로: 구조적 할당)

**obj는 객체 리터럴이 아니기 때문에 잉여 속성 체크를 수행하지 않는다.**

```ts
// 다른 예제
interface Options {
    title: string;
    darkMode?: boolean;
}

const o1: Options = document;
const o2: Options = new HTMLAnchorElement;
```

document나 HTMLAnchorElement는 title 속성을 가지고 있기 때문에 에러가 발생하지 않는다.
<u>이렇게 되면 Options는 엄청나게 넓은 타입이라는 것을 알 수 있다.</u>

```ts
const intermediate = { darkmode: true, title: 'Ski Free' }
const o = intermeidate as Options; // 정상
```

타입 단언을 사용해도 잉여 속성 체크를 수행하지 않는다.



### weak 타입

선택적 속성을 가지는 타입에도 잉여 속성 체크와 비슷한 동작이 수행된다.

```ts
interface LineChartOptions {
    logscale?: boolean;
    invertedYAxis?: boolean;
    areaChart?: boolean;
}
const opts = { logScale: true };
const o: LineChartOptions = opts; // error: 공통적 속성이 없다.
```

약한 타입에서는 **값 타입과 선안 타입에 공통된 속성이 있는지 별도의 체크를 수행한다.(공통된 속성 체크)**

잉여 속성 체크와 다르게 <u>약한 타입과 관련된 할당문마다 수행되어서</u>, 임시 변수를 사용 유무와 관계없이 항상 동작한다.



## 아이템12) 함수 표현식에 타입 적용하기

```ts
// 함수 문장
function rollDice1(sides: number): number { /* ... */ } 
// 함수 표현식
const rollDice2 = function(sides: number): number { /* ... */ } 
const rollDice3 = (sides: number): number => { /* ... */ } 
```

타입스크립트는 함수 문장과 표현식을 다르게 인식한다.

타입스크립트에서는 함수 타입을 선언하여 함수 표현식에 재사용할 수 있기 때문에 <u>문장 표현식을 사용하는 게 좋다.</u> 

```ts
type DiceRollFn = (sides: number) => number
const rollDice: DiceRollFn = sides => { /* ... */ }
```

예를 들어 라이브러리의 공통 콜백 함수는 타입 선언을 제공하는 것이 좋다.



### 시그니처가 일치하는 함수의 타입 적용

```ts
async function getQuote() {
    const response = await fetch('/aoute?by=Mark');
    const quote = await response.json();
    return quote;
}
```

이 함수는 잘 작동하는 것 같지만, 버그가 있다.

1. 만약 `/quote` 가 존재하지 않는 API일 경우에는 '404 Not Found' 가 감춰질 수 있다.(에러는 json 응답 형식이 아닐 수 있기 때문)
2. fetch가 실패할 경우 거절된 프로미스를 응답하지 않는다

#### 개선된 함수(fetch의 함수 타입을 이용)

```ts
// fetch 함수의 타입
declare function fetch(
    input: RequestInfo, init?: RequestInit
): Promise<Response>

async function checkedFetch(input: RequestInfo, init?: RequestInit) {
    const reponse = await fetch(input, init);
    if(!reponse.ok) {
        throw new Error('Request failed: ' + reponse.status)
    }
    return reponse;
}
```

동작은 같지만 함수 표현식으로 바꾸면 아래와 같다.

```ts
const checkedFetch: typeof fetch = async (input, init) => {
    const reponse = await fetch(input, init);
    if(!reponse.ok) {
        throw new Error('Request failed: ' + reponse.status)
    }
    return reponse;
}
```

함수의 배개변수에 타입 선언을 하는 것보다,
**<u>함수 표현식 전체 타입을 정의하는 것이 코드도 간결하고 안전하다.**</u>

다른 함수의 시그니처와 동일한 타입을 가지는 새 함수를 작성하거나, 동일한 타입 시그니처를 가지는 여러 개의 함수를 작성할 때는 **함수 전체의 타입 선언을 적용**해야 한다.



## 아이템13) 타입과 인터페이스의 차이점 알기

### 공통점

* 객체 리터럴의 잉여 속성 체크 수행

* 인덱스 시그니처 사용 가능

  ```ts
  type TDict = { [key: string]: string }
  interface IDict {
    [key: string]: string;
  }
  ```

* 함수 타입 정의

  ```ts
  type TFn = (x: number) => number;
  interface IFn {
    (x: number): number;
  }
  ```

* 추가적인 속성

  ```ts
  type TFnWithProps = {
    (x: number): number;
  	prop: string;
  }
  interface IFnWithProps {
    (x: number): number;
  	prop: string;
  }
  ```

* 제네릭 사용

  ```ts
  type TPair<T> = {
    first: T;
    second: T;
  }
  interface IPair<T> {
    first: T;
    second: T
  }
  ```

* 확장

  ```ts
  // 타입은 인터페이스를 확장
  type TStateWithPop = IState & { population: number }
  
  // 인터페이스는 타입을 확장
  interface IStateWithPop extends TState {
    population: number;
  }
  ```

* 클래스가 모두 구현 가능



### 차이점

* **인터페이스는 복잡한 타입(ex 유니온 타입)을 확장하지 못한다.** 

  ```ts
  interface VariableMap extends Input & Output { } // error
  ```

  하려면

  ```ts
  type Input = { /* ... */ }
  type Output = { /* ... */ }
  interface VariableMap {
    [name: string]: Input | Output
  }
  ```

  이렇게 확장할 수 있다.

  하지만 아래와 같은 타입은 인터페이스로 나타낼 수 없다.

  ```ts
  type NamedVariable = (Input | Output) & {name: string}
  ```

* **인터페이스는 보강(augment)가 가능하다**

  ```ts
  interface IState {
  	name: string;
    capital: string;
  }
  interface IState {
    population: number;
  }
  const wyoming: IState = {
    name: 'Whoming',
    capital: 'Cheyenne',
    population: 500000
  }; // 정상
  ```

  interface는 **선언 병합(declaration merging)이 가능**하다.

### 그래서 뭘 사용해야 하나?

* 타입이 복잡하다 -> 무조건 type
* 간단한 타입이다, 타입과 인터페이스로 둘 다 표현 가능하다 -> 일관성과 보강의 관점에서 고려
  * 인터페이스를 사용하고 있다? -> 인터페이스 / 타입을 사용하고 있다? -> 타입
  * 아직 스타일이 없다 -> 나중에 보강 가능성이 있는지 확인, 있다면 인터페이스
  * 프로젝트 내부에서 사용할 거라면 타입이 더 낫다. 내부적으로 사용되는 타입에 선언 병합이 발생하는 건 잘못된 설계
  * 선언 병합이 발생할 수 있는 api, 라이브러리는 인터페이스 사용



## 아이템14) 타입 연산과 제너릭 사용으로 반복 줄이기

코드를 DRY하게 쓰는 것은 익숙하지만, 타입에 대해서는 익숙하지 않다.

### 타입의 반복을 줄이는 방법

1. 타입에 이름을 붙이기
2. 중복되는 시그니처를 named typed으로 분리하기(item12)
3. 인터페이스는 extends, 타입은 intersection 연산자(&)로 확장하기

### 하나의 타입의 부분 집합으로 타입을 정의하기

```ts
interface State {
    userId: string;
    pageTitle: string;
    recentFiles: string[];
    pageContents: string;
}

// TopNavState는 State의 부분 집합이지만 따론 논다
interface TopNavState {
    userId: string;
    pageTitle: string;
    recentFiles: string[];
}
```

개선된 타입

```ts
type TopNavState = {
    userId: State['userId'];
    pageTitle: State['pageTitle'];
    recentFiles: State['recentFiles']
}
```

조금 더 개선하기(**mapped type**)

```ts
type TopNavState = {
    [k in 'userId'|'pageTitle'|'recentFiles']: State[k]
}
```

혹은 Pick 사용하기

```ts
type TopNavState = Pick<State, 'userId'| 'pageTitle'|'recentFiles'>
```

### tagged union에서 중복 제거하기

```ts
interface SaveAction {
    type: 'save',
    // ...
}
interface LoadAction {
    type: 'load',
    // ...
}
type Action = SaveAction | LoadAction;
type ActionType = 'save' | 'load';
```

개선된 ActionType

```ts
type ActionType = Action ['type']
```

### optional 매개변수 중복 제거하기

```ts
interface Options {
    width: number;
    height: number;
    color: string;
}
interface OptionalOptions {
    width?: number;
    height?: number;
    color?: string;
}
```

개선된 타입

```ts
type OptionalOptions = {[key in keyof Options]?: Options[key]}
```

혹은 partial 사용하기

```ts
type OptionalOptions = Partial<Options>
```

### 값의 형태에 해당하는 타입 정의

```ts
const INIT_OPTIONS = {
    width: 640,
    height: 480,
    color: 'tomato'
}
interface Options {
    width: number;
    height: number;
    color: string;
}
```

개선된 타입

```ts
type Options = typeof INIT_OPTIONS
```

### 함수나 메소드의 반환 값의 named type을 만들기

```ts
function getUserInfo(userId: string) {
  return {
    userId,
    name,
    name,
    age,
    height
  }
}
```

ReturnType 제네릭을 사용

```ts
type UserInfo = ReturnType<typeof getUserInfo>
```

### 제네릭 타입 === 타입을 위한 함수

제네릭 타입에서 매개변수를 제한할 수 있는 방법이 있어야 한다.
=> 이것이 바로 `extends`

```ts
interface Name {
    first: string;
    last: string;
}
type DancingDuo<T extends Name> = [T, T];

const couple1: DancingDuo<Name> = [
    {first: 'Fred', last: 'Astaires'},
    {first: 'Ginger', last: 'Rogers'}
]
```

#### Pick을 정의해보기

```ts
type MyPick<T, K> = {
    [k in K]: T[K]
} // error
```

K는 T와 무관하고 범위가 너무 넓다.

![image-20211112190121559](/Users/eun/Library/Application Support/typora-user-images/image-20211112190121559.png)

개선된 타입

```ts
type MyPick<T, K extends keyof T> = {
    [k in K]: T[K]
}
```



## 아이템15) 동적 데이터에 인덱스 시그니처 사용하기

### 인덱스 시그니처의 의미

* 키의 이름 : 키의 위치만 표시하는 용도, 타입 체커에서는 사용하지 않는다
* 키의 타입: string이나 number 또는 symbol의 조합이어야 한다. 보통은 string을 사용
* 값의 타입: 어떤 것이든 될 수 있다.

### 인덱스 시그니처의 단점

* 잘못된 키를 포함한 모든 키를 허용

  name과 Name이 구별 X

* 특정 키가 필요하지 않다.

  `{}` 도 유효한 Rocket타입

* 키마다 다른 타입을 가질 수 없음

  string과 number가 key type에 함께 있을 수 없다.

* 언어 서비스에 도움이 되지 못한다. 자동완성이 안됨

#### 그래서 동적 데이터를 표현할 때 사용한다.

CSV 파일 같은 경우 행과 열에 이름이 있고, 데이터 행을 열 이름값으로 매핑하는 객체로 나타내고 싶은 경우

보통 열의 이름은 미리 알지 못하기 때문에 인덱스 시그니처를 사용하고, 알고 있는 경우엔 미리 선언한 타입을 사용해야 한다.

#### 어떤 타입에 가능한 필드가 제한되어 있는 경우

인덱스 시그니처를 사용하면 안된다.

```ts
interface Row1 { [column: string]: number } // 너무 광범위
```

```ts
interface Row2 { a?: number; b?: number; c?: number; d: number;} // 최선
```

가장 정확하지만 사용하기엔 번거로움

```ts
type Row3 = 
	| {a: number;}
	| {a: number; b:number;}
	| {a: number; b:number; c: number;}
	| {a: number; b:number; c: number; d: number;}
```

### 인덱스 시그니처의 대안

1. Record 제너릭 타입

   ```ts
   // 동일한 타입
   type Vec3D = Record<'x'|'y'|'z', number>
   type Vec3D = {
     x: number;
     y: number;
     z: number;
   }
   ```

2. mapped type

   ```ts
   type Vec3D = {[k in'x'|'y'|'z']: number}
   type ABD= {[k in 'a'|'b'|'c': k extends 'b'? string: number]}
   ```

## 아이템16) number 인덱스 시그니처보다는 Array, 튜플, ArrayLike 사용하기

### 자바스크립트에서 객체의 키

자바스크립트에서 객체란 키/값 쌍의 모음이다.

파이썬이나 자바에서 볼 수 있는 '해시 가능' 객체라는 게 없고, 복잡한 객체를 키로 사용하려고 하면 `toString` 메소드가 호출되어 객체가 문자열로 변환된다.

```ts
x = {}
x[[1, 2, 3]] = 2
console.log(x) // { '1,2,3': 1}
```

특시 숫자는 키로 사용될 수 없다. 자바스크립트 런타임이 문자열로 변환한다.

```ts
console.log({1: 2, 3: 4}) // {'1': 2, '3': 4}
```

배열은 객체이기 때문에 숫자 index로 접근이 가능하지만 '1'과 같은 문자열로도 접근이 가능하다

```ts
x[1] === x['1']
```

Object.keys로 출력해보면 문자열이다.

```ts
Object.keys(x) // ['0', '1', '2']
```

### 타입스크립트에서 객체의 키

위의 혼란스러움을 방지하기 위해 숫자 키를 허용하고, 문자열 키와 다른 것으로 인식하게 한다. ECMAScript 표준이 서술하는 것처럼 문자열 키로 인식하기 때문에 number는 완전히 가상이라고 할 수 있지만, 타입 체크 시점에 오류를 잡을 수 있다.

배열 순회를 할 때 `for-in` 은 `for-of` 와 `for(;;)`보다 훨씬 느리다.

### 배열과 비슷한 형태의 ArrayLike 타입

```ts
function checkedAccess<T>(xs: ArrayList<T>, i: number): T{
  if(i < xs.length) {
    return xs[i];
  }
  throw new Error('배열의 끝을 지났음')
}
```

**하지만 이 경우에도 키는 여전히 문자열이다!**

## 아이템17) 변경 관련된 오류 방지를 위해 readonly 사용하기

객체를 수정하지 않는 함수에서는 매개변수를 `readonly` 접근제어자를 사용해야 한다.

readonly 배열과 기본형 배열의 차이

* 배열의 요소를 읽을 수 있지만, 쓸 수는 없다.
* length를 읽을 수 있지만, 바꿀 수 없다.
* 배열을 변경하는 pop을 비롯한 다른 메소드를 호출할 수 없다.

readonly 접근제어자를 사용할 경우

* 타입스크립트는 매개변수가 함수 내에서 변경이 일어나는지 체크한다.
* 호출하는 쪽에서는 함수가 매개변수를 변경하지 않는다는 보장을 받게 된다.
* 호출하는 쪽에서 함수에 readonly 배열을 매개변수로 넣을 수도 있다.

* 어떤 함수를 readonly로 만들면, 그 함수를 호출하는 다른 함수들도 모두 readonly로 만들어야 한다.



### readonly는 얕게 동작

객체에 readonly가 있을 경우 해당 객체를 직접 수정하는 것이 불가능하지 객체의 property를 수정하는 것은 가능하다.

```ts
const dates: readonly Date[] = [new Date()]
dates.push(new Date()); // error
dates[0].setFullYear(2048); // ok
```

### Readonly 제네릭 타입

readonly 접근제어자와 유사하게 객체에 적용되는 제네릭 타입

이 제네릭 타입도 얕게 동작하며 깊은 readonly 타입이 아니다.

```ts
interface Outer {
  inner: {
    x: number;
  }
}
const o: Readonly<Outer> = {inner: {x: 0}};
o.inner = { x: 1}; // error
o.inner.x = 1; // ok
```

### 인덱스 시그니처에 readonly

```ts
let obj: {readonly [k: string]: number } = {};
```

읽기는 허용하되 쓰기를 방지해서, 객체의 속성이 변경되는 것을 막을 수 있다.

### 아이템18) 매핑된 타입을 사용하여 값을 동기화하기

매핑된 타입은 한 객체가 도 다른 객체와 정확히 같은 속성을 가지게 할 때 이상적이다.

인터페이스에 새로운 속성을 추가할 때, 선택을 강제하도록 매핑된 타입을 고려해야 한다.

### 예시 | 산점도 그리기

```ts
interface ScatterProps {
    xs: number[];
    ys: number[];

    xRange: [number, number];
    yRange: [number, number];
    color: string;

    onClick: (x:number, y:number, index:number) => void;
}
```

1. 보수적 접근법(fail close 접근법)

   새로운 속성이 추가되면 함수는 값이 변경될 때마다 차트를 다시 그린다.

   정확하지만 너무 자주 그려질 가능성이 있다.

   ```ts
   function shouldUpdates(oldProps: ScatterProps, newProps: ScatterProps) {
       let k: keyof ScatterProps;
       for(k in oldProps) {
           if(oldProps[k] !== newProps[k]) {
               if(k !== 'onClick') return true;
           }
       }
       return false;
   }
   ```

2. fail open 접근법

   차트를 불필요하게 다시 그리는 단점은 해결했지만, 실제로 차트를 다시 그려야 할 경우에 누락되는 경우가 있을 수 있다.

   ```ts
   function shouldUpdates(oldProps: ScatterProps, newProps: ScatterProps) {
       return {
           oldProps.xs !== newProps.xs ||
           oldProps.ys !== newProps.ys ||
           oldProps.xRange !== newProps.xRange ||
           oldProps.yRange !== newProps.yRange ||
           oldProps.color !== newProps.color
           // {no check for onClick}
       }
   }
   ```

3. 새로운 속성이 추가될 때 shouldUpdate를 직접 수정

   ```ts
   interface ScatterProps {
       xs: number[];
       ys: number[];
   
       xRange: [number, number];
       yRange: [number, number];
       color: string;
   
       onClick: (x:number, y:number, index:number) => void;
    		// 여기에 속성을 추가하려면, shouldUpdate를 수정하세요!
   }
   ```

4. mapped type로 타입체커가 대신 동작하게 하기

   새로운 속성을 추가하게 되면, REQUIRES_UPDATE 의 정의에 오류가 발생한다.

   ```ts
   const REQUIRES_UPDATE: {[k in keyof ScatterProps]: boolean } = {
       xs: true,
       ys: true,
       xRange: true,
       yRange: true,
       color: true,
       onClick: false
   }
   
   function shouldUpdates(oldProps: ScatterProps, newProps: ScatterProps) {
       let k: keyof ScatterProps;
       for(k in oldProps) {
           if(oldProps[k] !== newProps[k] && REQUIRES_UPDATE[k]) {
               return true;
           }
       }
       return false;
   }
   ```

   































































