export default function NonTransButton({ text, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-white cursor-pointer flex items-center justify-center px-[16px] py-[12px] rounded-[12px]"
    >
      <span className="font-medium text-[18px] text-black text-center tracking-[-0.09px] leading-[1.45] whitespace-nowrap">
        {text}
      </span>
    </button>
  );
}