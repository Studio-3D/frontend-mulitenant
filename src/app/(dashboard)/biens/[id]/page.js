"use client";
import { useParams } from "next/navigation";
import BienDetails from "@/components/biens/BienDetails";

export default function BienDetailPage() {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto py-6">
      <BienDetails id={id} />
    </div>
  );
}
