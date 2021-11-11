interface Outer {
  inner: {
    x: number;
  };
}

const o: Readonly<Outer> = { inner: { x: 0 } };
o.inner = { x: 1 };
o.inner.x = 3;
