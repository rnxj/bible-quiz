CREATE TABLE `bible-quiz_quiz_attempt` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`book_id` text NOT NULL,
	`book` text NOT NULL,
	`chapter_number` integer NOT NULL,
	`total_questions` integer NOT NULL,
	`correct_answers` integer NOT NULL,
	`results` text NOT NULL,
	`timestamp` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `book_chapter_idx` ON `bible-quiz_quiz_attempt` (`book_id`,`chapter_number`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `bible-quiz_quiz_attempt` (`user_id`);--> statement-breakpoint
CREATE TABLE `bible-quiz_sync_status` (
	`user_id` text PRIMARY KEY NOT NULL,
	`last_synced_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
