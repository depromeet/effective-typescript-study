// Error
function arraySum(arr: readonly number[]) {
  let sum = 0;
  let num;
  while ((num = arr.pop()) !== undefined) {
    sum += num;
  }
  return sum;
}

// Correct
function arraySum2(arr: readonly number[]) {
  let sum = 0;
  for (const num of arr) {
    sum += num;
  }
  return sum;
}

function printTriangles(n: number) {
  const nums = [];
  for (let i = 0; i < n; i++) {
    nums.push(i);
    console.log(arraySum(nums));
  }
}

printTriangles(5);
