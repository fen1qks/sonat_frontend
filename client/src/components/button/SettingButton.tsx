export default function SettingButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[144px] rounded-[40px] bg-[#0c0c0c] px-[40px] py-[16px] text-[16px] font-medium text-white tracking-[-0.08px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[35px] cursor-pointer flex items-center justify-center"
    >
      <span className="leading-[1.45]">Setting</span>
    </button>
  );
}