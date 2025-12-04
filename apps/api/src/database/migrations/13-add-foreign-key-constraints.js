'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Esta migración es opcional ya que las foreign keys
    // ya fueron definidas en las migraciones individuales.
    // Se mantiene por si necesitamos agregar constraints adicionales.
    
    console.log('✅ Todas las foreign keys ya están configuradas');
  },

  async down(queryInterface, Sequelize) {
    // No hacer nada en down
  }
};
