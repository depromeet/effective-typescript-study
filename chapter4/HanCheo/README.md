# 아이템

> 25. 비동기 코드에는 콜백 대신 async 함수 사용하기
> 26. 타입 추론에 문맥이 어떻게 사용되는지 이해하기
> 27. 함수형 기법과 라이브러리로 타입 흐름 유지하기
> 28. 유요한 상태만 표현하는 타입을 지향하기
> 29. 사용할 때는 너그럽게, 생성할 때는 엄격하게.
> 30. 문서에 타입 정보를 쓰지 않기   
> 31. 타입 주변에 null 값 배치하기
> 32. 유니온의 인터페이스보다는 인터페이스의 유니온을 사용하기   

<br />


## 아이템 25 비동기 코드에는 콜백 대신 async 함수 사용하기

### 자바스크립트 비동기처리

1. 과거 자바스크립트
   - callback 지옥
     코드의 실행 순서도 다르고 중첩되어있는 구문때문에 이해하기 어려움
2. Promise
   - 코드의 중첩이 적어지고 실행 순서도 동일해짐.
   - 오류 처리가 쉬워졌음

3. Async await 
   - 매우 간단해진 비동기 처리

코드 비교

```typescript
//일반 자바스크립트에서 fetch all
function fetcPagesCB() {
	let numDone = 0;
	const response: string[] = [];
	const done = () => {
		const [response1, response2, response3] = responses;
		//...
	}
	const urls = [url1, url2, url3];
	urls.forEach((url, i) => [
	fetchURL(url, r => {
		response[i] = url;
		numDone++;
		if(numDone === urls.length) done();
		})
	])
}

// Promise
async function fetchPages() {
  const [response1, response2, response3] = await Promise.all([
    fetch(url1), fetch(url2), fetch(url3)
  ]);
}
```

코드만 봤을때 기존 자바스크립트 코드에서의 타입 추론이 매우 어렵다는 것을 확인할 수 있다.
비동기적이기 때문에 함수의 return 을 작성하기 어려운 점이 눈에 띈다.

반면에 Promise 형태를 사용한다면 단순 반환타입으로 `Promise<Response>`와 같이 타입을 쉽게 유추할 수 있다.
async 함수는 항상 promise를 반환하기 때문에 타입 유추와 코드의 작성이 원활해진다.

타입 유추에서 다음과 같은 코드에서도 타입을 매끄럽게 반환하는 것을 확인 할 수 있다.

```typescript
function timeout(ms: number) : Promise<never> {
	return new Promise((resolve, reject) => {
		setTimeout(() => reject('timeout'), ms)
	})
}
Promise.race([fetch(url), timeout(ms)]) // Promise<Response>
```

위 코드의 경우 `<Response | naver>` 의 타입으로 union형태로 반환해야하는데 naver의 공집합의 경우 union에서 효과가 없으므로  `<Response>`의 형태로 반환하는 것처럼 Promise형태에서도 타입추론이 잘 동작하는 것을 확인 할 수 있다.

**그래도 되도록 `promise` 보다 `async await` 함수를 이용하자**

1. Promise 보다 좀더 간결하고 직관적인 코드가된다.

2. async는 항상 promise 타입 반환을 강제시킨다.
   callback이나 promise는 반동기 코드를 작성하지만 async는 비동기 코드가 된다

   코드비교

   `const getNumber = async () => 42 // Promise<number>`

   `const getNumber = () => Promise.resolve(42) // Promise<number>`

>  함수는 동기 비동기로 실행되야하며 절대 혼용해서는 안된다 !

```typescript
// cache
const _cache: {[url: string] : string} = {};
function fetchWithCache(url: string, callback: (text: string) => void) {
	if(url in _cache) {
		callback(_cache[url]);
	} else {
		fetchURL(url, text => {
			_cache[url] = text;
			callback(text);
		})
	}
}

function getUser(userId:string) {
  fetchWithcache(`/user/${userId}`, profile => {
    requestStatus = 'success';
  });
  requestStatus = 'loading'; // loading을 위에 쓰면 되지 않을까...??
}
```

