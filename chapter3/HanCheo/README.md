# 아이템

> 17. 변경 관련된 오류방지를 위해 readonly 사용하기   
> 18. 매핑된 타입을 사용하여 값을 동기화 하기   
> 19. 추론 가능한 타입을 사용하여 장황한 코드 방지하기   
> 20. 다른 타입에는 다른 변수 사용하기   
> 21. 타입 넓히기   
> 22. 타입 좁히기   
> 23. 한꺼번에 객체를 정의하기   
> 24. 일관성 있는 별칭 사용하기   

## 아이템 17 변견 관령된 오류 방지를 위해 readonly 사용하기

### Readonly? Object.freeze?

readonly라는 키워드를 보고 바로 떠오른 것이 있다. 바로 [Object.freeze](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)이다. 그래서 readonly라는 키워드만 보고 생각했을때 이 키워드를 사용하면 freeze를 해주는 건가 싶었다. 
역시 타입스크립트 응애답게 틀렸고 이 키워드는 아이템 16과 비슷하게 number 인덱스 시그니처를 허용해 주 듯이 타입스크립트만의 특징으로 가지고 있는 요소였다.

타입에러가 나도 빌드는 할수 있으므로 테스트를 해보면 별도로 감싸거나 변환 해주는 동작은 없는 것으로 나타난다. 

```typescript
const a: readonly string[] = ['a', 'b', 'c']

a[0] = 'd' //error Index signature in type 'readonly string[]' only permits reading.
console.log(a)

// 변환된 자바스크립트 코드 no Error
const a = ['a', 'b', 'c'];
a[0] = 'd';
console.log(a);
//['d', 'b', 'c']
```

그렇다면 단순히 타입 error만 검증해서 자바스크립트의 Object.freeze를 대체할수 있을까 ?? 그건 아닌 것 같다. 다음 코드로 확인 할 수 있다.

```typescript
const a = Object.freeze(['a', 'b', 'c'])
a[0] = 'd' //error Index signature in type 'readonly string[]' only permits reading.
console.log(a)

// [ERR]: "Executed JavaScript Failed:" 
// [ERR]: Cannot assign to read only property '0' of object '[object Array]' 
```

위 2가지 코두 모두 `a`는 동일한 타입을 가진다. 다만 freeze로 한 a는 런타임 환경에서도 에러를 출력할 수 있다. Object freeze는 좀더 객체 수정에 대해서 엄격하게 잡아 낼수 있는 장점이 있다.

그러면 여기서 추가적으로 생각나는 것이 바로 Object freeze 의 성능 적인 부분이 고민이 된다. 값을 Object freeze로 한번 더 감싸는 것이므로 추가적인 과정 소모가 있으니 속도는 느릴것이 예상된다.

### Object.freeze 테스트 

<sub>크롬 V8을 기준으로 테스트함</sub>

```javascript
// 배열 테스트
console.time('Function #1');
let a = [];
for (let i = 0; i < 10000000; i++) {
  a[i] = `array_${i}`;
}
Object.freeze(a);
let b = [];
for (let i = 0; i < a.length; i++) {
  b.push(a.slice(i, 1));
}
console.timeEnd('Function #1');

console.time('Function #2');
let c = [];
for (let i = 0; i < 10000000; i++) {
  c[i] = `array_${i}`;
}
let d = [];
for (let i = 0; i < d.length; i++) {
  d.push(c.slice(i, 1));
}
console.timeEnd('Function #2');

//VM13960:25 Function #1: 4735.190185546875 ms
//VM13960:11 Function #2: 1756.135009765625 ms
```

