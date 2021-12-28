import { useEffect, useState } from 'react';
import StakingCard from '../components/StakingCard';
import { useAppSelector } from '../store/hooks';
import { selectUserWotAmount } from '../store/userInfoSlice';
import {
  WOT_STAKING_MIN_AMOUNT_1,
  WOT_STAKING_MIN_AMOUNT_2,
} from '../utils/consts';
import { useAllowance, useApprove, useWotStake } from '../utils/contractsUtils';

export default function StakingPage() {
  const [staking100Allowed, setStaking100Allowed] = useState<boolean>(false);
  const [staking20Allowed, setStaking20Allowed] = useState<boolean>(false);
  const check100StakingAllowance = useAllowance(
    process.env.REACT_APP_WOT_ADDRESS as string,
    process.env.REACT_APP_WOT_STAKING_100_ADDRESS as string
  );
  const check20StakingAllowance = useAllowance(
    process.env.REACT_APP_WOT_ADDRESS as string,
    process.env.REACT_APP_WOT_STAKING_20_ADDRESS as string
  );

  const approve100Staking = useApprove(
    process.env.REACT_APP_WOT_ADDRESS as string,
    process.env.REACT_APP_WOT_STAKING_100_ADDRESS as string
  );

  const approve20Staking = useApprove(
    process.env.REACT_APP_WOT_ADDRESS as string,
    process.env.REACT_APP_WOT_STAKING_20_ADDRESS as string
  );

  const userWotBalance = useAppSelector(selectUserWotAmount);
  const stakeWot = useWotStake();

  // Get the allowance for moby towards the 100% staking contract
  useEffect(() => {
    check100StakingAllowance().then((allowance: number) => {
      setStaking100Allowed(allowance !== 0);
    });
  }, [check100StakingAllowance]);

  // Get the allowance for moby towards the 20% staking contract
  useEffect(() => {
    check20StakingAllowance().then((allowance: number) => {
      setStaking20Allowed(allowance !== 0);
    });
  }, [check20StakingAllowance]);

  return (
    <div className='grid w-full grid-cols-1 gap-3'>
      {userWotBalance > WOT_STAKING_MIN_AMOUNT_1 && (
        <StakingCard
          apy={20}
          tokenSymbol={process.env.REACT_APP_WOT_SYMBOL as string}
          amountEarned={0}
          tokenPriceValue={1}
          amountStaked={0}
          allowed={staking20Allowed}
          approveSpending={approve20Staking}
          stakeTokens={stakeWot}
          stakingContractAddress={
            process.env.REACT_APP_WOT_STAKING_20_ADDRESS as string
          }
        ></StakingCard>
      )}
      {userWotBalance > WOT_STAKING_MIN_AMOUNT_2 && (
        <StakingCard
          apy={100}
          tokenSymbol={process.env.REACT_APP_WOT_SYMBOL as string}
          amountEarned={239479}
          tokenPriceValue={1}
          amountStaked={12353293458}
          allowed={staking100Allowed}
          approveSpending={approve100Staking}
          stakeTokens={stakeWot}
          stakingContractAddress={
            process.env.REACT_APP_WOT_STAKING_100_ADDRESS as string
          }
        ></StakingCard>
      )}
    </div>
  );
}
