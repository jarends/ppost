# ppost

A simple central event emitter for electron, which can post messages from main to windows or from windows to main or other windows.
  
**Usage in renderer process**
```coffee
      
    ppost = require 'ppost'  
    
    # emitting in this process only
    ppost.toWin 'myEvent', arg0, ...
    
    # emitting in all processes
    ppost.toAll 'myEvent', arg0, ...
    
    # emitting in all other windows processes and the main process, but not in this one
    ppost.toOthers 'myEvent', arg0, ...
    
    # emitting in main process only
    ppost.toMain 'myEvent', arg0, ...
    
    # emitting in all other window processes, but not in this one
    ppost.toOtherWins 'myEvent', arg0, ...
    
    # emitting in all window processes, including this one, but not in main
    ppost.toWins 'myEvent', arg0, ...
    
    # sends sync to main 
    result = ppost.get 'something', arg0, ...
                           
```  
  
**Usage in main process**
```coffee

    ppost = require 'ppost'

    # emitting in main process only
    ppost.toMain 'myEvent', arg0, ...
    
    # emitting in all processes
    ppost.toAll 'myEvent', arg0, ...
    
    # emitting in process of window with id
    ppost.toWin id, 'myEvent', arg0, ...
    
    # emitting in all window processes
    ppost.toAllWins 'myEvent', arg0, ...
    
    # add a callback for the renderers get method
    ppost.onGet 'something', returnSomething
     
    #with returnSomething = (arg0, arg1, ...) -> 'return something sync to renderer' 
    
```
    
Enjoy!
<br>  
<br>  

### License    
   
ppost is free and unencumbered public domain software. For more information, see http://unlicense.org/ or the accompanying UNLICENSE file.
  