import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AddMealCard } from '@/components/cards/AddMealCard';
import { TotalMealsCard } from '@/components/cards/TotalMealsCard';
import { Header } from '@/components/layout/Header';
import { MacroStatsBar } from '@/components/macros/MacroStatsBar';
import { MealFab } from '@/components/meals/MealFab';
import { MealsList } from '@/components/meals/MealsList';
import { MealsTable } from '@/components/meals/MealsTable';
import { AddMealModal } from '@/components/modal/AddMealModal';

import { useAuth } from '@/context/AuthContext';
import { useMealModal } from '@/hooks/useMealModal';
import { api } from '@/lib/api';

import type { Meal } from '@/types/mealSummary';

interface DashboardPageProps {
  drawerId: string;
}

function isSameDay(date: Date, referenceDate: Date) {
  return (
    date.getDate() === referenceDate.getDate() &&
    date.getMonth() === referenceDate.getMonth() &&
    date.getFullYear() === referenceDate.getFullYear()
  );
}

function isSameMonth(date: Date, referenceDate: Date) {
  return (
    date.getMonth() === referenceDate.getMonth() &&
    date.getFullYear() === referenceDate.getFullYear()
  );
}

export function DashboardPage({
  drawerId,
}: DashboardPageProps) {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const modal = useMealModal();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  const loadMeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/meals');

      if (!Array.isArray(response.data)) {
        throw new Error(
          'A API não retornou uma lista de refeições.',
        );
      }

      setMeals(response.data as Meal[]);
    } catch (loadError) {
      console.error(
        'Erro ao carregar refeições:',
        loadError,
      );

      setMeals([]);
      setError(
        'Não foi possível carregar as refeições. Tente atualizar a página.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    void loadMeals();
  }, [authLoading, user, loadMeals]);

  const mealsSummary = useMemo(() => {
    const today = new Date();

    const total = meals.length;

    const todayCount = meals.filter((meal) => {
      const mealDate = new Date(meal.eatTime);

      return isSameDay(mealDate, today);
    }).length;

    const monthCount = meals.filter((meal) => {
      const mealDate = new Date(meal.eatTime);

      return isSameMonth(mealDate, today);
    }).length;

    return {
      total,
      thisMonth: monthCount,
      today: todayCount,
    };
  }, [meals]);

  const macroSummary = useMemo(() => {
    const today = new Date();

    const todayMeals = meals.filter((meal) => {
      const mealDate = new Date(meal.eatTime);

      return isSameDay(mealDate, today);
    });

    return todayMeals.reduce(
      (accumulator, meal) => {
        accumulator.carbs += Number(
          meal.totals?.carbs ?? 0,
        );

        accumulator.proteins += Number(
          meal.totals?.proteins ?? 0,
        );

        accumulator.fats += Number(
          meal.totals?.fats ?? 0,
        );

        accumulator.calories += Number(
          meal.totals?.calories ?? 0,
        );

        return accumulator;
      },
      {
        carbs: 0,
        proteins: 0,
        fats: 0,
        calories: 0,
        caloriesGoal: 1000,
      },
    );
  }, [meals]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary" />

        <span className="ml-3 text-gray-500">
          Carregando...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] gap-3">
        <h2 className="text-xl font-semibold">
          Usuário não encontrado
        </h2>

        <p className="text-gray-500">
          Não foi possível carregar os dados do usuário.
        </p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            window.location.href = '/login';
          }}
        >
          Voltar para o login
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto mb-8">
        <Header
          drawerId={drawerId}
          userName={user.name}
          avatarUrl={user.avatarUrl}
        />

        {error && (
          <div
            role="alert"
            className="alert alert-error"
          >
            <span>{error}</span>

            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                void loadMeals();
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        <MacroStatsBar summary={macroSummary} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-stretch">
          <TotalMealsCard summary={mealsSummary} />

          <AddMealCard
            onSelectCategory={modal.openWith}
          />
        </div>

        <MealsTable meals={meals} />

        <MealsList meals={meals} />
      </div>

      <MealFab
        onSelectCategory={modal.openWith}
      />

      <AddMealModal
        open={modal.open}
        typeMeal={modal.selectedCategory}
        onClose={modal.close}
        onSave={modal.close}
        onMealCreated={loadMeals}
      />
    </>
  );
}
