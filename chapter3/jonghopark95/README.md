# 3장. 타입 추론



### 개요

기존 산업계에서 사용하는 프로그래밍 언어는 타입을 직접 명시한다. 

그러나 학술계에서 사용되는 언어는 오래 전부터 정교한 타입 추론 시스템을 가지고 있었다. 

학술계 언어의 발전에따라 기존 산업계의 언어에서도 타입 추론 시스템이 추가되었고, C++은 auto, 자바는 var를 추가하는 식으로 발전했다.

타입스크립트도 타입 추론을 적극적으로 수행한다. 

3장에서는 다음과 같은 것을 배운다.

* 타입 추론에서 발생할 수 있는 몇 가지 문제와 그에 대한 해법
* 타입 스크립트가 타입을 추론하는 방법
* 타입 선언을 작성해야 할 때
* 타입 추론이 가능하더라도 명시적으로 타입 선언을 작성하는 것이 필요한 상황





## 아이템 19. 추론 가능한 타입을 사용해 장황한 코드 방지하기

### 타입 스크립트의 타입 추론 시스템은 생각보다 정교하다.

모든 코드의 변수에 타입을 선언하는 것은 비생산적이며 형편없는 스타일이다.

```tsx
let x:number = 12;
let x = 12;
```

위 코드에서 x에 마우스를 올려 보면 타입이 number로 이미 추론되어 있음을 확인할 수 있다.



타입스크립트는 더 복잡한 객체도 추론할 수 있으며, 다음과 같은 함수도 어떤 타입을 반환하는 지 정확하게 알고 있다.

```tsx
function square(nums: number[]){
  return nums.map(x => x * x);
}
const squares = square([1, 2, 3, 4]); // 타입은 number[]
```



심지어 타입스크립트는 우리들의 예상보다 더 정확하게 추론하기도 한다.

```tsx
const axis1: string = 'x'; // 타입은 string
const axis2 = 'y'; // 타입은 y
```

 string이 아닌 'y'가 더 정확한 타입이다.



비구조화 할당문은 모든 지역 변수 타입이 추론되게한다. 여기서 명시적 타입 구문을 넣으면 불필요한 타입 선언으로 오히려 코드가 번잡해진다.

```tsx
interface Product {
  id: string;
  name: string;
  price: number;
}

function logProduct(product: Product) {
  const { id, name, price } = product;
  console.log(id, name, price);
}
```



### 명시적 타입 구문이 필요한 상황

정보가 부족해 타입 스크립트가 타입을 판단하기 어려운 상황도 존재한다. 이럴 때는 명시적 타입 구문이 필요하다.


> ***이상적인 타입스크립트 코드는 함수/메서드 시그니처에 타입 구문을 포함하지만,*** 
>
> ***함수 내에서 생성된 지역 변수에는 타입 구문을 넣지 않는다.***



구문을 생략하여 방해 되는 것을 최소화하고, 코드를 읽는 사람이 구현 로직에 집중할 수 있게 하는 것이 좋다.

함수 매개변수에 타입 구문을 생략하는 경우도 있다.

```tsx
function parseNumber(str: string, base=10){
  // ...
}
```

위와 같은 경우엔 기본값이 10이므로 base 타입은 number로 추론된다.



> ***보통 타입 정보가 있는 라이브러리에서,*** 
>
> ***콜백 콜백 함수의 매개변수 타입은 자동으로 추론된다.***



```tsx
// 이렇게 하는 것은 좋지 않다.
app.get('/health', (request: express.Request, response: express.Response) => {
  response.send("OK");
})

// 이렇게 합시당
app.get('/health', (request, response) => {
  response.send("OK");
})
```

위와 같은 코드에서, express HTTP 서버 라이브러리를 사용하는 경우 타입 선언은 필요 없다.





> ***타입이 추론됨에도 타입을 명시하고 싶은 상황이 있다.*** ***바로 객체 리터럴을 정의할 때이다.***



