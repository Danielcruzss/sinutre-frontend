import { useState, useEffect, useMemo } from 'react';
import { SignOut } from '@phosphor-icons/react';
import { AddMealCard } from '@/components/cards/AddMealCard';
import { TotalMealsCard } from '@/components/cards/TotalMealsCard';
import { Header } from '@/components/layout/Header';
import { MacroStatsBar } from '@/components/macros/MacroStatsBar';
import { MealFab } from '@/components/meals/MealFab';
import { MealsList } from '@/components/meals/MealsList';
import { MealsTable } from '@/components/meals/MealsTable';
import { AddMealModal } from '@/components/modal/AddMealModal';
import { useAuth } from '@/context/AuthContext';
import { Meal } from '@/types/mealSummary';
import { api } from '@/lib/api';

import {
  //MACRO_SUMMARY,
  //MEALS_SUMMARY,
  // RECENT_MEALS,
  // SAMPLE_MEAL_ITEMS,
} from '@/data/mockData';
import { useMealModal } from '@/hooks/useMealModal';

interface DashboardPageProps {
  drawerId: string;
}

//const MODAL_MACROS = {
//  carbs: 0,
//  proteins: 0,
//  fats: 0,
//  calories: 0,
//};

export function DashboardPage({ drawerId }: DashboardPageProps) {
  const { user } = useAuth();
  if (!user){
    return <></>
  }

  function handleLogout () {
    localStorage.clear();
    window.location.href = '/';
  }
  if (!user){
    return <> </>
  }

  const modal = useMealModal();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMeals() {
    try {
      const response = await api.get('/meals');
      setMeals(response.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeals();
  }, []);

  const mealsSummary = useMemo(() => {
    const today = new Date();

    const total = meals.length;

    const todayCount = meals.filter((meal) => {
      const date = new Date(meal.eatTime);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;

    const monthCount = meals.filter((meal) => {
      const date = new Date(meal.eatTime);

      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;

    return {
      total,
      thisMonth: monthCount,
      today: todayCount,
    };
  }, [meals]);

  const macroSummary = useMemo(() => {
    const today = new Date();
    return meals.filter((meal) => {
      const date = new Date(meal.eatTime);
      return (
        date.getDay() === today.getDay() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).reduce(
      (acc, meal) => {
        acc.carbs += meal.totals.carbs;
        acc.proteins += meal.totals.proteins;
        acc.fats += meal.totals.fats;
        acc.calories += meal.totals.calories;

        return acc;
      },
      {
        carbs: 0,
        proteins: 0,
        fats: 0,
        calories: 0,

        caloriesGoal: 1000, //ainda não veio do banco de dados
      },
    );
  }, [meals]);


  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <span className="text-gray-500">Carregando...</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-semibold transition-colors shadow-sm cursor-pointer"
      >
        <SignOut size={20} weight="bold" />
        Sair
      </button>

      <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto mb-8">
        <Header
          drawerId={drawerId}
          userName={user.name}
          avatarUrl={user.avatarUrl}
        />

        <MacroStatsBar summary={macroSummary} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-stretch">
          <TotalMealsCard summary={mealsSummary} />
          <AddMealCard onSelectCategory={modal.openWith} />
        </div>

        <MealsTable meals={meals} />
        <MealsList meals={meals} />
      </div>

      <MealFab onSelectCategory={modal.openWith} />

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