# 4장 타입 설계



타입 시스템의 큰 장점 중 하나는 데이터 타입을 명확히 할 수 있어 코드를 이해하기 쉽다는 것이다.

만약 타입 설계를 잘 할 수 있다면, 타입 뿐만 아니라 로직 또한 쉽게 이해할 수 있을 것이다.



## 아이템 28. 유효한 상태만 표현하는 타입을 지향하기



### 개요

효과적으로 타입을 설계하려면, 유효한 상태만 표현할 수 있는 타입을 만들어 내는 것이 중요하다.

* 유효한 상태와 무효한 상태를 둘 다 표현하는 타입은 혼란을 초래하기 쉽고, 오류를 유발하게 된다.
* 유효한 상태만 표현하는 타입을 지향해야 한다.
  코드가 길어지고, 표현하기 어려워질 수 있지만 시간과 추후에 따라올 고통을 줄일 수 있다.



### 유효, 무효한 상태를 함께 표현하는 타입

웹 애플리케이션을 만든다고 생각해보자. 애플리케이션 에서는 페이지를 선택하면, 페이지 내용을 로드하고 화면에 표시하게 된다. 이를 표현할 상태는 다음처럼 설계했다하자.

```tsx
interface State {
  pageText: string;
  isLoading: boolean;
  error?: string;
}

function renderPage(state: State) {
  if (state.error) {
    return "ERROR";
  } else if (state.isLoading) {
    return "LOADING";
  }
  return "CURRENT_PAGE";
}
```



>  ***해당 코드는 분기 조건이 명확하게 표현되어 있지 않다.*** 

isLoading이 true이고 동시에 error 값이 존재하면 로딩 중인 상태인지, 오류가 발생한 상태인지 명확히 구분할 수 없다.



이와는 별개로, 페이지 전환 함수를 생각해보자.

```tsx
async function changePage(state: State, newPage: string) {
  state.isLoading = true;
  try {
    const res = await fetch("");
    if (!res.ok) {
      throw new Error("ERROR");
    }
    state.isLoading = false;
  } catch (error) {
    throw new Error("ERROR");
  }
}
```



changePage는 많은 문제점이 있다.

1. 오류가 발생했을 때, isLoading을 false로 설정하는 로직이 빠져있다.
2. state.error를 초기화하지 않았으므로, 페이지 전환 중에 로딩 메시지 대신 과거의 오류 메시지를 보여주게 된다.
3. 페이지 로딩 중에 사용자가 페이지를 바꿔버리면 일들을 예측하기 어렵다.



해당 문제의 핵심은

> 상태 값의 두 가지 속성이 동시에 정보가 부족하거나, 
> 두 가지 속성이 충돌날 수 있다는 것이다.



이를 해결하려면 다음과 같이 해야한다.

```tsx
interface RequestPending{
  state: 'pending';
}

interface RequestError{
  state: 'error';
}

interface RequestSuccess{
  state: 'ok';
}

type RequestState = RequestPending | RequestError | RequestSuccess;

interface state {
  currentPage: string;
  requests: {[page: string]: RequestState};
}
```



이전에 비해 상태를 나타내는 코드의 길이가 길어지긴 했지만, 무효한 성태를 허용하지 않도록 개선되었다.





## 아이템 29. 사용할 때는 너그럽게, 생성할 때는 엄격하게

함수의 시그니처에는 다음과 같은 규칙을 적용해야 한다.

> ***함수의 매개변수는 타입의 범위가 넓어도 되지만, 결과를 반활할 때는 일반적으로 타입의 범위가 더 구체적이여야 한다.***



다음과 같은 예시를 보자.

```tsx
type LngLat =
  | { lng: number; lat: number }
  | { lon: number; lat: number }
  | [number, number];

type LngLatBounds =
  | { northeast: LngLat; southwest: LngLat }
  | [LngLat, LngLat]
  | [number, number, number, number];

interface CameraOptions {
  center?: LngLat;
  zoom?: number;
  bearing?: number;
  pitch?: number;
}

declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): CameraOptions;
```



setCamera의 매개변수를 보자. CameraOptions는 동시에 다른 값을 선택할 수 있어야 하므로, 모든 매개변수가 선택적이다.

LngLat 타입도 setCamera 매개변수의 범위를 넓혀준다.

이러한 편의성을 제공해주면 함수 호출을 쉽게 할 수 있다.

