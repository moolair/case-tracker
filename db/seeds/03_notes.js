exports.seed = async function(knex) {
  await knex('notes').insert([
    { case_id: 1, author_id: 2, content: 'Reviewed expense reports from Oct-Dec. Found 5 duplicate submissions totaling $3,200.' },
    { case_id: 1, author_id: 1, content: 'Escalated to finance department for confirmation.' },
    { case_id: 2, author_id: 2, content: 'Initial interview with reporting party completed. Witness list prepared.' },
  ]);
};
