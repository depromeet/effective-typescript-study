# 7장. 코드를 작성하고 실행하기

7장에서는 타입과 관계는 없지만 코드를 작성하고 실행하면서 실제로 겪을 수 있는 문제들을 다룬다.



## 아이템 53. 타입스크립트 기능보다는 ECMAScript 기능을 사용하기

타입스크립트가 태동하던 2010년, 자바스크립트는 결함이 많고 개선해야 할 부분이 많은 언어였다.

클래스, 데코레이터, 모듈 시스템 같은 기능이 없어 이를 프레임워크나 트랜스파일러로 보완하는게 일반적인 모습이었다.

그래서 타입스크립트도 초기 버전에는 독립적으로 개발된 클래스, 열거형, 모듈 시스템을 포함시킬 수 밖에 없었다.



현재 타입스크립트 팀은 자바스크립트 신규 기능을 그대로 채택하고, 타입스크립트 초기 버전과 호환성을 포기하고 있다.

근데 이 원칙이 세워지기 전에 이미 사용되는 몇 가지 기능이 있다. 

이 기능들은 타입 공간과 값 공간의 경계를 혼란스럽게 만드므로 사용하지 않는게 좋다.



피해야 하는 기능 몇 가지와, 이 기능을 사용하게 될 경우 어떤 점에 유의해야 하는지 알아보자.



### 열거형 (enum)

타입스크립트의 열거형은 몇 가지 문제가 있다.

* 숫자 열거형에 0, 1, 2 외의 다른 숫자가 할당되면 매우 위험하다.
* 상수 열거형은 보통의 열거형과 달리 런타임에 완전히 제거된다.
  `const enum Flavor` 로 바꾸면 컴파일러는 Flavor.CHOCOLATE 을 0으로 바꿔 버린다.
* `preserveConstEnums` 플래그를 설정한 상태의 상수 열거형은 보통 열거형 처럼 런타임 코드에 상수 열거형 정보를 유지한다.
* 문자형 열거형은 런타임의 타입 안정성과 투명성을 제공한다.
  그러나 타입스크립트의 다른 타입과 달리 구조적 타이핑이 아닌 명목적 타이핑을 사용한다.



```tsx
enum Flavor {
  VANILLA = "vanilla",
  CHOCOLATE = "chocolate"
}

let flavor = Flavor.CHOCOLATE;
flavor = "chocolate"; // ERROR: Type '"chocolate"' is not assignable to type 'Flavor'
```

이는 문제가 될 수 있는데, 자바스크립트에서는 런타임 시점에서 Flavor.CHOCOLATE 이 문자열이므로 이를 "chocolate" 처럼 호출할 수 있지만 타입스크립트는 Flavor 를 Import 해야 한다.

따라서 타입스크립트, 자바스크립트의 동작이 달라지므로 문자열 열거형은 사용하지 않는게 좋다.

열거형 대신 리터럴 타입의 유니온을 사용하면 된다.



### 매개변수 속성

일반적으로 클래스 초기화 시 속성 할당을 위해 생성자의 매개변수를 사용한다.

```tsx
class Person {
  name: string;
  constructor(name: string){
    this.name = name;
  }
}
```



타입스크립트는 더 간결한 문법을 제공한다.

```tsx
class Person {
  constructor(public name: string){}
}
```



`public name` 은 매개변수 속성이라고 불리며, 멤버 변수로 name 을 선언한 예제와 동일하게 동작한다.



그러나, 매개변수 속성과 관련된 몇 가지 문제점이 존재한다.

* 일반적으로 타입스크립트 컴파일은 타입 제거가 이루어지므로 코드가 줄어들지만,
  매개변수 속성은 코드가 늘어나는 문법이다.
* 매개변수 속성이 런타임에는 실제로 사용되지만, 타입스크립트 관점에서는 사용되지 않는 것 처럼 보인다.
* 매개변수 속성과 일반 속성을 섞어서 사용하면 클래스 설계가 혼란스러워진다.



매개변수 속성은 사용하는 것이 좋은지에 대한 찬반 논란이 있다.

매개변수 속성은 타입스크립트의 다른 패턴과 달리 이질적이고, 생소한 문법임을 인지해야 한다.

또, 같이 사용하면 혼란스러워지므로 한 가지만 사용하는 것이 좋다.



### 네임스페이스와 트리플 슬래시 임포트

