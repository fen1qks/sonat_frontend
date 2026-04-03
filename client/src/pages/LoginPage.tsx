import imgHero1 from "../assets/images/log_reg_bg.png";
import LoginForm from "../components/forms/LoginForm.tsx";

export default function LoginPage() {
  return (
    <div className="relative size-full min-h-screen overflow-hidden">
      <img
        alt=""
        src={imgHero1}
        className="absolute inset-0 size-full object-cover pointer-events-none"
      />

      <LoginForm />
    </div>
  );
}