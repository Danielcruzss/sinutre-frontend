import type { MacroSummary } from "@/types/meal";

import { MacroStat } from "./MacroStat";

interface MacroStatsBarProps {
  summary: MacroSummary;
}

export function MacroStatsBar({
  summary,
}: MacroStatsBarProps) {
  const hasCaloriesGoal =
    summary.caloriesGoal > 0;

  const caloriesGoalExceeded =
    hasCaloriesGoal &&
    summary.calories > summary.caloriesGoal;

  return (
    <section className="stats stats-vertical lg:stats-horizontal shadow-sm w-full bg-base-100">
      <MacroStat
        label="Carboidratos"
        value={summary.carbs}
        unit="g"
      />

      <MacroStat
        label="Proteínas"
        value={summary.proteins}
        unit="g"
      />

      <MacroStat
        label="Gordura"
        value={summary.fats}
        unit="g"
      />

      <MacroStat
        label="Calorias / Meta Diária"
        value={summary.calories}
        unit=" kcal"
        variant={
          caloriesGoalExceeded
            ? "danger"
            : "highlight"
        }
        goal={
          hasCaloriesGoal
            ? summary.caloriesGoal
            : undefined
        }
        hint={
          hasCaloriesGoal
            ? "kcal"
            : "Meta ainda não cadastrada"
        }
      />
    </section>
  );
}
