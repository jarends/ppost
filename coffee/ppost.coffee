
# 00000000   00000000    0000000    0000000  000000000    
# 000   000  000   000  000   000  000          000       
# 00000000   00000000   000   000  0000000      000       
# 000        000        000   000       000     000       
# 000        000         0000000   0000000      000       


{str}    = require 'kxk'
Emitter  = require 'events'
electron = require 'electron'
POST     = '__POST__'


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
                @emit.apply @, args
                null
            window.addEventListener 'beforeunload', @dispose


        dispose: () =>
            @ipc.removeListener POST, @fromMain
            window.removeEventListener 'beforeunload', @dispose
            @win = null
            @ipc = null
            false

        toAll:       (type, args...) -> @log arguments; @ipc.send POST, 'toAll',       type, args
        toOthers:    (type, args...) -> @log arguments; @ipc.send POST, 'toOthers',    type, args
        toMain:      (type, args...) -> @log arguments; @ipc.send POST, 'toMain',      type, args
        toOtherWins: (type, args...) -> @log arguments; @ipc.send POST, 'toOtherWins', type, args
        toAllWins:   (type, args...) -> @log arguments; @ipc.send POST, 'toAllWins',   type, args
        toWin:       (type, args...) -> @log arguments; @emit.apply @, [type].concat args
        fromMain:    (type, args...) -> @log arguments; @ipc.sendSync POST, 'fromMain',    type, args

        log: -> #console.log str arguments
        # emit:        -> console.log 'emit', str arguments ; super
        
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
                switch kind
                    when 'toMain'      then @sendToMain type, args
                    when 'toAll'       then @sendToWins(type, args).sendToMain(type, args)
                    when 'toOthers'    then @sendToWins(type, args, id).sendToMain(type, args)
                    when 'toOtherWins' then @sendToWins type, args, id
                    when 'toAllWins'   then @sendToWins type, args
                    when 'fromMain'
                        return if not @syncCallbacks[type]
                        for cb in @syncCallbacks[type]
                            if value = cb.apply cb, args
                                event.returnValue = value
                                break
                @


        toAll:     (    type, args...) -> @sendToWins(type, args).sendToMain(type, args)
        toAllWins: (    type, args...) -> @sendToWins type, args
        toWin:     (id, type, args...) -> BrowserWindow.fromId(id)?.webContents.send POST, type, args 

        onSync: (type, cb) ->
            @syncCallbacks[type] = [] if not @syncCallbacks[type]?
            @syncCallbacks[type].push(cb) if cb not in @syncCallbacks[type]


        sendToMain: (type, args) ->
            args.unshift type
            @emit.apply @, args
            @

                        
        sendToWins: (type, args, except) ->
            for win in BrowserWindow.getAllWindows()
                win.webContents.send(POST, type, args) if win.id != except
            @

    module.exports = new PostMain()