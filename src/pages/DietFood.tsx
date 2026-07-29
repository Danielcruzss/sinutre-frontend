import {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  DotsThreeVertical,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react";

import { SimpleHeader } from "@/components/layout/SimpleHeader";
import { AddFoodModal } from "@/components/modal/AddFoodModal";
import { EditFoodModal } from "@/components/modal/EditFoodModal";

import {
  deleteFood,
  getFoods,
} from "@/services/foodService";

import type { Food } from "@/types/food";

const CREATE_MODAL_ID = "create-food-modal";
const EDIT_MODAL_ID = "edit-food-modal";

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    axios.isAxiosError<{
      error?: string;
      details?: string[];
    }>(error)
  ) {
    const details = error.response?.data?.details;

    if (Array.isArray(details) && details.length > 0) {
      return details.join(" ");
    }

    const apiMessage = error.response?.data?.error;

    if (typeof apiMessage === "string") {
      return apiMessage;
    }
  }

  return fallback;
}

export function DietFoodPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] =
    useState<Food | null>(null);

  const [loading, setLoading] = useState(true);

  const [deletingFoodId, setDeletingFoodId] =
    useState<number | null>(null);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [success, setSuccess] = useState<
    string | null
  >(null);

  const loadFoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getFoods();

      if (!Array.isArray(data)) {
        throw new Error(
          "A API não retornou uma lista de alimentos.",
        );
      }

      setFoods(data);
    } catch (loadError) {
      console.error(
        "Erro ao carregar alimentos:",
        loadError,
      );

      setFoods([]);

      setError(
        getErrorMessage(
          loadError,
          "Não foi possível carregar os alimentos.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFoods();
  }, [loadFoods]);

  function openCreateModal() {
    setError(null);
    setSuccess(null);

    const modal = document.getElementById(
      CREATE_MODAL_ID,
    ) as HTMLDialogElement | null;

    modal?.showModal();
  }

  function openEditModal(food: Food) {
    setSelectedFood(food);
    setError(null);
    setSuccess(null);

    /*
     * Aguarda o React atualizar o alimento selecionado
     * antes de abrir o modal.
     */
    window.setTimeout(() => {
      const modal = document.getElementById(
        EDIT_MODAL_ID,
      ) as HTMLDialogElement | null;

      modal?.showModal();
    }, 0);
  }

  async function handleDelete(food: Food) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o alimento "${food.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingFoodId(food.id);
      setError(null);
      setSuccess(null);

      await deleteFood(food.id);

      setFoods((currentFoods) =>
        currentFoods.filter(
          (currentFood) =>
            currentFood.id !== food.id,
        ),
      );

      setSuccess(
        `O alimento "${food.name}" foi excluído com sucesso.`,
      );
    } catch (deleteError) {
      console.error(
        "Erro ao excluir alimento:",
        deleteError,
      );

      setError(
        getErrorMessage(
          deleteError,
          "Não foi possível excluir o alimento.",
        ),
      );
    } finally {
      setDeletingFoodId(null);
    }
  }

  async function handleFoodCreated() {
    await loadFoods();

    setSuccess(
      "Alimento cadastrado com sucesso.",
    );
  }

  async function handleFoodUpdated() {
    await loadFoods();

    setSuccess(
      "Alimento alterado com sucesso.",
    );

    setSelectedFood(null);
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-24">
      <SimpleHeader
        title="Dieta"
        subtitle="Gerencie seus alimentos"
      />

      {error && (
        <div
          role="alert"
          className="alert alert-error mt-6"
        >
          <span>{error}</span>

          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setError(null)}
          >
            Fechar
          </button>
        </div>
      )}

      {success && (
        <div
          role="alert"
          className="alert alert-success mt-6"
        >
          <span>{success}</span>

          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setSuccess(null)}
          >
            Fechar
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <span className="loading loading-spinner loading-lg text-primary" />

          <span className="ml-3 text-base-content/60">
            Carregando alimentos...
          </span>
        </div>
      ) : foods.length === 0 ? (
        <div className="card bg-base-100 shadow-sm border border-base-200 mt-6">
          <div className="card-body items-center text-center">
            <h2 className="card-title">
              Nenhum alimento cadastrado
            </h2>

            <p className="text-base-content/60">
              Clique no botão de adicionar para
              cadastrar seu primeiro alimento.
            </p>

            <button
              type="button"
              className="btn btn-primary mt-3"
              onClick={openCreateModal}
            >
              <Plus size={20} weight="bold" />
              Adicionar alimento
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 mt-6">
          {foods.map((food) => (
            <div
              key={food.id}
              className="card bg-base-100 shadow-sm border border-base-200"
            >
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="card-title">
                    {food.name}
                  </h2>

                  <div className="dropdown dropdown-end">
                    <button
                      type="button"
                      tabIndex={0}
                      className="btn btn-ghost btn-sm btn-circle"
                      aria-label={`Ações do alimento ${food.name}`}
                    >
                      <DotsThreeVertical
                        size={24}
                        weight="bold"
                      />
                    </button>

                    <ul
                      tabIndex={0}
                      className="dropdown-content menu bg-base-100 rounded-box z-[100] w-44 p-2 shadow-lg border border-base-200"
                    >
                      <li>
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(food)
                          }
                        >
                          <PencilSimple
                            size={19}
                            weight="bold"
                          />

                          Editar
                        </button>
                      </li>

                      <li>
                        <button
                          type="button"
                          className="text-error"
                          disabled={
                            deletingFoodId === food.id
                          }
                          onClick={() => {
                            void handleDelete(food);
                          }}
                        >
                          {deletingFoodId ===
                          food.id ? (
                            <span className="loading loading-spinner loading-sm" />
                          ) : (
                            <Trash
                              size={19}
                              weight="bold"
                            />
                          )}

                          {deletingFoodId ===
                          food.id
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2">
                  <span>
                    🔥 {food.caloriesPer100g} kcal
                  </span>

                  <span>
                    🍞 {food.carbsPer100g} g
                  </span>

                  <span>
                    🍗 {food.proteinPer100g} g
                  </span>

                  <span>
                    🥑 {food.fatPer100g} g
                  </span>
                </div>

                <p className="text-xs text-base-content/50 mt-2">
                  Valores nutricionais referentes a
                  100 gramas.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        aria-label="Adicionar alimento"
        className="btn btn-primary btn-circle btn-lg fixed bottom-6 right-6 shadow-lg z-50"
        onClick={openCreateModal}
      >
        <Plus size={24} weight="bold" />
      </button>

      <AddFoodModal
        modalId={CREATE_MODAL_ID}
        onCreated={handleFoodCreated}
      />

      <EditFoodModal
        modalId={EDIT_MODAL_ID}
        food={selectedFood}
        onUpdated={handleFoodUpdated}
      />
    </div>
  );
}
