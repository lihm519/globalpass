CREATE TABLE `esim_packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(64) NOT NULL,
	`country` varchar(128) NOT NULL,
	`planName` varchar(256) NOT NULL,
	`dataType` varchar(32) NOT NULL,
	`dataAmount` varchar(64) NOT NULL,
	`validity` varchar(64) NOT NULL,
	`price` varchar(32) NOT NULL,
	`network` varchar(256),
	`link` text,
	`rawData` text,
	`lastChecked` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `esim_packages_id` PRIMARY KEY(`id`)
);
