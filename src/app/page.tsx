import LuckyWheelGame from "@/components/LuckyWheelGame";

export default function Home() {
  return (
    <main className="min-h-screen p-4 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8 text-center">LayerG lucky wheel game with Universal Account</h1>
      <LuckyWheelGame />
    </main>
  );
}
