## 아이템 41 : any의 진화를 이해하기

```typescript
const result = [];  // Type is any[]
result.push('a');
result  // Type is string[]
result.push(1);
result  // Type is (string | number)[]
```

any 타입은 확장되며 진화할 수 있다. 분기에 따라서 변경될 수도 있다. 하지만 any 타입은 noImplicitaAny가 설정된 상태에서 타입이 암시적 any인 경우에만 일어난다. 명시적으로 any를 선언하면 타입이 그대로 유지된다. any 탕비의 진화는 암시적 any 타입에 어떤 값을 할당할때만 발생한다.

### 요약

- 일반적인 타입들은 정제되기만 하는 반면, 암시적 `any`와 `any[]`타입은 진화할 수 있다. 이러한 동작을 이해할 수 있어야 한다.
- `any`를 진화 시키는 방식보다 명시적 타입 구문을 사용하는 것이 안전한 타입을 유지하는 방법이다.



## 아이템 42 : 모르는 타입의 값에는 any 대신 unknown을 사용하기

`unknown` 타입을 이해하려면 할당 가능성의 관점에서 `any`를 생각해봐야 한다. `any`는 두 가지 특징 때문에 강력하면서도 위험하다.

1. 어떠한 타입이든 `any` 타입에 할당 가능하다.
2. `any` 타입은 어떠한 타입으로도 할당 가능하다. (`never`타입 예외)

타입 체커는 집합 기반이기 때문에 `any`를 사용하면 타입 체커가 무용지물이 될 수 있다. `unknown`은 `any`대신 쓸 수 있는 타입 시스템에 부합하는 타입이다. 위 `any`의 특징 중 첫 번째 속성을 만족하지만, 두 번째 속성은 만족하지 않는다. `never` 타입의 경우는 정반대로 첫 번째는 만족하지 않지만, 두 번째 속성은 만족한다.

`unknown` 타입인 채로 값을 사용하면 오류가 발생한다. `unknown` 값에 함수 호출을하거나 연산을 해도 마찬가지이다. 그래서 타입 단언을 하거나, `instanceof`를 체크한 후 원하는 타입으로 변환할 수 있다. 그리고 사용자 정의 타입 가드를 통해서도 `unknown`에서 원하는 타입으로 변경 가능하다.

> 사용자 정의 타입 가드 (User-Defined Type Guards)
>
> ```typescript
> function isBook(val: unknown): val is Book {
>   return (
>       typeof(val) === 'object' && val !== null &&
>       'name' in val && 'author' in val
>   );
> }
> function processValue(val: unknown) {
>   if (isBook(val)) {
>     val;  // Type is Book
>   }
> }
> ```
>
> 일부 스코프에서 타입을 보장하는 런타임 검사를 수행하는 표현식으로 위와 같이 `argName is Type` 의 명제 형태로 사용되는 것이다. `타입가드의 return 값이 true이면 명제가 옳다는 것으로 인식한다`.  위에서는 아래 retrun 값이 `true` 면 `val`은 `Book`이다라고 볼 수 있다.

### 요약

- `unknown` 타입은 `any` 대신 사용할  수 있는 안전한 타입이다. 어떠한 값이 있지만 그 타입을 알지 못하는 경우엔 `unknown`을 사용하면 된다.
- 사용자가 타입 단언문이나 타입 체크를 사용하도록 강제하려면 `unknow`을 사용하면 된다.
- `{}`,`object`,`unknown`의 차이점을 이해해야 한다.



## 아이템 43 : 몽키 패치보다는 안전한 타입을 사용하기

자바스크립트의 가장 유명한 특징 중 하나는 객체와 클래스에 임의의 속성을 추가할 수 있을 만큼 유연하다는 것이다. 하지만 객체에 임의의 속성을 추가하는 것은 일반적으로 좋은 설계가 아니다. 타입스크립트까지 더하면 타입체커가 임의로 추가한 속성에 대해서 알지 못한다는 문제가 발생한다. 이 문제의 간단한 해결 방법은 `any` 단언문을 사용하는 것이지만 타입 안정성을 상실하고 언어 서비스를 사용할 수 없게 된다.

```typescript
document.monkey = 'Tamarin';
      // ~~~~~~ Property 'monkey' does not exist on type 'Document'
(document as any).monkey = 'Tamarin';  // OK
(document as any).monky = 'Tamarin';  // Also OK, misspelled
(document as any).monkey = /Tamarin/;  // Also OK, wrong type
```

그렇기 때문에 최선의 해결책은 document 또는 DOM으로부터 데이터를 분리하는 것이다. 객체와 데이터가 붙어 있어야만 하는 라이브러리를 사용중이거나 마이그레이션 과정 중이라면 두 가지 차선책이 있다.

