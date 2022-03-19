import { LinkIcon } from "@heroicons/react/outline";

import midaImage from "../images/mida.png";
import mobyImage from "../images/launch_moby.png";
import mobyLaunchpadBg from "../images/launchpad_bg.png";
import { useState } from "react";
import LaunchpadModal from "../components/LaunchpadModal";

export default function LaunchpadPage() {
  const launchpads = [
    {
      title: "MIDA PROJECT",
      data: "30/03/2022",
      description:
        "Dai musei al Metaverso. MIDA offre alle Istituzioni che conservano capolavori artistici un nuovo modo di valorizzarli tramite la creazione e la vendita di opere NFT uniche ai grandi collezionisti del Metaverso.",
      imageUrl: midaImage,
      redirectUrl: "https://midanft.com/it/dai-musei-al-metaverso/",
    },
    {
      id: "moby",
      title: "MOBY V2",
      data: "21/03/2022",
      description:
        "La migrazione da V1 a V2 ti regala un’incredibile opportunità. Potrai acquistare i nuovi token MOBY a un prezzo invariabile. Vogliamo far crescere la nostra ciurma. Cogli l’opportunità al volo.",
      imageUrl: mobyImage,
      redirectUrl: "/launchpad/moby",

      // Detail page
      launchpadTitle: "Launchpad MOBY",
      launchpadBg: mobyLaunchpadBg,
      launchpadSubTitle: "Pre-sale Moby V2",
      launchpadDesc:
        "Approfitta della presale e acquista i nuovi Moby al prezzo fissato di 0.018 MOBY/$. Scegli la quantità di BNB che vuoi comprare, l’hard cap della presale è di 1000 BNB. Puoi verificare l’avanzamento della presale in “presale status”.",

      // Button
      buyButtonText: "Acquista Moby",
      buttonBgColor: "#00FFFF",
      buttonTextColor: "#0B0629",
      detailButtonText: "Stato Presale",
      buttonDetailTextColor: "#00FFFF",
    },
  ];
  //const url = window.location.href;
  // Qui va splittato e launchpadID diventa quello dopo /launchpad
  //const arr = url.split("/");
  const launchpadId = "moby";
  let launchpadData;
  if (launchpadId) {
    launchpadData = launchpads.find((item) => {
      if (item.id) return item.id === launchpadId;
      return null;
    });
  }

  const [showModal, setShowModal] = useState<boolean>(false);

  // Qui gestire il canClaim in base alla chiamata al BE e farla per le info
  const canClaim = false;
  return launchpadId && launchpadData ? (
    <>
      <LaunchpadModal
        setOpen={setShowModal}
        hidden={!showModal}
        step={0}
      ></LaunchpadModal>
      <main className="flex flex-col gap-0 md:gap-10">
        <h1 className="mt-6 text-3xl font-normal text-pequod-white">
          {launchpadData.launchpadTitle}
        </h1>
        <hr />
        <img src={launchpadData.launchpadBg} alt="launchpad pequod" />
        <div className="p-4 text-center">
          <h1 className="mt-6 text-3xl font-normal text-pequod-white">
            {launchpadData.launchpadSubTitle}
          </h1>
          <h1 className="mt-3 text-xl font-normal text-pequod-pink">
            {launchpadData.data}
          </h1>
          <h2 className="mt-8 text-xl font-light text-pequod-white">
            {launchpadData.launchpadDesc}
          </h2>
          <div className="mt-24 flex flex-col items-center justify-center">
            <button
              className="rounded-3xl px-3 py-3"
              style={{
                backgroundColor: launchpadData.buttonBgColor,
                color: launchpadData.buttonTextColor,
                width: 200,
              }}
              hidden={canClaim}
              onClick={() => setShowModal(!showModal)}
            >
              {launchpadData.buyButtonText}
            </button>
            <button
              className="rounded-3xl px-3 py-3"
              style={{
                backgroundColor: launchpadData.buttonBgColor,
                color: launchpadData.buttonTextColor,
                width: 200,
              }}
              hidden={!canClaim}
              onClick={() => setShowModal(!showModal)}
            >
              Claim
            </button>
            <button
              className="mt-10 text-xl font-normal underline"
              style={{ color: launchpadData.buttonDetailTextColor }}
            >
              {launchpadData.detailButtonText}
            </button>
          </div>
        </div>
      </main>
    </>
  ) : (
    <>
      <main className="flex flex-col gap-0 md:gap-10">
        <h1 className="ml-4 text-xl font-normal text-pequod-white">
          Launchpad
        </h1>
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
            <div className="flex flex-col border-b-2 py-12 md:flex-row">
              <div className="">
                <a href={item.redirectUrl} target="_blank" rel="noreferrer">
                  <img src={item.imageUrl} alt={item.title} />
                </a>
              </div>
              <div className="mt-4 flex flex-col px-4 text-white md:mt-0 md:px-12 ">
                <a href={item.redirectUrl} target="_blank" rel="noreferrer">
                  <div className="text-md mb-2 flex flex-row md:text-3xl">
                    {item.title}&nbsp;
                    <LinkIcon className="ml-4 w-4 md:w-8" />
                  </div>
                </a>
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
    </>
  );
}
