# 1장. 타입스크립트 알아보기

### Key Point

* 타입스크립트란 무엇인가?
* 타입스크립트를 어떻게 여겨야 되는가?
* 자바스크립트와는 어떤 관계인가?
* 타입스크립트의 타입들은 null이 가능한가? any 타입에서는 어떤가?
* duck typing이 가능한가?

##### 

## 아이템1. 타입스크립트와 자바스크립트의 관계 이해하기



>  ***타입 스크립트는 자바스크립트의 superset이다!!***



즉, JS 프로그램에 문법 오류가 없다면 유효한 타입스크립트 프로그램이라고 할 수 있다. 그러나, JS 프로그램에 어떤 이슈가 존재한다면 문법 오류가 아닐 지라도 타입 체커에게 지적당할 가능성이 높다. 하지만 이 또한 TS는 코드를 파싱하고 JS로 변환할 수 있다.

이와 같은 특성 때문에 기존에 존재하는 JS 코드를 TS로 마이그레이션하는 데 엄청난 이점이 된다. **기존 코드를 유지하면서 일부분에만 TS 적용이 가능하기 때문이다.**

모든 JS 프로그램이 TS 라는 명제는 참이지만, 그 반대는 성립하지 않는다. 이는 TS 프로그램이지만 JS가 아닌 프로그램이 존재하기 때문이다. 이는 TS가 타입을 명시하는 추가적인 문법을 가지기 때문이다.





> ***타입 시스템은 JS에서는 허용되지만 TS 에서 문제가 되는 경우가 있다.***



<img src="https://www.oreilly.com/library/view/effective-typescript/9781492053736/assets/efts_0102.png" alt="1. Getting to Know TypeScript - Effective TypeScript [Book]" style="zoom:50%;" />



위 그림의 의미는, 모든 JS는 Typescript 이지만 일부 JS 프로그램만이 타입 체크를 통과한다는 것이다.

타입스크립트 타입 시스템은 JS 런타임 동작을 **모델링**한다.

```tsx
const x = 2 + '3';
const y = '2' + 3;
```

이 예제는 다른 언어였으면 런타임 에러가 될 코드이지만, 타입스크립트는 정상으로 인식한다.

반대로 런타임 에러가 발생하지 않지만, 타입 체크가 문제점을 표시하는 코드도 있다.

```tsx
const a = null + 7; // Error
const b = [] + 12;	//	Error
alert("hello", "typescript")	//	Error!
```

이는 타입 시스템이 단순히 런타임 동작을 모델링하는 것 뿐만 아니라, 의도치 않은 이상한 코드까지 고려한다는 점이다.

이런 문법의 엄격함은 취향의 차이이며, 우열을 가릴 수 없는 문제이다.





## 아이템 2. 타입스크립트 설정 이해하기



다음과 같은 코드가 있다고 가정해보자.

```ts
function add(a, b) {
  return a + b;
}

add(10, null);
```

이 코드는 타입 체커를 통과할 수 있을까 없을까? 

이는 typescript compiler 의 설정에 따라 다르다. 

```tsx
{
  "compilerOptions": {
    "noImplicitAny": true // false 일 경우, 오류가 발생하지 않는다.
  }
}
```



> ***타입스크립트는 어떻게 설정하느냐에 따라 완전히 다른 언어처럼 느껴질 수 있다.***



### noImplicitAny

noImplicitAny는 변수들이 미리 정의된 타입을 가져야 하는지 여부를 제어한다.  any를 매개변수에 사용한다면 타입 체커는 무력해진다. 

위 코드의 매개변수 a, b는 any를 코드에 넣지는 않았지만, any 타입으로 간주되기 때문에 implicit any (암시적 any) 라고 부른다. 이는 명시적으로 :any를 선언해주거나 더 명확한 타입을 선언하면 해결할 수 있다.

```tsx
function add(a: number, b: any) {
  return a + b;
}

add(10, null);
```



새 프로젝트를 진행한다면 noImplicitAny를 설정하여 코드를 작성할 때마다 타입을 명시하도록 해야 한다. 위 설정의 해제는, JS로 되어있는 기존 프로젝트를 TS로 전환하는 상황에만 필요하다.



### strictNullChecks

이 설정이 true일 경우, 구체적인 값이 예상되는 곳에 null, undefined를 사용하게 되면 type error를 갖게 된다.

