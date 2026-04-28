# 📄 Form_Create.md (Reusable Guide for New Model Forms)

## 🎯 Purpose

This document defines the standard architecture and prerequisites
required before creating any new CRUD Form (Create/Edit screen) using:

-   React + TypeScript
-   React Hook Form (RHF)
-   Zod validation
-   Redux Toolkit (Thunk + Slice)
-   Reactstrap UI
-   Custom RHF Components (RHFInput, RHFSelect, RHFCheckBox,
    RHFFormWrapper)

------------------------------------------------------------------------

# 🧱 1. Required Folder Structure

Before building a new form (e.g., Department, Clinic, Employee), ensure
this structure exists:

types/ admin/`<module>`{=html}/ `<module>`{=html}.type.ts
`<module>`{=html}.schema.ts `<module>`{=html}.mapper.ts

slices/ admin/`<module>`{=html}/ `<module>`{=html}Slice.ts
`<module>`{=html}Thunk.ts

services/ admin/`<module>`{=html}/ `<module>`{=html}Service.ts

pages/ admin/`<module>`{=html}/ `<ModuleName>`{=html}.tsx

Components/ Common/ Forms/ RHFInput.tsx RHFSelect.tsx RHFCheckBox.tsx
RHFFormWrapper.tsx

------------------------------------------------------------------------

# 🧩 2. Required Core Building Blocks

## A. Type Definition

export interface EntityList { id: number; clientId: number; code:
string; name: string; active: string \| boolean; }

------------------------------------------------------------------------

## B. Form Model

export interface EntityForm { id: number; clientId: number; code:
string; name: string; active: boolean; }

------------------------------------------------------------------------

## C. Zod Schema

import { z } from "zod";

export const entitySchema = z.object({ id: z.number(), clientId:
z.number(), code: z.string().min(1), name: z.string().min(1), active:
z.boolean(), });

------------------------------------------------------------------------

## D. Mapper

export const toForm = (data: any): EntityForm =\> ({ id: data.id,
clientId: data.clientId, code: data.code ?? "", name: data.name ??"",
active: data.active ==="Yes", });

export const toModel = (form: EntityForm) =\> ({ ...form });

------------------------------------------------------------------------

## E. Service Layer

export const entityService = { getAll: (clientId: number) =\> {}, save:
(model: any) =\> {}, delete: (id: number) =\> {} };

------------------------------------------------------------------------

## F. Redux Requirements

-   list
-   loading
-   saving
-   error
-   success
-   selected

Required actions: - setSelected - resetState - clearError

------------------------------------------------------------------------

## G. Thunk Requirements

-   fetchList
-   saveItem
-   deleteItem

------------------------------------------------------------------------

# 🧰 3. UI Components Required

-   RHFInput
-   RHFSelect
-   RHFCheckBox
-   RHFFormWrapper
-   TableContainer
-   toastService

------------------------------------------------------------------------

# 🧠 4. Page Requirements

Must include:

-   emptyModel()
-   listToForm()
-   useForm + zodResolver
-   modal state
-   CRUD handlers
-   useEffect for:
    -   fetch data
    -   reset form
    -   success toast
    -   error toast

------------------------------------------------------------------------

# 🚀 5. CRUD Flow

UI → Modal Open → RHF Load → Validate → toModel → Redux Thunk → API →
Update List → Toast → Close Modal

------------------------------------------------------------------------

# ⚠️ 6. Checklist

✔ Types\
✔ Schema\
✔ Mapper\
✔ Service\
✔ Slice\
✔ Thunk\
✔ Page\
✔ RHF Components
