import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { Fragment } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  closeTradeSettingsDialog,
  selectDialogIsOpen,
} from "../store/tradeDialogSlice";

export default function TradeSettingsDialog({
  slippage,
  setSlippage,
}: {
  slippage: number;
  setSlippage: (slippage: number) => void;
}) {
  const isOpen = useAppSelector(selectDialogIsOpen);
  const dispatch = useAppDispatch();

  const closeDialog = () => {
    dispatch(closeTradeSettingsDialog());
  };

  const formatSlippage = (slippage: number) => {
    setSlippage(Math.trunc(slippage * 100) / 100);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={closeDialog}
      >
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-pequod-dark p-6 text-left align-middle shadow-xl transition-all">
              <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                <button
                  type="button"
                  className="focus:outline-none rounded-md bg-pequod-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-pequod-purple focus:ring-offset-2"
                  onClick={closeDialog}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
              >
                Settings
              </Dialog.Title>
              <div className="mt-2">
                <label
                  htmlFor="slippage"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Slippage
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="slippage"
                    id="slippage"
                    min="0"
                    max="49"
                    step="0.01"
                    className="focus:outline-none border-1 block w-full rounded-md bg-purple-100 px-2 py-1.5 shadow-sm focus:ring focus:ring-purple-400 sm:text-sm"
                    aria-describedby="slippage-description"
                    value={slippage}
                    onChange={(e) => formatSlippage(parseFloat(e.target.value))}
                  />
                </div>
                <p
                  className="mt-2 text-sm text-gray-500 dark:text-gray-300"
                  id="slippage-description"
                >
                  Variance you are willing to accept in the outcome of the trade
                </p>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
