# 2장. 타입스크립트의 타입 시스템

### Key Point

* 타입 시스템이란 무엇인가
* 어떻게 사용해야 하는가
* 무엇을 결정해야 하는가
* 가급적 사용하지 말아야 할 기능은 무엇인가



## 아이템6. 편집기를 사용해서 타입 시스템 탐색하기



IDE를 사용하면 타입스크립트가 해당 타입을 어떻게 판단하고 있는지 확인할 수 있다.

> ***아래와 같이 타입스크립트가 추론하는 함수의 타입도 알 수 있으며, 이 값이 기대와 다르다면 직접 명시하고, 문제 발생 부분을 찾아봐야 한다.***

 ![스크린샷 2021-10-29 오후 3.37.32](/Users/jonghopark/Library/Application Support/typora-user-images/스크린샷 2021-10-29 오후 3.37.32.png)



편집기 상의 타입 오류를 살펴보는 것도 타입 시스템 성향 파악에 좋은 방법이 될 수 있다. 아래의 예시를 보자.

```tsx
function getElement(elOfId: string | HTMLElement | null): HTMLElement {
  if (typeof elOfId === "object") {
    return elOfId; // 에러 1
  } else if (elOfId === null) {
    return document.body;
  } else {
    const el = document.getElementById(elOfId);
    return el; // 에러 2
  }
}
```

해당 부분에서, typeof null은 "object" 이므로, elOfId는 null 일 가능성이 남아있다. 또, 에러 2에선 document.getElementById가 null을 반환할 가능성이 있으므로, 이를 또 예외처리 해주어야 한다.



## 아이템 7. 타입이 값들의 집합이라고 생각하기

변수는 다양한 값을 할당할 수 있지만, 타입스크립트가 오류를 체크하는 순간에는 **'타입'**을 가지게 된다.



>  ***즉, 할당 가능한 값들의 집합이 타입이라고 생각하면 된다.***

예를 들면, 모든 숫자값의 집합을 number 타입이라고 생각할 수 있다.



가장 작은 집합은 아무 값도 포함하지 않는 공집합이며, 타입스크립트에서는 **Never 타입**이다. 여기엔 아무 값도 할당할 수 없다.

그 다음으로 작은 집합은 한 가지 값만 포함하는 타입이다. 타입 스크립트에서 unit 타입이라고도 불리는, **literal 타입**이다.

```tsx
type A = 'A';
type B = 'B';
type Twelve = 12;
```

 이를 두 개, 세 개로 묶으려면 union 타입을 사용한다.

```tsx
type AB = 'A' | 'B';
type AB12 = 'A' | 'B' | 12;
```

유니온 타입은 값 집합들의 합집합을 일컫는다.

타입 스크립트의 많은 오류가 "할당 가능한" 이란 문구가 있는데, 이는 집합의 관점에서 '~의 원소', "~의 부분 집합"을 의미한다.

> ***즉,  타입 체커의 주요 역할은 하나의 집합이 다른 집합의 부분 집합인지 검사하는 것 이라고 볼 수 있다.***



이 때, 다음과 같은 인터페이스를 생각해보자.

```tsx
interface Identified{
  id: string;
}
```

구조적 타이핑 규칙에 의하여, 어떤 객체가 string으로 할당 가능한 id 속성을 가지고 있다면 그 객체는 Identified 이다.

**이와 관련한 이해를 돕기 위해 값의 집합을 타입이라고 해보자.**

```tsx
interface Person {
  name: string;
}

interface Lifespan {
  birth: Date;
  death?: Date;
}

type PersonSpan = Person & Lifespan;

const ps: PersonSpan = {
  name: "Alan Turing",
  birth: new Date("1912/09/03")
};

console.log(ps);
```

& 이 Intersection 을 계산하기 때문에 PersonSpan이 never 타입으로 예상하기 쉽다. 그러나 타입 연산자는 인터페이스 속성이 아닌, 값의 집합에 적용된다.

Lifespan은 { name: "Alan Turing", birth: new Date("1912/09/03") }; 을 가질 수 있고, Person 도 해당 객체를 타입으로 가질 수 있다. 따라서 이는 정상이다.



그러나 이는 Interface의 유니온에서는 그렇지 않다.

```tsx
type PersonSpan = keyof (Person & Lifespan); // => name | birth | death
type PersonSpan = keyof (Person | Lifespan); // => never
```

이는 다음과 같은 등식으로 풀어쓸 수 있다.

```tsx
keyof (Person & Lifespan) = keyof Person | keyof Lifespan; 
keyof (Person | Lifespan) = keyof Person & keyof Lifespan; 
```



위의 PersonSpan을 좀 더 일반적으로 선언하는 방법은 extends를 사용하는 것이다.

```tsx
interface Person{
  name: string;
}

interface PersonSpan extends Person {
  birth: Date;
	death?: Date;
}
```

타입이 집합이라면, **extends 는 ~의 부분집합이라는 의미로 받아들일 수 있다.**

이는 제너릭 타입의 한정자로도 쓰인다.

```tsx
function getKey<K extends string>(val: any, key: K){ }
```

즉, K는 string을 상속하는 부분 집합이라는 관점에서 생각하면 이해하기가 쉽다.



> ***타입이 값의 집합이라는 건, 동일한 값의 집합을 가지는 두 타입은 같다는 의미이다.***
>
> ***두 타입이 의미가 다르고, 우연히 같은 범위를 가진다 하더라도, 같은 타입을 두 번 정의할 이유는 없다.***



한편, 타입 스크립트 타입이 되지 못하는 값의 집합이 있다는 것은 기억해야 한다.

정수에 대한 타입은 타입스크립트 타입에 존재하지 않는다. Exclude를 사용해 타입 제외를 할 수 있으나, 적절한 타입스크립트 타입이어야 한다.

