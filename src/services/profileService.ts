import { api } from "@/lib/api";

export interface ProfileData {
  weight: number | null;
  height: number | null;
  caloriesGoal: number | null;
}

export interface SaveProfileInput {
  weight: number;
  height: number;
  caloriesGoal: number;
}

export async function getProfile(): Promise<ProfileData> {
  const response = await api.get<ProfileData>(
    "/profile",
  );

  return response.data;
}

export async function saveProfile(
  data: SaveProfileInput,
): Promise<ProfileData> {
  const response = await api.put<ProfileData>(
    "/profile",
    data,
  );

  return response.data;
}
