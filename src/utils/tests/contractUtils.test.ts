import * as React from 'react';
import { useWeb3React } from '@web3-react/core';
import { useSwap } from '../contractsUtils';
import Web3 from 'web3';
import { renderHook, act } from '@testing-library/react-hooks';

test('Allows you to buy and sell', () => {
  const { result } = renderHook(() => useSwap());
});