위 코드에서의 문제점은 cache의 여부에 따라 문제가 발생한다 cache가 되어있으면 코드가 동기적으로 동작하기 때문에 success가 되고 바로 loadingd으로 바뀌게 된다. 이러한 문제를 좀더 유연하게 해결하기 위해서 단순 값을 리턴하는 경우에도 async로 형태로 구현할 수 있다.

```typescript
const _cache: {[url: string] : string} = {};
async function fetchWithCache(url: string) {
	if(url in _cache) return _cache[url];

  const response = await fetchURL(url);
  const text = await response.text();
  _cache[url] = text;
  return text
}


async function getUser(userId:string) {
  requestStatus = 'loading';
	const profile = await fetchWithcache(`/user/${userId}`);
  requestStatus = 'success';
}
```

중첩 구문이 사라지게 되면서 좀더 코드가 깔끔해지고 이해하기 쉬어졌다. 함수에 callback함수가 떨어져지면서 input과 output을 확실하게 유추할 수 있게되었다. 또한 getuser에서는 loading을 먼저 두면서 순차적으로 실행됨을 확인 할 수 있게 되었다

## 아이템 26 타입 추론에 문맥이 어떻게 사용되는지 이해하기

기존에 공부한 타입추론을 좀더 깊게 생각해보는 장이다.
코드로 보자

```typescript
function setLanguage(language) {/*...*/}
setLanguage('JavaScript');
let language = 'JavaScript';
setLanguage(language);

type Language = 'JavaScript' | 'TypeScript' | 'Python';
function setLanguage(language: Language) {/*...*/}
setLanguage('JavaScript');

let language = 'JavaScript';
setLanguage(language); // error Argument of type 'string' is not assignable to parameter of type 'Language'.
```

`let language`의 변수는 `JavaScript`로 변수를 선언하면서 `type Language`에 할당 될수 있지만 아이템 21에 의하면 가장 넓은 타입을 기본으로 가지기 때문에 language는 string 타입으로 설정된다. `type Language`는 `string`을 부분집합으로 가지고 있지 않기때문에 타입 체킹에 오류가 발생한다.

해결하기 위해서는 아래와 같은 형태로 타입을 좁히거나 선언해준다.

```typescript
const language = 'JavaScript' // type: `JavaScript`
let language: Language = 'JavaScript' //type: Language
```

> 타입스크립트는 기본적으로 값이 처음 등잘할 때 타입을 결정한다.

### 튜플, 객체 사용시 주의점

```typescript
function panTo(where: [number, number]) {/*...*/}
panTo([10, 20]) // pass

const loc = [10, 20]; // type: number[];
panTo(loc) //error [number, number] != number[];

const loc: [number, number] = [10, 20]
panTo(loc) //pass

const loc = [10, 20] as const
panTo(loc) //error  [number, number] != readonly [10, 20];
function panTo(where: readonly [number, number]) {/*...*/}
```

const 로 선언한 객체나 number의 경우 내부 속성값을 수정할수 있기 때문에 가장 확장된 타입으로 추론된다. 따라서 위와같이 타입을 변경해야 할 필요가 있다.

```typescript
function panTo(where: readonly [number, number]) {/*...*/}
const loc = [10, 20, 30] as const;
panTo(loc) //error readonly [number, number] != readonly [10, 20, 30]; length is diffrent;
```

위 코드에서의 문제는 함수가 잘못된 것이 아니라 변수선언이 잘못 된 형태이다. 다만 error를 발생한 지점은 함수를 호출한 지점으로 위처럼 단순하게 선언되있다면 찾기가 쉽지만 여러겹으로 중첩된 객체의경우 근본적으로 원인파악이 가능한 곳을 찾기가 어려워질 수 있다.

### 콜백 사용시 주의점

