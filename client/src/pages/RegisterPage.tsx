import imgHero1 from "../assets/images/log_reg_bg.png";
import RegisterForm from "../components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen size-full overflow-hidden">
      <img
        src={imgHero1}
        alt=""
        className="absolute inset-0 size-full object-cover pointer-events-none"
      />

      <RegisterForm />
    </div>
  );
}