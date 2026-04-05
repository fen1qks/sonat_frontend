export default function SearchButton({ onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="absolute right-[15.5px] top-[17px] bottom-[17px] w-[109px] rounded-[8px] bg-white px-[12px] py-[8px] text-[16px] font-medium text-black tracking-[-0.08px] cursor-pointer flex items-center justify-center"
    >
      <span className="leading-[1.45]">Search</span>
    </button>
  );
}