import {useState} from "react";
import LaunchpadModal from "../components/LaunchpadModal";
import mobyLaunchpadBg from "../images/launchpad_bg.png";
export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
export default function MigrazionePage() {
  const [showModal, setShowModal] = useState<boolean>(false);

  // Qui gestire il canClaim in base alla chiamata al BE e farla per le info
  const canClaim = false;
  return (
    <>
      <LaunchpadModal
        setOpen={setShowModal}
        hidden={!showModal}
      ></LaunchpadModal>
      <main className="flex flex-col gap-0 md:gap-10">
        <h1 className="text-3xl mt-6 font-normal text-pequod-white">
          Launchpad MOBY
        </h1>
        <hr />
        <img src={mobyLaunchpadBg} alt="launchpad pequod" />
        <div className="p-4 text-center">
          <h1 className="text-3xl mt-6 font-normal text-pequod-white">
            Migrazione a V2
          </h1>
          <h3 className="text-xl mt-3 font-normal text-pequod-pink">
            21/03/2022
          </h3>
          <h2 className="text-xl mt-8 font-light text-pequod-white">
            Cosa accadrà con la migrazione a V2? A seguito della migrazione i
            token WOT verranno convertiti in MOBY. Tutto questo avverrà in un
            lasso di tempo limitato. Successivamente, cliccando sul tasto “il
            claim” i nuovi token verranno ri-depositati nel tuo wallet.
          </h2>
          <div className="flex flex-col mt-24 justify-center items-center">
            <button
              className="rounded-3xl px-3 py-3"
              style={{
                backgroundColor: "#00FFFF",
                color: "#0B0629",
                width: 200,
              }}
              hidden={canClaim}
              onClick={() => setShowModal(!showModal)}
            >
              Migra i token
            </button>
            <button
              className="rounded-3xl px-3 py-3"
              style={{
                backgroundColor: "#00FFFF",
                color: "#0B0629",
                width: 200,
              }}
              hidden={!canClaim}
              onClick={() => setShowModal(!showModal)}
            >
              Claim tokens
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
