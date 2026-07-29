export interface UserSettings {
  weight: number | null;
  height: number | null;
  caloriesGoal: number | null;
}

const USER_SETTINGS_KEY = "sinutre.user-settings";

const EMPTY_SETTINGS: UserSettings = {
  weight: null,
  height: null,
  caloriesGoal: null,
};

function toPositiveNumber(value: unknown): number | null {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return number;
}

export function getUserSettings(): UserSettings {
  if (typeof window === "undefined") {
    return { ...EMPTY_SETTINGS };
  }

  try {
    const storedSettings = localStorage.getItem(
      USER_SETTINGS_KEY,
    );

    if (!storedSettings) {
      return { ...EMPTY_SETTINGS };
    }

    const parsedSettings = JSON.parse(
      storedSettings,
    ) as Partial<UserSettings>;

    return {
      weight: toPositiveNumber(parsedSettings.weight),
      height: toPositiveNumber(parsedSettings.height),
      caloriesGoal: toPositiveNumber(
        parsedSettings.caloriesGoal,
      ),
    };
  } catch (error) {
    console.error(
      "Erro ao carregar configurações:",
      error,
    );

    return { ...EMPTY_SETTINGS };
  }
}

export function saveUserSettings(
  settings: UserSettings,
): void {
  localStorage.setItem(
    USER_SETTINGS_KEY,
    JSON.stringify(settings),
  );
}