```tsx
function add(a: any, b: number) { // strictNullChecks일 경우, 타입 에러를 없애기 위하여 b: number | null 로 선언해줘야 한다.
  return a + b;
}

add(10, null); 
```

이 설정을 사용하지 않을 경우, "undefined 는 객체가 아닙니다" 와 같은 런타임 에러를 만나기 쉽다.



strict 설정을 하게 되면 위 설정 뿐만이 아닌, 다양한 설정들을 사용하여 프로그램 견고성을 보장해준다.





## 아이템3. 코드 생성과 타입이 관계없음을 이해하기



큰 그림에서 보자면, 타입스크립트 컴파일러는 두 가지 역할을 수행한다.

1. 최신 TS / JS 를 브라우저에서 동작할 수 있도록 구 버전의 JS로 transpile 한다.
2. 코드의 타입 오류를 체크한다.



이 두가지는 서로 완벽히 독립적이다. 즉, JS로 변환될 때 코드 내의 타입에 영향을 주지 않으며, 실행 시점에도 영향을 미치지 않는다. 이를 통해 TS가 할 수 있는 일, 없는 일을 짐작할 수 있다.



### 타입 오류가 있는 코드도 컴파일이 가능하다.

컴파일은 타입 체크와 독립적으로 동작하기 때문에, 타입 오류가 있는 코드도 컴파일이 가능하다. 즉, 경고를 알려주지만 빌드를 멈추지 않는다.

만약 오류가 있을 때 컴파일 하지 않으려면, tsconfig.json에 *noEmitOnError*를 설정하거나, 빌드 도구에 적용하면 된다.



### 런타임에는 타입 체크가 불가능하다.

```tsx
interface Square {
  width: number;
}

interface Rectangle extends Square {
  height: number;
}

type Shape = Square | Rectangle;

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) {
    return shape.width * shape.height;
  } else {
    return shape.width * shape.width;
  }
}

calculateArea({ width: 50 });

```



interface나 type alias는 non-class type이므로, interfaceof를 사용할 수 없다. 즉, typescript에서 JS로 컴파일 되는 과정에서 interface, type alias, type 구문들은 제거되기 때문에, Rectangle은 런타임 시점에서 아무 역할을 할 수 없다.

이를 바꾸려면 다음과 같은 방법이 있다. **첫 번째는, height 속성이 존재하는지 체크해 보는 것이다.**

```tsx
function calculateArea(shape: Shape) {
  if ("height" in shape) {
    return shape.width * shape.height;
  } else {
    return shape.width * shape.width;
  }
}
```

속성 체크는 런타임시 접근 가능한 값에 관련되지만, 타입 체커 또한 shape의 타입을 Rectangle로 보정해준다.



또 다른 방법은 태그 기법이다.

```ts
type Square = {
  kind: "square"; // Tag
  width: number;
};

type Rectangle = {
  kind: "rectangle"; // Tag
  height: number;
  width: number;
};

type Shape = Square | Rectangle;

function calculateArea(shape: Shape) {
  if (shape.kind === "rectangle") {
    return shape.width * shape.height;
  } else {
    return shape.width * shape.width;
  }
}

calculateArea({ width: 50, kind: "square" });

```

런타임에 접근 가능한 타입 정보를 명시적으로 저장하는 것이다.



Type(런타임 접근 불가)과 값(런타임 접근 가능)을 둘 다 사용하는 기법도 있다. 타입을 클래스로 만들면 된다.

```tsx
class Square {
  constructor(public width: number) {}
}

class Rectangle extends Square {
  constructor(public width: number, public height: number) {
    super(width);
  }
}

type Shape = Square | Rectangle;

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) {
    console.log(shape);
    return shape.width * shape.height;
  } else {
    console.log(shape);
    return shape.width * shape.width;
  }
}

calculateArea(new Rectangle(50, 20));
```



interface는 타입으로만 사용 가능하지만, class로 선언하면 타입과 값 모두 사용할 수 있다.

즉, `type Shape = Square | Rectangle` 에선 타입으로 참조되지만, `shape instanceof Rectangle` 부분에서는 값으로 참조된다. 



### 타입 연산은 런타임에 영향을 주지 않는다.

 ```tsx
function asNumber(val: number | string): number {
  console.log(val);
  return val as number;
}

asNumber("2");
 ```

