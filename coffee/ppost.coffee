
# 00000000   00000000    0000000    0000000  000000000    
# 000   000  000   000  000   000  000          000       
# 00000000   00000000   000   000  0000000      000       
# 000        000        000   000       000     000       
# 000        000         0000000   0000000      000       


Emitter  = require 'events'
POST     = '__POST__'


if process.type == 'renderer'

    electron = require 'electron'
    remote   = electron.remote
    

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
            @ipc.on POST, (event, type, args) => @emit.apply @, [type].concat args
            window.addEventListener 'beforeunload', @dispose


        dispose: () =>
            window.removeEventListener 'beforeunload', @dispose
            @ipc.removeAllListeners POST
            @ipc = null


        toAll:       (type, args...) -> @ipc.send POST, 'toAll',       type, args
        toOthers:    (type, args...) -> @ipc.send POST, 'toOthers',    type, args
        toMain:      (type, args...) -> @ipc.send POST, 'toMain',      type, args
        toOtherWins: (type, args...) -> @ipc.send POST, 'toOtherWins', type, args
        toWins:      (type, args...) -> @ipc.send POST, 'toWins',      type, args
        toWin:       (type, args...) -> @emit.apply @, [type].concat args
        get:         (type, args...) -> @ipc.sendSync POST, 'get',     type, args


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
            @getCallbacks = {}
            try
                ipc = require('electron').ipcMain
                ipc.on POST, (event, kind, type, args, id) =>
                    id = id or event.sender.id
                    switch kind
                        when 'toMain'      then @sendToMain type, args
                        when 'toAll'       then @sendToWins(type, args).sendToMain(type, args)
                        when 'toOthers'    then @sendToWins(type, args, id).sendToMain(type, args)
                        when 'toOtherWins' then @sendToWins type, args, id
                        when 'toWins'      then @sendToWins type, args
                        when 'get'         then event.returnValue = @getCallbacks[type]?.apply @getCallbacks[type], args


        toAll:  (    type, args...) -> @sendToWins(type, args).sendToMain(type, args)
        toWins: (    type, args...) -> @sendToWins type, args
        toWin:  (id, type, args...) -> require('electron').BrowserWindow.fromId(id)?.webContents.send POST, type, args


        onGet: (type, cb) ->
            @getCallbacks[type] = cb
            @
            

        sendToMain: (type, args) ->
            args.unshift type
            @emit.apply @, args
            @

                        
        sendToWins: (type, args, except) ->
            for win in require('electron').BrowserWindow.getAllWindows()
                win.webContents.send(POST, type, args) if win.id != except
            @


    module.exports = new PostMain()