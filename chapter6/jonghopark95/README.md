# 6장. 타입 선언과 @types



해당 장에선 타입스크립트에서 의존성이 어떻게 동작하는지 설명하여 이에 대한 개념을 잡을 수 있게 한다.



## 아이템 45. devDependencies 에 typescript 와 @types 추가하기



### dependency의 종류

* dependencies
  * 프로젝트를 실행하는 데 필수적인 라이브러리들이 포함된다.
    만약 프로젝트를 npm 에 공개해 다른 사용자가 해당 프로젝트를 설치하면, dependencies 에 들어있는 라이브러리도 함께 설치된다. 이를 `transitive dependency` 라고 한다.
* devDependencies
  * 프로젝트를 개발하고 테스트하는 데 사용되지만, 런타임에는 필요 없는 라이브러리들이 포함된다.
    예를 들어, npm 에 공개할 때 다른 사용자가 해당 프로젝트를 설치하면, devDependencies 에 포함된 라이브러리는 제외된다.
* peerDependencies
  * 런타임에 필요하긴 하지만, 의존성을 직접 관리하지 않는 라이브러리들이다.
    단적으로 플러그인을 들 수 있다.



타입스크립트는 개발 도구일 뿐, 타입 정보는 런타임에 존재하지 않으므로
타입스크립트와 관련된 라이브러리는 일반적으로 `devDependencies` 에 속한다.



### 타입스크립트 프로젝트에서 고려해야 할 의존성 두 가지

1. **타입스크립트 자체 의존성을 고려한다.**

타입스크립트를 시스템 레벨로 설치하면 다음과 같은 문제가 발생한다.

* 팀원들 모두가 항상 동일한 버전을 설치한다는 보장이 없다.
* 프로젝트를 셋업할 때 별도의 단계가 추가된다.

이 때문에, 시스템 레벨보다는 `devDependencies` 에 넣는 것이 좋다.



2. 타입 의존성 (@types) 을 고려해야 한다.

사용하려는 라이브러리에 타입 선언이 포함되어 있지 않아도, `DefinitelyTyped` 의 타입 정의들은 npm 의 `@types` 스코프에 공개된다.`@types` 는 타입 정보만 포함하며, 구현체는 포함하지 않는다.

원본 라이브러리가 `dependencies` 에 있더라도 타입 의존성은 `devDependencies` 에 있어야 한다.

이 의도는 런타임에 `@types/~` 를 의존하지 않겠다는 것이다.



### 정리

* 타입스크립트를 시스템 레벨로 설치하지 않는 것이 좋다. 모든 팀원이 동일한 버전을 사용하는 것이 좋다.
* @types 는 `devDependencies` 에 포함시키는 것이 좋다. 런타임에 `@types` 가 필요하다면 별도의 작업이 필요할 수도 있다.





## 아이템 46. 타입 선언과 관련된 세 가지 버전 이해하기

의존성 관리는 개발자에게 매우 힘든 일이다.

우리들은 단순히 라이브러리를 프로젝트에 추가해서 사용할 뿐이지, `transitive` 의존성이 호환되는지 깊게 생각하지 않는다.

문제는, 타입스크립트가 의존성 문제를 해결하기는 커녕 더 복잡하게 한다는 점이다.

왜냐하면 다음 세 가지 사항을 고려해야 하기 때문이다.

1. 라이브러리의 버전
2. 타입 선언(@types) 의 버전
3. 타입스크립트의 버전

이 때문에 타입스크립트 라이브러리 매커니즘을 잘 이해해야 한다.



### 라이브러리와 타입 정보의 버전이 별도로 관리되는 방식

react 의 경우, `react`, `@types/react` 로 라이브러리와 타입 선언이 분리되어 관리된다.

이 방식은 좋지만, 4가지 문제점이 있다.



1. **라이브러리를 업데이트 했지만 실수로 타입 선언은 업데이트 하지 않는 경우.**

라이브러리 업데이트와 관련된 새로운 기능을 사용할 때, 타입 선언을 업데이트 하지 않으면 타입 오류가 발생한다.

이는 타입 선언을 업데이트 해서 버전을 맞출 수 있지만, 아직 타입 선언이 준비되어 있지 않다면 보강을 하여 새 함수와 메서드의 타입 정보를 프로젝트에 추가할 수 있다.

또는 타입 정보를 작성해 커뮤니티에 기여할 수도 있다.



2. **라이브러리보다 타입 선언의 버전이 최신인 경우.**

