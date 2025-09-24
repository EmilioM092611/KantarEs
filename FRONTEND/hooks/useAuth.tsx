import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(requireAuth: boolean = true) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authData = localStorage.getItem("auth");
      const token = localStorage.getItem("token");

      if (requireAuth && (!authData || !token)) {
        router.push("/login");
        return;
      }

      if (authData) {
        setUser(JSON.parse(authData));
      }

      setLoading(false);
    };

    checkAuth();
  }, [requireAuth, router]);

  return { user, loading };
}
