import { z } from "zod"

export const productSchema = z.object({
  productTypeId: z.string().min(1, "Product type is required"),
  productName: z.string().min(2, "Min 2 characters").max(200, "Max 200 characters"),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().nullable().optional().default(null),
  brandId: z.string().nullable().optional().default(null),
  productGroupId: z.string().nullable().optional().default(null),
  unitId: z.string().min(1, "Unit is required"),
  weight: z.coerce.number().min(0, "Min 0").max(99999.999, "Max 99999.999").nullable().optional().default(null),
  thickness: z.coerce.number().min(0, "Min 0").max(99999.999, "Max 99999.999").nullable().optional().default(null),
  colourScheme: z.string().max(100, "Max 100 characters").nullable().optional().default(""),
  status: z.enum(["Active", "Inactive"]),
})

export type ProductFormValues = z.infer<typeof productSchema>

export function getDefaultProductFormValues(): ProductFormValues {
  return {
    productTypeId: "",
    productName: "",
    categoryId: "",
    subCategoryId: null,
    brandId: null,
    productGroupId: null,
    unitId: "",
    weight: null,
    thickness: null,
    colourScheme: "",
    status: "Active",
  }
}