```tsx
type NonZeroNums = Exclude<number, 0>;
const test: NonZeroNums = 0;
console.log(test); // OK
```





## 아이템 8. 타입 공간과 값 공간의 심벌 구분하기



Typesript의 Symbol은 타입, 값 둘 중 하나의 곳에 존재한다. 이름이 같더라도, 속하는 공간에 따라 다른 것을 나타낼 수 있기 때문에 혼란스러울 수 있다.



다음 코드를 보자.

```tsx
interface Cylinder {
  radius: number;
  height: number;
}

const Cylinder = (radius: number, height: number) => ({ radius, height });

function calculateVolumn(shape: unknown) {
  if (shape instanceof Cylinder) {
    console.log(shape.radius); // => 에러!!
  }
}
```

interface Cylinder는 타입으로 쓰이고, const Cylinder는 값으로 쓰인다. 두 Cylinder는 서로 아무런 관련이 없다.

이 때문에, 아래의 calculateVolumn 에서 instanceOf를 쓰면, instanceOf는 JS 런타임 연산자이므로 const Cylinder를 참조하게 된다.



class, enum은 상황에 따라 타입, 값 두 가지 모두 가능한 예약어이다. 따라서, 해당 값은 instanceOf를 사용할 수 있다.

```tsx
class Cylinder {
  radius = 1;
  height = 2;
}

// const Cylinder = (radius: number, height: number) => ({ radius, height });

function calculateVolumn(shape: unknown) {
  if (shape instanceof Cylinder) {
    console.log(shape);
    console.log(shape.radius);
  } else {
    console.log("no");
  }
}

calculateVolumn(new Cylinder());
```

>  ***클래스는 타입으로 쓰일 때는 속성, 메소드가 사용되는 반면, 값으로 쓰일 때는 생성자가 사용된다.***



또, 연산자 중에서도 타입, 값으로 쓰일 때 다른 기능을 하는 것들이 있다.

```tsx
type T1 = typeof p;		//	타입은 Person
const v1 = typeof p; 	// 값은 "object"
```

> ***타입의 관점에서는, typeof는 값을 읽어서 타입 스크립트 타입을 반환하지만, 값의 관점에서는 런타임의 typeof 연산자가 된다. 즉, 값의 관점에서는 JS 6개의 원시 타입만이 존재한다.***



**class 키워드는 값, 타입 두 가지 모두 사용되기 때문에, 클래스에 대한 typeof는 상황에 따라 약간 다르게 동작한다.**

```tsx
const v = typeof Cylinder; // 값은 function
type T = typeof Cylinder; // 타입이 typeof Cylinder
type C = InstanceType<typeof Cylinder>; //  타입이 Cylinder
```

두번째  줄의 타입은 typeof Cylinder 타입이다. 즉, Cylinder의 인스턴스 타입이 아니다. 이는 생성자 함수이다.

따라서 인스턴스 타입을 원한다면, InstanceType 제너릭을 사용해 전환해주어야 한다.



**또, 속성 접근자도 타입으로 쓰일 때 약간 다르게 받아들여질 수 있다.**

```tsx
class Cylinder {
  radius = 1;
  height = 2;
}

const first: Cylinder["radius"] = v.radius;
const second: Cylinder.radius = v.radius;	// 에러!
```

다음과 같이, Cylinder가 : 뒤에 올때는 타입으로 인식되게 되고, 이를 접근하기 위해선 첫번째 방식으로 접근해야 한다. 두번째 방식은 값으로 조회하기 때문이다.



### 정리하자면, 타입스크립트 코드를 읽을 경우에 타입인지, 값인지 구분하는 방법을 터득해야 한다는 점이다.

* 모든 값은 타입을 가지지만, 타입은 값을 가지지 않는다. type, interface는 타입 공간에만 존재하고, 컴파일시 사라진다.

* **class, enum은 타입, 값 두가지로 사용될 수 있다.**

* "foo"는 문자열 리터럴일 수도 있고, 문자열 리터럴 타입일 수도 있다.

  * ```tsx
    type Test = "foo" // 문자열 리터럴 타입
    const Test2: Test = "foo" // 문자열
    ```

* typeof, this 그리고 많은 키워드들은 타입, 값 공간에서 다른 목적으로 사용될 수 있다.





## 아이템 9. 타입 단언보다는 타입 선언을 사용하기

타입스크립트에서 변수에 값을 할당하고 타입을 부여하는 방법은 두 가지이다.

```tsx
interface Person {
  name: string;
}

const alice: Person = { name: "alice" };
const bob = { name: "bob" } as Person;
```

이 두개는 결과가 같아보이지만 그렇지 않다.

첫 번째 alice는 '타입 선언' 이며, 두 번째 as Person은 '타입 단언' 이다. 이는 타입스크립트가 추론한 타입을 Person 타입으로 간주하게 된다.



타입 단언보다는 타입 선언이 나은데, 이는 이유가 다음과 같다.

* 타입 선언은 할당되는 값이 interface를 만족하는지 검사하고, 이에 따른 에러를 보여준다.
* 타입 단언은 강제 타입이니, 타입 체커에게 오류를 무시하라고 하는 것이다.



타입 단언이 꼭 필요한 경우가 아니라면, 안전성 체크를 위해 타입 선언을 사용하는 것이 좋다.



### 화살표 함수의 타입 선언

화살표 함수에서 추론된 타입이 모호할 경우가 있다. 다음 코드에서 Person interface를 사용하고 싶다 가정하자.

```tsx
const people = ["alice", "bob", "jan"];

const person = people.map((name) => ({ name }));
```

