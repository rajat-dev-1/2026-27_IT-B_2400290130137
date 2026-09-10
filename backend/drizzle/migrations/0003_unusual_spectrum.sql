ALTER TABLE "scans" DROP CONSTRAINT "scans_repo_commit_unique";--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "run_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "is_rescan" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_repo_commit_run_unique" UNIQUE("repository_id","commit_sha","run_number");