```tsx
type Product = {
  name: string;
  id: string;
  price: number;
};

const elmo: Product = {
  name: "Tickle Me Elmo",
  id: "12312313",
  price: 30
};

const furby = {
  name: "Furby",
  id: 1231231231,
  price: 35
};

const logProduct = (product: Product) => console.log(product);

logProduct(furby); // ERROR: ~~형식의 매개변수는 'Product' 형식에 할당될 수 없다... 어쩌구저쩌구
```

위와 같이 타입을 명시하면 잉여 속성 체크가 동작한다.

만약, 위의 코드처럼 furby에 타입을 할당하지 않으면, 잉여 속성 체크가 동작하지 않는다.

따라서 객체를 선언한 곳이 아닌, 객체를 사용하는 곳에서 타입 오류가 발생한다.



타입 구문을 제대로 명시하면 실제로 실수가 발생한 부분에 오류를 표시한다.

```tsx
const furby: Product = {
  name: "Furby",
  id: 1231231231,	// ERROR: number는 string에 할당할 수 없습니다...
  price: 35
};
```



> ***함수의 반환에도 타입을 명시하여 오류를 방지할 수 있다.***



타입 추론이 가능할지라도, 구현상의 오류가 함수를 호출한 곳 까지 영향을 끼치지 않도록 타입 구문을 명시하는 것이 좋다.

반환 타입을 명시하면, 구현상의 오류가 사용자 코드의 오류로 표시되지 않는다.

반환 타입을 사용하는 이점은 두 가지 더 있다.

1. 함수에 대해 더욱 명확하게 알 수 있다. 
2. 명명된 타입을 사용할 수 있다.
3. 반환 값을 별도의 타입으로 정의하면 타입에 대한 주석을 작성할 수 있다.



### 정리

* 타입스크립트가 타입 추론이 가능하다면 타입 구문을 작성하지 않는 것이 좋다.
* 이상적인 경우, 함수 / 메서드의 시그니처에는 타입 구문이 있지만, 함수 내의 지역 변수에는 타입 구문이 없다.
* 추론될 수 있는 경우라도 객체 리터럴과 함수 반환에는 타입 명시를 고려해야 한다.





## 아이템 20. 다른 타입에는 다른 변수 사용하기

자바 스크립트에선 한 변수가 다른 목적을 가지는 다른 타입으로 재사용해도 문제가 없다.

```tsx
const logNumber = (val: number) => console.log(val);
const logString = (val: string) => console.log(val);

let id = "12-34-56";
logString(id);
id = 123456;
logString(id);
```



그러나, 타입스크립트에선 두 가지 오류가 발생한다.

```tsx
const logNumber = (val: number) => console.log(val);
const logString = (val: string) => console.log(val);

let id = "12-34-56";
logString(id);
id = 123456;	//	ERROR: Type 'number' is not assignable to type 'string'.
logNumber(id);	//	ERROR: Argument of type 'string' is not assignable to parameter of type 'number'.
```

여기서 다음과 같은 중요한 관점을 알 수 있다.



> ***변수의 값은 바뀔 수 있지만, 그 타입은 보통 바뀌지 않는다.***



위의 문제를 해결하려면 유니온 타입을 사용하면 되겠지만, id를 사용할 때마다 더 많은 문제가 생길 수 있으므로 차라리 별도의 변수를 도입하는 것이 낫다.

```tsx
const id = "12-34-56";
logString(id);
const serial = 123456;
logNumber(serial);
```



다른 타입에 별도의 변수를 사용하는 것이 바람직한 이유는 다음과 같다.

1. 서로 관련이 없는 두 개의 값을 분리한다.
2. 변수명을 더 구체적으로 지을 수 있다.
3. 타입 추론을 향상시키며, 타입 구문이 불필요해진다.
4. 타입이 좀 더 간결해진다. (유니온 타입을 제거함)
5. let 대신 const로 변수를 선언하게 된다. const는 코드가 간결해지고, 타입 체커가 타입을 추론하기에도 좋다.





## 아이템 21. 타입 넓히기



### 타입 넓히기

런타임에 모든 변수는 유일한 값을 가진다.

그러나, 타입스크립트가 작성된 코드를 체크하는 정적 분석 시점에 변수는 '가능한' 값들의 집합인 타입을 가진다.



