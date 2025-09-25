"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { useAuth } from "@/contexts/AuthContext"; // ¡Importamos el hook mágico!

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Este estado es solo para la llamada a la API

  // Obtenemos la función 'login' de nuestro contexto
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        // Preparamos los datos de autenticación
        const authData = {
          token: data.access_token,
          user: {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            nombre: data.user.nombre || "Usuario KantarEs",
            rol: data.user.rol,
          },
        };

        // ¡Aquí está la magia!
        // Llamamos a la función 'login' del contexto.
        // Ella se encargará de guardar en localStorage, actualizar el estado global y redirigir.
        login(authData);

        // Ya no necesitamos 'setIsTransitioning', 'setTimeout' o 'router.push' aquí.
      } else {
        setError(data.message || "Usuario o contraseña incorrectos");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setError("Error de conexión con el servidor");
      setIsLoading(false);
    }
  };

  // El PageLoader ya no es necesario aquí, porque el AuthGuard se encargará de las transiciones.

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100">
      {/* Organic curved background shapes */}
      <div className="absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 800"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M0 0 L800 0 Q 900 100 850 200 Q 800 300 900 400 Q 950 500 850 600 Q 750 700 800 800 L0 800 Z"
            fill="url(#redGradient)"
          />
          <defs>
            <linearGradient
              id="redGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="30%" stopColor="#dc2626" />
              <stop offset="70%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          className="absolute inset-0 w-full h-full opacity-60"
          viewBox="0 0 1200 800"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M0 0 L750 0 Q 850 150 800 250 Q 750 350 850 450 Q 900 550 800 650 Q 700 750 750 800 L0 800 Z"
            fill="url(#redGradient2)"
          />
          <defs>
            <linearGradient
              id="redGradient2"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating decorative circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-32 w-32 h-32 bg-gradient-to-br from-red-300/40 to-red-500/60 rounded-full blur-sm animate-float-slow"></div>
        <div
          className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-br from-red-400/30 to-red-600/50 rounded-full blur-sm animate-float-medium"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-40 w-40 h-40 bg-gradient-to-br from-red-200/50 to-red-400/70 rounded-full blur-md animate-float-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-16 w-20 h-20 bg-gradient-to-br from-red-500/40 to-red-700/60 rounded-full blur-sm animate-float-fast"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-1/2 right-60 w-16 h-16 bg-gradient-to-br from-red-300/60 to-red-500/80 rounded-full animate-float-medium"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-40 right-80 w-12 h-12 bg-gradient-to-br from-red-400/50 to-red-600/70 rounded-full animate-float-fast"
          style={{ animationDelay: "2.5s" }}
        ></div>
        <div
          className="absolute top-60 right-24 w-8 h-8 bg-red-300/70 rounded-full animate-pulse"
          style={{ animationDelay: "0.8s" }}
        ></div>
        <div
          className="absolute bottom-40 right-72 w-6 h-6 bg-red-400/80 rounded-full animate-pulse"
          style={{ animationDelay: "1.8s" }}
        ></div>
        <div
          className="absolute top-32 right-48 w-10 h-10 bg-red-200/60 rounded-full blur-sm animate-float-slow"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute bottom-60 right-28 w-14 h-14 bg-red-500/50 rounded-full blur-md animate-float-medium"
          style={{ animationDelay: "2.2s" }}
        ></div>
        <div
          className="absolute top-2/3 right-12 w-6 h-6 bg-red-600/70 rounded-full blur-sm animate-float-fast"
          style={{ animationDelay: "1.3s" }}
        ></div>
      </div>

      {/* Left side content */}
      <div className="absolute left-0 top-0 w-full lg:w-2/3 h-full flex items-center justify-center p-8 lg:p-16">
        <div className="text-center text-white max-w-md animate-slide-in-left animate-content-breathe">
          <FadeIn delay={0.4}>
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <img
                  src="/kantares-logo.jpg"
                  alt="Kantares Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                KANTARES
              </h1>
              <p className="text-red-50 text-lg leading-relaxed opacity-90">
                Bienvenido de vuelta a nuestro sistema de gestión
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Right side login form */}
      <div className="absolute right-0 top-0 w-full lg:w-1/2 h-full flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <FadeIn delay={0.4}>
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden animate-form-breathe hover:animate-form-hover transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-red-100/30 rounded-3xl"></div>
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Iniciar Sesión
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Ingresa tus credenciales para continuar
                  </p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  {error && (
                    <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm rounded-xl">
                      <AlertDescription className="text-red-700 text-sm">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-gray-700 font-medium text-sm"
                    >
                      USUARIO
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Ingresa tu usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-12 h-14 border-0 border-b-2 border-gray-200 focus:border-red-500 focus:ring-0 rounded-none bg-transparent text-gray-800 placeholder-gray-400 transition-all duration-300"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-gray-700 font-medium text-sm"
                    >
                      CONTRASEÑA
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingresa tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-14 border-0 border-b-2 border-gray-200 focus:border-red-500 focus:ring-0 rounded-none bg-transparent text-gray-800 placeholder-gray-400 transition-all duration-300"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl mt-8"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>VERIFICANDO...</span>
                      </div>
                    ) : (
                      "INICIAR SESIÓN"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          25% {
            transform: translateY(-20px) translateX(10px) scale(1.05);
          }
          50% {
            transform: translateY(-10px) translateX(-10px) scale(0.95);
          }
          75% {
            transform: translateY(-30px) translateX(5px) scale(1.02);
          }
        }
        @keyframes float-medium {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          33% {
            transform: translateY(-15px) translateX(-8px) scale(1.03);
          }
          66% {
            transform: translateY(-25px) translateX(8px) scale(0.97);
          }
        }
        @keyframes float-fast {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-12px) translateX(4px) scale(1.02);
          }
        }
        @keyframes slide-in-left {
          0% {
            transform: translateX(-100px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes content-breathe {
          0%,
          100% {
            transform: translateY(0px) scale(1) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) scale(1.02) rotate(0.3deg);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 1.2s ease-out forwards;
        }
        .animate-content-breathe {
          animation: content-breathe 5s ease-in-out infinite;
          animation-delay: 1.2s;
        }
        @keyframes form-breathe {
          0%,
          100% {
            transform: translateY(0px) scale(1) rotate(0deg);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          50% {
            transform: translateY(-8px) scale(1.02) rotate(0.5deg);
            box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.35);
          }
        }
        @keyframes form-hover {
          0%,
          100% {
            transform: translateY(-5px) scale(1.03) rotate(-0.5deg);
            box-shadow: 0 40px 70px -12px rgba(0, 0, 0, 0.4);
          }
          50% {
            transform: translateY(-12px) scale(1.05) rotate(0.5deg);
            box-shadow: 0 50px 80px -12px rgba(0, 0, 0, 0.45);
          }
        }
        .animate-form-breathe {
          animation: form-breathe 4s ease-in-out infinite;
        }
        .animate-form-hover {
          animation: form-hover 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
