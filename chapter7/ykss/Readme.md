## 아이템 49 : 콜백에서 this에 대한 타입 제공하기

자바스크립트에서 `this`는 다이나믹 스코프이다. 그렇기 때문에 정의된 방식이 아닌 호출된 방식에 따라 달라진다. 

```typescript
class C {
  vals = [1, 2, 3];
  logSquares() {
    for (const val of this.vals) {
      console.log(val * val);
    }
  }
}
const c = new C();
const method = c.logSquares;
method(); // undefined의 'vals' 속성을 읽을 수 없습니다.
```

위에서 `c.logSquares()`는 실제로 두 가지 작업을 수행하는데, `C.prototype.logSquares`를 호출하고, `this`의 값을 `c`로 바인딩한다. 위에서는 `this`를 `undefined`로 바인딩한것이다. 자바스크립트에서는 이런 경우에 `call`메서드를 사용하여 `this`를 명시적으로 바인딩하여 문제를 해결할 수 있다.

```typescript
const c = new C();
const method = c.logSquares;
method.call(c);  // Logs the squares again
```



라이브러리들은 API의 일부에서 `this`를 사용할 수 있도록 한다. 그리고 `this` 바인딩은 주로 콜백 함수에서 사용한다. 콜백 함수의 매개변수에 `this`를 추가하면 `this` 바인딩이 체크되기 때문에 실수를 방지할 수 있다.

```typescript
declare function makeButton(props: {text: string, onClick: () => void }): void;
function addKeyListener(
  el: HTMLElement,
  fn: (this: HTMLElement, e: KeyboardEvent) => void
) {
  el.addEventListener('keydown', e => {
    fn.call(el, e);
  });
}
```

콜백 함수에서 `this`를 사용해야 하면 `this`는 API의 일부가 되는 것이기 때문에 반드시 타입 선언에 포함해야 한다.

### 요약

- `this` 바인딩이 동작하는 원리를 이해해야 한다.
- 콜백 함수에서 `this`를 사용해야 하면, 타입 정보를 명시해야 한다.



## 아이템 50 : 오버로딩 타입보다는 조건부 타입을 사용하기

```typescript
// (1)
function double(x: number|string): number|string;
function double(x: any) { return x + x; }
const num = double(12);  // string | number
const str = double('x');  // string | number
// (2)
function double<T extends number|string>(x: T): T;
function double(x: any) { return x + x; }
const num = double(12);  // Type is 12
const str = double('x');  // Type is "x"
// (3)
function double(x: number): number;
function double(x: string): string;
function double(x: any) { return x + x; }
const num = double(12);  // Type is number
const str = double('x');  // Type is string
```

위 예시는 `string` 또는 `number`를 매개변수로 받는 `double` 함수를 다양한 형태로 구현한 것이다. (1) 부분은 union 방식으로 구현했지만 `number`를 넣었을 때, `string`을 반환하는 것도 가능하다. (2)은 제너릭을 통해 구현한 것인데, 타입이 너무 과하게 구체적이다. `string`을 넘기면 `string`으로 반환되어야 하는데, `'x'`로 반환된다. (3) 부분은 오버로딩 타입을 통해 구현한 것으로, 타입스크립트의 함수 구현체는 하나이나, 타입 선언은 몇개든 할 수 있다는 특징을 이용한 것이다. 하지만 유니온 타입 관련해서는 여전히 문제가 될 수 있다.

```typescript
function double<T extends number | string>(
  x: T
): T extends string ? string : number;
function double(x: any) { return x + x; }
```

추가적인 오버로딩을 추가할 수도 있지만 가장 좋은 것은 위처럼 조건부 타입(conditional type)을 사용하는 것이다. JS의 삼항 연산자 처럼 사용할 수 있다. 오버로딩이 작성하기 더 쉽지만 조건부 타입은 개별 타입의 유니온으로 일반화하기 때문에 타입이 더 정확해 진다.

### 요약