변수를 초기화할 때, 타입을 명시하지 않으면 타입 체커는 타입을 결정해야 한다.

> ***즉, 단일 값을 가지고 할당 가능한 값들의 집합을 유추해야 한다.***
>
> ***타입스크립트는 이러한 과정을 ''넓히기'' 라고 부른다.***



다음 코드를 보자.

```tsx
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

function getComponent(vector: Vector3, axis: "x" | "y" | "z") {
  return vector[axis];
}

let x = "x";
let vec = { x: 10, y: 20, z: 30 };
getComponent(vec, x);	// ERROR: Argument of type 'string' is not assignable to parameter of type '"x" | "y" | "z"'.
```

x의 타입은 할당 시점에 넓히기가 동작하여 string으로 추론되었다.



타입 넓히기가 진행될 때, 주어진 값으로 추론 가능한 타입이 여러 개이므로 과정이 상당히 모호해진다. 

다음 코드를 보자.

```tsx
const mixed = ['x', 1];
```

mixed가 될 수 있는 타입의 후보는 상당히 많다.

* ('x' | 1)[]
* ['x', 1]
* [string, number]
* readonly [string, number]
* (string | number)[]
* readonly (string | number)[]
* [any, any]
* any[]



정보가 충분하지 않다면 어떤 타입으로 추론되어야 할지 알 수 없다. 이런 경우, 타입 스크립트는 작성자의 의도를 추측한다.

그러나 타입스크립트가 아무리 영리해도 사람의 마음을 읽을 수 없고, 추측한 답이 항상 옳을 수도 없다.



### 해결책

타입스크립트는 넓히기의 과정을 제어할 수 있도록 몇 가지 방법을 제공한다.



**첫 번째는 const이다.**

const를 사용하면 앞서 말한 오류가 해결된다.

```tsx
const x = "x";
let vec = { x: 10, y: 20, z: 30 };
getComponent(vec, x);
```



그러나 이 방법은 만능이 아니다. 배열이나 객체의 경우 여전히 문제가 발생한다.

```tsx
const v = {
  x: 1
};

v.x = 3;
v.x = "3";
v.y = 4;
v.name = "Pythagoras";
```

v는 구체적인 정도에 따라 다양한 모습으로 추론될 수 있다.

**가장 구체적인 경우는 {readonly x: 1}이며, 조금 추상적인 정도는 {x: number}, 가장 추상적인 경우는 {{[key: string]: number; }}가 된다.**

객체의 경우, 타입스크립트의 넓히기 알고리즘은 각 요소를 let으로 할당된 것 처럼 다룬다.

따라서 {x : number; }가 된다.



위와 같은 타입 추론의 강도를 직접 제어하려면 타입스크립트의 기본 동작을 재정의해야 한다.

타입스크립트의 기본 동작을 재정의하는 방법은 세 가지가 있다.

1. 명시적인 타입 구문을 제공하는 것이다.

   ```tsx
   const v: { x: 1 } = {
     x: 1
   };
   ```

   

2. 타입 체커에 추가적인 문맥을 제공하는 것이다. 
   예를 들으면 함수의 매개변수로 값을 전달하는 케이스이다.

3. 마지막으로, as const 단언문을 사용하는 것이다.

   ```tsx
   const v = {
     x: 1,
     y: 2
   } as const;
   ```

   값 뒤에 **as const를 작성하면 타입스크립트는 최대한 좁은 타입으로 추론한다.**


또한 배열을 튜플 타입으로 추론할 때도 as const를 사용할 수 있다.

   ```tsx
const a1 = [1, 2, 3] as const; // readonly [1, 2, 3]
   ```



## 아이템 22. 타입 좁히기



타입 좁히기는 넓은 타입으로부터 좁은 타입으로 진행하는 과정을 말한다.

다음 코드를 보자.

```tsx
const el = document.getElementById("foo"); // HTMLElement | null
if (el) {
  el;	//	HTMLElement
  el.innerHTML = "party time".blink();
} else {
  el;			//	null
  alert("no element");
}
```

타입 체커는 일반적으로 이런 조건문에서 타입 좁히기를 잘 해내지만, 타입 별칭이 존재한다면 그러지 못할 수도 있다.



