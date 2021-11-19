# 4장 타입설계



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