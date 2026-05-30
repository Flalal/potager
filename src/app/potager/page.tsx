import PotagerPlanner from "@/components/PotagerPlanner";

export const metadata = {
  title: "Plan du potager — Mon Potager",
};

export default function PotagerPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900">Plan du potager</h1>
        <p className="mt-1 text-sm text-emerald-800/80">
          Dessinez vos carrés et placez vos plantes pour visualiser où tout est
          planté. L&apos;outil vous prévient si deux voisines ne s&apos;entendent
          pas.
        </p>
      </div>
      <PotagerPlanner />
    </div>
  );
}
