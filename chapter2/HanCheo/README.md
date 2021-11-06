# 2장 타입스크립의 타입시스템

## 아이템 9 타입 단언보다는 타입 선언을 사용하기

<br>

### 변수에 타입을 부여하는 방법

타입스크립트에서 변수에 값을 할당하고 타입을 부여하는 방법은 2가지

```typescript
interface Person {
	name: string;
}

const alice: Person = { name: 'Alice' }; // 타입 선언
const bob = { name: 'Bob' } as Person; // 타입 단언

// 결과적으로는 alice, bob의 타입은 Person으로 동일함
```

타입 선언의 경우 할당 되는 값이 해당 Person의 인페이스를 만족하는지 **검사**한다
그렇지만 타입 단언의 경우 추론된 타입이 있어도 **강제로 타입을 변환**시킨다

타입스크립트는 타입체킹을 위한 목적이고 코드검사의 역할을 가지고 있기 때문에 타입 선언을 지양해야한다.

또한 타입을 선언하지 않은 변수의 경우 자동으로 any 타입을 할당 시키기 때문에 뒤 따라오는 변수가 어떤 것이 오든 상관이 없다.

```typescript
const alice: Person = Person; // 값을 할당하기 전 타입결정
const bob: any = AnyThing; // 값을 할당한 이후에 타입결정

// alice: 나는 Person이야 나한테 맞춰서 값을 내놔!
// bob: 나는 뭐든 될수 있어 일단 줘보기나 해봐 내가 그걸로 맞출께!
```

타입 단언의 방식 2가지

```typescript
const bob = <Person>{}; // 리액트 컴포넌트(.tsx)와의 혼동의 위험이 있으므로 지양
const bob = {} as Person; // 가장 대중적인 형태
```

### 타입 단언은 언제 사용해야 할까?

타입스크립트가 판단하는 것보다 작성자의 판단이 더 정확할 때 !
대표적으로 DOM에 접근하는 경우와 click event, keyup event와 같이 e.target이 확정적으로 있는 경우가 있다.

```typescript
// "strictNullChecks": true 설정을 했다면 다음과 같은 오류가 나타난다.
const app:HTMLElement = document.querySelector('#app')

// Type 'HTMLElement | null' is not assignable to type 'HTMLElement'.
// Type 'null' is not assignable to type 'HTMLElement'.

// 아래와 같이 타입 단언을 사용해도 괜찮다.
const app = document.querySelector('#app') as HTMLElement
const app = document.querySelector('#app')!

// 하지만 아래와 같은 형태도 좋아보인다.
const app = document.querySelector('#app');
if(app) {...code}
```

### 타입 단언에서 서브 타입이 아닌 타입으로 타입 단언하기

타입 단언은 분명 타입을 강제로 변환시키는건데 왜 문제가 있을까?
any, unknown을 제외한 타입이 할당되어 있거나 원시타입일 경우 타입의 범위가 정해진다. 해당 범위안에 있는 타입들을 서브 타입이라고 하는데 이 범위를 넘어가는 타입으로 타입 단언을 하려고 하면 에러가 발생한다.
왠만해서는 이런 상황이 나오진 않겠지만 다음과 같이 해결 할 수 있다.

```typescript
const imNumber = '123' as number; // error

// 내가 보기엔 실수인거같은데..??? 진짜로 변경할려고 한거면 unknown(any도 된다)으로 먼저 변경해라
// Conversion of type 'string' to type 'number' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.

const imNumber = '123' as unknown as number; // pass
```

## 아이템 10 객체 래퍼 타입 피하기

<br>

### 객체 래퍼 타입?

string와 String, number와 Number와 같이 이들의 차이점을 알고 있다면 넘어가도 좋다.

객체래퍼 타입이라고 하면 생소할 것이다. 적어도 나에게는 생소하다. 자바스크립트에서의 원시타입으로는 현재 7가지가 있는데 원시타입은 `불변성`을 가지고 있으며 메서드를 가질수 없다. 이는 자바스크립트를 공부해보았다면 얼마든지 알 수 있는 내용이다.
그런데 가끔은 다음과 같이 코드 원시타입에 바로 함수를 붙여 작성할 때도 있다.

