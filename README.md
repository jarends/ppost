# ppost

A simple central event emitter for electron, which can post messages from main to windows or from windows to main or other windows.
  
**Usage in renderer process**
```coffee
      
    ppost = require 'ppost'  
    
    # emitting in my process only
    ppost.toWin 'myEvent', arg0, ...
    
    # emitting in all processes
    ppost.toAll 'myEvent', arg0, ...
    
    # emitting in all other windows and the main process, but not in my one
    ppost.toOthers 'myEvent', arg0, ...
    
    # emitting in main process only
    ppost.toMain 'myEvent', arg0, ...
    
    # emitting in all other windows, but not in my one
    ppost.toOtherWins 'myEvent', arg0, ...
    
    # emitting in all window processes, including my one, but not in main
    ppost.toWins 'myEvent', arg0, ...
                           
```  
  
**Usage in main process**
```coffee

    ppost = require 'ppost'

    # emitting in main process only
    ppost.toMain 'myEvent', arg0, ...
    
    # emitting in all processes
    ppost.toAll 'myEvent', arg0, ...
    
    # emitting in window id
    ppost.toWin id, 'myEvent', arg0, ...
    
    # emitting in all webcontents processes
    ppost.toAllWins 'myEvent', arg0, ...
    
```
  
Many thanks to [Kodi](https://github.com/monsterkodi/) for his major improvements ;-)  
  
Enjoy!
<br>  
<br>  

### License    
   
ppost is free and unencumbered public domain software. For more information, see http://unlicense.org/ or the accompanying UNLICENSE file.
  