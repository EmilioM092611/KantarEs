"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  transform,
  useAnimation,
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

  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isHoveringCurve, setIsHoveringCurve] = useState(false);

  // Múltiples controles para orquestar animaciones complejas
  const textControls = useAnimation();
  const animatedTextControls = useAnimation();
  const finalPulseControls = useAnimation();

  const handleAccessClick = async () => {
    // 1. Oculta el texto estático inicial
    await textControls.start("hidden");

    // 2. Anima las letras con la voltereta 3D en secuencia
    await animatedTextControls.start("visible");

    // 3. Muestra de nuevo el texto original con un pulso de energía
    await finalPulseControls.start("pulse");

    // 4. Continúa con la transición
    setShowLogin(true);
  };

  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);
  const springConfig = { damping: 40, stiffness: 200, mass: 2 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (showLogin) {
      const handleMouseMove = (e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [showLogin, mouseX, mouseY]);

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

  // Variantes para las letras con voltereta 3D
  const flipLetterVariants = {
    hidden: {
      opacity: 0,
      rotateX: -90,
      y: -20,
    },
    visible: (i) => ({
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: {
        delay: i * 0.08, // Efecto dominó
        type: "spring",
        stiffness: 150,
        damping: 15,
      },
    }),
  };

  // Variantes para el pulso de energía final
  const finalPulseVariants = {
    initial: {
      opacity: 0,
    },
    pulse: {
      opacity: 1,
      scale: [1, 1.05, 1],
      filter: [
        "brightness(100%) drop-shadow(0 0 0 rgba(255, 255, 255, 0))",
        "brightness(175%) drop-shadow(0 0 20px rgba(255, 220, 220, 0.8))",
        "brightness(100%) drop-shadow(0 0 0 rgba(255, 255, 255, 0))",
      ],
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  };

  const formShakeVariants = {
    initial: { x: 0 },
    shake: {
      x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
      transition: { duration: 0.5 },
    },
  };

  const word = "KANTARES";

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <AnimatePresence>
        {!showLogin && (
          <motion.div
            key="welcome-bg"
            className="absolute inset-0 z-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.0, delay: 1.0 } }}
          >
            <svg className="absolute w-0 h-0">
              <defs>
                <filter id="noise">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.8"
                    numOctaves="4"
                    stitchTiles="stitch"
                  />
                </filter>
              </defs>
            </svg>
            <motion.div
              className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-red-900/35 rounded-full"
              style={{ filter: "blur(120px)" }}
              animate={{
                rotate: 360,
                transition: { duration: 40, repeat: Infinity, ease: "linear" },
              }}
            />
            <motion.div
              className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-red-500/20 rounded-full"
              style={{ filter: "blur(100px)" }}
              animate={{
                rotate: -360,
                transition: { duration: 55, repeat: Infinity, ease: "linear" },
              }}
            />
            <div
              className="absolute inset-0 w-full h-full"
              style={{ filter: "url(#noise)", opacity: 0.15 }}
            ></div>
          </motion.div>
        )}
        {showLogin && (
          <motion.div
            key="login-bg"
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.5, delay: 2.0 } }}
            exit={{ opacity: 0, transition: { duration: 1.0 } }}
          >
            <div className="absolute inset-0 bg-white" />
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
                    isHoveringCurve
                      ? { opacity: 0.8, x: 0 }
                      : { opacity: 0, x: -100 }
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
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showLogin ? (
          <motion.div
            key="welcome"
            className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center text-white p-8"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 1.0, ease: "easeInOut" },
            }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <img
                  src="/kantares-logo.jpg"
                  alt="Kantares Logo"
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-6 shadow-2xl"
                />
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="relative h-16 flex items-center justify-center"
              >
                {/* Contenedor para la nueva animación en 3D */}
                <motion.div
                  className="absolute"
                  animate={animatedTextControls}
                  initial="hidden"
                >
                  <div className="flex" style={{ perspective: "1000px" }}>
                    {word.split("").map((letter, index) => (
                      <motion.span
                        key={index}
                        custom={index}
                        variants={flipLetterVariants}
                        className="text-5xl font-bold text-white"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Texto original que se oculta y reaparece con el pulso */}
                <motion.h1
                  className="text-5xl font-bold bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent"
                  initial={{ opacity: 1 }}
                  animate={textControls}
                  variants={{
                    hidden: { opacity: 0, transition: { duration: 0.1 } },
                  }}
                >
                  KANTARES
                </motion.h1>
                <motion.h1
                  className="absolute text-5xl font-bold bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent"
                  initial="initial"
                  animate={finalPulseControls}
                  variants={finalPulseVariants}
                >
                  KANTARES
                </motion.h1>
              </motion.div>

              <motion.div variants={itemVariants}>
                <br />
                <p className="text-red-50 text-lg leading-relaxed opacity-90 max-w-md mx-auto">
                  Bienvenido a nuestro sistema de gestión y control
                </p>
              </motion.div>
              <motion.div variants={itemVariants} className="mt-12">
                <Button
                  onClick={handleAccessClick}
                  className="h-12 px-8 bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded-xl transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.99] shadow-lg hover:shadow-red-500/40 group relative overflow-hidden"
                >
                  <span className="absolute top-0 left-[-100%] w-full h-full bg-white/30 blur-sm transform -skew-x-45 group-hover:left-[150%] transition-all duration-700"></span>
                  Acceder al sistema
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <div key="login" className="absolute inset-0">
            <motion.div
              className="absolute left-0 top-0 w-full lg:w-2/3 h-full flex items-center justify-center p-8 lg:p-16 z-30"
              initial={{ x: "-100%" }}
              animate={{ x: "0%", width: isSuccess ? "100%" : "66.666667%" }}
              transition={{
                x: { duration: 1.4, ease: [0.86, 0, 0.07, 1], delay: 2.0 },
                width: { duration: 0.7, ease: "easeInOut", delay: 0.2 },
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
                  className="absolute right-0 top-0 w-full lg:w-1/2 h-full flex items-center justify-center p-8 z-30"
                  initial={{ x: "100%" }}
                  animate={{ x: "0%" }}
                  exit={{
                    x: "100%",
                    opacity: 0,
                    transition: { duration: 0.5, ease: "easeIn" },
                  }}
                  transition={{
                    duration: 1.4,
                    ease: [0.86, 0, 0.07, 1],
                    delay: 2.2,
                  }}
                >
                  <motion.div
                    className="w-full max-w-sm"
                    variants={formShakeVariants}
                    animate={error ? "shake" : "initial"}
                  >
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50 relative">
                      <motion.div
                        className="relative"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div
                          variants={itemVariants}
                          className="text-center mb-8"
                        >
                          <h2 className="text-2xl font-bold text-gray-800 mb-1">
                            Inicio de sesión
                          </h2>
                          <p className="text-gray-500 text-sm">
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
                                <Alert className="border-red-200 bg-red-50/80 rounded-lg">
                                  <AlertDescription className="text-red-700 text-sm font-medium text-center">
                                    {error}
                                  </AlertDescription>
                                </Alert>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <motion.div
                            variants={itemVariants}
                            className="space-y-2"
                          >
                            <Label
                              htmlFor="username"
                              className="text-sm font-medium text-gray-700"
                            >
                              Usuario
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 h-12 border border-gray-300 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:border-red-500 rounded-lg bg-gray-50 text-gray-800 transition-all duration-300"
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </motion.div>
                          <motion.div
                            variants={itemVariants}
                            className="space-y-2"
                          >
                            <Label
                              htmlFor="password"
                              className="text-sm font-medium text-gray-700"
                            >
                              Contraseña
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 h-12 border border-gray-300 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:border-red-500 rounded-lg bg-gray-50 text-gray-800 transition-all duration-300"
                                required
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                                aria-label={
                                  showPassword ? "Ocultar" : "Mostrar"
                                }
                              >
                                {showPassword ? (
                                  <EyeOff size={20} />
                                ) : (
                                  <Eye size={20} />
                                )}
                              </button>
                            </div>
                          </motion.div>
                          <motion.div variants={itemVariants} className="!mt-8">
                            <Button
                              type="submit"
                              className="w-full h-12 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-base rounded-xl transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.99] shadow-lg hover:shadow-red-500/40 group relative overflow-hidden"
                              disabled={isLoading || isSuccess}
                            >
                              <span className="absolute top-0 left-[-100%] w-full h-full bg-white/30 blur-sm transform -skew-x-45 group-hover:left-[150%] transition-all duration-700"></span>
                              {isLoading || isSuccess ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                  <span>Verificando...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <span>Iniciar Sesión</span>
                                  <ArrowRight
                                    className="group-hover:translate-x-1 transition-transform"
                                    size={20}
                                  />
                                </div>
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
