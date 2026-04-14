exports.up = (pgm) => {
  pgm.createTable('apps', {
    id: { type: 'serial', primaryKey: true },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    name: { type: 'varchar(255)', notNull: true },
    api_key: { type: 'varchar(255)', notNull: true, unique: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('apps', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('apps');
};