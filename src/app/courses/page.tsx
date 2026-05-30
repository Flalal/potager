import Courses from "@/components/Courses";

export const metadata = {
  title: "Liste de courses — Mon Potager",
};

export default function CoursesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-50">
          Liste de courses du mois
        </h1>
        <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
          Tout ce qu&apos;il y a à acheter ce mois-ci pour semer et planter, avec
          les quantités conseillées et les liens pour comparer les prix.
        </p>
      </div>
      <Courses />
    </div>
  );
}
