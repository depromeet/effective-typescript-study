# 3장 타입 추론

* 타입스크립트가 어떻게 타입을 추론하는지
* 언제 타입 선언을 작성해야 하는지
* 타입 추론이 가능하더라도 명시적으로 타입 선언을 작성하는 것이 필요한 상황은 언제인지

## 아이템19) 추론 가능한 타입을 사용해 장황한 코드 방지하기

타입 선언 난무하던 사람... 나야 나...

타입이 추론되면 리팩터링이 용이해진다. 타입스크립트가 타입을 추론할 수 있다면 타입 구문을 작성하지 않는게 좋다.

```ts
interface Product {
    id: number;
    name: string;
    price: number;
}

function logProduct(product: Product) {
    const id: number = product.id;
    const name: string = product.name;
    const price: number = product.price;
    console.log(id, name, price)
}
```

비구조화 할당문을 사용해 구현하는 게 낫다. 하지만 여기에 명시적 타입 구문을 넣는다면 불필요한 타입 선언이 된다.(안해도 된다)

```ts
function logProduct(product: Product) {
    const {id, name, price} = product;
    console.log(id, name, price)
}
```

### 이상적인 타입스크립트 코드

* 함수/메소드 시그니처에 타입 구문을 포함
* 함수 내에서 생성된 지역 변수에는 타입 구문 넣지 않음
* 타입 구문을 생략하여 방해되는 것들을 최소화
* 코드를 읽는 사람이 구현 로직에 집중할 수 있게 하는 것이 좋음

### 타입 선언이 필요한 상황

* 정보가 부족해서 타입스크립트가 스스로 타입을 판단하기 어려운 상황

  위 예제의 `logProduct`의 매개변수의 타입을 지정해준 것

* 객체 리터럴을 정의할 때

  **잉여 속성 체크가 동작**된다.

  변수가 사용되는 순간이 아니라 할당하는 시점에 오류가 표시된다.(타입 구문이 없으면 객체가 사용되는 곳에서 타입 오류 발생)

* 함수의 반환에도 타입을 명시(의도된 반환타입)

  * 타입 추론이 가능할지라도, 구현상의 오류가 함수를 호출한 곳까지 영향을 미치지 않도록 하기 위함

    의도된 반환 타입을 명시하지 않는다면 함수를 사용하는 곳에서 에러가 발생한다.

  * 함수 구현 전에 입력 타입과 출력 타입이 무엇인지 알게 되어 함수의 시그니처가 쉽게 바뀌지 않는다.

  * 명명된(named type)을 사용할 수 있다. 

### 타입 선언이 불필요한 상황

* 함수의 매개변수에 기본값이 있는 경우에는 생략하기도 한다.
* 비구조화 할당문을 사용하여 변수를 선언할 때
* 타입 정보가 있는 라이브러리에서 콜백 함수의 매개변수 타입은 자동 추론된다.



> eslint 규칙 중 `no-inferrable-types` 를 사용하면 작성된 모든 타입 구문이 정말로 필요한지 확인할 수 있다.



## 아이템20) 다른 타입에는 다른 변수 사용하기

변수의 값은 바뀔 수 있지만 그 타입은 보통 바뀌지 않는다.

```ts
let id = '12-34-56'
fetchProduct(id); // string으로 사용
id = 123456;	// error
fetchProductBySerialNumber(id); // error
```

개선된 코드

```ts
let id: string|number = '12-34-56';
fetchProduct(id);
id = 123456;
fetchProductBySerialNumber(id);
```

모두 정상이지만, 더 많은 문제가 생길 수 있다.
id를 사용할 때마다 값이 어떤 타입인지 확인해야 하기 때문에 다루기가 더 어렵다.

차라리 별도의 변수로 두자

```ts
const id = '12-34-56';
fetchProduct(id);
const serial = 123456;
fetchProductBySerialNumber(serial);
```

변수를 무분별하게 재사용하지 말자~~

### 다른 타입에 별도의 변수를 사용해야 하는 이유

* 서로 관련이 없는 두 개의 값을 분리한다.
* 변수명을 더 구체적으로 지을 수 있다.
* 타입 추론을 향상시키며, 타입 구문이 불필요해진다.
* 타입이 좀 더 간결해진다
* let 대신 const 변수를 선언하게 된다.

## 아이템21) 타입 넓히기(widening)

타입스크립트는 지정된 단일 값을 가지고 할당 가능한 값들의 집합을 유추해야 한다

