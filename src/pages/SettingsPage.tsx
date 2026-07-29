import { useEffect, useState, type FormEvent, } from "react";

import axios from "axios";

import { CheckCircle, GithubLogo, SignOut, } from "@phosphor-icons/react";

import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { clearToken } from "@/lib/api";

import {
  getProfile,
  saveProfile,
} from "@/services/profileService";

interface SettingsPageProps {
  drawerId: string;
}

function parseNumber(value: string): number | null {
  const normalizedValue = value.replace(",", ".");
  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return parsedValue;
}

function getErrorMessage(error: unknown): string {
  if (
    axios.isAxiosError<{
      error?: string;
      details?: string[];
    }>(error)
  ) {
    const details = error.response?.data?.details;

    if (
      Array.isArray(details) &&
      details.length > 0
    ) {
      return details.join(" ");
    }

    const apiMessage =
      error.response?.data?.error;

    if (typeof apiMessage === "string") {
      return apiMessage;
    }
  }

  return "Não foi possível salvar os dados.";
}

export function SettingsPage({
  drawerId,
}: SettingsPageProps) {
  const { user, refreshUser } = useAuth();

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [caloriesGoal, setCaloriesGoal] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const profile = await getProfile();

        if (!mounted) {
          return;
        }

        setWeight(
          profile.weight?.toString() ?? "",
        );

        setHeight(
          profile.height?.toString() ?? "",
        );

        setCaloriesGoal(
          profile.caloriesGoal?.toString() ?? "",
        );
      } catch (loadError) {
        console.error(
          "Erro ao carregar perfil:",
          loadError,
        );

        if (mounted) {
          setError(
            "Não foi possível carregar os dados do usuário.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSaved(false);

    const parsedWeight = parseNumber(weight);
    const parsedHeight = parseNumber(height);
    const parsedCaloriesGoal =
      parseNumber(caloriesGoal);

    if (
      parsedWeight === null ||
      parsedWeight < 20 ||
      parsedWeight > 500
    ) {
      setError(
        "O peso deve estar entre 20 e 500 kg.",
      );

      return;
    }

    if (
      parsedHeight === null ||
      parsedHeight < 50 ||
      parsedHeight > 250
    ) {
      setError(
        "A altura deve estar entre 50 e 250 cm.",
      );

      return;
    }

    if (
      parsedCaloriesGoal === null ||
      !Number.isInteger(parsedCaloriesGoal) ||
      parsedCaloriesGoal < 500 ||
      parsedCaloriesGoal > 10000
    ) {
      setError(
        "A meta calórica deve ser um número inteiro entre 500 e 10000 kcal.",
      );

      return;
    }

    try {
      setSaving(true);

      const profile = await saveProfile({
        weight: parsedWeight,
        height: parsedHeight,
        caloriesGoal: parsedCaloriesGoal,
      });

      setWeight(profile.weight?.toString() ?? "");
      setHeight(profile.height?.toString() ?? "");

      setCaloriesGoal(
        profile.caloriesGoal?.toString() ?? "",
      );

      await refreshUser();

      setSaved(true);
    } catch (saveError) {
      console.error(
        "Erro ao salvar perfil:",
        saveError,
      );

      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
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
            Configurações salvas no banco de dados.
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
                    alt={`Avatar de ${
                      user.name || "usuário"
                    }`}
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
            Esses dados serão armazenados no banco
            e utilizados nos cálculos nutricionais.
          </p>

          {loading ? (
            <div className="flex items-center justify-center min-h-[250px]">
              <span className="loading loading-spinner loading-lg text-primary" />

              <span className="ml-3 text-base-content/60">
                Carregando dados...
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                <label className="form-control">
                  <span className="label-text font-medium mb-2">
                    Peso
                  </span>

                  <div className="join w-full">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="20"
                      max="500"
                      step="0.1"
                      value={weight}
                      onChange={(event) =>
                        setWeight(event.target.value)
                      }
                      placeholder="Ex.: 70"
                      className="input input-bordered join-item w-full"
                      disabled={saving}
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
                      disabled={saving}
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
                      disabled={saving}
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
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar configurações"
                  )}
                </button>
              </div>
            </>
          )}
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
