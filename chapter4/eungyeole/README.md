## 아이템 25 비동기 코드에는 콜백 대신 async 함수 사용하기

callback 대신 async 함수를 사용해야 하는 타입스크립트적인 이유를  알수있었던 아이템!

#### 병렬처리에서의 Promise

```typescript
async function fetchPages() {
	const [response1, response2, response3] = await Promise.all([
    fetch(url1), fetch(url2), fetch(url3) 
  ]);
  // ...
}
```

```typescript
function fetchPageCB(){
  let numDone = 0;
  const responses: string[] = [];
  const done = () => {
    const [response1, response2, response3] = responses;
  	// ...
  }
  const urls = [url1, url2, url3];
  urls.forEach((url, i) => {
    fetchURL((url, r) => {
      response[i] = url;
      numDone++;
    	if (numDone === urls.length) done();
    })
  })
}
```

타입스크립트는 세 가지 response 변수 각각의 타입을 Response로 추론

콜백 스타일로 동일한 코드를 작성하려면 더많은 코드와 타입 구문이 필요!

-> callback을 사용하게 되면 오류를 처리를 포함하거나 Promise.all 같은 일반적인 코드로 확장하는 것이 어려워짐



#### Promise.race

```typescript
function timeout(ms: number): Promise<never> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject('timeout'), ms);
  })
}

async function fetchWithTimeout(url: string, ms: number) {
  return Promise.race([fetch(url), timeout(ms)]);
}
```

Promise.race를 사용해 타임아웃을 추가하는 방법은 흔하게 사용되는 패턴 // Promise.race가 존재하는지 처음 알았음...

fetchWithTimeout의 반환 타입은 `Promise<Response>` 로 추론됨 

프로미스를 사용하면 타입스크립트의 모든 타입 추론이 제대로 동작됨으로 선택의 여지가 있다면 프로미스를 생성하기보다는 

async/await를 사용해야 한다

* 일반적으로 더 간결하고 직관적인 코드가 됨
*  async 함수는 항상 프로미스 반환하도록 강제됨



#### 요약

*  콜백보다는 프로미스를 사용하는 게 코드 작성과 타입 추론 면에서 유리하다.
* 가능하면 프로미스를 생성하기보다는 async와 await를 사용하는 것이 좋다. 간결하고 직관적인 코드를 작성할 수 있고 모든 종류의 오류를 제거 할 수 있습니다.
* 어떤 함수가 프로미스를 반환한다면 async로 선언하는 것이 좋다.



## 아이템 26 타입 추론에 문맥이 어떻게 사용되는지 이해하기

```javascript
// language의 범위가 넓을때
function setLanguage(language: string) { /* ... */ }
setLanguage('JavaSciprt'); // 정상

let language = 'JavaScript';
setLanguage(language); // 정상

// language의 범위를 string 타입의 유니온으로 할때
type Language = 'JavaScript' | 'TypeScript' | 'Python';
function setLanguage(language: Language) {/*...*/}
setLanguage('JavaScript'); // 정상

let language = 'JavaScript';
setLanguage(language); // Error!
```

`language`의 타입을 `string`으로 할때  해당 코드들은 모두 정상 작동한다. 

하지만 `language`의 타입을 `Language` 일때

즉 `string` 타입의 유니온으로 할때는 `setLanguage(language)`에서 `language`의 타입이 `string`으로 추론되어 에러가 발생하게 된다. 



아래와 같은 방법으로 문제를 해결할수 있다.

```typescript
let language: Language = 'JavaScript';
setLanguage(language); // 정상

// or

const language = 'JavaScript;
setLanguage(language); // 정상
```



#### 튜플 사용 시 주의 점

리터럴 타입과 마찬가지로 튜플 타입에서도 문제가 발생한다.

```typescript
function panTo(where: [number, number]) { /** ... **/ }

panTo([10, 20]); // 정상

const loc = [10, 20]; //number[]
panTo(loc); // Error!
```

이전 예제철머 문맥과 값을 분리했다. 첫번째 경우 [number, number]에 할당이 가능하지만 

