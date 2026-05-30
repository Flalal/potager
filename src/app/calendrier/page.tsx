import CalendarGrid from "@/components/CalendarGrid";
import PrintButton from "@/components/PrintButton";

export const metadata = {
  title: "Calendrier — Mon Potager",
};

export default function CalendrierPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-50">
            Calendrier de l&apos;année
          </h1>
          <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
            Pour chaque plante, repérez en un coup d&apos;œil quand semer,
            planter et récolter.
          </p>
        </div>
        <PrintButton label="Imprimer le calendrier" />
      </div>
      <CalendarGrid />
    </div>
  );
}
