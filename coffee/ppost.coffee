Emitter  = require 'events'
electron = require 'electron'
TYPE     = '__POST__'

{log}    = require 'kxk'

if process.type == 'renderer'


    remote = electron.remote


    class PostRenderer extends Emitter


        constructor: () ->
            super()
            @id  = remote.getCurrentWindow().id
            @ipc = electron.ipcRenderer
            @ipc.on TYPE, (event, type, args) =>
                args.unshift type
                log 'ipc from main', args
                @emit.apply @, args
                null
            window.addEventListener 'beforeunload', @dispose


        dispose: () =>
            @ipc.removeListener TYPE, @fromMain
            window.removeEventListener 'beforeunload', @dispose
            @win = null
            @ipc = null
            false

        toAll:       (type, args...)     -> log 'toAll',       arguments; @ipc.send TYPE, 'toAll',       type, args
        toOthers:    (type, args...)     -> log 'toOthers',    arguments; @ipc.send TYPE, 'toOthers',    type, args
        toMain:      (type, args...)     -> log 'toMain',      arguments; @ipc.send TYPE, 'toMain',      type, args
        toWin:       (type, id, args...) -> log 'toWin',       arguments; @ipc.send TYPE, 'toWin',       type, args, id
        toOtherWins: (type, args...)     -> log 'toOtherWins', arguments; @ipc.send TYPE, 'toOtherWins', type, args
        toAllWins:   (type, args...)     -> log 'toAllWins',   arguments; @ipc.send TYPE, 'toAllWins',   type, args
        
        fromMain:    -> log 'fromMain', arguments; @ipc.sendSync TYPE, 'fromMain', arguments

        emit:        -> log 'emit', arguments ; super
        
    module.exports = new PostRenderer()


else


    webContents = electron.webContents


    class PostMain extends Emitter


        constructor: () ->
            super()
            @ipc = electron.ipcMain
            @ipc.on TYPE, (event, kind, type, args, id) =>
                id = id or event.sender.id
                switch kind
                    when 'toMain'      then @sendToMain type, args
                    when 'toAll'       then @sendToWins(type, args).sendToMain(type, args)
                    when 'toOthers'    then @sendToWins(type, args, id).sendToMain(type, args)
                    when 'toOtherWins' then @sendToWins type, args, id
                    when 'toAllWins'   then @sendToWins type, args
                    when 'toWin'       then @sendToWin  type, args, id
                @


        toAll:     (type, args...)     -> @sendToWins(type, args).sendToMain(type, args)
        toWin:     (type, id, args...) -> @sendToWin  type, args, id
        toAllWins: (type, args...)     -> @sendToWins type, args


        sendToMain: (type, args) ->
            args = args.concat()
            args.unshift type
            @emit.apply @, args
            @



                        
        sendToWins: (type, args, except) ->
            for win in BrowserWindow.getAllWindows()
                win.webContents.send(TYPE, type, args) if win.id != except
            @


        sendToWin: (type, args, id) ->
            try
                win = BrowserWindow.fromId id
                win.webContents.send(TYPE, type, args)
            @


    module.exports = new PostMain()