두번째 경우에는 loc을 number[]를 추론함으로 튜플 타입에 할당이 불가능 하다.



문제를 해결하기 위해 아래와 같은 방법을 생각해볼수 있습니다.

```typescript
const loc: [number, number] = [10, 20];
panTo(loc); // 정상

// or 

const loc = [10, 20] as const; // readonly [10, 20]
panTo(loc); // 에러
```

`as const`는 그 값이 내부까지 상수라는 사실을 타입스크립트에게 알려줍니다.  // 저도 이방법을 떠올렸었습니다. 

그러므로 `loc`은 `readonly [10, 20]` 로 추론됩니다.  하지만 panTo의 where은 불변이라고 보장하지 않습니다.

즉 해당 코드는 동작하지 않게 됩니다.

`function panTo(where: readonly [number, number])` 다음과 같이 변경하여 해당 문제를 해결할수 있습니다.

하지만 이방법은 타입이 호출되는 곳에서 오류가 발생하는 단점을 가지고 있습니다. 



#### 객체 사용시 주의점

```typescript
type Language = 'JavaScript' | 'TypeScript' | 'Python';
interface GovernedLanguage {
  language: Language;
  organization: string;
}

function complain(language: GovernedLanguage) { /** ... **/ }

complain({ language: 'TypeScript', organization: 'Microsoft'}) // 정상

const ts = { 
  language: 'TypeScript', 
  organization: 'Microsoft'
};

complain(ts); // Error!
```

ts 객체에서 `language` 의 타입은 `string` 으로 추론된다. 타입 선언을 추가하거나 상수 단언을 사용해 해결한다.



#### 콜백 사용 시 주의점

```typescript
function callWithRandomNumbers(fn: (n1: number, n2: number) => void) {
  fn(Math.random(), Math.random();)
}

const fn = (a, b) => {
  console.log(a + b);
}
callWithRandomNumbers(fn) // noImplcitAny Error!

const fn = (a: number, b: number) => {
  console.log(a + b);
}
callWithRandomNumbers(fn) // 정상
```



#### 요약

* 타입 추론에서 문맥이 어떻게 쓰이는지 주의해서 살펴봐야 한다.
* 변수를 뽑아서 별도로 선언했을 때 오류가 발생한다면 타입 선언을 추가해야 한다.
* 변수가 정말로 상수라면 상수 단언을 사용해야 한다. 그러나 상수 단언을 사용하면 정의한 곳이 아니라 사용한 곳에서 오류가 발생하므로 주의해야 한다.



## 아이템 27 함수형 기법과 라이브러리로 타입 흐름 유지하기

```typescript
const rows = rawRows.slice(1)
.map(rowStr => rowStr.split(',').reduce((row, val, i) => (row[headers[i]] = val, row), {}));

// lodash
import _ from 'lodash';
const rows = rawRows.slice(1)
	.map(rowStr => _.zipObject(headers, rowStr.split(',')));
```

코드가 매우 짧아졌다. 서드파티 라이브러리 종속성을 추가할 때 신중 해야한다.

코드를 짧게 줄이는 데 시간이 많이 든다면 쓰지 않는 편이 낫기 때문!

그러나 타입스크립를 사용하면 타입 정보를 참고할수 있기때문에 서드파티 라이브러리를 사용하는 것이 무조건 유리하다.



## 아이템 28 유요한 상태만 표현하는 타입을 지향하기

```typescript
interface State {
	pageText: string;
	isLoading: boolean;
	error?: string;
}

function renderPage(state: State) {
  if(state.error) {
    return '에러';
  } else if (state. isLoading) {
    return '로딩';
  }
  return '<h1>${state.pageText}</h1>';
}

async function changePage(state:State, newPage: string) {
	state.isLoading = true;
	try {
		const response = await fetch(getUrlForPage(newPage));
		if (!response.ok) {
			thorw new Error('에러');
		}
		const text = await response.text();
		state.isLoading = false;
		state.pageText = text;
	} catch (e) {
		state.error = '' + e;
	}
}
```

위에 코드에서는 다음과 같은 문제가 발생합니다.

