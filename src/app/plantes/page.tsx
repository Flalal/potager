import PlantList from "@/components/PlantList";

export const metadata = {
  title: "Toutes les plantes — Mon Potager",
};

export default function PlantesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900">Toutes les plantes</h1>
        <p className="mt-1 text-sm text-emerald-800/80">
          Parcourez le catalogue et ouvrez une fiche pour les conseils de
          culture.
        </p>
      </div>
      <PlantList />
    </div>
  );
}