```javascript
const a = '나는 레전설이다.'.charAt(3);
//a = '레'
```

뭔가 이상하지 않은가??`'나는 레전설이다.'`는 함수를 가질수 없는데 string원시타입이다. 그렇지만 `.charAt(3)`를 하면 정상적으로 코드가 동작하고 `'레'`를 반환한다.

자바스크립트 동작 중에서는 null과 undefined를 제외한 원시타입에는 자동으로 객체 래퍼로 감싸서 원시타입에 맞는 객체를 새롭게 만들어준다.
따라서 위 코드의 함수는 원시타입에서 가져오는 함수가 아니라 새롭게 만들어진 String 객체에서 가져오는 함수이다. 다음과 같이 말이다.

```javascript
const a = new String('나는 레전설이다.').charAt(3);
```

타입스크립트에서 객체 래퍼의 타입을 보면 다음과 같다

```typescript
var String: StringConstructor
new (value?: any) => String
```

###그래서 왜 쓰지말라는건데

원시타입은 객체 레퍼를 통해 **새로운 객체** 로 반환된다. 이 때문에 **동일한 string의 비교는 같지만 동일한 string을 가진 String 객체 는 서로 다르다.**

```javascript
'hello' === 'hello'; // true
'hello' === new String('hello'); // false
new String('hello') === new String('hello'); // false
```

또한 string로 예시를 들자면 객체 래퍼 타입은 any를 받는다 따라서 string는 String의 프로퍼티에 값, 타입을 할당 할 수 있다. 그렇지만 객체 래퍼는 원시타입으로 할당 할 수 없다. 다음과 같은 예제를 통해서 오류를 확인하자

```typescript
function isGreeting(phrase: String) {
	return [
		'hello'
	].includes(phrase);
}
//Argument of type 'String' is not assignable to parameter of type 'string'. 'string' is a primitive, but 'String' is a wrapper object. Prefer using 'string' when possible.

//Array<string>.includes타입
Array<string>.includes(searchElement: string, fromIndex?: number | undefined): boolean
```

`.includes` 에서 `searchElement`는 `string`타입을 받고있다. 그렇지만 String는 string에 할당 될수 없기 때문에 에러가 발생한다. 그러니까 객체래퍼 타입은 쓰지말자.

## 아이템 11 잉여 속성 체크의 한계 인지하기

<br>

### 덕 타이핑과 잉여속성

타입스크립트는 기본적으로 구조적 타이핑 관점을 가지고 있기 때문에 타입의 기본 형태만 갖추고 있다면 문제가 발생하지 않는다.
여기서 타입의 기본형태를 제외한 속성들이 바로 잉여 속성이라고한다.

```typescript
interface Person {
	name: string;
	age: number;
}
const alice: Person = {
	name: 'alice',
	age: 102,
	pet: 'rabbit', // 잉여 속성
};

//`Type '{ name: string; age: number; pet: string; }' is not assignable to type 'Person'.`
```

위 코드는 구조적 타이핑으로 본다면 맞는 코드이다. `alice` 의 타입에 해당되는 name,age를 모두 가지고 있는 객체지만 에러를 반환한다. 뭐가 문제일까?

### 잉여속성체크와 할당가능검사

타입스크립트에서는 구조적 타이핑의 사이에서 발생할 수 있는 오류를 잡을 수 있도록 **잉여속성체크**과정이 있다. 이 과정은 **할당가능검사와는 다르다**.

잉여속성체크는 할당할 객체의 속성이 할당될 타입에 모두 적절하게 들어갔는지 검사를 하는 과정이며
할당가능검사는 할당할 객체의 속성이 할당될 타입의 속성을 모두 가지고 있는지의 여부만 확인한다.

잉여속성체크가 좀더 자세한 타입체킹이라고 할 수 있다.
잉여속성체크는 상황에 따라 동작하지 않는 한계가 있는데 이 때문에 구조적 타이핑에 대해 이해가 어려워진다.

```typescript
interface Person {
	name: string;
	age: number;
}

const obj = {
	name: 'alice',
	age: 102,
	pet: 'rabbit', // 잉여 속성
};

const alice: Person = obj; // pass
```

