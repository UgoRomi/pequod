/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import PercentagesGroup, { Percentages } from "./PercentagesGroup";
import { useAppSelector } from '../store/hooks';
import { AvailableFarmState } from '../store/farmsSlice';
import { useAllowance, useWotStake } from '../utils/contractsUtils';
import { RootState } from '../store/store';
import { formatTokenAmount } from "../utils/utils";
import Spinner from './Spinner';
export default function StakingModal({ stakeId, userTokenBalance }: {stakeId: number; userTokenBalance: number; }) {
  const [open, setOpen] = useState(true)

  const [stakeAmount, setStakeAmount] = useState("0");
  const [, setAllowed] = useState(false);
  const [percentageButtonActive, setPercentageButtonActive] =
    useState<number>(0);
    
  const [stakingInProgress, setStakingInProgress] = useState(false);
  const cancelButtonRef = useRef(null)
  const getAllowance = useAllowance();
  const stakeWot = useWotStake();
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
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
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
            <div className="inline-block align-bottom text-left bg-pequod-gray rounded-40 md:pb-10 md:p-8 md:pt-10 border border-pequod-white-300 overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                
              <label
                    htmlFor="stakingAmount"
                    className="block text-md text-center font-medium text-white mb-4"
                    >
                    Stake {farmGeneralData.tokenSymbol}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
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
                      className="border-pequod-white text-pequod-white focus:ring-pequod-purple h-40 block w-full rounded-10 border bg-transparent px-2 py-1.5 focus:outline-none focus:ring disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
                      value={stakeAmount}
                      onChange={updateStakeAmount}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-white opacity-40">
                      {farmGeneralData.tokenSymbol}
                    </div>
                  </div>
                   
                    <PercentagesGroup
                    darkModeClass="text-gray-700"
                    buttonClickCallback={percentageButtonClicked}
                    active={percentageButtonActive}
                    setActive={setPercentageButtonActive}
                    />
                    {!userFarm && (
                    <p className="mt-2 text-xs text-gray-500">
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
              className="w-full text-center h-40 rounded-md bg-pequod-dark border border-white py-2 px-4 font-bold text-white disabled:cursor-default disabled:opacity-20"
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