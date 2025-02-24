CREATE TABLE `forecast_detail` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real NOT NULL,
	`month` integer NOT NULL,
	`account_id` integer,
	`priority_id` integer,
	`transaction_type` text,
	`forecast_type` text,
	`forecast_id` integer,
	`category_id` integer,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`priority_id`) REFERENCES `priorities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`forecast_id`) REFERENCES `forecasts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `forecastsDetail`;