```typescript
function callWithRandomNumbers(fn: (n1:number, n2:number) => void) {
  fn(Math.random(). Math.random());
}
callWithRandomNumbers((a,b) => {
  console.log(a+b)
}) // pass

const fn = (a, b) => { // type error : noImplicitAny 
  console.log(a + b); 
};

callWithRandomNumbers(fn);
```

콜백 함수를 파라미터에 직접 추가하면 자동적으로 타입 추론이 되지만 일반 변수로 뽑아 사용할때는 콜백함수의 파라미터 값이 자동추론이 되지 않고 any타입으로 추론된다. 함수 표현식으로 타입을 선언하여 재사용을 꾀하자 !

## 아이템 27 함수형 기법과 라이브러리로 타입 흐름 유지하기

함수형 기법의 특징은 별도 외부 변수 참조를 최소화 할 수 있다는 점이다. 다음은 일반 자바스크립트 코드로 코드를 줄여가는 방법이다.

```typescript
// Imperative Programing
const csvData = '...';
const rawRows = csvData.split('\n');
const headers = rawRows[0].split(',');

const rows = rawRows.slice(1).map(rowStr => {
  const row = {};
  rowStr.split(',').forEach((val, j) => {
    row[headers[j]] = val;
  });
  return row
});

//Functional Programing
const rows = rawRows.slice(1)
.map(rowStr => rowStr.split(',').reduce((row,val,i) => (row[headers[i]] = val, row), {}));

//use Lodash
import '_' from 'lodash';
const rows = rawRows.slice(1).map(rowStr => _.zipObject(headers, rowStr.split(',')));
```

아래로 갈수록 코드가 훨씬 짧아진다.  서드파티 라이브러리를 사용하는 것은 좋은 방법이다. 그만큼 작업시간을 줄일 수 있기 때문이다. 다만 자바스크립트의 경우 서드파티 라이브러리를 사용하는데 사용하는 시간 및 방법을 찾는 시간이 오래걸린다면 사용안하는게 더 나을 수도 있다.

그렇지만 타입스크립트를 사용하게 되면 위의 걱정이 없어진다. 타입 정보를 바로바로 참고할 수 있기 때문에 시간이 훨씬 단축될 수 있기 때문이다. 

또한 위 코드를 타입스크립트로 전환하게되면 타입 오류가 발생한다.

```typescript
// Imperative Programing
const rows = rawRows.slice(1).map(rowStr => {
  const row = {};
  rowStr.split(',').forEach((val, j) => {
    row[headers[j]] = val;
    // No index signature with a parameter of type 'string' was found on type '{}'
  });
  return row
});

//Functional Programing
const rows = rawRows.slice(1)
.map(rowStr => rowStr.split(',')
     .reduce((row,val,i) => (row[headers[i]] = val
// No index signature with a parameter of type 'string' was found on type '{}'
                             , row), {}));
```

반면에 lodash를 사용한 경우에는 별도 수정없이도 타입 체커를 통과한다. 이처럼 타입을 설정하지 않아도 통과할 만큼 잘 되있고 타입지정이 정확하게 되어 있다는 점이 서드파티를 사용하는데 장점이 크다.

타입스크립트를 사용하면서 타입을 작성하고 고민할 시간이 훨씬 줄어든다. 

> 타입 흐름을 개선하고 가독성을 높이고 명시적인 타입 구문의 필요성을 줄이기 위해 직접 구현보다 내장된 함수형 기법과 로대시 같은 유틸리티 라이브러리를 사용하자.

# 4장 타입 설계

## 아이템 28 유요한 상태만 표현하는 타입을 지향하기

타입 설계가 엉망이면 코드도 문제가 많이 생기고 기억이나 문서도 도움이 안된다. 잘못된 타입설계를 알아보고 이렇게 하지 않기 위해 노력하자.

예시로 페이지를 로딩하는 잘못된 타입을 보자

