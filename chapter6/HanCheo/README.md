# 6주차

> [아이템 41. any의 진화를 이해하기](##아이템-41.-any의-진화를-이해하기)  
> [아이템 42. 모르는 타입의 값에는 any 대신 unknown을 사용하기](##아이템-42.-모르는-타입의-값에는-any-대신-unknown을-사용하기)  
> [아이템 43. 몽키 패치보다는 안전한 타입을 사용하기](##아이템-43.-몽키-패치보다는-안전한-타입을-사용하기)  
> [아이템 44. 타입 커버리지를 추적하여 타입안정성 유지하기](##아이템-44.-타입-커버리지를-추적하여-타입안정성-유지하기)  
> [아이템 45. devDependencies에 typescript와 @types 추가하기](##아이템-45.-devdependencies에-typescript와-@types-추가하기)  
> [아이템 46. 타입 선언과 관련된 세 가지 버전 이해하기](##아이템-46.-타입-선언과-관련된-세-가지-버전-이해하기)  
> [아이템 47. 공개 API에 등장하는 모든 타입을 익스포트하기](##아이템-47.-공개-api에-등장하는-모든-타입을-익스포트하기)  
> [아이템 48. API 주석에 TSDoc 사용하기](##아이템-48.-api-주석에-tsdoc-사용하기)

## 아이템 41. any의 진화를 이해하기

이번 아이템에서는 명시적 타입 선언이 일어나지 않은 변수에 대해서 나타나는 any 타입의 변화에 대해서 말하고 있다.

```typescript
function range(start: number, limit: number) {
  const out = []; // any[]
  for (let i = start; i < limit; i++) {
    out.push(i); // any[]
  }
  return out; // number[]
}

let value; //any

if (Math.random() < 0.5) {
  value = /Hello/;
  value; // RegExp;
} else {
  value = 12;
  value; // number;
}
val; // RegExp | number;
```

위와 같이 암시적 any타입은 해당 변수에 어떤 값이 들어가냐에 따라 타입이 진화된다.
하지만 명시적으로 any 타입을 지정할 경우에는 타입이 그대로 유지된다.

```typescript
let value; //any

if (Math.random() < 0.5) {
  value = /Hello/;
  value; // any;
} else {
  value = 12;
  value; // any;
}
val; // any;
```

any의 타입진화는 암시적 any타입에 값을 할당할 때만 발생한다. 변수가 추론되는 원리와 동일하고 진화를 이용하여 최종적으로 return 되는 타입을 검증할수 있다 그렇지만 이렇게 타입을 진화시키는 방법보다 명시적으로 타입을 미리 선언하는 것이 더 좋은 설계이다.

> 일반적인 타입은 정제되기만 하지만 암시적 any와 any[] 타입은 진화가 가능하다. 이번 아이템은 이러한 동작이 발생하는 코드를 인지하는 것이 목표이다.
>
> 물론 any를 진화시키는 것보다 명시적 타입 구문을 사용하는 것이 안전하다.

## 아이템 42. 모르는 타입의 값에는 any 대신 unknown을 사용하기

any타입은 타입체킹을 무시하는 타입으로 강력하지만 typescript의 기능을 충분히 활용하지 못하는 타입과 같다.

이번 아이템에서는 any, unknown, never의 차이점을 알고간다.

any:

1. 어떠한 타입이든 any 타입에 할당이 가능하다.
2. Any 타입은 어떠한 타입으로도 할당 가능하다. (never 타입 예외)

unknown:

1. 어떠한 타입이든 unknown 타입에 할당이 가능하다.
2. unknown타입은 unknown과 any에 타입으로만 할당이 가능하다

never:

1. 어떠한 타입도 never에 할당할 수 없다.
2. never 타입은 어떠한 타입으로도 할당이 가능하다

```typescript
//any
function sum(a: number, b: number) {
  return a + b;
}

let a: any = 1;
let b: any = 2;

sum(a, b);
//여기서 a,b의 타입은 any이지만 sum의 매개변수에 할당이 가능해진다.

//unknown
let a: unknown = 1;
let b: unknown = 2;

sum(a, b); //ERROR
//Argument of type 'unknown' is not assignable to parameter of type 'number'.
//unknown은 unknown, any를 제외한 타입에는 할당이 불가능하다.

//never
let a: never = 1; //Error
// Type 'number' is not assignable to type 'never'.
let b: never = 2; //Error
// Type 'number' is not assignable to type 'never'.
//어떠한 타입도 never에 할당할 수 없다.
sum(a, b);

//unknown never
let a: unknown = 1;
let b: unknown = 2;

sum(a as never, b as never); //pass
//never은 어떠한 타입으로도 할당이 가능하다. 위와같이 사용하면 안되지만 any와 동일한 동작을한다.
```

### 이중단언문에서 undefined 사용하기

```typescript
declare const foo: Foo;
let barAny = foo as any as Bar;
let barUnk = foo as unknown as Bar;
```

> `barAny`와 `barUnk`는 기능적으로 동일하지만 나중에 두개의 단언문을 분리하는 리팩터링을 하게되는 경우 unknown 형태가 더 안전하다. any는 분리되는 순간 영향력이 퍼진다

### unknown 처럼 사용되었던 object, {} 차이 파악하기

- {} 타입은 null과 undefined를 제외한 모든 값을 포함한다.
- object 타입은 모든 비기본형(non-primitive) 타입으로 이루어진다. 여기에는 `true` 또는 `12` 또는 "foo"가 포함되지 않지만 객체와 배열은 포함된다.

`{}`타입은 `unknown`에서 `null`과 `undefined`를 제외한 타입이라 생각하면된다. 따라서 `null`과 `undefined`가 불가능하다고 판단되는 경우만 `unknown 대신 `{}`를 사용하면된다.

## 아이템 43. 몽키 패치보다는 안전한 타입을 사용하기

> 몽키 패치
>
> 프로그램을 확장하거나, 로컬 시스템 소프트웨어를 지원하고 수정하는 방법이다.(그냥 런타임 중 코드를 수정한다는 의미) - 오직 실행중인 프로그램의 인스턴스에 영향을 미친다.

자바스크립트의 특징중 하나는 선언된 객체와 클래스에 임의의 속성을 추가할 수 있을만큼 유연하다. 예를 들어 브라우저 환경에서는 document, window와 같은 객체에도 값을 할당하여 전역변수를 만들기도 한다.

```javascript
window.monkey = 'Tamarin';
document.monkey = 'Howler';
```

또는 domElement에 직접 접근하여 데이터를 추가하기 위해서도 사용한다.

```javascript
const el = document.ggetElementById('colobus');
el.home = 'tree';
```

심지어 내장 프로토타입에도 속성을 추가할 수 있다.

```javascript
RegExp.prototype.monkey = 'Capuchin';
/123/.monkey; // Capuchin;
```

다만 자바스크립트에서 해당되는 것이며 타입스크립트에서는 문제가 발생한다. 타입 체커는 Document와 HTMLElement의 속성에 대해서는 알고는 있지만 임의로 추가한 속성에 대해서는 모른다.

### 타입 확장하기

```typescript
document.monkey = 'Tarmarin';
//error `monkey` not in document;
```

1. any 사용하기

   ```typescript
   (document as any).monkey = 'Tamarin'; // 정상
   ```

   하지만 타입안정성을 상실하고 타입스크립트 언어 서비스를 사용할 수 없다.

2. 타입 보강하기

   ```typescript
   interface Document {
     monkey: string;
   }
   document.monkey = 'Tamarin'; //pass
   ```

   interface 타입의 특성을 이용하여 document 타입을 보강하여 사용한다. any보다 좋은 이유는 다음과같다.

   1. 타입이 더 안전하다. 타입오류를 표시해준다.
   2. TSDoc을 이용해 속성에 주석을 붙일 수 있다.
   3. 속성 자동완성 사용이 가능하다.
   4. 몽키 패치가 어떤 부분에 적용되었는지 기록이 남는다.

3. Global 타입 보강하기.

   모듈의 관점에서 타입을 보강하는 방법이다.

   ```typescript
   export {};
   declare global {
     interface Document {
       /**몽키 패치 속(genus) 또는 종(species) */
       monkey: string;
     }
   }
   document.monkey = 'Tamarin'; //pass
   ```

4. 타입 단언문 사용하기

   ```typescript
   interface MonkeyDocument extends Document {
     /**몽키 패치 속(genus) 또는 종(species) */
     monkey: string;
   }
   (document as MonkeyDocument).monkey = 'Macaque';
   ```

   `Document`를 `extends`하여 사용하기 떄문에 타입은 안전하고 `Document` 타입을 그대로 사용하는 것이 아닌 별도로 빼내어서 사용했기 때문에 모듈영역에서도 안전하다. 따라서 몽키패치된 속성을 사용하는 곳에서만 단언을 사용하면 된다.

> 그래도 몽키패치는 되도록 사용하면 좋지 않다.
>
> - 전역 변수나 DOM에 데이터를 저장하지 말고, 데이터를 분리하여 사용해야한다.
> - 내장 타입에 데이터를 저장하는 경우, 안전한 타입 접근법 중 하나(보강, 사용자정의 인터페이스로 단언)을 사용해야한다.
> - 보강의 모듈 영역 문제를 이해해야한다.

## 아이템 44. 타입 커버리지를 추적하여 타입안정성 유지하기

현재 프로젝트의 any타입이 얼마나 사용되었는지 추적할수 있는 npm 패키지이다.

```
npx type-coverage
9985 / 10117 98.69%
```

### 파일단위로 추적하기

```
npx type-coverage --detail
path/to/code.ts:1:10 getColumnInfo
path/to/module.ts:7:1 pt2
...
```

이를 이용하여 any의 근원지를 찾아 any타입 사용처를 해결할 수 있다.

> noImplicitAny가 설정되어 있어도, 명시적 any 또는 서드파티 타입 선언 (@types)을 통해 any 타입은 코드 내에 여전히 존재할수 있다.
> 작성된 프로그램 타입이 얼마나 잘 선언되어 있는지 추적할 수 있어야한다.

# 6장 타입선언과 @types

## 아이템 45. devDependencies에 typescript와 @types 추가하기

- dependencies

  현재 프로젝트를 실행하는 데 필수적인 라이브러리가 포함된다. 프로젝트 런타임에 lodash가 사용된다면 `dependencies`에 포함되어야 한다. 프로젝트를 npm에 공개하여 다른 사용자가 해당 프로젝트를 설지한다면, `dependencies`에 들어있는 라이브러리도 함께 설치된다. 이러한 현상을 전이 의존성이라고 한다.

- devDependencies

  현재 프로젝트를 개발하고 테스트하는데 사용되지만 런타임에는 필요없는 라이브러리가 포함된다. 예를들어 테스트프레임워크 (jest, mocha, ...), @types등이 해당된다. 프로젝트를 npm에 공개하여 다른 사용자가 해당 프로젝트를 설치한다면, devDependencies 포함된 라이브러리는 제외된다.

- peerDependencies

  런타임에 필요하긴 하지만, 의존성을 직접 관리하지 않는 라이브러리들이 포함된다. 단적인 예로 플러그인을 들 수 있다. 제이쿼리의 플러그인은 다양한 버전의 제이쿼리와 호환되므로 제이쿼리의 버전을 플러그인에서 직접 선택하지 않고, 플러그인이 사용되는 실제 프로젝트에서 선택하도록 만들 때 사용한다.

### PeerDependencies

`peerDependencies` 에 대해서 여기서 처음 들었는데 내용이 이해가 잘 안되어 좀더 찾아보았다.

위의 제이쿼리의 예를 들어본다면 `dependencies`에 제이쿼리 플러그인을 사용했는데 해당 플러그인이 제이쿼리 1.5 버전과 맞춰 동작한다면 해당 정보를 표시해야하는데 이때 사용하는것이다.

```json
{
  "name" : "JQuery-Project"
  "version" : "1.3.5"
  "peerDependencies": {
  	"jquery": "1.5"
	}
}
```

즉, 내 프로젝트가 어떤 호환성을 가지고 있는지 표시하는 것과 동일하다.

추가 설명

> ## `peerDependencies`
>
> 보통 `package.json`에서 `dependencies`나 `devDependencies`를 사용하지만 `peerDependencies`는 gulp, grunt 같은 도구의 플러그인을 제작할 때 사용한다. 예를 들어 플러그인이 gulp v3 이상에서만 동작할 때 gulp v3가 설치되어 있다는 전제가 필요하고 이는 소스에서 사용하는 `dependencies`과는 다른데 이를 `peerDependencies`라고 부른다. 예를 들어 [Chai Assertions for Promises](https://github.com/domenic/chai-as-promised)의 `peerDependencies`는 `"chai": ">= 2.1.2 < 4"`라고 정의되어 있는데 `npm install chai-as-promised`로 설치하면 npm v2에서는 필요한 `peerDependencies`를 함께 설치한다
>
> ```bash
> $ npm ls
> /Users/outsider/peer
> ├─┬ chai@3.5.0
> │ ├── assertion-error@1.0.2
> │ ├─┬ deep-eql@0.1.3
> │ │ └── type-detect@0.1.1
> │ └── type-detect@1.0.0
> └── chai-as-promised@5.3.0
> ```
>
> npm v3에서는 이전처럼 자동으로 설치하지 않고(`peerDependencies`가 꼬이면 피곤하다.) `peerDependencies`가 충족되지 않으면 다음과 같이 경고가 나타난다.
>
> ```
> $ npm ls
> /Users/outsider/peer
> ├── UNMET PEER DEPENDENCY chai@>= 2.1.2 < 4
> └── chai-as-promised@5.3.0
>
> npm ERR! peer dep missing: chai@>= 2.1.2 < 4, required by chai-as-promised@5.3.0
> ```
>
> [npm v3에서 달라진 점 ](https://blog.outsider.ne.kr/1230)

### 타입스크립트릴 시스템 레벨로 설치하지말자

타입스크립트 프로젝트의 devDependencies에 타입스크립트를 포함시키고 팀원 모두가 동일한 버전을 사용하도록 하자. 만약 버전이 다르게 프로젝트가 진행된다면 코드가 꼬일 수 있다.

> @types 의존성은 dependencies가 아니라 devDependencies에 포함시켜야한다. 런타임에 @types가 필요한 경우라면 별도의 작업이 필요하다.

## 아이템 46. 타입 선언과 관련된 세 가지 버전 이해하기

타입스크립트를 사용하게된다면 추가적으로 살펴봐야할 버전이 있다.

1. 라이브러리의 버전
2. 라이브러리 @types의 버전
3. 타입스크립트의 버전

위 세가지 버전 중 하나라도 맞지 않으면 의존성과는 상관없어 보이는 곳에서 엉뚱한 오류가 발생할 수 있다.
이번 아이템 내용을 모르고 지나쳤다면 단순 보강이나 타입을 확장하여 사용하여 해결했겠지만 근본적인 원인파악을 하지는 못했을 것이다.

### 라이브러리와 @types를 별도로 관리하는 방식

기존 자바스크립트 프로젝트에 `definitelytyped`에 별도로 타입 정보를 추가하여 관리하는 방법이다. 이와 같은 방법에는 4가지 문제점이 있다.

1. 라이브러리를 업데이트 했지만 타입 선언은 업데이트 하지 않는 경우 -> 라이브러리의 신규 기능을 사용할때마다 타입 오류가 발생한다. 특히나 큰 버전 업데이틀 하위 호환성이 깨지는 경우는 타입체커를 통과하더라도 런타임 오류가 발생한다.
   -> 보강기법을 사용하거나 타입선언을 직접 업데이트 하여 커뮤니티에 기여하는 방법이 있다.

2. 라이버리보다 타입 선언 버전이 최신인 경우 -> 타입 정보 없이 라이브러리를 사용해오다가 뒤늦게 타입 선언을 설치하려고 할 때 발생한다. 이런 경우는 드물지만 설치하기 전에 라이브러리가 업데이트 되고 타입이 업데이트 되었다면 문제가 발생한다.

   -> 라이브러리 버전을 올리거나 타입 선언 버전을 내린다.

3. 프로젝트에서 사용하는 타입스크립트 버전보다 라이브러리에서 필요로하는 타입스크립트 버전이 더 최신인 경우. 일반적으로 로대시, 리액트, 람다 같은 유명 자바스크립트 라이브러리는 타입정보를 좀 더 정확하게 표현하기 위해 타입스크립트가 개선 되면 버전이 올라간다.
   현재 프로젝트보다 라이브러리 타입스크립트 버전이 높다면 @types 선언에서 문제가 발생한다.
   -> 타입스크립트 버전을 올리거나, 해당 라이브러리의 타입선언을 낮춘다.

4. `@types`의존성이 중복 되는 경우. 런타임에 사용되는 경우라면 타입이 제거되므로 큰 문제는 없지만 `global namespace`에 사용되는 경우라면 문제가 발생한다. 이런 경우에는 `npm ls @types/moduleName`을 실행하여 타입선언 중복 발생을 추적하고 중복된 @types의 버전을 서로 호환되도록 맞추는 방법이 있다.

### 타입선언을 포함하는 라이브러리

타입스크립트로 작성된 라이브러리들은 자체적으로 타입 선언을 포함(번들링)하게 됩니다. 자체적인 타입 선언은 보통 `package.json`의 "types"필드에서 .d.ts 파일을 가리키도록 되어 있다. 별도로 @types를 만들어주지 않아도 되어 버전 불일치를 해결할 수 있는 장점이 있지만 다음과 같은 4가지 문제점이 있다.

1. 번들된 타입 선언에 보강 기법으로 해결할 수 없는 오류가 있는 경우, 또는 공개 시점에는 잘 동작했지만 타입스크립트 버전이 올라가면서 오류가 발생하는 경우.
   -> @types가 별도로 사용된다면 라이브러리 자체의 버전에 맞추어 선택하지만 번들된 타입은 @types의 버전 선택이 불가능하다. `DefinitelyTyped`는 타입스크립트 버전이 올라갈 때마다 모든 타입 선언을 점검하며, 문제가 발생한 곳은 빠른 시간내에 해결하고 있다.
2. 프로젝트 내의 타입 선언이 다른 라이브러리의 타입 선언에 의존한다면 문제가 된다. 타입은 보통 `devDependencies`에 들어가고 프로젝트를 공개하고 `install` 할경우 `dependencies`에 있는 라이브러리만 설치되므로 dev에 설치된 `@types`는 설치되지 않아 타입오류가 발생한다. 그렇다고 dependencies에 포함하기에는 `javascript`만 사용하는 사람은 별로 좋아하지 않을 소식이다.
   -> `DefinitelyTyped`에 타입선언을 공개하는 경우라면 `javascript`를 사용하는 경우는 걱정거리가 없고 타입 선언은 @types에 있으므로 타입스크립트 사용자만이 타입정보를 사용하게 된다. 첫번째 문제에 대해서는 추후 타입스크립트 선언 방법으로 다룬다.
3. 프로젝트의 과거 버전에 있는 타입 선언에 문제가 있는 경우 과거 버전으로 돌아가서 패치 업데이트를 해야한다.
   -> `DefinitelyTyped`에서는 동일 라이브러리의 여러 버전의 타입 선언을 동시에 유지보수 할 수 있다.
4. 타입 선언의 패치 업데이트를 자주 하기 어렵다는 문제점이 있다. react의 경우 라이브러리보다 타입선언에 대한 패치 업데이트가 훨씬 많다.
   -> `DefinitelyTyped`의 경우 커뮤니티에서 관리 되기 때문에 이러한 작업량을 감당할 수 있지만 개별 프로젝트의 경우에는 개별적으로 관리되기 때문에 처리시간이 보장 받지 못한다.

공식적인 권장사항은 타입스크립트로 작성된경우 타입 선언을 라이브러리에 포함하는 것이 좋다. 타입스크립트 컴파일러가 타입선언을 대신 생성해 주기 때문에, 타입스크립트로 작성된 라이브러리에 타입선언을 포함하는 방식은 잘 동작한다. 반면 자바스크립트의 경우는 타입선언을 손수 작성해주기 때문에 오류가 있을 가능성이 높고 잦은 업데이트가 필요하다. 이런경우 `DefinitelyTyped`에 공개하여 유지보수 하는 것이 좋다.

> @types 의존성과 관련된 세가지 버전이 있다. 라이브러리, @types, 타입스크립트 버전.
>
> 라이브러리를 업데이트하는경우 해당 @Types도 업데이트 해야한다.
>
> 타입 선언을 라이브러리에 포함하는 것, DefinitelyTyped에 공개하는 것 사이의 장단점을 파악해야한다. 타입스크립트로 작성된 라이브러리라면 타입선언을 자체적으로 포함하고, 자바스크립트로 작성된 라이브러리라면 타입 선언을 DefinitelyTyped에 공개하는것이 좋다.

## 아이템 47. 공개 API에 등장하는 모든 타입을 익스포트하기

```typescript
interface SecretName {
  first: string;
  last: string;
}
interface SecretSanta {
  name: SecretName;
  gift: string;
}

export function getGift(name: SecretName, gift: SecretSanta): SecretSanta {
  /.../;
}

/**이렇게 해도 외부에선 타입을 추출할수 있다.*/

type MySanta = ReturnType<typeof getGift>;
type MyName = Parameters<typeof getGift>[0];
```

위에서 타입코드를 추출한 것만 봐도 굉장히 불편하다.

공개 메서드에 등장한 어떤 형태의 타입이든 익스포트해야한다. 어차피 라이브러리 단에서 사용자가 추출할 수 있으므로, 익스포트 하기 쉽게 만드는 것이 좋다.

## 아이템 48. API 주석에 TSDoc 사용하기

- // : 인라인 주석이라고 한다. 이는 별도로 툴팁표시가 되지 않는다.

- /\*_ ... _/ : Doc형태의 주석이다 함수에 정보나 툴팁의 표시해준다. Markdown을 지원한다.

> 익스포트된 함수, 클래스, 타입 주석은 JSDoc/TSDoc 형태를 사용하자
>
> @param, @returns 구문과 문서서식을 위해 마크다운 사용이 가능하다.
>
> 주의 : 주석에 타입 정보를 포함하지 말자.