위 같은 경우,  타입 추론이 다음과 같이 되고 이를 Person으로 바꾸려면 어떻게 해야할지 고민된다.

<img src="/Users/jonghopark/Library/Application Support/typora-user-images/스크린샷 2021-11-05 오전 9.43.00.png" alt="스크린샷 2021-11-05 오전 9.43.00" style="zoom:50%;" />



첫번째 방법은 단언이다.

```tsx
const person2 = people.map((name) => ({ name } as Person));
```

이 방법은 런타임에 문제가 발생하게 된다. 다음 경우에 에러가 발생하지 않기 때문이다.

```tsx
const person2 = people.map((name) => ({ name } as Person));
```



두번째 방법은 화살표 함수 내에 타입과 함께 변수 선언을하는 것이다.

```tsx
const person3 = people.map((name) => {
  const person: Person = { name };
  return person;
});
```



그러나 이 방법은 지저분해보인다. 좀더 간결하게 표현해보자.

```tsx
const person4 = people.map((name): Person => ({ name }));
```



위 코드에서, 소괄호 () 는 중요한데 다음 두 가지 문장을 비교해보자.

```tsx
const person4 = people.map((name): Person => ({ name }));
const person4 = people.map((name : Person) => ({ name }));
```

첫번째 문장은 name의 타입이 없고, 반환 타입이 Person 이라고 명시한다.

그러나, (name: Person)은 name이 Person 임을 명시하지만 반환 타입이 없기 때문에 에러가 발생한다.



### 타입 단언이 필요한 경우

타입 단언은 타입 체커가 추론한 타입보다 우리가 판단하는 타입이 정확할 때 의미가 있다.

```tsx
document.querySelector("#button").addEventListener("click", (e) => {
  e.currentTarget;
  const button = e.currentTarget as HTMLButtonElement;
  button;
});
```



위의 경우, typescript는 DOM에 접근할 수 없으므로 #button이 버튼 엘리먼트인줄 모른다. 그리고 currentTarget이 해당 버튼인지도 모른다. 이 경우, TS가 알지 못하는 정보를 가지고 있으므로 타입 단언문을 쓰는것이 좋다.



### !을 사용해서 단언하기

```tsx
const target1 = e.currentTarget;
const target2 = e.currentTarget!;
```

변수의 접두사 !는 boolean의 부정문이지만, 접미사 !는 그 값이 null 이 아니라는 단언문으로 해석된다.

단언문은 컴파일 과정에서 제거되므로, 해당 값이 null이 아님을 확신할 때 사용해야 한다. 아닌 경우, 조건문을 사용해 null을 체크해야 한다.



### 타입 단언의 조건

타입 단언문도 항상 사용할 수 있는 것은 아니다. A가 B의 부분집합일 경우엔 타입 단언을 사용해 변환할 수 있지만, 그렇지 않을 경우 변환이 불가능하다.

![스크린샷 2021-11-05 오전 10.01.35](/Users/jonghopark/Library/Application Support/typora-user-images/스크린샷 2021-11-05 오전 10.01.35.png)



이 경우 unknown 을 사용해 먼저 단언을 하고, 변환을 해줘야 한다. 이는 타입 변환을 가능하게 하지만, 위험한 동작을 하고 있다고 생각할 수 있다.

```tsx
const test = (1 as unknown) as string;
```





## 아이템 10. 객체 래퍼 타입 피하기



### Object Wrapper Type



자바스크립트 primitive type은 immutable 이며, method를 가지지 않는 다는 점에서 객체랑 구분된다.

그러나, string의 경우 메서드를 가지는 것처럼 보인다.

```tsx
'primitive'.chatAt(3)
```



그러나 사실 charAt은 string의 메서드가 아니다. string을 사용할 때, 기본형에는 메서드가 없지만 JS안에는 String '객체' 타입이 정의되어 있다. JS는 기본형, 객체 타입을 서로 자유롭게 변환한다.

**string 기본형에 charAt을 사용하게 되면, JS는 기본형을 String 객체로 warpping하고, 메소드를 호출하고, 래핑한 객체를 버리게 된다.**



한번 prototype 내의 메소드를 관찰해보자.

```tsx
String.prototype.charAt = function (pos) {
  console.log(this, typeof this, pos);
  return originalCharAt.call(this, pos);
};
console.log("primitive".charAt(3));
```



**이는 다음과 같이 호출한다. String {'primitive'} 'object' 3**

method 내의 this는 string 기본형이 아닌 String Object Wrapper 이다.



그러나 string 기본형, String 객체 Wrapper가 동일하게 동작하진 않는다.

```tsx
console.log("Hello" === new String('Hello')); // Fase
console.log(new String('Hello') === new String('Hello')); // False
```



객체 wrapper 타입 자동 변환은 이상하게 동작할때가 종종 있는데, 예를 들어 속성을 기본형에 할당하면 속성이 사라지게 된다.

![스크린샷 2021-11-05 오전 10.19.27](/Users/jonghopark/Library/Application Support/typora-user-images/스크린샷 2021-11-05 오전 10.19.27.png)

이는 x가 String으로 변환된 후 language 속성이 추가되었지만, language 속성이 추가된 객체는 버려지게 되는 것이다.



다른 기본형도 객체 wrapper 타입이 존재한다. number => Number, boolean => Boolean, symbol => Symbol, bigin => BigInt가 존재한다. (null, undefined는 없다.)



### Typescript의 객체 Wrapper 타입

타입 스크립트는 기본형, 객체 레퍼 타입을 별도로 모델링한다. 특히, string을 String이라고 잘못 타이핑하면 안된다. 이는 잘 동작하는 것처럼 보이기 때문이다.

```tsx
const getStringLength = (foo: String) => {
  return foo.length;
};
console.log(getStringLength("teet"));
```



