# ppost

A simple central event emitter for electron, which can post messages via ipc to the main process or other windows.
  
**Usage in renderer process**
```coffee
      
    ppost = require 'ppost'
    
    # emit in this window (ppost extends event)
    ppost.emit 'event', args...

    # emit in process of window with id
    ppost.toWin id, 'event', args...
    
    # emit in all processes
    ppost.toAll 'event', args...
    
    # emit in all other windows processes and the main process, but not in this one
    ppost.toOthers 'event', args...
    
    # emit in main process only
    ppost.toMain 'event', args...
    
    # emit in all other window processes, but not in this one
    ppost.toOtherWins 'event', args...
    
    # emit in all window processes, including this one, but not in main
    ppost.toWins 'event', args...
```  
  
**Usage in main process**
```coffee

    ppost = require 'ppost'

    # emit in main process only
    ppost.toMain 'event', args... 
    # or 
    ppost.emit 'event', args...
    
    # emit in all processes
    ppost.toAll 'event', args...
    
    # emit in process of window with id
    ppost.toWin id, 'event', args...
    
    # emit in all window processes
    ppost.toAllWins 'event', args...    
```

**Synchronous ipc**

window process

```coffee

    # get value synchronously from main process (ipc `sendSync`)
    result = ppost.get 'something', args...
```

main process

```coffee    
    # add a callback for the sync `get` method
    ppost.onGet 'something', (args...) -> return something
```
    
Enjoy!
<br>  
<br>  

### License    
   
ppost is free and unencumbered public domain software. For more information, see http://unlicense.org/ or the accompanying UNLICENSE file.
  