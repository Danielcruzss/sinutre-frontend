import {
  useEffect, useState, type FormEvent,} from "react";

import {
  CheckCircle, GithubLogo, SignOut, } from "@phosphor-icons/react";

import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { clearToken } from "@/lib/api";
import { getUserSettings, saveUserSettings, } from "@/lib/userSettings";

interface SettingsPageProps {
  drawerId: string;
}

function parsePositiveNumber(
  value: string,
): number | null {
  const normalizedValue = value.replace(",", ".");
  const number = Number(normalizedValue);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return number;
}

export function SettingsPage({
  drawerId,
}: SettingsPageProps) {
  const { user } = useAuth();

  const [initialSettings] = useState(() =>
    getUserSettings(),
  );

  const [weight, setWeight] = useState(
    initialSettings.weight?.toString() ?? "",
  );

  const [height, setHeight] = useState(
    initialSettings.height?.toString() ?? "",
  );

  const [caloriesGoal, setCaloriesGoal] =
    useState(
      initialSettings.caloriesGoal?.toString() ??
        "",
    );

  const [saved, setSaved] = useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!saved) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSaved(false);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [saved]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSaved(false);

    const parsedWeight =
      parsePositiveNumber(weight);

    const parsedHeight =
      parsePositiveNumber(height);

    const parsedCaloriesGoal =
      parsePositiveNumber(caloriesGoal);

    if (!parsedWeight) {
      setError("Informe um peso válido.");
      return;
    }

    if (!parsedHeight) {
      setError("Informe uma altura válida.");
      return;
    }

    if (!parsedCaloriesGoal) {
      setError(
        "Informe uma meta calórica válida.",
      );
      return;
    }

    saveUserSettings({
      weight: parsedWeight,
      height: parsedHeight,
      caloriesGoal: parsedCaloriesGoal,
    });

    setSaved(true);
  }

  function handleLogout() {
    clearToken();
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto mb-8 p-4 lg:p-0">
      <Header
        drawerId={drawerId}
        userName={user?.name || "Usuário"}
        avatarUrl={user?.avatarUrl || ""}
      />

      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Configurações
        </h2>

        <p className="mt-1 text-sm text-base-content/60">
          Gerencie seus dados pessoais e suas
          metas nutricionais.
        </p>
      </div>

      {saved && (
        <div
          role="alert"
          className="alert alert-success"
        >
          <CheckCircle size={22} weight="fill" />

          <span>
            Configurações salvas com sucesso.
          </span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="alert alert-error"
        >
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card bg-base-100 border border-base-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold">
            Perfil
          </h3>

          <p className="text-sm text-base-content/60 mt-1">
            Informações obtidas da sua conta do
            GitHub.
          </p>

          <div className="flex flex-col items-center text-center mt-6">
            <div className="avatar">
              <div className="w-24 rounded-full border border-base-300">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`Avatar de ${user.name}`}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-base-200">
                    <GithubLogo size={40} />
                  </div>
                )}
              </div>
            </div>

            <h4 className="font-bold text-xl mt-4">
              {user?.name || "Usuário"}
            </h4>

            <div className="flex items-center gap-2 mt-2 text-sm text-base-content/60">
              <GithubLogo size={18} />

              <span>
                {user?.githubLogin
                  ? `@${user.githubLogin}`
                  : "GitHub"}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-base-200 p-4 text-sm text-base-content/60">
            O nome e a foto são controlados pela
            sua conta do GitHub.
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="card bg-base-100 border border-base-200 shadow-sm p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold">
            Dados de saúde
          </h3>

          <p className="text-sm text-base-content/60 mt-1">
            Esses dados serão utilizados para
            calcular seu IMC e comparar o consumo
            calórico.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <label className="form-control">
              <span className="label-text font-medium mb-2">
                Peso
              </span>

              <div className="join w-full">
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="500"
                  step="0.1"
                  value={weight}
                  onChange={(event) =>
                    setWeight(event.target.value)
                  }
                  placeholder="Ex.: 70"
                  className="input input-bordered join-item w-full"
                  required
                />

                <span className="join-item flex items-center px-4 bg-base-200 border border-base-300">
                  kg
                </span>
              </div>
            </label>

            <label className="form-control">
              <span className="label-text font-medium mb-2">
                Altura
              </span>

              <div className="join w-full">
                <input
                  type="number"
                  inputMode="decimal"
                  min="50"
                  max="250"
                  step="1"
                  value={height}
                  onChange={(event) =>
                    setHeight(event.target.value)
                  }
                  placeholder="Ex.: 175"
                  className="input input-bordered join-item w-full"
                  required
                />

                <span className="join-item flex items-center px-4 bg-base-200 border border-base-300">
                  cm
                </span>
              </div>
            </label>

            <label className="form-control md:col-span-2">
              <span className="label-text font-medium mb-2">
                Meta calórica diária
              </span>

              <div className="join w-full">
                <input
                  type="number"
                  inputMode="numeric"
                  min="500"
                  max="10000"
                  step="1"
                  value={caloriesGoal}
                  onChange={(event) =>
                    setCaloriesGoal(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: 2000"
                  className="input input-bordered join-item w-full"
                  required
                />

                <span className="join-item flex items-center px-4 bg-base-200 border border-base-300">
                  kcal
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="btn btn-primary"
            >
              Salvar configurações
            </button>
          </div>
        </form>
      </div>

      <section className="card bg-base-100 border border-error/30 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              Conta
            </h3>

            <p className="text-sm text-base-content/60 mt-1">
              Encerre sua sessão neste dispositivo.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-error btn-outline"
          >
            <SignOut size={20} weight="bold" />
            Sair da conta
          </button>
        </div>
      </section>
    </div>
  );
}
