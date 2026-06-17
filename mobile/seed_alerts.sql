-- Rode este script no Editor SQL do seu painel do Supabase para inserir alertas reais

INSERT INTO alerts (category, description, status, location, confirmations, user_id)
VALUES 
  ('furto', 'Homem abordando pedestres próximo ao ponto de ônibus da W3 Sul', 'verified', ST_GeomFromText('POINT(-47.9292 -15.7934)', 4326), 5, (SELECT id FROM auth.users LIMIT 1)),
  ('iluminacao', 'Poste apagado na SQS 308, trecho entre as quadras C e D', 'verified', ST_GeomFromText('POINT(-47.9350 -15.8100)', 4326), 3, (SELECT id FROM auth.users LIMIT 1)),
  ('suspeito', 'Veículo escuro estacionado há horas com pessoas dentro na 904 Norte', 'pending', ST_GeomFromText('POINT(-47.9180 -15.7650)', 4326), 1, (SELECT id FROM auth.users LIMIT 1)),
  ('infraestrutura', 'Buraco grande na pista na saída do Sudoeste sentido Eixão', 'verified', ST_GeomFromText('POINT(-47.9420 -15.7980)', 4326), 4, (SELECT id FROM auth.users LIMIT 1)),
  ('assedio', 'Relatos de assédio verbal na saída do metrô Asa Sul no período noturno', 'verified', ST_GeomFromText('POINT(-47.9310 -15.8050)', 4326), 7, (SELECT id FROM auth.users LIMIT 1));
