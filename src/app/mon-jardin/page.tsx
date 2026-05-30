import MonJardin from "@/components/MonJardin";
import PushToggle from "@/components/PushToggle";

export const metadata = {
  title: "Mon jardin — Mon Potager",
};

export default function MonJardinPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900">Mon jardin</h1>
        <p className="mt-1 text-sm text-emerald-800/80">
          Les plantes que vous avez plantées, et les actions à prévoir. Vos
          données sont enregistrées sur le serveur du foyer.
        </p>
      </div>
      <div className="rounded-xl border border-emerald-100 bg-white p-4">
        <PushToggle />
      </div>
      <MonJardin />
    </div>
  );
}
