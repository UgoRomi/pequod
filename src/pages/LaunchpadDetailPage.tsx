import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import CustomDialog from "../components/CustomDialog";
import PresaleModalContent from "../components/PresaleModalContent";
import TokenomicsDialog from "../components/TokenomicsModal";
import {useLaunchpad} from "../utils/contractsUtils";
import {useApiCall} from "../utils/utils";
interface LaunchpadsResponse {
  id: string;
  title: string;
  data: Date;
  description: string;
  imageUrl: string;
  redirectUrl: string;
  contractAddress: string;
  presaleContractAddress: string;
  symbol: string;
  hardCap: number;
  softCap: number;
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
  const {launchpadId} = useParams();
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
  const [showTokenomicsModal, setShowTokenomicsModal] =
    useState<boolean>(false);
  const [claimInProgress, setClaimInProgress] = useState<boolean>(false);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<0 | 1 | 2 | 3>(0);
  const [presaleStatus, setPresaleStatus] = useState<{
    currentRaised: number;
    hardCap: number;
    softCap: number;
  }>({currentRaised: 0, hardCap: 0, softCap: 0});

  const {
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
  }, []);

  const tokenomicsMida = [
    {
      allocation: "Seed sale",
      supply: "8%",
      tokens: "8.000.000",
      price: "$ 0,055",
      raise: "$ 440.000",
      description:
        "5% on TGE / 3 months cliff / Unlock of 3,9583% for 24 months after",
    },
    {
      allocation: "MIDA's chosen",
      supply: "3%",
      tokens: "3.000.000",
      price: "$ 0,075",
      raise: "$ 225.000",
      description: "20% on TGE / Unlock of 6,6666% for 12 months after",
    },
    {
      allocation: "Strategic round",
      supply: "12%",
      tokens: "12.000.000",
      price: "$ 0,080",
      raise: "$ 960.000",
      description:
        "8,50% on TGE / 3 months cliff / Unlock of 3,8125% for 24 months after",
    },
    {
      allocation: "Public sale",
      supply: "3%",
      tokens: "3.000.000",
      price: "$ 0,10",
      raise: "$ 300.000",
      description: "15% on TGE / Unlock of 14,16666% for 6 months after",
    },
    {
      allocation: "Team",
      supply: "10%",
      tokens: "10.000.000",
      price: "",
      raise: "",
      description:
        "0% on TGE / 12 months cliff / Unlock of 2,777% for 36 months after",
    },
    {
      allocation: "Advisor",
      supply: "6%",
      tokens: "6.000.000",
      price: "",
      raise: "",
      description:
        "10% on TGE / 3 months cliff / Unlock of 3,75% for 24 months after",
    },
    {
      allocation: "Marketing & Community",
      supply: "20%",
      tokens: "20.000.000",
      price: "",
      raise: "",
      description:
        "5% on TGE / 3 months cliff / Unlock of 2,6388% for 36 months after",
    },
    {
      allocation: "Ecosystem & Development",
      supply: "20%",
      tokens: "20.000.000",
      price: "",
      raise: "",
      description:
        "3,5% on TGE / 3 months cliff / Unlock of 2,6805% for 36 months after",
    },
    {
      allocation: "Liquidity",
      supply: "18%",
      tokens: "18.000.000",
      price: "",
      raise: "",
      description:
        "25% on TGE / 3 months cliff / Unlock of 3,125% for 24 months after",
    },
  ];
  return (
    <>
      <CustomDialog
        isOpen={showPresaleModal}
        closeModal={() => setShowPresaleModal(false)}
      >
        <PresaleModalContent
          conversionRate={1}
          presaleAddress={launchpadData?.presaleContractAddress}
          title={launchpadData?.buyButtonText}
          symbol={launchpadData?.symbol || "MIDA"}
          initialStep={modalStep}
        ></PresaleModalContent>
      </CustomDialog>
      <CustomDialog
        isOpen={showTokenomicsModal}
        closeModal={() => setShowTokenomicsModal(false)}
      >
        <TokenomicsDialog tokenomics={tokenomicsMida}></TokenomicsDialog>
      </CustomDialog>
      <main className="flex flex-col gap-0 md:gap-10">
        <span className="mt-6 text-3xl font-normal text-pequod-white">
          {launchpadData?.launchpadTitle}
        </span>
        <hr />
        <img src={launchpadData?.launchpadBg} alt="launchpad pequod" />
        <div className="p-4 text-center flex flex-col">
          <span className="mt-6 text-3xl font-normal text-pequod-white">
            {launchpadData?.launchpadSubTitle}
          </span>
          <span
            className="mt-3 text-xl font-normal text-pequod-pink"
            style={{color: launchpadData?.buttonBgColor}}
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
              onClick={() => {
                setShowTokenomicsModal(true);
              }}
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
              style={{backgroundColor: "#7B7663"}}
            >
              <div
                className="flex h-50 items-center justify-center rounded-3xl"
                style={{
                  width: `${
                    (presaleStatus.currentRaised * 100) /
                    (launchpadData?.hardCap ? launchpadData?.hardCap : 0)
                  }%`,
                  minWidth: "7%",
                  backgroundColor: "#FFEBA0",
                }}
              >
                {presaleStatus.currentRaised} BNB
              </div>
            </div>

            <div
              className="absolute mb-10 grid grid-cols-8 grid-rows-4 text-white"
              style={{width: "20%", marginTop: "-1%", marginLeft: "30%"}}
            >
              <div className="col-span-1 border-l px-4 text-left">SC</div>
              <div className="col-span-6"></div>
              <div className="col-span-1 border-l px-4 text-left">HC</div>

              <div className="col-span-1 border-l"></div>
              <div className="col-span-6"></div>
              <div className="col-span-1 border-l"></div>

              <div className="col-span-1 border-l"></div>
              <div className="col-span-6"></div>
              <div className="col-span-1 border-l"></div>

              <div className="col-span-1 border-l px-4 text-left">
                {launchpadData?.softCap}
              </div>
              <div className="col-span-6"></div>
              <div className="col-span-1 border-l px-4 text-left">
                {launchpadData?.hardCap}
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
                style={{color: launchpadData?.buttonDetailTextColor}}
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
