import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomDialog from "../components/CustomDialog";
import PresaleModalContent from "../components/PresaleModalContent";
import { useLaunchpad } from "../utils/contractsUtils";
import { useApiCall } from "../utils/utils";
interface LaunchpadsResponse {
  id: string;
  title: string;
  data: Date;
  description: string;
  imageUrl: string;
  redirectUrl: string;
  contractAddress: string;
  presaleContractAddress: string;

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
  const { launchpadId } = useParams();
  let [launchpadData, setLaunchpadData] = useState<LaunchpadsResponse>();

  useEffect(() => {
    apiCall(`/launchpads/list`, {}).then((res) => {
      if (!res?.data) {
        return;
      }
      if (res.data.length && launchpadId) {
        setLaunchpadData(res.data.find((item: any) => item.id === launchpadId));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showPresaleModal, setShowPresaleModal] = useState<boolean>(false);
  const [claimInProgress, setClaimInProgress] = useState<boolean>(false);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [, setCanContribute] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<0 | 1 | 2 | 3>(0);
  const [presaleStatus, setPresaleStatus] = useState<{
    currentRaised: number;
    hardCap: number;
    softCap: number;
    status: string;
  }>({ currentRaised: 0, hardCap: 0, softCap: 0, status: "NOT_STARTED_YET" });

  const {
    canClaim: checkCanClaim,
    canContribute: checkCanContribute,
    claim,
    getPresaleStatus,
  } = useLaunchpad(process.env.REACT_APP_LAUNCHPAD_BNB_ADDRESS as string);

  // Check if the user can claim the tokens
  useEffect(() => {
    checkCanClaim().then((canClaim) => {
      setCanClaim(canClaim);
    });
  }, [checkCanClaim]);

  // Check if the user can contribute to the presale
  useEffect(() => {
    checkCanContribute().then((canContribute) => {
      setCanContribute(canContribute);
    });
  }, [checkCanContribute]);

  // check the presale status
  useEffect(() => {
    getPresaleStatus().then(({ currentRaised, hardCap, softCap, status }) => {
      setPresaleStatus({ currentRaised, hardCap, softCap, status });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <CustomDialog
        isOpen={showPresaleModal}
        closeModal={() => setShowPresaleModal(false)}
      >
        <PresaleModalContent
          conversionRate={1}
          presaleAddress={launchpadData?.presaleContractAddress as string}
          tokenAddress={launchpadData?.contractAddress as string}
          initialStep={modalStep}
        ></PresaleModalContent>
      </CustomDialog>
      <main className="flex flex-col gap-0 md:gap-10">
        <span className="mt-6 text-3xl font-normal text-pequod-white">
          {launchpadData?.launchpadTitle}
        </span>
        <hr />
        <img src={launchpadData?.launchpadBg} alt="launchpad pequod" />
        <div className="p-4 text-center">
          <span className="mt-6 text-3xl font-normal text-pequod-white">
            {launchpadData?.launchpadSubTitle}
          </span>
          <span
            className="mt-3 text-xl font-normal text-pequod-pink"
            style={{ color: launchpadData?.buttonBgColor }}
          >
            {launchpadData?.data}
          </span>
          <span className="mt-8 text-xl font-light text-pequod-white">
            {launchpadData?.launchpadDesc}
          </span>

          {/* DA MOSTRARE QUEST INUOVI TASTI */}
          <div className="mt-5 flex justify-center">
            <button
              onClick={() => {
                setShowPresaleModal(true);
              }}
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
              className="ml-10 rounded-3xl px-3 py-3"
              style={{
                backgroundColor: launchpadData?.buttonBgColor,
                color: launchpadData?.buttonTextColor,
                width: 200,
              }}
            >
              Tokenomics
            </button>
          </div>
          <div className="mt-12 flex justify-center">
            <div
              className="h-50 w-full rounded-3xl"
              style={{ backgroundColor: "#7B7663" }}
            >
              <div
                className="flex h-50 items-center justify-center rounded-3xl"
                style={{
                  width: `${
                    (presaleStatus.currentRaised * 100) / presaleStatus.hardCap
                  }%`,
                  backgroundColor: "#FFEBA0",
                }}
              >
                {presaleStatus.currentRaised} BNB
              </div>
            </div>

            <div
              className="absolute mb-10 grid grid-cols-8 grid-rows-4 text-white"
              style={{ width: "20%", marginTop: "-1%", marginLeft: "30%" }}
            >
              <div className="col-span-1 border-l px-10 text-left">SC</div>
              <div className="col-span-6"></div>
              <div className="col-span-1 border-l px-10 text-left">HC</div>

              <div className="col-span-1 border-l"></div>
              <div className="col-span-6"></div>
              <div className="col-span-1 border-l"></div>

              <div className="col-span-1 border-l"></div>
              <div className="col-span-6"></div>
              <div className="col-span-1 border-l"></div>

              <div className="col-span-1 border-l px-10 text-left">
                {presaleStatus.softCap}
              </div>
              <div className="col-span-6"></div>
              <div className="col-span-1 border-l px-10 text-left">
                {presaleStatus.hardCap}
              </div>
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
                    setClaimInProgress(true);
                    claim()
                      .then((result) => {
                        if (!result.success) return;
                        setModalStep(3);
                        setShowModal(!showModal);
                      })
                      .finally(() => setClaimInProgress(false));
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
                style={{ color: launchpadData?.buttonDetailTextColor }}
                onClick={() => {
                  setShowPresaleModal(true);
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