1. `interface`의 보강(augmentation)을 사용하는 방법

```typescript
interface Document {
  /** Genus or species of monkey patch */
  monkey: string;
}

document.monkey = 'Tamarin';  // OK
```

보강을 사용한 방법이 `any`보다 나은 점은 아래와 같다.

- 타입이 더 안전하다. 타입 체커는 오타나 잘못된 타입의 할당을 오류로 표시한다.
- 속성에 주석을 붙일 수 있다(TSDoc)
- 속성에 자동완성을 사용할 수 있다.
- 몽키 패치가 어떤 부분에 적용되었는지 기록이 남는다.

모듈 관점에서 제대로 동작하게 하려면 `global`선언을 추가해야 한다.

```typescript
export {};
declare global {
  interface Document {
    /** Genus or species of monkey patch */
    monkey: string;
  }
}
document.monkey = 'Tamarin';  // OK
```

보강은 전역적으로 적용되기 때문에 코드의 다른 부분이나 라이브러리로부터 분리 할 수 없다. 그리고 실행되는 동안 속성을 할당하면 실행 시점에서 보강을 적용할 방법이 없다.

2. 더 구체적인 타입 단언문을 사용하는 방법

```typescript
interface MonkeyDocument extends Document {
  /** Genus or species of monkey patch */
  monkey: string;
}

(document as MonkeyDocument).monkey = 'Macaque';
```

`MonkeyDocument`는 `Document`를 확장하기 때문에 타입 단언문은 정상이고 할당문의 타입은 안전하다. 또한 `Document` 타입을 직접 건드리지 않고도 확장하여 새로운 타입을 도입해서 모듈 영역 문제도 해결이 가능하다.

### 요약

- 전역 변수나 DOM에 데이터를 저장하지 말고, 데이터를 분리하여 사용해야 한다.
- 내장 타입에 데이터를 저장해야하는 경우, 안전한 타입 접근법 중 하나(보강이나 사용자 정의 인터페이스로 단언)을 사용해야 한다.
- 보강의 모듈 영역 문제를 이해해야 한다.



## 아이템 44 : 타입 커버리지를 추적하여 타입 안정성 유지하기

`noImplicitAny`를 설정해도 여전히 모든 `any` 타입과 관련된 문제로 안전하다고 할 순 없다. 여전히 프로그램 내에 두 가지 경우로 존재할 수 있다.

- 명시적 `any` 타입

  `any`타입의 범위를 좁히고 구체적으로 만들어도 여전히 `any`타입이다.

- 서드파티 타입 선언

  @types 선언 파일로부터 `any` 타입이 전파되기 때문에 특별히 더 조심해야 한다. 절대 `any`를 사용하지 않았다 하더라도 여전히 `any` 타입은 코드 전반에 영향을 미친다.

npm의 `type-coverage` 패키지를 통해 `any`를 추적할 수 있다. 

```bash
$ npx type-coverage
```

### 요약

- `noImplicitAny`가 설정되어 있어도, 명시적 `any` 또는 서드파티 타입 선언(@types)을 통해 `any` 타입은 코드내에 여전히 존재할 수 있다.
- 작성한 프로그램의 타입이 얼마나 잘 선언되는지 추적해야 한다. 추적을 통해 `any`의 사용을 줄여 나갈 수 있고 타입 안정성을 꾸준히 높일 수 있다.

# 6장. 타입 선언과 @types



## 아이템 45 : devDependencies에 typescript와 @types 추가하기

npm은 세 가지 종류의 의존성을 구분해서 관리하며, 각각의 의존성은 `package.json` 파일 내에 별도 영역에 들어 있다.

- dependencies : 프로젝트를 실행하는데 필수적인 라이브러리가 포함된다. 프로젝트를 npm에 공개해서 다른 사용자가 해당 프로젝트를 설치하면, dependencies에 들어 있는 라이브러리도 함께 설치된다. 이것을 전이(transitve) 의존성이라고 한다.
- devDependencies : 개발하고 테스트하는데 사용되지만, 런타임에는 필요없는 라이브러리가 포함된다. 프로젝트를 npm에 공개하여 다른 사용자가 해당 프로젝트를 설치하면, devDependencies에 포함된 라이브러리들은 제외된다는 것이 dependencies와 다른 점이다.
- peerDependencies : 런타임에 필요하나 의존성을 직접 관리하지 않는 라이브러리들이 포함된다. 플러그인이 그 예시이다.

타입스크립트 자체 의존성의 경우, devDependencies에 넣어 관리하는 것이 좋다. 그리고 타입 의존성(@types)을 고려해야 한다. DefinitelyTyped의 타입 정의들은 npm 레지스트리의 @types 스코프에 공개된다.

### 요약

