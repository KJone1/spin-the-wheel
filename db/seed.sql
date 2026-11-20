INSERT OR REPLACE INTO app_settings (key, value) VALUES
  ('spin_duration', '10'),
  ('respin_label', '"RESPIN ↻"'),
  ('respin_color', '"#e63b2e"'),
  ('auto_respin_delay_ms', '1200'),
  ('slice_colors', '["#ffcc00","#0055ff","#ffffff","#f5f0e8","#00a86b","#ff5500"]');

INSERT OR REPLACE INTO presets (id, slug, title, is_default, respin_active, respin_replicas, sort_order) VALUES
  ('yes-or-no', 'yes-or-no', 'YES OR NO', 1, 0, 1, 0),
  ('who-pays', 'who-pays', 'WHO PAYS', 0, 1, 4, 1),
  ('what-to-eat', 'what-to-eat', 'WHAT TO EAT', 0, 1, 2, 2),
  ('wolt-or-no-wolt', 'wolt-or-no-wolt', 'WOLT OR NO WOLT', 0, 1, 2, 3),
  ('who-submits-first', 'who-submits-first', 'WHO SUBMITS FIRST', 0, 1, 2, 4);

INSERT OR REPLACE INTO preset_entries (id, preset_id, label, replicas, color, sort_order) VALUES
  ('yes-or-no-1', 'yes-or-no', 'YES', 3, '#ffcc00', 0),
  ('yes-or-no-2', 'yes-or-no', 'NO', 3, '#0055ff', 1),
  ('who-pays-1', 'who-pays', 'DAVID', 3, '#ffcc00', 0),
  ('who-pays-2', 'who-pays', 'DOR', 3, '#0055ff', 1),
  ('what-to-eat-1', 'what-to-eat', 'HAMBURGER', 3, '#ffcc00', 0),
  ('what-to-eat-2', 'what-to-eat', 'SCHNITZEL', 3, '#0055ff', 1),
  ('what-to-eat-3', 'what-to-eat', 'TORTILLA', 3, '#ff5500', 2),
  ('what-to-eat-4', 'what-to-eat', 'ASIAN', 3, '#f5f0e8', 3),
  ('what-to-eat-5', 'what-to-eat', 'ABULAFIA', 3, '#00a86b', 4),
  ('wolt-or-no-wolt-1', 'wolt-or-no-wolt', 'WOLT', 4, '#ffcc00', 0),
  ('wolt-or-no-wolt-2', 'wolt-or-no-wolt', 'NO WOLT', 4, '#0055ff', 1),
  ('who-submits-first-1', 'who-submits-first', 'DAVID', 3, '#ffcc00', 0),
  ('who-submits-first-2', 'who-submits-first', 'OMER', 3, '#0055ff', 1);
