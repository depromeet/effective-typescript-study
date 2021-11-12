interface Vector3 {
  x: number;
  y: number;
  z: number;
}

function getComponent(vector: Vector3, axis: "x" | "y" | "z") {
  return vector[axis];
}

let x = "x";
let vec = { x: 10, y: 20, z: 30 };
getComponent(vec, x);

const mixed = ["x", 1];

const v = {
  x: 1,
  y: 2,
} as const;

v.x = 3;
v.x = "3";
v.y = 4;
v.name = "Pythagoras";

const a1 = [1, 2, 3] as const;
