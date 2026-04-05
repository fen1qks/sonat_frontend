import { useNavigate } from "react-router-dom";
import SonatText from "../text/SonatText";
import InputField from "../fields/InputField";
import NonTransButton from "../button/NonTransButton";
import TransButton from "../button/TransButton";
import React, { useState } from "react";
import { API_BASE_URL } from "../../config/api";

type RegisterFormData = {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
};

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    username: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-[38px] px-[48px]"
      onSubmit={handleSubmit}
    >
      <SonatText />

      <InputField
        placeholder="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <InputField
        placeholder="Username"
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />

      <InputField
        placeholder="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <InputField
        placeholder="Confirm password"
        type="password"
        name="confirm_password"
        value={formData.confirm_password}
        onChange={handleChange}
        required
      />

      {error && <p className="text-[16px] text-red-500">{error}</p>}

      <div className="mt-[2px]">
        <NonTransButton
          text={loading ? "Loading..." : "Confirm"}
          type="submit"
        />
      </div>

      <div className="mt-[2px]">
        <TransButton
          text="Back"
          type="button"
          onClick={() => navigate("/")}
        />
      </div>
    </form>
  );
}

export default RegisterForm;