그러나, string을 매개변수로 받는 메서드에 String을 넣으면 문제가 생긴다.

```tsx
const getStringLength = (foo: String) => {
  const test = ["a", "b", "c"];
  if (test.includes(foo)) return;
  			// Argument of type 'String' is not assignable to parameter of type 'string'.
  			//'string' is a primitive, but 'String' is a wrapper object. Prefer using 'string' 					// when possible.
  return foo.length;
};
```

string은 String에 할당할 수 있으나, String은 string에 할당할 수 없다.



wrapper 객체는 다음과 같이 사용할 수도 있긴하다.

```tsx
const s : String = 'primitive';
```

s는 런타임 값은 string 이지만, 객체 래퍼에 할당할 수 있으므로 이를 허용한다. 그러나 이는 오해하기도 쉽고, 굳이 그렇게 할 필요도 없으므로 기본 타입을 쓰는것이 좋다.



여담으로, 이는 괜찮다.

```tsx
console.log(typeof Symbol("sym"));	//	symbol
console.log(typeof String("test"));	//	string
console.log(new String("sym"));			//	String
```

new 없이 호출하는 경우엔 기본형을 생성하므로 괜찮다. String, Symbol은 타입이 아닌 값이므로, 결과는 symbol, string이 된다.



## 아이템 11. 잉여 속성 체크의 한계 인지하기



### 구조적 타이핑과 잉여 속성 체크는 별개이다.

타입이 명시된 변수에 객체를 할당할 때, 타입 스크립트는 해당 타입의 속성이 있는지, 그리고 그 외의 속성은 없는지 확인한다.

다음 코드를 보자.

```tsx
interface Room {
  numDoors: number;
  ceilingHeightFt: number;
}

const r: Room = {
  numDoors: 1,
  ceilingHeightFt: 10,
  elephant: "present" // => 에러
};
```

elephant 는 Room interface 에 속하지 않기 때문에, 오류가 발생한다.

그러나 구조적 타이핑 관점에서 생각해보면 Room의 속성을 가지고 있기 때문에 에러가 발생하지 않아야 한다. 실제로 이는 에러가 발생하지 않는다.

```tsx
interface Room {
  numDoors: number;
  ceilingHeightFt: number;
}

const obj = {
  numDoors: 1,
  ceilingHeightFt: 10,
  elephant: "present"
};

const r: Room = obj; // OK!
```

Obj 타입은 `{ numDoors : number; ceilingHeightFt: number; elephant: string;} `으로 추론 되며, obj 타입은 Room 타입의 부분 집합을 포함하기 때문에 타입 체커도 통과한다.

이 두 개의 차이점은, 첫 번째는 구조적 타이핑 시스템에서 발생할 수 있는 오류를 잡을 수 있도록 **잉여 속성 체크** 라는 과정이 수행되었다.

그러나, 잉여 속성 체크 역시 조건에 따라 동작하지 않는다는 한계가 있으며, 할당 가능 검사와 함께 쓰이면 구조적 타이핑이 무엇인지 혼란스러워질 수 있다.



>  ***잉여 속성 체크가 할당 가능 검사와는 별도의 과정이라는 것을 알아야 한다.***



타입스크립트는 단순히 런타임에 예외를 던지는 코드에 오류르 표시하는것 뿐만 아니라, 의도와 다르게 작성된 코드까지 찾으려 한다.

```tsx
interface Options {
  title: string;
  darkMode?: boolean;
}

function createWindow(options: Options) {
  if (options.darkMode) {
    console.log("dark!!!");
  }
}

createWindow({
  title: "testtest",
  darkmode: true // 에러!! darkMode를 쓰려고 했나요?
});
```

이 코드는 런타임에 어떤 종류의 오류도 발생시키지 않는다. 그러나, 타입 스크립트의 오류 메시지처럼 darkmode를 썼기 때문에 의도한 대로 동작하지 않을 것이다.

Options 타입은 범위가 넓으므로, 순수 구조적 타입 체커는 이런 오류를 찾아내지 못한다. 

string 타입의 title 속성을 가지면, 모든 객체는 Options 타입에 속하게 된다.

```tsx
const o1: Options = document;
const o2: Options = new HTMLAnchorElement();
```

놀랍게도 이 두 문장은 true인데, 이는 모두 string 타입인 title 속성을 가지기 때문이다.



### 객체 리터럴과 잉여 속성 체크

잉여 속성 체크는 타입 시스템의 구조적 본질을 해치지 않으면서도, 객체 리터럴에 알 수 없는 속성을 허용하지 않으면서 앞선 예제들 같은 문제점을 방지할 수 있다. 

document, new HTMLAnchorElement는 객체 리터럴이 아니기 때문에 잉여 속성 체크가 되진 않지만, 다음 문장들은 체크가 된다.

```tsx
const o: Options = { darkmode : true, title: 'Ski Free'}; // 에러!!

const intermediate = { darkmode : true, title: 'Ski Free'}; // OK
const o: Options = intermediate;
```

 첫 번째 줄은 객체 리터럴이지만, 두 번째 줄은 그렇지 않다. 따라서 잉여 속성 체크가 적용되지 않는다.



잉여 속성 체크는 타입 단언문을 사용해도 적용되지 않는다.

```tsx
const o: Options = { darkmode: true, title: "Ski Free" } as Options;
```

이 예제는 단언문보다 선언문을 사용해야 하는 단적인 이유중 하나이다.



### 잉여 속성 체크를 원치 않는다면...

인덱스 시그니처를 사용해 타입스크립트가 추가적인 속성을 예상하도록 할 수 있다.

```tsx
interface Options {
  // title: string;
  darkMode?: boolean;
  [otherOptions: string]: unknown;
}

const o: Options = { darkmode: true, title: "Ski Free" }; // OK
```



