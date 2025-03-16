ALTER TABLE `accounts` RENAME TO `payment_methods`;--> statement-breakpoint
ALTER TABLE `payment_methods` ADD `type` text DEFAULT 'ACCOUNT' NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_forecast_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real NOT NULL,
	`month` integer NOT NULL,
	`payment_method_id` integer,
	`priority_id` integer,
	`year` integer DEFAULT (strftime('%Y', 'now')) NOT NULL,
	`transaction_type` text NOT NULL,
	`forecast_type` text NOT NULL,
	`forecast_id` integer NOT NULL,
	`category_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`priority_id`) REFERENCES `priorities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`forecast_id`) REFERENCES `forecasts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_forecast_details`("id", "amount", "month", "payment_method_id", "priority_id", "year", "transaction_type", "forecast_type", "forecast_id", "category_id", "created_at", "updated_at") SELECT "id", "amount", "month", "payment_method_id", "priority_id", "year", "transaction_type", "forecast_type", "forecast_id", "category_id", "created_at", "updated_at" FROM `forecast_details`;--> statement-breakpoint
DROP TABLE `forecast_details`;--> statement-breakpoint
ALTER TABLE `__new_forecast_details` RENAME TO `forecast_details`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`payment_method_id` integer,
	`priority_id` integer,
	`category_id` integer,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`priority_id`) REFERENCES `priorities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "amount", "description", "type", "payment_method_id", "priority_id", "category_id", "status", "created_at", "updated_at") SELECT "id", "amount", "description", "type", "payment_method_id", "priority_id", "category_id", "status", "created_at", "updated_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;