```typescript
interface State {
	pageText: string;
	isLoading: boolean;
	error?: string;
}

function renderPage(state: State) {
  if(state.error) {
    return `Error!`
  } else if (state. isLoading) {
    return `Loading`
  }
  return `Render`
}

async function changePage(state:State, newPage: string) {
	state.isLoading = true;
	try {
		const response = await fetch(getUrlForPage(newPage));
		if (!response.ok) {
			thorw new Error(`Error`);
		}
		const text = await response.text();
		state.isLoading = false;
		state.pageText = text;
	} catch (e) {
		state.error = '' + e;
	}
}
```

위 코드의 문제점

1. error 발생시 isLoading을 false로 해주지 않는다.
2. error를 초기화 해주지 않는다. 지속적으로 error가 남아있게됨.
3. 로딩중 페이지 전환시 예상하기 어려움. 응답 순서에 따라 보여지는게 달라짐.
4. error와 loading 속성이 모두 충돌할 수있음 (loading: true error가 있는 경우)

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

타입은 길게 작성되지만 각 상태를 가지고있는 별도의 타입으로 구분함으로서 명시적으로 모델링되고 코드를 좀더 쉽고 이해할 수있게 구현할수 있게 되었다.

```typescript
function renderPage(state: State) {
  const {currentPage} = state;
  const requestState = state.requests[currentPage];
  switch(requestState.state) {
    case 'pending' :
      return `Loading`;
    case 'error':
      return `Error`;
    case 'ok':
      return `Render`
  }
}

async function changePage(state: State, newPage: string) {
  state.requests[newPage] = {state: 'pending'};
  state.currentPage = newPage;
  try {
    const response = await fetch(getUrlForPage(newPage));
    if(!response.ok) {
      throw new Error(`Error`);
    }
    const pageText = await response.text();
    state.requests[newPage] = {state: 'ok', pageText};
  } catch (e) {
    state.requests[newPage] = {state: 'error', error: '' + e};
  }
}
```

loading, error 상태의 모호함이 사라지고 별도의 초기화를 안해주어도 state에 따라 변경되기 때문에 현재 페이지의 명확하다. 요청이 진행중인 상태에서도 페이지를 변환해도 요청이 실행되지만 이미 pending상태이기 때문에 ui에는 영향을 미치지 않는다.

>  하나의 타입에 유효상태와 무효상태를 모두 표현하는 형태로 작성하지 말자 !
> 코드가 길어져도 유효상태만 표현하는 타입을 지향하자

## 아이템 29 사용할 때는 너그럽게, 생성할 때는 엄격하게.

> 당신의 작업은 엄격하게 하고, 다른 사람의 작업은 너그럽게 받아들여야 한다.

함수의 타입 선언에 대한 내용이다. 함수를 사용할때 함수의 매개변수로 사용되는 것들은 타입을 느슨하게 작성하고 실제 반환되는 타입은 좁은 타입의 형태로 반환해야한다는 원칙이다.

예시로 주어진  3D 매핑 API를 보자 이는 카메라의 위치를 저장하고 경계박스의 뷰포트를 계산하는 방법을 제공한다.

```typescript
declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): CameraOptions;

interface CameraOptions {
  center?: LngLat;
  zoom?: number;
  bearing?: number;
  pitch?: number;
}
type LngLat = 
	{lng: number; lat: number}|
	{lon: number; lat: number}|
	[number, number];

type LngLatBounds = {northeast: LngLat, southwest: LngLat} | [LngLat, LngLat] | [number, number, number, number];

//여기서 LngLat, LngLatBounds은 굉장히 넓은 타입으로 설정되었다.
--------------------------------------------
const camera = viewportForBounds(LngLatBounds)
// camera 타입은 CameraOptions으로 되지만 타입안의 속성은 모두 optional이다.
const {center: {lat,lng}, zoom} = camera;
// Property 'lat | 'lng'' does not exist on type 'LngLat | undefined'.
zoom // type: number | undefined

```

반환 타입 자체에서도 optional로 설정되면서 굉장히 사용하기가 까다로워졌다. 타입스크립트를 사용할때에는 반한타입을 최대한 좁힌 타입으로 지정해줘야 좀더 사용하기 편하다.