### 타입 좁히기의 방법

타입 좁히기의 방법은 다양하다.

* **분기문에서 예외를 던지거나 (throw...) 함수를 return 하기**
* **instanceof 사용하기**
* **객체 내부의 속성 체크 사용하기** 
* **Array.isArray와 같은 일부 내장 함수 사용하기**



### 잘못된 타입 좁히기

타입을 섣불리 판단하는 실수를 저지르기 쉬우므로 꼼꼼히 따져봐야 한다.

```tsx
const el = document.getElementById("foo");
if (typeof el === "object") {
  el;		//	HTMLElement || null
}
```

JS에서는 typeof null이 'object'이므로, null이 제외되지 않는다.



또한 기본형 값이 잘못되도 비슷한 사례가 발생한다.

```tsx
function foo(x?: number | string | null) {
  if (!x) {
    x;		//	x: string | number | null | undefined
  }
}
```

빈 문자열 '' 과 0이 모두 false가 되므로, 타입은 좁혀지지 않는다.

그리고 x는 여전히 블록 내에서 string 또는 number가 된다



### 타입을 좁히는 또 다른 방법 1 - 명시적 '태그' 붙이기

```tsx
interface UploadEvent {
  type: "upload";
  filename: string;
  contents: string;
}

interface DownloadEvent {
  type: "download";
  filename: string;
}

type AppEvent = UploadEvent | DownloadEvent;

function handleEvent(e: AppEvent) {
  switch (e.type) {
    case "download":
      e;  // 	DownloadEvent
      break;
    case "upload":
      e;	//	UploadEvent
      break;	
  }
}
```

이 패턴은 tagged union 또는 discriminated union이라고 불린다.



### 타입을 좁히는 또 다른 방법 2 - 커스텀 함수 도입하기

```tsx
function isInputElement(el: HTMLElement): el is HTMLInputElement {
  return "value" in el;	//	true
}

function getElementContent(el: HTMLElement) {
  if (isInputElement(el)) {
    el;
    return el.value;
  }
  el;
  return el.textContent;
}
```

위와 같은 기법을 `사용자 정의 타입 가드` 라고 한다.

반환 타입이 `el is HTMLInputElement` 는 함수의 반환이 true인 경우, 타입 체커에세 매개변수의 타입을 좁힐 수 있다고 알려준다.



### 타입을 좁히는 또 다른 방법 3 - 타입 가드 사용하기

```tsx
const jackson5 = ["Jackie", "Tito", "Jermaine", "Marlon", "Michael"];
const members = ["Janet", "Michael"].map((who) =>
  jackson5.find((n) => n === who)
);			//	(string | undefined)[]

console.log(members); // [undefined, "Michael"]
```

해당 코드에서, members는 Janet이 있으므로 [undefined, "Michael"]을 반환한다.



타입 중 undefined를 거르려면 애매하다. filter를 사용해도 잘 동작하지 않는다.

```tsx
const jackson5 = ["Jackie", "Tito", "Jermaine", "Marlon", "Michael"];
const members = ["Janet", "Michael"]
  .map((who) => jackson5.find((n) => n === who))
  .filter((who) => who !== undefined);		//	const members: (string | undefined)[]

console.log(members);	//	["Michael"]  => type (string | undefined)[]
```



이럴 경우, 타입 가드를 사용하면 타입을 좁힐 수 있다.

```tsx
const isDefined = <T>(x: T | undefined): x is T => x !== undefined;

const jackson5 = ["Jackie", "Tito", "Jermaine", "Marlon", "Michael"];
const members = ["Janet", "Michael"]
  .map((who) => jackson5.find((n) => n === who))
  .filter(isDefined);

console.log(members);	//	type (string)[]
```



## 아이템 23. 한꺼번에 객체 생성하기



변수의 값은 변경될 수 있지만, 타입스크립트의 타입은 일반적으로 변경되지 않는다.

즉, 객체를 생성할 때는 속성을 하나씩 추가하기보다는 여러 속성을 포함해서 한꺼번에 생성해야 타입 추론에 유리하다.



