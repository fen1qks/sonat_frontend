export default function PlayButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-[64px] w-[64px] rounded-full cursor-pointer"
    >
      <div className="absolute inset-0 rounded-full bg-[#09B843] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
      <div className="absolute inset-[1px] rounded-full border-2 border-[rgba(255,255,255,0.25)]" />
      <div className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-[35%] -translate-y-1/2 border-b-[10px] border-l-[18px] border-t-[10px] border-b-transparent border-l-black border-t-transparent" />
    </button>
  );
}