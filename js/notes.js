/*------------------------------------------------------
    File: notes.js
    
    Abstract: Sticky Notes Demo
    
    Version: 1.0
    
    Disclaimer: IMPORTANT:  This Apple software is supplied to you by
    Apple Inc. ("Apple") in consideration of your agreement to the
    following terms, and your use, installation, modification or
    redistribution of this Apple software constitutes acceptance of these
    terms.  If you do not agree with these terms, please do not use,
    install, modify or redistribute this Apple software.
    
    In consideration of your agreement to abide by the following terms, and
    subject to these terms, Apple grants you a personal, non-exclusive
    license, under Apple's copyrights in this original Apple software (the
    "Apple Software"), to use, reproduce, modify and redistribute the Apple
    Software, with or without modifications, in source and/or binary forms;
    provided that if you redistribute the Apple Software in its entirety and
    without modifications, you must retain this notice and the following
    text and disclaimers in all such redistributions of the Apple Software.
    Neither the name, trademarks, service marks or logos of Apple Inc.
    may be used to endorse or promote products derived from the Apple
    Software without specific prior written permission from Apple.  Except
    as expressly stated in this notice, no other rights or licenses, express
    or implied, are granted by Apple herein, including but not limited to
    any patent rights that may be infringed by your derivative works or by
    other works in which the Apple Software may be incorporated.
    
    The Apple Software is provided by Apple on an "AS IS" basis.  APPLE
    MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION
    THE IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS
    FOR A PARTICULAR PURPOSE, REGARDING THE APPLE SOFTWARE OR ITS USE AND
    OPERATION ALONE OR IN COMBINATION WITH YOUR PRODUCTS.
    
    IN NO EVENT SHALL APPLE BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL
    OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
    SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
    INTERRUPTION) ARISING IN ANY WAY OUT OF THE USE, REPRODUCTION,
    MODIFICATION AND/OR DISTRIBUTION OF THE APPLE SOFTWARE, HOWEVER CAUSED
    AND WHETHER UNDER THEORY OF CONTRACT, TORT (INCLUDING NEGLIGENCE),
    STRICT LIABILITY OR OTHERWISE, EVEN IF APPLE HAS BEEN ADVISED OF THE
    POSSIBILITY OF SUCH DAMAGE.
    
    Copyright (C) 2010 Apple Inc. All Rights Reserved.

     改変
                                          
------------------------------------------------------*/ 
//変数定義 
var db;
 
try {
    if (window.openDatabase) {
        db = openDatabase("LectureD", "1.0", "HTML5 Database API example", 200000);
        if (!db)
            alert("Failed to open the database on disk.  This is probably because the version was bad or there is not enough space left in this domain's quota");
    } else
        alert("Couldn't open the database.  Please try with a WebKit nightly with this feature enabled");
} catch(err) { }
 
const SupportsTouches = ('createTouch' in document);
const StartEventType = SupportsTouches ? 'touchstart' : 'mousedown';
const MoveEventType = SupportsTouches ? 'touchmove' : 'mousemove';
const EndEventType = SupportsTouches ? 'touchend' : 'mouseup';
 
var captured = null;
var highestZ = 0;
var highestId = 0;
var allNotes = new Array();

// 付箋object保存変数

/*------------------------------------------------------*/
/* 付箋処理                                            */
/*------------------------------------------------------*/ 
function Note()
{
    var self = this;
 
    var note = document.createElement('div');
    note.className = 'note';
    note.addEventListener('click', this, false);
    this.note = note;
 
    var edit = document.createElement('textarea');
    edit.className = 'edit';
    edit.addEventListener('keyup', this, false);
    note.appendChild(edit);
    this.editField = edit;
 
    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    note.appendChild(overlay);
    this.overlay = overlay;
 
    var ts = document.createElement('div');
//    ts.className = 'timestamp';
    ts.className = 'Blank';
    ts.addEventListener(StartEventType, this, false);
    note.appendChild(ts);
    this.lastModified = ts;
 
    var close = document.createElement('div');
    close.className = 'closebutton';
    close.addEventListener(StartEventType, this, false);
    note.appendChild(close);
 
    document.body.appendChild(note);
    
    allNotes.push(this);
 
    return this;
}
 