ES6 이전에는 JS 에는 공식적인 모듈 시스템이 없었다.

그래서 각 환경마다 자신만의 방법으로 모듈 시스템을 마련했다.

타입스크립트는 `module ` 키워드와 `트리플 슬래시` 임포트를 사용했다.

ES6가 공식적으로 모듈 시스템을 도입한 이후, TS 는 충돌을 피하기 위해 `module` 과 같은 기능을 하는 `namespace` 키워드를 추가했다.

```tsx
namespace foo {
  function bar() {}
}

/// <reference path="./other.ts" />

foo.bar();
```



### 데코레이터

데코레이터는 클래스, 메서드, 속성에 annotation 을 붙이거나 기능을 추가하는 데 사용할 수 있다.

예를 들어, 클래스의 메서드가 호출될 때마다 로그를 남기려면 `logged` 애너테이션을 정의할 수 있다.



```tsx
function logged(target: any, name: string, descriptor: PropertyDescriptor) {
  const fn = target[name];
  descriptor.value = function () {
    console.log(`Calling ${name}`);
    return fn.apply(this, arguments);
  };
}

class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @logged
  greet() {
    return "Hello, " + this.greeting;
  }
}

console.log(new Greeter("Dave").greet());
```



데코레이터는 앵귤러 프레임워크를 지원하기 위해 추가되었다.

이는 표준화가 완료되지 않았기 때문에, 호환성이 꺠질 가능성이 있으므로 표준이 되기 전까지는 데코레이터를 사용하지 않는게 좋다.



### 정리

* 일반적으로 타입스크립트 코드에서 모든 타입 정보를 제거하면 타입스크립트가 되지만,
  열거형, 매개변수 속성, 트리플 슬래시 임포트, 데코레이터는 그렇지 않다.

* 타입스크립트의 역할을 명확히 하려면 이를 사용하지 않는 것이 좋다.

  

### 아이템 54. 객체를 순회하는 노하우

다음 코드는 정상적으로 실행되지만, 편집기에서는 에러가 발생한다.

```tsx
const obj = {
  one: "uno",
  two: "dos",
  three: "tres"
};

for (const k in obj) {
  const v = obj[k]; // ERROR: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ one: string; two: string; three: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ one: string; two: string; three: string; }
}
```



이는 k 의 타입이 string 인 반면, obj 는 'one, two, three' 세 개의 키만 존재하기 때문이다.

k 의 타입을 더 구체적으로 명시해주면 오류가 사라진다.



```tsx
const obj = {
  one: "uno",
  two: "dos",
  three: "tres"
};

let k: keyof typeof obj;
for (k in obj) {
  const v = obj[k];
}
```



이는 object 에 다른 속성이 존재할 수 있기 때문에, 구체적인 키가 아닌 string 으로 정한 것이다.

이와 같이 타입 문제 없이 단지 객체의 키와 값을 순회하고 싶다면, `Object.entries` 를 사용하면 된다.



### 정리

* 객체 순회 시, 키가 어떤 타입인지 정확히 파악하고 있다면 `let k: keyof T` 와 `for-in` 루프를 사용하자.
  함수의 매개변수로 쓰이는 객체는 추가적인 키가 존재할 수 있다는 점을 명심하자.
* 객체를 순회하며 키와 값을 얻는 가장 일반적인 방법은 `Object.entries` 를 사용하는 것이다.





## 아이템 55. DOM 계층 구조 이해하기

타입스크립트에서는 DOM 엘리먼트의 계층 구조를 파악하기 용이하다.

Element, EventTarget 에 달려있는 Node 의 구체적인 타입을 안다면 타입 오류를 디버깅할 수 있고, 언제 타입 단언을 사용해야 할 지 알 수 있다.



### 계층 구조에 따른 타입

계층 구조별로 타입은 다음과 같다.

* EventTarget ( window, XMLHttpRequest )
* Node (document, Text, Comment)
* Element (HTMLElement, SVGElement, ...)
* HTMLElement (<i>, <b>)
* HTMLButtonElement (<button>)



### EventTarget

EventTarget 은 DOM 타입 중 가장 추상화된 타입이다.

이벤트 리스너를 추가하거나 제거하고, 이벤트를 보내는 것 밖에 할 수 없다.



### Node

Node에는 Text, 주석 등이 있다.



### Element, HTMLElement

