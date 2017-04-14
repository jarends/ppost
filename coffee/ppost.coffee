Emitter  = require 'events'
electron = require 'electron'
POST     = '__POST__'

{log}    = require 'kxk'

if process.type == 'renderer'

    remote = electron.remote
    

    # 000   000  000  000   000    
    # 000 0 000  000  0000  000    
    # 000000000  000  000 0 000    
    # 000   000  000  000  0000    
    # 00     00  000  000   000    


    class PostRenderer extends Emitter


        constructor: () ->
            super()
            @id  = remote.getCurrentWindow().id
            @ipc = electron.ipcRenderer
            @ipc.on POST, (event, type, args) =>
                args.unshift type
                log 'ipc from main', args
                @emit.apply @, args
                null
            window.addEventListener 'beforeunload', @dispose


        dispose: () =>
            @ipc.removeListener POST, @fromMain
            window.removeEventListener 'beforeunload', @dispose
            @win = null
            @ipc = null
            false

        toAll:       (type, args...)     -> log 'toAll',        arguments; @ipc.send POST, 'toAll',       type, args
        toOthers:    (type, args...)     -> log 'toOthers',     arguments; @ipc.send POST, 'toOthers',    type, args
        toMain:      (type, args...)     -> log 'toMain',       arguments; @ipc.send POST, 'toMain',      type, args
        toWin:       (type, id, args...) -> log 'toWin',        arguments; @ipc.send POST, 'toWin',       type, args, id
        toOtherWins: (type, args...)     -> log 'toOtherWins',  arguments; @ipc.send POST, 'toOtherWins', type, args
        toAllWins:   (type, args...)     -> log 'toAllWins',    arguments; @ipc.send POST, 'toAllWins',   type, args
        fromMain:    (type, args...)     -> log 'fromMain', arguments; @ipc.sendSync POST, 'fromMain',    type, args

        emit:        -> log 'emit', arguments ; super
        
    module.exports = new PostRenderer()


else


    # 00     00   0000000   000  000   000  
    # 000   000  000   000  000  0000  000  
    # 000000000  000000000  000  000 0 000  
    # 000 0 000  000   000  000  000  0000  
    # 000   000  000   000  000  000   000  
    

    class PostMain extends Emitter


        constructor: () ->
            super()
            @syncCallbacks = {}
            @ipc = electron.ipcMain
            @ipc.on POST, (event, kind, type, args, id) =>
                id = id or event.sender.id
                log 'got POST', 
                    kind:kind
                    type:type 
                    args:args
                    id:id
                switch kind
                    when 'toMain'      then @sendToMain type, args
                    when 'toAll'       then @sendToWins(type, args).sendToMain(type, args)
                    when 'toOthers'    then @sendToWins(type, args, id).sendToMain(type, args)
                    when 'toOtherWins' then @sendToWins type, args, id
                    when 'toAllWins'   then @sendToWins type, args
                    when 'toWin'       then @sendToWin  type, args, id
                    when 'fromMain'
                        log 'fromMain', @syncCallbacks[type]?.length
                        return if not @syncCallbacks[type]
                        for cb in @syncCallbacks[type]
                            log "call cb for type #{type}"
                            if value = cb.apply cb, args
                                log 'got value from cb', value
                                event.returnValue = value
                                break
                @


        toAll:     (type, args...)     -> @sendToWins(type, args).sendToMain(type, args)
        toWin:     (type, id, args...) -> @sendToWin  type, args, id
        toAllWins: (type, args...)     -> @sendToWins type, args


        sendToMain: (type, args) ->
            console.log 'sendToMain', type, args
            args.unshift type
            @emit.apply @, args
            @

                        
        sendToWins: (type, args, except) ->
            console.log 'sendToWins', type, args
            for win in BrowserWindow.getAllWindows()
                win.webContents.send(POST, type, args) if win.id != except
            @


        sendToWin: (type, args, id) ->
            console.log 'sendToWin', type, args, id
            try
                win = BrowserWindow.fromId id
                win.webContents.send(POST, type, args)
            @

        onSync: (type, cb) ->
            @syncCallbacks[type] = [] if not @syncCallbacks[type]?
            @syncCallbacks[type].push(cb) if cb not in @syncCallbacks[type]
            console.log "added sync cb for type '#{type}'", @syncCallbacks[type].length

    module.exports = new PostMain()