Note.prototype = {
    get pageno()
    {
        if (!("_pageno" in this))
            this._pageno = 0;
        return this._pageno;
    },

    set pageno(x)
    {
        this._pageno = x;
    },

    get id()
    {
        if (!("_id" in this))
            this._id = 0;
        return this._id;
    },
 
    set id(x)
    {
        this._id = x;
    },
 
    get text()
    {
        return this.editField.value;
    },
 
    set text(x)
    {
        this.editField.value = x;
    },
 
//    get timestamp()
//    {
//        if (!("_timestamp" in this))
//            this._timestamp = 0;
//        return this._timestamp;
//    },
// 
//    set timestamp(x)
//    {
//        if (this._timestamp == x)
//            return;
// 
//        this._timestamp = x;
//        var date = new Date();
//        date.setTime(parseFloat(x));
//        this.lastModified.textContent = modifiedString(date);
//    },
 
    get left()
    {
        return this.note.style.left;
    },
 
    set left(x)
    {
        this.note.style.left = x;
    },
 
    get top()
    {
        return this.note.style.top;
    },
 
    set top(x)
    {
        this.note.style.top = x;
    },
 
    get zIndex()
    {
        return this.note.style.zIndex;
    },
 
    set zIndex(x)
    {
        this.note.style.zIndex = x;
    },
 
    close: function(event)
    {
        this.cancelPendingSave();
 
        var self = this;
        
        db.transaction(function(tx)
         {
            tx.executeSql("DELETE FROM WebKitStickyNotes WHERE id = ?", [self.id]);
         });
                
        var duration = 250;
        
        if (event.shiftKey) {
            duration *= 10;
            this.note.style.webkitTransitionDuration = duration + 'ms';
        }
        this.note.className = "note closed";
 
        setTimeout(function() { self.delayedDestroy(); }, duration);
    },
 
    delayedDestroy: function()
    {
        var index = allNotes.indexOf(this);
        //array.splice(index, 1);
        allNotes.splice(index, 1);
        document.body.removeChild(this.note);
    },
 
    saveSoon: function()
    {
        this.cancelPendingSave();
        var self = this;
        this._saveTimer = setTimeout(function() { self.save(); }, 200);
    },
 
    cancelPendingSave: function()
    {
        if (!("_saveTimer" in this))
            return;
        clearTimeout(this._saveTimer);
        delete this._saveTimer;
    },
 
    save: function()
    {
        this.cancelPendingSave();
 
 //       if ("dirty" in this) {
 //           this.timestamp = new Date().getTime();
 //           delete this.dirty;
 //       }
 
        var note = this;
        db.transaction(function (tx)
        {
//            tx.executeSql("UPDATE WebKitStickyNotes SET pageno= ?, note = ?, timestamp = ?, left = ?, top = ?, zindex = ? WHERE id = ?", [note.pageno, note.text, note.timestamp, note.left, note.top, note.zIndex, note.id]);
            tx.executeSql("UPDATE WebKitStickyNotes SET pageno= ?, note = ?, left = ?, top = ?, zindex = ? WHERE id = ?", [note.pageno, note.text, note.left, note.top, note.zIndex, note.id]);
        });
    },
 
    saveAsNew: function()
    {
//        this.timestamp = new Date().getTime();
        
        var note = this;
        // alert('highestId = ' + note.id + ' imageIndex = ' + note.pageno + 'note = ' + note);

        db.transaction(function (tx) 
        {
//            tx.executeSql("INSERT INTO WebKitStickyNotes (pageno, id, note, timestamp, left, top, zindex) VALUES (?, ?, ?, ?, ?, ?, ?)", [note.pageno, note.id, note.text, note.timestamp, note.left, note.top, note.zIndex]);
            tx.executeSql("INSERT INTO WebKitStickyNotes (pageno, id, note, left, top, zindex) VALUES (?, ?, ?, ?, ?, ?)", [note.pageno, note.id, note.text, note.left, note.top, note.zIndex]);
        }); 
    },


    closeAsDisp: function()
    {
        this.cancelPendingSave();
 
        var duration = 250;
        
        duration *= 10;
        this.note.style.webkitTransitionDuration = duration + 'ms';
  
        this.note.className = "note closed";
 
    },



 
    handleEvent: function(event)
    {
        switch (event.type) {
        
        case StartEventType:
            if (event.currentTarget.className == 'closebutton') {
                event.preventDefault();
                this.close(event);
            } else {
                this.onDragStart(event);
            }
            break;
        case MoveEventType:
            this.onDragMove(event);
            break;
        case EndEventType:
            this.onDragEnd(event);
            break;
        case "click":
            this.onNoteClick();
            break;
        case "keyup":
            this.onKeyUp();
            break;
        }
    },
 
    onDragStart: function(event)
    {
        // stop page from panning on iPhone/iPad - we're moving a note, not the page
        event.preventDefault();
 
        var e = (SupportsTouches && event.touches && event.touches.length > 0) ? event.touches[0] : event;
 
        captured = this;
        this.startX = e.clientX - this.note.offsetLeft;
        this.startY = e.clientY - this.note.offsetTop;
        this.zIndex = ++highestZ;
 
        window.addEventListener(MoveEventType, this, true);
        window.addEventListener(EndEventType, this, true);
        
        return false;
    },
 
    onDragMove: function(event)
    {
        if (this != captured) {
            return;
        }
 
        // stop page from panning on iPhone/iPad - we're moving a note, not the page
        event.preventDefault();
 
        var e = (SupportsTouches && event.touches && event.touches.length > 0) ? event.touches[0] : event;
 
        this.left = e.clientX - this.startX + 'px';
        this.top = e.clientY - this.startY + 'px';
        return false;
    },
 
    onDragEnd: function(event)
    {
        window.removeEventListener(MoveEventType, this, true);
        window.removeEventListener(EndEventType, this, true);
        
        this.save();
        return false;
    },
 
    onNoteClick: function(e)
    {
        this.editField.focus();
        getSelection().collapseToEnd();
    },
 
    onKeyUp: function()
    {
        this.dirty = true;
        this.saveSoon();
    }
};

