import Journal from "@/components/Journal";

export const metadata = {
  title: "Journal — Mon Potager",
};

export default function JournalPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-50">
          Journal de jardin
        </h1>
        <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
          Gardez la trace de vos récoltes, semis et observations au fil de la
          saison.
        </p>
      </div>
      <Journal />
    </div>
  );
}
