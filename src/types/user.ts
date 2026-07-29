export interface User {
  id: number;
  githubLogin: string;
  name: string;
  avatarUrl: string;
  weight: number | null;
  height: number | null;
  caloriesGoal: number | null;
}
