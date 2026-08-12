import { z } from "zod";

export const indianPhoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const postalCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "PIN code must be 6 digits");

export const checkoutAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: indianPhoneSchema,
  email: z.string().trim().email().optional().or(z.literal("")),
  addressLine1: z.string().trim().min(5).max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  landmark: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: postalCodeSchema,
  country: z.literal("India").default("India"),
  customerNotes: z.string().trim().max(1000).optional().or(z.literal("")),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms and privacy policy",
  }),
});

export const createOrderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1).max(50),
  address: checkoutAddressSchema,
  idempotencyKey: z.string().uuid(),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  remember: z.boolean().optional(),
});

const skuSchema = z
  .string()
  .trim()
  .min(1, "SKU is required")
  .max(64, "SKU must be 64 characters or fewer");

const httpsImageUrlSchema = z
  .string()
  .trim()
  .url("Image must be a valid URL")
  .refine(
    (url) => /^https?:\/\//i.test(url),
    "Image URL must start with http:// or https://",
  );

export const productCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).optional(),
  sku: skuSchema,
  shortDescription: z.string().trim().max(300).optional(),
  description: z.string().trim().max(10000).optional(),
  material: z.string().trim().max(200).optional(),
  careInstructions: z.string().trim().max(2000).optional(),
  audience: z.enum(["WOMEN", "MEN", "GIRLS", "BOYS", "UNISEX"]),
  categoryId: z.string().min(1, "Select a category"),
  priceInPaise: z.number().int().min(0),
  compareAtPriceInPaise: z.number().int().min(0).nullable().optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  variants: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        value: z.string().trim().min(1).max(80),
        sku: skuSchema,
        priceAdjustmentInPaise: z.number().int().default(0),
        stockOnHand: z.number().int().min(0).default(0),
        lowStockThreshold: z.number().int().min(0).default(5),
        isActive: z.boolean().optional(),
      }),
    )
    .min(1, "Add at least one variant"),
  images: z
    .array(
      z.object({
        url: httpsImageUrlSchema,
        altText: z.string().max(200).optional(),
        sortOrder: z.number().int().min(0).optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .optional(),
});

export const inventoryAdjustSchema = z.object({
  variantId: z.string().min(1),
  quantityDelta: z.number().int(),
  reason: z.string().trim().min(3).max(500),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "WHATSAPP_PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
  adminNotes: z.string().trim().max(2000).optional(),
});

export const paymentStatusSchema = z.object({
  paymentStatus: z.enum(["UNPAID", "COD_PENDING", "PAID", "REFUNDED"]),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  audience: z.enum(["WOMEN", "MEN", "GIRLS", "BOYS", "UNISEX"]),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const productUpdateSchema = productCreateSchema.partial().extend({
  variants: productCreateSchema.shape.variants.optional(),
  images: productCreateSchema.shape.images.optional(),
});

export const settingsUpdateSchema = z.object({
  storeName: z.string().trim().min(1).max(120).optional(),
  tagline: z.string().trim().max(200).optional(),
  whatsappDisplayNumber: z.string().trim().max(32).optional().nullable(),
  supportEmail: z.string().trim().email().optional().nullable().or(z.literal("")),
  supportPhone: z.string().trim().max(32).optional().nullable(),
  businessAddress: z.string().trim().max(500).optional().nullable(),
  freeShippingThresholdInPaise: z.number().int().min(0).optional(),
  standardShippingInPaise: z.number().int().min(0).optional(),
  instagramUrl: z.string().url().optional().nullable().or(z.literal("")),
  facebookUrl: z.string().url().optional().nullable().or(z.literal("")),
  isStoreOpen: z.boolean().optional(),
  announcementText: z.string().trim().max(500).optional().nullable(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