이 경우는 타입 정보 없이 `declare module` 등으로 라이브러리를 사용하다가 타입 선언을 설치하려고 하면 뒤늦게 발생하는 케이스이다. 타입 체커는 최신 API 기준으로 코드를 검사하지만, 런타임은 과거 버전이기 때문에 문제가 발생한다.

이는 라이브러리와 타입 선언 버전을 맞추면 된다.



3. **프로젝트에서 사용하는 타입스크립트 버전보다 라이브러리에서 필요로 하는 타입스크립트 버전이 최신인 경우.**

이를 해결하려면, 프로젝트의 타입스크립트 버전을 올리거나 라이브러리 타입 선언의 버전을 내리면 된다.

또는 `declare module` 로 타입 정보를 없애면 된다.

유명한 라이브러리는 `typesVersions` 로 버전별로 타입 정보를 설치할 수 있다.



4. **@types 의존성이 중복될 수도 있다.**

특정 타입이 다른 타입에 의존하면, 중첩된 폴더에 해당 버전을 설치한다.

이 경우 타입 선언 모듈은 선언이 병합될 수 없다는 에러가 나오게 된다. 해결책은 서로 버전이 호환되도록 업데이트 하면 된다.



### 라이브러리와 타입 정보가 포함되는 방식

이 방식은 다음과 같은 문제가 발생한다.



1. **번들된 타입 선언에 보강 기법으로 해결할 수 없는 오류가 있는 경우. 또는 TS 버전이 올라가며 오류가 발생하는 경우**

`@types` 를 별도로 사용한다면 버전에 맞게 선택할 수 있지만, 이는 그렇지 못하다.



2. **프로젝트 내의 타입 선언이 다른 라이브러리의 타입 선언에 의존하게 되는 경우**

보통 의존성이 `devDependencies` 에 들어가게 되고, 이는 다른 사용자가 설치를 안하게 되므로 오류가 발생한다.

또, JS 사용자는 `@types` 를 설치하지 않는다.`@types` 에 있다면 타입은 분리가 되고, 타입스크립트 사용자만 설치할 수 있게 된다.



3. **프로젝트 과거 버전 타입 선언에 문제가 있는 경우**

이 경우, 과거 버전으로 돌아가서 패치 업데이트를 해야 한다.



4. **타입 선언의 패치 업데이트를 자주 하기 어렵다.**



### 정리

* 타입 선언을 라이브러리에 포함하는 경우와, `DefinitelyTyped` 에 공개하는 것의 장단점을 이해해야 한다.





## 아이템 47. 공개 API에 등장하는 모든 타입을 익스포트하기

타입스크립트를 사용하다보면 서드파티의 모듈에서 익스포트되지 않은 타입 정보가 필요한 경우가 생긴다.

만약, 함수 선언에 이미 타입 정보가 있다면 제대로 익스포트 되고 있는 것이며, 타입 정보가 없다면 명시적으로 타입을 작성해야 한다.



### 숨겨진 타입 추출하는 방법

`ReturnType`, `Parameters` 등의 유틸리티 타입으로 타입들을 추출해 낼 수 있다.



### 정리

* public method 에 등장한 어떤 형태의 타입이든 익스포트하는 것이 좋다.
  어짜피 라이브러리 사용자가 추출할 수 있으므로, 익스포트 하기 쉽게 만드는 것이 좋다.



## 아이템 48. API 주석에 TSDoc 사용하기

### JSDoc vs inline comment

대부분의 편집기는 JSDoc 스타일의 주석을 tooltip 으로 표시해준다.

따라서, inline 주석 `//` 보다 JSDoc 스타일의 주석이 더 유용하다.



### TSDoc

TS 관점에서 주석을 TSDoc 이라고 부른다.

타입 정의에 TSDoc 을 사용하면, 필드별로 설명을 볼 수 있어서 유용하다.

TSDoc 은 마크다운 형식으로 꾸며지므로, 다양한 마크다운 문법을 사용할 수 있다.



주석은 수필처럼 장황하게 쓰지 않도록 주의해야 한다. 훌륭한 주석은 간단히 요점만 언급한다.



### 정리

* export 된 함수, 클래스, 타입에 주석을 달 때는 JSDoc / TSDoc 형태를 사용하자.
* @param, @returns 구문과 문서 서식을 위해 마크다운을 사용할 수 있다.

* 주석에 타입 정보를 포함하지 말자.





## 아이템 49. 콜백에서 this에 대한 타입 제공하기



### JS 에서의 this

JS 에서 this 는 매우 혼란스러운 기능이다.

