import unknownTokenLogo from '../images/unknown-token.svg';
import { sub } from 'date-fns';
import { FarmState } from '../store/userInfoSlice';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function StakingTable({
  farms,
  toggleModal,
  setStakeId,
}: {
  farms: FarmState[];
  toggleModal: React.Dispatch<React.SetStateAction<boolean>>;
  setStakeId: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="mx-4 flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
                  >
                    Asset
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
                  >
                    Q.ty staked
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
                  >
                    Staked on
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
                  >
                    Earnings
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className=" divide-y divide-gray-200">
                {farms.map((farm) => (
                  <tr key={farm.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={farm.imageUrl || unknownTokenLogo}
                            alt="farm token"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {farm.tokenSymbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-white">
                        {farm.totalAmount}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-white">
                        {sub(new Date(), {
                          seconds: farm.secondsInStaking,
                        }).toLocaleString()}
                      </div>
                    </td>
                    <td
                      className={classNames(
                        farm.totalEarningInUsdt < 0
                          ? 'text-red-500'
                          : 'text-green-500',
                        'whitespace-nowrap px-6 py-4 text-sm'
                      )}
                    >
                      {farm.totalEarningInUsdt}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium">
                      <button
                        onClick={() => {
                          setStakeId(farm.id);
                          toggleModal(true);
                        }}
                        className="mr-4 rounded-md border py-2 px-4 text-white"
                      >
                        Add funds
                      </button>
                      <button
                        disabled={farm.unStakingTimeInSeconds > 0}
                        className="rounded-md border py-2 px-4 text-white disabled:cursor-default disabled:opacity-70"
                      >
                        Unstake
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