```tsx
const pt = {};
pt.x = 3; // ERROR: Property 'x' does not exist on type '{}'
pt.y = 4; // ERROR: Property 'y' does not exist on type '{}'
```

위 코드는 각 할당문에서 에러가 발생한다.

첫 번쨰 줄의 pt 타입이 {} 값을 기준으로 추론되므로, 존재 하지 않는 속성을 추가할 수 없기 때문이다.



이 문제는 한꺼번에 객체를 정의하면 해결할 수 있다.

```tsx
const pt = {
  x: 3,
  y: 4
};
```



반드시 제각각 나눠서 만들어야 한다면, 타입 단언문을 사용해 통과하게 만들수 있다.

```tsx
type Point = { x: number; y: number };

const pt = {} as Point;
pt.x = 3;
pt.y = 4;
```



### 작은 객체 조합해서 큰 객체 만들기

이런 경우도 여러 단계를 거치는 것은 좋은 케이스가 아니다.

```tsx
const pt = { x: 3, y: 4 };
const id = { name: "pythagoras" };
const namedPoint = {};
Object.assign(namedPoint, pt, id);
console.log(namedPoint.name); // ERROR: Property 'name' does not exist on type '{}'
```



spread 연산자를 사용하면 큰 객체를 한꺼번에 만들 수 있다.

```tsx
const pt = { x: 3, y: 4 };
const id = { name: "pythagoras" };
const namedPoint = { ...pt, ...id };
console.log(namedPoint.name); // OK!!!
```



### 조건부 속성 추가하기

타입에 안전한 방식으로 조건부 속성을 추가하려면, 속성을 추가하지 않는 null 또는 {}로 객체 전개를 사용하면 된다.

```tsx
declare let hasMiddle: boolean;

const firstLast = { first: "Harry", lat: "Truman" };
const president = { ...firstLast, ...(hasMiddle ? { middle: "5" } : {}) };

// Type:
// const president: {
//    middle?: string | undefined;
//    first: string;
//    lat: string;
// }
```

president 의 타입은 위와 같이 선택적 속성을 가지는 것으로 추론된다.



다음과 같이 표현할 수도 있다.

```tsx
declare let hasDates: boolean;

const nameTitle = { name: "Khufu", title: "Pharaoh" };

const addOptional = <T extends object, U extends object>(
  a: T,
  b: U | null
): T & Partial<U> => {
  return { ...a, ...b };
};

const pharaoh = addOptional(
  nameTitle,
  hasDates ? { start: -2589, end: -2566 } : null
);

console.log(pharaoh.start);

// const pharaoh = {
//   ...nameTitle,
//   ...(hasDates ? { start: -2589, end: -2566 } : {})
// };
// console.log(pharaoh.start);
```

위 코드 처럼 선택적 필드를 표현하려면 헬퍼 함수를 사용하면 된다.



### 정리

* 속성을 제각각 추가하지말고 한꺼번에 객체로 만들어야 한다.
  안전한 타입으로 속성을 추가하려면 객체 전개를 사용하면 된다. `({...a, ...b})`

* 객체에 조건부로 속성을 추가하는 방법을 익혀야 한다.



## 아이템 24. 일관성 있는 별칭 사용하기

아래 코드를 보자.

```tsx
interface Coordinate {
  x: number;
  y: number;
}

interface BoundingBox {
  x: [number, number];
  y: [number, number];
}

interface Polygon {
  exterior: Coordinate[];
  holes: Coordinate[][];
  bbox?: BoundingBox;
}

function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  if (polygon.bbox) {
    if (
      pt.x < polygon.bbox.x[0] ||
      pt.x > polygon.bbox.x[1] ||
      pt.y < polygon.bbox.y[0] ||
      pt.y > polygon.bbox.y[1]
    ) {
      return false;
    }
  }
}
```

Polygon은 점과 외각으로 이루어지는데, bbox는 어떤 점이 다각형에 포함되는지 파악하는 최적화 속성이다.



위의 코드는 잘 동작하지만, 반복되는 구문이 동작한다.

특히, polygon.bbox는 5번이나 등장한다. 이 중복을 줄이기 위해 임시 변수를 사용할 수 있다. 

