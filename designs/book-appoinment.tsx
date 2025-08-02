"use client";

import { BookingFlow } from "./booking-flow";
import { useRouter } from "next/navigation";

export default function BookPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return <BookingFlow onBack={handleBack} />;
}