### 공통 속성 체커

이외에, 선택적 속성만 가지는 weak 타입에도 비슷하게 동작한다.

```tsx
interface Options {
  // title: string;
  logscale?: boolean;
  invertedYAxios?: boolean;
  areaChart?: boolean;
}

const opts = { logScale: true }; 
const o: Options = opts; // 에러!! Options와 공통되는 속성이 없어요
```

구조적 타이핑 관점에서, Options는 모든 객체를 포함할 수 있다.

이런 weak 타입에 대해서 타입스크립트는 값, 선언 타입에 공통 속성이 있는지 확인하는 별도의 체크를 수행한다.

공통 속성 체크는 잉여 속성체크와 마찬가지로 오타를 잡는 데 효과적이며, 구조적으로 엄격하지 않다.

그러나, 약한 타입과 관련된 할당문마다 수행된다. 객체 리터럴과 상관없이 모두 동작한다.



### 정리

잉여 속성 체크는 구조적 타이핑 시스템에서 허용되는 속성 이름 오타 같은 실수를 잡는데 효과적이다.

그러나, 이는 적용 범위가 매우 제한적이며 (객체 리터럴을 변수에 할당할 때, 함수에 매개변수로 전달할 때), 오직 객체 리터럴에만 적용된다.



## 아이템 12. 함수 표현식에 타입 적용하기



### statement와 expression



JS에서는 함수 statement와 expression을 다르게 인식한다.

```tsx
function test1(): number {}; 					// 	statement
const test2 = function (): number {};	//	expression
const test3 = (): number => {};				//	expression
```



타입스크립트에서는 expression을 사용하는 것이 좋은데, 이는 매개변수부터 반환값까지 전체를 함수 타입으로 선언하여 표현식에 재사용할 수 있기 때문이다.

```tsx
type testFn = () => number;
const test3: testFn = () => 1;
```



### 함수 타입 선언의 장점

**불필요한 코드 반복을 줄인다.**

```tsx
function add(a: number, b: number) {
  return a + b;
}
function sub(a: number, b: number) {
  return a - b;
}

function mul(a: number, b: number) {
  return a * b;
}

function div(a: number, b: number) {
  return a / b;
}
```

위 함수를 다음과 같이 작성할 수 있다.

```tsx
type BinaryFn = (a: number, b: number) => number;
const add: BinaryFn = (a, b) => a + b;
const sub: BinaryFn = (a, b) => a - b;
const mul: BinaryFn = (a, b) => a * b;
const div: BinaryFn = (a, b) => a / b;
```

이는 함수 구현부가 분리되어 있어 로직이 더 명확해진다. 만약, 라이브러리를 직접 만들고 있다면 공통 콜백함수를 위한 타입 선언을 제공하는 것이 좋다.



### 시그니처가 일치하는 다른 함수

시그니처가 일치하는 다른 함수가 있을 경우, 표현식에 타입을 적용해볼만 하다.

lib.dom.d.ts에 fetch 타입 선언은 다음과 같다.

```tsx
fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
```



fetch를 체크하는 함수는 다음과 같이 작성할 수 있다.

```tsx
async function checkedFetch(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error("Request Failed");
  }
  return response;
}
```



위도 물론 잘 동작하지만, 다음과 같이 간결하게 작성할 수도 있다.

```tsx
const checkedFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error("Request Failed");
  }
  return response;
};
```

typeof fn을 이용해 다른 함수의 시그니처를 참조해 함수 전체에 타입을 적용했다. 이는 타입스크립트가 input, init 타입을 추론할 수 있게 해준다. 또한 checkedFetch 반환 타입을 보장한다. 



함수 매개변수에 타입 선언을 하는 것보다, 함수 표현식 전체 타입을 정의하는 것이 코드도 간결하고 안전하다. 즉, 동일한 타입 시그니처를 가진 여러 개의 함수를 작성할 때는 함수 전체의 타입 선언을 적용해야 한다.



## 아이템 13. 타입과 인터페이스의 차이점 알기

타입 스크립트에서 named type을 정의하는 방법은 두 가지가 있다. type alias, interface이다.

type, interface 사이에 존재하는 차이를 분명하게 알고, 같은 상황에서는 named type을 정의해 일관성을 유지해야 한다.



> ***여담으로, 인터페이스 접두사로 I를 붙이는 것은 C#에서 비롯된 관례이다. 이는 현재는 지양해야 할 스타일로 여겨지며, 표준 라이브러리에도 일관성있게 도입되지 않았으므로 유용하지도 않다.***



### 비슷한 점

인덱스 시그니처는 인터페이스, 타입에서 모두 사용할 수 있다.

```tsx
type TDict = { [key: string]: string };
interface IDict {
  [key: string]: string;
}
```



함수 타입도 인터페이스, 타입으로 정의할 수 있다.

```tsx
type TFn = (x: number) => string;
interface IFn {
  (x: number): string;
}
```



모두 제너릭이 가능하다.

```tsx
type TPair<T> = {
  first: T;
  second: T;
};

interface IPair<T> {
  first: T;
  second: T;
}
```



인터페이스는 타입을 확장할 수 있으며, 타입은 인터페이스를 확장할 수 있다.

```tsx
interface IStateWithPop extends TState {
  population: number;
}

type TStateWithPop = IState & { population: number };
```

주의할 점은 인터페이스는 Union 타입 같은 복잡한 타입은 확장하지 못한다. 이를 원하면 type, &를 사용해야 한다.



Class 구현할 때도 모두 사용할 수 있다.

```tsx
class StateT implements TState {
  name: string = "";
  capital: string = "";
}

class StateI implements IState {
  name: string = "";
  capital: string = "";
}
```