`let, const` 는 `lexical scope` 이지만, `this` 는 `dynamic scope` 이다.

즉, 정의된 방식이 아닌 호출된 방식에 따라 달라진다.



this 는 객체의 현재 인스턴스를 참조하는 클래스에서 가장 많이 쓰인다.



아래 코드를 보자.

```tsx
class C {
  vals = [1, 2, 3];
  logSquares() {
    for (const val of this.vals) {
      console.log(val * val);
    }
  }
}

const c = new C();
c.logSquares();

const c = new C();
const method = c.logSquares;
method(); // ERROR!!
```



위 두개의 실행 결과는 다른데, 이는 `c.logSquares()` 가 두 가지 작업을 수행하기 때문에 그렇다.

1. C.prototype.logSquares 를 호출한다.
2. this 의 값을 c 로 바인딩한다.



즉, c.logSquares 를 사용하며 this 는 undefined 가 되고, vals 를 호출할 수 없게 된다.

이를 제어하기 위해선 call 으로 명시적으로 this 를 바인딩 해야 한다.



### 타입스크립트 에서의 this

만약, 작성 중인 라이브러리에 this 를 사용하는 콜백 함수가 있다면, this 바인딩 문제를 고려해야 한다.

```tsx
function addKeyListener(
  el: HTMLElement,
  fn: (this: HTMLElement, e: KeyboardEvent) => void
) {
  el.addEventListener("keydown", (e) => {
    fn(e); // Error: The 'this' context of type 'void' is not assignable to method's 'this' of type 'HTMLElement'.
    fn(el, e); // Error: Expected 1 arguments, but got 2.
    fn.call(el, e); // OK!
  });
}
```



콜백 함수에서 첫 번째 매개변수에 있는 this 는 특별하게 처리된다. 

위 예제에서, `fn(el, e)` 와 같이 호출하면 이를 확인할 수 있다.



또, 매개변수에 this 를 추가하면 this 바인딩이 체크되므로 실수를 방지할 수 있다.

`fn(e)` 를 확인해보면 이를 확인할 수 있다.



## 아이템 50. 오버로딩 타입보다는 조건부 타입을 사용하기



다음 코드를 보자.

```tsx
function double(x: number | string): number | string;
function double(x: any) {
  return x + x;
}

const num = double(12);
console.log(num);
```



이는 number 를 넣었을 경우는 number, string 은 string 을 반환하길 원하지만

number 를 넣었을 때 string 을 넣는 경우도 포함되게 된다.



제너릭을 사용하면 이를 모델링할 수 있다.

```tsx
function double<T extends number | string>(x: T): T;
function double(x: any) {
  return x + x;
}

const num = double("x");
console.log(num);
```

단, 이는 너무 타입이 과하게 구체적이다.

'x' 를 넘기면 'xx'를 기대하게 되지만, num의 타입은 'x' 가 된다.



타입스크립트에서 함수 구현체는 하나이지만, 타입 선언은 몇 개든지 만들 수 있으므로 이를 활용하여 double 을 개선할 수 있다.

```tsx
function double(x: number): number;
function double(x: string): string;
function double(x: any) {
  return x + x;
}

const num = double("x");
console.log(num);
```



그러나, 위 경우에도 버그는 남아 있게 된다.

string 이나 number 타입으로는 잘 동작하지만, 유니온 타입에서는 문제가 발생한다.

```tsx
function double(x: number): number;
function double(x: string): string;
function double(x: any) {
  return x + x;
}

function f(x: number | string) {
  return double(x); // ERROR!!
}
```

타입스크립트는 오버로딩 타입 중에 일치하는 타입을 찾을 때 까지 순차적으로 검색하게 되는데,

오버로딩 타입의 마지막 선언인 `string` 을 검색했을 때, string | number 는 string 에 할당될 수 없으므로 에러가 발생한다.



### 조건부 타입

가장 좋은 해결책은 조건부 타입을 활용하는 것이다.

```tsx
function double<T extends number | string>(
  x: T
): T extends string ? string : number;
function double(x: any) {
  return x + x;
}
```



### 정리

* 오버로딩 타입보다 조건부 타입을 사용하는 것이 좋다. 조건부 타입은 추가적인 오버로딩 없이 유니온 타입을 지원할 수 있다.



## 아이템 51. 의존성 분리를 위해 미러 타입 사용하기

다음과 같은 코드가 있다고 가정하자.

```tsx
function parseCSV(contents: string | Buffer): { [column: string]: string }[] {
  if (typeof contents == "object") {
    return parseCSV(contents.toString("utf8"));
  }
  // ...
}
```