/*------------------------------------------------------*/
/* DB初期処理                                           */
/*------------------------------------------------------*/
function loaded()
{
    db.transaction(function(tx) {
        tx.executeSql("SELECT COUNT(*) FROM WebkitStickyNotes", [], function(result) {
            loadNotes(imageIndex);
        }, function(tx, error) {
//            tx.executeSql("CREATE TABLE WebKitStickyNotes (pageno REAL, id REAL UNIQUE, note TEXT, timestamp REAL, left TEXT, top TEXT, zindex REAL)", [], function(result) { 
            tx.executeSql("CREATE TABLE WebKitStickyNotes (pageno REAL, id REAL UNIQUE, note TEXT, left TEXT, top TEXT, zindex REAL)", [], function(result) { 
                loadNotes(imageIndex); 
            });
        });
    });
}

/*------------------------------------------------------*/
/* 付箋データロード処理                                  */
/*------------------------------------------------------*/
function loadNotes(pageindex)
{
    db.transaction(function(tx) {
//        tx.executeSql("SELECT pageno, id, note, timestamp, left, top, zindex FROM WebKitStickyNotes WHERE pageno = ?", [pageindex], function(tx, result) {
        tx.executeSql("SELECT pageno, id, note, left, top, zindex FROM WebKitStickyNotes WHERE pageno = ?", [pageindex], function(tx, result) {
            for (var i = 0; i < result.rows.length; ++i) {
                var row = result.rows.item(i);
                var note = new Note();
                note.pageno = row['pageno'];
                note.id = row['id'];
                note.text = row['note'];
//                note.timestamp = row['timestamp'];
                note.left = row['left'];
                note.top = row['top'];
                note.zIndex = row['zindex'];
 
                if (row['id'] > highestId)
                    highestId = row['id'];
                if (row['zindex'] > highestZ)
                    highestZ = row['zindex'];
            }
 
//            if (!result.rows.length)
//                newNote();
        }, function(tx, error) {
            alert('Failed to retrieve notes from database - ' + error.message);
            return;
        });
    });
}
 
  
/*------------------------------------------------------*/
/* 付箋データ検索処理                                    */
/*------------------------------------------------------*/
function searchFieldUpdated()
{
    if (!db)
        return;
 
    if (window.searchInProgress) {
        setTimeout(searchFieldUpdated, 200);
        return;
    }
 
    var query = document.getElementById("textSearchInput").value;
    if (!query.length) {
        for (i in allNotes) {
            allNotes[i].overlay.className = "overlay";
            allNotes[i].note.className = "note";
        }
        return;
    }
    
    window.searchInProgress = true;
    
    db.transaction(function(tx) {
        tx.executeSql("SELECT pageno, id FROM WebKitStickyNotes WHERE note LIKE ?", ["%"+query+"%"], function(tx, results) {
          //  for (i in allNotes) {
          //      allNotes[i].overlay.className = "overlay shown";
          //      allNotes[i].note.className = "note";
            //}
          var bFlg = true;
          for (var i = 0; i < results.rows.length; ++i) {
            var note = null;
            for (n in allNotes) {
              if (allNotes[n].id == results.rows.item(i)['id']) {
                note = allNotes[n];
                break;
                }
              }
            if (note) {
                selectpage(allNotes[n].pageno);
              } else {
                selectpage(results.rows.item(i)['pageno']);
              }
            }
          window.searchInProgress = false;
        }, function(tx, error) {
            alert('Failed to search notes in database - ' + error.message);
            window.searchInProgress = false;
            return;
        });
    });
    
}
 