위의 코드는 타입 체커를 통과하지만 잘못된 방법을 사용했다. as number는 타입 연산이므로 런타임에 아무런 영향을 미치지 않는다. 

값을 정제하기 위해선 런타임의 타입을 체크해야 하며, JS 연산을 통해 변환을 해주어야 한다.



### 런타임 타입은 선언된 타입과 다를 수 있다.

```tsx
const setLightSwitch = (value: boolean) => {
  switch (value) {
    case true:
      console.log("light on");
      break;
    case false:
      console.log("light off");
      break;
    default:
      console.log("not running");
  }
};

setLightSwitch("on");
```

: boolean 타입은 런타임에 제거가 됩니다. JS는 setLightSwitch("on")을 호출할 수 있고, default 부분의 코드가 실행되게 됩니다.



이 뿐만이 아닌, Data Fetching을 통해 받아온 값으로도 문자열을 넣어서 default가 실행될 수 있다.

즉, TS에서는 런타임 타입과 선언된 타입이 맞지 않을 수 있다. 타입이 달라지는 상황을 가능한 피해야 하지만, 언제든 달라질 수 있다는 점을 명심해야 한다.



### 타입스크립트 타입으로는 함수를 오버로드 할 수 없다.

```tsx
function add(a: number, b: number) {
  return a + b;
}
function add(a: string, b: string) {
  return a + b;
}

add(1, 2);
```

TS는 타입과 런타임의 동작이 무관하기 때문에, 함수 오버로딩이 불가능하다. 선언문으로서 오버로딩을 할 수는 있지만, 이는 컴파일 과정에서 제거되며 구현체만 남게된다.



### 타입 스크립트 타입은 런타임 성능에 영향을 주지 않는다.

타입, 타입 연산자는 JS 변환 시점에 제거되므로, 런타임 성능에 아무런 영향을 주지 않는다. 

다만, 

* 런타임 오버헤드가 없는 대신 '빌드 타입' 오버헤드가 있다. 오버헤드가 커지면, transpile only를 설정하여 타입 체크를 건너뛸 수 있다.
* 타입스크립트가 컴파일 하는 코드는 오래된 환경 지원을 위해 호환성을 높이고, 성능 오버헤드를 감안할지, 호환성을 포기하고 성능 중심의 구현체를 선택할지 문제가 생길 수 있다.
  * 예를 들어, generator 함수가 ES5로 컴파일 되려면 컴파일러는 특정 헬퍼 코드를 추가할 것이다.
  * 이는 컴파일 타깃, 언어 레벨의 문제이며 타입과는 무관하다.





## 아이템4. 구조적 타이핑에 익숙해지기



자바스크립트는 본질적으로 덕 타이핑 기반이다. 타입스크립트는 이를 그대로 모델링한다.



### 덕 타이핑

> ***덕 타이핑이란, 객체가 어떤 타입에 부합하는 변수, 메서드를 가질 경우 객체를 해당 타입에 속하는 것으로 간주하는 것이다.***

```tsx
interface Vector2D {
  x: number;
  y: number;
}

interface NamedVector {
  name: string;
  x: number;
  y: number;
}

function calculateLength(v: Vector2D) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

console.log(calculateLength({ x: 5, y: 5 }));

const v: NamedVector = { x: 3, y: 4, name: "zee" };
console.log(calculateLength(v));
```

위 예제에서, NamedVector 타입이지만 Vector2D와 호환되기 때문에 아무 문제 없이 사용할 수 있다. 



그럼 다음과 같은 문제를 보자.

```tsx
interface Vector2D {
  x: number;
  y: number;
}

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

function calculateLength(v: Vector2D) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalize(v: Vector3D) {
  const length = calculateLength(v);
  console.log(length);
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length
  };
}

console.log(normalize({ x: 3, y: 4, z: 5 }));
```

이 예제는, calculateLength가 Vector2D를 받아야 하는데 Vector3D를 받게 되서 z를 무시하게 된다.

이는 구조적 타이핑 관점에서 Vector2D와 호환되므로, 오류가 발생하지 않고 타입 체커가 문제로 인식하지 않는다.



### Open Type

> ***함수 작성 시, 호출에 사용하는 매개변수의 속성들이 타입에 선언된 속성만을 가질 것이라 생각하기 쉽다 (sealed, precise type).***
>
> ***그러나, 타입스크립트의 타입 시스템은 (open type) 이다.***



