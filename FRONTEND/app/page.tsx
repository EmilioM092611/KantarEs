// FRONTEND/app/page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  transform,
} from "framer-motion";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function LoginPage() {
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    isLoading,
    isSuccess,
    handleLogin,
  } = useLoginForm();

  const [showPassword, setShowPassword] = useState(false);
  const [isHoveringCurve, setIsHoveringCurve] = useState(false);

  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);
  const springConfig = { damping: 40, stiffness: 200, mass: 2 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  const bgTranslateX = useSpring(
    transform(
      mouseXSpring,
      [0, typeof window !== "undefined" ? window.innerWidth : 0],
      [-20, 20]
    ),
    springConfig
  );
  const bgTranslateY = useSpring(
    transform(
      mouseYSpring,
      [0, typeof window !== "undefined" ? window.innerHeight : 0],
      [-15, 15]
    ),
    springConfig
  );
  const circlesTranslateX = useSpring(
    transform(
      mouseXSpring,
      [0, typeof window !== "undefined" ? window.innerWidth : 0],
      [25, -25]
    ),
    springConfig
  );
  const circlesTranslateY = useSpring(
    transform(
      mouseYSpring,
      [0, typeof window !== "undefined" ? window.innerHeight : 0],
      [20, -20]
    ),
    springConfig
  );

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };
  const formShakeVariants = {
    initial: { x: 0 },
    shake: {
      x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100">
      <motion.div
        className="absolute inset-0"
        style={{ x: bgTranslateX, y: bgTranslateY }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 800"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          onMouseEnter={() => setIsHoveringCurve(true)}
          onMouseLeave={() => setIsHoveringCurve(false)}
        >
          <motion.path
            d="M0 0 L800 0 Q 900 100 850 200 Q 800 300 900 400 Q 950 500 850 600 Q 750 700 800 800 L0 800 Z"
            animate={{
              d: [
                "M0 0 L800 0 Q 900 100 850 200 Q 800 300 900 400 Q 950 500 850 600 Q 750 700 800 800 L0 800 Z",
                "M0 0 L800 0 Q 880 120 870 200 Q 820 280 880 420 Q 970 520 830 580 Q 730 720 820 800 L0 800 Z",
                "M0 0 L800 0 Q 900 100 850 200 Q 800 300 900 400 Q 950 500 850 600 Q 750 700 800 800 L0 800 Z",
              ],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            fill="url(#redGradient)"
          />
          <motion.path
            d="M0 0 L800 0 Q 900 100 850 200 Q 800 300 900 400 Q 950 500 850 600 Q 750 700 800 800 L0 800 Z"
            fill="url(#shineGradient)"
            initial={{ opacity: 0, x: -100 }}
            animate={
              isHoveringCurve ? { opacity: 0.8, x: 0 } : { opacity: 0, x: -100 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
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
            <linearGradient
              id="shineGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <svg
          className="absolute inset-0 w-full h-full opacity-60"
          viewBox="0 0 1200 800"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.path
            d="M0 0 L750 0 Q 850 150 800 250 Q 750 350 850 450 Q 900 550 800 650 Q 700 750 750 800 L0 800 Z"
            animate={{
              d: [
                "M0 0 L750 0 Q 850 150 800 250 Q 750 350 850 450 Q 900 550 800 650 Q 700 750 750 800 L0 800 Z",
                "M0 0 L750 0 Q 870 130 780 270 Q 770 330 830 470 Q 880 570 820 630 Q 720 730 730 800 L0 800 Z",
                "M0 0 L750 0 Q 850 150 800 250 Q 750 350 850 450 Q 900 550 800 650 Q 700 750 750 800 L0 800 Z",
              ],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: 2,
            }}
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
      </motion.div>
      <div className="absolute right-0 top-0 w-full lg:w-1/2 h-full overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-white/20 to-red-400/10 rounded-full filter blur-3xl opacity-50"
            animate={{
              transform: [
                "translate(0px, 0px) scale(1)",
                "translate(50px, -100px) scale(1.2)",
                "translate(-50px, 100px) scale(0.8)",
                "translate(0px, 0px) scale(1)",
              ],
            }}
            transition={{
              duration: 40,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-red-200/20 to-red-500/20 rounded-full filter blur-3xl opacity-60"
            animate={{
              transform: [
                "translate(0px, 0px) scale(1)",
                "translate(-100px, 50px) scale(0.9)",
                "translate(100px, -50px) scale(1.3)",
                "translate(0px, 0px) scale(1)",
              ],
            }}
            transition={{
              duration: 35,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
              delay: 5,
            }}
          />
          <motion.div
            className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-bl from-white/10 to-red-300/10 rounded-full filter blur-2xl opacity-40"
            animate={{
              transform: [
                "translate(0px, 0px) scale(1)",
                "translate(-40px, -80px) scale(1.1)",
                "translate(40px, 80px) scale(0.9)",
                "translate(0px, 0px) scale(1)",
              ],
            }}
            transition={{
              duration: 30,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
              delay: 2,
            }}
          />
        </div>
      </div>
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ x: circlesTranslateX, y: circlesTranslateY }}
      >
        <div className="absolute top-20 right-32 w-32 h-32 bg-gradient-to-br from-red-300/40 to-red-500/60 rounded-full blur-sm animate-float-slow"></div>
        <div
          className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-br from-red-400/30 to-red-600/50 rounded-full blur-sm animate-float-medium"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-40 w-40 h-40 bg-gradient-to-br from-red-200/50 to-red-400/70 rounded-full blur-md animate-float-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </motion.div>

      <motion.div
        className="absolute left-0 top-0 w-full lg:w-2/3 h-full flex items-center justify-center p-8 lg:p-16"
        animate={{
          width: isSuccess ? "100%" : "66.666667%",
          transition: { duration: 1.2, ease: [0.87, 0, 0.13, 1] },
        }}
      >
        <motion.div
          className="text-center text-white max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
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
          </motion.div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {!isSuccess && (
          <motion.div
            className="absolute right-0 top-0 w-full lg:w-1/2 h-full flex items-center justify-center p-8"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="w-full max-w-md"
              variants={formShakeVariants}
              animate={error ? "shake" : "initial"}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-red-100/30 rounded-3xl"></div>
                <motion.div
                  className="relative z-10"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    variants={itemVariants}
                    className="text-center mb-8"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Iniciar Sesión
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Ingresa tus credenciales para continuar
                    </p>
                  </motion.div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm rounded-xl">
                            <AlertDescription className="text-red-700 text-sm">
                              {error}
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div variants={itemVariants} className="space-y-2">
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
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
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
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl mt-8 relative overflow-hidden group"
                        disabled={isLoading || isSuccess}
                      >
                        <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-45 group-hover:left-[150%] transition-all duration-700 ease-in-out"></span>
                        {isLoading || isSuccess ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>VERIFICANDO...</span>
                          </div>
                        ) : (
                          "INICIAR SESIÓN"
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      `}</style>
    </div>
  );
}