```javascript
// Object 테스트
console.time('Function #1');
let a = {};
for (let i = 0; i < 1000000; i++) {
  a[`array_${i}`] = `array_${i}`;
}
Object.freeze(a)
let b = [];
for(let i = 0; i < 1000000; i++) {
	d.push(a[`array_${i}`]);
}
console.timeEnd('Function #1');

console.time('Function #2');
let c = {};
for (let i = 0; i < 1000000; i++) {
  c[`array_${i}`] = `array_${i}`;
}
let d = [];
for(let i = 0; i < 1000000; i++) {
	d.push(c[`array_${i}`]);
}
console.timeEnd('Function #2');

//VM5930:11 Function #1: 1397.775146484375 ms
//VM5930:22 Function #2: 1228.260009765625 ms
```

```javascript
// Object entries 테스트
console.time('Function #1');
let a = {};
for (let i = 0; i < 100000; i++) {
  a[`array_${i}`] = `array_${i}`;
}
Object.freeze(a)
let b = [];
for(const [key, value] of Object.entries(a)) {
	b.push(key);
}
console.timeEnd('Function #1');

console.time('Function #2');
let c = {};
for (let i = 0; i < 100000; i++) {
  c[`array_${i}`] = `array_${i}`;
}
let d = [];
for(const [key, value] of Object.entries(c)) {
	d.push(key);
}
console.timeEnd('Function #2');

//VM1065:23 Function #1: 148.782958984375 ms
//VM1065:11 Function #2: 188.56396484375 ms
```

```javascript
// Object keys 테스트
console.time('Function #1');
let a = {};
for (let i = 0; i < 1000000; i++) {
  a[`array_${i}`] = `array_${i}`;
}
Object.freeze(a)
let b = [];
Object.keys(a).forEach(key => {
    b.push(key);
})
console.timeEnd('Function #1');

console.time('Function #2');
let c = {};
for (let i = 0; i < 1000000; i++) {
  c[`array_${i}`] = `array_${i}`;
}
let d = [];
Object.keys(c).forEach(key => {
    d.push(key);
})
console.timeEnd('Function #2');

// VM16480:11 Function #1: 1418.642822265625 ms
// VM16480:22 Function #2: 1203.630859375 ms
```

예상과 비슷하게 Object.entries를 제외한 방법은 모두 Object freeze가 더 느린 성능을 보여준다.
카테고리와 같이 고정된 상수 객체를 가지고 있다면 이는 Object freeze로 묶어 관리하는 것이 더 좋아보이기도 한다. 그렇지만 Object.freeze의 경우 바로 하위 값만 고정을 시기때문에 만약 하위 값이 Object로 되어 있다면 해당 Objcet의 키들은 freeze되지 않는 문제점이 있다. 따라서 deepFreeze를 해주어야 하는데.... 이렇게 까지 해서 Object entriesd에서 성능적인 향상을 바랄 정도는 아닌것같다..
<sub>타입스크립트를 사용한다면 코드 작성에 간편한 readonly를 사용하자</sub>

### 쉽게 눈치 채기 어려운 변수값 변경을 잡을 수 있다.

무의식적으로 사용하던 `array[n][m] = x` 와 같이 `const`의 변수가 배열이거나 객체일 경우 변경이 쉽게 가능하다는 점을 알수 있다. 또한 이러한 문제 때문에 오류가 쉽게 날 수 있고 언뜻봤을때는 바로 알아차리기 어려운 점이 있다. Object.freeze라는 자바스크립트에서 지원해주는 것이 있지만 잘 사용하지는 않기도하고 깊이가 깊은 객체의 경우 deep freeze를 해야하므로 리소스가 꽤나 생각보다 잡아 먹을수 있다. 그런 것을 쉽게 대안책으로 사용할 수 있는것이 타입스크립트의 readonly를 사용하는 것이다.

```typescript
function parseTarggedText(lines: string[]): string[][] {
  const currPara: readonly string[] = [];
  const paragraphs: string[][] = [];
  
  const addParagraph = () => {
    if(currPara.length) {
      paragraphs.push(currPara)
/* Argument of type 'readonly string[]' is not assignable to parameter of type 'string[]'.
  The type 'readonly string[]' is 'readonly' and cannot be assigned to the mutable type 'string[]' */
      currPara.length = 0;
			//Cannot assign to 'length' because it is a read-only property
    };
  }
}
```