### 다른 점

유니온 타입은 있지만, 유니온 인터페이스라는 개념은 없다.

```tsx
type AorB = 'a' | 'b';
```



인터페이스는 타입을 확장할 수 있지만, 유니온은 할 수 없다. 

유니온 타입을 확장하려면 다음과 같이 해야 한다.

```tsx
type Input = number;
type Output = string;
interface VariableMap {
  [name:string]: Input | Output;
}
```



또는 유니온 타입에 name 속성을 붙인 타입을 만들수도 있다.

```tsx
type NamedVariable = (Input | Output) & { name: string };
```

이 타입은 인터페이스로 표현할 수 없다.



튜플, 배열 타입도 type 키워드로 더 간결하게 표현할 수 있다.

```tsx
type Pair = [number, number];
type StringList = string[];
type NamedNums = [string, ...number[]];

const test: NamedNums = ["test", 1];
```



interface도 비슷하게 구현할 수는 있으나, tuple에서 사용할 수 있는 메서드를 사용하지 못하게 된다. 그러므로 튜플은 type 키워드를 사용하는 것이 좋다.



반면, interface에는 augment(보강)이 가능하다.

```tsx
interface IState {
  name: string;
  capital: string;
}

interface IState {
  population: number;
}
```



위와 같이 속성을 확장하는 것을 declaration merging (선언 병합) 이라고 한다. 이는 주로 타입 선언 파일에서 사용된다.

따라서 타입 선언 파일을 작성할 때는 선언 병합 지원을 위해 반드시 인터페이스를 사용해야 하며, 표준을 따라야 한다. 



### 타입스크립트 표준 라이브러리 타입 병합

타입 스크립트에서는 표준 라이브러리에서 여러 타입을 모아 병합한다.

예를 들어, Array 인터페이스는 lib.es5.d.ts에 정의되어있고, 기본적으로는 여기서 선언된 인터페이스가 사용된다.

그러나, tsconfig.json의 lib 에 ES2015를 추가하면 TS는 lib.es2015.d.ts에 선언된 인터페이스를 병합한다.

여기엔 ES2015에 추가된 또 다른 Array 선언의 find 같은 메서드가 포함된다.

결론적으로 각 선언이 병합되어 전체 메서드를 가지는 하나의 Array 타입을 얻게 된다.

때문에 type alias는 기존 타입에 추가적인 보강이 없는 경우에만 사용해야 한다.



### 정리

정리하자면, 복잡한 타입이라면 고민할 것도 없이 type alias를 사용하면 된다.

그러나, 두 가지 방법으로 모두 표현할 수 있는 간단한 객체 타입일 경우, 일관성와 보강의 관점에서 고려해봐야 한다.

일관되게 interface를 사용하고 있는 코드 베이스일 경우 interface, 아닌 경우 type을 사용하면 된다.

아직 스타일이 확립되지 않았다면, 향후 보강의 가능성을 생각해봐야 한다.

어떤 API에 대한 타입 선언을 작성해야 한다면, 인터페이스를 사용하는 것이 좋다. API 가 변경될 때 인터페이스를 통해 새로운 필드를 병합할 수 있기 때문이다.

그러나, 프로젝트 내부적으로 사용되는 타입에 선언 병합이 사용되는 것은 잘못된 설계이다. 따라서, 이럴 때는 type alias를 사용해야 한다.



## 아이템 14. 타입 연산과 제너릭 사용으로 반복 줄이기

