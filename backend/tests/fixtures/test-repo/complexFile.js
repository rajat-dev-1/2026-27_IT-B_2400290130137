// Deliberately complex function to trigger high_complexity finding (threshold > 10)
export function veryComplexFunction(a, b, c, d, e) {
  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        if (d > 0) {
          if (e > 0) {
            console.log("All positive");
            switch(a) {
              case 1: console.log(1); break;
              case 2: console.log(2); break;
              case 3: console.log(3); break;
              default:
                for(let i = 0; i < 10; i++) {
                  if (i % 2 === 0) {
                    while (i > 0) {
                      i--;
                    }
                  } else {
                    console.log(i);
                  }
                }
            }
          } else {
            return b > c ? 'bc' : 'cb';
          }
        } else {
          return d || e ? 'de' : null;
        }
      } else {
        return c && b ? 'cb' : null;
      }
    }
  }
}

export function simpleHelper(x) {
  return x * 2;
}
