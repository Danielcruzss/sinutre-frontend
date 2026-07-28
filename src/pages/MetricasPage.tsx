import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Meal } from "@/types/meal";
import { Header } from "@/components/layout/Header";

interface MetricsPageProps {
  drawerId: string;
}

export function MetricsPage({ drawerId }: MetricsPageProps) {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMeals() {
      try {
        const response = await api.get('/meals');
        setMeals(response.data);
      } catch (error) {
        console.error('Erro ao carregar refeições:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMeals();
  }, []);

  // Cálculo IMC
  const weight = (user as any)?.weight || 70;
  const height = (user as any)?.height || 1.75;

  const imc = useMemo(() => {
    if (!weight || !height) return 0;
    return Number((weight / (height * height)).toFixed(1));
  }, [weight, height]);

  const imcClassification = useMemo(() => {
    if (imc < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-500' };
    if (imc >= 18.5 && imc < 25) return { text: 'Peso normal (Saudável)', color: 'text-green-600' };
    if (imc >= 25 && imc < 30) return { text: 'Sobrepeso', color: 'text-yellow-600' };
    return { text: 'Obesidade', color: 'text-red-600' };
  }, [imc]);

  // Média Calórica dos últimos 7 dias 
  const calorieMetrics = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const recentMeals = meals.filter((meal: any) => {
      const mealDate = new Date(meal.eatTime || meal.date || Date.now());
      return mealDate >= sevenDaysAgo && mealDate <= today;
    });

    const totalCalories = recentMeals.reduce((acc, meal: any) => {
      const calories = meal.totals?.calories || meal.calories || 0;
      return acc + calories;
    }, 0);
    
    const average = Math.round(totalCalories / 7);
    const goal = (user as any)?.caloriesGoal || 2000;

    const status = average <= goal ? 'Dentro da meta' : 'Acima da meta';

    return { average, goal, status };
  }, [meals, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <span className="text-gray-500">Carregando métricas...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto mb-8 p-4 lg:p-0">
      <Header
        drawerId={drawerId}
        userName={user?.name || 'Usuário'}
        avatarUrl={user?.avatarUrl || ''}
      />

      <h2 className="text-2xl font-bold tracking-tight mt-2">Métricas e Desempenho</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        

        <div className="card bg-base-100 shadow-sm border border-base-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Índice de Massa Corporal (IMC)</h3>
            <p className="text-sm text-gray-500 mt-1">Calculado com base no seu peso e altura cadastrados.</p>
          </div>

          <div className="my-6 text-center">
            <span className="text-5xl font-extrabold tracking-tight">{imc}</span>
            <div className={`mt-3 font-semibold text-base ${imcClassification.color}`}>
              Faixa: {imcClassification.text}
            </div>
          </div>

          <div className="text-xs text-gray-400 bg-base-200 p-3 rounded-lg">
            Referência: Abaixo de 18,5 (Abaixo) | 18,5 - 24,9 (Normal) | 25 - 29,9 (Sobrepeso) | Acima de 30 (Obesidade)
          </div>
        </div>


        <div className="card bg-base-100 shadow-sm border border-base-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Média Calórica (Últimos 7 Dias)</h3>
            <p className="text-sm text-gray-500 mt-1">Comparativo entre o consumo médio diário e a sua meta.</p>
          </div>

          <div className="my-6 text-center">
            <div className="text-5xl font-extrabold tracking-tight">
              {calorieMetrics.average} <span className="text-xl font-normal text-gray-500">kcal/dia</span>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Meta estabelecida: <span className="font-bold">{calorieMetrics.goal} kcal</span>
            </div>
            <div className={`mt-2 font-semibold text-sm ${calorieMetrics.average <= calorieMetrics.goal ? 'text-green-600' : 'text-red-500'}`}>
              Situação: {calorieMetrics.status}
            </div>
          </div>

          <div className="text-xs text-gray-400 bg-base-200 p-3 rounded-lg">
            Média calculada automaticamente com base nas refeições registradas na sua conta nos últimos 7 dias.
          </div>
        </div>

      </div>
    </div>
  );
}



