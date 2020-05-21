const sum = (a, b) => {
  if (a && b) {
    return a + b;
  }
  throw new Error('Invalid args!')
}

try {
  console.log(sum(1));
} catch (e) {
  console.log('Error occurred ', e);
}

