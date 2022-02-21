
import unknownTokenLogo from "../images/unknown-token.svg";
const stakings = [
    {
      id: 1,
      name: 'BNB',
      qtyStaked: '21.00',
      stakedOn: '03/01/2021 10:20:10',
      earnings: '+ 0.06 / 2.93%',
      isNegative: false,
      image: unknownTokenLogo
    },
    {
      id: 2,
      name: 'MOBY DICK TOKEN',
      qtyStaked: '21000298000',
      stakedOn: '03/01/2021 10:20:10',
      earnings: '+ 1,000 / 4.23%',
      isNegative: false,
      image: unknownTokenLogo
    },
    {
      id: 3,
      name: 'ETH',
      qtyStaked: '2.00',
      stakedOn: '03/01/2021 10:20:10',
      earnings: '- 210 / 1.12%',
      isNegative: true,
      image: unknownTokenLogo
    },
  ]
  export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }
  
  export default function StakingTable() {
    return (
      <div className="flex flex-col mx-4">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Asset
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Q.ty staked
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Staked on
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Earnings
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className=" divide-y divide-gray-200">
                  {stakings.map((stake) => (
                    <tr key={stake.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src={stake.image} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{stake.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{stake.qtyStaked}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{stake.stakedOn}</div>
                      </td>
                      <td className={
                        classNames(
                          stake.isNegative
                            ? "text-red-500"
                            : "text-green-500",
                            "px-6 py-4 whitespace-nowrap text-sm"
                        )
                      }>{stake.earnings}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <a href="#" className="text-white border py-2 px-4 rounded-md mr-4">
                          Add funds
                        </a>
                        <a href="#" className="text-white border py-2 px-4 rounded-md">
                          Unstake
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }