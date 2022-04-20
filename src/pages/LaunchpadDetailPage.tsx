import {useEffect, useState} from "react";
import LaunchpadModal from "../components/LaunchpadModal";
import {useParams} from "react-router-dom";
import {useLaunchpad} from "../utils/contractsUtils";
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
  isClosed: boolean;
}
export default function LaunchpadDetailPage() {
  const apiCall = useApiCall();
  const [launchpads, setLaunchpads] = useState<LaunchpadsResponse[]>([]);
  const {launchpadId} = useParams();
  let [launchpadData, setLaunchpadData] = useState<LaunchpadsResponse>();
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
      CheckForLaunchpadToShow();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatchEvent]);

  const CheckForLaunchpadToShow = () => {
    if (launchpadId) {
      setLaunchpadData(launchpads.find((item) => item.id === launchpadId));
    }
  };

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showPresaleStatus, setShowPresaleStatus] = useState<boolean>(false);
  const [claimInProgress, setClaimInProgress] = useState<boolean>(false);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<0 | 1 | 2 | 3>(0);
  const [presaleStatus, setPresaleStatus] = useState<{
    currentRaised: number;
    hardCap: number;
    softCap: number;
  }>({currentRaised: 0, hardCap: 0, softCap: 0});

  /*const {
    canClaim: checkCanClaim,
    claim,
    getPresaleStatus,
  } = useLaunchpad(process.env.REACT_APP_LAUNCHPAD_BNB_ADDRESS as string);

  // Check if the user can claim the tokens
  useEffect(() => {
    checkCanClaim().then((canClaim) => {
      setCanClaim(canClaim);
    });
  }, [checkCanClaim]);

  // check the presale status
  useEffect(() => {
    getPresaleStatus().then(({currentRaised, hardCap, softCap}) => {
      setPresaleStatus({currentRaised, hardCap, softCap});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);*/

  return (
    <>
      {/* <LaunchpadModal
        setOpen={setShowModal}
        hidden={!showModal}
        conversionRate={40000}
        presaleAddress={process.env.REACT_APP_LAUNCHPAD_BNB_ADDRESS as string}
        initialStep={modalStep}
        presaleStatus={presaleStatus}
      ></LaunchpadModal>
      <LaunchpadModal
        setOpen={setShowPresaleStatus}
        hidden={!showPresaleStatus}
        initialStep={2}
        conversionRate={40000}
        presaleStatus={presaleStatus}
      ></LaunchpadModal> */}
      <main className="flex flex-col gap-0 md:gap-10">
        <h1 className="mt-6 text-3xl font-normal text-pequod-white">
          {launchpadData?.launchpadTitle}
        </h1>
        <hr />
        <img src={launchpadData?.launchpadBg} alt="launchpad pequod" />
        <div className="p-4 text-center">
          <h1 className="mt-6 text-3xl font-normal text-pequod-white">
            {launchpadData?.launchpadSubTitle}
          </h1>
          <h1
            className="mt-3 text-xl font-normal text-pequod-pink"
            style={{color: launchpadData?.buttonBgColor}}
          >
            {launchpadData?.data}
          </h1>
          <h2 className="mt-8 text-xl font-light text-pequod-white">
            {launchpadData?.launchpadDesc}
          </h2>

          {/* DA MOSTRARE QUEST INUOVI TASTI */}
          <div className="flex justify-center mt-5">
            <button
              className="rounded-3xl px-3 py-3"
              style={{
                backgroundColor: launchpadData?.buttonBgColor,
                color: launchpadData?.buttonTextColor,
                width: 200,
              }}
            >
              {launchpadData?.buyButtonText}
            </button>
            <button
              className="rounded-3xl px-3 py-3 ml-10"
              style={{
                backgroundColor: launchpadData?.buttonBgColor,
                color: launchpadData?.buttonTextColor,
                width: 200,
              }}
            >
              Tokenomics
            </button>
          </div>
          <div className="flex justify-center mt-12">
            <div
              className="w-full h-50 rounded-3xl"
              style={{backgroundColor: "#7B7663"}}
            >
              <div
                className="h-50 rounded-3xl flex justify-center items-center"
                style={{width: "300px", backgroundColor: "#FFEBA0"}}
              >
                100 BNB
              </div>
            </div>
            <div
              className="text-left text-white border-l px-2"
              style={{
                position: "absolute",
                marginTop: "-25px",
                marginLeft: "10%",
              }}
            >
              SC
              <br />
              <br />
              <br />
              100 BNB
            </div>
            <div
              className="text-right text-white px-2"
              style={{
                position: "absolute",
                marginTop: "-25px",
                marginLeft: "60%",
              }}
            >
              HC
              <br />
              <br />
              <br />
              300 BNB
            </div>
          </div>

          {!launchpadData?.hideButtons ? (
            <div className="mt-24 flex flex-col items-center justify-center">
              {canClaim ? (
                <button
                  className="rounded-3xl px-3 py-3"
                  style={{
                    backgroundColor: launchpadData?.buttonBgColor,
                    color: launchpadData?.buttonTextColor,
                    width: 200,
                  }}
                  onClick={() => {
                    /*setClaimInProgress(true);
                    claim()
                      .then((result) => {
                        if (!result.success) return;
                        setModalStep(3);
                        setShowModal(!showModal);
                      })
                      .finally(() => setClaimInProgress(false));*/
                  }}
                >
                  {claimInProgress
                    ? "Claiming..."
                    : launchpadData?.claimButtonText}
                </button>
              ) : !launchpadData?.isClosed ? (
                <button
                  className="rounded-3xl px-3 py-3"
                  style={{
                    backgroundColor: launchpadData?.buttonBgColor,
                    color: launchpadData?.buttonTextColor,
                    width: 200,
                  }}
                  onClick={() => setShowModal(!showModal)}
                >
                  {launchpadData?.buyButtonText}
                </button>
              ) : (
                <button
                  className="rounded-3xl px-3 py-3"
                  style={{
                    backgroundColor: "#2d2d2d",
                    color: "#f2f2f2",
                    width: 200,
                    opacity: 0.5,
                    cursor: "default",
                  }}
                >
                  Presale Closed
                </button>
              )}
              <button
                className="mt-10 text-xl font-normal underline"
                style={{color: launchpadData?.buttonDetailTextColor}}
                onClick={() => {
                  setShowPresaleStatus(true);
                }}
              >
                {launchpadData?.detailButtonText}
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </main>
    </>
  );
}