* 오류가 발생했을 때 state.isLoading을 false로 설정하는 로직이 빠져있음
* state.error를 초기화하지 않아 과거의 올 메세지를 보여주게 됨
* 페이지 로딩 중에 사용자가 페이지를 바꿔 버리면 어떤 일이 벌어 질지 예상할수 없다.

> isLoading과 error를 동시에 가지고 있기때문에 속성이 충돌 할수있습니다.



타입 선언을 다음과 같이 한다면 위에서 발생하였던 문제를 근복적으로 차단할 수있습니다.

```typescript
interface RequestPending {
  state: 'pending';
}
interface RequestError {
  state: 'error';
  error: string;
}
interface RequestSuccess {
  state: 'ok';
  pageText: string;
}
type RequestState = RequestPending | RequestError | RequestSuccess;

interface State {
  currentPage: string;
  requests: {[page: string] : RequestState};
}
```

// 타입설계의 중요성을 다시한번 깨닫게 해주는 아이템이네요



## 아이템 29 사용할 때는 너그럽게, 생성할 때는 엄격하게

```typescript
declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): CameraOptions;

interface CameraOptions {
  center?: LngLat;
  zoom?: number;
  bearing?: number;
  pitch?: number;
}
type LngLat = { lng: number; lat: number } | { lon: number; lat: number } | [number, number];

type LngLatBounds =
  | { northeast: LngLat; southwest: LngLat }
  | [LngLat, LngLat]
  | [number, number, number, number];

const camera = viewportForBounds(bounds);
const { center: { lat, lng }, zoom } = camera; //Error!
```

위 코드의 `camera` 구조 분해 할당 하는 도중 `CameraOptions` 의 `center`가 `optional`한 값이므로 에러가 발생한다. 

수 많은 선택적 속성을 가지는 반환 타입과 유니온 타입은 `viewportForBounds` 를 사용하기 어렵게 만든다.

매개 변수의 타입의 범위가 넓으면 사용하기 편리하지만, 반환 타입의 범위가 넓으면 불편해진다. 

```typescript
declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): Camera;

interface LngLat {
  lng: number;
  lat: number;
}
type LngLatLike = LngLat | { lon: number; lat: number } | [number, number];

type LngLatBounds =
  | { northeast: LngLatLike; southwest: LngLatLike }
  | [LngLatLike, LngLatLike]
  | [number, number, number, number];

interface Camera {
  center: LngLat;
  zoom: number;
  bearing: number;
  pitch: number;
}

interface CameraOptions extends Omit<Partial<Camera>, 'center'> {
  center?: LngLatLike;
}

const camera = viewportForBounds(bounds);
const { center: { lat, lng }, zoom } = camera; //정상
```

#### 요약

* 보통 매개변수 타입은 반환 타입에 비해 범위가 넓은 경향이 있다. 선택적 속성과 유니온 타입은 반환 타입보다 매개변수 타입에 더 일반적입니다.
* 매개변수와 반환 타입의 재사용을 위해서 기본 형태와 느슨한 형태를 도입하는 것이 좋다.



## 아이템 30 문서에 타입 정보를 쓰지 않기

주석을 사용하는것 대신 타입 정보를 작성하자!

```typescript
// BAD
/** nums를 변경하지 않습니다. */
function sort(nums: number[]) { /* ... */ }

// GOOD
function sort(nums: readonly number[]) { /* ... */ }
```

값을 변경하지 않는다고 설명하는 주석은 좋지 않다. 그 대신 readonly로 선언하여 타입스크립트가 규칙을 강제할 수 있게하자

#### 요약

* 주석과 변수명에 타입 정보를 적는 것은 피해야 한다. 
* 타입이 명확하지 않은 경우는 변수명에 단위 정보를 포함하는 것을 고려하자! (ex. timeMs or temperatureC)



## 아이템 31 타입 주변에 null 값 배치하기

`strictNullChecks` 옵션을 사용하여 설계적 결함을 나타낼수 있다. 

