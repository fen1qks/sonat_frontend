import type { ActiveView } from "../../pages/MainPage";

type LibraryFormProps = {
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
};

function LibraryForm({ setActiveView }: LibraryFormProps) {
  return (
    <section className="relative z-10 flex min-h-screen w-full items-start justify-center px-[30px] py-[28px]">
      <div className="flex w-full max-w-[1240px] flex-col items-center rounded-[36px] bg-[rgba(35,72,93,0.82)] px-[24px] py-[40px] shadow-[0px_18px_45px_0px_rgba(0,0,0,0.22)] backdrop-blur-[8px]">
        <h1 className="text-[32px] font-semibold text-white">Library</h1>

        <p className="mt-[16px] text-[18px] text-white/80">
          Тут поки заглушка
        </p>

        <button
          type="button"
          onClick={() => setActiveView("home")}
          className="mt-[28px] rounded-[40px] border border-white/20 bg-black px-[32px] py-[14px] text-white"
        >
          Back
        </button>
      </div>
    </section>
  );
}

export default LibraryForm;