위 코드는 `NodeJS` 사용자를 위해 `Buffer` 타입을 허용한다.

이 `Buffer` 타입 정의는 `@types/node` 를 설치하여 얻을 수 있다.



문제는, 자바스크립트 개발자는 `@types` 와 무관하며, 타입스크립트 웹 개발자는 `NodeJS` 와 무관하다는 점이다.



이 경우, 각자가 필요한 모듈만 사용할 수 있도록 구조적 타이핑을 적용할 수 있다.

```tsx
interface CSVBuffer {
  toString(encoding: string): string;
}

function parseCSV(
  contents: string | CSVBuffer
): { [column: string]: string }[] {
  if (typeof contents == "object") {
    return parseCSV(contents.toString("utf8"));
  }
  // ...
}
```



CSVBuffer 는 실제고 필요한 부분만을 떼어 내어 명시했고, 해당 타입이 `Buffer` 와 호환되므로 `NodeJS ` 에서도 실제 Buffer 인스턴스로 parseCSV 를 호출하는 것이 가능해진다.



### 정리

* 필수가 아닌 의존성을 분리할 때는 구조적 타이핑을 사용하면 된다.
* 공개한 라이브러리를 사용하는 자바스크립트 사용자가 @types 의존성을 가지지 않게 해야 한다.
  그리고 웹 개발자가 NodeJS 관련 의존성을 가지지 않게 해야 한다.







## 아이템52. 테스팅 타입의 함정에 주의하기



### 타입 선언 테스트

```tsx
const lengths: number[] = map(['john', 'paul'], name => name.length)
```

위 코드는 불필요한 타입 선언의 역할을 한다. 이미 추론되는 타입이기 때문이다.

그러나 테스트 코드 관점에서는 중요한 역할을 하게 된다.

`number[]` 타입 선언은 반환 타입이 `number[]` 임을 보장한다.

그러나 테스팅을 위해 할당을 사용하는 방식은 두 가지 근본적인 문제가 있다.



### 문제점 1 - 불필요한 변수를 만들어야 한다.

반환값을 할당하는 변수는 `미사용 변수 경고` 같은 린팅 규칙을 비활성화해야 한다.

일반적인 해결책은 변수 도입 대신 헬퍼 함수를 정의하는 것이다.



```tsx
function assertType<T>(x: T){}
assertType<number[]>(map(['john', 'paul'], name => name.length));
```

이 코드는 불필요한 변수 문제를 해결하지만, 다른 문제점이 또 남아 있다.



### 문제점 2 - 두 타입이 동일한지 체크하는것이 아니라 할당 가능성을 체크한다.

다음 코드를 보자.

```tsx
const beatles = ['john', 'paul', 'george', 'ringo'];
assertType<{name: string}[]>(
	map(beatles, name => ({
    name, 
    inYellowSubmarine: name === 'ringo'
  }))
)
```



map은 {name, inYellowSubmarine} 객체의 배열을 반환하고, 이는 {name: string}[]에 할당 가능하지만 `inYellowSubmarine` 이 체크되지 않았다.



### 제대로 된 해결책

다음 코드처럼 `Parameters, ReturnType` 제너릭 타입을 이용해 함수 매개변수 타입과 반환 타입만 분리하여 테스트할 수 있다.

```tsx
const double = (x: number) => 2 * x;
let p: Parameters<typeof double> = null!;
asserType<[number, number]>(p); // ERROR: [number] 형식의 인수는 [number, number] 형식의 매개변수에 할당될 수 없다.

let r: ReturnType<typeof double> = null!;
assertType<number>(r);
```



### dtslint

dtslint를 사용하면 예제 테스트를 다음과 같이 작성할 수 있다.

```tsx
const beatles = ['john', 'paul', 'george', 'ringo'];
map(beatles, function(
   name,	//	$ExpectType string
   i,			//	$ExpectType number
	 array	//	$ExpectType string[]
){
  this		//	$ExpectType string[]
  return name.length;
})				//	$ExpectType number[]
```



### 정리

* 타입을 테스트 할 때는 함수 타입의 동일성과 할당 가능성의 차이점을 알고 있어야 한다.
* 콜백이 있는 함수 테스트의 경우, 매개변수 추론 타입을 체크해야 한다.
* 타입 관련 테스트에서 any 를 주의해야 한다. 더 엄격한 테스트를 위해서는 dtslint 같은 도구를 사용하는 것이 좋다.



