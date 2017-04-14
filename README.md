# ppost

A simple central event emitter for electron, which can post messages from main to webcontents or from webcontents to main or other webcontents.
  
**Usage in renderer process**
```coffee
      
    ppost = require 'ppost'  
    
    # emitting in my process only
    ppost.emit 'myEvent', arg0, ...
    
    # emitting in all processes
    ppost.toAll 'myEvent', arg0, ...
    
    # emitting in all other webcontents and the main process, but not in my one
    ppost.toOthers 'myEvent', arg0, ...
    
    # emitting in main process only
    ppost.toMain 'myEvent', arg0, ...
    
    # emitting in process, which webcontents id equals id
    ppost.toWin 'myEvent', arg0, ...
    
    # emitting in all other webcontnts processes, but not my one
    ppost.toOtherWins 'myEvent', arg0, ...
    
    # emitting in all webcontents processes, including my one, but not to main
    ppost.toAllWins 'myEvent', arg0, ...
                           
```  
  
**Usage in main process**
```coffee

    ppost = require 'ppost'

    # emitting in main process only
    ppost.emit 'myEvent', arg0, ...
    
    # emitting in all processes
    ppost.toAll 'myEvent', arg0, ...
    
    # emitting in process, which webcontents id equals id
    ppost.toWin 'myEvent', arg0, ...
    
    # emitting in all webcontents processes
    ppost.toAllWins 'myEvent', arg0, ...
    
```
  
Enjoy!
<br>  
<br>  

### License    
   
ppost is free and unencumbered public domain software. For more information, see http://unlicense.org/ or the accompanying UNLICENSE file.
  