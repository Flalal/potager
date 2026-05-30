import MonJardin from "@/components/MonJardin";

export const metadata = {
  title: "Mon jardin — Mon Potager",
};

export default function MonJardinPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900">Mon jardin</h1>
        <p className="mt-1 text-sm text-emerald-800/80">
          Les plantes que vous avez plantées, et les actions à prévoir. Ces
          données restent sur votre appareil.
        </p>
      </div>
      <MonJardin />
    </div>
  );
}