```tsx
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const box = polygon.bbox; // 	type => box: BoundingBox | undefined
  if (polygon.bbox) {
    polygon.bbox; // type => Polygon.bbox?: BoundingBox
    box;					//	type => box: BoundingBox | undefined
    if (
      pt.x < box.x[0] ||	//	ERROR: Object is possibly 'undefined'
      pt.x > box.x[1] ||
      pt.y < box.y[0] ||
      pt.y > box.y[1]
    ) {
      return false;
    }
  }
}
```



위 코드는 에러가 뜬다. 속성 체크는 polygon.bbox를 정제했지만, box는 그렇지 않았기 때문이다.


>  ***이 에러를 막으려면 "별칭은 일관성있게 사용한다"라는 기본 원칙을 지켜야 한다.***



```tsx
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const box = polygon.bbox;
  if (box) {
    if (
      pt.x < box.x[0] ||
      pt.x > box.x[1] ||
      pt.y < box.y[0] ||
      pt.y > box.y[1]
    ) {
      return false;
    }
  }
}
```

타입 체커의 문제는 해결되었지만 코드를 읽는 사람에게는 문제가 남아있는데, 바로 box, bbox는 같은 값인데 다른 이름을 사용했기 때문이다.

이는 객체 비구조화를 이용하면 간결하게 사용할 수 있다.

```tsx
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const { bbox } = polygon;
  if (bbox) {
    const { x, y } = bbox;
    if (pt.x < x[0] || pt.x > x[1] || pt.y < y[0] || pt.y > y[1]) {
      return false;
    }
  }
}
```



### 정리

* 별칭은 타입스크립트가 타입을 좁히는 것을 방해한다. 따라서, 변수에 별칭을 사용할 때는 일관되게 사용해야 한다.





## 아이템 25. 비동기 코드에는 콜백 대신 async 함수 사용하기



### Callback과 Promise, async / await

과거 JS는 비동기 동작을 모델링하기 위해 콜백을 사용했다.

이에 악명 높은 콜백 지옥이 나올 수 밖에 없었다.

```tsx
const fetchURL = (cb) => setTimeout(cb);

fetchURL(() => {
  fetchURL(() => {
    fetchURL(() => {
      console.log(1);
    });
    console.log(2);
  });
  console.log(3);
});

console.log(4);

// 4 
// 3
// 2
// 1
```



이는 실행 순서와 코드의 순서가 반대이므로, 직관적으로 이해하기 어렵다.



ES6는 이를 극복하기 위해 promise 개념을 도입한다.

또, ES2017에선 async, await 키워드를 도입하여 더욱 간단하게 처리하게 되었다.



### 타입스크립트에서의 async, await

타입스크립트는 ES5 또는 더 이전 버전을 대상으로 할 때, async await이 동작하도록 더 정교환 변환을 수행한다.

이는 TS가 런타임에 관계없이 async / await 을 사용할 수 있음을 시사한다.

async await 의 장점은 다음과 같다.

* 콜백보다 프로미스가 코드를 작성하기 쉽다.
* 콜백보다 프로미스가 타입을 추론하기 쉽다.



다음 코드를 보자.

```tsx
async function fetchPages() {
  // res1, res2, res3은 Response로 타입 추론된다.
  const [res1, res2, res3] = await Promise.all([
    fetch(url1),
    fetch(url2),
    fetch(url3)
  ]);
}
```

타입스크립트는 세 가지 response 변수 타입을 Response로 추론한다.

만약, 콜백 스타일로 작성하게 된다면 더 많은 코드와 타입 구문이 필요하게 된다.



Promise.race로 타입 추론과 잘 맞다.

```tsx
function timeout(millis: number): Promise<never> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject("timeout"), millis);
  });
}

// function fetchWithTimeout(url: string, ms: number): Promise<Response>
async function fetchWithTimeout(url: string, ms: number) {
  return Promise.race([fetch(url), timeout(ms)]);
}
```

타입 구문이 없어도 fetchWIthTimeout의 반환 타입은 Promise<Response> 이다.

