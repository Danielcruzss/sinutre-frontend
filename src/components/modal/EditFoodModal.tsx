import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import axios from "axios";

import { updateFood } from "@/services/foodService";

import type { Food } from "@/types/food";

interface EditFoodModalProps {
  modalId: string;
  food: Food | null;
  onUpdated: () => Promise<void> | void;
}

interface FoodFormData {
  name: string;
  caloriesPer100g: string;
  carbsPer100g: string;
  proteinPer100g: string;
  fatPer100g: string;
}

const EMPTY_FORM: FoodFormData = {
  name: "",
  caloriesPer100g: "",
  carbsPer100g: "",
  proteinPer100g: "",
  fatPer100g: "",
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const details = error.response?.data?.details;

    if (Array.isArray(details) && details.length > 0) {
      return details.join(" ");
    }

    const apiError = error.response?.data?.error;

    if (typeof apiError === "string") {
      return apiError;
    }
  }

  return "Não foi possível alterar o alimento.";
}

export function EditFoodModal({
  modalId,
  food,
  onUpdated,
}: EditFoodModalProps) {
  const [form, setForm] =
    useState<FoodFormData>(EMPTY_FORM);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!food) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      name: food.name,
      caloriesPer100g:
        food.caloriesPer100g.toString(),
      carbsPer100g:
        food.carbsPer100g.toString(),
      proteinPer100g:
        food.proteinPer100g.toString(),
      fatPer100g:
        food.fatPer100g.toString(),
    });

    setError(null);
  }, [food]);

  function updateField(
    field: keyof FoodFormData,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function validateForm(): string | null {
    const name = form.name.trim();

    const calories = Number(
      form.caloriesPer100g,
    );

    const carbs = Number(form.carbsPer100g);

    const protein = Number(
      form.proteinPer100g,
    );

    const fat = Number(form.fatPer100g);

    if (name.length < 2) {
      return "O nome deve possuir pelo menos 2 caracteres.";
    }

    if (
      form.caloriesPer100g === "" ||
      !Number.isFinite(calories) ||
      calories < 0 ||
      calories > 1000
    ) {
      return "As calorias devem estar entre 0 e 1000.";
    }

    if (
      form.carbsPer100g === "" ||
      !Number.isFinite(carbs) ||
      carbs < 0 ||
      carbs > 100
    ) {
      return "Os carboidratos devem estar entre 0 e 100.";
    }

    if (
      form.proteinPer100g === "" ||
      !Number.isFinite(protein) ||
      protein < 0 ||
      protein > 100
    ) {
      return "As proteínas devem estar entre 0 e 100.";
    }

    if (
      form.fatPer100g === "" ||
      !Number.isFinite(fat) ||
      fat < 0 ||
      fat > 100
    ) {
      return "As gorduras devem estar entre 0 e 100.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!food) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await updateFood(food.id, {
        name: form.name.trim(),
        caloriesPer100g: Number(
          form.caloriesPer100g,
        ),
        carbsPer100g: Number(
          form.carbsPer100g,
        ),
        proteinPer100g: Number(
          form.proteinPer100g,
        ),
        fatPer100g: Number(
          form.fatPer100g,
        ),
      });

      await onUpdated();

      (
        document.getElementById(
          modalId,
        ) as HTMLDialogElement | null
      )?.close();
    } catch (submitError) {
      console.error(
        "Erro ao alterar alimento:",
        submitError,
      );

      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setError(null);
  }

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box">
        <h3 className="text-lg font-bold">
          Editar alimento
        </h3>

        <p className="mt-1 text-sm text-base-content/60">
          Altere os dados nutricionais referentes a
          100 gramas do alimento.
        </p>

        {error && (
          <div
            role="alert"
            className="alert alert-error mt-4"
          >
            <span>{error}</span>
          </div>
        )}

        <form
          className="space-y-4 mt-5"
          onSubmit={handleSubmit}
        >
          <label className="form-control">
            <span className="label-text font-medium mb-2">
              Nome
            </span>

            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Ex.: Arroz integral"
              minLength={2}
              maxLength={100}
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value,
                )
              }
              required
            />
          </label>

          <label className="form-control">
            <span className="label-text font-medium mb-2">
              Calorias por 100 g
            </span>

            <input
              type="number"
              className="input input-bordered w-full"
              min="0"
              max="1000"
              step="0.01"
              value={form.caloriesPer100g}
              onChange={(event) =>
                updateField(
                  "caloriesPer100g",
                  event.target.value,
                )
              }
              required
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="form-control">
              <span className="label-text font-medium mb-2">
                Carboidratos
              </span>

              <input
                type="number"
                className="input input-bordered w-full"
                min="0"
                max="100"
                step="0.01"
                value={form.carbsPer100g}
                onChange={(event) =>
                  updateField(
                    "carbsPer100g",
                    event.target.value,
                  )
                }
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text font-medium mb-2">
                Proteínas
              </span>

              <input
                type="number"
                className="input input-bordered w-full"
                min="0"
                max="100"
                step="0.01"
                value={form.proteinPer100g}
                onChange={(event) =>
                  updateField(
                    "proteinPer100g",
                    event.target.value,
                  )
                }
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text font-medium mb-2">
                Gorduras
              </span>

              <input
                type="number"
                className="input input-bordered w-full"
                min="0"
                max="100"
                step="0.01"
                value={form.fatPer100g}
                onChange={(event) =>
                  updateField(
                    "fatPer100g",
                    event.target.value,
                  )
                }
                required
              />
            </label>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              disabled={loading}
              onClick={() => {
                handleClose();

                (
                  document.getElementById(
                    modalId,
                  ) as HTMLDialogElement | null
                )?.close();
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !food}
            >
              {loading
                ? "Salvando..."
                : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>

      <form
        method="dialog"
        className="modal-backdrop"
      >
        <button onClick={handleClose}>
          Fechar
        </button>
      </form>
    </dialog>
  );
}
