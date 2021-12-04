# 5장 any 다루기



전통적인 프로그래밍 언어들의 타입 시스템은 완전 정적이거나, 동적으로 확실히 구분되어 있다.

그러나, 타입스크립트는 선택적이고, 점진적이므로 이 두 가지 특성을 동시에 가진다.

따라서, 타입스크립트는 일부분에만 타입스크립트를 적용할 수도 있다.



이런 특성 때문에 기존 JS 코드를 TS로 전환이 가능하다.

특히, 마이그레이션을 할 때 코드 일부분에 `any` 타입을 사용하는 것이 중요한 역할을 할 때가 많다.

이는 매우 강력한 힘을 가지므로, `any` 의 장점과 단점을 확실히 알고 사용할 수 있어야 한다.





## 아이템 38. any 타입은 가능한 좁은 범위에서만 사용하기



### 함수에서의 any

다음 코드를 보자.

```tsx
function f1(){
  const x: any = 어쩌구();
  process(x);
}

function f2(){
  const x = 어쩌구();
  process(x as any);
}
```



위 두 방법 중 어떤 방법이 좋은 방법일까?

답은 두 번째이다. 1은 x를 반환할 경우, x가 전반적으로 퍼질 위험이 있기 때문이다.



### 객체에서의 any

```tsx
type Config = {
  a: 1;
  b: 2;
  c: {
    key: string;
    l: string;
  };
};

const config: Config = {
  a: 1,
  b: 2,
  c: { // ERROR: Property 'l' is missing in type '{ key: string; }' but required in type '{ key: string; l: string; }'
    key: value
  }
};
```



위 코드에서 l이 객체 내에 없기 때문에, 잉여 속성 체커가 에러를 뱉게 된다.

이 경우, 다음과 같은 두 가지 우회법이 있다.



```tsx
const config: Config = {
  a: 1,
  b: 3,
  c: {
    key: value
  } as any
};

const config: Config = {
  a: 1,
  b: 3,
  c: {
    key: value
  }
} as any;
```



이 중, 첫 번째가 더 좋은 방법이다.

만약 객체 전체를 any로 단언하면, 다른 속성들이 타입 체크가 되지 않기 때문이다.



### 정리

- 타입 안전성의 손실을 피하기 위해 any의 사용 범위를 최소한으로 좁혀야 한다.



## 아이템 39. any를 구체적으로 변형해서 사용하기

any는 JS에서 표현할 수 있는 모든 값을 아우르는 매우매우 큰 범위의 타입이다.

이는, 즉 일반적인 상황에서는 any 보다 더 구체적으로 표현할 수 있는 타입이 존재할 가능성이 크다는 점이다.



### 매개변수를 알 수 없지만, ~~~ 라면...

* 배열이라면 `any []` 가 좋다.
* 배열의 배열 형태라면 `any[][]` 가 좋다.
* 객체지만 값을 알 수 없다면 `{[key: string]: any}` 가 좋다.
* 객체지만 속성에 접근할 수 없어야 한다면 `object` 가 좋다.
* 함수의 타입도 다음과 같이 구분하자.
  * 매개변수 없이 호출 가능한 모든 함수라면 `() => any`
  * 매개변수가 한개라면 `(arg: any) => any`
  * 모든 개수의 매개변수 `(...args: any[]) => any`





## 아이템 40. 함수 안으로 타입 단언문 감추기



함수를 작성하다보면, 외부에 드러난 타입 정의는 간단하지만 내부 로직이 복잡해 안전한 타입으로 구현하기 어려운 경우가 있다.



함수의 모든 부분을 안전한 타입으로 구성하는 것이 이상적이지만, 

불필요한 예외 사항까지 고려하며 힘들게 구성하기 보단 타입 단언을 사용하고 외부에 드러나는 타입 정의를 명시하는 것으로 끝내는 것이 좋다.



>  ***프로젝트 전반에 타입 단언문이 드러나 있는 것보다, 제대로 타입이 정의된 함수 안으로 타입 단언문을 감추는 것이 더 좋은 설계이다.***



다음 코드를 보자.

```tsx
function cacheLast<T extends Function>(fn: T): T {
  let lastArgs: any[] | null = null;
  let lastResult: any;

  return function (...args: any[]) { // ERROR: Type '(...args: any[]) => any' is not assignable to type 'T'
    if (!lastArgs || !shallowEqual(lastArgs, args)) {
      lastResult = fn(...args);
      lastArgs = args;
    }
    return lastResult;
  };
}
```



반환문에 있는 함수와 T 타입이 어떤 관계가 있는지 모르므로, 오류가 발생했다.

