import logoPequod from '../images/logo.svg';
export default function MaintenancePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-pequod-dark px-4 sm:px-0">
        <div className="flex justify-center items-center self-center text-white flex-col text-center">
            <img src={logoPequod} alt="logo manutenzione pequod" className="w-2/5 mb-6"/>
            <div className="md:text-xl sm:text-md">
            Ci scusiamo per l'inconveniente.<br/><br/>
            Pequod &egrave; attualmente in manutenzione.<br/><br/>
            Grazie per la comprensione.</div>
        </div>
    </div>
  );
}
