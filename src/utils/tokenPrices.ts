export const calculateTokenPrices = (pairs: any[], tokenPrices: {}) => {
  let updated = false;

  pairs.forEach(pair => {
    const { token1, token2, reserved1, reserved2 } = pair;
    const reserve1 = parseFloat(reserved1);
    const reserve2 = parseFloat(reserved2);

    if (
      tokenPrices[token1] !== undefined &&
      tokenPrices[token2] === undefined
    ) {
      tokenPrices[token2] = (reserve1 / reserve2) * tokenPrices[token1];
      updated = true;
    } else if (
      tokenPrices[token2] !== undefined &&
      tokenPrices[token1] === undefined
    ) {
      tokenPrices[token1] = (reserve2 / reserve1) * tokenPrices[token2];
      updated = true;
    }
  });

  if (updated) {
    calculateTokenPrices(pairs, tokenPrices);
  } else {
    pairs.forEach(pair => {
      const { token1, token2 } = pair;
      if (tokenPrices[token1] === undefined) {
        tokenPrices[token1] = 0;
      }
      if (tokenPrices[token2] === undefined) {
        tokenPrices[token2] = 0;
      }
    });
  }
};
