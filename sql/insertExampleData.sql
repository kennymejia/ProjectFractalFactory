INSERT INTO USERS(user_id, user_account, password, first_name, last_name, email, account_type, admin_flag, last_login, date_added, date_last_updated) VALUES
('072ba068-3256-46e7-9138-5f454b92b81e', 'example123', '23478207027842073230762374023', 'Dave', 'Lent', 'example@gmail.com', 'Google', false, '2014-08-17 19:15:53', '2002-02-27 21:14:05', '2009-12-22 10:34:32'),
('a67d93f5-d24c-458e-b090-ada03e10936e', 'admin', '$2b$10$ilarA2jX6ZaiZwRne3I2ROG3fELZiC921QhVLzFL5WMjkjOD.1nkq', 'Jessy', 'Kent', 'ex@gmail.com', 'Default', true, '2017-11-11 07:57:24', '2014-03-22 17:24:48', '2017-11-11 07:57:24'),
('1374801c-b520-4a55-aecc-b841930a05d4', 'fc@yahoo.com', '234476747607027842073230762374023', 'George', 'Diez', 'fc@yahoo.com', 'Facebook', false, '2009-12-22 10:34:32', '2006-05-20 17:03:43', '2008-02-22 18:08:15'),
('7ea674d9-eb9d-4ce4-9da9-0d0c50bfe55f', 'kjl8w', '2347820702784207865742374023', 'Jessica', 'Brant', 'example@hotmail.com', 'Marist', true, '2011-09-04 03:53:05', '2003-03-12 02:55:17', '2009-12-22 10:34:32'),
('35eeb5a1-670a-46a6-ad9c-567d23fd339b', 'gg@gmail.com', '2347820705685674073230762374023', 'Felix', 'Kant', 'gg@gmail.com', 'Google', false, '2017-11-11 07:57:24', '2008-08-05 22:22:49', '2017-11-11 07:57:24')
;

INSERT INTO PAINTINGS(painting_id, file_location, fractal_dimension, name, painter, year_created, date_added, date_last_updated) VALUES
('afbbadc3-d088-46b6-bbef-66494a659e7f', '/srv/paintings/p0', 1.26, 'Mona Lisa', 'Leanard Da Vinci', '1557', '2000-11-21 05:37:50', '2005-01-29 04:45:45'),
('8eea83d0-5ff8-42bf-8b19-aa584b904a3d', '/srv/paintings/p1', 1.22, 'The Starry Night', 'Vincent Van Gogh', '1889', '2001-12-13 20:06:52', '2016-11-08 07:46:42'),
('2aecd4b7-f48a-4692-b972-890f20038031', '/srv/paintings/p2', 1.67, 'The Scream', 'Edvard Munch', '1893', '2002-10-22 12:40:50', '2008-12-13 20:06:52'),
('f57633b0-969c-44b7-b859-6dad96ceeae0', '/srv/paintings/p3', 1.43, 'The Night Watch', 'Rembrandt', '1642', '2003-06-20 13:22:52', '2011-09-04 03:53:05'),
('2ad8d839-9c7f-4682-8740-64b6413b3254', '/srv/paintings/p4', 1.87, 'The Creation of Adam', 'Michelangelo', '1512', '2002-11-29 19:01:43', '2017-11-11 07:57:24')
;

INSERT INTO USER_SOURCE_FILES(user_source_file_id, file_location, fractal_dimension, user_id, date_added, date_last_updated) VALUES
('5eac02f8-1aa5-4646-944d-6dd46827659c', '/srv/source_files/usf0', 1.67, '072ba068-3256-46e7-9138-5f454b92b81e', '2004-09-13 11:27:50', '2014-08-17 19:15:53'),
('f02e5204-ecad-41c4-a344-37d8fadca447', '/srv/source_files/usf1', 1.91, 'a67d93f5-d24c-458e-b090-ada03e10936e', '2017-11-11 07:57:24', '2013-04-10 05:13:14'),
('dff03454-d205-4d57-8074-55b9019e7e02', '/srv/source_files/usf2', 1.34, '1374801c-b520-4a55-aecc-b841930a05d4', '2008-02-22 18:08:15', '2017-11-11 07:57:24'),
('86a2d9cd-9f5e-4ffe-b0cf-c64a0c9ab7ae', '/srv/source_files/usf3', 1.56, '7ea674d9-eb9d-4ce4-9da9-0d0c50bfe55f', '2009-12-22 10:34:32', '2011-09-04 03:53:05'),
('753cb0d6-240a-49e6-a07b-13430a902743', '/srv/source_files/usf4', 1.89, '35eeb5a1-670a-46a6-ad9c-567d23fd339b', '2008-02-22 18:08:15', '2005-01-29 04:45:45')
;

INSERT INTO USER_PAINTINGS(user_painting_id, file_location, painting_id, user_source_file_id, user_id, date_added, watermark_flag, date_last_updated) VALUES
('cd7870b2-2d4d-4ff9-9801-05c6fa7c44a8', '/srv/user_paintings/up0', 'afbbadc3-d088-46b6-bbef-66494a659e7f', '5eac02f8-1aa5-4646-944d-6dd46827659c', '072ba068-3256-46e7-9138-5f454b92b81e', '2004-11-08 07:46:42', true, '2006-11-11 07:57:24'),
('55ce7670-ccd5-4fc7-9b88-6cdc0743d9ee', '/srv/user_paintings/up1', '8eea83d0-5ff8-42bf-8b19-aa584b904a3d', 'f02e5204-ecad-41c4-a344-37d8fadca447', 'a67d93f5-d24c-458e-b090-ada03e10936e', '2014-08-17 19:15:53', true, '2017-11-11 07:57:24'),
('b93fc5cc-32aa-459e-9008-2e9b513df827', '/srv/user_paintings/up2', '2aecd4b7-f48a-4692-b972-890f20038031', 'dff03454-d205-4d57-8074-55b9019e7e02', '1374801c-b520-4a55-aecc-b841930a05d4', '2006-09-04 03:53:05', false, '2007-09-04 03:53:05'),
('6019efa8-1657-42af-bdba-f7075a0d99b6', '/srv/user_paintings/up3', 'f57633b0-969c-44b7-b859-6dad96ceeae0', '86a2d9cd-9f5e-4ffe-b0cf-c64a0c9ab7ae', '7ea674d9-eb9d-4ce4-9da9-0d0c50bfe55f', '2007-04-10 05:13:14', false, '2008-04-10 05:13:1'),
('f3bdb8d5-7b8a-47ed-9ef3-ee375a928abe', '/srv/user_paintings/up4', '2ad8d839-9c7f-4682-8740-64b6413b3254', '753cb0d6-240a-49e6-a07b-13430a902743', '35eeb5a1-670a-46a6-ad9c-567d23fd339b', '2009-01-29 04:45:45', true, '20014-08-05 22:22:49')
;