- 오버로딩 타입보다 조건부 타입을 사용하는 것이 좋다. 조건부 타입은 추가적인 오버로딩 없이 유니온 타입을 지원한다.



## 아이템 51 : 의존성 분리를 위해 미러 타입 사용하기

`@types/node`와 같은 라이브러리에 의존하는 경우, @types와 무관한 자바스크립트 개발자와 NodeJS와 무관한 타입스크립트 웹 개발자에게는 사용하지 않는 모듈이 포함되어야 하기 때문에 혼란스러울 수 있다. 이러한 상황에서 필요한 메서드와 속성만 별도로 작성해서 사용할 수 있는데, 그것을 미러링(mirroring)이라고 한다. 다시 말하면 필요한 선언부만 라이브러리에서 추출하여 작성 중인 라이브러리에 넣는 것을 말한다.

### 요약

- 필수가 아닌 의존성을 분리할 때는 구조적 타이핑을 사용하면 된다.
- 공개한 라이브러리를 사용하는 자바스크립트 사용자가 @types 의존성을 가지지 않게 해야 한다. 그리고 웹 개발자가 NodeJS 관련된 의존성을 가지지 않게 해야 한다.



## 아이템 52 : 테스팅 타입의 함정에 주의하기

프로젝트를 공개하려면 테스트 코드 작성은 필수적이고, 타입 선언도 테스트를 거쳐야 한다. 하지만 타입 선언을 테스트하기는 어렵다. 타입 선언이 예상한 타입으로 결과를 내는지 체크하려면 함수를 호출하는 테스트 파일을 작성하는 방법이 있다. 일반적으로는 반환 값에 대한 체크까지는 어려운 경우가 많다. 그래서 반환 타입을 명시적으로 표시하는 경우, 불필요한 타입선언으로 볼 수 있지만, 테스트 코드 관점에서는 중요한 역할을 하고 있다고 할 수 있다.

```typescript
const square = (x: number) => x * x;
declare function map<U, V>(array: U[], fn: (u: U) => V): V[];
const lengths: number[] = map(['john', 'paul'], name => name.length);
```

테스팅을 위해 할당을 사용하는 방법에는 두 가지 문제가 있다.

1. 불필요한 변수를 만들어야 한다. 반환값을 할당하는 변수는 샘플 코드처럼 쓰일 수 있지만, 일부 린팅 규칙(미사용 변수 경고)를 비활성 해야한다.

   - 이 때는 헬퍼 함수를 정의하는 방식으로 해결할 수 있다.

     ```typescript
     function assertType<T>(x: T) {}
     assertType<number[]>(map(['john', 'paul'], name => name.length));
     ```

2. 두 타입이 동일한지 체크하는 것이 아니라 할당 가능성을 체크하고 있다.

제대로 `assertType` 를 사용하려면, `Parameters`와 `ReturnType` 제너릭 타입을 사용해서 함수의 매개변수 타입과 반환 타입만 분리하여 테스트 하는 것이다.

```typescript
const square = (x: number) => x * x;
declare function map<U, V>(array: U[], fn: (u: U) => V): V[];
function assertType<T>(x: T) {}
const double = (x: number) => 2 * x;
let p: Parameters<typeof double> = null!;
assertType<[number, number]>(p);
//                           ~ Argument of type '[number]' is not
//                             assignable to parameter of type [number, number]
let r: ReturnType<typeof double> = null!;
assertType<number>(r);  // OK
```

`DefinitelyTyped`의 타입 선언을 위한 도구는 `dtslint`인데, 특별한 형태의 주석을 통해 동작한다. 하지만 글자 자체가 같은지 비교하는 방식때문에 `number|string`과 `string|number`를 다른 타입으로 인식하는 등의 문제가 있다.

```typescript
declare function map<U, V>(
  array: U[],
  fn: (this: U[], u: U, i: number, array: U[]) => V
): V[];
const beatles = ['john', 'paul', 'george', 'ringo'];
map(beatles, function(
  name,  // $ExpectType string
  i,     // $ExpectType number
  array  // $ExpectType string[]
) {
  this   // $ExpectType string[]
  return name.length;
});  // $ExpectType number[]
```

