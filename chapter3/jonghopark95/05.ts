declare let hasDates: boolean;

const nameTitle = { name: "Khufu", title: "Pharaoh" };

const addOptional = <T extends object, U extends object>(
  a: T,
  b: U | null
): T & Partial<U> => {
  return { ...a, ...b };
};

const pharaoh = addOptional(
  nameTitle,
  hasDates ? { start: -2589, end: -2566 } : null
);

console.log(pharaoh.start);

// const pharaoh = {
//   ...nameTitle,
//   ...(hasDates ? { start: -2589, end: -2566 } : {})
// };
// console.log(pharaoh.start);