### 넓히기 과정 제어하기

```ts
interface Vec3 {x: number; y:number; z:number}
function getComponent(vector: Vector3, axis: 'x'|'y'|'z') {
  return vector[axis]
}
```



1. const 사용하기

   ```ts
   let x = 'x'; // 타입이 string
   let vec = {x: 10, y:20, z:30};
   getComponent(vec, x); // error string은 'x'|'y'|'z' 형식에 할당될 수 없음
   ```

   ```ts
   const x = 'x'; // 타입이 'x'
   let vec = {x: 10, y:20, z:30};
   getComponent(vec, x); // ok
   ```

2. 타입스크립트의 기본 동작 재정의하기

   1. 명시적 타입 구문 제공

      ```ts
      const v: {x: 1|3|5} = {
        x: 1,
      }
      ```

   2. 타입 체커에 추가적인 문맥을 제공하는 것

   3. const 단언문 사용하기

      값 뒤에 as const를 작성하면, 타입스크립트는 <u>최대한 좁은 타입으로 추론</u>

      ```ts
      const v2 = {
        x: 1 as const,
        y: 2,
      }// 타입은 {x: 1; y:number;}
      ```

      ```ts
      const v3 = {
        x: 1,
        y: 2,
      } as const; // 타입은 {readonly x: 1; readonly y:2;}
      ```

      ```ts
      const a1 = [1, 2, 3]; // number[]
      const a2 = [1, 2, 3] as const; // readonly [1, 2, 3]
      ```

## 아이템22) 타입 좁히기

타입스크립트가 넓은 타입에서 좁은 타입으로 진행하는 것

### 타입을 좁히는 방법

분기문에서 예외를 던지거나 함수를 반환하여 블록의 나머지 부분에서 변수의 타입을 좁힘(1~4)

1. null 체크

2. instanceof

   ```ts
   function contains(text: string, search: string|RegExp) {
     if(search instanceof RegExp) {
       // 타입이 RegExp
     }
     else {
       // 타입이 string
     }
   }
   ```

3. 속성 체크

   ```ts
   interface A { a: number }
   interface B { b: number }
   function pickAB(ab: A|B) {
     if('a' in ab) {
       // 타입이 A
     } else {
       // 타입이 B
     }
     // 타입이 A|B
   }
   ```

4. Array.isArray()

5. 명시적 태그 붙이기

   인터페이스의 속성에 `type` 이 존재해서 유니온 객체일 때 구별할 수 있음

   ```ts
   interface AEvent { type: 'A', name: string; }
   interface BEvent { type: 'B', name: string; }
   type AppEvent = A|B;
   function handleEnvet(e: AppEvent) {
     switch(e.type) {
       case 'A':
         // 타입이 AEvent
         break;
       case 'B':
         // 타입이 BEvent
         break;
     }
   }
   ```

   

### 잘못된 타입 좁히기

1. 유니온 타입에서 null 제외해야 하는데

   ```ts
   const el = document.getElementById('foo')
   if(typeof el === 'object') {
     // 타입이 HTMLElement | null
   }
   ```

2. 기본형 값이 잘못됨

   ```ts
   function foo(x?: number|string|null) {
   	if(!x) {
   		// 타입이 string|number|null|undefined
     }
   }
   ```

   빈 문자열 ''와 0이 false가 되기 때문에 타입이 전혀 좁혀지지 않음

### 사용자 정의 타입 가드

```ts
function isInputElement(el:HTMLElement): el is HTMLInputElement {
    return 'value' in el;
}

function getElementContent(el: HTMLElement) {
    if(isInputElement(el)) {
        // 타입이 HTMLInputElement
        return el.value;
    }
    // 타입이 HTMLElement
    return el.textContent
}
```

**`el is HTMLInputElement ` 는 함수의 반환이 true일 경우 타입 체커에게 매개변수의 타입을 좁힐 수 있다고 알려준다.**

#### 예시

배열과 객체에서 어떤 탐색을 수행할 때 undefined가 될 수 있는 타입을 좁힐 수 있다.

```ts
const jackson5 = ['Jackie', 'Tito', 'Jermaine', 'Marlon', 'Michael'];
const members1 = ['Janet', 'Michael'].map(
    who => jackson5.find(n => n === who)
) // 타입이 (string|undefined)[]
const members2 = ['Janet', 'Michael'].map(
    who => jackson5.find(n => n === who)
).filter(who => who !== undefined) // 타입이 (string|undefined)[]
```

