import Image from "next/image";
import ReservationForm from "@/components/reservationForm";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-background sm:px-4 pt-8 pb-12 md:justify-center">
      {/* Logo – stays nicely sized */}
      <div className="w-full flex justify-center mb-10 pt-safe">
        <Image
          src="/logo.webp"
          alt="Yoake Logo"
          width={300}
          height={100}
          className="h-12 w-auto sm:h-14 md:h-16 object-contain"
          priority
        />
      </div>

      {/* Heading */}
      <div className="text-center mb-12 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
          Reservierung
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
          Sichern Sie sich Ihren Platz für ein unvergessliches kulinarisches Erlebnis
        </p>
      </div>

      {/* Flexible form container */}
      <div className="w-full max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-2 sm:px-0">
        <ReservationForm />
      </div>

      {/* Extra breathing room at the bottom (especially for mobile keyboards) */}
      <div className="h-20" />
    </div>
  );
}
