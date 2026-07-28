import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Meal } from "@/types/meal";
import { Header } from "@/components/layout/Header";
import { Interface } from "readline";

interface MetricasPageProps {
    drawerId: string;
}

export function MetricsPage({ drawerId }: MetricsPageProps) {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
}

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

  //Calculo IMC
  const weight = user?weight || 70;
  const height = user?height || 1.75;

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

  // 2. Média Calórica dos últimos 7 dias
  