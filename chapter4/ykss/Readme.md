## 아이템 25 : 비동기 코드에는 콜백 대신 async 함수 사용하기

콜백이 중첩된 코드는 직관적으로 이해하기 어렵고 가독성이 떨어진다.

-> 그래서 등장한 것이 promise였고, `.then()`과 `.catch()`문법이 등장했다. 

-> ES2017에서는 `async`와 `await` 문법이 등장해서 더욱 간단하게 처리가 가능해졌다.

```tsx
async function fetchPages(){
  try{
  	const response1 = await fetch(url1);
  	const response2 = await fetch(url2);
  	const response3 = await fetch(url3);  
  } catch(e){
    //... 
  }
}
```

* 콜백보다 프로미스 문법을 사용해야 되는 이유
  1. 프로미스가 코드를 작성하기 쉽다.
  2. 프로미스가 타입을 추론하기 쉽다.

```typescript
async function fetchPages() {
  const [response1, response2, response3] = await Promise.all([fetch(url1), fetch(url2), fetch(url3)]);
}
```

병렬로 페이지를 로드할 때는 위와 같이 `Promise.all` 사용이 가능하다. 프로미스를 모두 이행한 후 반환하며, 프로미스 중 하나라도 거부되면 해당 함수도 거부된다.

`Promise.race`도 자주 사용되는데, 아래와 같이 타임아웃을 사용할 때 주로 사용된다. `Promise.race`는 가장 먼저 완료되는 것의 결과를 반환한다.

```typescript
function timeout(millis: number): Promise<never> {
  return new Promise((resolve, reject) => {
     setTimeout(() => reject('timeout'), millis);
  });
}

async function fetchWithTimeout(url: string, ms: number) {
  return Promise.race([fetch(url), timeout(ms)]);
}
```

* 프로미스를 생성하기 보다 async/await를 사용해야하는 이유

  	1. 일반적으로 간결하고 직관적인 코드가 된다.

  2. async 함수의 경우 항상 프로미스를 반환하도록 강제된다.

`async function getJSON(url:string) === function getJSON(url:string) : Promise<any>`

async만 붙혀서 사용해도 반환타입을 강제할 수 있기 때문에 항상 비동기 코드를 작성할 수 있다.

### 요약

1. 콜백보다는 프로미스가 간결성과 타입 추론 면에서 유리
2. 프로미스를 직접 생성하기보단 async ~  await를 쓰면 간결하고 직관적으로 작성 가능
3. 프로미스를 반환하는 함수에는 async로 선언하는 게 좋다.



## 아이템 26 : 타입 추론에 문맥이 어떻게 사용되는지 이해하기

```typescript
type Language = 'JavaScript' | 'TypeScript' | 'Python';
function setLanguage(language: Language) { /* ... */ }

setLanguage('JavaScript');  // OK

let language = 'JavaScript';
setLanguage(language);
         // ~~~~~~~~ Argument of type 'string' is not assignable
         //          to parameter of type 'Language'

```

위와 같이 `language`를 string으로 추론하여 Language 타입으로 할당 불가능한 오류가 발생 할 수 있기 때문에 이럴 때는 타입선언 시에 타입을  `let language: Language = 'JavaScript';` 과 같이 변경하면 오류가 뜨지 않는다. 또는 language를 `let`이 아닌 `const`로 상수로 만들면 된다.

```typescript
type Language = 'JavaScript' | 'TypeScript' | 'Python';
function setLanguage(language: Language) { /* ... */ }
// Parameter is a (latitude, longitude) pair.
function panTo(where: [number, number]) { /* ... */ }

panTo([10, 20]);  // OK

const loc = [10, 20];
panTo(loc);
//    ~~~ Argument of type 'number[]' is not assignable to
//        parameter of type '[number, number]'

```

위에서도 `loc`을 number[]로 추론하기 때문에 더 많은 값들을 추가할 수도 있기 때문에 튜플이라고 명시해주어야 에러가 발생하지 않는다.

`const loc : [number,number] = [10,20]` 과 같이 사용하면 에러가 뜨지 않는다.   `as const`의 방식도 소개되었지만, 타입 정의에 실수가 있다면 오류가 타입 정의가 아닌 호출되는 곳에서 발생하기 때문에 중첩된 객체에서 오류가 발생할 경우 근본적인 원인을 파악하기 어렵다.

객체 사용 시에도 타입을 명시하거나 상수 단언을 통해 잘못된 추론을 해결할 수 있다.

* 배열과 객체에 as const 붙였을 때 차이점

  * `const loc = [10, 20] as const` 일때는 `const loc: readonly [10, 20]`로 추론된다.

  * ```typescript
    const ts = {
      language: "TypeScript",
      organization: "Microsoft",
    } as const
    // 위와 같을 때는 아래처럼 추론된다.
    const ts: {
        readonly language: "TypeScript";
        readonly organization: "Microsoft";
    }
    ```

  * 배열일때는 배열 전체에 readonly가 되고 객체일 때는 객체 내부의 값들에 readonly가 된다.

### 요약 

- 변수를 뽑아서 별도로 선언 시 오류가 발생한다면 타입 선언을 추가해야 한다.
- 변수가 상수라면 상수 단언(as const)을 사용해야 한다. 하지만 상수 단언 사용 시 정의한 곳이 아닌 사용한 곳에서 오류가 발생하므로 주의해야 한다.



## 아이템 27 : 함수형 기법과 라이브러리로 타입 흐름 유지하기

### 요약

- 타입 흐름을 개선하고 가독성을 높이고, 명시적인 타입 구문의 필요성을 줄이기 위해서 내장된 함수형 기법이나 로대시 같은 유틸리티 라이브러리를 사용하는 것이 낫다.



