CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task` text,
	`user_id` text,
	`is_complete` integer
);
