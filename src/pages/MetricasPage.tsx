import { useEffect, useMemo, useState, } from "react";

import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

import type { Meal } from "@/types/mealSummary";

interface MetricsPageProps {
  drawerId: string;
}

interface MetricsMeal extends Meal {
  date?: string;
  calories?: number | string;
}

function toValidNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function getMealDate(
  meal: MetricsMeal,
): Date | null {
  const dateValue = meal.eatTime || meal.date;

  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function MetricsPage({
  drawerId,
}: MetricsPageProps) {
  const { user } = useAuth();

  const [meals, setMeals] = useState<
    MetricsMeal[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    let componentMounted = true;

    async function loadMeals() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await api.get<MetricsMeal[]>(
            "/meals",
          );

        if (!Array.isArray(response.data)) {
          throw new Error(
            "A API não retornou uma lista de refeições.",
          );
        }

        if (componentMounted) {
          setMeals(response.data);
        }
      } catch (loadError) {
        console.error(
          "Erro ao carregar refeições:",
          loadError,
        );

        if (componentMounted) {
          setMeals([]);

          setError(
            "Não foi possível carregar as métricas.",
          );
        }
      } finally {
        if (componentMounted) {
          setLoading(false);
        }
      }
    }

    void loadMeals();

    return () => {
      componentMounted = false;
    };
  }, []);

  const weight = toValidNumber(
    user?.weight,
  );

  const height = useMemo(() => {
    const storedHeight = toValidNumber(
      user?.height,
    );

    return storedHeight > 3
      ? storedHeight / 100
      : storedHeight;
  }, [user?.height]);

  const imc = useMemo(() => {
    if (weight <= 0 || height <= 0) {
      return null;
    }

    return Number(
      (
        weight /
        (height * height)
      ).toFixed(1),
    );
  }, [weight, height]);

  const imcClassification = useMemo(() => {
    if (imc === null) {
      return {
        text: "Dados não cadastrados",
        color: "text-gray-500",
      };
    }

    if (imc < 18.5) {
      return {
        text: "Abaixo do peso",
        color: "text-blue-500",
      };
    }

    if (imc < 25) {
      return {
        text: "Peso normal (Saudável)",
        color: "text-green-600",
      };
    }

    if (imc < 30) {
      return {
        text: "Sobrepeso",
        color: "text-yellow-600",
      };
    }

    return {
      text: "Obesidade",
      color: "text-red-600",
    };
  }, [imc]);

  const calorieMetrics = useMemo(() => {
    const today = new Date();

    const firstDay = new Date(today);

    firstDay.setHours(0, 0, 0, 0);
    firstDay.setDate(
      firstDay.getDate() - 6,
    );

    const recentMeals = meals.filter(
      (meal) => {
        const mealDate =
          getMealDate(meal);

        if (!mealDate) {
          return false;
        }

        return (
          mealDate >= firstDay &&
          mealDate <= today
        );
      },
    );

    const totalCalories =
      recentMeals.reduce(
        (total, meal) => {
          const calories =
            toValidNumber(
              meal.totals?.calories ??
                meal.calories ??
                0,
            );

          return total + calories;
        },
        0,
      );

    const average = Math.round(
      totalCalories / 7,
    );

    const configuredGoal =
      toValidNumber(
        user?.caloriesGoal,
      );

    const goal =
      configuredGoal > 0
        ? configuredGoal
        : 2000;

    const status =
      average <= goal
        ? "Dentro da meta"
        : "Acima da meta";

    return {
      average,
      goal,
      status,
    };
  }, [meals, user?.caloriesGoal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary" />

        <span className="ml-3 text-gray-500">
          Carregando métricas...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto mb-8 p-4 lg:p-0">
      <Header
        drawerId={drawerId}
        userName={
          user?.name || "Usuário"
        }
        avatarUrl={
          user?.avatarUrl || ""
        }
      />

      <h2 className="text-2xl font-bold tracking-tight mt-2">
        Métricas e Desempenho
      </h2>

      {error && (
        <div
          role="alert"
          className="alert alert-error"
        >
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-sm border border-base-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">
              Índice de Massa Corporal
              (IMC)
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Calculado com base no seu
              peso e altura cadastrados.
            </p>
          </div>

          <div className="my-6 text-center">
            <span className="text-5xl font-extrabold tracking-tight">
              {imc ?? "--"}
            </span>

            <div
              className={`mt-3 font-semibold text-base ${imcClassification.color}`}
            >
              Faixa:{" "}
              {imcClassification.text}
            </div>
          </div>

          <div className="text-xs text-gray-400 bg-base-200 p-3 rounded-lg">
            Referência: abaixo de 18,5
            (abaixo do peso) | 18,5 a
            24,9 (normal) | 25 a 29,9
            (sobrepeso) | 30 ou mais
            (obesidade).
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">
              Média Calórica (Últimos
              7 Dias)
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Comparativo entre o
              consumo médio diário e a
              sua meta.
            </p>
          </div>

          <div className="my-6 text-center">
            <div className="text-5xl font-extrabold tracking-tight">
              {calorieMetrics.average}

              <span className="text-xl font-normal text-gray-500">
                {" "}
                kcal/dia
              </span>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              Meta estabelecida:{" "}
              <span className="font-bold">
                {calorieMetrics.goal} kcal
              </span>
            </div>

            <div
              className={`mt-2 font-semibold text-sm ${
                calorieMetrics.average <=
                calorieMetrics.goal
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              Situação:{" "}
              {calorieMetrics.status}
            </div>
          </div>

          <div className="text-xs text-gray-400 bg-base-200 p-3 rounded-lg">
            Média calculada
            automaticamente com base
            nas refeições registradas
            nos últimos sete dias.
          </div>
        </div>
      </div>
    </div>
  );
}



