import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/auth/register", {
        first_name,
        last_name,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      alert("Registration successful!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-[#090909] text-white overflow-hidden">
      <form
        onSubmit={handleRegister}
        className="bg-[#121212] p-6 rounded-lg w-80 shadow-lg flex flex-col"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
        <input
          type="text"
          placeholder="First Name"
          className="w-full mb-3 p-2 rounded bg-transparent border border-white text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
          value={first_name}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          className="w-full mb-3 p-2 rounded bg-transparent border border-white text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
          value={last_name}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-transparent border border-white text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 rounded bg-transparent border border-white text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-white text-black py-2 rounded hover:bg-gray-300 font-semibold transition"
        >
          Register
        </button>
        <p className="text-center mt-3 text-sm text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