### 요약

- 타입을 테스트할 때는 특히 함수 타입의 동일성(equality)와 할당 가능성(assignability)의 차이점을 알아야 한다.
- 콜백이 있는 함수를 테스트할 때, 콜백 매개변수의 추론된 타입을 체크해야 한다. 또한 `this`가 API의 일부분이라면 역시 테스트해야 한다.
- 타입 관련된 테스트에서 `any`를 주의해야 한다. 더 엄격한 테스트를 위해 `dtslint` 같은 도구를 사용하는 것이 좋다.



# 7장. 코드를 작성하고 실행하기



## 아이템 53 : 타입스크립트 기능보다는 ECMAScript 기능을 사용하기

자바스크립트가 초기에 결함이 많고 개선 사항이 많았기에 타입스크립트도 초기 버전에서는 독립적으로 개발한 클래스, 열거형(enum), 모듈 시스템을 포함시켜서 개발했다. 아직까지 남아있는 몇 가지 기능들이 있는데, 이 기능 들은 타입 공간과 값 공간의 경계를 혼란 스럽게 만들기 때문에 피하는 것이 좋다.

#### 열거형(enum)

타입스크립트의 열거형은 몇 가지 문제가 있다. 

- 숫자 열거형에 0,1,2 외에 다른 숫자가 할당되면 위험하다.
- 상수 열거형은 보통의 열거형과 달리 런타임에 완전히 제거된다.(`const` 사용 시)
- `preserveConstEnums` 플래그를 설정한 상태의 상수 열거형은 보통 열거형처럼 상수 열거형 정보를 유지한다.
- 문자열 열거형은 런타임의 타입 안정성과 투명성을 제공한다. 하지만 다른 타입과 달리 명목적 타이핑을 사용한다.

JS와 TS에서 동작이 다르기 때문에 문자열 열거형은 사용하지 않는게 좋다. 대신 리터럴 타입의 유니온을 사용하면 된다.

```typescript
type Flavor = 'vanilla' | 'chocolate' | 'strawberry';

let flavor: Flavor = 'chocolate';  // OK
    flavor = 'mint chip';
 // ~~~~~~ Type '"mint chip"' is not assignable to type 'Flavor'
```

#### 매개변수 속성

```typescript
class Person {
  constructor(public name: string) {}
}
```

위의 `public name`은 매개변수 속성이라고 불리고 멤버 변수로 선언한 것과 동일하게 동작한다. 하지만 매개변수 속성과 관련된 문제점도 존재한다.

- 일반적으로 TS 컴파일은 타입 제거가 되어 코드가 줄어들지만, 매개변수 속성은 코드가 늘어난다.
- 매개변수 속성이 런타임에 실제로 사용되나, TS 관점에서는 사용되지 않는 것처럼 보인다.
- 매개변수 속성과 일반 속성을 섞어 사용하면 클래스의 설계가 혼란스러워진다.

클래스에 매개변수 속성만 존재하면 클래스 대신 인터페이스로 만들고 객체 리터럴를 사용하는 것이 좋다.

#### 네임스페이스와 트리플 슬패시 임포트

트리플 슬패시 임포트와 `module` 키워드는 호환성을 위해 남아있는 것이고, ECMAScript 2015의 `import`와 `export`를 사용하면 된다.

#### 데코레이터

앵귤러나 애너테이션이 필요한 프레임워크를 사용하고 있는게 아니면, 데코레이터가 표준이 되기 전에 타입스크립트에서 데코레이터를 사용하지 않는게 좋다.

### 요약

- 일반적인 TS 코드에서 모든 타입 정보를 제거하면 JS가 되지만 열거형, 매개변수 속성, 트리플 슬래시 임포트, 데코레이터는 타입 정보를 제거해도 JS가 되지 않는다.
- 타입스크립트의 역할을 명확히 하려면 열거형, 매개변수 속성, 트리플 슬래시 임포트, 데코레이터를 사용하지 않는게 좋다.



