/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationIcon } from '@heroicons/react/outline'
import PercentagesGroup, { Percentages } from "./PercentagesGroup";
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { AvailableFarmState } from '../store/farmsSlice';
import { useAllowance, useApprove, useWotStake } from '../utils/contractsUtils';
import { RootState } from '../store/store';
import { formatTokenAmount, secondsToDhms } from "../utils/utils";
import Spinner from './Spinner';
export default function StakingModal({ stakeId, userTokenBalance }: {stakeId: number; userTokenBalance: number; }) {
  const [open, setOpen] = useState(true)

  const [stakeAmount, setStakeAmount] = useState("0");
  const [allowed, setAllowed] = useState(false);
  const [percentageButtonActive, setPercentageButtonActive] =
    useState<number>(0);
    
  const [stakingInProgress, setStakingInProgress] = useState(false);
  const cancelButtonRef = useRef(null)
  const getAllowance = useAllowance();
  const approve = useApprove();
  const stakeWot = useWotStake();
  const dispatch = useAppDispatch();
  const farmGeneralData = useAppSelector((state: RootState) =>
  state.farms.available.find((farm) => farm.id === stakeId)) as AvailableFarmState;
  
  const userFarm = useAppSelector((state: RootState) =>
    state.userInfo.farms.find((farm) => farm.id === stakeId)
  );
   useEffect(() => {
    getAllowance(
      farmGeneralData.tokenAddress,
      farmGeneralData.farmContractAddress
    ).then((res) => {
      setAllowed(res > 0);
    });
  });

  const updateStakeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStakeAmount(event.target.value);
    const stakeAmount = parseFloat(event.target.value);
    setPercentageButtonActive(4 * (stakeAmount / userTokenBalance));
  };

  const percentageButtonClicked = (percentage: Percentages) => {
    switch (percentage) {
      case Percentages["25%"]:
        setStakeAmount((userTokenBalance * 0.25).toFixed(4));
        break;
      case Percentages["50%"]:
        setStakeAmount((userTokenBalance * 0.5).toFixed(4));
        break;
      case Percentages["75%"]:
        setStakeAmount((userTokenBalance * 0.75).toFixed(4));
        break;
      case Percentages["100%"]:
        setStakeAmount(userTokenBalance.toFixed(4));
        break;
    }
  };

  const stake = () => {
    setStakingInProgress(true);
    // TODO: Allow the user to stake fractions of a token
    stakeWot(
      farmGeneralData.farmContractAddress,
      Math.floor(parseFloat(stakeAmount)).toString(),
      farmGeneralData.id
    ).finally(() => {
      setStakingInProgress(false);
    });
  };
  
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setOpen}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
              <label
                    htmlFor="stakingAmount"
                    className="block text-sm font-medium text-gray-700"
                    >
                    Stake {farmGeneralData.tokenSymbol}
                    </label>
                    <input
                    type="text"
                    name="stakingAmount"
                    inputMode="decimal"
                    autoComplete="off"
                    autoCorrect="off"
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    placeholder={farmGeneralData.minimumToStake.toString()}
                    minLength={1}
                    maxLength={79}
                    spellCheck="false"
                    className="focus:outline-none border-1 block w-full rounded-md bg-purple-100 px-2 py-1.5 shadow-sm focus:ring focus:ring-purple-400 disabled:cursor-default disabled:opacity-70 sm:text-sm"
                    value={stakeAmount}
                    onChange={updateStakeAmount}
                    />
                    <PercentagesGroup
                    darkModeClass="text-gray-700"
                    buttonClickCallback={percentageButtonClicked}
                    active={percentageButtonActive}
                    setActive={setPercentageButtonActive}
                    />
                    {!userFarm && (
                    <p className="mt-2 text-sm text-gray-500">
                    You need to stake at least{" "}
                    {formatTokenAmount(farmGeneralData.minimumToStake)}{" "}
                    {farmGeneralData.tokenSymbol}.
                    </p>
                )}
              </div>
              <div className="mt-5 sm:mt-6">
              <button
              disabled={
                !stakeAmount ||
                parseFloat(stakeAmount) === 0 ||
                stakingInProgress ||
                (parseFloat(stakeAmount) < farmGeneralData.minimumToStake &&
                  !userFarm?.totalAmount)
              }
              onClick={stake}
              className="flex h-10 rounded-md bg-purple-400 py-2 px-4 font-bold text-white disabled:cursor-default disabled:opacity-20"
            >
              {stakingInProgress ? (
                <>
                  <Spinner className="h-5 text-white" />
                  Staking...
                </>
              ) : (
                "Stake Now"
              )}
            </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}