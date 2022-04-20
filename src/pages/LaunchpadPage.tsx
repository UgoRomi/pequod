import {LinkIcon} from "@heroicons/react/outline";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {useApiCall} from "../utils/utils";
interface LaunchpadsResponse {
  id: string;
  title: string;
  data: Date;
  description: string;
  imageUrl: string;
  redirectUrl: string;

  // Detail page
  launchpadTitle: string;
  launchpadBg: string;
  launchpadSubTitle: string;
  launchpadDesc: string;
  // Button
  buyButtonText: string;
  claimButtonText: string;
  buttonBgColor: string;
  buttonTextColor: string;
  detailButtonText: string;
  buttonDetailTextColor: string;
  hideButtons: boolean;
}
export default function LaunchpadPage() {
  const apiCall = useApiCall();
  const [launchpads, setLaunchpads] = useState<LaunchpadsResponse[]>([]);
  //const url = window.location.href;
  // Qui va splittato e launchpadID diventa quello dopo /launchpad
  //const arr = url.split("/");

  useEffect(() => {
    apiCall(`/launchpads/list`, {}).then((res) => {
      if (!res?.data) {
        return;
      }
      const {data: response}: {data: LaunchpadsResponse[]} = res;
      setLaunchpads(response);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex flex-col gap-0 md:gap-10">
      <h1 className="ml-4 text-xl font-normal text-pequod-white">Launchpad</h1>
      {launchpads.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center overflow-hidden py-60">
          <h2 className="ml-4 text-4xl font-normal text-pequod-white">
            No launchpads available
          </h2>
        </div>
      ) : (
        <></>
      )}

      {launchpads.map((item) => {
        return (
          <div
            key={item.id}
            className="flex flex-col border-b-2 py-12 md:flex-row"
          >
            <div className="">
              {item.redirectUrl.indexOf("http") > -1 ? (
                <a href={item.redirectUrl} rel="noreferrer">
                  <img src={item.imageUrl} alt={item.title} />
                </a>
              ) : (
                <Link to={item.redirectUrl} rel="noreferrer">
                  <img src={item.imageUrl} alt={item.title} />
                </Link>
              )}
            </div>
            <div className="mt-4 flex flex-col px-4 text-white md:mt-0 md:px-12 ">
              {item.redirectUrl.indexOf("http") === -1 ? (
                <a href={item.redirectUrl} rel="noreferrer">
                  <div className="text-md mb-2 flex flex-row md:text-3xl">
                    {item.title}&nbsp;
                    <LinkIcon className="ml-4 w-4 md:w-8" />
                  </div>
                </a>
              ) : (
                <Link to="/launchpad/mida" rel="noreferrer">
                  <div className="text-md mb-2 flex flex-row md:text-3xl">
                    {item.title}&nbsp;
                    <LinkIcon className="ml-4 w-4 md:w-8" />
                  </div>
                </Link>
              )}

              <div className="mb-4 text-sm text-pequod-pink md:mb-6 md:text-xl">
                {item.data}
              </div>
              <div className="md:text-md max-w-md text-sm text-white">
                {item.description}
              </div>
            </div>
          </div>
        );
      })}
    </main>
  );
}