viewportForBounds 함수도 자유로운 타입을 매개변수로 받게 된다.

세 가지 형태를 받을 수 있으므로 LngLatBounds는 매우 많은 형태로 받을 수 있다.



이제 다음 코드를 보자.

```tsx
function focusOnFeature(f: Feature){
  const bounds = calculateBoundingBox();
  const camera= viewportForBounds(bounds);
  setCamera(camera);
  const {center: {lat, lng}, zoom} = camera; // Property 'lat' does not exist on type 'LngLat | undefined'.
  zoom; // number | undefined
}
```

해당 예제의 오류는 lat, lng 속성이 없고 zoom 속성만 존재하며, zoom은 number | undefined로 추론된다. 

이는 viewportForBounds 타입 선언이 사용, 만들어 질 때 너무 자유로운 것이 문제이다.



다음 코드를 보자

```tsx
interface LngLat {
  lng: number;
  lat: number;
}
type LngLatLike = LngLat | { lon: number; lat: number } | [number, number];

interface Camera {
  center: LngLat;
  zoom: number;
  bearing: number;
  pitch: number;
}

interface CameraOptions extends Omit<Partial<Camera>, "center"> {
  center?: LngLatLike;
}
type LngLatBounds =
  | { northeast: LngLatLike; southwest: LngLatLike }
  | [LngLatLike, LngLatLike]
  | [number, number, number, number];

declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): Camera;

function focusOnFeature(f: Feature) {
  const bounds = calculateBoundingBox(f);
  const camera = viewportForBounds(bounds);
  setCamera(camera);
  const {
    center: { lat, lng }, // NO ERROR!
    zoom
  } = camera;
  zoom; // number
}
```

setCamera가 매개변수를 받을 수 있도록, 완전하게 정의된 Camera와 부분 정의된 CameraOptions를 만들어주었다.

viewportForBound의 반환 타입이 Camera 이므로, zoom 타입은 number가 된다.

매개변수를 엄청나게 많이 허용하는 것은 좋은 설계는 아니지만, 허용해야 하는 라이브러리의 타입 선언을 작성하고 있다면 어쩔 수 없이 허용해야 하는 경우가 생긴다.

그러나 반환 타입을 엄청나게 많이 허용하는 것은 나쁜 설계이다.



### 정리

* 보통 매개변수 타입은 반환 타입에 비해 넓은 경향이 있다.
* 매개변수와 반환 타입의 재사용을 위해 기본 형태 (반환 타입) 과 느슨한 형태 (매개변수 타입) 을 도입하는 것이 좋다.





## 아이템 30. 문서에 타입 정보를 쓰지 않기



### 주석과 변수명에 타입 정보를 적는 것은 피해야 한다.



다음 코드를 보자.

```tsx
/**
 * 전경색(foreground) 문자열을 반환합니다.
 * 0개 또는 1개의 매개변수를 받습니다.
 * 매개변수가 없을 때는 표준 전경색을 반환합니다.
 * 매개변수가 있을 때는 특정 페이지의 전경색을 반환합니다.
 */
function getFourgroundColor(page?: string) {
  return page === "login" ? { r: 127, g: 127, b: 127 } : { r: 0, g: 0, b: 0 };
}
```

위의 코드는 코드의 정보와 주석의 정보가 맞지 않는다.



만약 코드가 제대로 반영되고 있다고 가정하면, 주석에는 세 가지 문제점이 있다.

* 함수가 string 형태의 색깔을 반환한다고 적혀 있지만, 실제로는 {r, g, b} 객체를 반환한다.
* 주석에는 함수가 0개 또는 1개의 매개변수를 받는다고 설명하지만, 이는 타입 시그니처만 봐도 명확하게 알수 있는 정보이다.
* 불필요하게 장황하다. 함수 선언과 구현체보다 주석이 더 길다.



이는 다음과 같이 개선할 수 있다.

```tsx
/*
 * 애플리케이션 또는 특정 페이지의 전경색을 가져온다.
 */
function getFourgroundColor(page?: string) {
  return page === "login" ? { r: 127, g: 127, b: 127 } : { r: 0, g: 0, b: 0 };
}
```



### 정리

타입스크립트에서 다음과 같은 규칙을 지키도록 하자.

* 값을 변경하지 않는다고 설명하는 주석은 좋지 않다. 대신 readonly로 선언하여 규칙을 강제하면 된다.
* 변수명에 타입 정보를 넣지 않도록 하자. 변수명에 ageNum 보다는 age 로하고, 타입이 number임을 명시하는 것이 좋다.
* 단위가 있는 숫자들은 예외이다. timeMs는 time 보다 더 명확하다.