- 타입스크립트를 시스템 레벨로 설치하면 안 된다. 타입스크립트를 프로젝트의 devDependencies에 포함시키고 모두 같은 버전을 사용하도록 해야된다.
- @types 의존성은 dependencies가 아니라 devDependencies에 포함시켜야 한다. 런타입에 @types가 필요한 경우라면 별도의 작업이 필요하다.



## 아이템 46 : 타입 선언과 관련된 세 가지 버전 이해하기

타입스크립트를 사용하면 세 가지 사항을 추가로 고려해야 한다.

- 라이브러리 버전
- 타입 선언(@types) 버전
- 타입스크립트 버전

보통 특정 라이브러리는 dependencies에 설치하고 타입 정보는 devDependencies에 설치한다.

하지만 실제 라이브러리와 타입 정보의 버전이 별도로 관리되는 방식은 문제점이 있다.

1. 라이브러리를 업데이트했지만 실수로 타입 선언은 업데이트하지 않는 경우 - 라이브러리 업데이트와 관련된 새로운 기능 사용 시 타입 오류 발생
2. 라이브러리보다 타입 선언의 버전이 최신인 경우 - 타입 체커는 최신 API를 기준으로 검사하나 실제로 쓰이는 것은 과거 버전이기 때문에 문제가 발생
3. 프로젝트에서 사용하는 타입스크립트 버전보다 라이브러리에서 필요로하는 타입스크립트 버전이 최신인 경우 
4. @types 의존성이 중복되는 경우

자체적인 타입 선언은 보통 `package.json`의 types 필드에서 `.d.ts` 파일을 가르키도록 되어 있다. 번들링하여 타입 선언을 하는 경우 부수적인 네 가지 문제점이 있다.

1.  번들된 타입 선언에 보강 기법으로 해결할 수 없는 오류가 있는 경우
2. 프로젝트 내의 타입 선언이 다른 라이브러리 타입 선언에 의존하는 경우
3. 프로젝트의 과거 버전에 있는 타입 선언에 문제가 있는 경우
4. 타입 선언의 패치 업데이트를 자주 하기 어려운 문제

### 요약

- @types 의존성과 관련된 세 가지 버전이 있다. 라이브러리 버전, @types 버전, 타입스크립트 버전이다.
- 라이브러리 업데이트 시, 해당 @types 역시 업데이트 해야 한다.
- 타입 선언을 라이브러리에 포함하는 것과 DefinitelyTyped에 공개하는 것 사이에 장단점을 이해해야 한다. 타입스크립트로 작성되었으면 자체 포함하고, 자바스크립트로 작성된 라이브러리면 타입 선언을 DefinitelyTyped에 공개하는 것이 좋다.



## 아이템 47 : 공개 API에 등장하는 모든 타입을 익스포트하기

### 요약

- 공개 메서드에 등장한 어떤 형태의 타입이든 익스포트해야 한다. 어차피 라이브러리 사용자가 추출할 수 있기 때문에, 익스포트하기 쉽게 만드는 것이 좋다.



## 아이템 48 : API 주석에 TSDoc 사용하기

```typescript
/** Generate a greeting. Result is formatted for display. */
function greetJSDoc(name: string, title: string) {
  return `Hello ${title} ${name}`;
}
```

위처럼 JSDoc 스타일로 주석을 만들면 IDE에서 주석을 툴팁으로 표시해준다. 하지만 인라인 주석은 편집기가 표시해주지 않는다. JSDoc에는 `@param`과 `@returns` 같은 일반적 규칙을 사용할 수 있다. 타입스크립트 관점에서는 TSDoc이라고 부른다.

```typescript
/**
 * Generate a greeting.
 * @param name Name of the person to greet
 * @param salutation The person's title
 * @returns A greeting formatted for human consumption.
 */
function greetFullTSDoc(name: string, title: string) {
  return `Hello ${title} ${name}`;
}
```

위처럼 추가하면 함수 호출부분에서 각 매개변수와 관련된 설명을 보여준다. 타입 정의에도 또한 사용 가능하다.

```typescript
interface Vector3D {}
/** A measurement performed at a time and place. */
interface Measurement {
  /** Where was the measurement made? */
  position: Vector3D;
  /** When was the measurement made? In seconds since epoch. */
  time: number;
  /** Observed momentum */
  momentum: Vector3D;
}
```

TSDoc 주석은 마크다운 형식으로 꾸며진다.

### 요약

- 익스포트된 함수, 클래스, 타입에 주석을 달 때는 JSDoc/TSDoc 형태를 사용하자. JSDoc/TSDoc 형태의 주석을 달면 IDE가 주석 정보를 표시해준다. 
- @param, @returns 구문과 문서 서식을 위해 마크다운을 사용할 수 있다.
- 주석에 타입 정보를 포함하면 안 된다.

