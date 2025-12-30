import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerified: boolean("email_verified").notNull(),
  isAdministrator: boolean("is_administrator").notNull().default(false),
  isOperator: boolean("is_operator").notNull().default(false),
  isManager: boolean("is_manager").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const userToClinicsTable = pgTable("user_to_clinic", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  clinicId: text("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const userToClinicTableRelations = relations(
  userToClinicsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userToClinicsTable.userId],
      references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [userToClinicsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  userToClinics: many(userToClinicsTable),
}));

export const clinicsTable = pgTable("clinics", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const clinicTableRelations = relations(clinicsTable, ({ many }) => ({
  doctors: many(doctorsTable),
  pets: many(petsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(userToClinicsTable),
}));

export const doctorsTable = pgTable("doctors", {
  id: text("id").primaryKey(),
  clinicId: text("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  availableFromWeekDay: integer("available_from_week_day").notNull(), // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  availableToWeekDay: integer("available_to_week_day").notNull(), // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  availableFromTime: time("available_from_time").notNull(),
  availableToTime: time("available_to_time").notNull(),
  avatarImageUrl: text("avatar_image_url"),
  speciality: text("speciality").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const doctorTableRelations = relations(
  doctorsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [doctorsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  }),
);

export const tutorsTable = pgTable("tutors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const petsSexEnum = pgEnum("pets_sex", ["Macho", "Femea"]);

export const petsTypeEnum = pgEnum("pets_type", [
  "canino",
  "felino",
  "ave",
  "roedor",
  "reptil",
  "outro",
]);

export const petsTable = pgTable("pets", {
  id: text("id").primaryKey(),
  clinicId: text("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  tutorId: text("tutor_id")
    .notNull()
    .references(() => tutorsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  race: text("race").notNull(),
  type: petsTypeEnum("type").notNull(),
  sex: petsSexEnum("sex").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const petTableRelations = relations(petsTable, ({ one, many }) => ({
  clinic: one(clinicsTable, {
    fields: [petsTable.clinicId],
    references: [clinicsTable.id],
  }),
  tutor: one(tutorsTable, {
    fields: [petsTable.tutorId],
    references: [tutorsTable.id],
  }),
  appointments: many(appointmentsTable),
}));

export const tutorTableRelations = relations(tutorsTable, ({ many }) => ({
  pets: many(petsTable),
}));

export const appointmentsTable = pgTable("appointments", {
  id: text("id").primaryKey(),
  date: date("date").notNull(),
  time: text("time"),
  petId: text("pet_id")
    .notNull()
    .references(() => petsTable.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  clinicId: text("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const appointmentTableRelations = relations(
  appointmentsTable,
  ({ one }) => ({
    pet: one(petsTable, {
      fields: [appointmentsTable.petId],
      references: [petsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [appointmentsTable.doctorId],
      references: [doctorsTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [appointmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);
