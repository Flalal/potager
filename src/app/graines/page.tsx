import SeedInventory from "@/components/SeedInventory";

export const metadata = {
  title: "Mes graines — Mon Potager",
};

export default function GrainesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-50">
          Mes graines
        </h1>
        <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
          Cochez les plantes dont vous avez les graines (ou les plants). Le plan
          du potager pourra alors ne proposer que celles-ci.
        </p>
      </div>
      <SeedInventory />
    </div>
  );
}
