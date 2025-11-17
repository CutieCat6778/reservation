import Image from "next/image";
import ReservationForm from "@/components/reservationForm"

export default function Home() {
  return (
    <div className="w-full h-screen flex justify-center items-center flex-col">
      <Image src={"/logo.webp"} alt="Yoake Logo" width={300} height={100} className="max-w-[200px] absolute top-10"/>
      <div className="flex justify-center items-center flex-col">
        <h1 className="text-6xl font-bold">Reservierung</h1>
        <p className="mt-2"> Sichern Sie sich Ihren Platz für ein unvergessliches kulinarisches Erlebnis </p>
      </div>
      <ReservationForm/>
    </div>
  );
}
