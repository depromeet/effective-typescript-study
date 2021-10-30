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



# 아이템 8. 타입 공간과 값 공간의 심벌 구분하기

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





