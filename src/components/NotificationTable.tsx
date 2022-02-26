import notificaNegata from '../images/notifica_negata.svg';
import notificaOk from '../images/notifica_ok.svg';
interface NotificationState {
  uuid: string;
  description: string;
  type: string;
  createdAt: string;
}
export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const getNotificationIcon = (type:string) => {
  switch(type){
    case 'TakeProfitStopLossFailure':
      return notificaNegata;
    default: return notificaOk;
  }
}
export default function NotificationTable({
  notifications
}: {
  notifications: NotificationState[];
}) {
  return (
    <div className="mx-4 flex flex-col">
      <div className="-my-2 overflow-x-hidden sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-500"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className=" divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.uuid}>
                    
                    <td
                      className="flex justify-center px-6 py-4"
                    >
                      <img alt="" src={getNotificationIcon(notification.type)}></img>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-white">
                        {notification.description}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-white">
                        {notification.createdAt}
                      </div>
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
