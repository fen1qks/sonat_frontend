export default function AddButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-[64px] w-[64px] rounded-full bg-[rgba(255,255,255,0.83)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] cursor-pointer"
    >
      <div className="absolute inset-0 rounded-full border-2 border-[rgba(255,255,255,0.25)]" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] text-[38px] font-normal leading-none text-black">
        +
      </span>
    </button>
  );
}