```typescript
function extend(nums: number[]) {
  let min, max;
  for (const num of nums) {
    if (!min) {
      min = num;
      max = num;
    } else {
      min = Math.min(min, num);
      max = Math.max(max, num); // Error
    }
    return [min, max];
  }
}
```

`strictNullChecks` 옵션을 키고 난후  `Math.max(max, num);` 에서 `undefined` 에러가 발생하여 설계적인 결함이 나타났다.

아래와 같은 방법으로 문제를 해결할수 있다.

```typescript
function extent(nums: number[]) {
  let result: [number, number] | null = null;

  for (const num of nums) {
    if (!result) {
      result = [num, num];
    } else {
      result = [Math.min(num, result[0]), Math.max(num, result[1])];
    }
  }
  return result;
}
```

이제는 반환 타입이 [number, number] | null이 되어 사용하기가 더 수월해졌다.



#### 요약

* 한 값의 null 여부가 다른 값의 null 여부에 암시적으로 관련되도록 설계하면 안된다.
* API 작성 시에는 반환 타입을 큰 객체로 만들고 반환 타입 전체가 null 이거나 null이 아니게 만들어야 한다.
* 클래스를 만들 때는 필요한 모든 값이 준비되었을 때 생성하여 null이 존재하지 않도록 하는 것이 좋다.
* strictNullChecks를 설정하면 코드에 많은 오류가 표시되겠지만, null값과 관련된 문제점을 찾아낼 수 있기 때문에 반드시 필요하다.



## 아이템 32 유니온의 인터페이스보다는 인터페이스의 유니온을 사용하기

```typescript
interface Layer {
  layout: FillLayout | LineLayout | PointLayout;
  paint: FillPaint | LinePaint | PointPaint;
}
```

위와 같은 설계는 layout이 LineLayout 타입이면서 paint 속성이 FillPaint 타입인 이상한 조합을 만들어 낼수있다.

각각 타입의 계층을 분리된 인터페이스로 설계하는 것이 더 나은 방법이다.

```typescript
interface FillLayer {
  layout: FillLayout;
  paint: FillPaint;
}

interface LineLayer {
  layout: LineLayout;
  paint: LinePaint;
}

interface PointLayer {
  layout: PointLayout;
  paint: PointPaint;
}

type Layer = FillLayer | LineLayer | PointLayer;
```

이러한 형태로 Layer를 정의하면 layout과 paint 속성이 잘못된 조합으로 섞이는 경우를 방지 할수 있다.



#### 태그된 유니온 패턴

```typescript
interface FillLayer {
  type: 'fill';
  layout: FillLayout;
  paint: FillPaint;
}

interface LineLayer {
  type: 'line';
  layout: LineLayout;
  paint: LinePaint;
}

interface PointLayer {
  type: 'point';
  layout: PointLayout;
  paint: PointPaint;
}

type Layer = FillLayer | LineLayer | PointLayer;
```

태그된 유니온 패턴은 가장 일반적인 예시이다. type 속성은 태그이며 런타임에 어떤 타입의 layer사 용되는지 판단되는데 사용된다.

태그를 참고하여 layer의 타입의 범위를 좁힐수도있다.



#### 동시에 있거나 동시에 없을때

```typescript
// BAD
interface Person {
  name: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
}

// GOOD 1
interface Person {
  name: string;
  birth?: {
    place: string;
    date: Date;
  }
}
```

placeOfBirth와 dateOfBirth 필드는 실제로 관련되어 있지만, 타입 정보에는 어떠한 관계도 표현되지 않는다.

두 개의 속성을 하나의 객체로 모으는 것이 더 나은 설계이다.



#### 요약

* 유니온 타입의 속성을 여러 개 가지는 인터페이스에서는 속성 간의 관계가 분명하지 않기 때문에 실수가 자주 발생하므로 주의해야한다.
* 유니온의 인터페이스보다 인터페이스의 유니온이 더 정확하고 타입스크립트가 이해하기 좋다.
* 타입스크립트가 제어 흐름을 분석할 수 있도록 타입에 태그를 넣는 것을 고려해야 한다. ( 태그된 유니온 )