위와 같이 임시 변수 `obj`를 통해 값을 할당하게되면 에러가 발생하지 않는다. 왜그럴까?
기본적으로 타입이 명시된 변수에 **객체 리터럴 <sub>( 다른 변수를 통한것이아닌 바로 선언형태 )</sub> 형태**로 할당할 경우에만 **할당 속성외의 속성이 있는지 까지 확인**한다.

> 왜 잉여속성체크는 변수 객체에 대해서는 하지 않을까? -기본적으로 구조적 타이핑을 지원하고 있기 때문인 것 같다. 그렇지만 구조적 타이핑에도 분명 한계나 문제점이 있기 때문에 추가적인 지원을 한 것이라고 생각 된다.

## 아이템 12 함수 표현식에 타입 적용하기

<br>

### 함수 표현식과 함수 문장식

```typescript
function rollDice1(sides: number): number {
	/*..*/
} // 문장식
const rollDice2 = function (sides: number): number {
	/*..*/
}; // 표현식
const rollDice3 = (sides: number): number => {
	/*...*/
}; //표현식
```

위 세가지 함수는 모두 number를 하고 number 매개변수 하나를 받는 함수로 동일한 타입 형태를 지니고 있다.
타입스크립트에서는 함수 표현식을 사용을 권장하는데 이유는 다음과 같다.

```typescript
type DiceRollFn = (sides: number) => number;

const rollDice2: DiceRollFn = function (sides) {
	/*..*/
}; // 표현식
const rollDice3: DiceRollFn = (sides) => {
	/*...*/
}; //표현식
```

함수 표현식의 코드가 훨씬 깔끔해졌다. 함수 표현식의 경우에는 함수 매개변수형태와 리턴타입을 한번에 지정할수 있지만 함수 문장식의 경우 타입을 한번에 지정할수 있는 방법이 없다.
또한 함수 표현식에서는 `typeof functionName`를 이용해서 다른 함수의 타입을 사용이 가능하다.

```typescript
//fetch 예시
declare function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;

const checkedFetch: typeof fetch = async (input, init) => {
	const response = await fetch(input, init);

	if (!response.ok) throw new Error(`Request failed: ${response.status}`);

	return response;
};
```

input이 어떤 타입을 가지고있고 해당 타입을 가져와서 일일이 작성할 필요가 없다. 타입스크립트도 충분히 간결한 코드를 사용할 수 있다.따라서 불필요한 코드를 줄이기 위해서 함수 표현식을 쓰자 !

## 아이템 13 타입과 인터페이스의 차이점 알기

<br>

### 타입과 인터페이스

```typescript
type state = {
	name: string;
	capital: string;
}

interface state = {
	name: string;
	capital: string;
}
```

위 두개의 타입이 동작하는 형태는 같다. 대부분의 경우 서로 상호 호환되어 사용이 가능하다.

> 어떤경우에는 타입명 앞에 I 또는 T를 붙여 어떤 형태로 시작하는지 나타내는데 현재는 매우 지양되는 스타일로 여겨지고 있다. 표준라이브러리에서도 일관성있게 도입되지 않기 때문에 유용하지 않다.

### 언제 인터페이스를 쓸까?

보강기능이 있다.

```typescript
// `보강(augment)`
interface State {
	name: string;
	capital: string;
}
interface State {
	papulation: number;
}

const wyoming: State = {
	name: 'Wyoming',
	capital: 'Cheyenne',
	population: 550,
}; // pass
```

잉여속성체크로인해 오류가 날 것 같아 보이지만 통과가 되는 코드이다. 위와 같이 타입 속성을 확장하는 것을 '선언 병합'이라고 하는데 이는 인터페이스에서만 지원이 된다.

> Array의 경우 기본적으로 lib.es5.d.ts에 인터페이스가 정의되어 있고 tsconfig에서 lib목록에 ES2015를 추가하면 타입스크립트에서는 lib.es2015.d.ts에서 선언된 인터페이스를 병합한다.

### 언제 타입을 쓸까?

유니온 타입이 사용 가능하다, 튜플, 배열 타입도 선언이 간편하다, 복잡한 타입을 선언하는데 간편하다.

