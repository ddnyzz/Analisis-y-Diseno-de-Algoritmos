INSERT OR IGNORE INTO nodes (id, name, lat, lng, type, description) VALUES
('N01', 'Catedral Basílica', 22.7752, -102.5724, 'origin', 'Centro histórico'),
('N02', 'Mina El Edén', 22.7770, -102.5800, 'waypoint', 'Atractivo turístico'),
('N03', 'Cerro de la Bufa', 22.7758, -102.5668, 'waypoint', 'Mirador principal'),
('N04', 'Parque La Encantada', 22.7567, -102.5735, 'waypoint', 'Zona recreativa'),
('N05', 'Museo de Guadalupe', 22.7470, -102.5175, 'destination', 'Centro de Guadalupe'),
('N06', 'Plaza Galerías', 22.7680, -102.6050, 'service', 'Zona comercial'),
('N07', 'Instituto Tecnológico (ITZ)', 22.7640, -102.5830, 'education', 'Zona escolar'),
('N08', 'Estadio Carlos Vega', 22.7663, -102.5694, 'service', 'Unidad deportiva');

INSERT OR IGNORE INTO edges (id, source_id, target_id, distance, time, cost, bidirectional, label) VALUES
('E01', 'N01', 'N02', 0.85, 4.0, 1.2, 1, 'Catedral-Mina'),
('E02', 'N01', 'N03', 1.10, 6.5, 2.0, 1, 'Catedral-Bufa'),
('E03', 'N02', 'N06', 3.20, 9.0, 4.5, 1, 'Mina-Galerías'),
('E04', 'N03', 'N08', 2.00, 7.0, 2.5, 1, 'Bufa-Estadio'),
('E05', 'N08', 'N04', 1.50, 5.0, 1.8, 1, 'Estadio-Encantada'),
('E06', 'N01', 'N07', 2.10, 8.0, 3.0, 1, 'Catedral-ITZ'),
('E07', 'N07', 'N04', 1.30, 4.5, 1.5, 1, 'ITZ-Encantada'),
('E08', 'N04', 'N05', 6.20, 15.0, 8.0, 1, 'Encantada-Guadalupe'),
('E09', 'N06', 'N07', 2.80, 8.5, 3.5, 1, 'Galerías-ITZ'),
('E10', 'N08', 'N05', 5.50, 13.0, 7.0, 1, 'Estadio-Guadalupe');