// 変数定義
var imageIndex;
var oldIndex;

/*------------------------------------------------------*/
/* ページカウントクリア                                   */
/*------------------------------------------------------*/
function pageinit(){
  imageIndex=0;
  oldIndex=0;
}

/*------------------------------------------------------*/
/* 次頁ボタン押下                                        */
/*------------------------------------------------------*/
function nextpage(){
  if (imageIndex != 17) {

    oldIndex = imageIndex;
    SaveCanvasData(oldIndex);
    closeNote(oldIndex);

    imageIndex = ++imageIndex % $("#images>img").size();    

    $("#images>img:eq(" + oldIndex + ")").fadeOut("slow");
    $("#images>img:eq(" + imageIndex + ")").fadeIn("slow");

    LoadCanvasData(imageIndex);
    loadNotes(imageIndex);
  }
}
   
/*------------------------------------------------------*/
/* top頁ボタン押下                                      */
/*------------------------------------------------------*/
function toppage(){

    oldIndex = imageIndex;
    SaveCanvasData(oldIndex);
    closeNote(oldIndex);

    imageIndex = 0;
    imageIndex = imageIndex % $("#images>img").size();    

    $("#images>img:eq(" + oldIndex + ")").fadeOut("slow");
    $("#images>img:eq(" + imageIndex + ")").fadeIn("slow");

    LoadCanvasData(imageIndex);       
    loadNotes(imageIndex);
}

/*------------------------------------------------------*/
/* 前頁ボタン押下                                        */
/*------------------------------------------------------*/
function prevpage(){
  if (imageIndex != 0) {

    oldIndex = imageIndex;
    SaveCanvasData(oldIndex);
    closeNote(oldIndex);

    if (--imageIndex < 0) imageIndex = $("#images>img").size() - 1;

    $("#images>img:eq(" + oldIndex + ")").fadeOut("slow");
    $("#images>img:eq(" + imageIndex + ")").fadeIn("slow");

    LoadCanvasData(imageIndex);
    loadNotes(imageIndex);
  }
}

/*------------------------------------------------------*/
/* 指定ページ表示                                        */
/*------------------------------------------------------*/
function selectpage(pageindex){    
    oldIndex = imageIndex;
    SaveCanvasData(oldIndex);
    closeNote(oldIndex);

    imageIndex = pageindex;
    imageIndex = imageIndex % $("#images>img").size();    

    $("#images>img:eq(" + oldIndex + ")").fadeOut("slow");
    $("#images>img:eq(" + imageIndex + ")").fadeIn("slow");

    LoadCanvasData(imageIndex);       
    loadNotes(imageIndex);
}

