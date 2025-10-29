
exports.up = (pgm) => {
     pgm.addColumn('authors', {
          age: { type: 'integer', default: 18 },
     });
};


exports.down = (pgm) => { };
