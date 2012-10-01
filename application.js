// Generated by CoffeeScript 1.3.3
(function() {
  var Metalib, ProgressBar, Queue, automaticallyAddToItunes, bar, cleanup, copyNotMoveToItunes, ffmpeg, fs, iTunesFolder, queue, redistogo_url, startStopDaemon, trashFolder, watch, watchFileExt, watchFolder, web_interface, _conversionProgress, _copyFileSync, _getAudioCodec, _getFfmpegProfile, _getVideoCodec, _home, _moveToItunes, _processVideo, _trashSourceFile, _validFiletype, _videoMetadata;

  watchFileExt = ["mkv", "ts", "m2ts", "avi"];

  cleanup = true;

  automaticallyAddToItunes = true;

  copyNotMoveToItunes = false;

  web_interface = false;

  redistogo_url = "";

  watchFolder = "./process";

  fs = require("fs");

  watch = require("watch");

  ffmpeg = require("fluent-ffmpeg");

  Metalib = require("fluent-ffmpeg").Metadata;

  ProgressBar = require('progress');

  startStopDaemon = require("start-stop-daemon");

  Queue = require("./lib/queue");

  queue = new Queue["class"]();

  bar = new ProgressBar('Processing [:bar] :percent :etas', {
    total: 100
  });

  _videoMetadata = {};

  _conversionProgress = 0;

  _home = process.env.HOME;

  iTunesFolder = _home + "/Music/iTunes/iTunes Media/Automatically Add to iTunes/";

  trashFolder = _home + "/.Trash/";

  _getFfmpegProfile = function(file, callback) {
    return ffmpeg.call(["-i " + file], function(params, params2) {
      console.log(params, params2);
      if (typeof callback === "function") {
        return callback();
      }
    });
  };

  _getAudioCodec = function(metadata) {
    if (metadata === undefined) {
      metadata = _videoMetadata;
    }
    if (metadata.audio.codec === "aac") {
      return "copy";
    } else {
      return "aac";
    }
  };

  _getVideoCodec = function(metadata) {
    if (metadata === undefined) {
      metadata = _videoMetadata;
    }
    if (metadata.video.codec === "h264") {
      return "copy";
    } else {
      return "libx264";
    }
  };

  _processVideo = function(options) {
    var outputFile, outputFilename, pieces, proc, sourceFilename;
    options.outputExt = "mp4";
    options.audioBitrate = "384k";
    pieces = options.source.split("/");
    sourceFilename = options.source.replace(/^[a-z]+\//i, "");
    outputFilename = options.source.replace(/\.[a-z0-9]+$/i, "." + options.outputExt).replace(/^[a-z]+\//i, "");
    outputFile = "output/" + outputFilename;
    return proc = new ffmpeg({
      source: options.source,
      timeout: 60 * 60
    }).withVideoCodec(options.videoCodec).withAudioCodec(options.audioCodec).withAudioBitrate(options.audioBitrate).addOption("-strict", "-2").onProgress(function(progress) {
      var localProgress;
      localProgress = Math.round(progress.percent);
      return _conversionProgress = localProgress;
    }).toFormat(options.outputExt).saveToFile(outputFile, function(retcode, error) {
      console.log("- File successfully processed to " + outputFile);
      if (cleanup) {
        _trashSourceFile(options.source, sourceFilename);
      }
      if (automaticallyAddToItunes) {
        return _moveToItunes(outputFile, outputFilename);
      }
    });
  };

  _moveToItunes = function(source, destination) {
    var destinationFile;
    destinationFile = iTunesFolder + destination;
    return fs.rename(source, destinationFile, function(error) {
      if (error) {
        return console.error(error);
      } else {
        return console.log("- Moved output file to iTunes library folder");
      }
    });
  };

  _trashSourceFile = function(source, destination) {
    var destinationFile;
    destinationFile = trashFolder + destination;
    return fs.rename(source, destinationFile, function(error) {
      if (error) {
        return console.error(error);
      } else {
        return console.log("- Moved source file to trash");
      }
    });
  };

  _copyFileSync = function(srcFile, destFile) {
    var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
    BUF_LENGTH = 64 * 1024;
    buff = new Buffer(BUF_LENGTH);
    fdr = fs.openSync(srcFile, 'r');
    fdw = fs.openSync(destFile, 'w');
    bytesRead = 1;
    pos = 0;
    while (bytesRead > 0) {
      bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
      fs.writeSync(fdw, buff, 0, bytesRead);
      pos += bytesRead;
    }
    fs.closeSync(fdr);
    return fs.closeSync(fdw);
  };

  _validFiletype = function(file) {
    var i, regex;
    for (i in watchFileExt) {
      regex = new RegExp("." + watchFileExt[i] + "$", "i");
      if (file.match(regex)) {
        return true;
      }
    }
    return false;
  };

  startStopDaemon({}, function() {
    return watch.createMonitor(watchFolder, function(monitor) {
      monitor.on("created", function(file, stat) {
        var inQueueAlready, metaObject;
        inQueueAlready = queue["in"](file);
        if (!inQueueAlready) {
          queue.add(file);
        }
        if (!_validFiletype(file) || inQueueAlready) {
          return;
        }
        metaObject = new Metalib(file);
        return metaObject.get(function(metadata, err) {
          _videoMetadata = metadata;
          console.log("Starting to process " + file);
          return _processVideo({
            source: file,
            audioCodec: _getAudioCodec(metadata),
            videoCodec: _getVideoCodec(metadata)
          });
        });
      });
      return monitor.on("changed", function(file, curr, prev) {
        var i, metaObject, re, _results;
        _results = [];
        for (i in watchFileExt) {
          re = new RegExp("." + watchFileExt[i] + "$", "i");
          if (file.match(re)) {
            metaObject = new Metalib(file);
            _results.push(metaObject.get(function(metadata, err) {}));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    });
  });

}).call(this);
