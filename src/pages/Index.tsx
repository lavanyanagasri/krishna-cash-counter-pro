
import { useState } from "react";
import { Navigate } from "react-router-dom";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
  }

  return <LoginForm onLogin={() => setIsLoggedIn(true)} />;
};

export default Index;
