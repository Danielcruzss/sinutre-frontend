import { api } from "@/lib/api";

import type { Food } from "@/types/food";

export type FoodInput = Omit<Food, "id">;

export async function getFoods(): Promise<Food[]> {
  const response = await api.get<Food[]>("/foods");

  return response.data;
}

export async function createFood(
  food: FoodInput,
): Promise<Food> {
  const response = await api.post<Food>(
    "/foods",
    food,
  );

  return response.data;
}

export async function updateFood(
  foodId: number,
  food: FoodInput,
): Promise<Food> {
  const response = await api.patch<Food>(
    `/foods/${foodId}`,
    food,
  );

  return response.data;
}

export async function deleteFood(
  foodId: number,
): Promise<void> {
  await api.delete(`/foods/${foodId}`);
}

export async function searchFoods(
  search: string,
): Promise<Food[]> {
  const response = await api.get<Food[]>(
    "/foods",
    {
      params: {
        search,
      },
    },
  );

  return response.data;
}