## 아이템 54 : 객체를 순회하는 노하우 

```typescript
const obj = {
  one: 'uno',
  two: 'dos',
  three: 'tres',
};
for (const k in obj) {
  const v = obj[k];
         // ~~~~~~ Element implicitly has an 'any' type
         //        because type ... has no index signature
}
```

위 오류는 `obj` 객체를 순회하는 루프 내의 상수 k와 관련된 오류이다. 이럴 때는 `k`의 타입을 구체적으로 명시해주면 오류가 사라진다. 

```typescript
let k: keyof typeof obj;  // Type is "one" | "two" | "three"
for (k in obj) {
  const v = obj[k];  // OK
}
```

`keyof`를 사용한 방법은 또 다른 문제점이 있다. `d:new Date()` 처럼 될 수도 있는데, `v`가 `string|number`타입으로 추론되는 것은 범위가 너무 좁게 추론되는 것이다.

```typescript
interface ABC {
  a: string;
  b: string;
  c: number;
}
function foo(abc: ABC) {
  let k: keyof ABC;
  for (k in abc) {  // let k: "a" | "b" | "c"
    const v = abc[k];  // Type is string | number
  }
}
```

골치 아픈 타입 문제 없이 단지 객체의 키와 값을 순회하고 싶다면 `Object.entries`를 사용하는 것이 낫다. 

```typescript
function foo(abc: ABC) {
  for (const [k, v] of Object.entries(abc)) {
    k  // Type is string
    v  // Type is any
  }
}
```

### 요약

- 객체를 순회할 때, 키가 어떤 타입인지 정확히 파악하고 있다면 `let k : keyof T`와 `for-in` 루프를 사용하자. 함수의 매개변수로 쓰이는 객체에는 추가적인 키가 존재할 수 있다는 점을 기억하자.
- 객체를 순회하며 키와 값을 얻는 가장 일반적인 방법은 `Object.entries`를 사용하는 것이다.



## 아이템 55 : DOM 계층 구조 이해하기

DOM 계층은 웹 브라우저에서 JS를 실행할 때 어디서나 존재한다. 타입스크립트에서는  DOM 엘리먼트의 계층 구조를 파악하기 용이하다. 

```typescript
function handleDrag(eDown: Event) {
  const targetEl = eDown.currentTarget;
  targetEl.classList.add('dragging');
// ~~~~~~~           Object is possibly 'null'.
//         ~~~~~~~~~ Property 'classList' does not exist on type 'EventTarget'
  const dragStart = [
     eDown.clientX, eDown.clientY];
        // ~~~~~~~                Property 'clientX' does not exist on 'Event'
        //                ~~~~~~~ Property 'clientY' does not exist on 'Event'
  const handleUp = (eUp: Event) => {
    targetEl.classList.remove('dragging');
//  ~~~~~~~~           Object is possibly 'null'.
//           ~~~~~~~~~ Property 'classList' does not exist on type 'EventTarget'
    targetEl.removeEventListener('mouseup', handleUp);
//  ~~~~~~~~ Object is possibly 'null'
    const dragEnd = [
       eUp.clientX, eUp.clientY];
        // ~~~~~~~                Property 'clientX' does not exist on 'Event'
        //              ~~~~~~~   Property 'clientY' does not exist on 'Event'
    console.log('dx, dy = ', [0, 1].map(i => dragEnd[i] - dragStart[i]));
  }
  targetEl.addEventListener('mouseup', handleUp);
// ~~~~~~~ Object is possibly 'null'
}

   const div = document.getElementById('surface');
   div.addEventListener('mousedown', handleDrag);
// ~~~ Object is possibly 'null'
```

위와 같이 수 많은 오류가 표시된다. 가장 먼저 `EventTarget` 타입 관련 오류를 살펴보면, DOM 계층 구조를 자세히 살펴보아야 한다. `p` 엘리먼트의 경우, `HTMLPagagraphElement` 타입이고 `HTMLPagagraphElement`는 `HTMLElement`의 서브 타입이며, `HTMLElement`는 `Element`의 서브타입이다. 그리고 `Element`는 `Node`의 서브타입이고, `Node`는 `EventTarget`의 서브타입이다. 