```typescript
type theme = 'dark' | 'light'; // 유니온 타입
type StringNumberArray = [string, number]; // 튜플 타입

interface StringNumberArray {
	// 튜플 타입
	0: string;
	1: number;
	length: 2;
}
```

보기만하는데도 인터페이스 타입선언 불편하다...

### 그러면 뭘써?

복잡한 타입을 사용하게된다면 Type을 쓰고 간단한 객체 타입이라면 **일관성**과 **보강**의 관점에서 결정을 해야한다. API에 대한 타입선언은 Type보단 Interface가 보강의 관점에서 더 낫기때문에 Interface로 작성하는 것이 조금더 유용하지만 프로젝트에서 일관적으로 Type을 쓰고 있다면 Type을 Interface를 쓰고 있다면 Interface로 작성하는 것이 맞다. 그렇지만 프로젝트에서 선언병합이 발생한다면 잘못된 설계이므로 되도록이면 타입을 사용하는것이 좀더 맞다고 볼 수 있다.

## 아이템 14 타입 연산과 제너릭 사용으로 반복 줄이기

<br>

타입 중복을 제거한다는 생각은 크게 해본적이 없는 것 같다.
타입을 관리한다는 점에서의 관점도 충분히 생각해본적이 없었던 것 같다.

### 타입 중복제거하기

1. 객체 리터럴로 선언된 타입들은 따로 뺀다

   ```typescript
   const a: { x: number; y: number } = { x: 10, y: 10 };
   //->
   type XyState = {
   	x: number;
   	y: number;
   };
   const a: XyState = { x: 10, y: 10 };
   ```

2. 중복되는 타입은 타입을 확장시키는 방향으로 사용한다.

   ```typescript
   interface Person {
   	name: string;
   }
   interface PersonWithBirthDate extends Person {
   	brith: Date;
   }

   type PersonWidthBirthDate = Person & { birth: Date };

   //--- 역으로 확장하기
   //--- 코드상으로는 코드길이가 길어지지만 하나의 타입에서 모든것을 관리할수 있음

   interface Person {
   	name: string;
   	gender: string;
   	brith: Date;
   }

   interface PersonNameWithBirth {
   	name: Person['name'];
   	brith: Person['birth'];
   }

   type PersonNameWithBirth = {
   	[k in 'name' | 'birth']: Person[k];
   };
   ```

3. 타입 선언용 패턴 작성하기

   ```typescript
   type Pick<T, K> = { [k in K]: T[k] }; // 이 코드는 오류를 발생시킨다 오류는 8번에서 확인.
   type PersonNameWithBirth = Pick<Person, 'name', 'birth'>;
   ```

4. 유니온 타입을 인덱싱하기

   ```typescript
   interface SavaAction {
   	type: 'save';
   }
   interface LoadAction {
   	type: 'load';
   }
   type Action = SaveAction | LoadAction;
   type ActionType = 'sava' | 'load'; // 중복!!
   //---
   type ActionType = Action['type']; // 'save' | 'load'
   //유니온 타입(Action)에 새로운 인터페이스를 추가시 자동으로 ActionType이 늘어남

   //참고
   type ActionRec = Pick<Action, 'type'>; // {type: "save" | "load"} 형태로 정의됨
   ```

5. 속성타입을 유니온화 하기

   ```typescript
   interface Options {
   	width: number;
   	height: number;
   	color: string;
   	label: string;
   }
   interface OptionsUpdate {
   	width?: number;
   	height?: number;
   	color?: string;
   	label?: string;
   }
   //---
   type OptionsUpdate = { [k in keyof Options]?: Options[k] };
   //표준으로 작성되어있음 아래와 같이 사용해도 동일한 결과.
   type OptionsUpdate = Partial<Options>;
   ```

6. 값의 형태에 해당하는 타입을 정의하기

   ```typescript
   const INIT_OPTIONS = {
   	width: 650,
   	height: 480,
   	color: '#00ff00',
   	label: 'VGA',
   };
   interface Options {
   	width: number;
   	height: number;
   	color: string;
   	label: string;
   }
   //---
   type Options = typeof INIT_OPTIONS; // 값을 보다 타입을 먼저 선언하는 것이 좋음. 위치에 영향 x
   ```

