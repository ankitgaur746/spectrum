exports.pages = function( view ) {
  return function( req, res ) {
    res.render( view + ".html" );
  };
};

// Show the home page
exports.index = function( mode ) {
	return function( req, res ) {
  res.render('editor/index.html', mode);
	};
};


/**
 * Get js files
 */
exports.js = function( filename ) {
  return function( req, res ){
    res.set('Content-Type', 'application/javascript');
    res.render( 'js/' + filename + '.js');
  };
};
