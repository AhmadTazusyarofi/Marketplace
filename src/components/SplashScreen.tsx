import { useEffect, useState } from "react";
import { ReactTyped } from "react-typed";
import logo from "@/assets/logo.png";

type SplashScreenProps = {
  duration?: number; // minimal splash tampil (ms)
  onDone?: () => void; // dipanggil saat splash selesai
};

export default function SplashScreen({
  duration = 1500,
  onDone,
}: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      const t2 = setTimeout(() => onDone?.(), 250); // beri waktu fade-out
      return () => clearTimeout(t2);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onDone]);

  return (
    <div
      className={[
        "fixed inset-0 z-[100] flex items-center justify-center bg-background",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      aria-label="Memuat aplikasi"
    >
      <div className="flex flex-col items-center gap-4">
        <img
          src={logo}
          alt="AhmadCorp Logo"
          className="h-[82px] w-[82px] md:h-[90px] md:w-[90px] object-contain drop-shadow-sm"
          draggable={false}
        />

        <div className="text-center">
          <div className="text-xl md:text-2xl font-semibold tracking-wide">
            <ReactTyped
              strings={["AHMADCORP MARKETPLACE"]}
              typeSpeed={50} // kecepatan mengetik
              backSpeed={30} // tak perlu backspace
              backDelay={999999} // pastikan tidak backspace
              showCursor // tampilkan kursor
              cursorChar="|" // karakter kursor
              loop={false} // ketik sekali saja
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Memuat pengalaman belanja terbaik…
          </div>
        </div>
      </div>
    </div>
  );
}
