import { EmployerModel } from "./employer.type";
import { EmployerForm } from "./employer.schema"; // from zod file

// API → Form
export const toForm = (model: EmployerModel): EmployerForm => {
  // Ensure organizationId is a number (not string) for dropdown matching
  const organizationId = model.organizationId
    ? Number(model.organizationId)
    : null;

  return {
    id: model.id ?? 0,
    clientId: model.clientId ?? null,
    organizationId,
    code: model.code ?? "",
    name: model.name ?? "",
    active: model.active ?? true,
  };
};

// Form → API
export const toModel = (form: EmployerForm): EmployerModel => ({
  id: form.id,
  clientId: form.clientId,
  organizationId: form.organizationId,
  code: form.code,
  name: form.name,
  active: form.active,
});