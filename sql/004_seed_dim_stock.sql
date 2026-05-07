-- ─────────────────────────────────────────────
-- 004 – Seed: dim_stock reference data
-- ─────────────────────────────────────────────

INSERT INTO dim_stock (symbol, company_name, sector, exchange) VALUES
    ('AAPL',  'Apple Inc.',              'Technology',         'NASDAQ'),
    ('MSFT',  'Microsoft Corporation',   'Technology',         'NASDAQ'),
    ('TSLA',  'Tesla, Inc.',             'Consumer Cyclical',  'NASDAQ'),
    ('GOOGL', 'Alphabet Inc.',           'Communication',      'NASDAQ'),
    ('AMZN',  'Amazon.com, Inc.',        'Consumer Cyclical',  'NASDAQ')
ON CONFLICT (symbol) DO NOTHING;
