CREATE TYPE "public"."specialty" AS ENUM('general_medicine', 'pediatrics', 'cardiology', 'emergency_medicine', 'infectious_disease', 'neurology', 'psychiatry', 'dermatology', 'orthopedics', 'gastroenterology', 'endocrinology', 'oncology', 'pulmonology', 'nephrology', 'rheumatology', 'ophthalmology', 'otolaryngology', 'anesthesiology', 'radiology', 'pathology', 'surgery', 'obstetrics_gynecology', 'urology', 'plastic_surgery', 'forensic_medicine', 'sports_medicine', 'geriatrics', 'occupational_medicine', 'public_health');--> statement-breakpoint
CREATE TABLE "chat_node" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"node_id" text NOT NULL,
	"added_at" timestamp NOT NULL,
	"added_by_user_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 1,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "node" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"specialty" "specialty" DEFAULT 'general_medicine' NOT NULL,
	"prompt" text NOT NULL,
	"is_system_node" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_configuration" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"user_id" text NOT NULL,
	"nodes" text NOT NULL,
	"edges" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"tags" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_node" ADD CONSTRAINT "chat_node_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_node" ADD CONSTRAINT "chat_node_node_id_node_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_node" ADD CONSTRAINT "chat_node_added_by_user_id_user_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node" ADD CONSTRAINT "node_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_configuration" ADD CONSTRAINT "workspace_configuration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;