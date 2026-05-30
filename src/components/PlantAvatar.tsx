import { Category } from "@/lib/types";

const CATEGORY_GRADIENT: Record<Category, string> = {
  legume: "from-emerald-100 to-green-200 ring-emerald-200",
  fruit: "from-rose-100 to-pink-200 ring-rose-200",
  aromate: "from-lime-100 to-emerald-200 ring-lime-200",
};

const SIZE_CLASS: Record<string, string> = {
  sm: "h-10 w-10 text-xl",
  md: "h-14 w-14 text-3xl",
  lg: "h-20 w-20 text-5xl",
};

export default function PlantAvatar({
  emoji,
  category,
  size = "md",
}: {
  emoji: string;
  category: Category;
  /** photo URL optionnelle ; si absente, on affiche un emoji illustré */
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ring-1 ${CATEGORY_GRADIENT[category]} ${SIZE_CLASS[size]}`}
      aria-hidden
    >
      {emoji}
    </span>
  );
}
