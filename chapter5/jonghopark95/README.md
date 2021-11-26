# 5장 any 다루기



전통적인 프로그래밍 언어들의 타입 시스템은 완전 정적이거나, 동적으로 확실히 구분되어 있다.

그러나, 타입스크립트는 선택적이고, 점진적이므로 이 두 가지 특성을 동시에 가진다.

따라서, 타입스크립트는 일부분에만 타입스크립트를 적용할 수도 있다.



이런 특성 때문에 기존 JS 코드를 TS로 전환이 가능하다.

특히, 마이그레이션을 할 때 코드 일부분에 `any` 타입을 사용하는 것이 중요한 역할을 할 때가 많다.

이는 매우 강력한 힘을 가지므로, `any` 의 장점과 단점을 확실히 알고 사용할 수 있어야 한다.





## 아이템 38. any 타입은 가능한 좁은 범위에서만 사용하기



### 함수에서의 any

다음 코드를 보자.

```tsx
function f1(){
  const x: any = 어쩌구();
  process(x);
}

function f2(){
  const x = 어쩌구();
  process(x as any);
}
```



위 두 방법 중 어떤 방법이 좋은 방법일까?

답은 두 번째이다. 1은 x를 반환할 경우, x가 전반적으로 퍼질 위험이 있기 때문이다.



### 객체에서의 any

```tsx
type Config = {
  a: 1;
  b: 2;
  c: {
    key: string;
    l: string;
  };
};

const config: Config = {
  a: 1,
  b: 2,
  c: { // ERROR: Property 'l' is missing in type '{ key: string; }' but required in type '{ key: string; l: string; }'
    key: value
  }
};
```



위 코드에서 l이 객체 내에 없기 때문에, 잉여 속성 체커가 에러를 뱉게 된다.

이 경우, 다음과 같은 두 가지 우회법이 있다.



```tsx
const config: Config = {
  a: 1,
  b: 3,
  c: {
    key: value
  } as any
};

const config: Config = {
  a: 1,
  b: 3,
  c: {
    key: value
  }
} as any;
```



이 중, 첫 번째가 더 좋은 방법이다.

만약 객체 전체를 any로 단언하면, 다른 속성들이 타입 체크가 되지 않기 때문이다.



### 정리

- 타입 안전성의 손실을 피하기 위해 any의 사용 범위를 최소한으로 좁혀야 한다.



## 아이템 39. any를 구체적으로 변형해서 사용하기

any는 JS에서 표현할 수 있는 모든 갑승ㄹ 아우르는 매우매우 큰 범위의 타입이다.

이는, 즉 일반적인 상황에서는 any 보다 더 구체적으로 표현할 수 있는 타입이 존재할 가능성이 크다는 점이다.



### 매개변수를 알 수 없지만, ~~~ 라면...

* 배열이라면 `any []` 가 좋다.
* 배열의 배열 형태라면 `any[][]` 가 좋다.
* 객체지만 값을 알 수 없다면 `{[key: string]: any}` 가 좋다.
* 객체지만 속성에 접근할 수 없어야 한다면 `object` 가 좋다.
* 함수의 타입도 다음과 같이 구분하자.
  * 매개변수 없이 호출 가능한 모든 함수라면 `() => any`
  * 매개변수가 한개라면 `(arg: any) => any`
  * 모든 개수의 매개변수 `(...args: any[]) => any`





## 아이템 40. 함수 안으로 타입 단언문 감추기

함수를 작성하다보면,

외부에 드러난 타입 정의는 간단하지만 내부 로직이 복잡해 안전한 타입으로 구현하기 어려운 경우가 있다.



함수의 모든 부분을 안전한 타입으로 구성하는 것이 이상적이지만, 

불필요한 예외 사항까지 고려하며 힘들게 구성하기 보단 타입 단언을 사용하고 외부에 드러나는 타입 정의를 명시하는 것으로 끝내는 것이 좋다.



>  ***프로젝트 전반에 타입 단언문이 드러나 있는 것보다, 제대로 타입이 정의된 함수 안으로 타입 단언문을 감추는 것이 더 좋은 설계이다.***



다음 코드를 보자.

```tsx
function cacheLast<T extends Function>(fn: T): T {
  let lastArgs: any[] | null = null;
  let lastResult: any;

  return function (...args: any[]) { // ERROR: Type '(...args: any[]) => any' is not assignable to type 'T'
    if (!lastArgs || !shallowEqual(lastArgs, args)) {
      lastResult = fn(...args);
      lastArgs = args;
    }
    return lastResult;
  };
}
```



반환문에 있는 함수와 T 타입이 어떤 관계가 있는지 모르므로, 오류가 발생했다.

그러나 결과적으로 반환값이 예상한 결과가 나오기 때문에, 아래와 같이 단언문을 추가하는 것이 문제가 되지 않는다.



```tsx
function cacheLast<T extends Function>(fn: T): T {
  let lastArgs: any[] | null = null;
  let lastResult: any;

  return function (...args: any[]) {
    if (!lastArgs || !shallowEqual(lastArgs, args)) {
      lastResult = fn(...args);
      lastArgs = args;
    }
    return lastResult;
  } as unknown as T;
}
```



### 정리

* 타입 선언은 상황에 따라 필요하기도 하고, 현실적인 해결책이 되기도 한다.
  불가피하게 사용해야 한다면, 정확한 정의를 가지는 함수 안으로 숨기도록 하자.





















