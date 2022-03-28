import { useState, useEffect } from "react";
import LaunchpadModal from "../components/LaunchpadModal";
import Spinner from "../components/Spinner";
import mobyLaunchpadBg from "../images/launchpad_bg.png";
import {
  useAllowance,
  useApprove,
  useLaunchpad,
} from "../utils/contractsUtils";

export default function MigrationPage() {
  const checkAllowance = useAllowance();
  const allow = useApprove();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [allowanceInProgress, setAllowanceInProgress] =
    useState<boolean>(false);
  const [claimInProgress, setClaimInProgress] = useState<boolean>(false);
  const [presaleContractAllowance, setPresaleContractAllowance] =
    useState<boolean>(false);
  const [canClaim, setCanClaim] = useState<boolean>(false);

  const {
    canClaim: checkCanClaim,
    claim,
    amountOfTokenThatWillReceive,
  } = useLaunchpad(process.env.REACT_APP_LAUNCHPAD_ADDRESS as string);

  useEffect(() => {
    amountOfTokenThatWillReceive().then((amountToReceive) => {
      console.log("amountToReceive", amountToReceive);
    });
  });

  // Check if the user has already allowed the spending of the tokens
  // to the presale contract
  useEffect(() => {
    checkAllowance(
      process.env.REACT_APP_WOT_ADDRESS as string,
      process.env.REACT_APP_LAUNCHPAD_ADDRESS as string
    ).then((allowance) => {
      setPresaleContractAllowance(allowance > 0);
    });
  }, [checkAllowance]);

  // Check if the user can claim the tokens
  useEffect(() => {
    checkCanClaim().then((canClaim) => {
      console.log("canClaim", canClaim);
      setCanClaim(canClaim);
    });
  }, [checkCanClaim, presaleContractAllowance]);

  const allowPresaleContract = () => {
    setAllowanceInProgress(true);
    allow(
      process.env.REACT_APP_WOT_ADDRESS as string,
      process.env.REACT_APP_LAUNCHPAD_ADDRESS as string
    )
      .then(() => setPresaleContractAllowance(true))
      .finally(() => {
        setAllowanceInProgress(false);
      });
  };

  return (
    <>
      <LaunchpadModal
        setOpen={setShowModal}
        hidden={!showModal}
        initialStep={3}
        presaleStatus={{ currentRaised: 0, hardCap: 0, softCap: 0 }}
      ></LaunchpadModal>
      <main className="flex flex-col gap-0 md:gap-10">
        <h1 className="mt-6 text-3xl font-normal text-pequod-white">
          Launchpad MOBY
        </h1>
        <hr />
        <img src={mobyLaunchpadBg} alt="launchpad pequod" />
        <div className="p-4 text-center">
          <h1 className="mt-6 text-3xl font-normal text-pequod-white">
            Migrazione a V2
          </h1>
          <h3 className="mt-3 text-xl font-normal text-pequod-pink">
            21/03/2022
          </h3>
          <h2 className="mt-8 text-xl font-light text-pequod-white">
            Cosa accadrà con la migrazione a V2? A seguito della migrazione i
            token WOT verranno convertiti in MOBY. Tutto questo avverrà in un
            lasso di tempo limitato. Successivamente, cliccando sul tasto “il
            claim” i nuovi token verranno ri-depositati nel tuo wallet.
          </h2>
          <div className="mt-24 flex flex-col items-center justify-center">
            {!presaleContractAllowance ? (
              <button
                className="flex rounded-3xl px-3 py-3"
                style={{
                  backgroundColor: "#00FFFF",
                  color: "#0B0629",
                }}
                onClick={allowPresaleContract}
              >
                {allowanceInProgress ? (
                  <>
                    <Spinner className="h-5 text-pequod-white" />
                    <span>Migrazione...</span>
                  </>
                ) : (
                  "Migra i token"
                )}
              </button>
            ) : (
              <button
                className="rounded-3xl px-3 py-3 disabled:cursor-default disabled:opacity-70"
                style={{
                  backgroundColor: "#00FFFF",
                  color: "#0B0629",
                }}
                disabled={!canClaim}
                onClick={() => {
                  setClaimInProgress(true);
                  claim()
                    .then((result) => {
                      if (!result.success) return;
                      setShowModal(!showModal);
                    })
                    .finally(() => setClaimInProgress(false));
                }}
              >
                {canClaim
                  ? claimInProgress
                    ? "Claiming..."
                    : "Claim Tokens"
                  : "Claim not yet available"}
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
