import SearchButton from "../button/SearchButton";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
};

export default function SearchBar({
  value,
  onChange,
  onSearch,
}: SearchBarProps) {
  return (
    <div className="relative h-[73px] w-full min-w-0 rounded-[16px] bg-black shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[35px]">
      <div className="pointer-events-none absolute left-[16px] top-1/2 flex h-[32px] w-[32px] -translate-y-1/2 items-center justify-center text-[22px] text-white">
        ✦
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your wish"
        className="absolute left-[59px] right-[140px] top-1/2 h-[32px] min-w-0 -translate-y-1/2 bg-transparent text-[20px] font-semibold tracking-[-0.4px] text-white outline-none placeholder:text-white"
      />

      <SearchButton onClick={onSearch} />
    </div>
  );
}