이는, Promise.race의 반환 타입이 입력 타입의 유니온이고, 현 상황에서는 Promise<Response | never> 인데 never는 공집합이므로 Promise<Response>로 추론되는 것이다.



### 함수는 항상 동기 또는 비동기로 실행되어야 한다.

다음 코드를 보자.

```tsx
const _cache: { [url: string]: string } = {};
function fetchWithCache(url: string, callback: (texT: string) => void) {
  if (url in _cache) {
    callback(_cache[url]);
  } else {
    fetchURL(url, (text) => {
      _cache[url] = text;
      callback(text);
    });
  }
}

function getUser(userId: string) {
  fetchWithCache(`/user/${userId}`, (profile) => {
    requestStatus = "success";
  });

  requestStatus = "Loading";
}
```

만약, cache가 되어있다면 동기적으로 callback을 호출하고, 아니라면 비동기 호출을 하게 된다.

getUser의 입장에서, 캐싱되어있지 않으면 Loading 후 success가 되지만,

캐싱 되어 있다면 success가 되었다가 바로 loading이 된다.



async를 두 함수에 모두 사용하면 일관적인 동작을 강제하게 된다.

```tsx
async function fetchWithCache(url:string){
  if (url in _cache) {
    return _cache[url];
  }
  const response = await fetch(url);
  const text = await response.text();
  _cache[url] = text;
  return text;
}

async function getUser(userId: string){
  requestStatus = 'loading';
  const profile = await fetchWithCache(`/user/${userId}`);
  requestStatus = 'success';
}
```



### 콜백, Promise 보다는 async/await !!



만약, Promise를 직접 생성해야 할 때, 선택의 여지가 있다면 일반적으로는 Promise 보단 async/await 을 사용해야 한다.

다음을 보자.

```tsx
// const getNumber: () => Promise<number>

async function getNumber() {
  return 42;
}

const getNumber = async () => 42;

const getNumber = () => Promise.resolve(42);
```

위 세 코드는 모두 같은 타입을 가진 함수이다.



위의 fetch 예제와 같이 콜백, 프로미스를 사용하게 되면 실수로 반동기 코드를 작성할 수 있지만, async를 사용하면 항상 비동기 코드를 작성할 수 있게 된다.



### async 함수 내에서 Promise 반환하기

만약, async 함수 내에서 Promise를 반환하게 되면 또 다른 프로미스로 래핑되지 않는다.

```tsx
async function getJSON(url: string) { // function getJSON(url: string): Promise<any>
  const response = await fetch(url);
  const jsonPromise = response.json(); // const jsonPromise: Promise<any>
  return jsonPromise;
}
```





## 아이템 26. 타입 추론에 문맥이 어떻게 사용되는지 이해하기



### 타입 추론에서 문맥이 어떻게 사용되는가?

타입 스크립트는 타입 추론시 단순히 값만 고려하지 않는다. 값이 존재하는 곳의 문맥까지 살피게 된다.

근데, 문맥을 고려해 타입을 추론하면 가끔 이상한 결과가 나온다.

```tsx
type Language = "Javascript" | "Typescript";

function setLanguage(language: Language) {
  console.log(language);
}

setLanguage("Javascript");
let language = "Javascript";
setLanguage(language); // Argument of type 'string' is not assignable to parameter of type 'Language'.
```



setLanguage에 문자열 리터럴로 매개변수를 넣어주는 것은 정상이다.

그러나, 변수로 분리하면 타입스크립트는 할당 시점에 타입을 추론하게 되고, string은 할당할 수 없으므로 오류가 발생한다.



이 에러의 해결방안은 다음 두 가지이다.

1. 타입 선언에서 language의 가능한 값을 제한한다.

   ```tsx
   let language: Language = "Javascript";
   ```

   

2. language를 상수로 만든다.

   ```tsx
   const language = "Javascript";
   ```

   이 방법은 사용되는 문맥으로부터 값을 분리하게 되므로, 추후에 문제를 발생시킬 수 있다.
   아래에선 문맥의 소실로 인한 오류의 케이스를 소개하겠다.



### 튜플 사용 시의 문제점

튜플 사용 시에도 같은 문제가 발생한다.

