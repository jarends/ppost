(function() {
  var Emitter, POST, PostMain, PostRenderer, electron, remote,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Emitter = require('events');

  electron = require('electron');

  POST = '__POST__';

  if (process.type === 'renderer') {
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
        this.ipc.removeListener(POST, this.fromMain);
        window.removeEventListener('beforeunload', this.dispose);
        this.win = null;
        this.ipc = null;
        return false;
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

      PostRenderer.prototype.toAllWins = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.ipc.send(POST, 'toAllWins', type, args);
      };

      PostRenderer.prototype.toWin = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.emit.apply(this, [type].concat(args));
      };

      PostRenderer.prototype.fromMain = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.ipc.sendSync(POST, 'fromMain', type, args);
      };

      return PostRenderer;

    })(Emitter);
    module.exports = new PostRenderer();
  } else {
    PostMain = (function(superClass) {
      extend(PostMain, superClass);

      function PostMain() {
        PostMain.__super__.constructor.call(this);
        this.syncCallbacks = {};
        this.ipc = electron.ipcMain;
        this.ipc.on(POST, (function(_this) {
          return function(event, kind, type, args, id) {
            var cb, i, len, ref, value;
            id = id || event.sender.id;
            switch (kind) {
              case 'toMain':
                _this.sendToMain(type, args);
                break;
              case 'toAll':
                _this.sendToWins(type, args).sendToMain(type, args);
                break;
              case 'toOthers':
                _this.sendToWins(type, args, id).sendToMain(type, args);
                break;
              case 'toOtherWins':
                _this.sendToWins(type, args, id);
                break;
              case 'toAllWins':
                _this.sendToWins(type, args);
                break;
              case 'fromMain':
                if (!_this.syncCallbacks[type]) {
                  return;
                }
                ref = _this.syncCallbacks[type];
                for (i = 0, len = ref.length; i < len; i++) {
                  cb = ref[i];
                  if (value = cb.apply(cb, args)) {
                    event.returnValue = value;
                    break;
                  }
                }
            }
            return _this;
          };
        })(this));
      }

      PostMain.prototype.toAll = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.sendToWins(type, args).sendToMain(type, args);
      };

      PostMain.prototype.toAllWins = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.sendToWins(type, args);
      };

      PostMain.prototype.toWin = function() {
        var args, id, ref, type;
        id = arguments[0], type = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return (ref = BrowserWindow.fromId(id)) != null ? ref.webContents.send(POST, type, args) : void 0;
      };

      PostMain.prototype.onSync = function(type, cb) {
        if (this.syncCallbacks[type] == null) {
          this.syncCallbacks[type] = [];
        }
        if (indexOf.call(this.syncCallbacks[type], cb) < 0) {
          this.syncCallbacks[type].push(cb);
        }
        return this;
      };

      PostMain.prototype.sendToMain = function(type, args) {
        args.unshift(type);
        this.emit.apply(this, args);
        return this;
      };

      PostMain.prototype.sendToWins = function(type, args, except) {
        var i, len, ref, win;
        ref = BrowserWindow.getAllWindows();
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

//# sourceMappingURL=ppost.js.map
