const client = require('./db');

const executeCqlCommand = async (query, params = []) => {
  try {
    const result = await client.execute(query, params, { prepare: true });
    return result;
  } catch (error) {
    console.error('Error executing CQL command:', error);
    throw error;
  }
};

module.exports = executeCqlCommand;
