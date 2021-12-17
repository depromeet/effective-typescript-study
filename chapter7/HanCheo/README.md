# 7주차

> [아이템 49. 콜백에서 this에 대한 타입제공하기](#아이템-49-콜백에서-this에-대한-타입제공하기)  
> [아이템 50. 오버로딩 타입보다는 조건부 타입 사용하기](#아이템-50-오버로딩-타입보다는-조건부-타입-사용하기)  
> [아이템 51. 의존성 분리를 위해 미러 타입 사용하기](#아이템-51-의존성-분리를-위해-미러-타입-사용하기)  
> [아이템 52. 테스팅 타입의 함정에 주의하기](#아이템-52-테스팅-타입의-함정에-주의하기)  
> [아이템 53. 타입스크립트 기능보다는 ECMAScript 기능을 사용하기](#아이템-53-타입스크립트-기능보다는-ecmascript-기능을-사용하기)  
> [아이템 54. 객체를 순회하는 노하우](#아이템-54-객체를-순회하는-노하우)  
> [아이템 55. DOM 계층 구조 이해하기](#아이템-55-dom-계층-구조-이해하기)  
> [아이템 56. 정보를 감추는 목적으로 private 사용하지 않기](#아이템-56-정보를-감추는-목적으로-private-사용하지-않기)

## 아이템 49. 콜백에서 this에 대한 타입제공하기

let과 const가 `렉시컬 스코프`인 반면 자바스크립트의 this는 `다이나믹 스코프`로 호출하는 객체에 따라 그 의미가 변경된다. 따라서 this는 계속 변경될 수 있는 것으로 타입 을 미리 설정을 해두지 않는다면 추후에 혼란이 올 수 있다.

### 클래스에서 this 바인딩하기

예를 들어 아래 `onClick`의 코드는 this를 계속해서 변경시킬수 있는 코드이다. 따라서 바인딩을 해주어야하는데 그 방법을 알아보자

```javascript
class ResetButton {
  render() {
    return makeButton({text: 'Reset', onClick: this.onClick})
  }
  onClick() { //onClick를 호출하는 객체마다 다른 값을 받아오므로 바인딩을 시켜주어야 한다.
    alert(`Reset ${this}`)
  }
}

//constructor에 바인딩 하기
class ResetButton {
  consturctor() {
    this.onClick = this.onClick.bind(this);
  }
  render() {
    return makeButton({text: 'Reset', onClick: this.onClick})
  }
  onClick() {
    alert(`Reset ${this}`)
  }
}


//Arrow function으로 변경하여 바인딩 하기
class ResetButton {
  render() {
    return makeButton({text: 'Reset', onClick: this.onClick})
  }
  onClick = () => {
    alert(`Reset ${this}`)
  }
}

//실재 동작 코드
class ResetButton {
  constructor() {
    var _this = this;
    this.onClick = function () {
      alert("Reset " + _this);
    };
  }
  render( {
    return makeButton({text: 'Reset', onClick: this.onClick});
  })
}
```

### 함수사용에서 매개변수에 this를 추가하여 this 체크하기

굉장히 간단한 방법으로 this의 타입체크 문제를 해결하고 있다.

```typescript
function addKeyListener(el: HTMLElement, fn: (this: HTMLElement, e: KeyboardEvent) => void) {
  el.addEventListener('keydown', (e) => {
    fn(el, e); //Expected 1 arguments, but got 2.
  });
}

function addKeyListener(el: HTMLElement, fn: (this: HTMLElement, e: KeyboardEvent) => void) {
  el.addEventListener('keydown', fn); // 자동적으로 fn 함수에 this와, keyevent가 인자로 추가된다.
}

declare let el: HTMLElement;
addKeyListener(el, function (e) {
  this.innerHTML; // this is HTMLElement
}); // pass
```

타입스크립트에서 `this`를 매개변수로 추가하는 경우 자동적으로 인자 호출하는 부분에서 자동적으로 만들어지기 때문에 새롭게 추가해 줄 필요가 없다.

> 콜백 함수에서 this를 사용하게된다면 this에 대한 타입정보를 꼭 명시하자

## 아이템 50. 오버로딩 타입보다는 조건부 타입 사용하기

반환타입이 유연한 경우 오버로딩, 제네릭보다는 조건부 타입설정을 사용하자

```typescript
function double(x) {
  return x + x;
}

/**함수 오버로딩*/
function double(x: number | string): number | string;
function double(x: any) {return x + x};

//Warring 반환타입이 고정으로 number나 string임에도 불구하고 유니온타입으로 도출됨
const num = double(12); // string | number;
const str = double('x'); // string | number;

/**제네릭 사용*/
function double<T extends number | string>(x: T): T;
function double(x: any) {return x + x};

//Warring 반환타입이 너무 자세해지고 틀려짐
const num = double(12); // 12 => 24로 나와야함
const str = double('x'); // x => xx로 나와야함

/** 여러가지 타입 선언 분리 */
function double(x:number): number;
function double(x:string): string;
function double(x: any) {return x + x};

//pass
const num = double(12); // number
const string = double('x') // string

//하지만 유니온 타입으로 호풀하는 경우 타입에러 발생
function f(x: number | string) {
  return double(x);
  // Argument of type 'string | number' is not assignable to parameter of type 'number'.
  // Argument of type 'string | number' is not assignable to parameter of type 'string'.
}

/** 조건부 타입으로 설정하기 */
function double<T extends number | string> {x : T}: T extends string ? string : number;
function double(x: any){ return x * x };

//pass
const num = double(12); // number
const string = double('x') // string
//pass
function f(x: number | string) {
  return double(x);
}
```

> 오버로딩이나 단순 제네릭을 사용하는것보다 조건부 타입을 이용하는 것이 휠씬 간단하고 추가적인 오버로딩 없이 유니온 타입을 지원 가능하다
>
> 조건부 타입 알아두자

## 아이템 51. 의존성 분리를 위해 미러 타입 사용하기

csv를 파싱하는 함수가 있다고 한다면 다음과 같이 코드를 짤 수 있다

```typescript
function parseCSV(contents: string | Buffer): { [column: string]: string }[] {
  if (typeof contents === 'object') {
    //버퍼인 경우
    return parseCSV(contents.toString('utf8'));
  }
  // ...
}
```

여기서 Buffer의 타입은 NodeJS의 타입으로  
`npm install --save-dev @types/node` 를 이용하여 얻을수 있다.  
하지만 `@types/node`가 필요하지 않는 집단에게는 Buffer 하나 때문에 `@types/node`를 설치하기에는 혼란스러움이 있다.

이런 경우에는 실제 필요한 선언부만 추출하여 라이브러리에 넣는 것을 고려해 볼 수 있다.

```typescript
interface CsvBuffer {
  toString(encoding: string): string; //parseCSV에서는 toString만 사용하고 있음.
}
function parseCSV(contents: string | CsvBuffer): { [column: string]: string }[];
```

> 위와 같이 별도로 선언하여 구조적 타이핑을 사용하도록 한다.
>
> **공개한** 라이브러리를 사용하는 자바스크립트 사용자가 **@type 의존성**을 가지지 않게 해야한다. 웹 개발자가 NodeJS 관련된 의존성을 가지지 않게 해야한다.

## 아이템 52. 테스팅 타입의 함정에 주의하기

map 함수의 타입선언을 작성한다고 가정한다면

```typescript
declare function map<U, V>(array: U[], fn: (u: U) => V): V[];
```

위처럼 짤수 있고 이를 확인하기 위해서는 테스트 코드르 확인해야한다.

```typescript
map(['2017', '2018', '2019'], (v) => Number(v));
```

위 테스트 코드에서 문제점을 찾는다면 매개변수에 대한 타입은 체킹을 할수 있다. 그렇지만 매개변수에 단일값 또는 배열이 아닌 것이 온다면 매개변수의 오류는 잡을수 있지만 **반환 값에 대한 검증**은 따로 하지 않기 때문에 완전한 테스트가 아니다.  
다음과 같은 코드라고 생각하면된다.

```javascript
test('square a number', () => {
  square(1);
  square(2);
});
// expect와 같이 검증 로직을 사용하지 않았기 때문에 square함수의 테스트는 통과하게된다.
```

그렇다면 반환값을 특정 타입의 변수에 할당하여 간단히 반환타입을 체크해보자

```typescript
const lengths: number[] = map(['jone', 'paul'], (name) => name.length);
```

위 코드에서 `number[]` 는 일반적으로 `불필요한 타입선언`에 해당된다. 그러나 `테스트 코드 관점` 으로는 매우 중요한 역할을 하고 있다. 그러나 테스팅을 위해 할당을 사용하는 것은 2가지 문제가 있다.

1. 불필요한 변수를 만들어야 한다.

   -> 변수를 도입하는 대신 헬퍼 함수를 정의하자

   ```typescript
   function assertType<T>(x: T) {}
   assertType<number[]>(map(['jone', 'paul'], (name) => name.length)); //pass
   assertType<number[]>(map(['jone', 'paul'], (name) => name)); //error : Argument of type 'string[]' is not assignable to parameter of type 'number[]'.
   ```

   불필요한 변수를 해결할 수 있지만 다른 문제점이 있다.

2. 타입이 동일한지 체크를 하는 것이아닌 할당 가능을 체크하는 것이다.

   -> 예를들어 n의 경우는 12를 검증해야하는데 number를 검증하여 할당 가능한지 보고 통과시켜버린다.

   ```typescript
   const n = 12; // type: 12
   assertType<number>(n); // pass
   ```

   또 객체의 타입을 체크하는 경우를 살펴보면 문제를 확인 할 수 있다.

   ```typescript
   const beatles = ['john', 'paul', 'georage', 'ringo'];
   assertType<{ name: string }[]>(map(beatles, (name) => ({ name, inYellowSubmarine: name === 'ringo' }))); // pass
   ```

   바로 보이겠지만 name이 있다면 할당가능하여 통과되고 `inYellowSubmarine` 은 체킹 하지 않는다. 또한 함수의 경우도 동일하다.

   ```typescript
   const add = (a: number, b: number) => a + b;
   assertType<(a: number, b: number) => number>(add);

   const double = (x: number) => 2 * x;
   assertType<(a: number, b: number) => number>(double); //pass
   ```

   `double`에도 `a` 라는 값 하나만 있어도 동작이 되는 함수이기 때문에 통과되는것을 볼 수 있다.

### 그렇다면 올바른 타입 체킹하는 방법은 무엇일까?

`Parameters`와 `ReturnType`을 제너릭 타입을 이용해 분리하여 테스트 할 수 있다.

```typescript
const double = (x: number) => 2 * x;
let p: Parameters<typeof double> = null;

assertType<[number, number]>(p);
// Argument of type '[x: number]' is not assignable to parameter of type '[number, number]'.

let r: ReturnType<typeof double> = null;

const double = (x: number) => 2 * x;
let p: Parameters<typeof double> = null;

assertType<[number, number]>(p);
// Argument of type '[x: number]' is not assignable to parameter of type '[number, number]'.

let r: ReturnType<typeof double> = null;
assertType<number>(r); // pass
```

> `this`를 사용 하는 콜백함수에도 다른 문제를 발견할 수 있다. this 또한 타입 선언으로 모델링 할수 있으므로 타입 선언에 반영해야하며 테스트도 해야한다.

### 함세 세부사항 테스트 하기

```typescript
assertType<number[]>(map(
	beatles,
  function(name, i, array) {
    // Parameter 'name, i, array' implicitly has an 'any' type.
    assertType<string>(name);
    assertType<number>(i);
    assertType<string[]>(array);
    assertType<string[]>(this);
    //'this' implicitly has type 'any' because it does not have a type annotation.
    // ...
  }
))

//함수 타입 선언을 변경하여 해결
declare function map<U, V>(
  array: U[],
  fn: (this: U[], u: U, i: number, array: U[])) => V
): V[];

```

### dtslint 사용하기

DefinitelyTyped 선언을 위한도구로 주석틀 통해 동작한다 dtslint를 사용하면 위 예제 테스트를 다음처럼 작성이 가능하다

```typescript
const beatles = ['john', 'paul', 'georage', 'ringo'];
map(
  beatles,
  function (
    name, // $ExpectType string
    i, // $ExpectType number
    array // $ExpectType string[]
  ) {
    this; // $ExpectType string[]
    return name.length;
  }
); // $ExpectType number[]
```

dtslint는 할당 가능성 대신 각 심벌의 타입을 추출하여 글자가 같은지 비교한다. 이 비교과정은 편집기에서 타입 선언을 눈으로 보고 확인하는 것과 같은데 dtslint는 이를 자동화한다. 하지만 `number|string` 과 `string|number`를 다르게 인식함으로 주의해야한다.

> 타입을 테스트 할 때는 특히 함수 타입의 동일성과 할당 가능성의 차이점을 알고 있어야한다.
>
> 콜백이 있는 함수를 테스트할 때, 콜백 매개변수의 추론된 타입을 체크해야한다. 또한 this가 API의 일부분이라면 테스트해야한다.
>
> 타입 관련된 테스트에서 any를 주의해야한다. 엄격한 테스트를 위해 dtslint같은 도구를 사용하자.

# 7장 코드를 작성하고 실행하기

## 아이템 53. 타입스크립트 기능보다는 ECMAScript 기능을 사용하기

### 타입공간과 값 공간의 경계를 혼란스럽게 만들지 말기

### `enum` 열거 형

```typescript
enum Flavor {
  VANILLA = 0,
  CHOCOLATE = 1,
  STRAWBERRY = 2,
}

let flavor = Flavor.CHOCOLATE; // type: Flavor
Flavor; // 자동완성 : VANILLA, CHOCOLATE, STRAWBERRY;
Flavor[0]; // VANILLA
```

특징

1. 숫자 열거형(예제의 Flavor)에 0, 1, 2외의 다른 숫자가 할당되면 매우 위험하다. (enum은 비트 플래그 구조를 표현하기 위해 설계되었으므로 어떤 결과를 나타낼지 모른다);

2. 상수 열거형은 보통의 열거형과 달리 런타임에 완전히 제거된다. 위 예제를 const enum Flavor로 바꾸면 컴퍼일러는 `Flavor.CHOCOLATE`를 0으로 바꿔버린다. 문자열과 숫자형 열거형은 전혀 다른 동작을 한다.

3. `preserveConstEnums` 플래그를 설정한상태의 상수 열거형은 보통의 열거형 처럼 런타임 코드에 상수 열거형 정보를 유지한다.

4. 문자열 열거형은 런타임의 타입 안전성과 투명성을 제공한다. 그러나 타입스크립트의 다른 타입과 달리 구조적 타이핑이 아닌 명목적 타이핑을 사용한다.

   ```typescript
   enum Flavor {
     VANILLA = 'vanilla',
     CHOCOLATE = 'chocolate',
     STRAWBERRY = 'strawberry',
   }
   let flavor = Flavor.CHOCOLATE; //type Flavor
   flavor = 'strawberry'; // error: Type '"strawberry"' is not assignable to type 'Flavor'.

   function scoop(flavor: Flavor) {
     /*...*/
   }
   scoop('vanilla'); // 자바스크립트에서는 정상 but typescript에서는 error
   //Argument of type '"vanilla"' is not assignable to parameter of type 'Flavor'.
   scoop(Flavor.VANILLA); //typescript에서 사용방법
   ```

   위처럼 자바스크립트, 타입스크립트에서의 동작이 달라 되도록 사용하지 말자.

### 매개변수 속성

일반적으로 클래스를 초기화할 때 속성을 할당하기 위해 생성자의 매개변수를 사용한다.

```typescript
class Person {
  name: string;
  constructor(name: string) {
    this.name: name;
  }
}

// 간결한 타입스크립트 문법 매개변수 속성 이용
class Person {
  constructor(public name: string) {}
}
```

`public name`이 매개변수 속성이라 불리며 처음 작성한 코드와 동일하게 동작한다.

문제점

1. 일반적으로 타입스크립트 컴파일은 타입 제거가 이루어지므로 코드가 줄어들지만, 매개변수 속성은 코드가 늘어나는 문법이다
2. 매개변수 속성이 런타임에는 실재로 사용되지만 , 타입스크립트 관점에서는 사용되지 않는 것처럼 보인다.
3. 매개변수 속성과 일반 속성을 섞어서 사용하면 클래스의 설계가 혼란스러워진다.

```typescript
class Person {
  first: string;
  last: string;
  constructor(public name: string) {
    [this.first, this.last] = nams.split(' ');
  }
}
```

`Person` 클래스에는 `name, first, last` 세가지 속성이 있지만 first, last는 속성이고 name은 매개변수 속성으로 일관적이지 않다. 클래스에 매개변수 속성만 존재한다면 클래스 대신 인터페이스로 만들고 객체 리터럴을 사용하는 것이 좋다. but 구조적 타이핑 특성때문에 다음처럼 할당할 수 있다는 것을 주의해야 한다.

```typescript
class Person {
  constructor(public name: string) {}
}
const p: Person = { name: 'Jed Bartlet' }; //pass
```

매개변수 속성은 찬반 논란이 있지만 일반속성과 매개변수 속성을 동시에 사용하면 설계가 혼란스러워지기 때문에 한가지만 사용하느것이 좋다.

### 네임스페이스와 트리플 슬래시 임포트

`module` 키워드를 사용하다가 `ECMAScript 2015`에서 `module`를 사용하자 `module`과 동일한 기능을하는 `namespace`를 추가했다.

```typescript
namespace foo {
  function bar() {}
}
/// <reference path="other.ts" />
foo.bar();
```

`module`과 `///`는 호환성을 위해 남아있는 것이므로 사용하지말자 `import export` 를 사용하자

### 데코레이터

클래스, 메서드, 속성에 애너테이션을 붙이거나 기능을 추가하는데 사용한다. 예를 들어, 클래스의 메서다가 호출될때마다 로그를 남기려면 `logged` 애너테이션을 정의 할수 있다.

```typescript
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  @logged
  greet() {
    return 'Hello, ' + this.greeting;
  }
}
function logged(target: any, name: string, descriptor: PropertyDescriptor) {
  const fn = target[name];
  descriptor.value = function () {
    console.log(`Calling ${name}`);
    return fn.apply(this, arguments);
  };
}

console.log(new Greeter('Dave').greet());
//출력;
//Calling greet
//Hello, Dave
```

데코레이터는 앵귤러를 지원하기 위해 추가되었다. `experimentalDecorators` 속성을 설정하고 사용해아한다.비 표준이기 때문에 바뀌거나 호환성이 깨질 가능성이 있으므로 앵귤러를 사용하거나 애너테이션이 필요한 프레임워크를 사용하고 있는 것이 아니라면 표준이 되기전까지 사용하지 않는 것이 좋다.

> 일반적으로 타입스크립트 코드에서 모든 타입정보를 제거하면 자바스크립트가 되지만, 열거형, 매개변수 속성, 트립플 슬래시 임포트, 데코레이터는 타입 정보를 제거한다고 자바스크립트가 되지는 않는다.
>
> 타입스크립트의 역할을 명확하게 하려면 열거형, 매개변수 속성, 트리플 슬래시 임포트, 데코레이터는 사용하지 않는 것이 좋다.

## 아이템 54. 객체를 순회하는 노하우

일반 적으로 객체의 경우 확장 가능성을 내포하고 있으므로 객체를 순화핼때 오류가 자주 발생한다.

```typescript
const obj = {
  one: 'uno',
  two: 'dos',
  three: 'tres',
};
for (const k in obj) {
  const v = obj[k];
  // 암시적 any로 설정됨.
}
// 해결 방안
let k: keyof typeof obj;
for (const k in obj) {
  const v = obj[k]; // pass
}
```

> 객체를 순회할 때 키가 어떤 타입인지 정확히 파학하고 있다면 `let k: keof T; for-in` 루프를 사용하자.
>
> 객체를 순회하며 키와 값을 얻는 가장 일반적인 방법은 Object.entries이다.
>
> 객체를 다룰 때에는 Prototype 오염의 가능성을 항상 염두에 두고 생각하자

## 아이템 55. DOM 계층 구조 이해하기

| 타입                                      | 예시                         |
| ----------------------------------------- | ---------------------------- |
| EventTarget                               | Window, XMLHttpRequest       |
| Node                                      | document, Text, Comment      |
| Element                                   | HTMLElement, SvgElement 포함 |
| HTMLElement                               | `<i>`, `<b>`                 |
| HTMLButtonElement \| HTMLParagraphElement | `<button>` \| `<p>`          |

추상화 된 순서이다. EventTarget은 하위 모든 타입을 추상화 하였으므로 타입스크립트에서 사용시 타입 검증을 진행해야한다.

DOM과 관련해서는 타입스크립트보다 사용자가 더 정확히 알고 있으므로 단언문을 사용해도 좋다.

| 타입          | 설명                                 |
| ------------- | ------------------------------------ |
| Event         | 가장 추상화된 이벤트                 |
| UIEvent       | 모든 종류의 사용자 인터페이스 이벤트 |
| MouseEvent    | 마우스 이벤트                        |
| TouchEvent    | 모바일 기기의 터치 이벤트            |
| WheelEvent    | 스크롤 휠을 돌려 발생하는 이벤트     |
| KeyboardEvent | 키 누름 이벤트                       |

> Node, Element, HTMLElemnet, EventTarget 간, Event, MouseEvent등의 차이점에대해서 알아야한다.
>
> DOM 엘리먼트와 이벤트에는 충분히 구체적인 타입 정보를 사용하거나, 타입스크립트가 추론 할 수 있도록 문맥정보를 활용해야한다.

## 아이템 56. 정보를 감추는 목적으로 private 사용하지 않기

타입스크립트에서는 `public, protected, private` 접근 제어자를 사용해서 공개 규칙을 강제할 수 있다. 다만 이것은 타입스크립트에 한정되므로 타입스크립트에서 `private`으로 설정하여도 실제 자바스크립트코드에서는 접근이 가능하다.

```typescript
class Diary {
  private secret = 'cheated on my English test';
}
const diary = new Diary();
diary.secret; //error
//Property 'secret' is private and only accessible within class 'Diary'.

// 변환
class Diary {
  constructor() {
    this.secret = 'cheated on my English test';
  }
}
const diary = new Diary();
diary.secret; // pass
```

### 변수름 감추는 방법

1. closer 사용하기

2. 표준화가 진행중인 #를 이용하여 감추기

   ```javascript
   class PasswordChecker {
     #passwordHash;
     /*...*/
   }
   ```

   `#passwordHash` 성은 클래스 외부에서 접근이 불가능하다. 클로저 기법과 다르게 클래스 메서드나 동일한 클래스의 개별 인스턴스끼리 접근이 가능하다. 즉 내부 함수가 중복적으로 생성이 되지 않으므로 좀더 효율적인 코드 작성이 가능하다. 비공개 필드를 지원하지 않는 자바스크립트 버전으로 컴파일하게되면, `WeapMap`을 사용한 구현으로 대체되고, 구현방식과 무관하게 데이터는 동일하게 비공개로 된다.

   > public, protected, private 접근 제어자는 타입 시스템에서만 강제될 뿐이다. 런타임에는 소용이 없으며 단언문을 통해 우회도 가능하다. 접근 제어자로 데이터를 감추려고 하지말자.
   >
   > 확실히 데이터를 감추고 싶다면 클로저를 이용하자.
