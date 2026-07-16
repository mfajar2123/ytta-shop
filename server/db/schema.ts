import { pgTable, serial, uuid, varchar, text, integer, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ───────────────────────────────────────────────────────────────────

export const adminRoleEnum = pgEnum('admin_role', ['helpdesk', 'superadmin'])

export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment',
  'payment_uploaded',
  'verified',
  'processing',
  'completed',
  'cancelled'
])

// ─── Admins ──────────────────────────────────────────────────────────────────

export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: adminRoleEnum('role').notNull().default('helpdesk'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// ─── Products ────────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description'),
  price: integer('price').notNull(), // stored in IDR (no decimals)
  imageUrl: varchar('image_url', { length: 500 }),
  imageType: varchar('image_type', { length: 50 }).notNull().default('device'),
  sku: varchar('sku', { length: 100 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  status: orderStatusEnum('status').notNull().default('pending_payment'),
  subtotal: integer('subtotal').notNull(),
  uniqueCode: integer('unique_code').notNull().default(22),
  total: integer('total').notNull(),
  billingDetails: jsonb('billing_details').notNull(), // { fullName, phone, address, npwp, nik, email }
  vesselDetails: jsonb('vessel_details'), // { vesselName, vesselId, serialNumber, transmitterId }
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }),
  paymentProofUrl: varchar('payment_proof_url', { length: 500 }),
  adminNotes: text('admin_notes'),
  verifiedBy: uuid('verified_by').references(() => admins.id),
  paidAt: timestamp('paid_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// ─── Order Items ─────────────────────────────────────────────────────────────

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productSku: varchar('product_sku', { length: 100 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  lineTotal: integer('line_total').notNull()
})

// ─── Relations ───────────────────────────────────────────────────────────────

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  verifier: one(admins, {
    fields: [orders.verifiedBy],
    references: [admins.id]
  })
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}))

// ─── Type Exports ────────────────────────────────────────────────────────────

export type Admin = typeof admins.$inferSelect
export type NewAdmin = typeof admins.$inferInsert
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
