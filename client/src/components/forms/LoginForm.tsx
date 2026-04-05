import SonatText from "../text/SonatText";
import InputField from "../fields/InputField";
import NonTransButton from "../button/NonTransButton";
import TransButton from "../button/TransButton";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { API_BASE_URL } from "../../config/api";

type LoginFormData = {
  username: string;
  password: string;
};

function LoginForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
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
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/main");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="content-stretch relative z-10 flex flex-col items-center gap-[49px] px-[48px] py-[282px]"
      onSubmit={handleSubmit}
    >
      <SonatText />

      <InputField
        type="text"
        placeholder="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />

      <InputField
        type="password"
        placeholder="Password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      {error && <p className="text-[16px] text-red-500">{error}</p>}

      <div className="flex items-center gap-[15px]">
        <NonTransButton
          text={loading ? "Loading..." : "Login"}
          type="submit"
        />

        <TransButton
          text="Registration"
          onClick={() => navigate("/register")}
        />
      </div>
    </form>
  );
}

export default LoginForm;