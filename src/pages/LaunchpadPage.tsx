import { LinkIcon } from '@heroicons/react/outline';

import midaImage from '../images/mida.png';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
export default function LaunchpadPage() {
  const launchpads = [
      {
          title: "MIDA PROJECT",
          data: "30/03/2022",
          description: "Dai musei al Metaverso. MIDA offre alle Istituzioni che conservano capolavori artistici un nuovo modo di valorizzarli tramite la creazione e la vendita di opere NFT uniche ai grandi collezionisti del Metaverso.",
          imageUrl: midaImage,
          redirectUrl: "https://midanft.com/it/dai-musei-al-metaverso/"
      }
  ]

  return (
    <>
      <main className="flex flex-col gap-0 md:gap-10">
        <h1 className="ml-4 text-xl font-normal text-pequod-white">Launchpad</h1>
        {launchpads.length === 0 ? 
          <div className="flex h-full w-full items-center justify-center overflow-hidden py-60">
            <h2 className="ml-4 text-4xl font-normal text-pequod-white">
              No launchpads available
            </h2>
          </div>
         : <></>}
        

        {launchpads.map((item) =>{
            return (
                <div className="flex flex-col py-12 border-b-2 md:flex-row">
                    <div className="">
                        <a href={item.redirectUrl} target="_blank" rel="noreferrer"><img src={item.imageUrl} alt={item.title} /></a>
                    </div>
                    <div className="flex flex-col text-white px-4 mt-4 md:mt-0 md:px-12 ">
                        <a href={item.redirectUrl} target="_blank" rel="noreferrer">
                            <div className="text-md md:text-3xl flex flex-row mb-2">{item.title}&nbsp;<LinkIcon className="ml-4 w-4 md:w-8"/></div>
                        </a>
                        <div className="text-sm md:text-xl text-pequod-pink mb-4 md:mb-6">{item.data}</div>
                        <div className="text-sm md:text-md text-white max-w-md">{item.description}</div>
                    </div>
                </div>
            ) 
        })
        }
      </main>
    </>
  );
}