SVG 태그의 전체 계증 구조를 포함하며 HTML 이 아닌 엘리먼트가 존재하는데, 이는 SVGElement 이다.

예를 들어, <html> 은 HTMLHtmlElement 이고 <svg> 는 SVGSvgElement 이다.



### HTMLxxxElement

HTMLxxxElement 는 자신만의 고유 속성을 가지고 있다.

예를 들어, HTMLImageElement 에는 src 속성이 있고, HTMLInputElement 는 value 속성이 있다.



### Event

Event 타입에도 별도의 계층 구조가 있다.

Event 는 가장 추상화된 타입이며, 더 구체적인 타입들은 다음과 같다.

* UIEvent: 모든 종류의 사용자 인터페이스 이벤트
* MouseEvent: 클릭처럼 마우스로부터 발생되는 이벤트
* TouchEvent: 모바일 기기 터치 이벤트
* WheelEvent: 스크롤 휠을 돌려서 발생되는 이벤트
* KeyboardEvent: 키 누름 이벤트



### 정리

* DOM 에는 타입 계층 구조가 있다. DOM 타입은 타입스크립트에서 중요한 정보이며, 브라우저 관련 프로젝트에서 타입스크립트를 사용할 때 유용하다.



## 아이템 56. 정보를 감추는 목적으로 private 사용하지 않기

자바스크립트는 클래스에 비공개 속성을 만들 수 없다.

그러나, 타이븟크립트에는 public, protected, private 접근 제어자를 사용해 공개 규칙을 강제하는 것으로 오해할 수 있다.



컴파일 시점에서는 public, protected, private 같은 접근 제어자는 제거되며, 이는 접근할 수 있게 된다.

심지어 단언문을 사용하면 타입스크립트 상태에서도 private 속성에 접근할 수 있다.

```tsx
class Diary {
  private secret = "testtest!!";
}

const diary = new Diary();
(diary as any).secret;
```



즉, 정보를 감추는 목적으로 private 을 사용하면 안된다.



### Closure

자바스크립트에서 정보를 숨기기 위해 효과적인 방법은 클로저를 사용하는 것이다.

```tsx
declare function hash(text: string): number;

class PasswordChecker {
  checkPassword: (password: string) => boolean;
  constructor(passwordHash: number) {
    this.checkPassword = (password: string) => {
      return hash(password) === passwordHash;
    };
  }
}

const checker = new PasswordChecker(hash("s3cret"));
checker.checkPassword("s3cret");
```



위 코드는 PasswordChecker 생성자 외부에서 passwordHash 변수에 접근할 수 없기 때문에 정보를 숨기는 목적을 달성했다.

그러나 몇 가지 문제가 있는데,

1. passwordHash 를 생성자 외부에서 접근할 수 없으므로 passwordHash에 접근하는 메서드 역시 생성자 내부에 정의되어야 한다는 것이다.

2. 그리고 메서드 정의가 생성자 내부에 존재하게 되면, 인스턴스를 생성할 때마다 메서드의 복사본이 생성되기 때문에 메모리를 낭비하게 된다.
3. 동일한 클래스로부터 생성된 인스턴스라고 하더라도 서로의 비공개 데이터에 접근하는 것이 불가능하므로 불편함이 따른다.



### # 사용하기

다른 선택지로, 현재 표준화가 진행 중인 비공개 필드 기능을 사용할 수도 있다.

비공개 필드 기능은 타입 체크, 런타임 모두에서 비공개로 만드는 역할을 한다.

```tsx
declare function hash(text: string): number;

class PasswordChecker {
  #passwordHash: number;

  constructor(passwordHash: number) {
    this.#passwordHash = passwordHash;
  }

  checkPassword(password: string) {
    return hash(password) === this.#passwordHash;
  }
}

const checker = new PasswordChecker(hash("s3cret"));

console.log(checker.checkPassword("secret")); // false
console.log(checker.checkPassword("s3cret")); //  true
```



#passwordHash 는 클래스 외부에서 접근할 수 없다.

그러나 클로저와는 달리 클래스 메서드나 동일 클래스 개별 인스턴스끼리는 접근 가능하다.



### 정리

* public, protected, private 접근 제어자는 타입 시스템에서만 강제될 뿐이다.
  런타임에서는 소용이 없으며 단언문을 통해 우회할 수 있다.
* 확실히 데이터를 감추고 싶다면 클로저를 사용해야 한다.
