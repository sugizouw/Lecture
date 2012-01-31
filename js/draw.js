// 変数定義
var bDrawMode = false;		// true:描画 false:非描画
var canvas = null	;			// Canvasオブジェクトを取得
var context = null;			// 2Dコンテキストを取得
var mouseX = 0;				// マウス座標(X)
var mouseY = 0;				// マウス座標(Y)
var bpad = false;
var colorList = {
    "black"   : "rgba(0,0,0,0.5)",
    "blue"    : "rgba(0,0,255,0.5)",
    "red"     : "rgba(255,0,0,0.5)",
}
var penColor = "rgba(255,0,0,0.5)";

// canvas保存用
var Base64Coded;
var Img;

/*------------------------------------------------------*/
/* canvas描画初期化処理				                          */
/*------------------------------------------------------*/
function Canvasinit(){
  
  $("#colorPalet div").click(function(e){
    penColor = colorList[this.id];
  }); 
    
	// canvas要素のノードオブジェクトを取得
	canvas = document.getElementById('myCanvas');
  // 2Dコンテキストを取得          
  context = canvas.getContext('2d');
 
	// iPadかPCか判断 
	var biPad = navigator.userAgent.match(/iPad/i) != null;
	var biPhone = navigator.userAgent.match(/iPhone/i) != null;
	var biPod = navigator.userAgent.match(/iPod/i) != null;
	var bAndroid = navigator.userAgent.match(/Android/i) != null;
	
	if(biPhone || biPad || biPod || bAndroid){
		bpad = true;
		canvas.addEventListener("touchstart", setDrawMode, false);
		canvas.addEventListener("touchmove", drawLine, false);
		canvas.addEventListener("touchend", setDrawMode, false);
	}else{
		bpad = false;
		canvas.addEventListener("mousedown",setDrawMode, false);
	  canvas.addEventListener("mousemove", drawLine, false);
	  canvas.addEventListener("mouseup", setDrawMode, false);
	}

	// 最初のページを読み込む
  pageinit();
	LoadCanvasData(0);
//	AllloadNotes();
}

/*------------------------------------------------------*/
/* 描画モード（描画/非描画） 				                      */
/*------------------------------------------------------*/
function setDrawMode(e) {
  bDrawMode = !bDrawMode;

	if( bDrawMode == true ) {
		// 描画モード
		// スタートポイント指定
		adjustXY(e);
		context.beginPath();		        	 // 線を書くと宣言します。
		context.strokeStyle = penColor;
		context.lineWidth = 5;
		context.moveTo(mouseX, mouseY); // 書き始めの場所を指定します。	
	} else {
		// 非描画モード
		//context.stroke();
		context.closePath();
	}
}

/*------------------------------------------------------*/
/* 描画モード（描画/非描画）                              */
/*------------------------------------------------------*/
function endDrawMode(e) {
  bDrawMode = false;
}

/*------------------------------------------------------*/
/* 描画													                        */
/*------------------------------------------------------*/
function drawLine(e) {

	if( bDrawMode == true ){
		adjustXY(e);
		context.lineTo(mouseX ,mouseY);		// ライン描画
		context.stroke();	
	}

}
/*------------------------------------------------------*/
/* 座標調整処理					                                */
/*------------------------------------------------------*/
function adjustXY(e) {
	var rect = e.target.getBoundingClientRect();
	if (bpad) {
		mouseX = event.touches[0].pageX - rect.left;
		mouseY = event.touches[0].pageY - rect.top;
	} else {
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	}
}
/*------------------------------------------------------*/
/* ページ送り時、データ保存                               */
/*------------------------------------------------------*/
function SaveCanvasData(pageindex){
  //データ確認
  db.transaction(function(tx) {
    tx.executeSql("SELECT COUNT(*) FROM imgData", [], function(result) {
  }, function(tx, error) {
    tx.executeSql("CREATE TABLE imgData (id REAL UNIQUE, canvas TXT)", [], function(result) { 
     });
    });
   });

    //画像イメージをBase64文字列に変換
    Base64Coded = canvas.toDataURL();
 
    //Base64化されたデータをimg要素にセットする
    db.transaction(function(tx) {
        tx.executeSql("SELECT id FROM imgData WHERE id = ?", [pageindex], function(tx, result) {
          var rows_s = result.rows;
          // storageテーブルに格納されている全ての値を列挙
          if (rows_s.length > 0) {
            db.transaction(function (tx)
              {
              tx.executeSql("UPDATE imgData SET id = ?, canvas = ? WHERE id = ?", [pageindex, Base64Coded, pageindex]);
              });
          } else {
            db.transaction(function (tx) 
              {
              tx.executeSql("INSERT INTO imgData (id, canvas) VALUES (?, ?)", [pageindex, Base64Coded]);
              }); 
            }
        });
     });
}

/*------------------------------------------------------*/
/* ページ送り時、データ保存                               */
/*------------------------------------------------------*/
function LoadCanvasData(pageindex){

    // Canvasのクリア
    clearData();
    
    //img要素の生成
    Img = new Image();

    //Base64化されたデータをimg要素にセットする
    db.transaction(function(tx) {
        tx.executeSql("SELECT canvas FROM imgData WHERE id = ?", [pageindex], function(tx, result) {
          var rows_r = result.rows;
          
         if (rows_r.length != 0) {            
            var row_r = rows_r.item(0);
            Img.onload = function() {
              context.drawImage(Img, 0, 0);
              };
            Img.src = row_r.canvas;

          }  
        });
     }, function(error) {
     }, function() {
     });
     
}

/*------------------------------------------------------*/
/* クリア処理											                      */
/*------------------------------------------------------*/
function clearData(){
	context.clearRect(0, 0, 880, 450); 
}

/*------------------------------------------------------*/
/* DBクリア処理                                         */
/*------------------------------------------------------*/
function ALLclearData(bDraw){
  // データ削除
  db.transaction(function(tx) {
    tx.executeSql("DELETE FROM imgData", [], function(result) {
     
     //再表示 
    if (bDraw) selectpage(imageIndex);     
  },function(tx, error) {
     alert('Error');
     });
  });
}

/*------------------------------------------------------*/
/* 全データクリア処理                                    */
/*------------------------------------------------------*/
function AllDeleteData(){
  ALLclearData(false);
  NoteclearData(true);
}
