Emitter     = require 'events'
electron    = require 'electron'
webContents = electron.webContents
remote      = electron.remote
TYPE        = '__POST__'


if process.type == 'renderer'


    class PostRenderer extends Emitter


        constructor: () ->
            super()
            @id  = remote.getCurrentWebContents().id
            @ipc = electron.ipcRenderer
            @ipc.on TYPE, @fromMain
            window.addEventListener 'beforeunload', @dispose


        dispose: () =>
            @ipc.removeListener TYPE, @fromMain
            window.removeEventListener 'beforeunload', @dispose
            @win = null
            @ipc = null
            false


        toAll:       (type, args...)     -> @ipc.send TYPE, 'toAll',       type, args
        toOthers:    (type, args...)     -> @ipc.send TYPE, 'toOthers',    type, args
        toMain:      (type, args...)     -> @ipc.send TYPE, 'toMain',      type, args
        toWin:       (type, id, args...) -> @ipc.send TYPE, 'toWin',       type, args, id
        toOtherWins: (type, args...)     -> @ipc.send TYPE, 'toOtherWins', type, args
        toAllWins:   (type, args...)     -> @ipc.send TYPE, 'toAllWins',   type, args


        fromMain: (event, type, args) =>
            args.unshift type
            @emit.apply @, args
            null


    module.exports = new PostRenderer()


else


    class PostMain extends Emitter


        constructor: () ->
            super()
            @ipc = electron.ipcMain
            @ipc.on TYPE, @fromWin


        toAll:     (type, args...)     -> @sendToWins(type, args) & @sendToSelf(type, args)
        toWin:     (type, id, args...) -> @sendToWin  type, args, id
        toAllWins: (type, args...)     -> @sendToWins type, args


        sendToSelf: (type, args) ->
            args = args.concat()
            args.unshift type
            @emit.apply @, args
            null


        sendToWins: (type, args, except) ->
            for content in webContents.getAllWebContents()
                content.send(TYPE, type, args) if content.id != except
            null


        sendToWin: (type, args, id) ->
            try
                content = webContents.fromId id
                content.send(TYPE, type, args)
            null


        fromWin: (event, kind, type, args, id) =>
            id = id or event.sender.id
            switch kind
                when 'toMain'      then @sendToSelf type, args
                when 'toAll'       then @sendToWins(type, args)     & @sendToSelf(type, args)
                when 'toOthers'    then @sendToWins(type, args, id) & @sendToSelf(type, args)
                when 'toOtherWins' then @sendToWins type, args, id
                when 'toAllWins'   then @sendToWins type, args
                when 'toWin'       then @sendToWin  type, args, id
            null


    module.exports = new PostMain()