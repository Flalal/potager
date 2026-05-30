import PotagerPlanner from "@/components/PotagerPlanner";
import PrintButton from "@/components/PrintButton";

export const metadata = {
  title: "Plan du potager — Mon Potager",
};

export default function PotagerPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-50">
            Plan du potager
          </h1>
          <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
            Dessinez vos carrés et placez vos plantes pour visualiser où tout est
            planté. L&apos;outil vous prévient si deux voisines ne s&apos;entendent
            pas, et signale les rotations à éviter.
          </p>
        </div>
        <PrintButton label="Imprimer le plan" />
      </div>
      <PotagerPlanner />
    </div>
  );
}
