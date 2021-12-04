## 아이템 9 : 타입 단언보다는 타입 선언을 사용하기

타입스크립트에서 변수에 값을 할당하고 타입을 부여하는 방법은 아래와 같이 두 가지이다.

```typescript
interface Person { name: string };

const alice: Person = { name: 'Alice' };  // Type is Person
const bob = { name: 'Bob' } as Person;  // Type is Person
```

`as Person`은 타입 단언으로 타입스크립트가 추론한 타입이 있더라도 `Person` 타입으로 간주한다. 하지만 타입 단언보다 타입 선언이 낫다.

```typescript
interface Person { name: string };
const alice: Person = {};
   // ~~~~~ Property 'name' is missing in type '{}'
   //       but required in type 'Person'
const bob = {} as Person;  // No error
```

위 예시와 같이 타입 단언의 경우는 강제로 타입을 지정해서 타입 체커가 오류를 무시하기 때문이다. 이 부분은 속성 추가시에도 동일하다.

```typescript
interface Person { name: string };
const alice: Person = {
  name: 'Alice',
  occupation: 'TypeScript developer'
// ~~~~~~~~~ Object literal may only specify known properties
//           and 'occupation' does not exist in type 'Person'
};
const bob = {
  name: 'Bob',
  occupation: 'JavaScript developer'
} as Person;  // No error
```

위에 타입 선언 방식에서는 잉여 속성에 대한 체크가 동작하지만, 타입 단언에서는 에러가 뜨지 않는다. 타입 선언이 안전성 체크 면에서 바람직하다.

> `const bob = <Person>{}` 도 형태가 다르지만 `as Person`과 같은 타입 단언이다.

반대로 타입 단언이 꼭 필요한 경우가 있다. 그 경우는 타입 체커가 추론한 타입보다 직접 판단하는 타입이 더 정확할 때이다. 

```typescript
// tsConfig: {"strictNullChecks":false}

document.querySelector('#myButton').addEventListener('click', e => {
  e.currentTarget // Type is EventTarget
  const button = e.currentTarget as HTMLButtonElement;
  button // Type is HTMLButtonElement
});
```

타입스크립트는 DOM에 접근할 수 없기 때문에 `#myButton`이 버튼 엘리멘트인지 알 수 없다. 타입스크립트가 알지 못하는 정보를 우리가 가지고 있기 때문에 이러한 경우에 타입 단언문을 쓰는 것이 적합하다.

```typescript
const elNull = document.getElementById('foo');  // Type is HTMLElement | null
const el = document.getElementById('foo')!; // Type is HTMLElement
```

접두사로 쓰이는 `!`은 부정문이지만, 접미사로 쓰이는 `!`은 그 값이 `null`이 아니라는 단언문을 뜻한다.  타입체커는 알지 못하나 그 값이 `null`이라고 확신할 수 있을 때만 사용해야 한다.

타입 단언은 타입간 부분 집합인 경우에만 타입 단언문을 통해 변환이 가능하다. 

```typescript
interface Person { name: string; }
const body = document.body;
const el = body as Person;
        // ~~~~~~~~~~~~~~ Conversion of type 'HTMLElement' to type 'Person'
        //                may be a mistake because neither type sufficiently
        //                overlaps with the other. If this was intentional,
        //                convert the expression to 'unknown' first
```

위 같은 경우 서로 서브 타입이 아니기 때문에 변환 불가하다. 위 같은 상황에서 변환을 해야한다면, `unknown`을 사용하면 되는데 해당 단언문은 항상 동작하지만 `unknown`을 사용한다는 것 자체가 뭔가 위험성을 내포하고 있다고 할 수 있다.

```typescript
interface Person { name: string; }
const el = document.body as unknown as Person;  // OK
```

### 요약

- 타입 단언보다 타입 선언을 사용하자
- 화살표 함수의 반환 타입을 명시하는 방법을 터득하자
- 타입스크립트보다 타입 정보를 더 잘 알고 있다면 타입 단언문과 `null`아님 단언문을 활용하자



## 아이템 10 : 객체 래퍼 타입 피하기

JS에는 객체 이외에 Primitive 타입 일곱가지(string, number, boolean, null, undefined, symbol, bigint)가 있다. 기본형들의 경우 불변(immutable)이고, 메서드를 가지지 않는 점에서 객체와 구분된다. 하지만 `string`의 경우 메서드가 있는 것 처럼 보이지만 사실 JS에서 `string`을 `String` 객체로 자유롭게 변환하여 래핑하고 메서드를 호출한 것이다. `String.prototype`을 몽키패치 해보면 이를 알 수 있다. 

> 몽키 패치는 어떤 기능을 수정해서 사용하는 것이다. JS에서는 주로 프로토타입을 변경하는 것이 이에 해당된다.

객체 래퍼 타입의 자동 변환은 종종 당황스러운 동작을 보일 때가 있다. 예를 들어 어떤 속성을 기본형에 할당하면 그 속성이 사라진다.

```bash
> x = "hello"
> x.language = 'English'
> x.language 
// undefined
```

실제로는 x가 `String`객체로 변환된 뒤에 `language` 속성이 추가되고, 추가된 객체가 버려진 것이다.`string`말고도 다른 기본형에도 객체 래퍼 타입이 존재하기 때문에 기본형 값에 메서드를 사용할 수 있다.(`null`과 `undefined` 제외) `string`은 특히 주의 해야하는데, `string`은 `String`에 할당 가능하지만, `String`은 `string`에 할당 불가능하다.

### 요약

- 기본형 값에 메서드를 제공하기 위해 객체 래퍼 타입이 어떻게 쓰이는지 이해해야 한다. 직접 사용하거나 인스턴스를 생성하는 것은 피해야 한다.
- 타입스크립트의 객체 래퍼 타입은 지양하고, 기본형 타입을 대신 사용해야 한다. `String` 대신 `string`을 사용하는 것과 같이 다른 타입도 기본형 타입을 사용하면 된다.



## 아이템 11 : 잉여 속성 체크의 한계 인지하기



## 아이템 12 : 함수 표현식에 타입 적용하기



## 아이템 13 : 타입과 인터페이스의 차이점 알기



## 아이템 14 : 타입 연산과 제너릭 사용으로 반복 줄이기



## 아이템 15 : 동적 데이터에 인덱스 시그니처 사용하기



## 아이템 16 : number 인덱스 시그니처보다는 Array, 튜플, ArrayLike를 사용하기