readonly는 타입에 의존하는 함수중 값을 변경하는 함수들은 사용이 불가능하다는 점과 값 변경을 명확하게 제제한 다는 점이 굉장히 메리트가 있다. 또한 가장 큰 메리트는 바로 런타임에서는 따로 체크를 안하기 때문에 readonly 타입이 타입스크립트 환경에서만 적용된다는 점이다. 



 ## 아이템 18 매핑된 타입을 사용하여 값을 동기화하기

이게 무슨소리인고 하니 타입을 이용해서 만드는 함수를 만든다는 의미로 해석하면 이해가 쉬울 것 같다.  

> 실패에 닫힌 접근법 오류 발생 시에 적그적으로 대처하는 방향을 말합니다. 말 그대로 방어적, 보수적 접근법입니다. 반대로 실패에 열린 방법은 오류 발생 시에 소극적으로 대처하는 방향입니다. 만약 보안과 관련된 곳이라면 실패에 닫힌 방법을 써야 할 것이고, 기능에 무리가 없고 사용성이 중요한 곳이라면 실패에 열린 방법을 써야 할 것입니다. 

```typescript
interface ScatterProps {
  xs: number[];
  ys: number[];
  
  xRange: [number, number];
  yRange: [number, number];
  
  onClick: (x: number, y: number, index: number) => void;
}

// 실패에 닫힌 방법
// 모든 속성을 검증 새로운 속싱이 추가되도 검증하기 때문에 코드에 대해 유지보수성이 줄어듬
// but 너무 잦은 동작이 있음.
function shouldUpdate(oldProps: ScatterProps, newProps: ScatterProps) {
  let k: keyof ScatterProps;
  for (k in oldProps) {
    if(oldProps[k] !== newProps[k]) {
      if(k !== 'onClick') return true;
    }
  }
  return false;
}

// 실패에 열린 방법 
// 특정한 범위에서만 체크를 진행.
// 한정지었기 때문에 효율성은 높아 보이지만 유지보수성이 높고 변화에 유연하지 못함.
function shouldUpdate(oldProps: ScatterProps, newProps: ScatterProps) {
  return (
  	oldProps.xs !== newProps.xs ||
    oldProps.xy !== newProps.xy ||
    oldProps.xRange !== newProps.xRange ||
    oldProps.yRange !== oldProps.yRange ||
    oldProps.color !== newProps.color
  )
}

// 개선 코드
// 함수에 대해 직접적으로 유지보수 또는 코드를 수정할 필요가 없음. 속성을 별도로 관리하여 업데이트를 어디서 해야하는지 직관적으로 관리가 가능함. 선택을 강조해야한다는 점.
const REQUIRES_UPDATE: {[k in keyof ScatterProps]: boolean} = {
  xs: true,
  ys: true,
  xRange: true,
  yRange: true,
  color: true,
  onClick: false,
}

function shouldUpdate(oldProps: ScatterProps, newProps: ScatterProps) {
  let k: keyof ScatterProps;
  for (k in oldProps) {
    if(oldProps[k] !== newProps[k] && REQIRE_UPDATE[k]) {
      if(k !== 'onClick') return true;
    }
  }
  return false;
}
```

# 3장 타입 추론


## 아이템 19 추론 가능한 타입을 사용해 장황한 코드 방지하기

이 부분은 굉장히 공감이 되는 부분이었다. 내용은 아주 간단한데 다음과 같다.

```typescript
let x: number = 12; //type number;
let x = 12 // type number;
```

위에 모두 둘다 타입추론으로 number로 동일하게 추론된다는 점. 타입추론이 된다면 명시적으로 타입 구문을 작성하는 것은 불필요한 코드라고 된다. 타입스크립트가 스스로 타입을 판단하기 어려운 상황에는 명시적인 타입구문이 필요하다. 

