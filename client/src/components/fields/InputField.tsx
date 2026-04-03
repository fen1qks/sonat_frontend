type InputFieldProps = {
  type?: string;
  placeholder: string;
  required?: boolean;
  name?: string;
};

export default function InputField({
  type = "text",
  placeholder,
  required = false,
  name,
}: InputFieldProps) {
  return (
    <div className="relative w-[381px]">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="bg-[rgba(255,255,255,0.83)] h-[50px] w-full rounded-[12px] text-[#191010] text-[18px] text-center outline-none placeholder:text-[#191010]"
      />

      {required && (
        <span className="absolute right-[12px] top-1/3 -translate-y-1/2 text-red-500 text-[20px]">
          *
        </span>
      )}
    </div>
  );
}