즉, 반환타입또한 별도로 작성해주어야 한다는 점이며 좀더 유연하기 하기위해 omit, partial 같은 타입변환을 사용한다.

```typescript
interface LngLat {lng: number; lat:number};
type LngLagLike = LngLat | {lon: number; lat: number} |	[number, number];

interface Camera {
  center: LngLat;
  zoom: number;
  bearing: number;
  pitch: number;
}
interface CameraOptions exends Omit<Partial<Camera>, 'center'> {
  center? : LngLatLike;
}
type LngLatBounds = 
{northeast: LngLagLike, southwest: LngLagLike} |
[LngLagLike, LngLagLike] |
[number, number, number, number];

declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): Camera;


--------------------------------------------
const camera = viewportForBounds(LngLatBounds)
const {center: {lat,lng}, zoom} = camera // pass
zoom // type: number
```

반환타입을 명시적으로 해주면서 사용하는데에 있어 더욱 깔끔해졌다.

## 아이템 30 문서에 타입 정보를 쓰지 않기

개인적으로 코드에 주석을 다는 것은 코드가 수정되면 주석또한 변경해야하기 때문에 불필요한 작성시간이 든다는 문제점이 있다. 또한 주석과 코드의 동작하는 부분이 다르게 다면 어느것이 맞는지 확인할 수 없기 때문에 불필요한 주석은 최다한 쓰지 않는 것이 좋다.

타입스크립트 타입 구문 자체로도 간결하고, 구체적이고, 쉽게 읽을수 있도록 설계되었다. 즉 합수의 입력과 출력의 타입을 코드로 표현하는 것이 주석보다 더 나은 방법이라는 것이다. 

```typescript
/**
* 전경색(foreground) 문자열을 반환합니다.
* 0 개 또는 1개의 매개변수를 받습니다.
* 매개변수가 없을 때는 표준 전경색을 반환합니다. 
* 매개변수가 있들 때는 특정 페이지의 전경색을 반환합니다.
*/
function getForegroundcolor(page?: string) {
	return page === 'login' ? {r: 127, g: 127, b: 127} : {r: 0, g: 0, b:0};
}
```

코드와 주석이 맞는 것이 없고 코드보다 주석이 더 길다. 주석 하나 때문에 문제가 참 많다.

```typescript
/** 애플리케이션 또는 특정 페이지의 전경색을 가져옵니다.*/
function getForegroundcolor(page?: string): Color {
	//....
}
```

Color라는 반환값을 명시함으로 색상이 반환되는 것을 알 수있어 더욱 깔끔해졌다.

```typescript
/** nums를 변경하지 않습니다. */
function sort(nums: number[]) {}
```

위와 같은 코드는 주석보다  `readonly number[]`형태로 작성하여 주석을 쓰지 않는 편이 좀더 효율적이다.

> 주석과 변수명에 타입 정보를 적는 것은 최대한 피하자. 모순이 발생하게 된다면 이를 해결하기 위해 드는 시간적 비용은 어마 무시하다.
> 타입이 명확하지 않다면 변수명에 단위 정보를 포함하는 것도 고려하자
>
> ex ) timeMs, temperature



## 아이템 31 타입 주변에 null 값 배치하기

strictNullChecks를 설정한 경우 null, undefined에 대한 처리가 많아 지지만 null에 대한 문제점을 찾을 수 있기 때문에 꼭 필요하다.

예시코드를 한번 또 보자

```typescript
function extend(nums: number[]) {
  let min, max; // type : undefined
  for(const num of nums) {
    if(!min) {
      min = num;
      max = num;
    } else {
      min = Math.min(min, num);
      max = Math.max(max, num); // error : max is undefined
    }
 	return [min, max];
}
```

문제점을 찾아보자.

