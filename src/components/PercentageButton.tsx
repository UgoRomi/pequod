export default function PercentageButton({ text }: { text: string }) {
  return (
    <div className='flex flex-col justify-center cursor-pointer'>
      <button className='h-2 bg-purple-400 rounded-lg w-full'> </button>
      <span className='w-full flex justify-center'>{text}</span>
    </div>
  );
}