```typescript
function logProduce(product) //여기서 typescript에서는 product의 타입이 무엇인지 모른다.
function lobProduce(product: Product) // 이렇게 써주는 것이 올바른 타입스크립트 작성의 형태이다.
```

> 어떤 언어들은 매개변수의 최종 사용처까지 참고하여 타입을 추론하지만, 타입스크립트는 최종 사용처까지 고려하지 않습니다. 타입스크립트에서 변수의 타입은 일반적으로 처음 등장할 때 결정됩니다.

또 express를 사용했을때 request, response에 타입을 작성해주었던 적이 있었는데 해당부분도 충분히 뺄 수 있다는 점을 다시 깨닫게 되었다.

### 타입구문을 사용할 때

1. 변수에 타입을 선언하여 객체 리터럴을 작성하는 경우에는 잉여속성체크를 할 수 있기 때문에 이런 경우는 변수에 타입을 미리 선언해주는 것이 좋다.
2. 객체 리터럴, 함수의 반환 타입인경우 타입 명시를 고려해야 한다.

```typescript
interface Vacter2D { x: number, y: number }

function add(a: Vacter2D, b; Vacter2D) {return {x: a.x + b.x, y: a.y + b.y }};
// add(Vacter2D, Vavter2D) : {x: number, y: number}
// return 타입이 Vacter2D와 동일한데 동일한지 아닌지 한번에 확인하기 어렵다.
```



## 아이템 20 다른 타입에는 다른 변수 사용하기

const를 주로 쓴다면 크게 해당 되지않는 아이템인 것 같다.

```typescript
let id = '12-34-56' // string;

id = 123456 //number;
//Type 'number' is not assignable to type 'string'.
```

여기서 이미 id는 string으로 추론했고 number은 string의 서브타입이 아니기 때문에 오류가 나타난다.
그렇다면 id의 타입을 명시적으로 string과 number로 확장해서 사용해야하는데 오류가 나타날 위험도가 굉장히 높아질 수 있다. 변수의 재사용성을 줄이는 것, 의존성을 줄이는 것이 핵심이다.

```typescript
const id = '12-34-56';

const serial = 123456;
```

좀더 변수가 하는 역할을 직관적으로 볼 수 있다는 장점이 있다. 다른 중요한점은 지역범위에서 쓰는 변수명 또한 중복적인 변수명으로 사용이 가능한데 이 또한 조심해야한다.

```typescript
const id = '12-34-56';
{
	const id = 1234567;
}
```

여기서의 두 id는 연관이 없지만 충분히 헷갈릴 수 있는 부분이기 때문에 이또한 조심해야한다.

## 아이템 21 타입 넓히기

### 타입이 추론될수 있는 범위를 생각해보기

```typescript
const mixed = ['x', 1]; // (string|number)[]

/*
('x'|1)[]
['x', 1]
[string, number]
readonly [string, number]
(string|number)[]
readonly (string|number)[]
[any, any]
any[]
*/
```

타입스크립트를 사용하면서 이런식으루 해당 타입이 이렇게 다양하게 가질수 있다라는 것을 깊게 고민하면서 작성한 적은 없었던것같다. 타입스크립트에서는 작성자의 의도를 파악악하여 추론을 하기 때문에 모든 추론된 타입이 작성자가 생각한 것과 일치한다고 단정지을 수 없다.

### 객체와 배열의 타입 조절하기

객체와 배열은 각 속성들을 `let`으로 생각하여 타입을 추론한다. 이 키워드를 메인으로 생각하면 타입추론이 어떻게 진행되는지 생각하기 쉽다.

```typescript
const a = {
  x: 1
} // {x: number}

a.x = 3 //pass
a.x = '3' //error
```

배열의 경우 위와 같이 모든 속성의 타입을 묶어서 union으로 합치는 편이고 객체의 경우는 각 속성별 타입을 확장된 상태로 지정하여 추론하는 것이 일반적이다. 타입스크립트는 명확성과 유연성 사이를 균형있게 유지하려 한다