function zeroPadIfNecessary(num)
{
    if (num < 10)
        return "0" + num;
    else
        return "" + num;
}

/*------------------------------------------------------*/
/* 日付処理                                              */
/*------------------------------------------------------*/
function modifiedString(date)
{
    return 'Last Modified: ' + date.getFullYear() + '-' + zeroPadIfNecessary(date.getMonth() + 1) + '-' + zeroPadIfNecessary(date.getDate()) + ' ' + zeroPadIfNecessary(date.getHours()) + ':' + date.getMinutes() + ':' + date.getSeconds();
}
 
/*------------------------------------------------------*/
/* 新規付箋処理                                          */
/*------------------------------------------------------*/
function newNote()
{
    var note = new Note();
    
//    alert('highestId = 1 + ' + highestId + ' imageIndex = ' + imageIndex);
    
    
    note.pageno = imageIndex;
    note.id = ++highestId;
//    note.timestamp = new Date().getTime();
    note.left = Math.round(Math.random() * (document.width / 3)) + 'px';
    note.top = Math.round(Math.random() * (document.height / 3)) + 'px';
    note.zIndex = ++highestZ;
    note.saveAsNew();
}
 
/*------------------------------------------------------*/
/* close処理                                          */
/*------------------------------------------------------*/
function closeNote(pageindex){

  for (n in allNotes) {
    if (allNotes[n].pageno == pageindex) {

     allNotes[n].closeAsDisp();
  
    }
  }  
}

/*------------------------------------------------------*/
/* 付箋データクリア処理                                  */
/*------------------------------------------------------*/
function NoteclearData(bDraw) {
  
  // データ削除
  db.transaction(function(tx) {
    tx.executeSql("DELETE FROM WebKitStickyNotes", [], function(result) {
     
     //再表示 
    if (bDraw) selectpage(imageIndex);     
  },function(tx, error) {
     alert('Error');
     });
  });
}

addEventListener('load', loaded, false);