- DOM 계층의 타입들

|       타입        |          예시           |
| :---------------: | :---------------------: |
|    EventTarget    | window, XMLHttpRequest  |
|       Node        | document, Text, Comment |
|      Element      | HTMLElement, SVGElement |
|    HTMLElement    |         <i>,<b>         |
| HTMLButtonElement |        <button>         |

일반적으로 타입 단언문은 지양해야 하지만, DOM 관련해서는 TS보다 우리가 더 정확히 알고 있는 경우이기 때문에 단언문을 사용해도 좋다.

```typescript
document.getElementById('my-div') as HTMLDivElement;
```

`Event` 타입은 가장 추상화된 이벤트이고 더 구체적인 타입이 많다. `UIEvent`, `MouseEvent`,`TouchEvent`,`WheelEvent`,`KeyboardEvent`등 이다. 이벤트를 좀 더 명시적으로 표시하여 더 많은 문맥 정보를 사용할 수 있도록 해야 한다. 그리고 `strictNullChecks`가 설정된 상태라면 `null` 여부를 체크해야 한다. 

### 요약 

- DOM에는 타입 계층 구조가 존재한다. DOM 타입은 TS에서 중요한 정보이며, 브라우저 관련 프로젝트에서 TS를 사용할 때 유용하다.
- `Node`,`Element`,`HTMLElement`,`EventTarget`간의 차이점, 그리고 `Event`와 `MouseEvent`의 차이점을 알아야 한다.
- DOM 엘리먼트와 이벤트에는 충분히 구체적인 타입 정보를 사용하거나 TS가 추론할 수 있도록 문맥 정보를 활용해야 한다.



## 아이템 56 : 정보를 감추는 목적으로 private 사용하지 않기

자바스크립트는 클래스에 비공개 속성을 만들 수 없고, 비공개 속성임을 나타내기 위해 언더스코어(_)를 접두사로 붙이는게 관례로 되었다. 그러나 그것은 단순히 비공개로 표시한 것 뿐이다. TS에서는 public, protected, private 접근 제어자를 사용해 공개 규칙을 강제할 수 있을 것 같지만, TS 키워드이기 때문에 컴파일 후 제거된다. 타입스크립트의 접근 제어자들은 단지 컴파일 시점에서 오류를 표시해줄 뿐이고 런타임에는 아무 효력이 없다. 

JS에서 정보를 숨기기 위해 가장 효과적인 방법은 클로저(closure)를 사용하는 것이다. 

```typescript
declare function hash(text: string): number;

class PasswordChecker {
  checkPassword: (password: string) => boolean;
  constructor(passwordHash: number) {
    this.checkPassword = (password: string) => {
      return hash(password) === passwordHash;
    }
  }
}

const checker = new PasswordChecker(hash('s3cret'));
checker.checkPassword('s3cret');  // Returns true
```

현재 표준화가 진행 중인 비공개 필드 기능도 있다. 접두사로 #을 붙여서 타입 체크와 런타임 모두에서 비공개로 만드는 역할이 있다. 현재 타입스크립트에서는 사용 가능하다.

```typescript
class PasswordChecker {
  #passwordHash : number;
  
  constructor() {
    this.#passwordHash = passwordHash;
  }

  checkPassword(password: string) {
    return hash(password) === this.#passwordHash;
  }
}

const checker = new PasswordChecker(hash('s3cret'));
checker.checkPassword('secret'); // 결과는 false
checker.checkPassword('s3cret'); // 결과는 true
```

### 요약 

- public, protected, private 접근 제어자는 타입 시스템에서만 강제될 뿐이고, 런타임에서는 소용이 없고, 단언문을 통해 우회가 가능하다. 접근 제어자로 데이터를 감춰서는 안된다.
- 확실히 데이터를 감추고 싶다면 클로저를 사용해야 한다.

