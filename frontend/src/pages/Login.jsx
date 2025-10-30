import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      navigate("/"); // redirect to homepage/catalog
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-[#090909] text-white">
      <form
        onSubmit={handleLogin}
        className="bg-[#121212] p-6 rounded-lg w-80 shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
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
          Login
        </button>
        <p className="text-center mt-3 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-400 underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
