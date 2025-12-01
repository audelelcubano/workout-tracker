import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/Auth";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    weight?: number;
    height?: number;
    age?: number;
    goal?: string;
    experience?: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const ref = doc(db, "users", user.uid, "profile", "info");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data() as any);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  return { profile, loading };
}