### 객체와 배열의 타입 추론 강도조절하기

첫번째로는 추가적인 명시적 타입구문을 제공하는 것이다.

```typescript
const v: {x : 1|3|5} {
  x: 1, 
} // {x: 1|3|5}
```

두번째로는 추가적인 문맥을 제공하는 것이다.

```typescript
type Nums = 1|3|5;
const v: {
  x: Nums
} // {x: Nums}
```

세번째로는 const 단언문을 하용하는 것이다.
이는 `let` 과 `const` 를 혼동해서는 안되며 온전한 타입 상태의 `const` 를 의미한다. 타입스크립트 3.4 버전부터 지원하였다.

타입으로써의 값을 확인하는 것으로 변수로 사용되는 `const`와는 체킹하는 환경의 범위가 다르다고 생각하면 될것 같다. 

```typescript
const v2 = {
	x: 1 as const,
  y: 2
} // {x : 1, y: number}
const v3 = {
  x: 1, 
  y: 2
} as const // {readonly x : 1, readonly y: 2}
```



## 아이템 22 타입 좁히기

이부분은 union 타입등 여러타입으로 으로 추론되는 값들을 하나씩 타입을 체킹하여 제외하는 것이다.



좁히는 방법은 다양하게 있다.

1. if문 체크

   ```typescript
   const el = document.getElementById('foo'); // type: HTMLElement | null
   if(el) {
   	el // type : HTMLElement
   }
   el // type : HTMLElement | null
   
   //---------
   if(!el) return;
   
   el // type : HTMLElement
   ```

2. instanceof 사용하기

   ```typescript
   function contains(text: string, search: string|RegExp) {
   	if( search instanceof RegExp) {
     	search // RegExp
      return !!search.exec(text)
   	}
     search //string
     return text.includes(search);
   }
   ```

3. 속성 체크로 확인하기

   ```typescript
   interface A {a: number}
   interface B {b: number}
   
   function pickAB(ab: A|B) {
     if('a' in ab) {
       ab // type: A
     } else {
       ab // type: B
     }
     ab // type: A|B
   }
   ```

   속성값이 있는지로도 확인할 수 있다는 점이 신선하게 다가왔다.

4. Array.isArray로 배열 확인하기

   ```typescript
   function contains(text: string, terms: string|string[]) {
   	const termList = Array.isArray(terms)? terms: [terms];
   	termList // type string[]
   }
   ```

5. 타입에 명시적인 태그를 붙이기

   ```typescript
   interface Upload {type: 'upload'; filename: string; contents: string}
   interface Download {type: 'download' ...}
   type AppEvent = Upload | Download
   function handleEvent(e: AppEvent) {
     switch(e.type) {
   		case 'download':
   		case 'upload'
   	}
   }
   
   ```

6. **식별을 위한 추가적인 함수를 추가하기 (사용자 정의 타입가드)**

   ```typescript
   function isInputElement(el: HTMLElement): el is HTMLInputElement {
     return 'value' in el;
   }
   function getElement(el: HTMLElement) {
     if(isInputElement(el)) {
       el // HTMLInputElement
     }
   }
   ```

   

### 잘못된 타입체킹 방지하기

1. null 값도 object이다.

   ```typescript
   const el = document.getElementById('foo'); // type: HTMLElement | null
   if(typeof el === 'object') {
     el // type: HTMLElement | null
   }
   ```

2. 빈문자열 '', 0 또한 false 값으로 추론될수 있다.

   ```typescript
   function foo(x?: number|string|null) {
   	if(!x) {
   		x //type : string | number | null | undefined
   	}
   }
   ```



## 아이템 23 한꺼번에 객체를 정의하기

```typescript
interface { x: number, y: number},
const pt: Point = {}; //error
pt.x=3;
pt.y=4;

// ----
const pt: Point = {
	x: 3,
	y: 4,
} // pass
```

