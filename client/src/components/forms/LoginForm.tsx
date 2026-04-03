import SonatText from "../text/SonatText";
import InputField from "../fields/InputField.tsx";
import NonTransButton from "../button/NonTransButton.tsx";
import TransButton from "../button/TransButton.tsx";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
    const navigate = useNavigate();
  return (
    <form className="content-stretch flex flex-col gap-[49px] items-center px-[48px] py-[282px] relative z-10">
      <SonatText />

      <InputField type="text" placeholder="Username" name="username" />

      <InputField type="password" placeholder="Password" name="password" />

      <div className="flex items-center gap-[15px]">
        <NonTransButton text="Login" type="submit" />
        <TransButton
            text="Registration"
            onClick={() => navigate("/register")}
        />
      </div>
    </form>
  );
}