7. 함수나 메서드의 반환 값에 대한 타입 만들기

   ```typescript
   function getUserInfo(userId: string) {
   	return {
   		userId,
   		name,
   		age,
   		height,
   		weight,
   	};
   }
   //---
   type UserInfo = ReturnType<typeof getUserInfo>;
   ```

8. 제너릭 타입 매개변수 확장하기

   ```typescript
   interface Name {
   	first: string;
   	last: string;
   }
   type DancingDuo<T extends Name> = [T, T];

   const couple1: DancingDuo<Name> = [
   	{ first: 'Fred', last: 'Astarie' },
   	{ first: 'Ginger', last: 'Rogers' },
   ];
   const couple2: DancingDuo<{ first: string }>; // error last 속성이 없음.
   ```

   위 내용을 토대로 3번의 Pick 을 리팩토링 해보자 3번의 에러는 다음과 같다.

   ```typescript
   type Pick<T, K> = { [k in K]: T[k] };
   // Type 'K' is not assignable to type 'string | number | symbol'.
   // Type 'K' is not assignable to type 'symbol'
   // Type 'k' cannot be used to index type 'T'.
   ```

   `type Pick<T, K>` 이 부분만 본다면 `T` 와 `K` 는 서로 연관성이 없는 관계이다. 두 타입의 연관은 `{k in K}: T[k]` 부분에서 정해진다. 바로 이 부분에서 에러가 발생하는데 연관성이 없는 두 타입을 가지고 연관을 지을 때 나타난다. Pick의 오류를 무시하고 확인해보면 다음과같이 타입 추론이 된다.

   ```typescript
   type Pick<T, K> = { [k in K]: T[k] };

   type Person = {
   	name: string;
   	age: number;
   	birth: string;
   };

   type PersonNameWithBirth = Pick<Person, 'name' | 'title'>; //pass

   /* 타입 추론된 결과
   type PersonNameWithBirth = {
       title: unknown;
       name: string;
   }
   */
   ```

   결과만 본다면 타입의 일부분을 추출하려고 사용했지만 타입의 일부분이 아닌것 또한 타입이 추출될수 있다는 점에서 문제의 요지가 있다. 위에서 사용했듯이 제네릭 타입을 확장해서 사용한다면 어떻게 추론될지 확인해보자

   ```typescript
   type Pick<T, K extends keyof T> = { [k in K]: T[k] };

   type Person = {
   	name: string;
   	age: number;
   	birth: string;
   };

   type PersonNameWithBirth = Pick<Person, 'name' | 'title'>; //error

   /*
     Type '"title" | "name"' does not satisfy the constraint 'keyof Person'.
     Type '"title"' is not assignable to type 'keyof Person'.
   */
   ```

   위와 같이 `PersonNameWithBirth` 를 선언하는 부분에서 바로 에러를 도출해 낼수 있으며 위험요소를 확실하게 줄일 수 있다.
   제너릭 타입은 굉장히 유용하지만 unknown과 비슷한 성질을 띄고 있는 것 같다. 뭐든 될 수 있는것이 장점이지만 뭐든 될 수 있기 때문에 단점으로 작용한다. 그래서 제너릭 타입을 사용할 때에도 신중하게 고민할 필요가 있다.

   **표준 라이브러리 정의된 Pick, Partial, ReturnType 같은 제너릭 타입에 익숙해지자.**

## 아이템 15 동적 데이터에 인덱스 시그니처 사용하기

<br>

### 동적데이터

만일 객체의 속성이 변할수도 있다는 문제가 있고 이러한 형태의 타입을 지정해주기 위해서는 어떻게 해야할까?
예를 들어 외부 csv 파일을 읽어 가져온다고 하였을때 파일의 컬럼명을 미리 알 수 있는 방법이없다. 그렇기 떄문에 데이터의 타입을 명확하게 설정할 수가 없다.

바로 여기서 인덱스 시그니쳐가 나타난다.

```typescript
type Person = { [property: string]: string };
```