그러나 결과적으로 반환값이 예상한 결과가 나오기 때문에, 아래와 같이 단언문을 추가하는 것이 문제가 되지 않는다.



```tsx
function cacheLast<T extends Function>(fn: T): T {
  let lastArgs: any[] | null = null;
  let lastResult: any;

  return function (...args: any[]) {
    if (!lastArgs || !shallowEqual(lastArgs, args)) {
      lastResult = fn(...args);
      lastArgs = args;
    }
    return lastResult;
  } as unknown as T;
}
```



### 정리

* 타입 선언은 상황에 따라 필요하기도 하고, 현실적인 해결책이 되기도 한다.
  불가피하게 사용해야 한다면, 정확한 정의를 가지는 함수 안으로 숨기도록 하자.



## 아이템 41. any 의 진화를 이해하기

> ***any 는 진화한다!!***



다음 코드를 보자.

```tsx
const result = []; // any[]
result.push("a");
result;	//	string[]
result.push(1);
result;	//	(string | number)[]
```



일반적으로 타입스크립트에서 타입은 변수를 선언할 때 결정되고, 
그 후에는 새로운 값이 추가되도록 확장할 수 없다.

**그러나 any 는 예외이다.**



다음과 같은 케이스 들에서 any가 진화할 수 있다.

1. `any[]` 배열에 새로운 타입을 할당할 경우
2. let 으로 선언된 `any` 타입 식별자에 새로운 값을 할당할 경우
3. `try/catch` 블록 내에서 변술르 할당하는 경우



`any` 는 `noImplicitAny` 가 설정된 상태에서 변수의 타입이 암시적으로 `any` 인 경우에만 일어난다.

다음과 같이 명시적으로 `any` 를 선언하면 그대로 타입이 유지된다.

```tsx
const result: any[] = [];
result.push("a");
result;	//	any[]
result.push(1);
result;	//	any[]
```



### 암시적 any 타입의 오류

암시적 any 상태인 변수에 어떤 할당도 하지 않고 사용하려고 하면 암시적 any 오류가 발생하게 된다.

```tsx
function range(start: number, limit: number) {
  const out = []; // Variable 'out' implicitly has type 'any[]' in some locations where its type cannot be determined.

  if (start === limit) {
    return out;	//	Variable 'out' implicitly has an 'any[]' type
  }
}
```



any 타입의 진화는 암시적 any 에 어떤 값을 할당할 때만 발생한다.

그리고, 어떤 변수가 암시적 any 상태일 때 값을 읽으려고 하면 오류가 발생한다.





### 정리

* 일반적인 타입은 정제되기만 하지만, 암시적 any, any[] 타입은 진화할 수 있다.
* any 를 진화시키는 방식보다 명시적 타입 구문을 사용하는 것이 더 안전한 타입 유지 방법이다.





## 아이템 42. 모르는 타입의 값에는 any 대신 unknown 을 사용하기



### unknown

할당 가능성의 관점에서 any 를 생각해보자.

any 의 위험성은 다음 두 가지 특징에서 비롯된다.

- 어떠한 타입이든 any 타입에 할당 가능하다.
- any 타입은 어떠한 타입으로 할당 가능하다. (never 타입 제외)



한 집합은 다른 집합의 부분 집합이면서 동시에 상위집합이 될수 없으므로, any 는 타입 시스템과 상충된다.



unknown 은 any 대신 쓸 수 있는 타입 시스템에 부합하는 타입이다.

* 어떠한 타입이든 unknown 에 할당 가능하다.
* 그러나, unknown 타입은 어떤 타입으로도 할당 가능하지 않다.



Unknown 타입 인채로 값을 사용하면 오류가 발생하며, 함수 호출이나 연산을 하려해도 에러가 난다.



### 함수의 반환값 Unknown

```tsx
function parseYAML(yaml: string): any {
  console.log(yaml);
  return yaml;
}

interface Book {
  name: string;
  author: string;
}

const book = parseYAML(`
  name: Tester
  author: Also Tester
`);

console.log(book.title);
book("erad");
```



위 예제에서, any 타입 할당 시 book 은 암시적 any 타입이 되고, 사용하는 곳마다 런타임 에러가 발생하게 된다.

book 이 any 이므로 title 을 가진 객체일 수도 있고, function 일 수도 있다고 타입 체계가 판단해 이를 에러 검출하지 않는 것이다.



그러나 unknown 을 사용하게 되면 타입 단계에서 에러가 검출되므로, 훨씬 더 안전하다.

