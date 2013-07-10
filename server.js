var ESsetup         = require('./config/ESconfig'),
    express         = require('express'),
    nunjucks        = require('nunjucks'),
    path            = require('path'),
    route           = require('./routes'),
    fs              = require('fs');


var app             = express(),
    env             = require('./config/environment'),
    nunjucksEnv     = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, 'views'))),
    logger          = require('./lib/logger'),
    middleware      = require('./lib/middleware')(ESsetup, app),
    lessMiddleWare  = require('less-middleware'),
    NODE_ENV        = env.get( "NODE_ENV" ),
    WWW_ROOT        = path.resolve( __dirname, "public" );

// Express Configuration
app.configure(function () {

  nunjucksEnv.express(app);
  app.disable('x-powered-by');
  app.use(express.logger('dev'));
  app.use( express.compress());
  app.use( express.bodyParser() );
  app.use(express.static(__dirname + '/public'));

  var optimize = NODE_ENV !== "development",
  tmpDir = path.join( require( "os" ).tmpDir(), "spectrum" );

app.use( lessMiddleWare({
  once: optimize,
  debug: !optimize,
  dest: tmpDir,
  src: WWW_ROOT,
  compress: optimize,
  yuicompress: optimize,
  optimization: optimize ? 0 : 2
}));


app.use( express.static( tmpDir ) );


  app.use( app.router );
	
  app.use( function( err, req, res, next) {
    if ( !err.status ) {
      err.status = 500;
    }
    res.status( err.status );
    res.render( 'error.html', { message: err.message, code: err.status });
  });
  app.use( function( req, res, next ) {
    res.status( 404 );
    res.render( 'error.html', { code: 404, message: "Page not found :(" });
  });
});

app.get('/', middleware.getRecentPost);

//get the content by /id
app.get('/:id', middleware.getPost);
app.get('/:id/edit', middleware.editPost);

// page number
app.get( '/page/1', function( req, res ){
  res.redirect( 301, '/' );
});

app.get('/page/:page', middleware.getRecentPost)

// author's dedicated page
app.get('/author/:id', middleware.getAuthorDetails);

//author's setting page
app.get('/setting/author', route.pages("admin/author-setting"));

// these two routes are use to get and post to the author's setting page
app.post('/setting/author/g', middleware.getAuthorSetting);
app.post('/setting/author/s', middleware.saveAuthorSetting);

//create new post
app.get('/new/post', route.index({mode: "create"}));
// app.get('/new/post', route.pages('admin/editor'));
app.post('/new/post', middleware.createPost);
app.post('/edit/post', middleware.publishEditPost);

app.get('/editor/viewer.html', route.pages("editor/viewer"));

//edit an existing post
app.post('/post/edit/g', middleware.editPost);


// be careful with this route! it will delete all the data from elasticsearch
app.get('/admin/delete/all', middleware.dropEScontent);




app.listen( env.get('PORT'), function() {
  logger.info("HTTP server listening on port " + env.get('PORT') + ".");
});