```tsx
function panTo(where: [number, number]) {
  console.log(where);
}

panTo([10, 20]);
const loc = [10, 20];
panTo(loc); // Argument of type 'number[]' is not assignable to parameter of type '[number, number]'.
```



이를 해결할 방법은 '상수 문맥' 을 제공하는 것이다.

```tsx
const loc = [10, 20] as const;
panTo(loc); // Argument of type 'readonly [10, 20]' is not assignable to parameter of type '[number, number]'
```

그러나, 이는 너무 과하게 정확하다. panTo의 매개변수는 불변을 보장하진 않는다. 

이를 고칠 수 있는 방안은 매개변수에 readonly를 추가하는 것이다.

```tsx
function panTo(where: readonly [number, number]) {
  console.log(where);
}

panTo([10, 20]);
const loc = [10, 20] as const;
panTo(loc);
```



as const는 문맥 손실과 관련된 문제를 해결할 수 있으나, 
만약 타입 정의에서 실수가 있었다면 오류가 타입 정의가 아닌 호출시에 발생한다. 



### 객체 사용 시 주의점

문맥에서 값을 분리하는 문제는 객체에서도 발생한다.

```tsx
// Object Literal
type Language = "Javascript" | "Typescript" | "Python";
interface GovernedLanguage {
  language: Language;
  organization: string;
}

function complain(language: GovernedLanguage) {
  console.log(language);
}

complain({ language: "Typescript", organization: "Microsoft" });

const ts = { language: "Typescript", organization: "Microsoft" } as const;
complain(ts);
```

위와 같이, as const 를 추가하지 않으면 string으로 추론하게 된다.

이는 as const나 타입 선언을 추가하면 된다.



### 콜백 사용 시 주의점

```tsx
// Function
function callWithRandomNumbers(fn: (n1: number, n2: number) => void) {
  fn(Math.random(), Math.random());
}

callWithRandomNumbers((a, b) => {
  a;
  b;
  console.log(a + b);
});

const fn = (a, b) => {
  a; // Parameter 'a' implicitly has an 'any' type, but a better type may be inferred from usage.
  b;
  console.log(a + b);
};

callWithRandomNumbers(fn);
```

위와 같이 콜백 함수의 매개변수 추론을 위해 문맥을 사용하게 되는데,

만약 값으로 뽑아내게 될 경우 문맥이 소실되고 noImplicitAny 에러가 발생한다.

위와 같은 경우는 매개변수에 타입 구문을 추가하거나, 전체 함수 표현식에 타입 선언을 적용하면 된다.





## 아이템 27. 함수형 기법과 라이브러리로 타입 흐름 유지하기



### 타입스크립트에서의 함수형 기법들

함수형 기법은 타입 정보가 그대로 유지되면서 타입 흐름이 계속 전달되도록 한다.

그러나, 이를 직접 절차형으로 구현한다면 타입 체크에 대한 관리를 직접해야 한다.



### 타입스크립트에서의 외부 라이브러리 함수들

자바스크립트에서는 표준 라이브러리가 존재하지 않는다.

많은 라이브러리가 이 역할을 대신하기 위해 만들어졌다. 그러나, JS는 의존성을 추가하기 위해 신중해야 한다.

만약, 서드파티 라이브러리 기반으로 코드를 짧게 줄이는데 시간이 많이 든다면, 사용하지 않는게 나을 수도 있기 때문이다.



그러나, 같은 코드를 타입스크립트로 작성하면 서드파티 라이브러리를 사용하는 것이 무조건 유리하다.

타입 정보를 참고하며 작업할 수 있기 때문이다.



넓게 보면, 타입스크립트의 많은 부분이 자바스크립트 라이브러리의 동작을 정확히 모델링하기 위해 개발되었다.

타입 흐름을 개선하며 가독성을 높이고, 명시적인 타입 구문의 필요성을 줄이기 위해선 직접 구현하기 보단, 내장된 함수형 기법과 유틸리티 라이브러리를 사용하는 것이 좋다. 

그러므로, 타입스크립트의 원래 목적을 달성하기 위해선 라이브러리를 사용할 때 타입 정보가 유지되는 점을 잘 활용해야 한다.

