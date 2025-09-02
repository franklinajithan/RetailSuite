import BackofficeTopBar from "@/components/BackofficeTopBar";
export default function Page(){
  return (
    <div className="min-h-[60vh]">
      <BackofficeTopBar />
      <main className="p-8">Open the menus on the right →</main>
    </div>
  );
}