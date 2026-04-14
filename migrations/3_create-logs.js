exports.up = (pgm) => {
  pgm.createTable('logs', {
    id: { type: 'serial', primaryKey: true },
    app_id: {
      type: 'integer',
      notNull: true,
      references: '"apps"',
      onDelete: 'CASCADE',
    },
    level: { type: 'varchar(20)', notNull: true },
    message: { type: 'text', notNull: true },
    service: { type: 'varchar(100)' },
    metadata: {
      type: 'jsonb',
      default: pgm.func("'{}'::jsonb"), // fixed
    },
    timestamp: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('logs', ['app_id', 'timestamp']);
  pgm.createIndex('logs', 'level');
};

exports.down = (pgm) => {
  pgm.dropTable('logs');
};