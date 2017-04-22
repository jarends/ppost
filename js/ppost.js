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
          return function(event, type, argl) {
            return _this.emit.apply(_this, [type].concat(argl));
          };
        })(this));
        window.addEventListener('beforeunload', this.dispose);
      }

      PostRenderer.prototype.dispose = function() {
        window.removeEventListener('beforeunload', this.dispose);
        this.ipc.removeAllListeners(POST);
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
        return this.ipc.send(POST, 'toOtherWins', type, args, this.id);
      };

      PostRenderer.prototype.toWins = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.ipc.send(POST, 'toWins', type, args);
      };

      PostRenderer.prototype.toWin = function() {
        var args, id, type;
        id = arguments[0], type = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
        return this.ipc.send(POST, 'toWin', type, args, id);
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
            return function(event, kind, type, argl, id) {
              var ref;
              id = id || event.sender.id;
              switch (kind) {
                case 'toMain':
                  return _this.sendToMain(type, argl);
                case 'toAll':
                  return _this.sendToWins(type, argl).sendToMain(type, argl);
                case 'toOthers':
                  return _this.sendToWins(type, argl, id).sendToMain(type, argl);
                case 'toOtherWins':
                  return _this.sendToWins(type, argl, id);
                case 'toWins':
                  return _this.sendToWins(type, argl);
                case 'toWin':
                  return _this.toWin.apply(_this, [id, type].concat(argl));
                case 'get':
                  return event.returnValue = (ref = _this.getCallbacks[type]) != null ? ref.apply(_this.getCallbacks[type], argl) : void 0;
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

      PostMain.prototype.toMain = function() {
        var args, type;
        type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.sendToMain(type, args);
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

      PostMain.prototype.sendToMain = function(type, argl) {
        argl.unshift(type);
        this.emit.apply(this, argl);
        return this;
      };

      PostMain.prototype.sendToWins = function(type, argl, except) {
        var i, len, ref, win;
        ref = require('electron').BrowserWindow.getAllWindows();
        for (i = 0, len = ref.length; i < len; i++) {
          win = ref[i];
          if (win.id !== except) {
            win.webContents.send(POST, type, argl);
          }
        }
        return this;
      };

      return PostMain;

    })(Emitter);
    module.exports = new PostMain();
  }

}).call(this);