이런 구조적 타이핑의 특성 때문에 몇가지 당황스러운 결과가 있다.

```tsx
interface Vector3D {
  x: number;
  y: number;
  z: number;
}

function calculateLengthL1(v: Vector3D) {
  let length = 0;
  for (const axis of Object.keys(v)) {	
    const coord = v[axis];
    length += Math.abs(coord);	//	Error!!
  }
  return length;
}
```

이 코드는 v의 키 값이 string이고 Vector3D의 값들이 number이므로 문제가 없어 보인다.

그러나, 다음과 같이 작성할 수도 있다.

```tsx
const vec3D = {x : 3, y : 4, z : 1, address : '123 테스트'};
calculateLengthL1(vec3D);
```

타입 스크립트는 open type 이므로, 이는 에러가 나지 않는다. 따라서, v[axis]가 어떤 속성이 될 수 있을지 모르므로 number 라고 확정할 수 없다.



```tsx
class C {
  foo: string;
  constructor(foo: string) {
    this.foo = foo;
  }
}

const c = new C("instance of C");
const d: C = { foo: "object literal" };
```

다음 예제에서 d는 string 타입의 foo 속성을 가진다. 그리고 Object.prototype 으로부터 비롯된 생성자를 가진다. 따라서 구조적으로 필요한 속성, 생성자가 존재하기 때문에 문제가 없다.

만약, C의 생성자에 할당이 아닌 연산 로직이 존재한다면 d는 생성자를 실행하지 않으므로 문제가 발생하게 된다.



### 테스트 코드 작성

>  ***이와 같은 특징으로 테스트 코드 작성을 용이하게 할 수 있다.***

```tsx
function getAuthors(database: PostgresDB): Author[]{
  const authorRows = database.runQuery('SELECTOR FIRST, LAST FROM AUTHORS');
  return authorRows.map(row => ({first : row[0], last: row[1]}));
}
```

위 코드를 테스트 하기 위해선 Mocking PostgresDB를 생성해야 한다.

그러나, 구조적 타이핑을 활용해 다음과 같은 인터페이스를 정의할 수 있다.

```tsx
interface DB {
  runQuery: (sql: string) => any[];
}

function getAuthors(database: DB): Author[]{
  const authorRows = database.runQuery('SELECTOR FIRST, LAST FROM AUTHORS');
  return authorRows.map(row => ({first : row[0], last: row[1]}));
}
```

구조적 타이핑 덕분에, PostgresDB가 DB 인터페이스를 구현하는지 선언할 필요가 없다. 



## 아이템5. Any 타입 지양하기



### Gradual , optional

타입 시스템은 타입을 조금씩 추가할 수 있기 때문에 점진적이며, 타입 체커를 언제든 해제할 수 있기 때문에 선택적이다.

그리고 이 기능들의 핵심은 any 타입이다.



우리는 종종 오류가 이해되지 않거나, 타입 체커가 틀렸다고 생각하거나, 타입 선언을 추가하는데 시간을 쏟기 귀찮아 any, 또는 as any를 사용하곤 한다.

그러나 이를 사용하는데 있어 위험성을 알고 있어야 한다.



### any 타입은 타입 안전성이 없다.

as any를 사용하면 number 타입으로 선언된 식별자에 string 을 할당할 수 있게 된다. 이는 타입 체커의 도움을 받을 수 없게 됨을 의미한다.



### any는 함수 시그니처를 무시해 버린다.

함수를 작성할 땐 시그니처를 명시해야 한다. 호출하는 쪽은 약속된 타입을 입력해야 하고, 함수는 약속된 타입 출력을 반환해야 한다.

그러나 any를 사용하면 약속을 어길 수 있다.



### any 타입은 언어 서비스가 제공되지 않는다.

any를 쓰게 되면 자동완성을 할 수 없으며, Rename Symbol 등도 사용할 수 없게 된다. 언어 서비스를 누리는 것은 타입스크립트의 핵심 요소인데, any를 사용하면 이를 못 누리게 된다.



### any 타입은 코드 리팩토링 때 버그를 감춘다.



### any 는 타입 설계를 감춰버린다.

깔끔, 정확, 명료한 코드 작성을 위해 제대로 된 타입 설계는 필수이다.



### any는 타입 시스템의 신뢰도를 떨어뜨린다.
