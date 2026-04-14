exports.up = (pgm) => {
  pgm.createTable('alert_rules', {
    id: { type: 'serial', primaryKey: true },
    app_id: {
      type: 'integer',
      notNull: true,
      references: '"apps"',
      onDelete: 'CASCADE',
    },
    metric: { type: 'varchar(100)', notNull: true },
    threshold: { type: 'numeric', notNull: true },
    cooldown_minutes: { type: 'integer', notNull: true, default: 10 },
    last_triggered: { type: 'timestamp' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('alert_rules', 'app_id');
};

exports.down = (pgm) => {
  pgm.dropTable('alert_rules');
};