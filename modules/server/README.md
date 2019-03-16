# XVIZ Server(session, opts)
  XVIZServer([] XVIZSession(XVIZSourceFactory))

# XVIZServer
  # simple websocket server
  # delegates connections to xvizSession
    // Really a connectionHandler

# XVIZSession(factory)
  onConnection create SessionHandler if supported

# XVIZSessionHandler(socket, request, source, opts)
  construct middleware stack for request/opts

# middleware 
  defines messages it pipelines and responds to
  each middleware instance _may_ get access to middleware or socket

  standard interface is 
    request: { path, params}
    msg: XVIZData


# XVIZ Data Format and encoding
Basic XVIZ server that allows hosting XVIZ data
- json
  string
  arraybuffer
- glb
  arraybuffer
  ? blob
- [bundles]
  json & glb?

# args
 - port
 - d, multiple

# options
  # largely addressed in XVIZHandler
  # options target source, requesthandler and therefore the middleware
  - live
    server data w/o 'start'
    remove metadate start/end time
    do not send done

  - scenario

  - loop
    serverresponse hook frame index calculation
    middleware change frame times

  - delay
    serverResponse 
  - limit
    serverResponse

  - filterStream
    mw
  - filterType
    mw

  - validate
    validate request
    validate response

  - format json, json_arraybuffer, binary
    mw

# Module for use as a server for custom data

# server purpose
# host for route & query params
# expect arguments (route + qp) to map to XVIZSource
# XVIZSource is any file/path supported that can provide
 - index
 - metadata
 - frames

XVIZSourceFactory
  list([path]): [ [available sources] ]
    // for all internal impls collect based on path
    // scenario would list everything it supports
  open([path], log_id): [ XVIZSource|null ]
  kitti  2011/2032_005
  nutonom  203
  rosbag cart_bot
  scenario scenario_circle

@xviz/server
  - could register all 

@xviz/reader
 - envelope w/type [metadata & frame, bundle]
 !! missing, type bundle
    - defines index, metadata frames all in one
    - note: frames are just a logical sequence to the data

 - structure
  source
    factory/
    args.js
    connection.js
    server.js
    index.js

    utils/
      readFile
