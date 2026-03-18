exports.seed = async function(knex) {
  await knex('cases').insert([
    { id: 1, title: 'Suspected expense fraud in Q4', description: 'Multiple duplicate expense reports submitted by same employee.', status: 'open', priority: 'high', category: 'fraud', assigned_to: 2, created_by: 1 },
    { id: 2, title: 'Harassment complaint - Marketing dept', description: 'Anonymous report of verbal harassment during team meetings.', status: 'in_progress', priority: 'critical', category: 'harassment', assigned_to: 2, created_by: 1 },
    { id: 3, title: 'Data access policy violation', description: 'Employee accessed restricted customer data without authorization.', status: 'open', priority: 'medium', category: 'security', assigned_to: null, created_by: 1 },
  ]);
};