## 아이템 31. 타입 주변에 null 값 배치하기



### 값이 null 이거나, 전부 null 이 아닌 경우로 구분하기

다음 코드를 보자.

```tsx
function extent(nums: number[]) {
  let min, max;
  for (const num of nums) {
    if (!min) {
      min = max;
      max = num;
    } else {
      min = Math.min(min, num);
      max = Math.max(max, num); // ERROR : Type 'undefined' is not assignable to type 'number'
    }
  }
  return [min, max];
}
```



위의 코드는 min은 undefined를 걸러주지만 max는 걸러주지 않기 때문에 에러가 발생한다.

이를 max에 대한 예외 처리를 해주면 해결은 되겠지만, 위와 같은 버그가 두 배로 발생할 수도 있다.



이 경우, 한 객체에 넣고 null 이거나 null 이 아니게 핸들링하면 된다.

```tsx
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



### 클래스에서 null 과 null 이 아닌 값을 섞어 쓰면 안된다.

```tsx
class UserPosts {
  user: UserInfo | null;
  posts: Post[] | null;

  constructor() {
    this.user = null;
    this.posts = null;
  }

  async init(userId: string) {
    return Promise.all([
      async () => (this.user = await fetchUser(userId)),
      async () => (this.posts = await fetchPostsForUser(userId))
    ]);
  }

  getUserName() {
    // ...?
  }
}
```



init 에서 네트워크 요청이 로드되는 동안, user, posts 속성은 모두 null 상태이다.

어떤 시점엔 둘다 null, 둘 중 하나만 null, 둘다 null이 아닌 경우 총 4가지의 경우가 존재하며,

이런 속성값의 불확실성은 클래스 모든 메서드에 나쁜 영향을 미친다.



이를 필요한 데이터가 모두 준비된 후에 클래스를 만들도록 바꿔보자.

```tsx
class UserPosts {
  user: UserInfo;
  posts: Post[];

  constructor(user: UserInfo, posts: Post[]) {
    this.user = user;
    this.posts = posts;
  }

  async init(userId: string) {
    const [user, posts] =  Promise.all([fetchUser(userId), fetchPostsForUser(userId)]);
    return new UserPosts(user, posts);
  }

  getUserName(){
    return this.user.name;
  }
}
```

이제 완전한 null 이 아니게 되며, 메서드를 작성하기도 쉬워진다.



### 정리

* 한 값의 null 여부가 다른 값의 null 여부에 암시적으로 관련되도록 설계하면 안된다.

* API 작성 시 반환 타입을 큰 객체로 만들고, 반환 타입 전체가 null 이거나 null 이 아니게 만들어야 한다.

* 클래스를 만들 때는 필요한 모든 값이 존재할 때 생성하여 null 이 존재하지 않도록 하는 것이 좋다.

  

## 아이템 32. 유니온의 인터페이스보다는 인터페이스의 유니온을 사용하기



### 인터페이스의 유니온

다음 코드를 보자.

```tsx
interface Layer {
  layout: FillLayout | LineLayout | PointLayout;
  paint: FillPaint | LinePaint | PointPaint;
}
```



위 코드는 LineLayout 이면서 paint는 FillPaint 타입이 될 수 있음을 암시한다. 

이런 조합은 오류가 발생할 가능성이 많고 인터페이스를 다루기도 어려워진다.

이를 다음과 같이 수정해보자.

```tsx
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

이런 형태로 Layer를 정의하면 잘못된 조합으로 섞이는 경우를 방지할 수 있다.



### tagged union

```tsx
interface FillLayer {
  type: "fill";
  layout: FillLayout;
  paint: FillPaint;
}

interface LineLayer {
  type: "line";
  layout: LineLayout;
  paint: LinePaint;
}

interface PointLayer {
  type: "point";
  layout: PointLayout;
  paint: PointPaint;
}

type Layer = FillLayer | LineLayer | PointLayer;
```



type 속성은 태그이며, 어떤 타입의 Layer가 사용되는 지 판단하는 데 쓰인다.

이 패턴은 잘 기억해서 필요할 때 적용할 수 있도록 해야 한다. 



### 여러 개의 선택적 필드가 동시에 값이 있거나 동시에 undefined 인 경우

