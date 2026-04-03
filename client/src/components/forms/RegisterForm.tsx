import { useNavigate } from "react-router-dom";
import SonatText from "../text/SonatText";
import InputField from "../fields/InputField";
import NonTransButton from "../button/NonTransButton";
import TransButton from "../button/TransButton";

export default function RegisterForm() {
  const navigate = useNavigate();

  return (
    <form className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-[38px] px-[48px]">
      <SonatText />

      <InputField placeholder="Email" type="email" required />
      <InputField placeholder="Username" />
      <InputField placeholder="Password" type="password" required />
      <InputField placeholder="Confirm password" type="password" required />

      <div className="mt-[2px]">
        <NonTransButton text="Confirm" type="submit" />
      </div>

      <div className="mt-[2px]">
        <TransButton text="Back" type="button" onClick={() => navigate("/")} />
      </div>
    </form>
  );
}