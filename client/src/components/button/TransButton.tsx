export default function TransButton({ text, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="content-stretch cursor-pointer flex items-center justify-center px-[16px] py-[12px] relative rounded-[12px] size-full bg-[rgba(255,255,255,0.08)]"
      data-name="TransButton"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-[rgba(255,255,255,0.15)] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="flex flex-col font-medium justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-left text-white tracking-[-0.09px] whitespace-nowrap">
        <p className="leading-[1.45]">{text}</p>
      </div>
    </button>
  );
}