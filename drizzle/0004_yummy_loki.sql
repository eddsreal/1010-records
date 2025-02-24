PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_forecasts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_forecasts`("id", "year") SELECT "id", "year" FROM `forecasts`;--> statement-breakpoint
DROP TABLE `forecasts`;--> statement-breakpoint
ALTER TABLE `__new_forecasts` RENAME TO `forecasts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `forecasts_year_unique` ON `forecasts` (`year`);--> statement-breakpoint
ALTER TABLE `forecastsDetail` ADD `month` integer NOT NULL;