```tsx
function parseYAML(yaml: string): unknown {
  console.log(yaml);
  return yaml;
}

interface Book {
  name: string;
  author: string;
}

const book = parseYAML(`
  name: Tester
  author: Also Tester
`);

console.log(book.title);	//	Object is of type 'unknown'.
book("erad");	//	Object is of type 'unknown'.
```



### 변수 선언 unknown

어떤 값이 있지만 그 타입을 모르는 경우에 unknown 을 사용한다.



unknown 타입을 원하는 타입으로 변환하기 위해 다음과 같은 방법을 사용할 수 있다.

1. 타입 단언
2. instanceof 체크
3. 사용자 정의 타입 가드 (e.g. val is Book)



가끔, 다음과 같이 unknown 대신 제너릭 매개변수가 사용되는 경우도 있다.

```tsx
function safeParseYAML<T>(yaml: string): T {
  return parseYAML(yaml); // Type 'unknown' is not assignable to type 'T'.
//  'T' could be instantiated with an arbitrary type which could be unrelated to 'unknown'
}
```

이는 에러가 뜨는데, 어떤 타입이 unknown 에 할당될 수는 있지만 unknown 이 T 에 할당될 수 없기 때문이다.



### 단언문과 관련된 unknown

```tsx
type Foo = number;
type Bar = string;

declare const foo: Foo;
let barAny = foo as any as Bar;
let barUnk = foo as unknown as Bar;
```

둘 중 아래가 더 낫다. 

만약, 단언문을 분리하게 되는 경우 any 는 분리하는 순간 영향력이 퍼지게 되지만, unknown 은 즉시 오류를 발생하게 된다.



### {}

`{}` 이나 `object` 타입도 unknown 이 나오기 전에 종종 쓰였다.

그러나 느낌이 약간 다른데, object 타입은 null, undefined 를 포함하지 않기 때문이다.

현재는 잘 쓰이지 않는다.





## 아이템 43. 몽키 패치보다는 안전한 타입을 사용하기



### 몽키 패치

자바스크립트에서 유명한 특징은, 객체와 클래스에 임의의 속성을 추가할 수 있다는 점이다.

```tsx
window.monkey = "Tamarin";
document.monkey = "Howler";
```

이는  전역 변수가 되고 전역 변수를 사용하면 은연중에 프로그램 내에서 멀리 떨어진 부분들 사이에 의존성을 만들게 된다. 이는 함수 호출 때마다 `side effect` 를 만들게 된다.

일반적으로 전역 변수나 DOM 에 데이터를 저장하지 말고, 분리해서 사용해야 한다.



그러나 분리할 수 없는 경우, 아래와 같은 차선책이 존재한다.



### 1. interface 로 보강하기

```tsx
interface Document {
  monkey: string;
}

document.monkey = "Tamarin";
```

위 방법이 `(document as any).monkey` 에 비해 나은데, 타입 체커가 기타 속성에 대한 에러를 잡을 수 있기 때문이다.

다만 보강은 전역적으로 적용되므로, 코드의 다른 부분이나 라이브러리에서 분리할 수 없다.



### 2. 더 구체적인 타입 단언문 사용하기

```tsx
interface MonkeyDocument extends Document {
  monkey: string;
}

(document as MonkeyDocument).monkey = "Tester";
```

이는 Document 타입을 건드리지 않고 별도로 확장하므로 위의 모듈 영역 문제도 해결할 수 있다.



### 정리

* 몽키 패치 노노...
* 굳이 저장해야 하는 경우 보강이나 인터페이스로 단언해야 한다.



## 아이템 44. 타입 커버리지를 추적하여 타입 안전성 유지하기



### any 타입이 프로그램에 존재할 수 있는 경우

noImplicitAny, 명시적 타입 구문을 사용해도 any 로 부터 안전하다고 할 수 없다.

그 이유는 다음과 같은데,

1. 명시적 any 타입
   - 명시적으로 any 를 사용하고, 타입 범위를 좁히고 구체적으로 만들어도 any 타입이다.
     이는 코드 전반에 영향을 미칠 수 있다.
2. 서드파티 타입 선언
   * @types 선언 파일로부터 any 가 전파되므로, 특별히 조심해야 한다.



### type-coverage

npm의 `type-coverage` 패키지를 사용하여 any 를 추적할 수 있다.

```shell
npx type-coverage	//	any 타입 coverage 확인
npx type-coverage --detail	//	any 타입이 있는 곳 모두 출력
```



### 정리

* 작성한 프로그램의 타입이 얼마나 잘 선언되었는지 추적해야 한다.
  추적함으로써 타입 안전성을 꾸준히 높일 수 있다.

