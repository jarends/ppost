(function() {
  var Emitter, POST, PostMain, PostRenderer, electron, remote,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  Emitter = require('events');

  POST = '__POST__';

  if (process.type === 'renderer') {
    electron = require('electron');
    remote = electron.remote;
    PostRenderer = (function(superClass) {
      extend(PostRenderer, superClass);

      function PostRenderer() {
        this.dispose = bind(this.dispose, this);
        PostRenderer.__super__.constructor.call(this);
        this.id = remote.getCurrentWindow().id;
        this.ipc = electron.ipcRenderer;
        this.ipc.on(POST, (function(_this) {
          return function(event, type, args) {
            return _this.emit.apply(_this, [type].concat(args));
          };
        })(this));
        window.addEventListener('beforeunload', this.dispose);
      }

      PostRenderer.prototype.dispose = function() {
        window.removeEventListener('beforeunload', this.dispose);
        this.ipc.removeAllListeners();
        this.win = null;
        return this.ipc = null;
      };

      PostRenderer.prototype.toAll = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.ipc.send(POST, 'toAll', type, args);
      };

      PostRenderer.prototype.toOthers = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.ipc.send(POST, 'toOthers', type, args);
      };

      PostRenderer.prototype.toMain = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.ipc.send(POST, 'toMain', type, args);
      };

      PostRenderer.prototype.toOtherWins = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.ipc.send(POST, 'toOtherWins', type, args);
      };

      PostRenderer.prototype.toWins = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.ipc.send(POST, 'toWins', type, args);
      };

      PostRenderer.prototype.toWin = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.emit.apply(this, [type].concat(args));
      };

      PostRenderer.prototype.get = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.ipc.sendSync(POST, 'get', type, args);
      };

      return PostRenderer;

    })(Emitter);
    module.exports = new PostRenderer();
  } else {
    PostMain = (function(superClass) {
      extend(PostMain, superClass);

      function PostMain() {
        var ipc;
        PostMain.__super__.constructor.call(this);
        this.getCallbacks = {};
        try {
          ipc = require('electron').ipcMain;
          ipc.on(POST, (function(_this) {
            return function(event, kind, type, args, id) {
              var ref;
              id = id || event.sender.id;
              switch (kind) {
                case 'toMain':
                  return _this.sendToMain(type, args);
                case 'toAll':
                  return _this.sendToWins(type, args).sendToMain(type, args);
                case 'toOthers':
                  return _this.sendToWins(type, args, id).sendToMain(type, args);
                case 'toOtherWins':
                  return _this.sendToWins(type, args, id);
                case 'toWins':
                  return _this.sendToWins(type, args);
                case 'get':
                  return event.returnValue = (ref = _this.getCallbacks[type]) != null ? ref.apply(_this.getCallbacks[type], args) : void 0;
              }
            };
          })(this));
        } catch (error) {}
      }

      PostMain.prototype.toAll = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.sendToWins(type, args).sendToMain(type, args);
      };

      PostMain.prototype.toWins = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.sendToWins(type, args);
      };

      PostMain.prototype.toWin = function() {
        var args, id, ref, type;
        id = arguments[0], type = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return (ref = require('electron').BrowserWindow.fromId(id)) != null ? ref.webContents.send(POST, type, args) : void 0;
      };

      PostMain.prototype.onGet = function(type, cb) {
        this.getCallbacks[type] = cb;
        return this;
      };

      PostMain.prototype.sendToMain = function(type, args) {
        args.unshift(type);
        this.emit.apply(this, args);
        return this;
      };

      PostMain.prototype.sendToWins = function(type, args, except) {
        var i, len, ref, win;
        ref = require('electron').BrowserWindow.getAllWindows();
        for (i = 0, len = ref.length; i < len; i++) {
          win = ref[i];
          if (win.id !== except) {
            win.webContents.send(POST, type, args);
          }
        }
        return this;
      };

      return PostMain;

    })(Emitter);
    module.exports = new PostMain();
  }

}).call(this);