위와 같이 작성하면 Person은 0개 이상의 string 형태의 속성명칭과 속성 값을 가진 타입으로 지정된다.

```typescript
const alice: Person = {
	name: '123',
	age: '12',
}; // pass
const titi: Person = {
	nickName: 'tt',
	level: '12',
}; //pass
const guros: Person = {}; // pass
```

좀더 유연해 보이지 않은가?? 대신 보면 바로 알 수 있듯이 단점이 바로바로 눈에 띄인다.

1. 모든 속성명을 허용하기 때문에 위험성도 있다. 모든 속성명이라 하믄 속성명이 없는 단순 {} 빈 객체에도 할당이 가능하다
2. 모든 속성명의 값은 설정한 값으로 통일된다.
3. 속성명을 사전에 알수 없기 때문에 타입스크립트에서 지원하는 자동완성은 어렵다.

좀더 안정적으로 사용하기 위해서는 undefined 값을 추가해주는 방향도 고려해주어야 한다.

```typescript
type Person = { [property: string]: string | undefined };
```

위와 같이 사용하면 값이 undefined 인지 체킹하는 과정을 거쳐야 string 값을 사용할 수있다.

위와 같이 타입을 사용할 수 있지만 가능하다면 정확한 타입을 쓰자..!

## 아이템 16 number 인덱스 시그니처보다는 Array, 튜플, ArrayLike를 사용하기

<br>

이게 무슨 소리인가 하면 자바스크립트의 특성에 대해서 알 필요가 있다.

```javascript
'1' == 1; // true
```

이는 배열에서도 똑같이 적용되며 자바스크립트 배열은 해시뱅 형태로 일반적인 자료구조와 다르다는 점을 특징으로 보았을때 자바스크립트의 배열의 인덱스는 '1', 1이 모두 될 수 있다는 것이다.

타입스크립트에서는 이러한 특성을 좀더 바로잡기 위해서를 잡기 위해서 배열에서 1과 '1'이 각각 다르다는 것이라고 인식한다. 그렇기 때문에 number를 인덱싱 시그니처로 사용하는 것과 string 형태의 숫자를 인덱스 시그니처로 사용하는것이 다르게 판단된다. 그렇기 때문에 다음과 같이 숫자 형태의 타입을 작성하는 것은 좋은 예제가 아니다.

```typescript
interface numArr {
	0: string;
	1: string;
	length: number;
}
```

물론 예외사항이 있다.

```typescript
const xs = [1, 2, 3]; //number[]

const keys = Object.keys(xs); // string[]
for (const key in xs) {
	key; // string
	const x = xs[key]; // x: number; pass
}
```

Key는 string이고 xs는 [key: number] : number의 형태를 띄고 있는 배열이다. key의 타입이 일치하지 않는데에도 타입이 통과가 된다.
실제 자바스크립트 런타임에서는 0과 '0'의 타입의 전환이 당연하게 여겨지는 것이기 때문에 배열을 순회하는 코드 스타일에 대한 실용적인 허용이라고 생각 하는 것이 좋다고 한다. 그렇지만 좋은 코드는 아니다.

따라서 number 형태의 인덱싱을 하려면 거의 대부분의 사항이 배열에 해당되겠지만 아래와 같이 Array, ArrayLike를 사용하는 것이 좋다.

```typescript
interface Array<T> {
	[n: number]: T;
	length: number;
}
interface ArrayLike<T> {
	readonly length: number;
	readonly [n: number]: T;
}

const a: Array<string> = {
	'1': 'string',
	'2': 'string',
	length: 2,
}; // error
/*
Type '{ '1': string; '2': string; length: number; }' is missing the following properties from type 'string[]': pop, push, concat, join, and 28 more.
*/

const a: ArrayLike<string> = {
	'1': 'string',
	'2': 'string',
	length: 2,
}; // pass

const a: ArrayLike<string> = {
	g: 'string',
	gg: 'string',
	length: 2,
}; // error
/*
Type '{ g: string; gg: string; length: number; }' is not assignable to type 'ArrayLike<string>'.
  Object literal may only specify known properties, and ''g'' does not exist in type 'ArrayLike<string>'.
*/
```
