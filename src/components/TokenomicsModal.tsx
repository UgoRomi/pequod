/* This example requires Tailwind CSS v2.0+ */
export default function TokenomicsDialog({tokenomics}: {tokenomics: any}) {
  return (
    <div className="md:inline-block transform overflow-x-scroll md:overflow-hidden rounded-40 border border-pequod-white-300 bg-pequod-gray text-left align-bottom shadow-xl transition-all sm:my-8 sm:p-6 sm:align-middle md:p-8 md:pb-10 md:pt-10">
      <div>
        <label
          htmlFor="stakingAmount"
          className="text-md mb-4 block text-center font-medium text-white"
        >
          Tokenomics
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <table className="min-w-full divide-y divide-gray-300 border rounded-md">
            <thead className="">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6"
                >
                  Allocation
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Supply
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Tokens
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Raise
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Allocation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 divide-x">
              {tokenomics.map((row: any, i: number) => (
                <tr key={i}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                    {row.allocation}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                    {row.supply}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                    {row.tokens}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                    {row.price}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                    {row.raise}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