다음 코드의 타입을 보자.

```tsx
interface Person {
  name: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
}
```

만약 placeOfBirth, dateOfBirth 가 동시에 값이 있거나 없는 경우, 위와 같은 타입은 문제의 소지가 될 수 있다.

이는 두 개의 속성을 하나의 객체로 모으는 것이 맞다.

```tsx
interface Person {
  name: string;
  birth?: {
    place: string;
    date: string;
  };
}
```



만약, 타입 구조를 손댈 수 없는 상황 (e.g. API result) 이라면, 인터페이스의 유니온을 사용해서 속성 사이의 관계를 모델링 할 수 있다.

```tsx
interface Name {
  name: string;
}

interface PersonWithBirth extends Name {
  placeOfBirth: string;
  dateOfBirth: string;
}

type Person = Name | PersonWithBirth;
```



### 정리

* 유니온 타입의 속성을 여러 개 가지는 인터페이스에서는 속성 간의 관계가 분명하지 않습니다.
  이 때문에 실수가 자주 발생하므로 주의해야 합니다.
* 유니온의 인터페이스보다 인터페이스의 유니온이 더 정확하고 타입스크립트가 이해하기도 좋습니다.
* 타입스크립트가 제어 흐름을 분석할 수 있도록 타입에 태그를 넣는 것을 고려해야 한다. tagged union은 타입스크립트와 매우 잘 맞으므로 자주 사용하자.



## 아이템 33. string 타입보다 더 구체적인 타입 사용하기



### 문자열 남용을 주의해봐요

string 타입의 범위는 정말 매우 넓다.

"x" 같은 한 글자도, 매우 많은 소설의 내용도 string이다.

string 타입을 사용할 거면 좀 더 좁은 타입이 적정하지 않은지 체크해봐야 한다.



다음 타입을 보자.

```tsx
interface Album {
  artist: string;
  title: string;
  releaseDate: string;		//	YYYY-MM-DD
  recordingType: string;	//	'live' | 'studio'
}
```

releaseDate, recordingType은 지나치게 큰 범위의 값을 수용하게 된다. 이를 다음과 같이 바꿀 수 있다.



```tsx
type RecordingType = "studio" | "live";

interface Album {
  artist: string;
  title: string;
  releaseDate: Date;
  recordingType: RecordingType;
}
```



위와 같이, 문자열이 남용된 코드를 `stringly typed` , 문자열이 남용되었다고 표현하곤 한다.



### keyof 연산자

위와 같은 방식을 사용하게 되면 keyof로 더 세밀하게 객체 속성 체크가 가능해진다.

다음 코드를 한번 보자.

```tsx
const pluck = (records: any[], key: string): any[] => {
  return records.map((r) => r[key]);
};
```



pluck 함수는 배열을 받아 key에 해당하는 필드의 값만 추출하는 함수이다.

이 함수의 타입은 any 타입이 있어 정밀하지 못하다. 



이를 개선하기 위해 제너릭 타입을 도입해보자.

```tsx
const pluck = <T>(records: T[], key: string): any[] => {
  return records.map((r) => r[key]); // ERROR: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'unknown'
          
};
```

`r[key]` 에선 key 가 string 타입이므로 unknown 한 필드에 접근할 수 없다고 한다.

keyof를 사용하면 이 에러를 막을 수 있다.



```tsx
const pluck = <T>(records: T[], key: keyof T) => {
  return records.map((r) => r[key]);
};
```

이는 자동으로 반환값을 `T[keyof T][]` 타입으로 추론하기도 한다.



문제는, key 로 하나의 문자열만 넣을 경우 너무 큰 범위로 추론한다는 것이다.

```tsx
const pluck: <Album>(records: Album[], key: keyof Album) => (string | Date)[]
```

keyof T는 'string' | Date 이므로, `T[keyof T][]` 타입은 위와 같이 추론된다.



이를 막으려면 두 번째 제너릭 타입을 사용해야 한다.

```tsx
const pluck = <T, K extends keyof T>(records: T[], key: K) => {
  return records.map((r) => r[key]);
};
```



### 정리

* string을 남발하지 말자. 더 구체적인 타입을 사용하는 것이 좋다.
* 객체의 속성 이름을 함수 매개변수로 받고 싶다면, `keyof T` 를 사용하는 것이 좋다.





## 아이템 34. 부정확한 타입보다는 미완성 타입을 사용하기



### any와 unknown 의 차이

다음 코드를 보자

```tsx
let value: any = 10;
console.log(value.length);
```

any는 모든 타입을 허용하므로, 타입 검사를 느슨하게 해서 다음 에러는 나지 않게 된다.

```tsx
let value: unknown = 10;
console.log(value.length); // ERROR: Object is of type 'unknown'.
```



그러나 다음 코드는 에러가 나게 되는데, unknown 도 모든 타입을 허용하지만 any와는 달리 프로퍼티, 또는 연산을 하게 되는 경우 컴파일러가 체크하게 된다.

이를 통해 문제 되는 코드를 미리 예방할 수 있다.



### 정리

* 타입이 없는 것보다 잘못된 것이 더 나쁘다.
* 정확하게 타입을 모델링할 수 없다면, 부정확하게 모델링하지 말아야 한다.
  또, any, unknown 을 구분해서 사용할 수 있어야 한다.
* 타입 정보를 구체적으로 만들수록 오류 메시지와 자동 완성 기능에 주의를 기울여야 한다.





## 아이템 35. 데이터가 아닌, API 와 명세를 보고 타입 만들기



우리가 다루는 타입 중 최소한 몇 개는 프로젝트 외부에서 비롯된 것이다.

파일 형식, API, 명세들이 그것들인데, 이를 참고해 타입을 생성하면 사용자가 실수를 줄일 수 있게 도와준다.



### 정리

* 코드의 구석까지 타입 안전성을 얻기 위해 API 또는 데이터 형식에 대한 타입 생성을 고려해야 한다.
* 데이터에 드러나지 않는 예외적인 경우가 있을 수 있기 때문에 데이터 보다는 명세로부터 코드를 생성하는 것이 좋다.







## 아이템 36. 해당 분야의 용어로 타입 이름 짓기



**타입, 속성, 변수에 이름을 붙일 때 명심해야 할 규칙이 있다.**

1. 동일한 의미를 나타낼 때는 같은 용어를 사용해야 한다.
   동음이의어를 사용하면 글을 읽을 때는 좋을 수 있지만, 코드에서는 좋지 않다.
2. `data, info, thing, item, object, entity` 같은 모호하고 의미 없는 이름은 피해야 한다.
   귀찮다고 무심코 의미 없는 이름을 붙여서는 안 된다.
3. 이름을 지을 때는 포함된 내용이나 계산 방식이 아닌 **데이터 자체가 무엇인지를 고려해야 한다.**
4. 가독성을 높이고, 추상화 수준을 높이기 위해 해당 분야의 용어를 사용해야 한다.





## 아이템 37. 공식 명칭에는 상표를 붙이기

```tsx
interface Vector2D {
  x: number;
  y: number;
}

function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

const test = { x: 3, y: 4, z: 1 };
calculateNorm(test); // OK!!
```



구조적 타이핑 때문에 이는 문제가 되지 않는다. 

그러나, 만약 인자로 3차원 벡터를 허용하고 싶지 않게 하려면 `nominal typing` 을 사용하면 된다.



### Nominal Typing (공식 명칭)

```tsx
interface Vector2D {
  _brand: "2d";
  x: number;
  y: number;
}

function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

const test = { x: 3, y: 4, z: 1 };
calculateNorm(test); // ERROR: rgument of type '{ x: number; y: number; z: number; }' is not assignable to parameter of type 'Vector2D'.
```

`_brand` 를 이용해 calculateNorm 이 Vector2D 만 받는 것을 보장한다.

물론 `_brand` 필드를 추가함으로서 이를 우회할 수는 있지만, 이를 방지하기는 충분하다.





### 응용

다음 코드를 보자.

```tsx
type AbsolutePath = string & { _brand: "abs" };

function isAbsolutePath(path: string): path is AbsolutePath {
  return path.startsWith("/");
}

function listAbsolutePath(path: AbsolutePath) {
  console.log(path);
}

function f(path: string) {
  if (isAbsolutePath(path)) {
    listAbsolutePath(path);
  }
  listAbsolutePath(path); // ERROR: Argument of type 'string' is not assignable to parameter of type 'AbsolutePath'.
}
```



타입 시스템에서는 절대 경로를 파악하기 힘들기 때문에, 위와 같이 상표 기법을 사용할 수 있다.

위 방법을 사용해, 타입 시스템에서 동작하지만 런타임에 이를 검사하는 것과 동일한 효과를 얻을 수 있다.

