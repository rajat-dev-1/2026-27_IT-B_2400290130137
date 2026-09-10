CREATE INDEX "repo_completed_idx" ON "scans" USING btree ("repository_id","completed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_status_created_idx" ON "scans" USING btree ("user_id","status","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_repo_commit_unique" UNIQUE("repository_id","commit_sha");--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "status_check" CHECK ("scans"."status" IN ('queued', 'running', 'completed', 'failed'));--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "progress_check" CHECK ("scans"."progress" >= 0 AND "scans"."progress" <= 100);