1. 분명 min이 없을경우 max에도 number를 추가해주었지만 max 는 undefined로 추론된다. 
2. num이 0인 경우를 생각해보자 기본적으로 if문에서 0은 false로 반환된다 따라서 값이 덮어씌여지는 현상이 발생한다.
3. 빈 배열을 매개변수로 준다면 [ undefined, undefined ]를 반환한다.

undefined를 가지고 있는 객체는 다루기 어렵고 권장하지 않는다. 그래서 strictNullChecks를 설정해야하고 undefined를 없애기 위해 null을 사용하는 것을 권장한다.

```typescript
function extend(nums: number[]) {
  let result: [number, number] | null = null;
  for(const num of nums) {
    if(!result) {
			result = [num, num];
    } else {
      result = [Math.min(result[0], num), Math.max(result[1], num)];
    }
 	return result;
}
```

return 값은 [number, number] | null 로 더 명확해졌다. 빈 배열이 들어와도 null 반환될 것이며 다음과 같이 타입 체킹을 더 쉽게 할 수 있다.

```typescript
const range = extend([0, 1, 2])
if(range) {
	const [min, max] = range;
	const span = max- min; //pass
}
```

그렇다고 모든 변수의 기본 선언에 null을 넣는것은 엄청난 null체킹이 들어가기 때문에 줄일수 있는 상황이 있다면 줄이는 것이 좋다.

예를 들어 클래스 같은 경우에서는  constructor에 null을 임시로 넣어두는 것보다 init 함수를 통해 모두 초기화 시켜준다면 별도로 변수에 null을 체킹할 필요가 없다.



## 아이템 32 유니온의 인터페이스보다는 인터페이스의 유니온을 사용하기

유니온 타입의 속성을 가지는 인터페이스를 작성한다면 인터페이스의 유니온 타입을 사용하는 것이 더 알맞지 않을지 검토해야한다.

이것이 무슨 소리인고 하니 예시코드를 먼저보자

```typescript
interface Layer {
	layout: FillLayout | LineLayout | PointLayout;
	paint: FillPaint | LinePaint | PointPaint;
}
```

문제점이 보이는가?? 위 코드의 문제점은 PointLayout이면서 FillPaint를 가질수 있다. 즉, layout과 paint간에 서로다른 타입을 가질수 있다는 위험이 있다.

이를 개선해보자면

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

타입이 길어 졌지만 서로다른 타입을 가지는 것을 방지 할수 있게되었다.

여기서 어떤 Layer가 왔는지 구분하기 위해서 아이템 28에 따라  type을 지정하고 이를 구분할 수 있게 한다.

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

### 긴밀한 속성이라면 묶어두자

```typescript
interface Person {
	name: string;
	placeOfBirth?: string;
	dateOfBirth?: Date;
}
```

`placeOfBirth` 와 `dateOfBirth`는 동시에 있거나 둘다 없는 경우인 타입으로 사용했으나 둘중 하나만 있어도 허용이 된다. 이런 경우에는  `placeOfBirth` 와 `dateOfBirth`를 묶어서 하나로 처리할 수있다.

```typescript
interface Person {
	name: string;
	birth?: {
    place: string;
		date: Date;
  }
}

const alanT: Person = {
  name: 'Alan Turing',
  birth: {
    //error not in date
    place: 'London'
  }
}
```

이제 brith타입중 하나만 있다면 모두 필요하다고  error가 표시된다. 또한 이렇게 타입을 지정한 경우 타입 하나만 체크하면 내부 속성을 모두 쓸수 있다는 장점이 있다.

```typescript
function eulogize(p: Person) {
	console.log(p.name)
	const {birth} = p;
	if(birth) {
		console.log(`born ${birth.date} in ${birth.place} `)
	}
}
```

>  유니온의 인터페이스보다 인터페이스의 유니온이 더 정확하고 타입스크립트가 좀더 이해하기 좋다 !
> 제어 흐름을 분석할수 있도록 각 인터페이스에 tag type을 넣어주는것도 좋다. 굉장히 타입스크립트ㅘ 잘 맞는 패턴이다.

