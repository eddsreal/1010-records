CREATE TABLE `forecasts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`account_id` integer,
	`priority_id` integer,
	`transaction_type` text,
	`forecast_type` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`priority_id`) REFERENCES `priorities`(`id`) ON UPDATE no action ON DELETE no action
);
