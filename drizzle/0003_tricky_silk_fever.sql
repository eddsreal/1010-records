CREATE TABLE `forecastsDetail` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real NOT NULL,
	`account_id` integer,
	`priority_id` integer,
	`transaction_type` text,
	`forecast_type` text,
	`forecast_id` integer,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`priority_id`) REFERENCES `priorities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`forecast_id`) REFERENCES `forecasts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `forecasts` DROP COLUMN `amount`;--> statement-breakpoint
ALTER TABLE `forecasts` DROP COLUMN `transaction_type`;--> statement-breakpoint
ALTER TABLE `forecasts` DROP COLUMN `forecast_type`;