꼭 제각각으로 나눈다면 타입 단언을 사용해야한다.

```typescript
interface { x: number, y: number},
const pt = {} as Point; //pass
pt.x=3;
pt.y=4;
```

### 객체를 조합할때에는 spread 연산자를 사용하기

```typescript
const pt = {x: 3, y: 4}
const id = {name: 'Pytagoras'};
const namedPoint = {};
Object.assign(namedPoint, pt, id);
namedPoint.name: // error: name 속성 참조 오류
//namedPoint type {};

const namedPoint = {...pt, ...id};
// type {x: number, y: number, name: string};
```

### 조건부로 속성 추가하기

```typescript
let hasMiddle: boolean;

const firstLast = {first: 'Harry', last:'Truman'};
const president = {...first, ...(hasMiddle ? {middle: 'S'} | {})};

const president: {
	middle? : string;
	first: string;
	last: string
}


// 다중 조건부 속성 추가하기
let hasMiddle: boolean;

const firstLast = {first: 'Harry', last:'Truman'};
const president = {...first, ...(hasMiddle ? {middle: 'S', add: 'd'} | {})};

const president: {
  middle: string;
  add: string;
	first: string;
	last: string;
} | {
	first: string;
	last: string;
}
```

아무생각 없이 보았을때 두번째 예시에서 middle과 add 부분이 옵셔널로 되는 것이아닌게 신기했는데 다중속성의 경우는 두개가 같이 있기 때문에 해당 union 타입으로 선언되는 것이 맞다는 것을 알수 있다.



## 아이템 24 일관성있는 별칭 사용하기

보통 코드 중복을 피하기 위해 새로운 변수에 선언하여 사용하는 편이 많다 이럴경우에 사용하는 방법이다. 별칭 (객체의 일부를 또는 값을 별도로 변수에 선언하는것 : 중복적인 값을 생성)은 타입좁히기에 혼란이 올 수 있다.

```typescript
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


function isPointInPolygon(polygon:Polygon, pt:Coordinate) {
  //1. 타입체킹 : 반복적인 요소가 너무 많음
  if(polygon.bbox) {
    if(pt.x < polygon.bbox.x[0] || pt.x > polygon.bbox.x[1])
  }
  
  //2. 새로운 변수 선언 : 제대로된 타입체킹이 아님
  const box = polygon.bbox;
  if(polygon.bbox) {
    if(pt.x < box.x[0] || pt.x > box.x[1]) //error box undefined일수 있음
  }
  
  //3. 새로운 변수 선언 : box의 역할과 bbox의 변수의 역할이 동일하여 혼란야기
  const box = polygon.bbox;
  if(box) {
    if(pt.x < box.x[0] || pt.x > box.x[1])
  }
  
  //4. 객체 비구조화: 간결하고 일관된 이름 사용가능
  const {bbox} = polygon.bbox;
  if(bbox) {
    if(pt.x < bbox.x[0] || pt.x > bbox.x[1])
  }
}
```

객체 비구조화는 리액트를 사용하다보면 굉장히 자연스럽게 사용하는 구조이다. 이번기회에 

### 제어흐름 분석 주의하기

객체의 경우 굉장히 조심해야한다.

```typescript
function fn(p:Polygon) {/* ... */}

polygon.bbox // type: BoundingBox | undefined
if(polygon.bbox) {
  polygon.bbox // type: BoundingBox
  fn(polygon);
  polygon.bbox // type: BoundingBox | ....??
}
```

위 코드에서 볼수 있듯이 객체는 참조값을 매개변수로 전달하기 때문에 fn 함수의 과정에서 polygon을 수정할수 있다 따라서 이후의 polygon 타입을 보장할수 없다. 그렇지만 타입스크립트에서는 보장해주고 있기 때문에 여기서 충분히 오류가 날수 있다는 점을 주의해야한다. 따라서 함수에서 객체 parameter 값을 사용하려면 비구조화 할당을 이용하는 것이 좋은 방안이다. 