DRY(don't repeat yourself) 원칙은 소프트웨어 개발자라면 누구나 들어봤을 만한 원칙이다. 

그러나 타입에 대해선, 다들 이를 간과했을 가능성이 있다. 타입 간에 매핑을 하는 방법을 익히면, 타입 정의에서도 DRY의 장점을 활용할 수 있다.

반복을 줄이는 방법은 다양하다.

* 객체 리터럴을 타입 선언하여 중복 분리하기

* 함수 시그니처를 분리하기

* 다른 인터페이스를 확장하기 (Type Alias의 경우, 인터렉션 연산자를 쓰기)

  

### Utility Types - Pick

전체 애플리케이션의 상태를 표현하는 State, 부분을 표현하는 TopNavState가 있다고 생각해보자.

```tsx
interface State {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
  pageContents: string;
}

interface TopNavState {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
}
```

이런 상황에서는, TopNavState를 확장하기보단 State의 부분집합으로 NavState를 정의하는 것이 나아보인다.

다음과 같이 State를 인덱싱해서 중복을 제거할 수 있다.

```tsx
interface TopNavState {
  userId: State["userId"];
  pageTitle: State["pageTitle"];
  recentFiles: State["recentFiles"];
}
```

이 또한 반복된 코드가 존재한다. 'mapped type'을 사용하면 좀 더 나아진다.

```tsx
type TopNavState = {
  [k in "userId" | "pageTitle" | "recentFiles"]: State[k];
};
```

Mapped Type은 배열의 필드를 순회하는 것과 같은 방식이다.



이 패턴은 흔히 쓰이기 때문에 Pick 이라는 유틸 타입으로 따로 선언되어있다.

```tsx
type TopNavState = Pick<State, "userId" | "pageTitle" | "recentFiles">;
```

Pick은 제너릭 타입이다. 

`type Pick<T, K> = { [k in K] : T[k] };` 

마치 함수가, 두 개의 매개변수 값을 받아 결과를 반환하는 것 처럼, Pick은 T, K 두가지 타입을 받아 결과를 반환한다.



Tagged Union의 경우를 생각해보자.

```tsx
interface SaveAction {
  type: "save";
  name: "save-action";
}

interface LoadAction {
  type: "load";
  name: "load-action";
}

type Action = SaveAction | LoadAction;
type ActionType = "save" | "load";	//	중복!!
```

위의 ActionType은 Action 유니온을 인덱싱하면 된다.

```tsx
type ActionType = Action["type"]; // 'save' | 'load';
```

이는 Pick으로부터 선언되는 타입이랑은 좀 다르다

```tsx
type ActionRec = Pick<Action, "type">; // {type : 'save' | 'load'};
```





### Utility Types - Partial

다음과 같은 클래스를 생각해보자. 

해당 클래스는 생성되고, 추후에 update 메서드를 통해 멤버 변수가 업데이트 될 수 있다.

이와 같은 경우, update 메서드는 생성자와 동일한 매개변수이지만, 대부분의 타입이 선택적 필드가 된다.



```tsx
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

class UIWidget {
  width;
  height;
  color;
  label;
  constructor(init: Options) {
    this.width = init.width;
    this.height = init.height;
    this.color = init.color;
    this.label = init.label;
  }
  update(options: OptionsUpdate) {
    if (options.color) {
      this.color = options.color;
    }
  }
}
```



이 경우, mapped type과 keyof를 사용하면 OptionsUpdate 중복을 제거할 수 있다.

```tsx
type OptionsUpdate = { [k in keyof Options]?: Options[k] };
```



keyof는 타입을 받아 속성 타입의 유니온을 반환한다. 따라서, OptionsUpdate는 이를 순회하며 Option에 인덱싱한다.

이 패턴 또한 일반적이며, Partial이라는 Utility Type으로 포함되어 있다. Partial은 모든 프로퍼티를 optional하게 만든다. 즉, 주어진 타입의 모든 subset이 된다.

```tsx
// type OptionsUpdate = { [k in keyof Options]?: Options[k] };
type OptionsUpdate = Partial<Options>;
```





### typeof

값의 형태에 해당하는 타입을 정의하고 싶을 경우도 있다. 이런 경우, typeof를 쓰면 된다.

```tsx
const INIT_OPTIONS = {
  width: 640,
  height: 480,
  color: "red"
};
type Options = typeof INIT_OPTIONS; => {width:number, height:number, color:string}
```

위의 코드는 JS runtime 연산자 typeof를 사용한 것처럼 보이나, 실제론 typescript 단계에서 연산되며 훨씬 더 정확하게 타입을 표현한다. 그러나 타입 정의를 먼저 하고, 값이 해당 타입에 할당가능하다고 선언하는 것이 좋다. 그래야 타입이 더 명확해지고, 예상하기 어려운 타입 변동을 방지할 수 있다.



### Utility Types - Return Type

함수나 메서드의 반환 값에 타입을 만들고 싶을 수도 있다.

```tsx
function getUserInfo(userId: string){
  return{
    userId,
    name,
    age,
    ...
  }
}
```

이런 경우엔 ReturnType 제너릭이 정확히 들어맞는다.

```tsx
type UserInfo = ReturnType<typeof getUserInfo>;
```

ReturnType은 함수의 '값'이 아닌, '타입'에 적용되었다. 앞서 설명했다싶이, 적용 대상이 값인지 타입인지 아는 것은 매우 중요하고, 구분해서 처리해야 한다.



### extends를 활용한 매개변수 제한시키기

함수에서 매개변수로 매핑할 수 있는 값을 제한하듯이, 제너릭 타입에서도 매개변수를 제한할 수 있는 방법이 필요하다.

이는 extends를 사용해 해결할 수 있다.

```tsx
interface Name {
  first: string;
  last: string;
}

type DancingDuo<T extends Name> = [T, T];

const couple1: DancingDuo<Name> = [
  { first: "Fred", last: "Astaire" },
  { first: "test1", last: "Astaire" }
];

const couple2: DancingDuo<{ first: string }> = [ // => 에러!! 제너릭에 first가 없음!!
  { first: "Fred" },
  { first: "test1" }
];
```



앞서 언급한 Pick을 extends로 이해도를 높일 수 있다.

```tsx
type Pick<T, K> = {
  [k in K]: T[k]
}

type Pick<T, K extends keyof T> = {
  [k in K]: T[k]
}
```

첫 번째 Pick에서, K의 type은 인덱스로 사용할 수 있는 `string | number | symbol` 이 되어야 한다.

그러나, 현재 K는 너무 범위가 너무 넓다. 이를 범위를 좁혀야 한다. 즉, T의 키 부분집합 `keyof T`가 되어야 한다.



## 아이템15. 동적 데이터에 인덱스 시그니처 사용하기



### 인덱스 시그니처

자바스크립트 객체는 문자열 키를 타입의 값에 관계없이 매핑한다. 

타입스크립트에서는 타입에 '인덱스 시그니처'를 명시하여 유연하게 매핑을 표현할 수 있다.

```tsx
type Rocket = { [property: string]: string };
const rocket: Rocket = {
  name: "Falcon 9",
  variant: "v1.0"
};
```



`[property: string]: string`은 다음 세 가지 의미를 담고 있다.

* 키의 이름 (property) : 키의 위치만 표시하는 용도이다. 타입 체커에서는 사용하지 않는다.
* 키의 타입 (string) : string이나 number 또는 symbol의 조합이어야 하지만, 보통은 string을 사용한다.
* 값의 타입 : 어떤 것이든 될 수 있다.



이렇게 타입 체크가 수행될 경우, 네 가지 단점이 드러난다.

* 잘못된 키를 포함한 모든 키를 허용한다. name 대신 Name으로 작성해도 유효하게 된다.
* 특정 키가 필요하지 않다. {}도 유효하다.
* 키마다 다른 타입을 가질 수 없다. 
* IDE에서 얻을 수 있는 장점이 없어진다. name:을 입력하면, 키는 무엇이든 가능하므로 자동 완성 기능이 동작하지 않는다.





### 인덱스 시그니처 대안

즉, 인덱스 시그니처는 부정확하므로 더 나은 방법을 찾아야 한다. 

다음과 같은 상황을 보면, Rocket은 interface여야 한다.

```tsx
interface Rocket {
  name: string;
  variant: string;
  thrust_kN: number;
}

const rocket: Rocket = {
  name: "Falcon 9",
  variant: "v1.0",
  thrust_kN: 15_200
};
```

이제 모든 앞서 말한 단점이 해결된다.



만약 A, B, C, D 같은 키가 있지만 얼마나 많이 있는지 모른다면 선택적 필드 또는 유니온 타입으로 모델링 하면 된다.

```tsx
// 너무 광범위하다.
interface Row1 {
  [column: string]: string;
}
// 최선!
interface Row2 {
  a: number;
  b?: number;
  c?: number;
  d?: number;
}
// 가장 정학하지만 사용하기 번거롭다.
type Rows =
  | { a: number }
  | { a: number; b: number }
  | { a: number; b: number; c: number }
  | { a: number; b: number; c: number; d: number };
```

### 

위와 같이 string 타입이 너무 광범위해 인덱스 시그니처를 사용하는 데 문제가 있다면, 두 가지 대안이 있다.

첫 번째는 Record를 사용하는 방법이다.

```tsx
type Vec3D = Record<"x" | "y" | "z", number>;
```



두 번째는 매핑된 타입을 사용하는 방법이다. 매핑된 타입은 키마다 별도의 타입을 사용하게 해준다.

```tsx
type Vec3D = { [k in "a" | "b" | "c"]: k extends "b" ? string : number };
```



### 정리

즉, 인덱스 시그니처는 동적 데이터를 표현할 때 사용해야 한다. 런타임 까지 객체의 속성을 알 수 없을 경우에만 인덱스 시그니처를 사용해야 한다. 

어떤 타입에 가능한 필드가 제한되어 있는 경우라면 인덱스 시그니처로 모델링 하지 말아야 한다.

가능하다면 인터페이스, Record, mapped type 같은 인덱스 시그니처보다 정확한 타입을 사용하는 것이 좋다.





## 아이템 16. number 인덱스 시그니처보다는 Array, 튜플, ArrayLike를 사용하기



### Javascript의 키는 항상 string 이다!!

JS는 이상하게 동작하기로 유명하다. 예를 들면 `"0" == 0` 같은 것들인데, 문제는 JS 객체 모델에도 이상한 부분이 있다는 점이다.

이 중 일부는 typescript type 시스템으로 모델링 되므로, 객체 모델을 이해하는 것이 중요하다.

JS에서 객체란 키 / 쌍의 모음이며, 키는 보통 문자열 혹은 심벌이다.



파이썬이나 자바에서 볼 수 있는 '해시 가능' 객체라는 표현이 JS에는 없다. JS에서 복잡한 객체를 키로 사용하려고 하면, toString 메서드를 호출해버린다.

```tsx
x = {}
x[[1, 2, 3]] = 2
x // => { '1, 2, 3' : 1}
```

숫자는 키로 사용할 수가 없다. 만약 속성 이름으로 숫자를 사용하려고 하면 JS 런타임은 문자열로 변환한다.

```tsx
{1 : 2,  3: 4}
=> { '1' : 2, '3' : 4 }
```

또, JS에서 배열은 객체이다. 그러므로 숫자 인덱스를 사용하는 것이 당연하지만, 문자열 키를 사용해도 배열 요소에 접근할 수 있다.

```tsx
x= [1, 2, 3];
x[0] === x['0'] // => true!!
```

Object.keys()로 배열의 키를 나열해보면, 키가 문자열로 출력된다.



### Typescript에서의 key 타입

타입스크립트는 이런 혼란을 잡기 위해 숫자 키를 허용하고, 문자열 키와 다른 것으로 인식한다. Array 타입 선언은 다음과 같다.

```tsx
interface Array<T> {
  // ...
  [n: number]: T;
}
```

런타임에서는 문자열 키로 인식하므로 가상의 코드라고 할 수 있지만, 타입 체크 시점에 오류를 잡을 수 있어 유용하다.



이와 별개로, 다음 코드를 보자.

```tsx
const keys = Object.keys(xs);
for (const key in xs){
  key; // string
  const x = xs[key]; // number
}
```

string이 number에 할당될 수 없으므로, 마지막 줄이 동작하는 것이 다소 이해가 가지 않을 수 있다. 단순히 실용적인 허용이라 생각하면 좋다.

인덱스에 신경쓰지 않는다면 for...of, 인덱스 타입이 중요하다면 forEach를 사용하는 것이 좋다. 

> ***Array.prototype.forEach는 number 타입을 제공해준다.***



### 정리

정리하자면, 인덱스 시그니처가 number로 표현되어 있다면 입력한 값이 number 여야 하지만, 실제 런타임에서 사용되는 키는 string 타입이다.

일반적으로 number를 타입의 인덱스 시그니처로 사용하는 경우는 많지 않다. 만약, 숫자를 사용해 인덱스할 항목을 지정한다면 Array나 튜플 타입을 사용하는 것이 좋다.

만약, 어떤 길이를 가지는 배열과 비슷한 형태의 튜플을 사용하고 싶으면 ArrayLike 타입을 사용하면 된다.

ArrayLike는 다음과 같이 생겼다.

```tsx
interface ArrayLike<T> {
    length: number;
    [n: number]: T;
}
```

즉, 길이와 숫자 인덱스 시그니처만 있다. 드물긴 하지만, 필요하다면 ArrayLike를 사용해야 한다. 그러나 키는 여전히 문자열이다.
