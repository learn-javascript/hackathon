(function(){
    var App = window.app
    function Debug(){
        this.debugUi = document.getElementById('debug-ui');
        
        this.historyLocation = 0
        this.historyEl = this.debugUi.querySelector('.history')
        var self = this;
        Events.on('Canvas:tile:clicked', function(tile, x, y){
            console.log(self.getTileHistory(x,y,0))
        })
        Events.on('World:fetched', function(){
            self.updateHistoryText()
            if(!self.usedControls) self.historyLocation = App.worldHistory.length
        })
        this.debugUi.querySelector('.pause-play').addEventListener('click', function(e){
            if(App.paused) {
                e.target.innerHTML = "Pause"
                self.play()
            }else {
                self.pause()
                e.target.innerHTML = "Play"
            }
        }, false)
        this.debugUi.querySelector('.rewind').addEventListener('click', this.rewind.bind(this, 1), false)
        this.debugUi.querySelector('.fastForward').addEventListener('click', this.fastForward.bind(this, 1), false)
    }
    Debug.prototype.getTileHistory = function(x,y, start, finish){
        if(start > App.worldHistory.length) start = App.worldHistory.length
        if(finish > App.worldHistory.length || finish == null) finish = App.worldHistory.length
        var th = []
        ,   currentWorld
        for(; start < finish; start++){
            currentWorld = App.worldHistory[start]
            th.push({
                tile : _.cloneDeep(currentWorld[y][x]),
                historyLocation : start
            })
        }
        return th
    }
    
    Debug.prototype.pause = function(){
        this.usedControls = true
        App.paused = !App.paused
    }
    
    Debug.prototype.play = function(){
        this.playTimeout = setTimeout(function(){
            App.debug.historyLocation++
            var w = App.worldHistory[App.debug.historyLocation]
            App.renderWorld(w)
            this.updateHistoryText()
            if(w === App._latestWorld) {
                App.paused = false
                return
            }
            setTimeout(App.debug.play)
        }, 500)
    }
    
    Debug.prototype.rewind = function(far){
        App.paused = true
        this.usedControls = true
        var distance = far || 1
        if(this.historyLocation - far < 0) distance = this.historyLocation
        App.world = App.worldHistory[this.historyLocation - distance]
        this.historyLocation -= distance
        App.renderWorld(App.world)
        this.updateHistoryText()
    }
    
    Debug.prototype.fastForward = function(far){
        App.paused = true
        this.usedControls = true
        var distance = far || 1
        if(this.historyLocation + far > App.worldHistory.length-1) distance = App.worldHistory.length - this.historyLocation
        App.world = App.worldHistory[this.historyLocation + distance]
        this.historyLocation += distance
        App.renderWorld(App.world)
        this.updateHistoryText()
    }
    
    Debug.prototype.updateHistoryText = function(){
        var txt = "Current History Location : " + (this.historyLocation + 1) 
        txt += '. Current history lenght : ' + App.worldHistory.length
        this.historyEl.innerHTML = txt
    }
    App.debug = new Debug();
    window.golDebug = App.debug
}())