# 4장. 타입 설계

## 아이템 28 : 유효한 상태만 표현하는 타입을 지향하기

```typescript
interface State {
  pageText: string;
  isLoading: boolean;
  error?: string;
}
declare let currentPage: string;

// 유효상태만 표현하는 방식으로 변경
  
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
  requests: {[page: string]: RequestState};
}
```



### 요약

- 유효한 상태와 무효한 상태를 둘 다 표현하는 타입은 혼란을 초래하기 쉽고, 오류를 유발한다.
- 유효한 상태만 표현하는 타입을 지향해야 한다. 코드가 길어질 수 있고 표현이 어려울 수 있지만 결국은 시간을 절약할 수 있다.



## 아이템 29 : 사용할 때는 너그럽게, 생성할 때는 엄격하게

함수의 매개변수는 타입의 범위가 넓어도 되지만, 결과를 반환할 떄는 타입의 범위가 더 구체적이어야 한다.

```typescript
interface LngLat { lng: number; lat: number; };
type LngLatLike = LngLat | { lon: number; lat: number; } | [number, number];

interface Camera {
  center: LngLat;
  zoom: number;
  bearing: number;
  pitch: number;
}
interface CameraOptions extends Omit<Partial<Camera>, 'center'> {
  center?: LngLatLike;
}
type LngLatBounds =
  {northeast: LngLatLike, southwest: LngLatLike} |
  [LngLatLike, LngLatLike] |
  [number, number, number, number];

declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): Camera;
```

위의 경우와 같이 매개변수에는 좀 더 느슨한 `LatLatLike`와 같은 타입을 만들어 적용할 수 있다. 그러나 반환형은 가능한 엄격하게 범위를 좁히도록 해야 한다. 이때 `Partial<>`이나 `Omit<>`과 같은 유틸리티 함수들을 활용하기 유용하다.

### 요약

- 매개변수 타입은 반환 타입에 비해 범위가 넓은 경향이 있다. 선택적 속성과 유니온 타입은 반환 타입보다는 매개변수 타입에 일반적이다.
- 매개변수와 반환 타입은 재사용을 위해 기본 형태(반환 타입)과 느슨한 형태(매개변수 타입)을 도입하는 게 좋다.



## 아이템 30 : 문서에 타입 정보를 쓰지 않기

함수의 입력과 출력의 타입을 코드로 표현하는 것이 주석보다 더 나은 방법이다. 

```typescript
function getForegroundColor(page?: string) {
  return page === 'login' ? {r: 127, g: 127, b: 127} : {r: 0, g: 0, b: 0};
}

function getForegroundColor(page?: string): Color {
  return page === 'login' ? {r: 127, g: 127, b: 127} : {r: 0, g: 0, b: 0};
}
```

매개변수나 반환형의 타입을 표시해줌을 통해 불필요한 주석을 줄일 수 있다.

```typescript
/** Does not modify nums */
function sort(nums: number[]) { /* ... */ }

function sort(nums: readonly number[]) { /* ... */ }
```

위와 같이 매개변수를 변경하지 않는다고 주석을 쓰는 것 보다 `readonly`를 붙여주면서 규칙을 강제하면 된다.

### 요약

- 주석과 변수명에 타입 정보를 적는 것은 피해야 한다. 타입 선언이 중복되는 것으로 끝나면 다행이지만 타입 정보에 모순이 발생할 수도 있다.
- 타입이 명확하지 않은 경우는 변수명에 단위 정보를 포함하는 것을 고려하는게 좋습니다. (ex. `timeMs`,`temperatureC`)



## 아이템 31 : 타입 주변에 null 값 배치하기

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

### 요약

- 한 값의 null 여부가 다른 값의 null 여부에 암시적으로 관련되도록 설계해선 안된다.
- API 작성 시 반환 타입을 큰 객체로 만들고 반환 타입 전체가 null이거나 null이 아니게 만들어야 한다,.
- 클래스를 만들 때는 필요한 모든 값이 준비되었을 때 생성하여 null이 존재하지 않도록 하는 것이 좋다.
- `strictNullChecks`를 설정하면 코드에 많은 오류가 표시되지만 null 값과 관련된 문제점을 찾아낼 수 있기 때문에 반드시 필요하다.



## 아이템 32 : 유니온의 인터페이스보다는 인터페이스의 유니온을 사용하기

```typescript
interface Layer {
  layout: FillLayout | LineLayout | PointLayout;
  paint: FillPaint | LinePaint | PointPaint;
}
// 위의 방식보다는 아래가 낫다.
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

//-------------------------------------------

interface Person {
  name: string;
  // These will either both be present or not be present
  placeOfBirth?: string;
  dateOfBirth?: Date;
}
// 주석으로 속성의 관계를 표시하는 것은 위험하다.
interface Person {
  name: string;
  birth?: {
    place: string;
    date: Date;
  }
}

//------------------------------------------

interface Name {
  name: string;
}

interface PersonWithBirth extends Name {
  placeOfBirth: string;
  dateOfBirth: Date;
}

type Person = Name | PersonWithBirth;
```

### 요약

- 유니온 타입의 속성을 여러개 가지는 인터페이스는 속성 간의 관계가 분명하지 않기 때문에 실수가 발생할 수 있다.
- 유니온의 인터페이스보다 인터페이스의 유니온이 더 정확하고 이해하기 쉽다.
- 타입스크립트가 제어 흐름을 분석할 수 있도록 타입에 태그를 넣는 것을 고려해야 한다. 태그된 유니온은 타입스크립트와 잘 어울린다.