사용자 정의 타입 가드 사용

```ts
function isDefined<T>(x:T|undefined): x is T {
    return x !== undefined;
}
const members = ['Janet', 'Michael'].map(
    who => jackson5.find(n => n === who)
).filter(isDefined) // 타입이 string[]
```

## 아이템23) 한꺼번에 객체 생성하기

타입스크립트의 타입을 일반적으로 변경되지 않기 때문에 객체를 생성할 때 속성을 하나씩 추가하기보다,
**<u>여러 속성을 한꺼번에 생성해야 타입 추론에 유리하다.</u>**

1. 만약 객체를 반드시 제각각 나눠서 만들어야 한다면, 타입 단언문(as)을 사용해 타입 체커를 통과하게 할 수 있다.

   ```ts
   const pt = {} as Point;
   pt.x = 3;
   pt.y = 4;
   ```

2. 작은 객체들을 조합해서 큰 객체를 만들어야 하는 경우에는 객체 전개 연산자를 사용하자

   ```ts
   const namedPoint = {...pt, ...id };
   ```

작은 객체들을 조합해서 큰 객체를 만들어야 하는 경우에는 객체 전개 연산자를 사용하자

3. 모든 업데이트마다 새 변수를 사용하여 각각 새로운 타입을 얻도록하자

   ```ts
   const pt0 = {};
   const pt1 = {...pt0, x: 3}
   const pt: Point = {...pt1, y: 4}
   ```

4. [타입에 안전하게] **조건부 속성**을 추가하기

   null 또는 {}로 객체 전개를 사용

   ```ts
   declare let hasMiddle: boolean;
   const firstLast = {first: 'Harry', last: 'Potter'}
   const president = {...firstLast, ...(hasMiddle ? {middle: 'S'}: {})}
   ```

   ```ts
   // 타입이
   const president: {
       middle?: string | undefined;
       first: string;
       last: string;
   }
   ```

5. 유니온 타입의 속성

   ```ts
   declare let hasDates: boolean;
   const nameTitle = {name: 'Kjufu', title: 'Pharaoh'};
   const pharaoh = {
       ...nameTitle,
       ...(hasDates ? {start: -2589, end: -2566}: {})
   }
   ```

   책에서는 아래처럼 타입이라고 나오는데

   ```ts
   const pharaoh: {
     start: number;
     edn: number;
     name: string;
     title: string;
   } | {
     name: string;
     title: string;
   }
   ```

   typescript playground에서 해보니 아래처럼 나옴(ts v4.1.5 부터 변경됨)

   ```ts
   const pharaoh: {
       start?: number | undefined;
       end?: number | undefined;
       name: string;
       title: string;
   }
   ```

   이전 버전에 이 속성들을 조건부 필드로 표현하고 싶다면 헬퍼 함수 사용

   ```ts
   function addOptional<T extends object, U extends object>(a: T, b: U|null): T&Partial<U> {
       return {...a, ...b}
   }
   const pharaoh = addOptional(
       nameTitle,
       (hasDates ? {start: -2589, end: -2566}: {})
   )
   ```

## 아이템24) 일관성 있는 별칭 사용하기

별칭은 비구조화 할당으로 간견하게 사용할 수 있다. 비구조화 할당을 하면 간결한 문법으로 일관된 이름을 사용할 수 있다.

```ts
interface A {
  a: number;
  b: number;
  c?: {
    x: number;
    y: number
  }
}
```

```ts
function func(param: A) {
  const {c} = A;
  if(c) {
    const {x, y} = c;
    if(...)
  }
}
```

### 객체 비구조화를 사용할 때 주의할 것

1. c 속성이 아니라 x와 y가 선택적 속성일 경우에 속성 체크가 더 필요하다.

   **타입의 경계에 null값을 추가하는 게 바람직하다**

2. 배열이 선택적 속성이라면, 값이 없거나 빈 배열이었을 것

   차이가 없는데 이름을 구별했다. **빈 배열도 해당 속성이 없는 것을 충분히 나타낼 수 있다.**

   (배열일 경우 선택적 속성을 두지 말라는 말)

3. 타입스크립트는 함수가 타입 정제를 무효화하지 않는다고 가정하지만, 실제로는 무효화될 가능성이 있다. 

   비구조화 할당을 통해 속성을 지역 변수로 뽑아내서 사용하면 해당 속성의 타입을 정확하게 유지되지만 **원본 객체의 값과 같게 유지되지 않을 수 있다.**

